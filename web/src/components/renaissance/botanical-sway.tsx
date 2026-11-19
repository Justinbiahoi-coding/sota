"use client"

import React from "react"
import Image from "next/image"

/**
 * Tán lá ô liu / nguyệt quế hoàng kim Phục Hưng nhẹ nhàng phất phơ trong gió (Botanical Branch Sway)
 * Kèm theo mây khắc cổ điển từ bộ tư liệu Intro (/intro/cloud.png)
 */
export function BotanicalSwayDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Mây khắc cổ điển Renaissance (drifting clouds from /intro/cloud.png) */}
      <div className="absolute top-[8%] -left-12 w-96 opacity-15 animate-[float-cloud_60s_linear_infinite]">
        <Image
          src="/intro/cloud.png"
          alt=""
          width={500}
          height={200}
          className="object-contain"
          priority={false}
        />
      </div>

      <div className="absolute top-[35%] -right-16 w-80 opacity-12 animate-[float-cloud-rev_75s_linear_infinite]">
        <Image
          src="/intro/cloud.png"
          alt=""
          width={500}
          height={200}
          className="object-contain scale-x-[-1]"
          priority={false}
        />
      </div>

      {/* 2. Cành lá Nguyệt quế / Ô liu Phục Hưng ở góc trên bên phải (Top-Right Swaying Branch) */}
      <div className="absolute top-0 right-0 w-64 md:w-80 lg:w-96 origin-top-right animate-[gentle-leaf-sway_8s_ease-in-out_infinite] opacity-35 md:opacity-45">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#d4af37]"
        >
          <defs>
            <linearGradient id="goldStem" x1="400" y1="0" x2="100" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8d6718" />
            </linearGradient>
            <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff2b2" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#d4af37" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7a5410" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbe396" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#c59b27" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#63440b" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* Main graceful arching branch stem */}
          <path
            d="M 400 20 C 320 60, 240 140, 160 260 C 130 305, 90 350, 40 380"
            stroke="url(#goldStem)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Secondary delicate twigs */}
          <path
            d="M 280 100 C 230 110, 190 80, 150 70"
            stroke="url(#goldStem)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 210 185 C 160 210, 130 180, 95 195"
            stroke="url(#goldStem)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Elegant Classical Olive/Laurel Leaves along stem */}
          {/* Leaf pair 1 (Top right) */}
          <path
            d="M 360 40 Q 320 20, 290 35 Q 310 65, 360 40 Z"
            fill="url(#leafGrad1)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />
          <path
            d="M 330 65 Q 355 105, 340 130 Q 305 110, 330 65 Z"
            fill="url(#leafGrad2)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />

          {/* Leaf pair 2 (Upper branch) */}
          <path
            d="M 280 100 Q 230 85, 200 95 Q 220 125, 280 100 Z"
            fill="url(#leafGrad1)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />
          <path
            d="M 255 125 Q 260 170, 235 190 Q 220 150, 255 125 Z"
            fill="url(#leafGrad2)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />

          {/* Upper twig leaves */}
          <path
            d="M 210 85 Q 165 60, 130 70 Q 155 100, 210 85 Z"
            fill="url(#leafGrad1)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />
          <path
            d="M 150 70 Q 110 50, 80 60 Q 105 85, 150 70 Z"
            fill="url(#leafGrad2)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />

          {/* Leaf pair 3 (Middle branch) */}
          <path
            d="M 205 190 Q 155 180, 130 205 Q 160 230, 205 190 Z"
            fill="url(#leafGrad1)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />
          <path
            d="M 180 230 Q 170 275, 140 290 Q 135 250, 180 230 Z"
            fill="url(#leafGrad2)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />

          {/* Leaf pair 4 (Lower twig) */}
          <path
            d="M 140 290 Q 95 295, 70 330 Q 105 345, 140 290 Z"
            fill="url(#leafGrad1)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />
          <path
            d="M 100 340 Q 60 350, 30 375 Q 60 395, 100 340 Z"
            fill="url(#leafGrad2)"
            stroke="#b8860b"
            strokeWidth="0.8"
          />
          {/* Tip sprout */}
          <path
            d="M 40 380 Q 10 390, 0 400 Q 25 385, 40 380 Z"
            fill="url(#leafGrad1)"
          />

          {/* Golden berries / dew buds */}
          <circle cx="280" cy="98" r="3.5" fill="#ffd700" stroke="#7a5410" strokeWidth="0.8" />
          <circle cx="210" cy="183" r="3" fill="#ffd700" stroke="#7a5410" strokeWidth="0.8" />
          <circle cx="140" cy="288" r="2.5" fill="#ffd700" stroke="#7a5410" strokeWidth="0.8" />
        </svg>
      </div>

      {/* 3. Cành hoa văn cổ đối xứng ở góc dưới bên trái (Bottom-Left Subtle Flourish) */}
      <div className="absolute bottom-0 left-0 w-48 md:w-64 origin-bottom-left animate-[gentle-leaf-sway-rev_10s_ease-in-out_infinite] opacity-25 md:opacity-35">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#d4af37]"
        >
          <path
            d="M 0 300 C 60 250, 120 200, 190 140 C 230 100, 260 50, 280 0"
            stroke="url(#goldStem)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 80 230 Q 120 215, 145 235 Q 115 255, 80 230 Z"
            fill="url(#leafGrad1)"
            stroke="#b8860b"
            strokeWidth="0.6"
          />
          <path
            d="M 140 180 Q 185 160, 205 185 Q 175 210, 140 180 Z"
            fill="url(#leafGrad2)"
            stroke="#b8860b"
            strokeWidth="0.6"
          />
          <path
            d="M 210 115 Q 250 95, 275 120 Q 245 140, 210 115 Z"
            fill="url(#leafGrad1)"
            stroke="#b8860b"
            strokeWidth="0.6"
          />
        </svg>
      </div>
    </div>
  )
}

