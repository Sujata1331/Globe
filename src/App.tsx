import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Globe from './components/Globe'
import Tooltip from './components/Tooltip'
import { Location } from './types'
import './App.css'

function App() {
  const [hoveredPin, setHoveredPin] = useState<Location | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Handle mouse move for tooltip positioning
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0b0b0b] to-[#111111]">
      {/* Subtle vignette overlay for premium look */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(1200px 600px at 70% 20%, rgba(255,255,255,0.05), rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.5) 100%)'
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI - Math.PI / 3}
            autoRotate={false}
            rotateSpeed={0.45}
          />

          {/* Premium monochrome lighting */}
          <ambientLight intensity={0.22} />
          <directionalLight position={[4, 6, 5]} intensity={0.9} />
          <hemisphereLight args={[0xffffff, 0x000000, 0.12]} />

          <Globe onPinHover={setHoveredPin} />
        </Suspense>
      </Canvas>

      {/* Tooltip rendered outside Canvas */}
      {hoveredPin && (
        <Tooltip
          location={hoveredPin}
          position={mousePosition}
        />
      )}
    </div>
  )
}

export default App
