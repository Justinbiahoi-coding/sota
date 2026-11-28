"use client"

import { useEffect, useRef, useState } from "react"
import type { AirStage } from "./stage"
import { airExhibits } from "./exhibits"

export function AirHeroModel({ playing }: { playing: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<AirStage>()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return
    const abort = new AbortController()
    let viewer: AirStage | undefined
    import("./stage").then(async ({ createAirStage }) => {
      if (abort.signal.aborted) return
      viewer = createAirStage(element, () => setReady(false), "hero")
      const model = airExhibits.find(({ id }) => id === "eagle")!
      await viewer.load(model, abort.signal)
      if (!abort.signal.aborted) {
        setStage(viewer)
        setReady(true)
      }
    }).catch(() => { if (!abort.signal.aborted) setReady(false) })
    return () => {
      abort.abort()
      viewer?.dispose()
    }
  }, [])

  useEffect(() => stage?.spin(playing), [stage, playing])
  return (
    <div className="flight-model" data-ready={ready} aria-hidden="true">
      <div ref={host} className="flight-model-canvas" />
      <div className="flight-model-poster" />
    </div>
  )
}
