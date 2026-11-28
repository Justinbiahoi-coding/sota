"use client"

import { useEffect, useRef, useId } from "react"
import { usePresence } from "framer-motion"

export function SandTransitionImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isPresent, safeToRemove] = usePresence()
  const imgRef    = useRef<HTMLImageElement>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)
  const svgRef    = useRef<SVGSVGElement>(null)
  const reactId   = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const filterRef = useRef<string>(`sand-${reactId}`)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dispRef.current?.setAttribute("scale", "0")
      if (!isPresent) safeToRemove?.()
      return
    }
    const duration = 680
    const start    = performance.now()
    const entering = isPresent

    const tick = (now: number) => {
      const raw = Math.min((now - start) / duration, 1)
      const t   = entering
        ? 1 - Math.pow(1 - raw, 4)
        : Math.pow(raw, 3)

      const svg = svgRef.current
      if (!svg) return

      const turb = svg.querySelector("feTurbulence")
      const disp = svg.querySelector("feDisplacementMap")
      const off  = svg.querySelector("feOffset")
      const blur = svg.querySelector("feGaussianBlur")
      const col  = svg.querySelector("feColorMatrix")

      if (turb) turb.setAttribute("baseFrequency", "1.8")
      if (disp) disp.setAttribute("scale", String(entering ? (1 - t) * 150 : t * 150))
      if (off)  off.setAttribute("dy",  String(entering ? (1 - t) * -80 : t * 120))
      if (off)  off.setAttribute("dx",  String(entering ? (1 - t) * -30 : t * 30))
      if (blur) blur.setAttribute("stdDeviation", String(entering ? (1 - t) * 6 : t * 6))
      if (col)  col.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${entering ? t : 1 - t * 1.2} 0`)

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else if (!entering) {
        safeToRemove?.()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPresent, safeToRemove])

  const id = filterRef.current
  return (
    <>
      <svg ref={svgRef} style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves={4} result="noise" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feOffset dx="0" dy="0" in="displaced" result="offset" />
            <feGaussianBlur in="offset" stdDeviation="0" result="blurred" />
            <feColorMatrix in="blurred" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={className}
        style={{ filter: `url(#${id})` }}
      />
    </>
  )
}

