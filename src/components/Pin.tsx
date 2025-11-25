import { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { Location } from '../types'

interface PinProps {
  position: THREE.Vector3
  location: Location
  onHover: (location: Location) => void
  onLeave: () => void
}

function Pin({ position, location, onHover, onLeave }: PinProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulsing animation
      const scale = hovered ? 1.3 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    onHover(location)
  }

  const handlePointerLeave = () => {
    setHovered(false)
    onLeave()
  }

  // Create teardrop shape (pointing down) - more accurate
  const teardropShape = new THREE.Shape()
  const radius = 0.04
  const height = 0.1
  // Top curve
  teardropShape.moveTo(0, radius)
  teardropShape.quadraticCurveTo(radius, radius, radius, 0)
  // Right side to point
  teardropShape.quadraticCurveTo(radius, -height * 0.3, 0, -height)
  // Left side back up
  teardropShape.quadraticCurveTo(-radius, -height * 0.3, -radius, 0)
  // Top curve back
  teardropShape.quadraticCurveTo(-radius, radius, 0, radius)

  return (
    <group position={position}>
      {/* Pin line connecting to globe */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.3, 8]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Orange teardrop pin */}
      <mesh
        ref={meshRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        rotation={[Math.PI, 0, 0]}
      >
        <extrudeGeometry
          args={[
            teardropShape,
            {
              depth: 0.02,
              bevelEnabled: true,
              bevelThickness: 0.005,
              bevelSize: 0.005,
              bevelSegments: 8
            }
          ]}
        />
        <meshStandardMaterial
          color={hovered ? '#ff8c5a' : '#ff6b35'}
          emissive={hovered ? '#ff8c5a' : '#ff6b35'}
          emissiveIntensity={hovered ? 0.5 : 0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Number badge if count > 1 */}
      {location.count && location.count > 1 && (
        <group position={[0.035, 0.035, 0.02]}>
          <mesh>
            <circleGeometry args={[0.015, 16]} />
            <meshStandardMaterial color="#ff6b35" />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={0.018}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {location.count}
          </Text>
        </group>
      )}
    </group>
  )
}

export default Pin

