import { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import worldData from '../data/globe.json'
import { locations } from '../data/locations'
import { latLngToVector3 } from '../utils/coordinates'
import Pin from './Pin'
import { Location } from '../types'

interface GlobeProps {
  onPinHover: (location: Location | null) => void
}

// Minimal typed helpers for GeoJSON
// Ring is an array of [lng, lat]
type Coord = [number, number]
type Ring = Coord[]
type Polygon = Ring[]

function isCoord(a: any): a is Coord {
  return Array.isArray(a) && a.length >= 2 && typeof a[0] === 'number' && typeof a[1] === 'number'
}
function isRing(a: any): a is Ring {
  return Array.isArray(a) && a.length >= 3 && isCoord(a[0])
}
function isPolygon(a: any): a is Polygon {
  return Array.isArray(a) && a.length >= 1 && isRing(a[0])
}

// Normalize a geometry (Polygon or MultiPolygon) to an array of Polygons
function normalizePolygons(geom: any): Polygon[] {
  if (!geom) return []
  if (geom.type === 'Polygon') {
    const poly = geom.coordinates
    if (isPolygon(poly)) return [poly]
    return []
  }
  if (geom.type === 'MultiPolygon') {
    const mpoly = geom.coordinates
    if (Array.isArray(mpoly)) {
      const out: Polygon[] = []
      for (const poly of mpoly) {
        if (isPolygon(poly)) out.push(poly)
      }
      return out
    }
    return []
  }
  return []
}

// Atmosphere rim (subtle)
function Atmosphere() {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(0xffffff) },
    uIntensity: { value: 0.45 },
  }), [])

  const vertex = /* glsl */`
    varying vec3 vNormal;
    void main(){
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `

  const fragment = /* glsl */`
    varying vec3 vNormal;
    uniform vec3 uColor; uniform float uIntensity;
    void main(){
      float fres = pow(1.0 - abs(vNormal.z), 3.0);
      vec3 col = uColor * fres * uIntensity;
      gl_FragColor = vec4(col, fres * 0.18);
    }
  `

  return (
    <mesh>
      <sphereGeometry args={[2.085, 192, 192]} />
      <shaderMaterial args={[{ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }]} />
    </mesh>
  )
}

// 2D helpers in lat/lng space
function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / ((yj - yi) + 1e-12) + xi)
    if (intersect) inside = !inside
  }
  return inside
}
function pointInPolygonWithHoles(lng: number, lat: number, poly: Polygon): boolean {
  if (!poly || poly.length === 0) return false
  const outer = poly[0]
  if (!pointInRing(lng, lat, outer)) return false
  for (let r = 1; r < poly.length; r++) if (pointInRing(lng, lat, poly[r])) return false
  return true
}
function distPointSeg(px:number,py:number, ax:number,ay:number, bx:number,by:number){
  const abx = bx - ax, aby = by - ay, apx = px - ax, apy = py - ay
  const t = Math.max(0, Math.min(1, (apx*abx + apy*aby) / (abx*abx + aby*aby + 1e-12)))
  const cx = ax + abx * t, cy = ay + aby * t
  const dx = px - cx, dy = py - cy
  return Math.hypot(dx,dy)
}
function minDistToRing(lng:number, lat:number, ring: Ring){
  let m = Infinity
  for (let i=0;i<ring.length-1;i++){
    const a = ring[i], b = ring[i+1]
    const d = distPointSeg(lng, lat, a[0], a[1], b[0], b[1])
    if (d < m) m = d
  }
  return m
}

function Globe({ onPinHover }: GlobeProps) {
  const groupRef = useRef<THREE.Group>(null)

  // No automatic rotation; OrbitControls will handle user-driven rotation

  // Build evenly spaced dots using staggered lat/lng grid and classify as coast vs interior
  const { coastPositions, interiorPositions } = useMemo(() => {
    const coast: THREE.Vector3[] = []
    const interior: THREE.Vector3[] = []

    const features = (worldData as any)?.features as any[] | undefined
    if (!features) return { coastPositions: coast, interiorPositions: interior }

    const GRID_STEP = 0.55           // degrees between points (lower => denser)
    const COAST_THRESH = GRID_STEP   // degrees from outer boundary to be considered coast
    const MAX_TOTAL = 30000

    for (const feature of features) {
      const geom = (feature as any)?.geometry
      const polygons = normalizePolygons(geom)
      if (!polygons.length) continue

      for (const polygon of polygons) {
        if (!polygon || polygon.length === 0) continue
        const outer = polygon[0]
        // BBox with padding to avoid edge clipping
        let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90
        for (const p of outer) {
          minLng = Math.min(minLng, p[0]); maxLng = Math.max(maxLng, p[0])
          minLat = Math.min(minLat, p[1]); maxLat = Math.max(maxLat, p[1])
        }
        const PAD = 0.5
        minLng -= PAD; maxLng += PAD; minLat -= PAD; maxLat += PAD

        for (let lat = Math.floor(minLat); lat <= Math.ceil(maxLat); lat += GRID_STEP) {
          const row = Math.round((lat - minLat) / GRID_STEP)
          const lngOffset = (row % 2) ? GRID_STEP * 0.5 : 0
          for (let lng = Math.floor(minLng); lng <= Math.ceil(maxLng); lng += GRID_STEP) {
            const L = lng + lngOffset
            const onEdge = minDistToRing(L, lat, outer) < GRID_STEP * 0.6
            if (!(pointInPolygonWithHoles(L, lat, polygon) || onEdge)) continue

            const d = minDistToRing(L, lat, outer)
            const pos = latLngToVector3(lat, L, 2.01)
            if (d <= COAST_THRESH) {
              coast.push(pos)
            } else {
              interior.push(pos)
            }

            if (coast.length + interior.length >= MAX_TOTAL) break
          }
          if (coast.length + interior.length >= MAX_TOTAL) break
        }
        if (coast.length + interior.length >= MAX_TOTAL) break
      }
      if (coast.length + interior.length >= MAX_TOTAL) break
    }

    return { coastPositions: coast, interiorPositions: interior }
  }, [])

  // Instanced meshes for dots
  const coastRef = useRef<THREE.InstancedMesh>(null)
  const interiorRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const temp = new THREE.Object3D()
    if (interiorRef.current) {
      for (let i = 0; i < interiorPositions.length; i++) {
        temp.position.copy(interiorPositions[i])
        temp.scale.setScalar(0.0048)
        temp.lookAt(0, 0, 0)
        temp.updateMatrix()
        interiorRef.current.setMatrixAt(i, temp.matrix)
      }
      interiorRef.current.instanceMatrix.needsUpdate = true
    }
    if (coastRef.current) {
      for (let i = 0; i < coastPositions.length; i++) {
        temp.position.copy(coastPositions[i])
        temp.scale.setScalar(0.0062)
        temp.lookAt(0, 0, 0)
        temp.updateMatrix()
        coastRef.current.setMatrixAt(i, temp.matrix)
      }
      coastRef.current.instanceMatrix.needsUpdate = true
    }
  }, [coastPositions, interiorPositions])

  return (
    <group ref={groupRef}>
      {/* Smooth black globe base */}
      <mesh>
        <sphereGeometry args={[2, 256, 256]} />
        <meshStandardMaterial color="#0d0d0e" metalness={0.55} roughness={0.24} />
      </mesh>

      {/* Atmospheric rim glow (subtle) */}
      <Atmosphere />

      {/* Interior dots (slightly dimmer and smaller) */}
      {interiorPositions.length > 0 && (
        <instancedMesh ref={interiorRef} args={[undefined as any, undefined as any, interiorPositions.length]}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial color="#eaeaea" emissive="#ffffff" emissiveIntensity={0.55} roughness={0.6} metalness={0.0} />
        </instancedMesh>
      )}

      {/* Coast dots (brighter and slightly larger) */}
      {coastPositions.length > 0 && (
        <instancedMesh ref={coastRef} args={[undefined as any, undefined as any, coastPositions.length]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.95} roughness={0.45} metalness={0.0} />
        </instancedMesh>
      )}

      {/* Pins */}
      {locations.map((location) => (
        <Pin
          key={location.id}
          position={latLngToVector3(location.lat, location.lng, 2.1)}
          location={location}
          onHover={(loc) => onPinHover(loc)}
          onLeave={() => onPinHover(null)}
        />
      ))}
    </group>
  )
}

export default Globe
