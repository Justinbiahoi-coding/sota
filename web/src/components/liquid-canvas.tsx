"use client"

// Fixed full-page liquid background — rendered once, sits at z-index -1.
// All sections above it are glass panels (very low opacity background).
export function LiquidCanvas() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background: "linear-gradient(160deg, #000913 0%, #010f22 45%, #000913 100%)",
      }}
    >
      <div className="lb lb1" />
      <div className="lb lb2" />
      <div className="lb lb3" />
      <div className="lb lb4" />
      <div className="lb lb5" />
    </div>
  )
}
