"use client"

import { useState } from "react"
import { ORNAMENT_TOP, ORNAMENT_BOTTOM, ORNAMENT_LEFT, ORNAMENT_RIGHT } from "./ornament-assets"

// Replace with actual Smithsonian YouTube video ID
const VIDEO_ID = "GkjMXcBfFPM"

export function VideoSection() {
  const [playing, setPlaying] = useState(false)

  return (
    <section style={{ backgroundColor: "#1e1b1f", paddingBlock: "0 80px" }}>
      <div style={{ maxWidth: 1200, marginInline: "auto", paddingInline: 32 }}>

        {/* Ornate pixel-art frame — replicates Colosseum's cwf-frame structure */}
        <div style={{ position: "relative" }}>

          {/* Top decorative band — 212×66px tile repeated horizontally */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 66, pointerEvents: "none",
            backgroundImage: `url("${ORNAMENT_TOP}")`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "212px 66px",
          }} />

          {/* Bottom decorative band */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 66, pointerEvents: "none",
            backgroundImage: `url("${ORNAMENT_BOTTOM}")`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "212px 66px",
          }} />

          {/* Left decorative band — 67×214px tile repeated vertically */}
          <div style={{
            position: "absolute", top: 66, bottom: 66, left: 0,
            width: 67, pointerEvents: "none",
            backgroundImage: `url("${ORNAMENT_LEFT}")`,
            backgroundRepeat: "repeat-y",
            backgroundSize: "67px 214px",
          }} />

          {/* Right decorative band */}
          <div style={{
            position: "absolute", top: 66, bottom: 66, right: 0,
            width: 67, pointerEvents: "none",
            backgroundImage: `url("${ORNAMENT_RIGHT}")`,
            backgroundRepeat: "repeat-y",
            backgroundSize: "67px 214px",
          }} />

          {/* Mat — inner padding matches band widths */}
          <div style={{ padding: "66px 67px" }}>
            <div style={{
              border: "2px solid #4a3f6b",
              padding: 4,
              backgroundColor: "#0d0a14",
            }}>
              {/* Video well — 16:9 */}
              <div style={{ position: "relative", aspectRatio: "16 / 9", width: "100%", overflow: "hidden" }}>
                {playing ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                    allow="autoplay; fullscreen"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(true)}
                    aria-label="Xem video giới thiệu Smithsonian"
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      border: "none", padding: 0, cursor: "pointer", background: "none", display: "block",
                    }}
                  >
                    {/* Thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                      alt="Video giới thiệu Smithsonian"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={e => {
                        // fallback to hqdefault if maxresdefault missing
                        const img = e.currentTarget
                        if (!img.src.includes("hqdefault"))
                          img.src = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`
                      }}
                    />

                    {/* Title overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexDirection: "column", gap: 24,
                      background: "rgba(0,0,0,0.35)",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.5rem, 4vw, 3rem)",
                        fontWeight: 400,
                        letterSpacing: "0.08em",
                        color: "#fff",
                        textTransform: "uppercase",
                        textShadow: "0 2px 24px rgba(0,0,0,0.7)",
                      }}>
                        Smithsonian Institution
                      </span>

                      {/* Play circle — bottom-right, same as Colosseum */}
                      <div style={{
                        position: "absolute", bottom: "8%", right: "4%",
                        width: 60, height: 60, borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.88)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                      }}>
                        <svg viewBox="0 0 24 24" fill="#1e1b1f" width={22} height={22}>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
