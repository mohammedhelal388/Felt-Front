'use client'
import { useEffect, useRef } from 'react'

export default function LivingBookScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    let t = 0
    let bookOpen = 0
    let bookTarget = 0

    // Load the real Turkey photo
    const photo = new Image()
    photo.src = '/oldniz.webp'

    const paragliders = [
      { x: 0.28, y: 0.42, dx: 0.00035, w: 22, color: '#ff6820', wingColor: '#ff8840' },
      { x: 0.58, y: 0.32, dx: 0.00025, w: 16, color: '#c8975a', wingColor: '#e8b070' },
      { x: 0.78, y: 0.5,  dx:-0.0003,  w: 13, color: '#ffffff', wingColor: '#e8eeff' },
    ]

    const birds = Array.from({ length: 8 }, () => ({
      x: Math.random(),
      y: 0.08 + Math.random() * 0.25,
      dx: (0.0003 + Math.random() * 0.0004) * (Math.random() > 0.5 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
    }))

    // Light shimmer points on the lagoon
    const shimmers = Array.from({ length: 12 }, (_, i) => ({
      x: 0.3 + Math.random() * 0.35,
      y: 0.58 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      size: 3 + Math.random() * 8,
    }))

    function drawRightPage(bx: number, by: number, bw: number, bh: number) {
      ctx.save()
      // clip to page shape
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, bh, [0, 4, 4, 0])
      ctx.clip()

      // photo background
      if (photo.complete && photo.naturalWidth > 0) {
        // fit photo into page — crop center
        const photoAspect = photo.naturalWidth / photo.naturalHeight
        const pageAspect = bw / bh
        let sx = 0, sy = 0, sw = photo.naturalWidth, sh = photo.naturalHeight
        if (photoAspect > pageAspect) {
          // photo wider — crop sides
          sw = photo.naturalHeight * pageAspect
          sx = (photo.naturalWidth - sw) / 2
        } else {
          sh = photo.naturalWidth / pageAspect
          sy = (photo.naturalHeight - sh) / 2
        }
        ctx.drawImage(photo, sx, sy, sw, sh, bx, by, bw, bh)
      } else {
        // fallback while loading
        const grad = ctx.createLinearGradient(bx, by, bx, by + bh)
        grad.addColorStop(0, '#1a4a8a')
        grad.addColorStop(0.5, '#2a7a3a')
        grad.addColorStop(1, '#1a6aaa')
        ctx.fillStyle = grad
        ctx.fillRect(bx, by, bw, bh)
      }

      // subtle vignette to make overlay elements pop
      const vig = ctx.createRadialGradient(bx+bw*0.5, by+bh*0.5, bh*0.1, bx+bw*0.5, by+bh*0.5, bh*0.8)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.35)')
      ctx.fillStyle = vig
      ctx.fillRect(bx, by, bw, bh)

      // water shimmer on the lagoon (bottom-center area of photo)
      shimmers.forEach(s => {
        const sx2 = bx + s.x * bw
        const sy2 = by + s.y * bh
        const alpha = 0.3 + 0.4 * Math.sin(t * 2 + s.phase)
        const size = s.size * (0.7 + 0.3 * Math.sin(t * 1.5 + s.phase * 0.7))
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.ellipse(sx2, sy2, size, size * 0.3, t * 0.1 + s.phase, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // animated paragliders
      paragliders.forEach(p => {
        const px = bx + p.x * bw
        const py = by + p.y * bh
        const pw = p.w * (bw / 320)

        // wing
        ctx.save()
        ctx.fillStyle = p.wingColor
        ctx.globalAlpha = 0.92
        ctx.beginPath()
        ctx.ellipse(px, py, pw, pw * 0.28, 0, 0, Math.PI * 2)
        ctx.fill()

        // wing segments
        ctx.strokeStyle = p.color
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.5
        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.moveTo(px - pw + i * (pw * 0.5), py)
          ctx.lineTo(px - pw * 0.2 + i * (pw * 0.35), py + pw * 0.7)
          ctx.stroke()
        }

        // lines to harness
        ctx.globalAlpha = 0.7
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(px - pw * 0.4, py + pw * 0.2)
        ctx.lineTo(px, py + pw * 0.85)
        ctx.moveTo(px + pw * 0.4, py + pw * 0.2)
        ctx.lineTo(px, py + pw * 0.85)
        ctx.stroke()

        // pilot
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.95
        ctx.beginPath()
        ctx.ellipse(px, py + pw * 0.7, pw * 0.18, pw * 0.3, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px, py + pw * 0.45, pw * 0.16, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // birds
      birds.forEach(b => {
        const bx2 = bx + b.x * bw
        const by2 = by + b.y * bh
        const flap = Math.sin(t * 3.5 + b.phase) * 0.5
        ctx.save()
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(bx2 - 4, by2)
        ctx.quadraticCurveTo(bx2 - 1, by2 - 3 - flap * 4, bx2, by2)
        ctx.moveTo(bx2, by2)
        ctx.quadraticCurveTo(bx2 + 1, by2 - 3 - flap * 4, bx2 + 4, by2)
        ctx.stroke()
        ctx.restore()
      })

      // page caption overlay at bottom
      ctx.save()
      const capGrad = ctx.createLinearGradient(bx, by+bh-40, bx, by+bh)
      capGrad.addColorStop(0, 'rgba(0,0,0,0)')
      capGrad.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = capGrad
      ctx.fillRect(bx, by+bh-40, bw, 40)
      ctx.fillStyle = 'rgba(200,151,90,0.85)'
      ctx.font = `italic ${Math.round(8 * (bw/200))}px Georgia, serif`
      ctx.textAlign = 'center'
      ctx.fillText('Ölüdeniz, Turkey', bx + bw*0.5, by + bh - 10)
      ctx.fillStyle = 'rgba(200,180,140,0.5)'
      ctx.font = `italic 8px Georgia, serif`
      ctx.fillText('42', bx + bw*0.5, by + bh - 10)
      ctx.restore()

      ctx.restore()
    }

    function drawLeftPage(bx: number, by: number, bw: number, bh: number) {
      ctx.save()
      ctx.globalAlpha = bookOpen
      const lg = ctx.createLinearGradient(bx, by, bx + bw, by)
      lg.addColorStop(0, '#f8f3ea')
      lg.addColorStop(1, '#ede5d5')
      ctx.fillStyle = lg
      ctx.shadowColor = 'rgba(0,0,0,0.12)'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, bh, [4, 0, 0, 4])
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.globalAlpha = bookOpen * 0.9
      const cx = bx + bw * 0.5
      ctx.textAlign = 'center'

      ctx.fillStyle = '#c8975a'
      ctx.font = `italic ${Math.round(9 * bookOpen)}px Georgia, serif`
      ctx.fillText('Chapter III', cx, by + 26)

      ctx.fillStyle = '#5a3a20'
      ctx.font = `bold italic ${Math.round(12 * bookOpen)}px Georgia, serif`
      ctx.fillText('The Mountain', cx, by + 46)

      ctx.fillStyle = '#8a7055'
      ctx.font = `italic ${Math.round(8.5 * bookOpen)}px Georgia, serif`
      const lines = [
        'Some places make you miss',
        "people you haven't lost yet.",
        '',
        'The light held gold',
        'and so did you.',
        '',
        'You stood at the edge',
        'of everything and felt',
        'exactly right.',
        '',
        'That feeling lives here now.',
        'Touch it. Remember.',
      ]
      lines.forEach((line, i) => {
        if (line) ctx.fillText(line, cx, by + 66 + i * 11.5 * bookOpen)
      })

      ctx.fillStyle = '#c8975a'
      ctx.font = `${Math.round(13 * bookOpen)}px Georgia`
      ctx.fillText('✦', cx, by + bh - 16)
      ctx.fillStyle = 'rgba(180,150,100,0.45)'
      ctx.font = `italic 8px Georgia`
      ctx.fillText('41', cx, by + bh - 7)
      ctx.restore()
    }

    function drawSpine(bx: number, by: number, sw: number, bh: number) {
      ctx.save()
      ctx.globalAlpha = bookOpen
      const sg = ctx.createLinearGradient(bx, by, bx + sw, by)
      sg.addColorStop(0, '#5a3a18')
      sg.addColorStop(0.5, '#c8975a')
      sg.addColorStop(1, '#5a3a18')
      ctx.fillStyle = sg
      ctx.fillRect(bx, by, sw, bh)
      ctx.restore()
    }

    function drawBookShadow() {
      ctx.save()
      ctx.globalAlpha = 0.3 * bookOpen
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(W * 0.5, H - 6, W * 0.42 * bookOpen, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawClosedBook() {
      const alpha = Math.max(0, 1 - bookOpen * 2.8)
      if (alpha < 0.01) return
      const bw = W * 0.52, bh = H * 0.68
      const bx = (W - bw) / 2, by = (H - bh) / 2

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 20
      const cg = ctx.createLinearGradient(bx, by, bx + bw, by + bh)
      cg.addColorStop(0, '#3a2818')
      cg.addColorStop(0.3, '#5a3f22')
      cg.addColorStop(1, '#2a1e10')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, bh, 6)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.strokeStyle = 'rgba(200,151,90,0.35)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(bx + bw * 0.1, by + 12)
      ctx.lineTo(bx + bw * 0.1, by + bh - 12)
      ctx.stroke()

      ctx.fillStyle = '#c8975a'
      ctx.font = `italic bold ${bw * 0.12}px 'Playfair Display', Georgia, serif`
      ctx.textAlign = 'center'
      ctx.fillText('Felt', bx + bw * 0.55, by + bh * 0.38)
      ctx.font = `italic ${bw * 0.056}px Georgia, serif`
      ctx.fillStyle = 'rgba(200,151,90,0.65)'
      ctx.fillText('A Living Memory', bx + bw * 0.55, by + bh * 0.5)
      ctx.font = `${bw * 0.085}px Georgia`
      ctx.fillStyle = 'rgba(200,151,90,0.4)'
      ctx.fillText('✦', bx + bw * 0.55, by + bh * 0.66)
      ctx.restore()

      const pulse = 0.4 + 0.4 * Math.sin(t * 1.8)
      ctx.save()
      ctx.globalAlpha = alpha * pulse
      ctx.fillStyle = '#c8975a'
      ctx.font = 'italic 11px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText('click to open', W * 0.5, H * 0.88)
      ctx.restore()
    }

    function update() {
      paragliders.forEach(p => {
        p.x += p.dx
        if (p.x > 1.1) p.x = -0.1
        if (p.x < -0.1) p.x = 1.1
      })
      birds.forEach(b => {
        b.x += b.dx
        if (b.x > 1.1) b.x = -0.1
        if (b.x < -0.1) b.x = 1.1
      })
      bookOpen += (bookTarget - bookOpen) * 0.035
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#060d08'
      ctx.fillRect(0, 0, W, H)

      if (bookOpen > 0.02) {
        const margin = 14
        const bx = margin, by = margin
        const bw = W - margin * 2, bh = H - margin * 2
        const half = bw * 0.47
        const spineW = bw * 0.04

        drawBookShadow()
        drawLeftPage(bx, by, half, bh)
        drawSpine(bx + half, by, spineW, bh)

        ctx.save()
        ctx.globalAlpha = bookOpen
        drawRightPage(bx + half + spineW, by, bw - half - spineW, bh)
        ctx.restore()
      }

      drawClosedBook()
    }

    function loop() {
      t += 0.016
      update()
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }

    const onClick = () => { bookTarget = bookTarget < 0.5 ? 1 : 0 }
    canvas.addEventListener('click', onClick)
    canvas.style.cursor = 'pointer'

    loop()
    setTimeout(() => { bookTarget = 1 }, 1400)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={420}
        height={340}
        style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
      />
      <p style={{
        textAlign: 'center', marginTop: '0.75rem',
        fontSize: '0.7rem', letterSpacing: '0.2em',
        color: 'var(--muted)', fontStyle: 'italic',
        textTransform: 'uppercase',
      }}>
        ölüdeniz, turkey · click to open
      </p>
    </div>
  )
}