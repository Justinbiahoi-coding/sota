"use client"

export function SketchfabStage({
  uid,
  theme,
  loading,
  onReady,
}: {
  uid: string
  theme: "day" | "dusk"
  loading: boolean
  onReady?: () => void
}) {
  const src = `https://sketchfab.com/models/${uid}/embed?autostart=1&preload=1&ui_infos=0&ui_watermark=0&ui_ar=0&ui_theme=${theme === "dusk" ? "dark" : "default"}`
  return (
    <div className="nha-iframe-wrap" aria-busy={loading}>
      {loading && (
        <div className="nha-loader" aria-label="Đang tải mô hình 3D…">
          <span className="nha-loader__ring" />
          <span className="nha-loader__text">Chuẩn bị tiêu bản…</span>
        </div>
      )}
      <iframe
        key={uid}
        src={src}
        title="Mô hình 3D tương tác"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        className="nha-iframe"
        onLoad={onReady}
        style={{ opacity: loading ? 0 : 1 }}
      />
    </div>
  )
}

