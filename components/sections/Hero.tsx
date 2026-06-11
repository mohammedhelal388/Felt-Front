'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const FIRST_WHISPER = 'touch the flower to begin'

const WHISPERS = [
  'smell me', 'remember me', 'find me',
  'feel me', 'hold me', 'reach me', 'know me',
  'i was there', 'you were here', 'time stood still',
  'this is real', 'i remember you', 'stay a moment',
  'breathe me in', 'i missed you', 'come back',
  'you felt this', 'close your eyes',
]

export default function Hero() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)
  const [heroLines, setHeroLines] = useState([false, false, false, false])
  const [ctaVisible, setCtaVisible] = useState(false)
  const planted = useRef(false)
  const timers = useRef<NodeJS.Timeout[]>([])

  const revealHero = () => {
    if (heroVisible) return
    setHeroVisible(true)
    ;[0, 1, 2, 3].forEach(i => {
      timers.current.push(setTimeout(() => {
        setHeroLines(prev => { const n = [...prev]; n[i] = true; return n })
      }, 200 + i * 600))
    })
    timers.current.push(setTimeout(() => setCtaVisible(true), 200 + 4 * 600))
  }

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
        0% { opacity:0; transform:scale(0) rotate(-15deg); }
        60% { opacity:1; transform:scale(1.15) rotate(5deg); }
        100% { opacity:1; transform:scale(1) rotate(0deg); }
      }
      @keyframes swayNormal {
        0%,100% { transform:rotate(-3deg); }
        50% { transform:rotate(3deg); }
      }
      @keyframes windGust {
        0% { transform:rotate(-3deg); }
        20% { transform:rotate(18deg); }
        50% { transform:rotate(-6deg); }
        80% { transform:rotate(14deg); }
        100% { transform:rotate(-3deg); }
      }
      @keyframes pulseGlow {
        0%,100% { filter:drop-shadow(0 0 4px rgba(200,151,90,0.4)); }
        50% { filter:drop-shadow(0 0 12px rgba(200,151,90,0.9)); }
      }
      @keyframes whisperBeat {
        0%,100% { opacity:0.85; text-shadow:0 0 16px rgba(200,151,90,0.8); }
        50% { opacity:1; text-shadow:0 0 24px rgba(200,151,90,1), 0 0 50px rgba(200,151,90,0.4); }
      }
      @keyframes whisperFade {
        0% { opacity:0; transform:translateX(-50%) translateY(6px); }
        20% { opacity:1; transform:translateX(-50%) translateY(0); }
        70% { opacity:1; transform:translateX(-50%) translateY(0); }
        100% { opacity:0; transform:translateX(-50%) translateY(-6px); }
      }
    `
    svg.appendChild(style)

    const flowerGroups: SVGGElement[] = []
    const flowerPositions: {x:number;y:number}[] = []
    const flowerColors: string[] = []
    const whisperEls: HTMLDivElement[] = []
    let windTimer: NodeJS.Timeout

    function makeStem(x: number, y: number, height: number, color: string, delay: number) {
      const cp1x = x + (Math.random()-0.5)*50
      const cp1y = y - height*0.5
      const endX = x + (Math.random()-0.5)*25
      const endY = y - height

      const path = document.createElementNS(NS, 'path')
      path.setAttribute('d', `M${x},${y} Q${cp1x},${cp1y} ${endX},${endY}`)
      path.setAttribute('stroke', color)
      path.setAttribute('stroke-width', '1.8')
      path.setAttribute('fill', 'none')
      path.setAttribute('opacity', '0.65')
      path.style.cssText = `stroke-dasharray:250;stroke-dashoffset:250;animation:growStem ${1.5+Math.random()*0.8}s ${delay}s ease-out forwards`
      svg.appendChild(path)

      for (let i=0;i<2;i++) {
        const t2 = 0.3+i*0.35
        const lx = x+(cp1x-x)*t2+(Math.random()-0.5)*20
        const ly = y-height*t2
        const leaf = document.createElementNS(NS,'ellipse')
        leaf.setAttribute('cx',String(lx))
        leaf.setAttribute('cy',String(ly))
        leaf.setAttribute('rx',String(9+Math.random()*9))
        leaf.setAttribute('ry',String(4+Math.random()*4))
        leaf.setAttribute('fill',color)
        leaf.setAttribute('opacity','0')
        leaf.setAttribute('transform',`rotate(${-35+Math.random()*70},${lx},${ly})`)
        leaf.style.cssText = `animation:fadeLeaf ${0.8+Math.random()*0.4}s ${delay+0.6+i*0.3}s ease-out forwards`
        svg.appendChild(leaf)
      }

      setTimeout(() => makeFlower(endX, endY, color, delay), (delay+1.5)*1000)
    }

    function makeFlower(x: number, y: number, color: string, delay: number) {
      const petalCount = 5+Math.floor(Math.random()*5)
      const petalSize = 8+Math.random()*14
      const swayDur = 4+Math.random()*3
      const isFirstFlower = flowerGroups.length === 0
      const whisper = isFirstFlower
        ? FIRST_WHISPER
        : WHISPERS[Math.floor(Math.random() * WHISPERS.length)]

      const g = document.createElementNS(NS,'g')
      g.setAttribute('data-flower','true')
      g.setAttribute('data-whisper', whisper)
      g.style.cssText = `
        transform-origin:${x}px ${y+20}px;
        animation:bloomFlower 1.4s ${delay+0.1}s cubic-bezier(0.34,1.56,0.64,1) both,
                   swayNormal ${swayDur}s ${delay+1.6}s ease-in-out infinite;
        cursor:none;
      `

      for (let i=0;i<petalCount;i++) {
        const angle=(i/petalCount)*Math.PI*2
        const px=x+Math.cos(angle)*(petalSize*1.3)
        const py=y+Math.sin(angle)*(petalSize*1.3)
        const petal=document.createElementNS(NS,'ellipse')
        petal.setAttribute('cx',String(px))
        petal.setAttribute('cy',String(py))
        petal.setAttribute('rx',String(petalSize*0.75))
        petal.setAttribute('ry',String(petalSize*0.42))
        petal.setAttribute('fill',color)
        petal.setAttribute('opacity','0.78')
        petal.setAttribute('transform',`rotate(${angle*180/Math.PI+90},${px},${py})`)
        g.appendChild(petal)
      }

      const center=document.createElementNS(NS,'circle')
      center.setAttribute('cx',String(x))
      center.setAttribute('cy',String(y))
      center.setAttribute('r',String(petalSize*0.45))
      center.setAttribute('fill','#c8975a')
      g.appendChild(center)

      // invisible hit area
      const hit=document.createElementNS(NS,'circle')
      hit.setAttribute('cx',String(x))
      hit.setAttribute('cy',String(y))
      hit.setAttribute('r',String(petalSize*2))
      hit.setAttribute('fill','transparent')
      g.appendChild(hit)

      svg.appendChild(g)
      flowerGroups.push(g)
      flowerPositions.push({x,y})
      flowerColors.push(color)

      // whisper div
      const wDiv = document.createElement('div')
      wDiv.style.cssText = `
        position:fixed;
        font-family:'Playfair Display',serif;
        font-style:italic;
        font-size:1.5rem;
        color:rgba(200,151,90,0.95);
        pointer-events:none;
        z-index:9990;
        white-space:nowrap;
        text-shadow:0 0 16px rgba(200,151,90,0.8), 0 0 40px rgba(200,151,90,0.3);
        letter-spacing:0.12em;
        display:none;
        left:0;top:0;
        transform:translateX(-50%);
        transition:opacity 0.6s ease, transform 0.6s ease;
        animation:whisperBeat 1.8s ease-in-out infinite;
      `
      wDiv.textContent = whisper
      svg.parentElement?.appendChild(wDiv)
      whisperEls.push(wDiv)

      // auto-show whisper on first flower after it blooms
      if (isFirstFlower) {
        const autoDelay = (delay + 0.8) * 1000
        setTimeout(() => {
          const rect = svg.getBoundingClientRect()
          const screenX = rect.left + (x / 1400) * rect.width
          const screenY = rect.top + (y / 520) * rect.height
          wDiv.style.left = `${screenX}px`
          wDiv.style.top = `${screenY - 38}px`
          wDiv.style.position = 'fixed'
          wDiv.style.display = 'block'
          wDiv.style.opacity = '0'
          setTimeout(() => {
            wDiv.style.opacity = '1'
            wDiv.style.transform = 'translateX(-50%) translateY(-4px)'
          }, 30)
        }, autoDelay)
      }
    }

    // plant ONE flower in the center
    const centerFlower = {
      x: 700, y: 500,
      height: 180,
      color: '#c8975a',
      delay: 0.3,
    }
    makeStem(centerFlower.x, centerFlower.y, centerFlower.height, centerFlower.color, centerFlower.delay)

    let gardenPlanted = false

    function plantGarden() {
      if (gardenPlanted) return
      gardenPlanted = true
      const leftFlowers = Array.from({length:14},(_,i) => ({
        x: 660 - (i+1)*88 - Math.random()*30,
        y: 490+Math.random()*30,
        height: 80+Math.random()*220,
        color: COLORS[Math.floor(Math.random()*COLORS.length)],
        delay: i*0.12,
      }))
      const rightFlowers = Array.from({length:14},(_,i) => ({
        x: 740 + (i+1)*88 + Math.random()*30,
        y: 490+Math.random()*30,
        height: 80+Math.random()*220,
        color: COLORS[Math.floor(Math.random()*COLORS.length)],
        delay: i*0.12,
      }))
      ;[...leftFlowers, ...rightFlowers].forEach(f => makeStem(f.x, f.y, f.height, f.color, f.delay))
    }

    // mouse interaction
    let activeWhisper: HTMLDivElement | null = null
    let whisperTimer: NodeJS.Timeout

    const onMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const scaleX = 1400/rect.width
      const scaleY = 520/rect.height
      const svgX = (e.clientX-rect.left)*scaleX
      const svgY = (e.clientY-rect.top)*scaleY

      let hoveredIdx = -1
      flowerGroups.forEach((g,i) => {
        const fp = flowerPositions[i]
        if (!fp) return
        const dist = Math.sqrt((svgX-fp.x)**2+(svgY-fp.y)**2)
        const radius = 100

        if (dist < radius) {
          hoveredIdx = i
          // push away
          const pushRot = ((fp.x-svgX)/radius)*20
          g.style.animation='none'
          g.style.transform=`rotate(${pushRot}deg)`
          g.style.transition='transform 0.15s ease-out'
          g.style.filter=`drop-shadow(0 0 8px ${flowerColors[i]}88)`
          g.style.setProperty('transform-origin',`${fp.x}px ${fp.y+20}px`)

          // show whisper
          const wDiv = whisperEls[i]
          if (wDiv && activeWhisper !== wDiv) {
            if (activeWhisper) { activeWhisper.style.display='none' }
            activeWhisper = wDiv
            const screenX = rect.left+(fp.x/1400)*rect.width
            const screenY = rect.top+(fp.y/520)*rect.height
            wDiv.style.left=`${screenX}px`
            wDiv.style.top=`${screenY-32}px`
            wDiv.style.position='fixed'
            wDiv.style.display='block'
            wDiv.style.opacity='0'
            wDiv.style.transition='opacity 0.5s ease, transform 0.5s ease'
            setTimeout(()=>{wDiv.style.opacity='1';wDiv.style.transform='translateX(-50%) translateY(-4px)'},20)
          }
        } else {
          // restore sway
          if (g.style.filter) {
            g.style.filter=''
            g.style.transform=''
            g.style.transition='transform 0.6s ease-out'
            const sd=4+Math.random()*3
            setTimeout(()=>{
              g.style.transition=''
              g.style.animation=`swayNormal ${sd}s ease-in-out infinite`
            },600)
          }
        }
      })

      if (hoveredIdx === -1 && activeWhisper) {
        const w = activeWhisper
        w.style.opacity='0'
        w.style.transform='translateX(-50%) translateY(4px)'
        setTimeout(()=>{ w.style.display='none'; activeWhisper=null },600)
      }

      // also clean up any orphaned whispers
      whisperEls.forEach((w, i) => {
        if (i !== hoveredIdx && w.style.display === 'block' && w !== activeWhisper) {
          w.style.opacity = '0'
          setTimeout(() => { w.style.display = 'none' }, 600)
        }
      })
    }

    const onClick = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const scaleX = 1400/rect.width
      const scaleY = 520/rect.height
      const svgX = (e.clientX-rect.left)*scaleX
      const svgY = (e.clientY-rect.top)*scaleY

      flowerGroups.forEach((g,i) => {
        const fp = flowerPositions[i]
        if (!fp) return
        const dist = Math.sqrt((svgX-fp.x)**2+(svgY-fp.y)**2)
        if (dist < 80) {
          // bloom burst on center flower
          g.style.animation='windGust 0.6s ease-out forwards'
          g.style.filter=`drop-shadow(0 0 24px ${flowerColors[i]}) drop-shadow(0 0 40px rgba(200,151,90,0.6))`
          setTimeout(()=>{
            g.style.filter=''
            const sd=4+Math.random()*3
            g.style.animation=`swayNormal ${sd}s ease-in-out infinite`
          },700)

          // glitter burst — DOM sparkles
          for (let j=0;j<18;j++) {
            const spark = document.createElement('div')
            const angle = (j/18)*Math.PI*2
            const speed = 60+Math.random()*80
            const tx = Math.cos(angle)*speed
            const ty = Math.sin(angle)*speed - 30
            const dur = 0.7+Math.random()*0.5
            const sz = 3+Math.random()*4
            const col = ['#c8975a','#7cb987','#f5f0e8','#dba96e','#b87333'][Math.floor(Math.random()*5)]
            spark.style.cssText = `
              position:fixed;border-radius:50%;pointer-events:none;z-index:9997;
              left:${e.clientX}px;top:${e.clientY}px;
              width:${sz}px;height:${sz}px;background:${col};
              transform:translate(-50%,-50%);opacity:0.95;
              transition:transform ${dur}s ease-out,opacity ${dur}s ease-out;
            `
            document.body.appendChild(spark)
            requestAnimationFrame(()=>requestAnimationFrame(()=>{
              spark.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px))`
              spark.style.opacity='0'
            }))
            setTimeout(()=>spark.remove(), dur*1000+100)
          }

          // hide first flower auto-whisper
          if (whisperEls[0]) {
            whisperEls[0].style.opacity = '0'
            setTimeout(() => { if (whisperEls[0]) whisperEls[0].style.display = 'none' }, 600)
          }

          // plant the whole garden
          plantGarden()
          // reveal hero text
          revealHero()
        }
      })
    }

    // wind gusts
    function triggerWind() {
      const count=3+Math.floor(Math.random()*5)
      const indices=[...Array(flowerGroups.length).keys()].sort(()=>Math.random()-0.5).slice(0,count)
      indices.forEach((idx,i) => {
        const g=flowerGroups[idx]
        if (!g) return
        setTimeout(()=>{
          g.style.animation=`windGust ${0.8+Math.random()*0.6}s ease-in-out forwards`
          setTimeout(()=>{
            const sd=4+Math.random()*3
            g.style.animation=`swayNormal ${sd}s ease-in-out infinite`
          },1500)
        },i*120)
      })
      windTimer=setTimeout(triggerWind,5000+Math.random()*6000)
    }
    setTimeout(triggerWind,6000)

    svg.addEventListener('mousemove',onMouseMove)
    svg.addEventListener('click',onClick)

    return () => {
      svg.removeEventListener('mousemove',onMouseMove)
      svg.removeEventListener('click',onClick)
      clearTimeout(windTimer)
      whisperEls.forEach(w=>w.remove())
    }
  }, [])

  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout) }
  }, [])

  return (
    <section style={{
      minHeight:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',
      position:'relative',overflow:'hidden',padding:'2rem',
      background:'radial-gradient(ellipse at 30% 60%,rgba(26,51,32,0.5) 0%,transparent 60%),radial-gradient(ellipse at 70% 30%,rgba(200,151,90,0.06) 0%,transparent 50%)',
    }}>
      {/* fireflies */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:2}}>
        {[
          [12,8],[34,22],[56,45],[78,15],[23,67],[89,33],[45,78],[67,55],[11,44],[90,12],
          [33,88],[55,30],[77,65],[19,50],[42,77],[64,20],[85,42],[28,60],[50,85],[72,38],
          [15,25],[38,70],[60,48],[82,18],[25,55]
        ].map(([l,t],i) => (
          <div key={i} style={{
            position:'absolute', left:`${l}%`, top:`${t}%`,
            width:'3px', height:'3px', borderRadius:'50%',
            background:i%2===0?'var(--green)':'var(--gold)',
            animation:`pulse ${4+(i%4)}s ${(i%5)*0.8}s ease-in-out infinite`,
            opacity:0,
          }} />
        ))}
      </div>

      {/* hero content — hidden until flower clicked */}
      <div style={{
        position:'relative',zIndex:10,textAlign:'center',maxWidth:'860px',
        opacity: heroVisible ? 1 : 0,
        transition:'opacity 0.5s ease',
        pointerEvents: heroVisible ? 'auto' : 'none',
      }}>
        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontStyle:'italic',fontSize:'0.85rem',
          color:'var(--muted)',letterSpacing:'0.4em',
          marginBottom:'1.2rem',textTransform:'uppercase',
          opacity: heroLines[0] ? 1 : 0,
          transform: heroLines[0] ? 'translateY(0)' : 'translateY(20px)',
          transition:'opacity 1.5s ease, transform 1.5s ease',
        }}>
          ✦ &nbsp; a living memory &nbsp; ✦
        </p>

        <h1 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:'clamp(2.4rem,5vw,4rem)',
          fontWeight:700,lineHeight:1.1,marginBottom:'0.5rem',
          opacity: heroLines[1] ? 1 : 0,
          transform: heroLines[1] ? 'translateY(0)' : 'translateY(24px)',
          transition:'opacity 1.8s ease, transform 1.8s ease',
        }}>
          Your memories deserve
        </h1>

        <h1 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:'clamp(2.4rem,5vw,4rem)',
          fontWeight:700,lineHeight:1.1,marginBottom:'2rem',
          opacity: heroLines[1] ? 1 : 0,
          transform: heroLines[1] ? 'translateY(0)' : 'translateY(24px)',
          transition:'opacity 1.8s ease 0.2s, transform 1.8s ease 0.2s',
        }}>
          <em style={{fontStyle:'italic',color:'var(--gold)'}}>to be felt, not just seen.</em>
        </h1>

        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:'1.15rem',fontStyle:'italic',
          color:'var(--parchment)',lineHeight:1.7,
          maxWidth:'560px',margin:'0 auto 0.6rem',fontWeight:300,
          opacity: heroLines[2] ? 1 : 0,
          transform: heroLines[2] ? 'translateY(0)' : 'translateY(20px)',
          transition:'opacity 1.8s ease, transform 1.8s ease',
        }}>
          On a mountain in Turkey, watching a sunset no camera could hold —
        </p>

        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:'1.15rem',fontStyle:'italic',
          color:'var(--parchment)',lineHeight:1.7,
          maxWidth:'560px',margin:'0 auto 2.5rem',fontWeight:300,
          opacity: heroLines[3] ? 1 : 0,
          transform: heroLines[3] ? 'translateY(0)' : 'translateY(20px)',
          transition:'opacity 1.8s ease, transform 1.8s ease',
        }}>
          Felt was born from that impossible longing.
        </p>

        <div style={{
          display:'flex',gap:'1.5rem',justifyContent:'center',flexWrap:'wrap',
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'translateY(0)' : 'translateY(16px)',
          transition:'opacity 1.5s ease, transform 1.5s ease',
        }}>
          <Link href="/register" style={{
            background:'var(--gold)',color:'var(--forest)',
            padding:'1rem 2.8rem',borderRadius:'3rem',
            fontFamily:"'Playfair Display',serif",
            fontSize:'1rem',fontWeight:700,
            textDecoration:'none',letterSpacing:'0.1em',
            transition:'all 0.4s',
            boxShadow:'0 8px 30px rgba(200,151,90,0.3)',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--copper)';e.currentTarget.style.transform='translateY(-3px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='var(--gold)';e.currentTarget.style.transform='translateY(0)'}}
          >
            Begin your story
          </Link>
          <button style={{
            background:'transparent',color:'var(--cream)',
            padding:'1rem 2.8rem',
            border:'1px solid rgba(245,240,232,0.2)',
            borderRadius:'3rem',
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:'1rem',fontStyle:'italic',
            transition:'all 0.4s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(245,240,232,0.2)';e.currentTarget.style.color='var(--cream)'}}
          >
            Watch the magic
          </button>
        </div>
      </div>

      {/* hint when hero not yet revealed — very subtle */}
      {!heroVisible && (
        <div style={{
          position:'absolute',
          bottom:'28%',left:'50%',
          transform:'translateX(-50%)',
          zIndex:10,textAlign:'center',
          pointerEvents:'none',
        }}>
          <div style={{
            width:'1px',height:'50px',
            background:'linear-gradient(to bottom,transparent,rgba(200,151,90,0.3),transparent)',
            margin:'0 auto',
            animation:'pulse 3s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* flowers */}
      <svg
        ref={svgRef}
        viewBox="0 0 1400 520"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position:'absolute',bottom:0,left:0,right:0,
          width:'100%',height:'65%',
          pointerEvents:'auto',zIndex:3,
        }}
      />

      {/* scroll hint — only after revealed */}
      {heroVisible && (
        <div style={{
          position:'absolute',bottom:'2rem',
          left:'50%',transform:'translateX(-50%)',
          display:'flex',flexDirection:'column',
          alignItems:'center',gap:'0.5rem',
          animation:'pulse 2.5s ease-in-out infinite',
          zIndex:5,
        }}>
          <span style={{fontSize:'0.7rem',letterSpacing:'0.3em',color:'var(--muted)',textTransform:'uppercase'}}>scroll</span>
          <div style={{width:'1px',height:'40px',background:'linear-gradient(to bottom,var(--gold),transparent)'}} />
        </div>
      )}
    </section>
  )
}