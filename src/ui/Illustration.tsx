// Original, code-native household sketches; decorative because the adjacent copy describes the scene.
export function Illustration({ scene = 0 }: { scene?: number }) {
  const colors = ["#e1e6d7", "#f2ddc8", "#dbe6e3", "#eadfcf"];
  return (
    <svg
      viewBox="0 0 480 280"
      aria-hidden="true"
      focusable="false"
      className="illustration"
    >
      <rect width="480" height="280" rx="18" fill={colors[scene % 4]} />
      <path d="M0 242 Q140 224 260 242 T480 236 V280 H0Z" fill="#c5bba8" />
      <g
        stroke="#657160"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M330 45h104v130H330z" fill="#faf4df" />
        <path d="M382 45v130M330 105h104" fill="none" />
        <path
          d="M346 92q12-30 24 0m25 48q10-25 22 0"
          fill="#bbc8a4"
          stroke="none"
        />
        {scene === 0 && (
          <g>
            <path d="M38 59h96v182H38z" fill="#c78a6d" />
            <path d="M50 78h72v80H50z" fill="#e9dfc7" />
            <path d="M119 182h1" />
            <path d="M261 155v74h-39v-74" fill="#bd885f" />
            <path d="M216 164q-36-19-52-5" fill="none" />
          </g>
        )}
        {scene === 1 && (
          <g>
            <path d="M24 166h120v72H24z" fill="#f9f1df" />
            <path d="M24 183h120m-58 0v55" fill="none" />
            <path d="M39 161h36v-19H39z" fill="#c78a6d" />
            <path d="M54 136q-10-10 0-20" fill="none" />
          </g>
        )}
        {scene === 2 && (
          <g>
            <path d="M30 72h98v158H30z" fill="#f9f1df" />
            <path d="M40 84h78v133H40zM77 84v133" fill="none" />
            <path d="M250 162q53-45 89 17l-12 46h-64z" fill="#c78a6d" />
            <path d="M245 158l-22-23" fill="none" />
            <circle cx="267" cy="239" r="10" fill="#657160" />
            <circle cx="321" cy="239" r="10" fill="#657160" />
          </g>
        )}
        {scene === 3 && (
          <g>
            <path d="M27 186q0-24 24-24h96q24 0 24 24v52H27z" fill="#b9c6a7" />
            <path d="M42 205h111M36 239v10m125-10v10" fill="none" />
            <path d="M69 188l45 25 36-4" fill="none" />
          </g>
        )}
        <path
          d="M174 139q16-13 37 0l16 61h-65z"
          fill={scene === 3 ? "#bd885f" : "#71896b"}
        />
        <path
          d="M174 201l-4 39m39-39 7 39M174 151l-24 36m60-34 25 25"
          fill="none"
        />
        <circle cx="193" cy="115" r="23" fill="#e7b999" />
        <path
          d="M170 111q0-37 32-23 14 4 13 24l-13-11-32 10"
          fill="#4c5347"
          stroke="none"
        />
        <path
          d="M185 117h1m14 0h1m-14 11q6 4 11-1"
          fill="none"
          strokeWidth="2"
        />
        {scene !== 2 && (
          <g>
            <path d="M272 185q12-12 28 0l7 37h-42z" fill="#c78a6d" />
            <circle cx="285" cy="164" r="17" fill="#e7b999" />
            <path d="M269 159q2-25 25-13l7 14" fill="#4c5347" stroke="none" />
            <path d="M272 222v20m25-20 5 20m-30-50-29-15" fill="none" />
          </g>
        )}
        <path d="M380 229h40l-6 26h-28z" fill="#c78a6d" />
        <path
          d="M400 229v-46m0 25q-28-24-26-6 2 12 26 16m0-23q27-25 27-8-1 13-27 17"
          fill="#71896b"
        />
      </g>
    </svg>
  );
}
