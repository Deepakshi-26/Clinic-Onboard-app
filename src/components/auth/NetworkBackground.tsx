// Decorative network/node graphic for auth screens — fixed coordinates (not
// randomized) so server and client render identically and there's no
// hydration mismatch.
const NODES = [
  { x: 80, y: 90, r: 3 },
  { x: 200, y: 60, r: 2 },
  { x: 150, y: 200, r: 4 },
  { x: 320, y: 130, r: 2.5 },
  { x: 60, y: 320, r: 2 },
  { x: 260, y: 300, r: 3 },
  { x: 420, y: 250, r: 2 },
  { x: 380, y: 60, r: 3 },
  { x: 520, y: 160, r: 4 },
  { x: 600, y: 90, r: 2 },
  { x: 660, y: 220, r: 3 },
  { x: 540, y: 320, r: 2.5 },
  { x: 720, y: 340, r: 2 },
  { x: 760, y: 130, r: 3 },
  { x: 200, y: 420, r: 2 },
  { x: 340, y: 470, r: 3 },
  { x: 480, y: 440, r: 2 },
  { x: 620, y: 460, r: 2.5 },
  { x: 100, y: 500, r: 2 },
  { x: 700, y: 500, r: 3 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 3], [3, 7], [1, 2], [2, 5], [3, 6], [6, 8], [7, 9], [8, 9],
  [8, 10], [9, 13], [10, 13], [10, 11], [11, 12], [4, 5], [2, 14], [5, 15],
  [14, 15], [15, 16], [16, 17], [11, 17], [14, 18], [17, 19], [12, 19],
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
          strokeOpacity={0.14}
          strokeWidth={1}
        />
      ))}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="white" fillOpacity={0.35} />
      ))}
    </svg>
  );
}
