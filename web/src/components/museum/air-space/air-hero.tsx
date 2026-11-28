"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowUpRight, Box, CalendarDays, Pause, Play, ShoppingBag } from "lucide-react"
import { SandTransitionImage } from "../sand-transition-image"
import { AirHeroModel } from "./hero-model"
import { ExoworldSky } from "./exoworld-sky"
import { airExhibits, AIR_SHOP, AIR_TICKETS, AIR_TOUR } from "./exhibits"
import { StarBorder } from "@/components/reactbits/star-border"

const chapters = [
  { id: "wright", heading: "Chuyến bay đầu tiên", line: "Mười hai giây trên không", image: "first-flight.webp", credit: "John T. Daniels · Library of Congress" },
  { id: "bell-x1", heading: "Vượt tốc độ âm thanh", line: "Mach 1,06", image: "bell-x1-preview.webp", credit: "Smithsonian Open Access · CC0" },
  { id: "eagle", heading: "Đặt chân lên Mặt Trăng", line: "Từ Trái Đất đến Biển Tĩnh Lặng", image: "eagle-return.webp", credit: "NASA · Michael Collins" },
  { id: "shuttle", heading: "Sống và làm việc trên quỹ đạo", line: "Discovery mang Hubble lên quỹ đạo", image: "discovery-preview.webp", credit: "Smithsonian Open Access · CC0" },
  { id: "perseverance", heading: "Lái xe trên Sao Hỏa", line: "Những dấu bánh xe tại Jezero", image: "perseverance-preview.webp", credit: "NASA · Jet Propulsion Laboratory" },
  { id: "webb", heading: "Nhìn xa hơn", line: "Đọc ánh sáng bằng 18 mảnh gương", image: "webb-preview.webp", credit: "NASA · Christopher R. Meaney" },
]

const titles = ["BẢO TÀNG", "HÀNG KHÔNG & VŨ TRỤ"]

export function AirMuseumStory() {
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [film, setFilm] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const chapter = chapters[chapterIndex]
  const exhibit = airExhibits.find(({ id }) => id === chapter.id)!
  const prefersStill = mounted && reducedMotion === true
  const playing = !paused && !prefersStill

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (film) void video.current?.play().catch(() => {})
  }, [film])

  return (
    <div className="flight-page">
      <section className="flight-hero" aria-labelledby="flight-title">
        <div className="flight-blueprint" aria-hidden="true"><span /><span /><span /><i>APOLLO 11 / LM-5</i><b>+</b><b>+</b></div>
        <ExoworldSky lit />
        <AirHeroModel playing={playing} />
        <div className="flight-hero-inner">
          <motion.h1 id="flight-title" initial={false} animate="show" aria-label="Bảo tàng Hàng không & Vũ trụ">
            {titles.map((line, row) => (
              <span className="flight-title-line" key={line} aria-hidden="true">
                {line.split(" ").map((word, wordIndex) => (
                  <span className="flight-title-word" key={wordIndex}>
                    {Array.from(word).map((letter, index) => (
                      <motion.span key={index} className="flight-letter"
                        initial={{ opacity: 0, y: "0.27em" }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: prefersStill ? 0 : .52, delay: prefersStill ? 0 : .11 + row * .2 + wordIndex * .095 + index * .027 }}>
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                ))}
                <span className="flight-title-orbit" aria-hidden="true" />
              </span>
            ))}
          </motion.h1>
          <motion.div className="flight-hero-intro" initial={{opacity:0,y:15}}
            animate={{opacity:1,y:0}} transition={{ delay: prefersStill ? 0 : .28, duration: prefersStill ? 0 : .7 }}>
            <p className="flight-kicker">National Air and Space Museum</p>
            <h2>TỪ ĐƯỜNG BĂNG<br />ĐẾN QUỸ ĐẠO</h2>
            <p>Theo dấu những cỗ máy đã đưa con người từ bãi cát Kitty Hawk đến Mặt Trăng và xa hơn.</p>
            <Link href={AIR_TOUR + "#eagle"} className="flight-button"><Box size={17} /> Tham quan 3D</Link>
          </motion.div>
          <div className="flight-hero-foot">
            <a href="#hanh-trinh"><ArrowDown size={18} /> Khám phá bộ sưu tập</a>
            <button type="button" onClick={() => setPaused(!paused)} disabled={prefersStill}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? "Dừng chuyển động" : "Phát chuyển động"}
            </button>
          </div>
        </div>
        <p className="flight-model-credit">Mô-đun Eagle · Mô hình NASA</p>
      </section>

      <section id="hanh-trinh" className="flight-film">
        <motion.div className="flight-film-copy" initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} transition={{duration: prefersStill ? 0 : .35}} viewport={{once:true}}>
          <p className="flight-kicker">Tư liệu NASA · 16.07.1969</p>
          <h2>Khoảnh khắc <em>rời mặt đất.</em></h2>
          <p>Saturn V đưa ba phi hành gia Apollo 11 lên đường tới Mặt Trăng. Xem lại cảnh phóng, rồi xoay mô hình để quan sát ba tầng đẩy.</p>
          <Link href={AIR_TOUR + "#saturn"} className="flight-button"><Box size={17} /> Xem Saturn V</Link>
        </motion.div>
        <figure className="flight-film-screen">
          {film ? <video ref={video} src="/air-space/apollo-launch.mp4" poster="/air-space/launch-poster.webp" controls playsInline muted aria-label="Phim tư liệu phóng Apollo 11" />
            : <button type="button" aria-label="Phát phim tư liệu Apollo 11" onClick={() => setFilm(true)}>
              <Image src="/air-space/launch-poster.webp" alt="Saturn V trong phim tư liệu Apollo 11" fill sizes="(max-width: 760px) 100vw, 55vw" />
              <span><Play size={20} /> Phát phim tư liệu</span>
            </button>}
          <figcaption><a href="https://science.nasa.gov/resource/apollo-11-launch/">Apollo 11 Launch · NASA</a></figcaption>
        </figure>
      </section>

      <section className="flight-chapters" aria-labelledby="flight-chapter-title">
        <div className="flight-chapter-heading">
          <div><p className="flight-kicker">Hồ sơ chuyến bay</p><h2 id="flight-chapter-title">Những mốc <em>thay đổi bầu trời.</em></h2></div>
          <Link href={AIR_TOUR} className="flight-button flight-button-light">Xem tất cả hiện vật <ArrowUpRight size={17} /></Link>
        </div>
        <div className="flight-chapter-layout">
          <figure className="flight-chapter-art">
            <div>
              <AnimatePresence mode="wait">
                <SandTransitionImage key={chapter.id} src={"/air-space/" + chapter.image} alt={chapter.heading} className="flight-sand-image" />
              </AnimatePresence>
            </div>
            <figcaption>{chapter.credit}</figcaption>
          </figure>
          <div className="flight-chapter-list">
            {chapters.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setChapterIndex(index)} aria-pressed={chapterIndex === index}>
                <span>{String(index + 1).padStart(2, "0")}</span>{item.heading}<ArrowUpRight size={18} />
              </button>
            ))}
            <div className="flight-chapter-text" aria-live="polite">
              <h3>{chapter.line}</h3><p>{exhibit.description}</p>
              <Link href={AIR_TOUR + "#" + chapter.id}>Mở mô hình 3D <ArrowUpRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="flight-visit">
        <div><p className="flight-kicker">National Mall · Washington, D.C.</p><h2>Lên lịch <em>ghé thăm.</em></h2></div>
        <div className="flight-visit-actions">
          <StarBorder as="a" href={AIR_TICKETS}><CalendarDays size={16} /> Đặt vé tham quan</StarBorder>
          <Link className="flight-button" href={AIR_SHOP}><ShoppingBag size={16} /> Quà lưu niệm</Link>
          <a href="https://airandspace.si.edu/visit/museum-dc" className="flight-source-link">Thông tin từ Smithsonian <ArrowUpRight size={16} /></a>
        </div>
      </section>
    </div>
  )
}
