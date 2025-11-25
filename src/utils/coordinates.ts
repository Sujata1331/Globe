import * as THREE from 'three'

/**
 * Convert latitude and longitude to 3D coordinates on a sphere
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param radius Radius of the sphere
 * @returns THREE.Vector3 position
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

