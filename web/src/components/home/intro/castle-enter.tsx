"use client"

import { useRef, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Hall } from "./hall"

// After "Khám phá": the run across the Mall ends in front of the Castle's door (the facade photo),
// the door swings open and the camera goes through into the hall.
const FACADE = "/intro/castle.webp" // 2560×1280
const DOOR = { x: 45.2, y: 67.5, w: 6.8, h: 23 } // the arched entrance, in % of the photo

export function CastleEnter({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [hall, setHall] = useState(false)

  useGSAP(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".facade-wrap", { autoAlpha: 0 })
      setHall(true)
      return
    }
    // the photo box is the cover-fit of a 2:1 image; the door must end up in the middle of the screen
    const bw = Math.max(innerWidth, innerHeight * 2), bh = bw / 2
    const dx = innerWidth / 2 - ((innerWidth - bw) / 2 + (bw * DOOR.x) / 100)
    const dy = innerHeight / 2 - ((innerHeight - bh) / 2 + (bh * DOOR.y) / 100)
    gsap.timeline()
      .fromTo(".flash", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 0)
      .fromTo(".facade", { scale: 1.28, xPercent: -50, yPercent: -50 }, { scale: 1, duration: 1.8, ease: "power3.out" }, 0)
      .to(".facade", { scale: 9, x: dx, y: dy, duration: 2.6, ease: "power2.in", transformOrigin: `${DOOR.x}% ${DOOR.y}%` }, 1.6)
      .to(".door-l", { rotationY: -108, duration: 1.7, ease: "power2.inOut" }, 2.2)
      .to(".door-r", { rotationY: 108, duration: 1.7, ease: "power2.inOut" }, 2.2)
      .call(() => setHall(true), [], 2.7)
      .to(".facade-wrap", { autoAlpha: 0, duration: 0.9, ease: "power2.inOut" }, 3.5)
  }, { scope: root })

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden bg-[#f2ede5]">
      {hall && <Hall onDone={onDone} />}
      <div className="facade-wrap absolute inset-0 overflow-hidden bg-[#1c1a17]">
        <div className="facade absolute left-1/2 top-1/2 will-change-transform" style={{ width: "max(100vw, 200vh)", aspectRatio: "2 / 1" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FACADE} alt="" className="absolute inset-0 size-full" draggable={false} />
          <div
            className="absolute overflow-hidden"
            style={{
              left: `${DOOR.x - DOOR.w / 2}%`, top: `${DOOR.y - DOOR.h / 2}%`, width: `${DOOR.w}%`, height: `${DOOR.h}%`,
              borderRadius: "50% 50% 0 0 / 32% 32% 0 0", perspective: 180,
              background: "radial-gradient(ellipse at 50% 40%, #fff7e6 0%, #f0dfc0 45%, #c9a66e 100%)",
            }}
          >
            <div className="door-l absolute inset-y-0 left-0 w-1/2 origin-left bg-[#3a2416] shadow-[inset_-6px_0_14px_rgb(0_0_0/0.6)]" />
            <div className="door-r absolute inset-y-0 right-0 w-1/2 origin-right bg-[#3a2416] shadow-[inset_6px_0_14px_rgb(0_0_0/0.6)]" />
          </div>
        </div>
      </div>
      <div className="flash pointer-events-none absolute inset-0 bg-white" />
    </div>
  )
}
