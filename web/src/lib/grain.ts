// The film grain used over the full-screen scenes (the intro, the sign-in page), like pear.no's:
// a tile of white noise, one value per device pixel, made once on the client. readGrain gives the CSS
// background for an element with the film-grain utility (globals.css), sized so a grain is one pixel.
let tile = ""
const grainTile = () => {
  if (tile) return tile
  const c = document.createElement("canvas"), n = 256
  c.width = c.height = n
  const ctx = c.getContext("2d")!, img = ctx.createImageData(n, n)
  for (let k = 0; k < n * n; k++) {
    const g = Math.random() * 255
    img.data.set([g, g, g, 255], k * 4)
  }
  ctx.putImageData(img, 0, 0)
  return (tile = c.toDataURL())
}
export const readGrain = () => `url(${grainTile()}) 0 0 / ${256 / Math.min(devicePixelRatio || 1, 3)}px`
