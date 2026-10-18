import Link from "next/link"
import type { Museum } from "@/lib/mock-data"

// An isometric miniature of the museum cluster, two rows of buildings either side of the Mall.
// Stand-in for the React Three Fiber scene: same idea (hover lifts a museum, click enters it),
// drawn as plain SVG so the home page needs no 3D library yet.
// ponytail: fixed slots for the first six museums; the R3F scene will lay out every museum from data.

const SLOTS = [
  { x: 0.4, y: 0.3, w: 2.4, d: 1.5, h: 1.25 },
  { x: 3.3, y: 0.3, w: 1.9, d: 1.5, h: 0.95 },
  { x: 5.7, y: 0.4, w: 1.6, d: 1.3, h: 1.45 },
  { x: 0.6, y: 3.5, w: 2.6, d: 1.4, h: 0.85 },
  { x: 3.7, y: 3.6, w: 1.4, d: 1.4, h: 1.1 }, // (the Hirshhorn: a drum, drawn as a squat block)
  { x: 5.6, y: 3.5, w: 1.8, d: 1.5, h: 1.0 },
]

const S = 46 // px per grid unit
const C = Math.cos(Math.PI / 6) * S, N = Math.sin(Math.PI / 6) * S
const iso = (x: number, y: number, z = 0) => [(x - y) * C, (x + y) * N - z * S * 1.1] as const
const pts = (...p: (readonly [number, number])[]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ")

export function IsoCluster({ museums }: { museums: Museum[] }) {
  const mall = [iso(-0.4, 2.15), iso(8, 2.15), iso(8, 3.1), iso(-0.4, 3.1)]
  const ground = [iso(-0.8, -0.6), iso(8.4, -0.6), iso(8.4, 5.6), iso(-0.8, 5.6)]
  return (
    <svg viewBox="-300 -70 760 470" className="h-full w-full" role="img" aria-label="Bản đồ thu nhỏ cụm bảo tàng">
      <polygon points={pts(...ground)} className="fill-card stroke-border" strokeWidth={1} />
      <polygon points={pts(...mall)} className="fill-muted" />
      {/* the Mall's gravel walk, a row of trees down each side */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} className="fill-[oklch(0.62_0.06_145)] opacity-70">
          <circle cx={iso(i * 0.95, 2.05)[0]} cy={iso(i * 0.95, 2.05)[1] - 6} r={5} />
          <circle cx={iso(i * 0.95, 3.2)[0]} cy={iso(i * 0.95, 3.2)[1] - 6} r={5} />
        </g>
      ))}
      {SLOTS.slice(0, museums.length).map((b, i) => {
        const m = museums[i]
        const t = (x: number, y: number) => iso(x, y, b.h)
        const top = pts(t(b.x, b.y), t(b.x + b.w, b.y), t(b.x + b.w, b.y + b.d), t(b.x, b.y + b.d))
        const left = pts(iso(b.x, b.y + b.d), iso(b.x + b.w, b.y + b.d), t(b.x + b.w, b.y + b.d), t(b.x, b.y + b.d))
        const right = pts(iso(b.x + b.w, b.y), iso(b.x + b.w, b.y + b.d), t(b.x + b.w, b.y + b.d), t(b.x + b.w, b.y))
        const [lx, ly] = t(b.x + b.w / 2, b.y + b.d / 2)
        const nWin = Math.max(2, Math.round(b.w * 2))
        return (
          <Link key={m.slug} href={`/bao-tang/${m.slug}`} aria-label={m.name} className="group/b outline-none" style={{ "--museum-accent": m.accent } as React.CSSProperties}>
            <g className="transition-transform duration-500 ease-out group-hover/b:-translate-y-3 group-focus-visible/b:-translate-y-3">
              <polygon points={left} className="fill-[oklch(0.9_0.01_80)] stroke-foreground/25" strokeWidth={0.8} />
              <polygon points={right} className="fill-[oklch(0.84_0.012_80)] stroke-foreground/25" strokeWidth={0.8} />
              <polygon points={top} className="fill-background stroke-foreground/25 transition-colors duration-500 group-hover/b:fill-museum group-focus-visible/b:fill-museum" strokeWidth={0.8} />
              {/* a row of windows along the front face */}
              {Array.from({ length: nWin }, (_, k) => {
                const fx = b.x + (b.w * (k + 0.5)) / nWin, fy = b.y + b.d, z0 = b.h * 0.3, z1 = b.h * 0.7
                return <polygon key={k} points={pts(iso(fx - 0.11, fy, z0), iso(fx + 0.11, fy, z0), iso(fx + 0.11, fy, z1), iso(fx - 0.11, fy, z1))} className="fill-foreground/15" />
              })}
              <text x={lx} y={ly - 16} textAnchor="middle" className="placard pointer-events-none fill-foreground opacity-0 transition-opacity duration-300 group-hover/b:opacity-100 group-focus-visible/b:opacity-100" style={{ fontSize: 10 }}>
                {m.nameEn.replace("National ", "")}
              </text>
            </g>
          </Link>
        )
      })}
    </svg>
  )
}
