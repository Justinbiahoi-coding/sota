"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { ArrowLeft, ArrowRight, ArrowUpRight, Box, Expand, Shrink, Moon, Sun, Orbit, Plane, Rocket, Telescope, Satellite, Landmark, Search, Minus, Plus, RotateCcw, RotateCw, Pause, Play } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { SketchfabStage } from "../sketchfab-stage"
import { airExhibits, airCategories, AIR_MUSEUM, AIR_TOUR, type AirExhibit } from "./exhibits"
import type { AirStage } from "./stage"

type Status = { id: string; state: "loading" | "ready" | "error" }

function ModelViewer({ exhibit, closeup }: { exhibit: AirExhibit; closeup: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<AirStage>()
  const [status, setStatus] = useState<Status>()
  const [unsupported, setUnsupported] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const state = unsupported ? "error" : status?.id === exhibit.id ? status.state : "loading"
  const ready = state === "ready"

  useEffect(() => {
    const mount = host.current
    if (!mount) return
    let live = true
    let current: AirStage | undefined
    import("./stage").then(({ createAirStage }) => {
      if (!live) return
      current = createAirStage(mount, () => { if (live) setUnsupported(true) })
      setStage(current)
    }).catch(() => { if (live) setUnsupported(true) })

    return () => {
      live = false
      current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (!stage) return
    const abort = new AbortController()
    stage.load(exhibit, abort.signal).then(() => {
      if (!abort.signal.aborted) setStatus({ id: exhibit.id, state: "ready" })
    }).catch(() => {
      if (!abort.signal.aborted) setStatus({ id: exhibit.id, state: "error" })
    })
    return () => abort.abort()
  }, [stage, exhibit, attempt])

  useEffect(() => { stage?.spin(ready && spinning) }, [stage, ready, spinning])

  useEffect(() => {
    if (ready) {
      stage?.reset()
      if (closeup) stage?.zoom(.65)
    }
  }, [stage, ready, closeup])

  function keyControls(event: KeyboardEvent<HTMLDivElement>) {
    if (!ready || !stage || event.target !== event.currentTarget) return
    switch (event.key) {
      case "ArrowLeft": stage.orbit(.23); break
      case "ArrowRight": stage.orbit(-.23); break
      case "ArrowUp": stage.orbit(0, -.19); break
      case "ArrowDown": stage.orbit(0, .19); break
      case "+": case "=": stage.zoom(.84); break
      case "-": stage.zoom(1.19); break
      case "Home": stage.reset(); break
      default: return
    }
    event.preventDefault()
  }

  return (
    <div className="air-viewer flight-local-viewer" data-renderer={state}>
      <div ref={host} className="air-canvas" tabIndex={ready ? 0 : -1} role="group"
        aria-label={"Điều khiển mô hình " + exhibit.name} aria-describedby="air-viewer-help" onKeyDown={keyControls} />
      {!ready && (
        <div className="air-viewer-fallback">
          <div><Image src={exhibit.image} alt={exhibit.imageAlt} fill sizes="(max-width: 780px) 90vw, 55vw" /></div>
          {state === "loading"
            ? <p role="status">Đang chuẩn bị mô hình…</p>
            : <div><p role="status">{unsupported ? "Thiết bị hiện không mở được chế độ 3D." : "Chưa tải được mô hình 3D."}</p>
              {!unsupported && <button type="button" className="air-inline" onClick={() => {
                setStatus({ id: exhibit.id, state: "loading" })
                setAttempt(attempt + 1)
              }}>Tải lại mô hình</button>}</div>}
        </div>
      )}
      <div className="air-viewer-label"><Box size={15} aria-hidden="true" /> {exhibit.name}</div>
      <div className="air-viewer-footer">
        <p id="air-viewer-help">Kéo để xoay. Dùng phím mũi tên hoặc các nút điều khiển.</p>
        <div className="air-model-tools" aria-label="Công cụ mô hình">
          <button type="button" aria-label="Xoay trái" title="Xoay trái" disabled={!ready} onClick={() => stage?.orbit(.28)}><RotateCcw size={17} /></button>
          <button type="button" aria-label="Xoay phải" title="Xoay phải" disabled={!ready} onClick={() => stage?.orbit(-.28)}><RotateCw size={17} /></button>
          <button type="button" aria-label="Thu nhỏ" title="Thu nhỏ" disabled={!ready} onClick={() => stage?.zoom(1.2)}><Minus size={17} /></button>
          <button type="button" aria-label="Phóng to" title="Phóng to" disabled={!ready} onClick={() => stage?.zoom(.83)}><Plus size={17} /></button>
          <button type="button" aria-label="Đặt lại góc nhìn" title="Đặt lại góc nhìn" disabled={!ready} onClick={() => { setSpinning(false); stage?.reset() }}><Box size={17} /></button>
          <button type="button" aria-label="Tự xoay" title={spinning ? "Dừng tự xoay" : "Tự xoay"} aria-pressed={spinning} disabled={!ready} onClick={() => setSpinning(!spinning)}>
            {spinning ? <Pause size={17} /> : <Play size={17} />}
          </button>
        </div>
      </div>
    </div>
  )
}


const categoryIcons = [Plane, Rocket, Orbit, Satellite, Telescope]
const eras = [
  { id: "pioneers", label: "Tiên phong", range: "1903–1964", match: (year: number) => year < 1965 },
  { id: "space-age", label: "Kỷ nguyên vũ trụ", range: "1965–1979", match: (year: number) => year >= 1965 && year < 1980 },
  { id: "orbit", label: "Trên quỹ đạo", range: "1980–2000", match: (year: number) => year >= 1980 && year <= 2000 },
  { id: "recent", label: "Thế kỷ XXI", range: "2001–nay", match: (year: number) => year > 2000 },
]

export function AirModelGallery() {
  const [selected, setSelected] = useState(airExhibits[0].id)
  const [category, setCategory] = useState("")
  const [era, setEra] = useState("")
  const [theme, setTheme] = useState<"day" | "dusk">("day")
  const [expanded, setExpanded] = useState(false)
  const [archiveView, setArchiveView] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [closeup, setCloseup] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const tablist = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const matched = airExhibits.filter((item) => (!category || item.category === category) && (!era || eras.find(({ id }) => id === era)?.match(item.year)))
  const active = matched.find(({ id }) => id === selected) ?? matched[0]
  const activeEra = active ? eras.find(({ match }) => match(active.year)) : undefined

  useEffect(() => {
    function fromHash() {
      const next = airExhibits.find(({ id }) => id === window.location.hash.slice(1))
      if (next) {
        setCategory("")
        setEra("")
        setSelected(next.id)
        setArchiveView(false)
        setCloseup(false)
      }
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    window.addEventListener("popstate", fromHash)
    return () => {
      window.removeEventListener("hashchange", fromHash)
      window.removeEventListener("popstate", fromHash)
    }
  }, [])

  useEffect(() => {
    const button = tablist.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
    const rail = tablist.current
    if (button && rail) {
      rail.scrollLeft += button.getBoundingClientRect().left - rail.getBoundingClientRect().left - (rail.clientWidth - button.clientWidth) / 2
    }
  }, [active?.id])

  function select(item: AirExhibit) {
    setSelected(item.id)
    setArchiveView(false)
    setCloseup(false)
    history.replaceState(history.state, "", AIR_TOUR + "#" + item.id)
  }

  function filter(nextCategory: string, nextEra: string) {
    setCategory(nextCategory)
    setEra(nextEra)
    setArchiveView(false)
    setCloseup(false)
    const next = airExhibits.find((item) => (!nextCategory || item.category === nextCategory) && (!nextEra || eras.find(({ id }) => id === nextEra)?.match(item.year)))
    if (next) select(next)
    else history.replaceState(history.state, "", AIR_TOUR)
  }

  function tabKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!active || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const current = matched.indexOf(active)
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? matched.length - 1 :
      (current + (event.key === "ArrowLeft" ? -1 : 1) + matched.length) % matched.length
    select(matched[nextIndex])
    tablist.current?.querySelectorAll("button")[nextIndex]?.focus()
  }

  return (
    <div className={"nha-hero flight-tour" + (expanded ? " is-expanded" : "") + (filtersOpen ? " filters-open" : "")}
      data-theme={theme} onKeyDown={(event) => { if (event.key === "Escape") setExpanded(false) }}>
      {airExhibits.map(({ id }) => <span key={id} id={id} className="nha-exhibit-anchor" aria-hidden="true" />)}
      <aside className="nha-sidebar">
        <Link href={AIR_MUSEUM} className="nha-brand"><Landmark size={18} /> <span>Hàng không &amp; Vũ trụ</span></Link>
        <nav className="nha-cat-nav" aria-label="Phân loại hiện vật">
          <button type="button" className={"nha-cat-btn" + (!category ? " is-active" : "")} aria-pressed={!category}
            onClick={() => filter("", "")}><Box size={17} /> Tất cả</button>
          {airCategories.map((item, index) => {
            const Icon = categoryIcons[index]
            return <button key={item} type="button" className={"nha-cat-btn" + (category === item ? " is-active" : "")}
              aria-pressed={category === item} onClick={() => filter(item, "")}><Icon size={17} /> {item}</button>
          })}
        </nav>
        <div className="nha-era-legend">
          <p className="nha-sidebar__label">Giai đoạn</p>
          {eras.map((item) => (
            <button type="button" className="nha-era-row flight-era-row" key={item.id} aria-pressed={era === item.id}
              onClick={() => filter(category, era === item.id ? "" : item.id)}>
              <span className="nha-era-dot" /> <span>{item.label}</span><span className="nha-era-en">{item.range}</span>
            </button>
          ))}
        </div>
        {active && <div className="nha-featured-card">
          <p className="nha-featured-card__eyebrow">HIỆN VẬT ĐANG XEM</p>
          <Image src={active.image} alt="" width={150} height={75} className="nha-featured-card__img" />
          <p className="nha-featured-card__title">{active.name}</p>
          <p className="nha-featured-card__text">{activeEra?.label}</p>
        </div>}
        <Link href={"/tim-kiem?category=artifacts&museum=hang-khong-vu-tru"} className="flight-sidebar-search"><Search size={16} /> Tra cứu hiện vật</Link>
      </aside>

      <section className="nha-center" aria-label="Phòng mô hình 3D">
        <div className="flight-tour-mobile">
          <Link href={AIR_MUSEUM}><ArrowLeft size={16} /> Bảo tàng</Link>
          <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? "Ẩn bộ lọc" : "Lọc hiện vật"}</button>
        </div>
        <div ref={tablist} className="nha-tabs" role="tablist" aria-label="Chọn mô hình" onKeyDown={tabKeys}>
          {matched.map((item) => (
            <button key={item.id} id={"flight-tab-" + item.id} type="button" role="tab" aria-controls="flight-stage"
              aria-selected={item.id === active?.id} tabIndex={item.id === active?.id ? 0 : -1}
              className={"nha-tab" + (item.id === active?.id ? " is-active" : "")} onClick={() => select(item)}>
              <Image src={item.image} alt="" width={58} height={42} className="nha-tab__img" />
              <span className="nha-tab__name">{item.name}</span>
              <span className="nha-tab__latin">{item.category} · {item.year}</span>
            </button>
          ))}
        </div>
        {active ? (
          <div id="flight-stage" className="nha-stage flight-tour-stage" role="tabpanel" aria-labelledby={"flight-tab-" + active.id}>
            {archiveView && active.sketchfab
              ? <SketchfabStage key={active.id + theme} uid={active.sketchfab} theme={theme} loading={iframeLoading} onReady={() => setIframeLoading(false)} />
              : <ModelViewer exhibit={active} closeup={closeup} />}
            <div className="nha-rail">
              <button type="button" className="nha-rail-btn" aria-pressed={expanded} aria-label={expanded ? "Thu nhỏ khung xem" : "Mở rộng khung xem"} onClick={() => setExpanded(!expanded)}>
                {expanded ? <Shrink size={17} /> : <Expand size={17} />}
              </button>
              <button type="button" className="nha-rail-btn" aria-pressed={theme === "dusk"} aria-label={theme === "day" ? "Chế độ tối" : "Chế độ sáng"} onClick={() => {
                if (archiveView) setIframeLoading(true)
                setTheme(theme === "day" ? "dusk" : "day")
              }}>{theme === "day" ? <Moon size={17} /> : <Sun size={17} />}</button>
              {active.sketchfab && <button type="button" className="nha-rail-btn" aria-label={archiveView ? "Mở mô hình nội bộ" : "Mở bản Smithsonian trên Sketchfab"}
                title={archiveView ? "Mô hình nội bộ" : "Bản Smithsonian trên Sketchfab"} aria-pressed={archiveView} onClick={() => {
                  setIframeLoading(true)
                  setArchiveView(!archiveView)
                }}><Box size={17} /></button>}
            </div>
            <p className="nha-caption">{active.credit}</p>
          </div>
        ) : (
          <div className="flight-tour-empty"><p>Không có hiện vật trong nhóm này.</p><button type="button" onClick={() => filter("", "")}>Xóa bộ lọc</button></div>
        )}
      </section>

      <section className="nha-right" aria-label="Hồ sơ hiện vật">
        {active && <div className="nha-detail-card">
          <motion.article key={active.id} className="nha-detail" initial={{opacity:0,y:10}}
            animate={{opacity:1,y:0}} transition={{duration:reducedMotion ? 0 : .35}} aria-live="polite">
            <p className="nha-detail__eyebrow">{active.category} · {active.year}</p>
            <h1 className="nha-detail__name">{active.name}</h1>
            <div className="nha-detail__tags"><span className="nha-chip">Mô hình 3D</span><span className="nha-chip">{activeEra?.label}</span></div>
            <p className="nha-detail__desc">{active.description}</p>
            <h2 className="nha-detail__h2">Đặc điểm nổi bật</h2>
            <dl className="nha-traits">
              {active.facts.map(({ label, value }) => <div className="nha-trait" key={label}><Orbit size={16}/><dt className="nha-trait__label">{label}</dt><dd className="nha-trait__val">{value}</dd></div>)}
            </dl>
            <h2 className="nha-detail__h2">Nguồn mô hình</h2>
            <a className="flight-source-link" href={active.source}>{active.credit} <ArrowUpRight size={15} /></a>
            <button type="button" className="nha-closeup-btn" aria-pressed={closeup && !archiveView} onClick={() => {
              setArchiveView(false)
              setCloseup(archiveView || !closeup)
            }}>
              <div className="nha-closeup-btn__lens" style={{backgroundImage:"url(" + active.image + ")"}} />
              <span className="nha-closeup-btn__body"><span className="nha-closeup-btn__title">Chi tiết cận cảnh</span><span className="nha-closeup-btn__sub">Đưa mô hình tới gần để quan sát.</span></span>
              <ArrowRight size={16}/>
            </button>
          </motion.article>
        </div>}
      </section>
    </div>
  )
}
