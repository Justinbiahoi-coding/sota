import qrcode from "qrcode-generator"

export function EntryQr({ value }: { value: string }) {
  const code = qrcode(0, "M")
  code.addData(value)
  code.make()
  const size = code.getModuleCount()
  const modules: string[] = []
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (code.isDark(row, column)) modules.push(`M${column} ${row}h1v1h-1z`)
    }
  }

  return (
    <svg viewBox={`-4 -4 ${size + 8} ${size + 8}`} role="img" aria-label="Mã QR vé tham quan" className="size-36 bg-white" shapeRendering="crispEdges">
      <path d={modules.join("")} fill="#08162b" />
    </svg>
  )
}
