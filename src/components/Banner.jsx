import React from 'react'

export default function Banner() {
  return (
    <svg width="100%" viewBox="0 0 680 120" role="img" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      <title>World Cup 2026</title>
      <desc>Soccer-themed banner for the World Cup 2026 predictor</desc>

      <rect width="680" height="120" fill="#0a1628"/>

      {/* Pitch markings */}
      <circle cx="340" cy="60" r="44" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <circle cx="340" cy="60" r="4" fill="#1a3a1a"/>
      <line x1="340" y1="0" x2="340" y2="120" stroke="#1a3a1a" strokeWidth="1.5"/>
      <rect x="-2" y="22" width="90" height="76" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <rect x="-2" y="38" width="44" height="44" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <rect x="592" y="22" width="90" height="76" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <rect x="638" y="38" width="44" height="44" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <path d="M0,108 A12,12 0 0,0 12,120" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <path d="M668,120 A12,12 0 0,0 680,108" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <path d="M0,12 A12,12 0 0,1 12,0" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>
      <path d="M668,0 A12,12 0 0,1 680,12" fill="none" stroke="#1a3a1a" strokeWidth="1.5"/>

      {/* Side accents */}
      <rect x="0" y="0" width="6" height="120" fill="#B22234" opacity="0.7"/>
      <rect x="6" y="0" width="6" height="120" fill="#006847" opacity="0.7"/>
      <rect x="668" y="0" width="6" height="120" fill="#FF0000" opacity="0.55"/>
      <rect x="674" y="0" width="6" height="120" fill="#FF0000" opacity="0.3"/>

      {/* Left ball */}
      <g transform="translate(68,60)">
        <circle r="22" fill="#f0f0f0"/>
        <polygon points="0,-12 11.4,-3.7 7.1,9.7 -7.1,9.7 -11.4,-3.7" fill="#1a1a2e"/>
        <polygon points="0,-22 8,-16 13,-6 0,-12 -13,-6 -8,-16" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="13,-6 22,0 19,11 11.4,-3.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-13,-6 -22,0 -19,11 -11.4,-3.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="19,11 11,20 0,22 7.1,9.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-19,11 -11,20 0,22 -7.1,9.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
      </g>

      {/* Right ball */}
      <g transform="translate(612,60)">
        <circle r="22" fill="#f0f0f0"/>
        <polygon points="0,-12 11.4,-3.7 7.1,9.7 -7.1,9.7 -11.4,-3.7" fill="#1a1a2e"/>
        <polygon points="0,-22 8,-16 13,-6 0,-12 -13,-6 -8,-16" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="13,-6 22,0 19,11 11.4,-3.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-13,-6 -22,0 -19,11 -11.4,-3.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="19,11 11,20 0,22 7.1,9.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-19,11 -11,20 0,22 -7.1,9.7" fill="none" stroke="#ccc" strokeWidth="0.5"/>
      </g>

      {/* Trophy */}
      <g transform="translate(192,60)" fill="none" stroke="#f5c518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-10,-20 L10,-20 L10,-6 Q10,6 0,12 Q-10,6 -10,-6 Z"/>
        <path d="M-10,-14 Q-22,-14 -22,-6 Q-22,2 -10,2"/>
        <path d="M10,-14 Q22,-14 22,-6 Q22,2 10,2"/>
        <line x1="0" y1="12" x2="0" y2="18"/>
        <line x1="-10" y1="18" x2="10" y2="18"/>
      </g>

      {/* Text */}
      <text x="340" y="44" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="28" fontWeight="700" fill="#f0f4ff" letterSpacing="-0.5">FIFA World Cup 2026™</text>
      <text x="340" y="70" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="13" fontWeight="500" fill="#8899BB" letterSpacing="1.5">USA · CANADA · MEXICO</text>
      <text x="232" y="71" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#f5c518" opacity="0.7">★</text>
      <text x="448" y="71" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#f5c518" opacity="0.7">★</text>

      {/* Date pill */}
      <rect x="278" y="82" width="124" height="22" rx="11" fill="#1E90FF" opacity="0.18"/>
      <rect x="278" y="82" width="124" height="22" rx="11" fill="none" stroke="#1E90FF" strokeWidth="0.8" opacity="0.5"/>
      <text x="340" y="97" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" fontWeight="600" fill="#1E90FF" letterSpacing="0.5">11 JUN – 19 JUL 2026</text>
    </svg>
  )
}
