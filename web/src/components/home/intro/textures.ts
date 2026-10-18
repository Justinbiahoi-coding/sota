// Stand-in artworks for the intro, one per era, drawn as SVG and rendered to WebP by
// scripts/intro-art.ts (public/intro-art/*.webp). The page shows the bitmaps: zooming a bitmap is a
// pure GPU transform, while an SVG would be re-rasterised, filters and all, at every zoom level.
// Replace each with a real Smithsonian Open Access image (CC0) once the API key is in.

const W = 1400, H = 875

// small deterministic random, so the textures are the same on every load
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${body}</svg>`

// a hand: palm, four fingers and a thumb, drawn around (0, 0), about 260 px tall
const hand = (fill: string) => `
  <g fill="${fill}">
    <ellipse cx="0" cy="40" rx="52" ry="64"/>
    ${[-34, -12, 10, 31].map((x, i) => `<rect x="${x - 11}" y="${-92 + Math.abs(i - 1.5) * 14}" width="22" height="${108 - Math.abs(i - 1.5) * 12}" rx="11" transform="rotate(${(i - 1.5) * 7} ${x} 0)"/>`).join("")}
    <rect x="44" y="0" width="22" height="78" rx="11" transform="rotate(48 55 40)"/>
  </g>`

// 1. stone: lit fractal relief, with hand stencils blown in red ochre (the paint sprayed round a hand)
const stone = () => {
  const stencil = (x: number, y: number, r: number, s: number) => `
    <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
      <circle r="150" fill="#a8452a" opacity=".75" filter="url(#spray)"/>
      ${hand("#8f7a63")}
    </g>`
  return svg(`
    <defs>
      <filter id="relief" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="5" seed="7" result="n"/>
        <feDiffuseLighting in="n" surfaceScale="7" lighting-color="#e2d2b8" result="l"><feDistantLight azimuth="235" elevation="38"/></feDiffuseLighting>
        <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="1"/>
      </filter>
      <filter id="spray"><feGaussianBlur stdDeviation="26"/></filter>
      <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="#9b8670" filter="url(#relief)"/>
    <g style="mix-blend-mode:multiply" filter="url(#soft)">
      ${stencil(905, 420, -14, 1.15)}${stencil(1150, 560, 22, 0.8)}${stencil(420, 610, -36, 0.7)}
    </g>`)
}

// 2. bronze: dark metal, cast rings round a centre, verdigris eating into it
const bronze = () =>
  svg(`
    <defs>
      <radialGradient id="g" cx="58%" cy="48%" r="70%"><stop offset="0" stop-color="#7a5a34"/><stop offset=".55" stop-color="#3f2c19"/><stop offset="1" stop-color="#1c130b"/></radialGradient>
      <filter id="patina" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="4" seed="11"/>
        <feColorMatrix values="0 0 0 0 .33  0 0 0 0 .62  0 0 0 0 .52  0 0 0 2.6 -1.25"/>
      </filter>
      <filter id="cast" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="3" result="n"/>
        <feDiffuseLighting in="n" surfaceScale="1.2" lighting-color="#fff"><feDistantLight azimuth="225" elevation="55"/></feDiffuseLighting>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <g fill="none" stroke="#b08a52" stroke-opacity=".55">
      ${Array.from({ length: 15 }, (_, i) => `<circle cx="812" cy="420" r="${70 + i * 30}" stroke-width="${i % 3 ? 2 : 7}" stroke-dasharray="${i % 2 ? "26 10" : "none"}"/>`).join("")}
    </g>
    <rect width="100%" height="100%" filter="url(#cast)" opacity=".18" style="mix-blend-mode:overlay"/>
    <rect width="100%" height="100%" filter="url(#patina)"/>`)

// 3. ink on silk: a woven ground, ink washes, one wave in a single rough stroke, a red seal
const ink = () => {
  const r = rng(5)
  const foam = Array.from({ length: 70 }, () => `<circle cx="${(660 + r() * 420).toFixed(0)}" cy="${(250 + r() * 170).toFixed(0)}" r="${(3 + r() * 7).toFixed(1)}"/>`).join("")
  return svg(`
    <defs>
      <filter id="silk" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .015" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .35 0"/></filter>
      <filter id="wash"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="9" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="90"/><feGaussianBlur stdDeviation="14"/></filter>
      <filter id="brush"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="10"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="#efe5cf"/>
    <rect width="100%" height="100%" filter="url(#silk)"/>
    <g filter="url(#wash)" fill="#2b3446" opacity=".22"><ellipse cx="260" cy="700" rx="320" ry="140"/><ellipse cx="1180" cy="760" rx="260" ry="110"/></g>
    <g filter="url(#brush)" fill="none" stroke="#1d2638" stroke-linecap="round">
      <path d="M120 690 C 360 640 520 520 640 400 C 720 320 820 250 930 260 C 1040 270 1080 360 1010 410 C 960 446 900 420 905 380" stroke-width="26"/>
      <path d="M160 740 C 420 700 600 600 720 470 C 800 380 900 330 980 340" stroke-width="12" opacity=".7"/>
      <path d="M90 790 C 460 760 760 700 1300 720" stroke-width="7" opacity=".5"/>
    </g>
    <g fill="#1d2638" opacity=".8" filter="url(#brush)">${foam}</g>
    <g transform="translate(1200 140)" filter="url(#brush)"><rect width="86" height="86" rx="6" fill="#b3342b"/><path d="M20 24h46M20 43h46M20 62h46M43 18v52" stroke="#efe5cf" stroke-width="6"/></g>`)
}

// 4. oil portrait: a sitter in chiaroscuro, thick directional brushwork, a gilt frame
const oil = () =>
  svg(`
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#5a4029"/><stop offset=".7" stop-color="#241910"/><stop offset="1" stop-color="#120c07"/></radialGradient>
      <radialGradient id="face" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#f0cfa8"/><stop offset=".6" stop-color="#c08a62"/><stop offset="1" stop-color="#6e4630"/></radialGradient>
      <linearGradient id="gilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c66a"/><stop offset=".5" stop-color="#9a7228"/><stop offset="1" stop-color="#f0d488"/></linearGradient>
      <filter id="impasto" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .07" numOctaves="3" seed="8" result="n"/><feDiffuseLighting in="n" surfaceScale="3" lighting-color="#fff"><feDistantLight azimuth="250" elevation="50"/></feDiffuseLighting></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <path d="M430 875 C 450 690 560 610 700 600 C 840 610 950 690 970 875 Z" fill="#1d2430"/>
    <path d="M640 600 L700 700 L760 600 Z" fill="#e9e2d4"/>
    <ellipse cx="700" cy="430" rx="118" ry="150" fill="url(#face)"/>
    <path d="M582 420 C 570 300 640 250 710 252 C 800 255 835 330 818 420 C 800 350 760 320 700 318 C 640 320 600 350 582 420 Z" fill="#2a1a10"/>
    <rect width="100%" height="100%" filter="url(#impasto)" opacity=".22" style="mix-blend-mode:overlay"/>
    <rect x="22" y="22" width="1356" height="831" fill="none" stroke="url(#gilt)" stroke-width="44"/>
    <rect x="50" y="50" width="1300" height="775" fill="none" stroke="#5a3f14" stroke-width="4"/>`)

// 5. modern: a white room, a hanging mobile in primary colours, its shadow on the wall
const modern = () => {
  const disc = (x: number, y: number, r: number, c: string) =>
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - r - 60}" stroke="#151515" stroke-width="2.5"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.86}" fill="${c}"/>`
  const mobile = `
    <path d="M300 230 L1110 170 M560 211 L560 330 M560 330 L330 360 M560 330 L820 345 M940 182 L940 300 M940 300 L1180 330" stroke="#151515" stroke-width="3" fill="none"/>
    ${disc(330, 470, 58, "#c8302a")}${disc(820, 450, 44, "#1f3f8a")}${disc(1180, 420, 64, "#151515")}${disc(700, 520, 30, "#e6b53a")}${disc(450, 560, 24, "#151515")}`
  return svg(`
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f3ec"/><stop offset=".78" stop-color="#ebe6dc"/><stop offset=".78" stop-color="#d9d2c4"/><stop offset="1" stop-color="#cfc7b7"/></linearGradient>
      <filter id="shadow"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#wall)"/>
    <g transform="translate(60 70)" opacity=".16" filter="url(#shadow)">${mobile.replace(/fill="#[0-9a-f]{6}"/g, 'fill="#000"').replace(/stroke="#151515"/g, 'stroke="#000"')}</g>
    ${mobile}`)
}

// 6. pixels: the grid every image is made of now, mostly ivory, with the museums' accents scattered in
const pixels = () => {
  const r = rng(13), cs = ["#e7e1d6", "#ddd6c9", "#efeae1", "#d2cabb"], acc = ["#3f6b47", "#2f4b86", "#a5462f", "#7a3b67", "#c08a2c", "#2f6f6f"]
  const s = 35
  let cells = ""
  for (let y = 0; y < H / s; y++)
    for (let x = 0; x < W / s; x++) {
      const v = r(), c = v < 0.06 ? acc[Math.floor(r() * acc.length)] : cs[Math.floor(r() * cs.length)]
      cells += `<rect x="${x * s + 1}" y="${y * s + 1}" width="${s - 2}" height="${s - 2}" fill="${c}"/>`
    }
  return svg(`<rect width="100%" height="100%" fill="#f6f3ec"/>${cells}`)
}

export const TEXTURES = { stone, bronze, ink, oil, modern, pixels }
