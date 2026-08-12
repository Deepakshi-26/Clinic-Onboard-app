// Decorative network/node graphic for auth screens. Coordinates are fixed
// (generated once from a seeded PRNG, not computed at runtime) so server
// and client render identically with no hydration mismatch. Layout is a
// jittered grid across the full canvas — organic node placement with even
// coverage — connected to each node's nearest 2-3 neighbors, which reads as
// an actual mesh rather than a single wandering chain. A small subset of
// "accent" nodes render teal and pulse slowly for a subtle sense of signal
// moving through the network.
const NODES: { x: number; y: number; r: number; o: number; accent?: boolean }[] = [
  { x: 160, y: 27, r: 2.2, o: 0.4 },
  { x: 217, y: 32, r: 2.9, o: 0.28 },
  { x: 272, y: 18, r: 3.2, o: 0.41 },
  { x: 344, y: 13, r: 1.8, o: 0.29 },
  { x: 391, y: 26, r: 3, o: 0.47 },
  { x: 571, y: 40, r: 1.8, o: 0.49 },
  { x: 705, y: 25, r: 2, o: 0.22 },
  { x: 95, y: 81, r: 2.7, o: 0.37 },
  { x: 169, y: 109, r: 2.9, o: 0.23 },
  { x: 511, y: 76, r: 1.7, o: 0.47 },
  { x: 586, y: 94, r: 2.7, o: 0.24 },
  { x: 757, y: 81, r: 2.6, o: 0.43 },
  { x: 41, y: 165, r: 1.7, o: 0.52, accent: true },
  { x: 84, y: 146, r: 3.1, o: 0.5 },
  { x: 160, y: 153, r: 2.5, o: 0.34 },
  { x: 283, y: 167, r: 2.1, o: 0.43, accent: true },
  { x: 475, y: 168, r: 1.5, o: 0.23 },
  { x: 530, y: 152, r: 2.9, o: 0.35 },
  { x: 583, y: 146, r: 2.9, o: 0.26 },
  { x: 627, y: 134, r: 2.3, o: 0.45 },
  { x: 711, y: 136, r: 2.9, o: 0.38 },
  { x: 759, y: 146, r: 2.3, o: 0.52 },
  { x: 162, y: 227, r: 2.3, o: 0.51 },
  { x: 210, y: 227, r: 3.2, o: 0.35 },
  { x: 322, y: 201, r: 2.9, o: 0.44 },
  { x: 382, y: 214, r: 2.1, o: 0.23, accent: true },
  { x: 443, y: 221, r: 2, o: 0.51 },
  { x: 701, y: 224, r: 2, o: 0.5 },
  { x: 758, y: 194, r: 3.1, o: 0.49 },
  { x: 36, y: 270, r: 2.9, o: 0.24 },
  { x: 110, y: 256, r: 2.1, o: 0.23 },
  { x: 135, y: 276, r: 2.4, o: 0.56 },
  { x: 218, y: 250, r: 3.3, o: 0.29 },
  { x: 271, y: 277, r: 1.5, o: 0.31 },
  { x: 407, y: 289, r: 2.4, o: 0.3, accent: true },
  { x: 476, y: 269, r: 3.3, o: 0.3 },
  { x: 532, y: 261, r: 2.6, o: 0.4, accent: true },
  { x: 579, y: 264, r: 3.1, o: 0.55 },
  { x: 657, y: 284, r: 1.9, o: 0.33 },
  { x: 707, y: 264, r: 3.5, o: 0.43 },
  { x: 750, y: 274, r: 2.8, o: 0.52 },
  { x: 25, y: 349, r: 1.9, o: 0.47 },
  { x: 88, y: 330, r: 3.2, o: 0.24, accent: true },
  { x: 237, y: 334, r: 3.4, o: 0.36 },
  { x: 262, y: 323, r: 1.6, o: 0.38 },
  { x: 335, y: 350, r: 2.3, o: 0.49, accent: true },
  { x: 390, y: 324, r: 1.6, o: 0.26 },
  { x: 528, y: 327, r: 2, o: 0.32, accent: true },
  { x: 631, y: 343, r: 2.8, o: 0.39 },
  { x: 774, y: 347, r: 2.1, o: 0.56 },
  { x: 30, y: 375, r: 2.5, o: 0.51 },
  { x: 81, y: 394, r: 2.5, o: 0.5 },
  { x: 209, y: 376, r: 2.6, o: 0.49 },
  { x: 348, y: 374, r: 2.8, o: 0.49 },
  { x: 384, y: 371, r: 2.4, o: 0.3 },
  { x: 442, y: 387, r: 1.5, o: 0.37, accent: true },
  { x: 517, y: 405, r: 3.4, o: 0.48 },
  { x: 584, y: 385, r: 2.6, o: 0.28, accent: true },
  { x: 704, y: 386, r: 3.2, o: 0.32 },
  { x: 748, y: 382, r: 1.4, o: 0.36 },
  { x: 26, y: 434, r: 3.5, o: 0.47 },
  { x: 89, y: 440, r: 3.5, o: 0.44 },
  { x: 351, y: 453, r: 1.9, o: 0.47 },
  { x: 398, y: 449, r: 2.2, o: 0.28 },
  { x: 477, y: 435, r: 2.2, o: 0.42 },
  { x: 566, y: 439, r: 3.5, o: 0.54 },
  { x: 643, y: 449, r: 1.9, o: 0.28 },
  { x: 700, y: 458, r: 1.9, o: 0.42 },
  { x: 774, y: 448, r: 3.3, o: 0.22 },
  { x: 38, y: 493, r: 3.4, o: 0.54 },
  { x: 75, y: 513, r: 2.1, o: 0.43 },
  { x: 160, y: 525, r: 2.1, o: 0.33 },
  { x: 195, y: 518, r: 3.3, o: 0.51, accent: true },
  { x: 358, y: 492, r: 2.7, o: 0.35, accent: true },
  { x: 413, y: 502, r: 2, o: 0.48 },
  { x: 458, y: 529, r: 2.8, o: 0.54 },
  { x: 588, y: 490, r: 2.4, o: 0.55, accent: true },
  { x: 664, y: 524, r: 3, o: 0.26, accent: true },
  { x: 714, y: 495, r: 1.8, o: 0.46 },
  { x: 149, y: 557, r: 3.2, o: 0.23 },
  { x: 321, y: 573, r: 1.8, o: 0.29 },
  { x: 405, y: 555, r: 3.3, o: 0.24 },
  { x: 457, y: 566, r: 3.5, o: 0.53 },
  { x: 516, y: 589, r: 3.4, o: 0.28 },
  { x: 569, y: 590, r: 2.4, o: 0.38 },
  { x: 703, y: 551, r: 1.5, o: 0.41 },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 8], [1, 2], [1, 8], [2, 3], [0, 2], [3, 4], [2, 4], [5, 10], [5, 9],
  [6, 11], [6, 20], [7, 13], [7, 8], [8, 14], [9, 10], [9, 17], [10, 18], [11, 21],
  [11, 20], [12, 13], [7, 12], [12, 29], [14, 22], [13, 14], [15, 24], [15, 23],
  [16, 17], [16, 26], [9, 16], [17, 18], [18, 19], [10, 19], [20, 21], [20, 28],
  [21, 28], [22, 23], [22, 31], [23, 32], [24, 25], [24, 33], [25, 26], [26, 35],
  [27, 39], [27, 28], [29, 30], [29, 42], [29, 41], [30, 31], [22, 30], [32, 33],
  [33, 44], [34, 46], [34, 35], [35, 36], [36, 37], [36, 47], [37, 38], [38, 39],
  [38, 48], [39, 40], [27, 40], [41, 50], [41, 42], [42, 51], [43, 44], [43, 52],
  [45, 53], [45, 54], [46, 54], [35, 47], [47, 56], [48, 57], [49, 59], [40, 49],
  [49, 58], [50, 51], [51, 61], [44, 52], [53, 54], [55, 64], [54, 55], [56, 64],
  [56, 65], [57, 65], [56, 57], [58, 59], [58, 67], [59, 68], [50, 60], [60, 69],
  [60, 61], [62, 73], [62, 63], [63, 74], [63, 73], [65, 76], [66, 67], [66, 76],
  [67, 78], [67, 68], [69, 70], [61, 69], [61, 70], [71, 79], [71, 72], [72, 79],
  [73, 74], [74, 75], [74, 81], [75, 82], [75, 81], [76, 77], [77, 85], [77, 78],
  [78, 85], [80, 81], [73, 80], [74, 80], [81, 82], [83, 84], [82, 83], [76, 84],
  [82, 84],
];

const ACCENT_INDICES = NODES.reduce<number[]>((acc, n, i) => {
  if (n.accent) acc.push(i);
  return acc;
}, []);

// A handful of well-spaced edges get rendered as right-angle "circuit
// trace" elbows instead of straight lines, and another handful get an
// animated dot travelling along them — the two cues (PCB-style routing +
// moving signal) are what reads as "tech" rather than generic decoration.
const TRACE_EDGES: [number, number][] = [
  [2, 4], [74, 80], [82, 84], [6, 20], [12, 29], [9, 16], [44, 52], [61, 70],
];
const PULSE_EDGES: [number, number][] = [
  [15, 23], [24, 33], [76, 77], [37, 38], [49, 58], [35, 47], [41, 42], [72, 79],
];

function elbowPath(a: { x: number; y: number }, b: { x: number; y: number }, i: number) {
  // Alternate which axis bends first so traces don't all read the same way.
  return i % 2 === 0 ? `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}` : `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
}

const GRID_SIZE = 42;

export function NetworkBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="tech-grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <path
            d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
            fill="none"
            stroke="white"
            strokeOpacity={0.05}
            strokeWidth={1}
          />
        </pattern>
        <radialGradient id="tech-vignette" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity={0.05} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes network-pulse {
          0%, 100% { opacity: var(--base-o); r: var(--base-r); }
          50% { opacity: calc(var(--base-o) + 0.35); r: calc(var(--base-r) + 1); }
        }
        @keyframes network-ping {
          0% { r: 3; stroke-opacity: 0.5; }
          100% { r: 13; stroke-opacity: 0; }
        }
        .network-accent {
          animation: network-pulse 4s ease-in-out infinite;
        }
        .network-ping {
          animation: network-ping 3s ease-out infinite;
        }
        .network-trace {
          stroke-dasharray: 4 3;
        }
      `}</style>

      <rect width="800" height="600" fill="url(#tech-grid)" />
      <rect width="800" height="600" fill="url(#tech-vignette)" />

      {/* corner HUD brackets */}
      {[
        { x: 20, y: 20, dx: 1, dy: 1 },
        { x: 780, y: 20, dx: -1, dy: 1 },
        { x: 20, y: 580, dx: 1, dy: -1 },
        { x: 780, y: 580, dx: -1, dy: -1 },
      ].map((c, i) => (
        <path
          key={i}
          d={`M${c.x},${c.y + 22 * c.dy} L${c.x},${c.y} L${c.x + 22 * c.dx},${c.y}`}
          fill="none"
          stroke="#5eead4"
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
      ))}

      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="white"
          strokeOpacity={0.12}
          strokeWidth={1}
        />
      ))}

      {TRACE_EDGES.map(([a, b], i) => (
        <path
          key={i}
          className="network-trace"
          d={elbowPath(NODES[a], NODES[b], i)}
          fill="none"
          stroke="#5eead4"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
      ))}

      {PULSE_EDGES.map(([a, b], i) => {
        const pathId = `pulse-path-${i}`;
        const d = `M${NODES[a].x},${NODES[a].y} L${NODES[b].x},${NODES[b].y}`;
        return (
          <g key={i}>
            <path id={pathId} d={d} fill="none" stroke="none" />
            <circle r={2} fill="#5eead4">
              <animateMotion
                dur={`${3.5 + (i % 3)}s`}
                repeatCount="indefinite"
                begin={`${i * 0.7}s`}
                path={d}
              />
            </circle>
          </g>
        );
      })}

      {NODES.map((n, i) =>
        n.accent ? null : (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="white" fillOpacity={n.o} />
        )
      )}

      {ACCENT_INDICES.map((i) => {
        const n = NODES[i];
        return (
          <g key={i}>
            {i % 3 === 0 && (
              <circle
                className="network-ping"
                cx={n.x}
                cy={n.y}
                r={3}
                fill="none"
                stroke="#5eead4"
                strokeWidth={1}
                style={{ animationDelay: `${(i % 7) * 0.5}s` }}
              />
            )}
            <circle
              className="network-accent"
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="#5eead4"
              fillOpacity={n.o}
              style={
                {
                  "--base-o": n.o,
                  "--base-r": n.r,
                  animationDelay: `${(i % 7) * 0.6}s`,
                } as React.CSSProperties
              }
            />
          </g>
        );
      })}
    </svg>
  );
}
