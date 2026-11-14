"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { SplitText } from "gsap/SplitText"
import { Physics2DPlugin } from "gsap/Physics2DPlugin"
// type-only import so TypeScript knows the Three.js shapes (stripped at runtime)
import type * as THREE from "three"

gsap.registerPlugin(useGSAP, SplitText, Physics2DPlugin)

// ─── Water shaders ─────────────────────────────────────────────────────────
// Procedural waves (3 octaves) + analytical normals for Fresnel/specular.
// 8 click-ripple uniforms expand outward in world-space.
const WATER_VERT = /* glsl */ `
precision highp float;
uniform float time;
uniform vec4 rip[8];
varying vec3 vWorld;
varying vec3 vNorm;
void main(){
  vec3 p=position;
  float w=sin(p.x*0.4+time*1.3)*0.22
         +sin(p.z*0.35+time*0.9)*0.14
         +sin(p.x*0.7+p.z*0.6+time*2.0)*0.07;
  // click ripples expand from world-space centres
  vec3 wp=(modelMatrix*vec4(p,1.0)).xyz;
  for(int i=0;i<8;i++){
    float age=time-rip[i].z;
    if(age<0.0||age>2.5)continue;
    float d=length(wp.xz-rip[i].xy);
    float rad=age*3.0;
    float ring=sin((d-rad)*5.0)*exp(-abs(d-rad)*2.5)*(1.0-age/2.5)*rip[i].w;
    w+=ring*0.35;
  }
  // analytical normal
  float dnx=-0.4*0.22*cos(p.x*0.4+time*1.3)-0.7*0.07*cos(p.x*0.7+p.z*0.6+time*2.0);
  float dnz=-0.35*0.14*cos(p.z*0.35+time*0.9)-0.6*0.07*cos(p.x*0.7+p.z*0.6+time*2.0);
  vNorm=normalize(normalMatrix*vec3(dnx,1.0,dnz));
  p.y+=w;
  vWorld=(modelMatrix*vec4(p,1.0)).xyz;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`

const WATER_FRAG = /* glsl */ `
precision highp float;
varying vec3 vWorld;
varying vec3 vNorm;
uniform vec3 sunDir;
uniform vec3 camPos;
uniform vec3 skyTop;
uniform vec3 skyHorizon;
void main(){
  vec3 V=normalize(camPos-vWorld);
  vec3 N=normalize(vNorm);
  float fresnel=pow(1.0-max(dot(N,V),0.0),3.5);
  vec3 R=reflect(-V,N);
  float st=clamp(R.y*0.5+0.5,0.0,1.0);
  vec3 skyRefl=mix(skyHorizon,skyTop,st);
  vec3 deepWater=vec3(0.03,0.07,0.14);
  vec3 col=mix(deepWater,skyRefl,fresnel*0.9);
  // sun specular highlight
  float spec=pow(max(dot(reflect(-sunDir,N),V),0.0),160.0);
  col+=spec*vec3(1.0,0.95,0.85)*1.1;
  gl_FragColor=vec4(col,0.9+fresnel*0.08);
}`

// ─── Types ─────────────────────────────────────────────────────────────────
type Vec4 = { x: number; y: number; z: number; w: number; set(x: number, y: number, z: number, w: number): Vec4 }
type PetalObj = { x: number; y: number; z: number; rx: number; ry: number; rz: number }

interface SceneHandles {
  camera: { rotation: { x: number; y: number; z: number }; position: { x: number; y: number; z: number } }
  waterMat: { uniforms: { time: { value: number }; rip: { value: Vec4[] } } }
  petals: { instanceMatrix: { needsUpdate: boolean }; setMatrixAt(i: number, m: unknown): void }
  petalObjs: PetalObj[]
  ripVecs: Vec4[]
  ripIdx: number
  raycaster: { setFromCamera(coords: { x: number; y: number }, cam: unknown): void; intersectObject(obj: unknown): Array<{ point: { x: number; y: number; z: number } }> }
  waterMesh: unknown
  sun: { x: number; y: number; z: number }
}

const MAX_RIPS = 8
const PETAL_COUNT = 150
const SRC = "/intro/pool.webp"

export function CastleIntro() {
  const section = useRef<HTMLElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const fxDom = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const godBox = useRef<HTMLDivElement>(null)
  const [closed, setClosed] = useState(false)
  const [ready, setReady] = useState(false)
  const sc = useRef<SceneHandles | null>(null)

  // prevent scroll while intro is open
  useEffect(() => {
    const html = document.documentElement
    const before = html.style.overflow
    html.style.overflow = "hidden"
    return () => { html.style.overflow = before }
  }, [])

  // ── Three.js scene ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = cv.current!
    let tickFn: gsap.TickerCallback
    let ro: ResizeObserver

    ;(async () => {
      const THREE = await import("three")
      const { Sky } = await import("three/addons/objects/Sky.js")
      const { EffectComposer } = await import("three/addons/postprocessing/EffectComposer.js")
      const { RenderPass } = await import("three/addons/postprocessing/RenderPass.js")
      const { UnrealBloomPass } = await import("three/addons/postprocessing/UnrealBloomPass.js")

      // renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
      renderer.setSize(innerWidth, innerHeight)

      // scene + camera
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 2000)
      camera.position.set(0, 2.5, 14)
      camera.rotation.x = -0.14 // default slight downward tilt

      // sky with procedural sun (morning light)
      const sky = new Sky()
      sky.scale.setScalar(1500)
      scene.add(sky)
      const su = sky.material.uniforms as Record<string, { value: unknown }>
      su.turbidity.value = 7
      su.rayleigh.value = 2.8
      su.mieCoefficient.value = 0.006
      su.mieDirectionalG.value = 0.88
      const sun = new THREE.Vector3()
      sun.setFromSphericalCoords(1,
        THREE.MathUtils.degToRad(90 - 18), // elevation 18°
        THREE.MathUtils.degToRad(220)       // south-east azimuth
      )
      su.sunPosition.value = sun

      // lighting
      const sunLight = new THREE.DirectionalLight(0xffe8c0, 2.8)
      sunLight.position.copy(sun).multiplyScalar(100)
      scene.add(sunLight)
      scene.add(new THREE.AmbientLight(0x667799, 0.45))
      scene.add(new THREE.HemisphereLight(0x88aadd, 0x334422, 0.75))

      // water material — ripple uniforms as array of Vector4
      const ripVecs = Array.from({ length: MAX_RIPS }, () => new THREE.Vector4(-999, 0, -999, 0))
      const waterMat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          sunDir: { value: sun.clone().normalize() },
          camPos: { value: camera.position },
          skyTop: { value: new THREE.Color(0x1a3060) },
          skyHorizon: { value: new THREE.Color(0xc07040) },
          rip: { value: ripVecs },
        },
        vertexShader: WATER_VERT,
        fragmentShader: WATER_FRAG,
        transparent: true,
      })
      const waterGeo = new THREE.PlaneGeometry(80, 80, 96, 96)
      const waterMesh = new THREE.Mesh(waterGeo, waterMat)
      waterMesh.rotation.x = -Math.PI / 2
      waterMesh.position.y = -0.8
      scene.add(waterMesh)

      // castle billboard — pool.webp texture with max anisotropy
      const castleTex = await new Promise<THREE.Texture>((res) =>
        new THREE.TextureLoader().load(SRC, (t) => {
          t.minFilter = THREE.LinearMipmapLinearFilter
          t.anisotropy = renderer.capabilities.getMaxAnisotropy()
          t.colorSpace = THREE.SRGBColorSpace
          res(t)
        })
      )
      const castleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 13.5),
        new THREE.MeshStandardMaterial({ map: castleTex, roughness: 0.9 })
      )
      // position castle high enough so the pool in the texture sits behind the 3D water
      castleMesh.position.set(0, 5.5, -10)
      scene.add(castleMesh)

      // cherry petal InstancedMesh — GSAP animates plain objects, ticker copies to matrices
      const petals = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(0.22, 0.28),
        new THREE.MeshStandardMaterial({
          color: 0xffb0c8,
          emissive: 0x661020,
          emissiveIntensity: 0.1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
          roughness: 0.8,
        }),
        PETAL_COUNT
      )
      scene.add(petals)

      const petalObjs: PetalObj[] = Array.from({ length: PETAL_COUNT }, () => ({
        x: (Math.random() - 0.5) * 32,
        y: Math.random() * 18 - 2,
        z: (Math.random() - 0.5) * 18,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
      }))

      const still = matchMedia("(prefers-reduced-motion: reduce)").matches
      if (!still) {
        petalObjs.forEach((p) => {
          const dur = 9 + Math.random() * 13
          gsap.timeline({ repeat: -1, repeatRefresh: true })
            .set(p, { y: 15 + Math.random() * 8, x: () => (Math.random() - 0.5) * 32, z: () => (Math.random() - 0.5) * 18 })
            .to(p, { y: -1.2, duration: dur, ease: "none" })
            .to(p, { x: `+=${(Math.random() - 0.5) * 14}`, duration: dur / 2, repeat: 1, yoyo: true, ease: "sine.inOut" }, 0)
            .to(p, {
              rx: `+=${Math.random() * Math.PI * 5 + Math.PI * 2}`,
              ry: `+=${Math.random() * Math.PI * 7 + Math.PI * 2}`,
              rz: `+=${Math.random() * Math.PI * 4 + Math.PI}`,
              duration: dur, ease: "none",
            }, 0)
            .time(Math.random() * dur)
        })
      }

      // post-processing: bloom makes the sun glow, stars & petals pick up subtle halo
      const composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
      const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.5, 0.82)
      composer.addPass(bloom)

      // raycaster for water click detection
      const raycaster = new THREE.Raycaster()

      // store handles for GSAP hook
      let ripIdx = 0
      sc.current = {
        camera,
        waterMat: waterMat as unknown as SceneHandles["waterMat"],
        petals: petals as unknown as SceneHandles["petals"],
        petalObjs,
        ripVecs: ripVecs as unknown as Vec4[],
        ripIdx,
        raycaster: raycaster as unknown as SceneHandles["raycaster"],
        waterMesh,
        sun,
      }

      // tick: GSAP ticker ↔ Three.js render (keeps timing in sync)
      const dummy = new THREE.Object3D()
      let simTime = 0

      tickFn = () => {
        simTime += 1 / 60
        waterMat.uniforms.time.value = simTime

        // copy GSAP-animated plain objects → InstancedMesh matrices
        for (let i = 0; i < PETAL_COUNT; i++) {
          const p = petalObjs[i]
          dummy.position.set(p.x, p.y, p.z)
          dummy.rotation.set(p.rx, p.ry, p.rz)
          dummy.updateMatrix()
          petals.setMatrixAt(i, dummy.matrix)
        }
        petals.instanceMatrix.needsUpdate = true

        // project sun to 2D screen → move god-ray DOM container
        if (godBox.current) {
          const sv = sun.clone().multiplyScalar(500).project(camera)
          gsap.set(godBox.current, {
            x: (sv.x + 1) / 2 * innerWidth - innerWidth / 2,
            y: -(sv.y - 1) / 2 * innerHeight - innerHeight / 2,
          })
        }

        composer.render()
      }
      gsap.ticker.add(tickFn)

      ro = new ResizeObserver(() => {
        renderer.setSize(innerWidth, innerHeight)
        composer.setSize(innerWidth, innerHeight)
        camera.aspect = innerWidth / innerHeight
        camera.updateProjectionMatrix()
        bloom.resolution.set(innerWidth, innerHeight)
      })
      ro.observe(document.documentElement)

      setReady(true)
    })()

    return () => {
      if (tickFn) gsap.ticker.remove(tickFn)
      ro?.disconnect()
      sc.current = null
    }
  }, [])

  // ── GSAP animations ───────────────────────────────────────────────────────
  const { contextSafe } = useGSAP(
    () => {
      if (!ready) return
      const sec = section.current!
      const mm = gsap.matchMedia()

      mm.add(
        { still: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          const still = !!ctx.conditions?.still

          // caption + button slide up; title chars reveal from under mask
          gsap.timeline({ defaults: { ease: "power3.out", duration: still ? 0 : 1 } })
            .from(".cap",  { y: 18, autoAlpha: 0 }, 0.3)
            .from(".cta",  { y: 18, autoAlpha: 0 }, 1.1)
          SplitText.create(title.current!, {
            type: "words,chars", mask: "chars", autoSplit: true,
            onSplit: (self) => gsap.from(self.chars, {
              yPercent: 115, duration: still ? 0 : 0.95, stagger: 0.025, ease: "power3.out", delay: 0.4,
            }),
          })

          if (still) return

          // god rays pulse: each rotated ray varies opacity + scaleY independently
          gsap.to(".god-ray", {
            scaleY: "random(0.75,1.5)",
            autoAlpha: "random(0.08,0.35)",
            duration: "random(1.8,3.5)",
            repeat: -1, yoyo: true, ease: "sine.inOut",
            stagger: { each: 0.35, from: "random" },
          })

          // camera parallax tilt — gsap.quickTo works on any JS object, including THREE cameras
          const handles = sc.current
          if (!handles) return
          const qx = gsap.quickTo(handles.camera.rotation, "x", { duration: 1.1, ease: "power3" })
          const qy = gsap.quickTo(handles.camera.rotation, "y", { duration: 1.1, ease: "power3" })

          const onMove = (e: PointerEvent) => {
            const nx = (e.clientX / innerWidth) * 2 - 1
            const ny = (e.clientY / innerHeight) * 2 - 1
            qy(nx * 0.09)
            qx(-0.14 + ny * -0.04)
          }

          const onDown = (e: PointerEvent) => {
            if ((e.target as HTMLElement).closest("a,button")) return
            const h = sc.current
            if (!h) return
            // raycast to find whether the pointer is over the water
            const nx = (e.clientX / innerWidth) * 2 - 1
            const ny = -(e.clientY / innerHeight) * 2 + 1
            h.raycaster.setFromCamera({ x: nx, y: ny }, h.camera)
            const hits = h.raycaster.intersectObject(h.waterMesh)
            if (hits.length) {
              addRipple(hits[0].point.x, hits[0].point.z, 1.0)
            } else {
              burst(e.clientX, e.clientY)
            }
          }

          sec.addEventListener("pointermove", onMove)
          sec.addEventListener("pointerdown", onDown)
          return () => {
            sec.removeEventListener("pointermove", onMove)
            sec.removeEventListener("pointerdown", onDown)
          }
        }
      )

      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave() }
      addEventListener("keydown", onKey)
      return () => removeEventListener("keydown", onKey)
    },
    { scope: section, dependencies: [ready] }
  )

  // add a click ripple to the water (world space XZ)
  const addRipple = contextSafe((wx: number, wz: number, strength: number) => {
    const h = sc.current
    if (!h) return
    const idx = h.ripIdx % MAX_RIPS
    h.ripVecs[idx].set(wx, wz, h.waterMat.uniforms.time.value as unknown as number, strength)
    h.ripIdx++
  })

  // DOM Physics2D petal burst on click on sky/castle area
  const burst = contextSafe((cx: number, cy: number) => {
    for (let i = 0; i < 16; i++) {
      const el = document.createElement("span")
      el.className = "petal"
      const size = 8 + Math.random() * 12
      fxDom.current!.appendChild(el)
      gsap.set(el, { width: size, height: size * 1.3, x: cx, y: cy, z: 0, rotation: Math.random() * 360 })
      gsap.to(el, {
        duration: 1.6 + Math.random() * 1.0, ease: "none",
        physics2D: { velocity: 100 + Math.random() * 280, angle: 190 + Math.random() * 160, gravity: 400 },
        rotationX: `+=${300 + Math.random() * 400}`,
        rotationY: `+=${300 + Math.random() * 500}`,
        autoAlpha: 0,
        onComplete: () => el.remove(),
      })
    }
  })

  const leave = contextSafe(() => {
    gsap.to(section.current, {
      autoAlpha: 0, duration: 0.75, ease: "power2.inOut", overwrite: true,
      onComplete: () => setClosed(true),
    })
  })

  if (closed) return null

  const btn =
    "placard inline-flex items-center gap-4 whitespace-nowrap rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white"

  return (
    <section
      ref={section}
      role="dialog"
      aria-modal="true"
      aria-label="Phần mở đầu"
      className="fixed inset-0 z-50 select-none overflow-hidden bg-[#0d1520] text-white"
    >
      {/* Three.js canvas — full screen 3D render */}
      <canvas ref={cv} aria-hidden className="absolute inset-0 size-full" />

      {/* God rays: DOM divs centred on the sun screen-position, animated by GSAP */}
      <div
        ref={godBox}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{ mixBlendMode: "screen" }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="god-ray absolute"
            style={{
              width: 3 + (i % 3) * 2,
              height: 420 + (i % 4) * 80,
              transformOrigin: "top center",
              transform: `rotate(${i * 36}deg) translateY(-50%)`,
              background: `linear-gradient(to bottom, rgba(255,230,160,${0.25 - i * 0.015}), transparent 70%)`,
              filter: `blur(${3 + (i % 3) * 2}px)`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Vignette + ground shadow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* DOM petal burst layer */}
      <div ref={fxDom} aria-hidden className="pointer-events-none absolute inset-0" />

      {/* Nav */}
      <Link href="/" onClick={leave} className="absolute left-5 top-4 font-heading text-3xl italic md:left-8">
        Sota
      </Link>
      <Link href="/dang-nhap" className={`${btn} absolute right-4 top-4 py-1 pl-4 md:right-8`}>
        Đăng nhập
        <span className="grid size-7 place-items-center rounded-[2px] border border-white/25">
          <ArrowRight className="size-3.5" />
        </span>
      </Link>

      {/* Hero text */}
      <div className="absolute inset-x-0 top-[42%] -translate-y-1/2 px-5 text-center md:px-8">
        <p className="cap placard text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.65)]">
          Cụm bảo tàng Smithsonian · Washington, D.C.
        </p>
        <h1
          ref={title}
          className="mt-5 font-heading text-5xl font-light leading-[1.05] tracking-tight [text-shadow:0_2px_28px_rgb(0_0_0/0.5)] sm:text-7xl xl:text-[7rem]"
        >
          Space of the Art.
        </h1>
        <button onClick={leave} className={`cta ${btn} mt-10`}>
          Khám phá
          <span className="grid size-8 place-items-center rounded-[2px] border border-white/25">
            <ArrowRight className="size-3.5" />
          </span>
        </button>
      </div>

      {/* Footer */}
      <p className="placard pointer-events-none absolute bottom-5 left-5 text-white/55 md:bottom-6 md:left-8">
        10 · 08 · 1846 — Smithsonian Institution
      </p>
      <p className="placard pointer-events-none absolute inset-x-0 bottom-5 hidden text-center text-white/40 sm:block">
        Nhấn vào mặt nước · nhấn lên trời để tung hoa
      </p>
      <button
        onClick={leave}
        className="placard absolute bottom-5 right-5 opacity-55 transition-opacity hover:opacity-100 md:bottom-6 md:right-8"
      >
        Bỏ qua
      </button>
    </section>
  )
}
