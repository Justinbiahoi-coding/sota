// The transitions between a resting painting and the film leaving it, drawn on one WebGL canvas
// over both, in the manner of pear.no: never a plain dissolve.
//   signal: pear.no's ring. The picture fails like a broadcast along a lobed front that leaves from
//           the point of light in the painting (the pear held up, the glint on the gold) and clears
//           the frame. Where the front is, the break-up follows the painting's own ring cadence: the
//           frame tears outward and along its rows, snaps to blocks of two sizes that each hand over
//           at their own moment, splits its colours along the radius, and at the heart of the crest
//           re-renders as bright type; the crest carries a warm flare. At rest (t = 0) the front
//           still breathes at the point of light. Late in the pass every 3px block jitters sideways.
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
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int k = 0; k < 4; k++){ s += a*noise(p); p = p*2.03 + 7.1; a *= 0.5; } return s/0.9375; }
// 4x4 ordered dither threshold, 0..1
float bayer(vec2 px){
  vec2 q = mod(floor(px), 4.0);
  float a = mod(q.x, 2.0), b = mod(q.y, 2.0), c = floor(q.x/2.0), d = floor(q.y/2.0);
  float m = 4.0*(2.0*a*(1.0 - b) + a*b + 3.0*(1.0 - a)*b) + (2.0*c*(1.0 - d) + c*d + 3.0*(1.0 - c)*d);
  return (m + 0.5) / 16.0;
}
// a 5x5 bitmap type, lightest to heaviest: ' ' . : - + = * % # @  (each row 5 bits, bit 0 leftmost)
float rowOf(float i, float y){
  vec4 a = vec4(0.0), b = vec4(0.0);  // rows 0-3, and row 4 in b.x
  if (i > 0.5 && i < 1.5) { b.x = 4.0; }
  else if (i < 2.5 && i > 1.5) { a = vec4(0.0, 4.0, 0.0, 4.0); }
  else if (i < 3.5 && i > 2.5) { a = vec4(0.0, 0.0, 14.0, 0.0); }
  else if (i < 4.5 && i > 3.5) { a = vec4(0.0, 4.0, 14.0, 4.0); }
  else if (i < 5.5 && i > 4.5) { a = vec4(0.0, 14.0, 0.0, 14.0); }
  else if (i < 6.5 && i > 5.5) { a = vec4(4.0, 21.0, 14.0, 21.0); b.x = 4.0; }
  else if (i < 7.5 && i > 6.5) { a = vec4(17.0, 8.0, 4.0, 2.0); b.x = 17.0; }
  else if (i < 8.5 && i > 7.5) { a = vec4(10.0, 31.0, 10.0, 31.0); b.x = 10.0; }
  else if (i > 8.5) { a = vec4(31.0, 17.0, 21.0, 29.0); b.x = 31.0; }
  return y < 0.5 ? a.x : y < 1.5 ? a.y : y < 2.5 ? a.z : y < 3.5 ? a.w : b.x;
}
// q: where in its cell, -0.5..0.5; 1 where the glyph has ink
float glyph(float i, vec2 q){
  q = floor(q*vec2(5.0, -5.0) + 2.5);
  if (q.x < 0.0 || q.x > 4.0 || q.y < 0.0 || q.y > 4.0) return 0.0;
  return mod(floor(rowOf(i, q.y)/exp2(q.x)), 2.0);
}
vec3 A(vec2 uv){ return texture2D(uA, clamp(uv*uFitA.xy + uFitA.zw, 0.001, 0.999)).rgb; }
vec3 B(vec2 uv){ return texture2D(uB, clamp(uv*uFitB.xy + uFitB.zw, 0.001, 0.999)).rgb; }
vec3 screen(vec3 a, vec3 b){ return 1.0 - (1.0 - a)*(1.0 - b); }

void main(){
  vec2 uv = v, ar = vec2(uRes.x/uRes.y, 1.0), px = uv*uRes;
  float t = uT, w = 0.11;            // the crest's width
  float e;                            // signed distance to the front: < 0 behind it (the new picture)
  if (uMode < 0.5) {                  // signal: worked out in full below
    e = 1.0;
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
    // the front, measured from the point of light and scaled by the furthest corner, so at t = 1 it
    // has cleared the frame from wherever the point is
    vec2 d = (uv - uO)*ar;
    float far = max(max(length(-uO*ar), length((vec2(1.0, 0.0) - uO)*ar)), max(length((vec2(0.0, 1.0) - uO)*ar), length((1.0 - uO)*ar)));
    float r = length(d)/far, ang = atan(d.y, d.x);
    // two angular harmonics lobe it and keep it breathing
    float wob = (fbm(vec2(ang*1.9 + 3.0, uTime*0.2)) - 0.5) + (fbm(vec2(ang*5.3, uTime*0.38)) - 0.5)*0.55;
    float W = 0.3, ph = r - (t*(1.0 + 2.0*W) - W + wob*0.3);
    float pass = smoothstep(W, -W, ph);               // how far the front has gone past here
    float crest = clamp(1.0 - abs(ph)/W, 0.0, 1.0);
    crest = crest*crest*(3.0 - 2.0*crest);
    // where it breaks up: a field carrying the painting's own ring cadence
    float rings = 0.5 + 0.5*sin(r*46.0 - uTime*1.1);
    float fld = fbm(uv*3.4 + vec2(uTime*0.06, uTime*0.31))*0.72 + rings*0.28;
    float brk = smoothstep(0.62 - crest*0.26, 0.8 - crest*0.18, fld)*crest;
    // late in the pass, every 3px block jitters sideways
    float late = sin(3.14159*clamp((t - 0.4)/0.6, 0.0, 1.0));
    vec2 jit = vec2((hash(floor(px/3.0) + floor(uTime*26.0)) - 0.5)*0.05*late, 0.0);
    // the tear: outward in steps, ring by ring, and rows sliding under it
    vec2 dir = normalize(d + 1e-5)/ar;
    float out_ = floor((hash(vec2(floor(r*90.0), floor(uTime*15.0))) - 0.5)*7.0)/7.0;
    float row = hash(vec2(floor(px.y/7.0), floor(uTime*13.0))) - 0.5;
    vec2 tuv = uv + dir*out_*0.17*brk + vec2(row*0.09*brk, 0.0);
    // blocks of two sizes, mostly the small ones; each hands over at its own moment
    float size = (step(0.24, hash(floor(uv*15.0) + floor(uTime*5.0))) > 0.5 ? 11.0*0.28 : 11.0);
    vec2 blk = floor(tuv*uRes/size);
    vec2 puv = mix(tuv, (blk + 0.5)*size/uRes, brk) + jit;
    float hb = hash(blk);
    float m = smoothstep(hb*0.55, hb*0.55 + 0.45, pass);
    vec3 c = mix(A(puv), B(puv), m);
    // the channels come apart along the radius
    vec2 cs = dir*13.0*brk/uRes.x;
    c.r = mix(A(puv + cs), B(puv + cs), m).r;
    c.b = mix(A(puv - cs), B(puv - cs), m).b;
    // at the heart of the crest the picture prints itself as bright type
    float cell = 9.0;
    vec2 gp = floor(px/cell), gc = (gp + 0.5)*cell/uRes;
    float hg = hash(gp);
    vec3 gcol = mix(A(gc), B(gc), smoothstep(hg*0.55, hg*0.55 + 0.45, pass));
    float lum = clamp(dot(gcol, vec3(0.299, 0.587, 0.114)) + (hash(gp + floor(uTime*10.0)) - 0.5)*0.1, 0.0, 1.0);
    float ink = glyph(floor(lum*9.99), fract(px/cell) - 0.5);
    vec3 type = mix(gcol*0.58 + 0.3, gcol*1.1 + 0.48, ink);
    type = mix(type, vec3(1.0, 0.98, 0.93)*hash(floor(px) + floor(uTime*26.0)), 0.16*brk);  // light static
    col = mix(c, type, smoothstep(0.5, 0.95, brk));
    // and the crest flares warm
    col = screen(col, vec3(1.0, 0.94, 0.8)*crest*crest*0.62);
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

  // at the screen's own pixels (up to 2x), so the stipple and the grains are one pixel sharp
  const size = () => {
    const k = Math.min(devicePixelRatio || 1, 2)
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
