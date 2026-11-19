"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ZoomIn } from "lucide-react"

export function ArtifactLightbox({ image, title }: { image: string; title: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="group relative cursor-zoom-in overflow-hidden border border-border bg-muted"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={image}
            alt={title}
            fill
            priority
            className="object-contain"
            sizes="(max-width:1024px) 100vw,70vw"
          />
        </div>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-background/80 px-2 py-1 placard text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-3" /> Phóng to
        </span>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Đóng"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={image}
              alt={title}
              width={1600}
              height={1200}
              className="object-contain max-h-[90vh] w-auto mx-auto"
            />
          </div>
        </div>
      )}
    </>
  )
}

