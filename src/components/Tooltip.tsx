import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Location } from '../types'

interface TooltipProps {
  location: Location
  position: { x: number; y: number }
}

function Tooltip({ location }: TooltipProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Position tooltip in upper-left area
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: '40px',
    top: '40px',
    pointerEvents: 'none',
    zIndex: 1000,
  }

  return createPortal(
    <div
      style={tooltipStyle}
      className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-2xl overflow-hidden w-[240px]"
    >
      {/* Player Image */}
      {location.image && (
        <div className="w-full h-[180px] bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
          <img
            src={location.image}
            alt={location.playerName || location.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
      
      {/* Player Info */}
      <div className="p-3 bg-[#2a2a2a]">
        <div className="text-white font-semibold text-base mb-0.5 leading-tight">
          {location.playerName || location.name}
        </div>
        {location.team && (
          <div className="text-[#9ca3af] text-xs mb-2 leading-tight">
            {location.team}
          </div>
        )}
        {location.country && (
          <div className="flex items-center gap-1.5 text-[#d1d5db] text-xs">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{location.country}</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Tooltip

