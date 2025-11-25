import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

function AceternityGlobe() {
  const globeRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002
    }
  })

  return (
    <group>
      {/* Main Globe Sphere */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#1a1a2e"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.5}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Inner glow effect */}
      <Sphere args={[2.05, 32, 32]}>
        <MeshTransmissionMaterial
          attach="material"
          thickness={0.1}
          roughness={0.4}
          transmission={0.8}
          ior={1.5}
          chromaticAberration={0.02}
          backside={true}
          color="#4a9eff"
          samples={10}
          resolution={512}
        />
      </Sphere>
    </group>
  )
}

export default AceternityGlobe
