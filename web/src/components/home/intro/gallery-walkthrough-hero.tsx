"use client"

import { useEffect, useRef, useState } from "react"
import type * as T from "three"
import "./gallery-walkthrough.css"

type ArtworkDef = {
  id: string
  image: string
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  height: number
  frame: "black" | "walnut" | "metal" | "canvas"
  frameThickness: number
  lightPosition: [number, number, number]
  castsShadow?: boolean
  hero?: boolean
}

type FinaleInfo = { artist: string; title: string; year: string; medium: string; dimensions: string; image: string }
type CamKey = { progress: number; position: [number, number, number]; lookAt: [number, number, number]; fov: number }

const FRAME_COLORS: Record<string, number> = { black: 0x171614, walnut: 0x31251d, metal: 0x77736c, canvas: 0xd8d3c7 }

const ARTWORKS: ArtworkDef[] = [
  { id: "guido-229", image: "/gallery/229+by+Guido+Mauas.webp", position: [-3.06, 1.82, 7.15], rotation: [0, Math.PI / 2, 0], width: 1.92, height: 1.264, frame: "walnut", frameThickness: 0.055, lightPosition: [-1.25, 4.28, 7.15], castsShadow: true },
  { id: "guido-74", image: "/gallery/74+by+Guido+Mauas.webp", position: [-4.86, 1.9, 1.65], rotation: [0, Math.PI / 2, 0], width: 2.439, height: 2, frame: "black", frameThickness: 0.045, lightPosition: [-2.35, 4.35, 1.65], castsShadow: true },
  { id: "guido-dibujo-6", image: "/gallery/Dibujo+6+by+Guido+Mauas.webp", position: [4.86, 1.9, 5.05], rotation: [0, -Math.PI / 2, 0], width: 2.04, height: 1.53, frame: "metal", frameThickness: 0.038, lightPosition: [2.35, 4.35, 5.05] },
  { id: "guido-dibujo-25", image: "/gallery/Dibujo+25+by+Guido+Mauas.webp", position: [-2.05, 2.02, -1.87], rotation: [0, 0, 0], width: 1.294, height: 2.2, frame: "walnut", frameThickness: 0.05, lightPosition: [-2.05, 4.35, 0.15], castsShadow: true },
  { id: "guido-76", image: "/gallery/76+by+Guido+Mauas.webp", position: [4.86, 1.88, 8.55], rotation: [0, -Math.PI / 2, 0], width: 2, height: 1.445, frame: "black", frameThickness: 0.045, lightPosition: [2.4, 4.28, 8.55] },
  { id: "guido-dibujo-7", image: "/gallery/Dibujo+7+by+Guido+Mauas.webp", position: [-4.86, 1.92, 4.65], rotation: [0, Math.PI / 2, 0], width: 1.32, height: 1.76, frame: "walnut", frameThickness: 0.045, lightPosition: [-2.4, 4.3, 4.65] },
  { id: "guido-125", image: "/gallery/125+by+Guido+Mauas.webp", position: [4.55, 1.88, -2.87], rotation: [0, 0, 0], width: 1.78, height: 1.342, frame: "canvas", frameThickness: 0.025, lightPosition: [4.55, 4.28, -1.15] },
  { id: "guido-dibujo-30", image: "/gallery/Dibujo+30+by+Guido+Mauas.webp", position: [4.1, 1.92, 1.37], rotation: [0, Math.PI, 0], width: 1.3, height: 1.79, frame: "black", frameThickness: 0.042, lightPosition: [4.1, 4.3, -0.2] },
  { id: "guido-dibujo-8", image: "/gallery/Dibujo+8+by+Guido+Mauas.webp", position: [7.2, 1.92, -2.87], rotation: [0, 0, 0], width: 1.32, height: 1.76, frame: "metal", frameThickness: 0.038, lightPosition: [7.2, 4.3, -1.25] },
  { id: "guido-dsc03185", image: "/gallery/DSC03185_edited+by+Guido+Mauas.webp", position: [8.15, 1.88, 1.37], rotation: [0, Math.PI, 0], width: 1.72, height: 1.313, frame: "metal", frameThickness: 0.038, lightPosition: [8.15, 4.28, -0.35] },
  { id: "guido-dibujo-31", image: "/gallery/Dibujo+31+by+Guido+Mauas.webp", position: [10.1, 1.92, -2.87], rotation: [0, 0, 0], width: 1.337, height: 1.75, frame: "walnut", frameThickness: 0.045, lightPosition: [10.1, 4.3, -1.25] },
  { id: "end-of-gallery", image: "/gallery/EndOfGallery.webp", position: [13.88, 2.02, -0.75], rotation: [0, -Math.PI / 2, 0], width: 3.46, height: 2.836, frame: "black", frameThickness: 0.065, lightPosition: [11.25, 4.32, -0.75], castsShadow: true, hero: true },
]

const FINALE: FinaleInfo = { artist: "Dawson Wells", title: "Smithsonian Castle in Bloom", year: "2026", medium: "Oil on canvas", dimensions: "250 × 205 cm", image: "/gallery/EndOfGallery.webp" }

const DESKTOP_KEYS: CamKey[] = [
  { progress: 0, position: [0.3, 1.65, 10.35], lookAt: [-1.7, 1.72, 4.2], fov: 44 },
  { progress: 0.12, position: [0.18, 1.65, 8.55], lookAt: [-2.55, 1.78, 4.2], fov: 43.5 },
  { progress: 0.27, position: [0.52, 1.65, 5.35], lookAt: [-1.45, 1.78, 0.6], fov: 43 },
  { progress: 0.38, position: [0.28, 1.65, 2.45], lookAt: [-2.05, 1.88, -1.82], fov: 43 },
  { progress: 0.45, position: [0.32, 1.65, 1.15], lookAt: [-1.35, 1.82, -1.55], fov: 42.8 },
  { progress: 0.49, position: [0.55, 1.65, 0.35], lookAt: [2.5, 1.8, -0.75], fov: 42.5 },
  { progress: 0.54, position: [1.25, 1.65, -0.35], lookAt: [4.8, 1.8, -0.75], fov: 42.5 },
  { progress: 0.6, position: [3, 1.65, -0.72], lookAt: [7.2, 1.8, -0.75], fov: 42.5 },
  { progress: 0.69, position: [5.45, 1.65, -0.75], lookAt: [9.75, 1.84, -0.75], fov: 42.5 },
  { progress: 0.82, position: [9, 1.67, -0.75], lookAt: [13.72, 1.97, -0.75], fov: 42 },
  { progress: 0.9, position: [10.1, 1.72, -0.75], lookAt: [13.8, 2.01, -0.75], fov: 41.5 },
  { progress: 0.96, position: [10.8, 1.79, -0.75], lookAt: [13.84, 2.02, -0.75], fov: 41 },
  { progress: 1, position: [11.16, 1.84, -0.75], lookAt: [13.88, 2.02, -0.75], fov: 40.5 },
]

const MOBILE_KEYS: CamKey[] = [
  { progress: 0, position: [0, 1.62, 11.9], lookAt: [-3.25, 1.75, 3.5], fov: 68 },
  { progress: 0.1, position: [0.1, 1.62, 11.3], lookAt: [-3.2, 1.75, 3.8], fov: 64 },
  { progress: 0.2, position: [0.55, 1.62, 7.4], lookAt: [-2.15, 1.78, 2.5], fov: 51 },
  { progress: 0.34, position: [0.55, 1.62, 3.9], lookAt: [-1.5, 1.8, 0.1], fov: 50.5 },
  { progress: 0.42, position: [0.28, 1.62, 2.15], lookAt: [-2.05, 1.88, -1.82], fov: 50 },
  { progress: 0.49, position: [0.35, 1.62, 0.85], lookAt: [-0.7, 1.82, -1.45], fov: 49.5 },
  { progress: 0.53, position: [0.62, 1.62, 0.1], lookAt: [2.7, 1.8, -0.75], fov: 49 },
  { progress: 0.58, position: [1.55, 1.62, -0.45], lookAt: [5.6, 1.82, -0.75], fov: 49 },
  { progress: 0.68, position: [4.2, 1.64, -0.75], lookAt: [9.1, 1.86, -0.75], fov: 48 },
  { progress: 0.85, position: [6.35, 1.68, -0.75], lookAt: [13.55, 1.98, -0.75], fov: 47 },
  { progress: 0.94, position: [7.2, 1.73, -0.75], lookAt: [13.78, 2.02, -0.75], fov: 46 },
  { progress: 1, position: [7.65, 1.78, -0.75], lookAt: [13.88, 2.02, -0.75], fov: 45 },
]

function lerpScalar(a: number, b: number, t: number) { return a + (b - a) * t }
function smoothDamp(current: number, target: number, factor: number) { return current + (target - current) * factor }
function remap01(value: number, lo: number, hi: number) {
  if (hi <= lo) return value >= hi ? 1 : 0
  return Math.min(1, Math.max(0, (value - lo) / (hi - lo)))
}

function interpKeyframes(keys: CamKey[], p: number, out: { position: [number, number, number]; lookAt: [number, number, number]; fov: number }) {
  if (p <= keys[0].progress) { Object.assign(out, { position: [...keys[0].position], lookAt: [...keys[0].lookAt], fov: keys[0].fov }); return out }
  if (p >= keys[keys.length - 1].progress) { const k = keys[keys.length - 1]; Object.assign(out, { position: [...k.position], lookAt: [...k.lookAt], fov: k.fov }); return out }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1]
    if (p >= a.progress && p <= b.progress) {
      const t = (p - a.progress) / (b.progress - a.progress)
      const st = t * t * (3 - 2 * t)
      out.position = [lerpScalar(a.position[0], b.position[0], st), lerpScalar(a.position[1], b.position[1], st), lerpScalar(a.position[2], b.position[2], st)]
      out.lookAt = [lerpScalar(a.lookAt[0], b.lookAt[0], st), lerpScalar(a.lookAt[1], b.lookAt[1], st), lerpScalar(a.lookAt[2], b.lookAt[2], st)]
      out.fov = lerpScalar(a.fov, b.fov, st)
      return out
    }
  }
  return out
}

export function GalleryWalkthroughHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const heroOverlayRef = useRef<HTMLDivElement>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const finaleArt = ARTWORKS[ARTWORKS.length - 1]

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    const stage = stageRef.current
    const heroOverlay = heroOverlayRef.current
    if (!canvas || !section || !stage || !heroOverlay) return
    let disposed = false

    Promise.all([
      import("three"),
      import("three/examples/jsm/lights/RectAreaLightUniformsLib.js"),
      import("three/examples/jsm/loaders/GLTFLoader.js"),
    ]).then(([THREE, { RectAreaLightUniformsLib }, { GLTFLoader }]) => {
      RectAreaLightUniformsLib.init()
      if (disposed) return

      // ── renderer (matches DW: no alpha, no stencil, capped dpr) ──
      const isMobileDevice = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches
      const maxDpr = isMobileDevice ? 1.25 : 1.6
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: false, powerPreference: "high-performance" })
      renderer.setPixelRatio(Math.min(devicePixelRatio, maxDpr))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xd8d3c9)
      scene.fog = new THREE.Fog(0xd8d3c9, 17, 38)

      const camera = new THREE.PerspectiveCamera(44, 1, 0.05, 70)
      camera.position.set(0.3, 1.65, 10.35)

      // ── loading manager ────────────────────────────────────
      const manager = new THREE.LoadingManager()
      manager.onProgress = (_url, loaded, total) => { if (!disposed) setLoadProgress(loaded / total) }
      manager.onLoad = () => { if (!disposed) { setLoadProgress(1); setTimeout(() => { if (!disposed) setDismissed(true) }, 400) } }

      // ── marble floor (procedural, identical to DW) ────────
      const TILE = 4.6
      const marbleTex = new THREE.TextureLoader(manager).load("/gallery/marble-black-white.png")
      marbleTex.wrapS = THREE.RepeatWrapping
      marbleTex.wrapT = THREE.RepeatWrapping
      marbleTex.colorSpace = THREE.SRGBColorSpace
      marbleTex.anisotropy = 8

      const floorMat = new THREE.MeshPhysicalMaterial({
        map: marbleTex, color: 0xffffff, roughness: 0.2, metalness: 0,
        ior: 1.5, clearcoat: 0.26, clearcoatRoughness: 0.26, envMapIntensity: 0.82,
      })

      // DW builds floor as custom BufferGeometry with world-space UVs / TILE
      const floorVerts: number[] = []
      const floorUvs: number[] = []
      const addFloorQuad = (x1: number, x2: number, z1: number, z2: number) => {
        for (const [x, z] of [[x1,z1],[x1,z2],[x2,z2],[x1,z1],[x2,z2],[x2,z1]]) {
          floorVerts.push(x, 0.014, z)
          floorUvs.push(x / TILE, z / TILE)
        }
      }
      addFloorQuad(-5.06, 5.06, -3.06, 12.06) // Room 1
      addFloorQuad(5.06, 14.16, -3.06, 1.56)   // Corridor
      const floorGeo = new THREE.BufferGeometry()
      floorGeo.setAttribute("position", new THREE.Float32BufferAttribute(floorVerts, 3))
      floorGeo.setAttribute("uv", new THREE.Float32BufferAttribute(floorUvs, 2))
      floorGeo.computeVertexNormals()
      const floorMesh = new THREE.Mesh(floorGeo, floorMat)
      floorMesh.receiveShadow = true
      scene.add(floorMesh)

      // ── GLB architecture (DW approach: load GLB, hide 6 meshes, apply materials) ──
      const HIDDEN_MESHES = new Set([
        "Doorway Header", "Doorway West Return", "Doorway East Return",
        "Wall Far Left", "Wall Far Return", "Foreground Partition",
      ])
      const ceilMat = new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 0.9, metalness: 0.01 })
      const normName = (n: string) => n.replaceAll("_", " ")

      const glbLoader = new GLTFLoader(manager)
      let wallMatFromGLB: T.Material | null = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isMeshObj = (o: any): o is T.Mesh => !!(o?.isMesh)

      glbLoader.load("/gallery/gallery-architecture.glb", (gltf) => {
        if (disposed) return
        const glbScene = gltf.scene

        // Extract wall material before hiding
        glbScene.traverse((obj) => {
          if (!isMeshObj(obj)) return
          if (normName(obj.name) === "Wall Far Left") {
            wallMatFromGLB = Array.isArray(obj.material) ? (obj.material[0] ?? null) : obj.material
          }
        })

        // Hide specified meshes + marble joints; apply overrides to rest
        glbScene.traverse((obj) => {
          const name = normName(obj.name)
          if (HIDDEN_MESHES.has(name) || name.startsWith("Marble Joint")) {
            obj.visible = false
            obj.scale.setScalar(0)
            return
          }
          if (!isMeshObj(obj)) return
          if (name.startsWith("Ceiling")) obj.material = ceilMat
          obj.castShadow = !name.startsWith("Floor") && !name.startsWith("Ceiling")
          obj.receiveShadow = true
          ;(Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m: T.Material) => { m.needsUpdate = true })
        })

        scene.add(glbScene)

        // Two thin wall replacements (DW exact positions/sizes)
        if (wallMatFromGLB) {
          const addThin = (w: number, h: number, pos: [number, number, number], rotY = 0) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMatFromGLB!)
            m.position.set(...pos)
            if (rotY) m.rotation.y = rotY
            m.receiveShadow = true
            scene.add(m)
          }
          addThin(6.2, 4.8, [-1.9, 2.4, -1.955])
          addThin(5.5, 4.4, [-3.145, 2.2, 7.05], Math.PI / 2)
        }
      })

      // ── lighting (identical to DW) ─────────────────────────
      scene.add(new THREE.HemisphereLight(0xfff8e8, 0x514d46, 0.62))
      scene.add(new THREE.AmbientLight(0xefe7d9, 0.18))

      // DW uses 3 RectAreaLights (Lightformers baked into env map)
      const addRect = (color: string, intensity: number, pos: [number,number,number], rotX: number, rotY: number, w: number, h: number) => {
        const light = new THREE.RectAreaLight(new THREE.Color(color), intensity, w, h)
        light.position.set(...pos)
        light.rotation.set(rotX, rotY, 0)
        scene.add(light)
      }
      addRect("#fff1d6", 2.8,  [0,    4.25,  5],     Math.PI / 2, 0,             7,  5) // Room 1 ceiling
      addRect("#dce6f0", 1.35, [7.5,  3.9,   -0.75], Math.PI / 2, 0,             10, 2.6) // Corridor ceiling
      addRect("#f4ead7", 1.1,  [-4.2, 2.2,   3],     0,           Math.PI / 2,   4,  3) // West wall

      // ── framed artwork + picture lights ─────────────────────
      const artLoader = new THREE.TextureLoader(manager)
      artLoader.crossOrigin = "anonymous"

      ARTWORKS.forEach((art) => {
        const tex = artLoader.load(art.image)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8

        const isFinale = !!art.hero
        const fw = art.width, fh = art.height
        const frameThick = art.frameThickness
        const depth = art.frame === "canvas" ? 0.055 : 0.085
        const outerW = fw + frameThick * 2, outerH = fh + frameThick * 2
        const frameColor = FRAME_COLORS[art.frame]

        const group = new THREE.Group()
        group.name = `artwork-${art.id}`

        // backing board
        const backing = new THREE.Mesh(
          new THREE.BoxGeometry(outerW, outerH, depth),
          new THREE.MeshStandardMaterial({ color: art.frame === "canvas" ? 0xded8cc : 0x26231e, roughness: 0.78, metalness: 0.02 })
        )
        backing.position.z = -0.035
        backing.castShadow = true; backing.receiveShadow = true
        group.add(backing)

        // frame rails
        if (art.frame !== "canvas") {
          const fMat = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: art.frame === "metal" ? 0.38 : 0.64,
            metalness: art.frame === "metal" ? 0.6 : 0.08,
          })
          const railDepth = depth * 1.18
          const rails: T.Mesh[] = [
            new THREE.Mesh(new THREE.BoxGeometry(outerW, frameThick, railDepth), fMat),
            new THREE.Mesh(new THREE.BoxGeometry(outerW, frameThick, railDepth), fMat),
            new THREE.Mesh(new THREE.BoxGeometry(frameThick, outerH - frameThick * 2, railDepth), fMat),
            new THREE.Mesh(new THREE.BoxGeometry(frameThick, outerH - frameThick * 2, railDepth), fMat),
          ]
          rails[0].position.set(0, outerH / 2 - frameThick / 2, depth * 0.22)
          rails[1].position.set(0, -outerH / 2 + frameThick / 2, depth * 0.22)
          rails[2].position.set(-outerW / 2 + frameThick / 2, 0, depth * 0.22)
          rails[3].position.set(outerW / 2 - frameThick / 2, 0, depth * 0.22)
          rails.forEach(r => { r.castShadow = true; group.add(r) })
        }

        // image plane
        const imgMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(fw, fh),
          new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82, metalness: 0, toneMapped: false })
        )
        imgMesh.position.z = depth * 0.62
        imgMesh.castShadow = true
        group.add(imgMesh)

        group.position.set(...art.position)
        group.rotation.set(...art.rotation)
        scene.add(group)

        // ── picture light fixture ────────────────────────────
        const tubeW = Math.min(Math.max(fw * 0.52, 0.58), 1.18)
        const fixtureY = fh / 2 + 0.29
        const spread = tubeW * 0.34
        const fixtureGroup = new THREE.Group()
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x181715, roughness: 0.38, metalness: 0.72 })

        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, tubeW, 12), tubeMat)
        tube.rotation.z = Math.PI / 2
        tube.position.set(0, fixtureY, 0.23)
        tube.castShadow = true
        fixtureGroup.add(tube)

        ;[-spread, spread].forEach(xOff => {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.22), tubeMat)
          arm.position.set(xOff, fixtureY - 0.015, 0.12)
          arm.castShadow = true
          fixtureGroup.add(arm)
        })

        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(tubeW * 0.88, 0.012, 0.035),
          new THREE.MeshStandardMaterial({ color: 0xfff4d8, emissive: 0xffdca0, emissiveIntensity: 1.7, roughness: 0.5, toneMapped: false })
        )
        strip.position.set(0, fixtureY - 0.029, 0.247)
        fixtureGroup.add(strip)

        fixtureGroup.position.set(...art.position)
        fixtureGroup.rotation.set(...art.rotation)
        scene.add(fixtureGroup)

        // spot light per artwork
        const spotLight = new THREE.SpotLight(0xfff3d5, 82, 7.5, 0.42, 0.86, 2)
        spotLight.position.set(...art.lightPosition)
        const target = new THREE.Object3D()
        target.position.set(...art.position)
        scene.add(target)
        spotLight.target = target
        if (art.castsShadow) {
          spotLight.castShadow = true
          spotLight.shadow.bias = -0.0035
          spotLight.shadow.mapSize.set(512, 512)
          spotLight.shadow.autoUpdate = false
          spotLight.shadow.needsUpdate = true
        }
        scene.add(spotLight)
      })

      // ── resize ─────────────────────────────────────────────
      const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight
        if (w === 0 || h === 0) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      const obs = new ResizeObserver(resize)
      obs.observe(canvas)

      // ── scroll-driven camera ───────────────────────────────
      let targetProgress = 0
      let smoothProgress = 0
      const camState = { position: [0.3, 1.65, 10.35] as [number, number, number], lookAt: [-1.7, 1.72, 4.2] as [number, number, number], fov: 44 }
      const livePos = new THREE.Vector3(0.3, 1.65, 10.35)
      const liveLook = new THREE.Vector3(-1.7, 1.72, 4.2)
      const lookMatrix = new THREE.Matrix4()
      const lookQuat = new THREE.Quaternion()

      const isMobile = () => window.innerWidth <= 760 || window.innerHeight > window.innerWidth

      const finaleCorners = [
        new THREE.Vector3(-finaleArt.width / 2, finaleArt.height / 2, 0.08),
        new THREE.Vector3(finaleArt.width / 2, finaleArt.height / 2, 0.08),
        new THREE.Vector3(-finaleArt.width / 2, -finaleArt.height / 2, 0.08),
        new THREE.Vector3(finaleArt.width / 2, -finaleArt.height / 2, 0.08),
      ]
      const tempVec = new THREE.Vector3()
      const targetPosVec = new THREE.Vector3()
      const targetLookVec = new THREE.Vector3()

      let rafHandle = 0
      const root = document.documentElement
      const onScroll = () => {
        const rect = section.getBoundingClientRect()
        const scrollable = Math.max(rect.height - window.innerHeight, 1)
        targetProgress = Math.min(1, Math.max(0, -rect.top / scrollable))
        const inGallery = rect.top < 10 && rect.bottom > window.innerHeight
        root.classList.toggle("gallery-active", inGallery)
      }
      window.addEventListener("scroll", onScroll, { passive: true })
      onScroll()

      const animate = () => {
        rafHandle = requestAnimationFrame(animate)

        const dampFactor = Math.min(0.05, 1 / 60)
        smoothProgress = smoothDamp(smoothProgress, targetProgress, 6.25 * dampFactor / (1 - 6.25 * dampFactor + 0.001))
        const p = smoothProgress
        const keys = isMobile() ? MOBILE_KEYS : DESKTOP_KEYS
        interpKeyframes(keys, p, camState)

        const ease = 8.5 * dampFactor / (1 - 8.5 * dampFactor + 0.001)
        targetPosVec.set(camState.position[0], camState.position[1], camState.position[2])
        targetLookVec.set(camState.lookAt[0], camState.lookAt[1], camState.lookAt[2])
        livePos.lerp(targetPosVec, ease)
        liveLook.lerp(targetLookVec, ease)
        camera.position.copy(livePos)

        lookMatrix.lookAt(camera.position, liveLook, camera.up)
        lookQuat.setFromRotationMatrix(lookMatrix)
        camera.quaternion.slerp(lookQuat, 10 * dampFactor / (1 - 10 * dampFactor + 0.001))

        if (Math.abs(camState.fov - camera.fov) > 0.01) {
          camera.fov = smoothDamp(camera.fov, camState.fov, ease)
          camera.updateProjectionMatrix()
        }

        camera.updateMatrixWorld(true)

        const introOp = p < 0.03 ? 1 : p < 0.06 ? 1 - (p - 0.03) / 0.03 : 0
        stage.style.setProperty("--intro-opacity", String(introOp.toFixed(3)))

        const detailsOp = remap01(p, 0.885, 0.915)
        stage.style.setProperty("--hero-details-opacity", String(detailsOp.toFixed(3)))

        // hero projection
        const artObj = scene.getObjectByName(`artwork-${finaleArt.id}`)
        if (artObj && heroOverlay) {
          artObj.updateWorldMatrix(true, false)
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
          finaleCorners.forEach(c => {
            tempVec.copy(c).applyMatrix4(artObj.matrixWorld).project(camera)
            const sx = (tempVec.x * 0.5 + 0.5) * canvas.clientWidth
            const sy = (-tempVec.y * 0.5 + 0.5) * canvas.clientHeight
            minX = Math.min(minX, sx); maxX = Math.max(maxX, sx)
            minY = Math.min(minY, sy); maxY = Math.max(maxY, sy)
          })

          const growT = remap01(p, 0.93, 0.995)
          const fadeT = remap01(p, 0.885, 0.915)
          const projX = lerpScalar(minX, 0, growT)
          const projY = lerpScalar(minY, 0, growT)
          const projW = lerpScalar(maxX - minX, canvas.clientWidth, growT)
          const projH = lerpScalar(maxY - minY, canvas.clientHeight, growT)

          heroOverlay.style.transform = `translate3d(${projX.toFixed(2)}px, ${projY.toFixed(2)}px, 0)`
          heroOverlay.style.width = `${Math.max(projW, 1).toFixed(2)}px`
          heroOverlay.style.height = `${Math.max(projH, 1).toFixed(2)}px`
          heroOverlay.style.opacity = String(fadeT.toFixed(3))
          heroOverlay.style.visibility = p > 0.6 ? "visible" : "hidden"
        }

        const canvasOp = p > 0.97 ? 1 - remap01(p, 0.97, 1) * 0.3 : 1
        stage.style.setProperty("--canvas-opacity", String(canvasOp.toFixed(3)))

        renderer.render(scene, camera)
      }
      animate()

      // ── cleanup ────────────────────────────────────────────
      const cleanup = () => {
        disposed = true
        cancelAnimationFrame(rafHandle)
        window.removeEventListener("scroll", onScroll)
        obs.disconnect()
        root.classList.remove("gallery-active")
        renderer.dispose()
        scene.traverse((obj) => {
          const mesh = obj as T.Mesh
          if (mesh.geometry) mesh.geometry.dispose()
          const mat = mesh.material as T.Material | T.Material[] | undefined
          if (Array.isArray(mat)) mat.forEach(m => m.dispose())
          else if (mat) mat.dispose()
        })
      }
      ;(canvas as unknown as { __gc?: () => void }).__gc = cleanup
    })

    return () => {
      disposed = true
      ;(canvas as unknown as { __gc?: () => void }).__gc?.()
    }
  }, [])

  return (
    <>
      <section ref={sectionRef} className="gallery-journey" style={{ height: "1000svh" }} aria-labelledby="gallery-title">
        <div className="gallery-stage" ref={stageRef}>
          <div className="gallery-canvas-shell" aria-hidden="true">
            <canvas ref={canvasRef} />
          </div>

          <div className="gallery-exposure" aria-hidden="true" />

          <div className="gallery-intro">
            <p className="gallery-intro__eyebrow">Smithsonian Institution · Washington, D.C.</p>
            <h1 id="gallery-title">
              An exhibition<br />in motion.
            </h1>
            <p className="gallery-intro__location">Washington · 2026</p>
          </div>

          <div className="scroll-cue" aria-hidden="true">
            <span>Scroll to enter</span>
            <i />
          </div>

          <div ref={heroOverlayRef} className="hero-projection" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FINALE.image} alt="" />
          </div>

          <div className="hero-handoff-metadata">
            <p>{FINALE.artist}</p>
            <h2>{FINALE.title}</h2>
            <dl>
              <div>
                <dt>Year</dt>
                <dd>{FINALE.year}</dd>
              </div>
              <div>
                <dt>Medium</dt>
                <dd>{FINALE.medium}</dd>
              </div>
              <div>
                <dt>Dimensions</dt>
                <dd>{FINALE.dimensions}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className={`gallery-loader${dismissed ? " is-dismissed" : ""}`} aria-hidden={dismissed}>
        <div className="gallery-loader__wordmark">Sota</div>
        <div className="gallery-loader__status">
          <span>Loading exhibition</span>
          <span>{Math.round(loadProgress * 100)}%</span>
        </div>
        <div className="gallery-loader__track">
          <span style={{ transform: `scaleX(${Math.max(loadProgress, 0.02)})` }} />
        </div>
      </div>
    </>
  )
}
