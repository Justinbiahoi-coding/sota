import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import type { AirExhibit } from "./exhibits"

function disposeModel(object: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  object.traverse((part) => {
    if (!(part instanceof THREE.Mesh)) return
    geometries.add(part.geometry)
    for (const material of Array.isArray(part.material) ? part.material : [part.material]) {
      materials.add(material)
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
    }
  })
  geometries.forEach((item) => item.dispose())
  materials.forEach((item) => item.dispose())
  textures.forEach((item) => {
    if (typeof ImageBitmap !== "undefined" && item.image instanceof ImageBitmap) item.image.close()
    item.dispose()
  })
}

export function createAirStage(host: HTMLDivElement, onContextLost: () => void, mode: "gallery" | "hero" = "gallery") {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = mode === "hero" ? .9 : 1
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.rotateSpeed = .64
  controls.autoRotateSpeed = mode === "hero" ? 1.15 : .8
  controls.enabled = mode === "gallery"
  controls.autoRotate = false

  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, .08)
  room.dispose()
  pmrem.dispose()
  scene.environment = environment.texture
  scene.environmentIntensity = mode === "hero" ? .63 : .87
  const keyLight = new THREE.DirectionalLight(0xffe0b9, 1.9)
  keyLight.position.set(3, 7, 5)
  const fillLight = new THREE.DirectionalLight(0xa1c7ff, 1.5)
  fillLight.position.set(-5, 2, -4)
  scene.add(keyLight, fillLight, new THREE.HemisphereLight(0xf9f2df, 0x557498, 1.15))

  const draco = new DRACOLoader().setDecoderPath("/air-space/draco/").setWorkerLimit(2)
  const loader = new GLTFLoader().setDRACOLoader(draco)
  let model: THREE.Group | undefined
  let radius = 1
  let direction = new THREE.Vector3(1, .6, 1.4).normalize()
  let disposed = false
  let visible = false
  let frame = 0
  let lastTime = 0
  let elapsed = 0

  function render() {
    if (!disposed && host.clientWidth && host.clientHeight) renderer.render(scene, camera)
  }

  function framedDistance() {
    const halfAngle = THREE.MathUtils.degToRad(camera.fov / 2)
    const halfWidth = Math.atan(Math.tan(halfAngle) * camera.aspect)
    return radius / Math.sin(Math.min(halfAngle, halfWidth)) * (mode === "hero" ? .81 : 1.02)
  }

  function fitView() {
    const distance = framedDistance()
    camera.position.copy(direction).multiplyScalar(distance)
    controls.target.set(0, 0, 0)
    controls.minDistance = radius * 1.18
    controls.maxDistance = distance * 2.25
    controls.update()
  }

  function resize() {
    if (!host.clientWidth || !host.clientHeight) return
    const distance = framedDistance()
    renderer.setSize(host.clientWidth, host.clientHeight, false)
    camera.aspect = host.clientWidth / host.clientHeight
    camera.updateProjectionMatrix()
    if (model) {
      const nextDistance = framedDistance()
      controls.maxDistance = nextDistance * 2.25
      camera.position.multiplyScalar(nextDistance / distance)
      controls.update()
    }
    render()
  }

  function animate(time: number) {
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0
    lastTime = time
    if (mode === "hero" && model) {
      elapsed += delta
      model.position.y = Math.sin(elapsed * .68) * .08
      model.rotation.z = Math.sin(elapsed * .39) * .06
      render()
    }
    controls.update(delta)
    frame = requestAnimationFrame(animate)
  }

  function setAnimation() {
    cancelAnimationFrame(frame)
    lastTime = 0
    if (controls.autoRotate && visible && !document.hidden) frame = requestAnimationFrame(animate)
  }

  function clear() {
    if (!model) return
    scene.remove(model)
    disposeModel(model)
    model = undefined
    render()
  }

  function contextLost(event: Event) {
    event.preventDefault()
    onContextLost()
  }

  const sizing = new ResizeObserver(resize)
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    setAnimation()
  })
  sizing.observe(host)
  visibility.observe(host)
  document.addEventListener("visibilitychange", setAnimation)
  renderer.domElement.addEventListener("webglcontextlost", contextLost)
  controls.addEventListener("change", render)
  resize()

  return {
    async load(exhibit: AirExhibit, signal: AbortSignal) {
      const pending = await Promise.allSettled(exhibit.files.map(async (file) => {
        const res = await fetch("/air-space/" + file, { signal })
        if (!res.ok) throw new Error("Model download failed")
        const buffer = await res.arrayBuffer()
        if (signal.aborted || disposed) throw new DOMException("Aborted", "AbortError")
        return (await loader.parseAsync(buffer, "/air-space/")).scene
      }))
      const next = new THREE.Group()
      for (const item of pending) if (item.status === "fulfilled") next.add(item.value)
      if (signal.aborted || disposed || pending.some((item) => item.status === "rejected")) {
        disposeModel(next)
        if (!signal.aborted && !disposed) throw new Error("Model unavailable")
        return
      }

      clear()
      const centered = new THREE.Group()
      centered.add(next)
      const bounds = new THREE.Box3().setFromObject(next)
      next.position.sub(bounds.getCenter(new THREE.Vector3()))
      if (exhibit.id === "saturn") {
        const size = bounds.getSize(new THREE.Vector3())
        if (size.x > size.y && size.x > size.z) centered.rotation.z = Math.PI / 2
        else if (size.z > size.y) centered.rotation.x = Math.PI / 2
      }
      const sphere = bounds.getBoundingSphere(new THREE.Sphere())
      radius = Math.max(sphere.radius, .001)
      centered.scale.setScalar(1 / radius)
      radius = 1
      direction = (mode === "hero" ? new THREE.Vector3(1.45, .33, 1.05) : new THREE.Vector3(...exhibit.viewingAngle)).normalize()
      model = centered
      scene.add(model)
      fitView()
      render()
    },
    orbit(turn: number, tilt = 0) {
      const spherical = new THREE.Spherical().setFromVector3(camera.position)
      spherical.theta += turn
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + tilt, .08, Math.PI - .08)
      camera.position.setFromSpherical(spherical)
      controls.update()
    },
    zoom(factor: number) {
      const distance = THREE.MathUtils.clamp(camera.position.length() * factor, controls.minDistance, controls.maxDistance)
      camera.position.setLength(distance)
      controls.update()
    },
    spin(spinning: boolean) {
      controls.autoRotate = spinning
      setAnimation()
    },
    reset() {
      fitView()
      render()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      sizing.disconnect()
      visibility.disconnect()
      document.removeEventListener("visibilitychange", setAnimation)
      renderer.domElement.removeEventListener("webglcontextlost", contextLost)
      controls.dispose()
      draco.dispose()
      clear()
      environment.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

export type AirStage = ReturnType<typeof createAirStage>
