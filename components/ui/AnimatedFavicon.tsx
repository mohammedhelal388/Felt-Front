'use client'
import { useEffect } from 'react'

// Animated favicon: one glowing sparkle breathes in the center, then
// the "felt." wordmark fades in to replace it, holds, fades back out
// to the sparkle, looping continuously.
//
// Note: browsers throttle/pause requestAnimationFrame and setTimeout
// in background tabs to save battery — this is intentional browser
// behavior we can't fully override. We use the Page Visibility API to
// pick up cleanly where we left off (or settle on a calm resting frame)
// the moment the tab becomes active again, so it never looks "stuck"
// or broken when you return to it.
export default function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const DPR = 2
    canvas.width = 64 * DPR
    canvas.height = 64 * DPR
    const ctx = canvas.getContext('2d')!
    ctx.scale(DPR, DPR)

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    const drawBackground = () => {
      const r = 14
      ctx.fillStyle = '#060d08'
      ctx.beginPath()
      ctx.moveTo(r, 0)
      ctx.arcTo(64, 0, 64, 64, r)
      ctx.arcTo(64, 64, 0, 64, r)
      ctx.arcTo(0, 64, 0, 0, r)
      ctx.arcTo(0, 0, 64, 0, r)
      ctx.closePath()
      ctx.fill()
    }

    const drawSparkle = (alpha: number, growth: number) => {
      if (alpha <= 0) return
      const cx = 32, cy = 32
      const size = 4 + growth * 7

      ctx.save()
      ctx.globalAlpha = alpha

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 3)
      glow.addColorStop(0, 'rgba(255,232,160,0.55)')
      glow.addColorStop(1, 'rgba(255,232,160,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, size * 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffe8a0'
      ctx.shadowColor = '#ffe8a0'
      ctx.shadowBlur = size
      ctx.beginPath()
      ctx.moveTo(cx, cy - size * 2.2)
      ctx.lineTo(cx + size * 0.5, cy - size * 0.5)
      ctx.lineTo(cx + size * 2.2, cy)
      ctx.lineTo(cx + size * 0.5, cy + size * 0.5)
      ctx.lineTo(cx, cy + size * 2.2)
      ctx.lineTo(cx - size * 0.5, cy + size * 0.5)
      ctx.lineTo(cx - size * 2.2, cy)
      ctx.lineTo(cx - size * 0.5, cy - size * 0.5)
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.fillStyle = '#fffbe8'
      ctx.beginPath()
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawWordmark = (alpha: number) => {
      if (alpha <= 0) return
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#c8975a'
      ctx.font = "italic 28px Georgia, 'Playfair Display', serif"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(200,151,90,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText('felt.', 32, 34)
      ctx.restore()
    }

    const SPARKLE_GROW = 18
    const SPARKLE_HOLD = 14
    const CROSSFADE_1 = 16
    const WORD_HOLD = 36
    const CROSSFADE_2 = 16
    const TOTAL = SPARKLE_GROW + SPARKLE_HOLD + CROSSFADE_1 + WORD_HOLD + CROSSFADE_2

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 2)

    let frame = 0
    let raf: any
    let timer: any

    const renderFrame = (f: number) => {
      ctx.clearRect(0, 0, 64, 64)
      drawBackground()

      let sparkleAlpha = 0, growth = 1, wordAlpha = 0

      if (f < SPARKLE_GROW) {
        const p = f / SPARKLE_GROW
        sparkleAlpha = easeOut(p)
        growth = easeOut(p)
      } else if (f < SPARKLE_GROW + SPARKLE_HOLD) {
        sparkleAlpha = 1; growth = 1
      } else if (f < SPARKLE_GROW + SPARKLE_HOLD + CROSSFADE_1) {
        const p = (f - SPARKLE_GROW - SPARKLE_HOLD) / CROSSFADE_1
        sparkleAlpha = 1 - p
        growth = 1
        wordAlpha = p
      } else if (f < SPARKLE_GROW + SPARKLE_HOLD + CROSSFADE_1 + WORD_HOLD) {
        wordAlpha = 1
      } else {
        const p = (f - (SPARKLE_GROW + SPARKLE_HOLD + CROSSFADE_1 + WORD_HOLD)) / CROSSFADE_2
        wordAlpha = 1 - p
        sparkleAlpha = p
        growth = p
      }

      drawSparkle(sparkleAlpha, growth)
      drawWordmark(wordAlpha)
      link.href = canvas.toDataURL('image/png')
    }

    const tick = () => {
      renderFrame(frame % TOTAL)
      frame += 1
      timer = setTimeout(() => { raf = requestAnimationFrame(tick) }, 60)
    }

    // Pause the loop entirely while the tab is hidden — there's no
    // point burning CPU on an icon nobody can see, and it avoids any
    // jumpy "catch-up" behavior. On return, just resume from where we
    // left off (frame count is preserved, not reset).
    const handleVisibility = () => {
      if (document.hidden) {
        clearTimeout(timer)
        cancelAnimationFrame(raf)
      } else {
        tick()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    tick()

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return null
}