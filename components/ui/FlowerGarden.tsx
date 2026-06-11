'use client'
import { useEffect, useRef } from 'react'

const PHRASES = [
  "your memories hide here",
  "some feelings never leave",
  "you were alive in this moment",
  "time stopped here once",
  "this is where you felt it",
  "the heart remembers everything",
  "a feeling no camera could hold",
  "you were exactly here",
  "some moments bloom forever",
  "the past is never really past",
]

export default function FlowerGarden() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const planted = useRef(false)
  const flowerGroups = useRef<SVGGElement[]>([])
  const flowerPositions = useRef<{x:number,y:number}[]>([])
  const windTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (planted.current || !svgRef.current) return
    planted.current = true
    const svg = svgRef.current
    const NS = 'http://www.w3.org/2000/svg'
    const COLORS = ['#5a9e6f','#7cb987','#c8975a','#8fa897','#b87333','#6b8a72','#a0c4a8','#dba96e','#4a8a5f']

    const style = document.createElementNS(NS, 'style')
    style.textContent = `
      @keyframes growStem { to { stroke-dashoffset: 0; } }
      @keyframes fadeLeaf { to { opacity: 0.55; } }
      @keyframes bloomFlower {
        0% { opacity: 0; transform: scale(0) rotate(-15deg); }
        60% { opacity: 1; transform: scale(1.15) rotate(5deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      @keyframes swayNormal {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
      @keyframes windGust {
        0% { transform: rotate(var(--base-rot, -3deg)); }
        20% { transform: rotate(calc(var(--base-rot, -3deg) + 18deg)); }
        40% { transform: rotate(calc(var(--base-rot, -3deg) - 8deg)); }
        60% { transform: rotate(calc(var(--base-rot, -3deg) + 12deg)); }
        80% { transform: rotate(calc(var(--base-rot, -3deg) - 4deg)); }
        100% { transform: rotate(var(--base-rot, -3deg)); }
      }
      @keyframes mouseReact {
        0% { transform: rotate(var(--push-rot, 15deg)); }
        70% { transform: rotate(calc(var(--push-rot, 15deg) * -0.3)); }
        100% { transform: rotate(var(--base-rot, -3deg)); }
      }
      @keyframes clickBounce {
        0% { transform: scale(1) rotate(0deg); }
        30% { transform: scale(1.3) rotate(10deg); }
        60% { transform: scale(0.9) rotate(-5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes glitterFly {
        0% { opacity: 1; transform: translate(0,0) scale(1) rotate(0deg); }
        100% { opacity: 0; transform: translate(var(--gx), var(--gy)) scale(0) rotate(360deg); }
      }
      @keyframes phraseFloat {
        0% { opacity: 0; transform: translate(-50%, 0) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -10px) scale(1); }
        70% { opacity: 1; transform: translate(-50%, -20px) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -40px) scale(0.95); }
      }
    `
    svg.appendChild(style)

    function makeStem(x: number, y: number, height: number, color: string, delay: number) {
      const cp1x = x + (Math.random() - 0.5) * 50
      const cp1y = y - height * 0.5
      const endX = x + (Math.random() - 0.5) * 25
      const endY = y - height

      const stemG = document.createElementNS(NS, 'g')
      const path = document.createElementNS(NS, 'path')
      const d = `M${x},${y} Q${cp1x},${cp1y} ${endX},${endY}`
      path.setAttribute('d', d)
      path.setAttribute('stroke', color)
      path.setAttribute('stroke-width', '1.8')
      path.setAttribute('fill', 'none')
      path.setAttribute('opacity', '0.65')
      path.style.cssText = `stroke-dasharray:250;stroke-dashoffset:250;animation:growStem ${1.5+Math.random()*0.8}s ${delay}s ease-out forwards`
      stemG.appendChild(path)
      svg.appendChild(stemG)

      // leaves
      for (let i = 0; i < 2; i++) {
        const t = 0.3 + i * 0.35
        const lx = x + (cp1x - x) * t + (Math.random() - 0.5) * 20
        const ly = y - height * t
        const leaf = document.createElementNS(NS, 'ellipse')
        leaf.setAttribute('cx', String(lx))
        leaf.setAttribute('cy', String(ly))
        leaf.setAttribute('rx', String(9 + Math.random() * 9))
        leaf.setAttribute('ry', String(4 + Math.random() * 4))
        leaf.setAttribute('fill', color)
        leaf.setAttribute('opacity', '0')
        leaf.setAttribute('transform', `rotate(${-35+Math.random()*70},${lx},${ly})`)
        leaf.style.cssText = `animation:fadeLeaf ${0.8+Math.random()*0.4}s ${delay+0.6+i*0.3}s ease-out forwards`
        svg.appendChild(leaf)
      }

      setTimeout(() => makeFlower(endX, endY, color, delay), (delay + 1.5) * 1000)
    }

    function makeFlower(x: number, y: number, color: string, delay: number) {
      const petalCount = 5 + Math.floor(Math.random() * 5)
      const petalSize = 8 + Math.random() * 14
      const baseRot = -3 + Math.random() * 6
      const swayDur = 4 + Math.random() * 3

      const g = document.createElementNS(NS, 'g')
      g.setAttribute('data-flower', 'true')
      g.setAttribute('data-x', String(x))
      g.setAttribute('data-y', String(y))
      g.setAttribute('data-color', color)
      g.style.cssText = `
        transform-origin: ${x}px ${y + 20}px;
        animation: bloomFlower 1.4s ${delay+0.1}s cubic-bezier(0.34,1.56,0.64,1) both,
                   swayNormal ${swayDur}s ${delay+1.6}s ease-in-out infinite;
        cursor: none;
        --base-rot: ${baseRot}deg;
      `

      // petals
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2
        const px = x + Math.cos(angle) * (petalSize * 1.3)
        const py = y + Math.sin(angle) * (petalSize * 1.3)
        const petal = document.createElementNS(NS, 'ellipse')
        petal.setAttribute('cx', String(px))
        petal.setAttribute('cy', String(py))
        petal.setAttribute('rx', String(petalSize * 0.75))
        petal.setAttribute('ry', String(petalSize * 0.42))
        petal.setAttribute('fill', color)
        petal.setAttribute('opacity', '0.78')
        petal.setAttribute('transform', `rotate(${angle*180/Math.PI+90},${px},${py})`)
        g.appendChild(petal)
      }

      // inner petals
      for (let i = 0; i < petalCount; i++) {
        const angle = ((i + 0.5) / petalCount) * Math.PI * 2
        const px = x + Math.cos(angle) * (petalSize * 0.7)
        const py = y + Math.sin(angle) * (petalSize * 0.7)
        const petal = document.createElementNS(NS, 'ellipse')
        petal.setAttribute('cx', String(px))
        petal.setAttribute('cy', String(py))
        petal.setAttribute('rx', String(petalSize * 0.4))
        petal.setAttribute('ry', String(petalSize * 0.25))
        petal.setAttribute('fill', '#f5f0e8')
        petal.setAttribute('opacity', '0.3')
        petal.setAttribute('transform', `rotate(${angle*180/Math.PI+90},${px},${py})`)
        g.appendChild(petal)
      }

      // center
      const center = document.createElementNS(NS, 'circle')
      center.setAttribute('cx', String(x))
      center.setAttribute('cy', String(y))
      center.setAttribute('r', String(petalSize * 0.45))
      center.setAttribute('fill', '#c8975a')
      center.setAttribute('opacity', '0.95')
      g.appendChild(center)

      svg.appendChild(g)
      flowerGroups.current.push(g)
      flowerPositions.current.push({ x, y })
    }

    const flowerData = Array.from({ length: 28 }, () => ({
      x: 20 + Math.random() * 1360,
      y: 480 + Math.random() * 30,
      height: 80 + Math.random() * 220,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: 0.3 + Math.random() * 3.5,
    }))
    flowerData.forEach(f => makeStem(f.x, f.y, f.height, f.color, f.delay))

    // --- MOUSE INTERACTION ---
    const onMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const scaleX = 1400 / rect.width
      const scaleY = 520 / rect.height
      const svgX = (e.clientX - rect.left) * scaleX
      const svgY = (e.clientY - rect.top) * scaleY

      flowerGroups.current.forEach((g, i) => {
        const fp = flowerPositions.current[i]
        if (!fp) return
        const dx = svgX - fp.x
        const dy = svgY - fp.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const radius = 120

        if (dist < radius) {
          const strength = (radius - dist) / radius
          const angle = Math.atan2(dy, dx)
          const pushRot = strength * 25 * (dx > 0 ? 1 : -1)
          g.style.animation = 'none'
          g.style.setProperty('--push-rot', `${pushRot}deg`)
          g.style.transform = `rotate(${pushRot}deg)`
          g.style.transition = 'transform 0.15s ease-out'
        } else {
          if (g.style.transform && !g.style.animation.includes('swayNormal')) {
            g.style.transform = ''
            g.style.transition = 'transform 0.6s ease-out'
            const swayDur = 4 + Math.random() * 3
            setTimeout(() => {
              if (g) {
                g.style.transition = ''
                g.style.animation = `swayNormal ${swayDur}s ease-in-out infinite`
              }
            }, 600)
          }
        }
      })
    }

    // --- CLICK INTERACTION ---
    const onClick = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const scaleX = 1400 / rect.width
      const scaleY = 520 / rect.height
      const svgX = (e.clientX - rect.left) * scaleX
      const svgY = (e.clientY - rect.top) * scaleY

      let closest = -1
      let closestDist = 80

      flowerGroups.current.forEach((g, i) => {
        const fp = flowerPositions.current[i]
        if (!fp) return
        const dist = Math.sqrt((svgX-fp.x)**2 + (svgY-fp.y)**2)
        if (dist < closestDist) { closestDist = dist; closest = i }
      })

      if (closest >= 0) {
        const g = flowerGroups.current[closest]
        const fp = flowerPositions.current[closest]
        const color = g.getAttribute('data-color') || '#c8975a'

        // bounce animation
        g.style.animation = 'clickBounce 0.6s ease-out forwards'
        setTimeout(() => {
          const swayDur = 4 + Math.random() * 3
          g.style.animation = `swayNormal ${swayDur}s ease-in-out infinite`
        }, 700)

        // glitter burst
        const glitterColors = ['#c8975a','#7cb987','#f5f0e8','#dba96e','#b87333','#5a9e6f']
        for (let i = 0; i < 14; i++) {
          const glitter = document.createElementNS(NS, 'circle')
          const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.5
          const dist2 = 30 + Math.random() * 50
          const gx = Math.cos(angle) * dist2
          const gy = Math.sin(angle) * dist2
          const size = 2 + Math.random() * 4
          glitter.setAttribute('cx', String(fp.x))
          glitter.setAttribute('cy', String(fp.y))
          glitter.setAttribute('r', String(size))
          glitter.setAttribute('fill', glitterColors[Math.floor(Math.random()*glitterColors.length)])
          glitter.style.cssText = `
            --gx: ${gx}px; --gy: ${gy}px;
            animation: glitterFly ${0.6+Math.random()*0.5}s ease-out forwards;
            pointer-events: none;
          `
          svg.appendChild(glitter)
          setTimeout(() => glitter.remove(), 1200)
        }

        // phrase popup — create in DOM overlay (not SVG for better styling)
        const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
        const svgRect = svg.getBoundingClientRect()
        const screenX = svgRect.left + (fp.x / 1400) * svgRect.width
        const screenY = svgRect.top + (fp.y / 520) * svgRect.height

        const div = document.createElement('div')
        div.textContent = `"${phrase}"`
        div.style.cssText = `
          position: fixed;
          left: ${screenX}px;
          top: ${screenY - 20}px;
          transform: translateX(-50%);
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.9rem;
          color: #f5f0e8;
          background: rgba(6,13,8,0.92);
          border: 1px solid rgba(200,151,90,0.4);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          white-space: nowrap;
          pointer-events: none;
          z-index: 9990;
          animation: phraseFloat 2.5s ease-out forwards;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(200,151,90,0.1);
          max-width: 280px;
          white-space: normal;
          text-align: center;
        `
        document.body.appendChild(div)
        setTimeout(() => div.remove(), 2600)
      }
    }

    // --- WIND GUSTS ---
    function triggerWind() {
      const count = 3 + Math.floor(Math.random() * 5)
      const indices = [...Array(flowerGroups.current.length).keys()]
        .sort(() => Math.random() - 0.5)
        .slice(0, count)

      indices.forEach((idx, i) => {
        const g = flowerGroups.current[idx]
        if (!g) return
        setTimeout(() => {
          g.style.animation = `windGust ${0.8 + Math.random() * 0.6}s ease-in-out forwards`
          setTimeout(() => {
            const swayDur = 4 + Math.random() * 3
            g.style.animation = `swayNormal ${swayDur}s ease-in-out infinite`
          }, 1500)
        }, i * 100)
      })

      const nextWind = 4000 + Math.random() * 6000
      windTimer.current = setTimeout(triggerWind, nextWind)
    }

    setTimeout(triggerWind, 5000)

    svg.addEventListener('mousemove', onMouseMove)
    svg.addEventListener('click', onClick)

    return () => {
      svg.removeEventListener('mousemove', onMouseMove)
      svg.removeEventListener('click', onClick)
      if (windTimer.current) clearTimeout(windTimer.current)
    }
  }, [])

  return (
    <div ref={containerRef} style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      width: '100%', height: '65%',
      pointerEvents: 'auto',
      zIndex: 3,
    }}>
      <svg
        ref={svgRef}
        viewBox="0 0 1400 520"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}