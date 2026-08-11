// Decorative network/node graphic for auth screens — fixed coordinates (not
// randomized) so server and client render identically and there's no
// hydration mismatch. Nodes cluster along one diagonal band (bottom-left to
// top-right) rather than scattering evenly across the whole canvas, matching
// the reference look of a network flowing in a single direction.
const NODES = [
  { x: 40, y: 560, r: 2 },
  { x: 110, y: 520, r: 3 },
  { x: 90, y: 460, r: 2 },
  { x: 190, y: 480, r: 2.5 },
  { x: 170, y: 410, r: 3 },
  { x: 260, y: 430, r: 2 },
  { x: 250, y: 360, r: 4 },
  { x: 340, y: 380, r: 2 },
  { x: 330, y: 300, r: 2.5 },
  { x: 420, y: 320, r: 3 },
  { x: 410, y: 250, r: 2 },
  { x: 500, y: 260, r: 2.5 },
  { x: 490, y: 190, r: 4 },
  { x: 580, y: 200, r: 2 },
  { x: 570, y: 130, r: 3 },
  { x: 660, y: 140, r: 2.5 },
  { x: 650, y: 70, r: 2 },
  { x: 730, y: 90, r: 3 },
  { x: 720, y: 30, r: 2 },
  { x: 760, y: 160, r: 2 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6], [5, 7],
  [6, 8], [7, 8], [7, 9], [8, 10], [9, 10], [9, 11], [10, 12], [11, 12],
  [11, 13], [12, 14], [13, 14], [13, 15], [14, 16], [15, 16], [15, 17],
  [16, 18], [17, 18], [17, 19],
];

export function NetworkBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="white"
          strokeOpacity={0.16}
          strokeWidth={1}
        />
      ))}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="white" fillOpacity={0.4} />
      ))}
    </svg>
  );
}
