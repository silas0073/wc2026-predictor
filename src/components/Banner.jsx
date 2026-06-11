import React from 'react'

export default function Banner() {
  return (
    <svg width="100%" viewBox="0 0 680 72" role="img" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      <title>World Cup 2026</title>
      <rect width="680" height="72" fill="#0a1628"/>

      <circle cx="340" cy="36" r="28" fill="none" stroke="#1a3a1a" strokeWidth="1.2"/>
      <circle cx="340" cy="36" r="3" fill="#1a3a1a"/>
      <line x1="340" y1="0" x2="340" y2="72" stroke="#1a3a1a" strokeWidth="1.2"/>
      <rect x="-1" y="12" width="54" height="48" fill="none" stroke="#1a3a1a" strokeWidth="1.2"/>
      <rect x="-1" y="22" width="28" height="28" fill="none" stroke="#1a3a1a" strokeWidth="1.2"/>
      <rect x="627" y="12" width="54" height="48" fill="none" stroke="#1a3a1a" strokeWidth="1.2"/>
      <rect x="653" y="22" width="28" height="28" fill="none" stroke="#1a3a1a" strokeWidth="1.2"/>

      <rect x="0" y="0" width="5" height="72" fill="#B22234" opacity="0.7"/>
      <rect x="5" y="0" width="5" height="72" fill="#006847" opacity="0.7"/>
      <rect x="670" y="0" width="5" height="72" fill="#FF0000" opacity="0.55"/>
      <rect x="675" y="0" width="5" height="72" fill="#FF0000" opacity="0.3"/>

      <g transform="translate(52,36)">
        <circle r="14" fill="#f0f0f0"/>
        <polygon points="0,-7.5 7.1,-2.3 4.4,6 -4.4,6 -7.1,-2.3" fill="#1a1a2e"/>
        <polygon points="0,-13.5 5,-10 8,-4 0,-7.5 -8,-4 -5,-10" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="8,-4 13.5,0 12,7 7.1,-2.3" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-8,-4 -13.5,0 -12,7 -7.1,-2.3" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="12,7 7,12 0,14 4.4,6" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-12,7 -7,12 0,14 -4.4,6" fill="none" stroke="#ccc" strokeWidth="0.5"/>
      </g>

      <g transform="translate(628,36)">
        <circle r="14" fill="#f0f0f0"/>
        <polygon points="0,-7.5 7.1,-2.3 4.4,6 -4.4,6 -7.1,-2.3" fill="#1a1a2e"/>
        <polygon points="0,-13.5 5,-10 8,-4 0,-7.5 -8,-4 -5,-10" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="8,-4 13.5,0 12,7 7.1,-2.3" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-8,-4 -13.5,0 -12,7 -7.1,-2.3" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="12,7 7,12 0,14 4.4,6" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="-12,7 -7,12 0,14 -4.4,6" fill="none" stroke="#ccc" strokeWidth="0.5"/>
      </g>

      <g transform="translate(174,36)" fill="none" stroke="#f5c518" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-7,-14 L7,-14 L7,-4 Q7,4 0,8 Q-7,4 -7,-4 Z"/>
        <path d="M-7,-10 Q-15,-10 -15,-4 Q-15,2 -7,2"/>
        <path d="M7,-10 Q15,-10 15,-4 Q15,2 7,2"/>
        <line x1="0" y1="8" x2="0" y2="12"/>
        <line x1="-6" y1="12" x2="6" y2="12"/>
      </g>

      <text x="340" y="27" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="18" fontWeight="700" fill="#f0f4ff" letterSpacing="-0.3">FIFA World Cup 2026&#8482;</text>
      <text x="340" y="44" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="10" fontWeight="500" fill="#8899BB" letterSpacing="1.5">USA &#183; CANADA &#183; MEXICO</text>
      <text x="268" y="45" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#f5c518" opacity="0.7">&#9733;</text>
      <text x="412" y="45" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#f5c518" opacity="0.7">&#9733;</text>

      <rect x="288" y="51" width="104" height="16" rx="8" fill="#1E90FF" opacity="0.18"/>
      <rect x="288" y="51" width="104" height="16" rx="8" fill="none" stroke="#1E90FF" strokeWidth="0.7" opacity="0.5"/>
      <text x="340" y="63" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="9" fontWeight="600" fill="#1E90FF" letterSpacing="0.5">11 JUN &#8211; 19 JUL 2026</text>
    </svg>
  )
}
