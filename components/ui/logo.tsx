import React from "react"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#3b82f6", stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#60a5fa", stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:"#f59e0b", stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:"#fbbf24", stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#fcd34d", stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:"#10b981", stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#059669", stopOpacity:1}} />
            </linearGradient>
            
            <radialGradient id="glowGradient">
              <stop offset="0%" style={{stopColor:"#3b82f6", stopOpacity:0.3}} />
              <stop offset="100%" style={{stopColor:"#3b82f6", stopOpacity:0}} />
            </radialGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Glow effect behind icon */}
          <circle cx="50" cy="50" r="40" fill="url(#glowGradient)"/>
          
          {/* Main icon */}
          <g transform="translate(50, 50)">
            {/* Outer ring */}
            <circle cx="0" cy="0" r="35" fill="none" stroke="url(#primaryGradient)" strokeWidth="1.5" opacity="0.6"/>
            <circle cx="0" cy="0" r="35" fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.3" strokeDasharray="3,3"/>
            
            {/* Inner hexagon frame */}
            <path d="M 0,-25 L 21.7,-12.5 L 21.7,12.5 L 0,25 L -21.7,12.5 L -21.7,-12.5 Z" 
                  fill="rgba(59, 130, 246, 0.05)" 
                  stroke="#3b82f6" 
                  strokeWidth="0.8" 
                  opacity="0.4"/>
            
            {/* Trading chart background */}
            <rect x="-20" y="-10" width="40" height="20" fill="rgba(15, 23, 42, 0.6)" rx="2"/>
            
            {/* Chart grid */}
            <g opacity="0.2">
              <line x1="-18" y1="-6" x2="18" y2="-6" stroke="#475569" strokeWidth="0.3"/>
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#475569" strokeWidth="0.3"/>
              <line x1="-18" y1="6" x2="18" y2="6" stroke="#475569" strokeWidth="0.3"/>
              <line x1="-10" y1="-8" x2="-10" y2="8" stroke="#475569" strokeWidth="0.3"/>
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#475569" strokeWidth="0.3"/>
              <line x1="10" y1="-8" x2="10" y2="8" stroke="#475569" strokeWidth="0.3"/>
            </g>
            
            {/* Candlestick chart */}
            <g>
              {/* Bearish */}
              <line x1="-15" y1="4" x2="-15" y2="8" stroke="#ef4444" strokeWidth="0.8"/>
              <rect x="-17" y="4" width="4" height="4" fill="#ef4444"/>
              
              {/* Bullish */}
              <line x1="-8" y1="2" x2="-8" y2="7" stroke="url(#greenGradient)" strokeWidth="0.8"/>
              <rect x="-10" y="3" width="4" height="4" fill="url(#greenGradient)"/>
              
              {/* Bullish */}
              <line x1="-2" y1="-1" x2="-2" y2="6" stroke="url(#greenGradient)" strokeWidth="0.8"/>
              <rect x="-4" y="1" width="4" height="5" fill="url(#greenGradient)"/>
              
              {/* Bullish */}
              <line x1="4" y1="-3" x2="4" y2="4" stroke="url(#greenGradient)" strokeWidth="0.8"/>
              <rect x="2" y="0" width="4" height="4" fill="url(#greenGradient)"/>
              
              {/* Bullish */}
              <line x1="10" y1="-5" x2="10" y2="2" stroke="url(#greenGradient)" strokeWidth="0.8"/>
              <rect x="8" y="-2" width="4" height="4" fill="url(#greenGradient)"/>
            </g>
            
            {/* Trend line */}
            <path d="M -17,7 L -8,5 L -2,2 L 4,0 L 10,-2" 
                  stroke="#60a5fa" 
                  strokeWidth="1" 
                  fill="none" 
                  strokeLinecap="round" 
                  filter="url(#softGlow)"/>
            
            {/* Signal indicator */}
            <g transform="translate(10, -2)">
              <circle cx="0" cy="0" r="3" fill="url(#greenGradient)" opacity="0.3"/>
              <circle cx="0" cy="0" r="2" fill="url(#greenGradient)" filter="url(#softGlow)"/>
              <path d="M -1,0.5 L 0,-0.5 L 1,0.5" 
                    stroke="#ffffff" 
                    strokeWidth="1" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"/>
            </g>
            
            {/* Orion constellation stars */}
            <g opacity="0.8">
              <circle cx="-8" cy="-20" r="1" fill="url(#accentGradient)" filter="url(#softGlow)"/>
              <circle cx="0" cy="-22" r="1.2" fill="url(#accentGradient)" filter="url(#softGlow)"/>
              <circle cx="8" cy="-20" r="1" fill="url(#accentGradient)" filter="url(#softGlow)"/>
              <line x1="-8" y1="-20" x2="0" y2="-22" stroke="#f59e0b" strokeWidth="0.3" opacity="0.4"/>
              <line x1="0" y1="-22" x2="8" y2="-20" stroke="#f59e0b" strokeWidth="0.3" opacity="0.4"/>
            </g>
          </g>
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent ${textSizes[size]}`}>
          Orion Assets
        </span>
      )}
    </div>
  )
}
