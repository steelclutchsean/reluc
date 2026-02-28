export default function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle with subtle glass effect */}
      <circle cx="100" cy="100" r="96" fill="url(#glassBg)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>

      {/* Tree trunk — elegant tapered form */}
      <path d="M94 155 L96 100 L104 100 L106 155 Z" fill="url(#trunkGrad)" />
      {/* Trunk texture line */}
      <line x1="100" y1="105" x2="100" y2="150" stroke="#5D4125" strokeWidth="0.5" opacity="0.3"/>

      {/* Root flare */}
      <path d="M90 153 Q95 148 96 155 Z" fill="#7A5630" opacity="0.5"/>
      <path d="M110 153 Q105 148 104 155 Z" fill="#7A5630" opacity="0.5"/>

      {/* Ground line */}
      <ellipse cx="100" cy="156" rx="30" ry="3" fill="url(#groundGrad)" opacity="0.15"/>

      {/* ===== MONEY LEAVES — layered canopy ===== */}

      {/* Back layer leaves (darker, smaller) */}
      <g opacity="0.7">
        {/* Far left back */}
        <g transform="translate(58,72) rotate(-15)">
          <rect x="-16" y="-10" width="32" height="20" rx="3" fill="#2D6B35"/>
          <text x="0" y="-1" textAnchor="middle" fill="#A8D5AE" fontSize="6.5" fontWeight="700" fontFamily="system-ui, sans-serif">$</text>
          <rect x="-14" y="-8" width="28" height="16" rx="2" fill="none" stroke="#1F5528" strokeWidth="0.4" opacity="0.5"/>
        </g>
        {/* Far right back */}
        <g transform="translate(142,72) rotate(15)">
          <rect x="-16" y="-10" width="32" height="20" rx="3" fill="#2D6B35"/>
          <text x="0" y="-1" textAnchor="middle" fill="#A8D5AE" fontSize="6.5" fontWeight="700" fontFamily="system-ui, sans-serif">$</text>
          <rect x="-14" y="-8" width="28" height="16" rx="2" fill="none" stroke="#1F5528" strokeWidth="0.4" opacity="0.5"/>
        </g>
        {/* Top back */}
        <g transform="translate(100,38) rotate(0)">
          <rect x="-16" y="-10" width="32" height="20" rx="3" fill="#2D6B35"/>
          <text x="0" y="-1" textAnchor="middle" fill="#A8D5AE" fontSize="6.5" fontWeight="700" fontFamily="system-ui, sans-serif">$</text>
          <rect x="-14" y="-8" width="28" height="16" rx="2" fill="none" stroke="#1F5528" strokeWidth="0.4" opacity="0.5"/>
        </g>
      </g>

      {/* Mid layer leaves */}
      <g opacity="0.85">
        {/* Upper left */}
        <g transform="translate(70,52) rotate(-25)">
          <rect x="-18" y="-11" width="36" height="22" rx="3.5" fill="url(#leafGrad1)"/>
          <text x="0" y="-1" textAnchor="middle" fill="#D4EDD8" fontSize="7.5" fontWeight="700" fontFamily="system-ui, sans-serif">$</text>
          <rect x="-16" y="-9" width="32" height="18" rx="2.5" fill="none" stroke="#2D6B35" strokeWidth="0.5" opacity="0.4"/>
        </g>
        {/* Upper right */}
        <g transform="translate(130,52) rotate(25)">
          <rect x="-18" y="-11" width="36" height="22" rx="3.5" fill="url(#leafGrad1)"/>
          <text x="0" y="-1" textAnchor="middle" fill="#D4EDD8" fontSize="7.5" fontWeight="700" fontFamily="system-ui, sans-serif">$</text>
          <rect x="-16" y="-9" width="32" height="18" rx="2.5" fill="none" stroke="#2D6B35" strokeWidth="0.5" opacity="0.4"/>
        </g>
        {/* Mid left */}
        <g transform="translate(64,82) rotate(-10)">
          <rect x="-18" y="-11" width="36" height="22" rx="3.5" fill="url(#leafGrad2)"/>
          <text x="0" y="-1" textAnchor="middle" fill="#D4EDD8" fontSize="7.5" fontWeight="700" fontFamily="system-ui, sans-serif">$</text>
          <rect x="-16" y="-9" width="32" height="18" rx="2.5" fill="none" stroke="#2D6B35" strokeWidth="0.5" opacity="0.4"/>
        </g>
        {/* Mid right */}
        <g transform="translate(136,82) rotate(10)">
          <rect x="-18" y="-11" width="36" height="22" rx="3.5" fill="url(#leafGrad2)"/>
          <text x="0" y="-1" textAnchor="middle" fill="#D4EDD8" fontSize="7.5" fontWeight="700" fontFamily="system-ui, sans-serif">$</text>
          <rect x="-16" y="-9" width="32" height="18" rx="2.5" fill="none" stroke="#2D6B35" strokeWidth="0.5" opacity="0.4"/>
        </g>
      </g>

      {/* Front layer — hero leaves (brightest, largest) */}
      <g>
        {/* Top center hero leaf */}
        <g transform="translate(100,48) rotate(0)">
          <rect x="-20" y="-13" width="40" height="26" rx="4" fill="url(#leafGradHero)"/>
          <rect x="-20" y="-13" width="40" height="26" rx="4" fill="url(#leafShine)" opacity="0.5"/>
          <text x="0" y="1" textAnchor="middle" fill="#E8F5EA" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">$100</text>
          <rect x="-18" y="-11" width="36" height="22" rx="3" fill="none" stroke="#3A7D44" strokeWidth="0.5" opacity="0.5"/>
        </g>
        {/* Left hero leaf */}
        <g transform="translate(74,68) rotate(-20)">
          <rect x="-20" y="-13" width="40" height="26" rx="4" fill="url(#leafGradHero)"/>
          <rect x="-20" y="-13" width="40" height="26" rx="4" fill="url(#leafShine)" opacity="0.4"/>
          <text x="0" y="1" textAnchor="middle" fill="#E8F5EA" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">$100</text>
          <rect x="-18" y="-11" width="36" height="22" rx="3" fill="none" stroke="#3A7D44" strokeWidth="0.5" opacity="0.5"/>
        </g>
        {/* Right hero leaf */}
        <g transform="translate(126,68) rotate(20)">
          <rect x="-20" y="-13" width="40" height="26" rx="4" fill="url(#leafGradHero)"/>
          <rect x="-20" y="-13" width="40" height="26" rx="4" fill="url(#leafShine)" opacity="0.4"/>
          <text x="0" y="1" textAnchor="middle" fill="#E8F5EA" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">$100</text>
          <rect x="-18" y="-11" width="36" height="22" rx="3" fill="none" stroke="#3A7D44" strokeWidth="0.5" opacity="0.5"/>
        </g>
        {/* Lower left leaf */}
        <g transform="translate(78,90) rotate(-5)">
          <rect x="-19" y="-12" width="38" height="24" rx="4" fill="url(#leafGrad3)"/>
          <rect x="-19" y="-12" width="38" height="24" rx="4" fill="url(#leafShine)" opacity="0.3"/>
          <text x="0" y="0" textAnchor="middle" fill="#D4EDD8" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">$100</text>
          <rect x="-17" y="-10" width="34" height="20" rx="3" fill="none" stroke="#3A7D44" strokeWidth="0.4" opacity="0.4"/>
        </g>
        {/* Lower right leaf */}
        <g transform="translate(122,90) rotate(5)">
          <rect x="-19" y="-12" width="38" height="24" rx="4" fill="url(#leafGrad3)"/>
          <rect x="-19" y="-12" width="38" height="24" rx="4" fill="url(#leafShine)" opacity="0.3"/>
          <text x="0" y="0" textAnchor="middle" fill="#D4EDD8" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">$100</text>
          <rect x="-17" y="-10" width="34" height="20" rx="3" fill="none" stroke="#3A7D44" strokeWidth="0.4" opacity="0.4"/>
        </g>
      </g>

      {/* Subtle floating dollar particles */}
      <text x="50" y="48" fill="#4A8F54" fontSize="6" fontWeight="600" opacity="0.25" fontFamily="system-ui">$</text>
      <text x="148" y="44" fill="#4A8F54" fontSize="5" fontWeight="600" opacity="0.2" fontFamily="system-ui">$</text>
      <text x="44" y="95" fill="#4A8F54" fontSize="5" fontWeight="600" opacity="0.15" fontFamily="system-ui">$</text>
      <text x="155" y="90" fill="#4A8F54" fontSize="6" fontWeight="600" opacity="0.2" fontFamily="system-ui">$</text>

      {/* Gradient definitions */}
      <defs>
        <radialGradient id="glassBg" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.15)"/>
        </radialGradient>

        {/* Trunk gradient */}
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B6A42"/>
          <stop offset="50%" stopColor="#6B4F30"/>
          <stop offset="100%" stopColor="#5D4125"/>
        </linearGradient>

        {/* Ground shadow */}
        <radialGradient id="groundGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#5D4125" stopOpacity="1"/>
          <stop offset="100%" stopColor="#5D4125" stopOpacity="0"/>
        </radialGradient>

        {/* Leaf gradients — varying greens for depth */}
        <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3A7D44"/>
          <stop offset="100%" stopColor="#2D6B35"/>
        </linearGradient>
        <linearGradient id="leafGrad2" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#4A8F54"/>
          <stop offset="100%" stopColor="#3A7D44"/>
        </linearGradient>
        <linearGradient id="leafGrad3" x1="0.2" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4A8F54"/>
          <stop offset="100%" stopColor="#357A3E"/>
        </linearGradient>
        <linearGradient id="leafGradHero" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5AAF64"/>
          <stop offset="40%" stopColor="#4A9F54"/>
          <stop offset="100%" stopColor="#3A8F44"/>
        </linearGradient>

        {/* Leaf shine overlay */}
        <linearGradient id="leafShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
          <stop offset="60%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
