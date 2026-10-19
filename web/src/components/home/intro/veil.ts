// The transitions between a resting painting and the film leaving it, drawn on one WebGL canvas
// over both, in the manner of pear.no: never a plain dissolve.
//   signal: the picture fails like a broadcast. A front opens from a point of light in the painting
//           (the pear held up, the glint on the gold); on its crest the frame breaks into a mosaic,
//           splits its colours and stipples through an ordered dither, and the crest flares warm.
//           Round the crest the picture disperses into grains, posterises through the dither and
//           shows a screen's lit dots; at the start a bloom of light rays out of that point: the flash.
//   burn:   a diagonal cut bent by noise eats the old frame; the side about to go chars, the cut
//           glows like an ember.
//   soak:   the new picture soaks in from the middle in patches, like ink taking to paper.
// The canvas only draws while a transition is on screen; the rest of the time it is hidden and the
// paintings and films underneath are plain elements.

export type Veil = "signal" | "burn" | "soak"
// origin: the point of light, in the painting being left (0..1 from its top left); fromPos: its object-position
export type VeilDraw = (from: TexImageSource, to: TexImageSource, t: number, mode: Veil, origin: [number, number], fromPos: [number, number]) => void

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = p*0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
varying vec2 v;
uniform sampler2D uA, uB;
uniform vec4 uFitA, uFitB;   // cover-fit of each picture: scale xy, offset zw
uniform vec2 uRes, uO;       // canvas px; the origin of the front, in screen uv (y up)
uniform float uT, uMode, uTime;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + 1.0), f.x), f.y);
}
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int k = 0; k < 4; k++){ s += a*noise(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
// 4x4 ordered dither threshold, 0..1
float bayer(vec2 px){
  vec2 q = mod(floor(px), 4.0);
  float a = mod(q.x, 2.0), b = mod(q.y, 2.0), c = floor(q.x/2.0), d = floor(q.y/2.0);
  float m = 4.0*(2.0*a*(1.0 - b) + a*b + 3.0*(1.0 - a)*b) + (2.0*c*(1.0 - d) + c*d + 3.0*(1.0 - c)*d);
  return (m + 0.5) / 16.0;
}
vec3 A(vec2 uv){ return texture2D(uA, clamp(uv*uFitA.xy + uFitA.zw, 0.001, 0.999)).rgb; }
vec3 B(vec2 uv){ return texture2D(uB, clamp(uv*uFitB.xy + uFitB.zw, 0.001, 0.999)).rgb; }
vec3 screen(vec3 a, vec3 b){ return 1.0 - (1.0 - a)*(1.0 - b); }

void main(){
  vec2 uv = v, ar = vec2(uRes.x/uRes.y, 1.0), px = uv*uRes;
  float t = uT, w = 0.11;            // the crest's width
  float e;                            // signed distance to the front: < 0 behind it (the new picture)
  if (uMode < 0.5) {                  // signal: a lobed front out of the point of light
    vec2 d = (uv - uO)*ar;
    float ang = atan(d.y, d.x), r = length(d);
    float wob = (fbm(vec2(ang*1.7 + 3.0, uTime*0.25)) - 0.5) + (fbm(vec2(ang*4.9, uTime*0.4)) - 0.5)*0.5;
    e = r + wob*0.28 - mix(-0.25, 2.1, t);
  } else if (uMode < 1.5) {           // burn: a diagonal cut, bent and torn
    float d = dot(uv - 0.5, normalize(vec2(-1.0, 0.55)))*1.15;
    e = d + (fbm(uv*vec2(3.0, 5.0) + 2.0) - 0.5)*0.42 + (fbm(uv*14.0) - 0.5)*0.08 - mix(-0.95, 0.95, t);
    w = 0.12;
  } else {                            // soak: patches from the middle that spread and join
    float r = length((uv - 0.5)*ar);
    e = r + (fbm(uv*3.2 + 5.0) - 0.5)*0.55 + (fbm(uv*11.0) - 0.5)*0.12 - mix(-0.3, 1.45, t);
    w = 0.1;
  }
  float band = 1.0 - smoothstep(0.0, w, abs(e));   // 1 on the crest, 0 away from it
  float behind = smoothstep(w*1.2, -w*1.2, e);     // 0 ahead of the front, 1 behind it (the dither works across this)

  vec3 col;
  if (uMode < 0.5) {
    // a wide zone round the crest where the picture comes apart; the crest itself is its heart
    float zone = 1.0 - smoothstep(0.0, 0.5, abs(e));
    vec2 dir = normalize((uv - uO)*ar + 1e-4)/ar;
    // mosaic on the crest: the sampling snaps to a grid that is coarse at the crest's heart
    float cell = floor(mix(1.0, 22.0, band));
    vec2 su = (floor(px/cell) + 0.5)*cell/uRes;
    // a tear: rows slide sideways where the crest passes
    float row = floor(px.y/mix(3.0, 18.0, band));
    su.x += (hash(vec2(row, floor(uTime*24.0))) - 0.5)*0.06*band;
    // sand: across the zone every pixel samples from a little way off, thrown outward with the
    // front, so the picture disperses into grains rather than fading
    vec2 g = vec2(hash(px + floor(uTime*20.0)), hash(px.yx + 17.0 + floor(uTime*20.0))) - 0.5;
    su += (g*0.05 + dir*hash(px*0.7)*0.06)*zone*zone;
    // the colours split along the front
    vec2 cs = dir*0.012*band;
    vec3 a = vec3(A(su + cs).r, A(su).g, A(su - cs).b);
    vec3 b = vec3(B(su + cs).r, B(su).g, B(su - cs).b);
    // stippled hand-over: an ordered dither decides, pixel by pixel, which picture shows
    float th = bayer(px)*0.75 + hash(px + floor(uTime*30.0))*0.25;
    col = smoothstep(w*2.5, -w*1.2, e) > th ? b : a;
    // posterised through the dither, so the zone breaks into a print screen rather than flat bands
    float lv = mix(48.0, 4.0, zone*zone);
    col = mix(col, floor(col*lv + bayer(px))/lv, zone);
    // a screen's lit dots show through the tear
    float dots = 1.0 - smoothstep(0.16, 0.3, length(fract(px/5.0) - 0.5));
    col = screen(col, vec3(dots*band*0.32));
    // the crest flares, screen-blended warm, and the whole frame blooms out of the point at first,
    // in rays
    vec3 flare = vec3(1.0, 0.94, 0.80)*pow(band, 4.0)*0.55;
    float r = length((uv - uO)*ar), ang = atan((uv - uO).y*ar.y, (uv - uO).x*ar.x);
    float rays = pow(noise(vec2(ang*22.0, uTime*0.35)), 3.0);
    float flash = sin(clamp(t*1.6, 0.0, 1.0)*3.14159);
    vec3 bloom = vec3(1.0, 0.97, 0.9)*flash*(exp(-r*3.2)*0.85 + (0.06 + 0.5*rays)*exp(-r*1.1));
    col = screen(screen(col, flare), bloom);
  } else if (uMode < 1.5) {
    vec2 g = (vec2(hash(px + floor(uTime*20.0)), hash(px.yx + 5.0)) - 0.5)*0.025*band;   // grains at the cut
    vec3 a = A(uv + g), b = B(uv + g + vec2(-0.03, 0.0)*band);  // the new picture arrives still moving
    float th = bayer(px)*0.7 + hash(px)*0.3;
    float covr = smoothstep(0.0, w*1.6, e)*(1.0 - smoothstep(w*1.6, w*4.0, e));  // the scorch rides ahead of the cut
    vec3 charred = a*mix(vec3(1.0), vec3(0.28, 0.16, 0.08), clamp(covr*1.4, 0.0, 1.0)*step(th*0.6, covr));
    col = behind > th ? b : charred;
    vec3 ember = vec3(1.0, 0.55, 0.18)*pow(band, 5.0)*1.1;
    col = screen(col, ember*(0.6 + 0.4*hash(px*0.5 + uTime)));
  } else {
    vec3 a = A(uv), b = B(uv);
    float th = bayer(px)*0.8 + hash(px)*0.2;
    col = behind > th ? b : a;
    col = mix(col, col*vec3(0.93, 0.9, 0.84), band*0.5);   // a damp edge, darker where it is wet
  }
  gl_FragColor = vec4(col, 1.0);
}`

// the size of whatever is being drawn
const dims = (s: TexImageSource): [number, number] =>
  s instanceof HTMLVideoElement ? [s.videoWidth, s.videoHeight] : s instanceof HTMLImageElement ? [s.naturalWidth, s.naturalHeight] : [1, 1]

// a picture is ready to upload once it has a frame
export const ready = (s: TexImageSource | null | undefined): s is TexImageSource =>
  !!s && (s instanceof HTMLVideoElement ? s.readyState >= 2 : s instanceof HTMLImageElement ? s.complete && s.naturalWidth > 0 : true)

// null when WebGL is not there: the films then dissolve in as before
// (the context is never lost on purpose: in development React runs the effect twice on one canvas, and
// a lost context cannot be had back; the browser frees it with the canvas)
export function makeVeil(canvas: HTMLCanvasElement): { draw: VeilDraw; size: () => void } | null {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false })
  if (!gl) return null
  const shader = (type: number, code: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, code); gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "p")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u = (n: string) => gl.getUniformLocation(prog, n)
  const texs = [0, 1].map((k) => {
    const tx = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + k)
    gl.bindTexture(gl.TEXTURE_2D, tx)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return tx
  })
  gl.uniform1i(u("uA"), 0); gl.uniform1i(u("uB"), 1)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  const MODE = { signal: 0, burn: 1, soak: 2 }
  const t0 = performance.now()

  // ponytail: the canvas renders at most 1.5x device pixels; the stipple is meant to be coarse
  const size = () => {
    const k = Math.min(devicePixelRatio || 1, 1.5)
    canvas.width = Math.round(canvas.clientWidth * k)
    canvas.height = Math.round(canvas.clientHeight * k)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  // object-fit: cover, with object-position pos (0..1 each way), as uv scale and offset (y up)
  const fit = (s: TexImageSource, pos: [number, number]) => {
    const [w, h] = dims(s), ca = canvas.width / canvas.height, ia = w / h
    const sx = ca < ia ? ca / ia : 1, sy = ca < ia ? 1 : ia / ca
    return [sx, sy, (1 - sx) * pos[0], (1 - sy) * (1 - pos[1])] as const
  }
  const draw: VeilDraw = (from, to, t, mode, origin, fromPos) => {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texs[0])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, from)
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texs[1])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, to)
    const fa = fit(from, fromPos)
    gl.uniform4f(u("uFitA"), ...fa)
    gl.uniform4f(u("uFitB"), ...fit(to, [0.5, 0.5]))
    gl.uniform2f(u("uRes"), canvas.width, canvas.height)
    // the origin is a point in the painting; where it lands on screen depends on the crop
    gl.uniform2f(u("uO"), (origin[0] - fa[2]) / fa[0], (1 - origin[1] - fa[3]) / fa[1])
    gl.uniform1f(u("uT"), t)
    gl.uniform1f(u("uMode"), MODE[mode])
    gl.uniform1f(u("uTime"), (performance.now() - t0) / 1000)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  return { draw, size }
}
