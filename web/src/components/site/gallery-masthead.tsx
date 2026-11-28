import Image from "next/image"
import type { ReactNode } from "react"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"

export function GalleryMasthead({
  label,
  title,
  description,
  image,
  children,
}: {
  label: string
  title: ReactNode
  description?: string
  image?: string
  children?: ReactNode
}) {
  return (
    <header className="gallery-masthead">
      <div className="gallery-wrap gallery-masthead-grid">
        <div className="gallery-enter">
          <p className="gallery-kicker">{label}</p>
          <h1 className="gallery-title">{title}</h1>
          {description && <p className="gallery-lead">{description}</p>}
          {children}
        </div>
        {image && (
          <div className="gallery-masthead-art gallery-enter" aria-hidden="true">
            <div>
              <Image src={image} alt="" fill sizes="(max-width: 767px) 86vw, 420px" priority />
            </div>
            <RenaissanceCorners />
          </div>
        )}
      </div>
    </header>
  )
}
