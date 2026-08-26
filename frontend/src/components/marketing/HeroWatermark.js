export default function HeroWatermark() {
  const linePoints = [
    [80, 620], [220, 560], [360, 590], [500, 500], [640, 530],
    [780, 440], [920, 470], [1060, 380], [1200, 410], [1360, 320],
  ];
  const bars = [60, 110, 85, 140, 120, 170, 150];
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id="hw-grid" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M72 0H0V72" fill="none" stroke="#1A3059" strokeWidth="1" opacity="0.5" />
        </pattern>
        <linearGradient id="hw-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#hw-grid)" opacity="0.35" />

      <text x="-45" y="845" fontFamily="Cabinet Grotesk, sans-serif" fontWeight="900" fontSize="270" letterSpacing="6" fill="url(#hw-fade)">
        DATA ANALYSIS
      </text>

      <g opacity="0.16">
        <polyline
          points={linePoints.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="#F97316"
          strokeWidth="3"
        />
        {linePoints.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="#F97316" />
        ))}
      </g>
      <g opacity="0.12">
        <polyline
          points="80,700 220,680 360,710 500,650 640,680 780,620 920,650 1060,590 1200,610 1360,560"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeDasharray="8 6"
        />
      </g>

      <g opacity="0.14">
        {bars.map((h, i) => (
          <rect
            key={i}
            x={100 + i * 50}
            y={880 - h}
            width="30"
            height={h}
            rx="4"
            fill={i % 3 === 2 ? "#F97316" : "#1A3059"}
          />
        ))}
      </g>

      <g opacity="0.15" transform="translate(1180,180)">
        <circle r="86" fill="none" stroke="#1A3059" strokeWidth="26" />
        <circle r="86" fill="none" stroke="#F97316" strokeWidth="26" strokeDasharray="175 540" transform="rotate(-90)" />
        <circle r="86" fill="none" stroke="#3B82F6" strokeWidth="26" strokeDasharray="115 540" strokeDashoffset="-185" transform="rotate(-90)" />
      </g>

      <g opacity="0.35">
        <rect x="480" y="110" width="240" height="120" rx="16" fill="none" stroke="#1A3059" strokeWidth="1.5" />
        <rect x="500" y="140" width="90" height="10" rx="5" fill="#1A3059" />
        <rect x="500" y="165" width="150" height="18" rx="6" fill="#F97316" opacity="0.5" />
        <rect x="500" y="195" width="60" height="10" rx="5" fill="#1A3059" />
        <rect x="760" y="90" width="240" height="120" rx="16" fill="none" stroke="#1A3059" strokeWidth="1.5" />
        <rect x="780" y="120" width="70" height="10" rx="5" fill="#1A3059" />
        <rect x="780" y="145" width="120" height="18" rx="6" fill="#3B82F6" opacity="0.45" />
        <rect x="780" y="175" width="90" height="10" rx="5" fill="#1A3059" />
      </g>

      <g fontFamily="Cabinet Grotesk, sans-serif" fontWeight="700" fill="#FFFFFF" opacity="0.06">
        <text x="540" y="330" fontSize="42">+24.8%</text>
        <text x="880" y="300" fontSize="34">₹35.0L</text>
        <text x="180" y="430" fontSize="30">98.4%</text>
        <text x="700" y="770" fontSize="38">1.2M</text>
        <text x="1150" y="560" fontSize="30">-3.1%</text>
        <text x="1050" y="700" fontSize="26">Q3 FY26</text>
      </g>
    </svg>
  );
}
