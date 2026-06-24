'use client'
import { useEffect, useRef, useState, useCallback, forwardRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import jsPDF from 'jspdf'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })
const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false }) as any

interface Moment {
  id: string; emotionWord: string; location: string
  poeticText: string; frontPhotoUrl: string; description: string
  isGenerated: boolean; capturedAt: string
  emotionAnalysis?: { weatherMood?: string; primaryEmotion?: string }
}

const EC: Record<string, string> = {
  nostalgic:'#5a7fa0', belonging:'#4a8a5f', wonder:'#b07830', peace:'#5a7a60',
  joy:'#c07030', melancholy:'#6858a0', awe:'#a08030', love:'#a05050',
  excited:'#c07030', sky:'#4a8aaa', sad:'#6858a0', happy:'#6a8a30',
  frustrated:'#a03030', longing:'#6858a0', expansive:'#4a8aaa', stillness:'#5a7a68',
}

// ─── Vine Sidebar ─────────────────────────────────────────────────────────────
function VineSidebar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const hoveredItem = useRef(-1)
  const [hov, setHov] = useState(-1)
  const navItems = [
    { label:'Moments', icon:'◎', href:'/dashboard' },
    { label:'My Book', icon:'❧', href:'/my-story' },
    { label:'New Moment', icon:'✦', href:'/moments/new' },
    { label:'Settings', icon:'◈', href:'/dashboard' },
  ]
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let t = 0
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = () => {
      const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H)
      const sx=28, sg=ctx.createLinearGradient(sx,0,sx,H)
      sg.addColorStop(0,'rgba(90,158,111,0)');sg.addColorStop(0.1,'rgba(90,158,111,0.35)');sg.addColorStop(0.9,'rgba(90,158,111,0.35)');sg.addColorStop(1,'rgba(90,158,111,0)')
      ctx.save();ctx.strokeStyle=sg;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,0)
      for(let y=0;y<=H;y+=40)ctx.lineTo(sx+Math.sin(y*0.05+t*0.3)*3,y)
      ctx.stroke();ctx.restore()
      ;[0.15,0.32,0.48,0.65,0.82].forEach((pos,i)=>{
        const y=H*pos,x=sx+Math.sin(y*0.05+t*0.3)*3,side=i%2===0?1:-1,ll=12+Math.sin(t*0.4+i)*2
        ctx.save();ctx.translate(x,y);ctx.rotate(side*(0.4+Math.sin(t*0.6+i*1.2)*0.08))
        ctx.globalAlpha=0.45+0.15*Math.sin(t*0.5+i);ctx.fillStyle='#5a9e6f'
        ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(side*ll*0.7,-ll*0.4,side*ll,0);ctx.quadraticCurveTo(side*ll*0.7,ll*0.3,0,0);ctx.fill();ctx.restore()
      })
      navItems.forEach((_,i)=>{
        const y=160+i*64,isA=navItems[i].href==='/my-story',isH=hoveredItem.current===i
        const bloom=isA?1:isH?(0.6+0.4*Math.sin(t*3)):0.2
        const fx=sx+Math.sin(y*0.05+t*0.3)*3
        ctx.save();ctx.globalAlpha=0.3+bloom*0.4;ctx.strokeStyle='#5a9e6f';ctx.lineWidth=1
        ctx.beginPath();ctx.moveTo(fx,y);ctx.quadraticCurveTo(fx+10,y-8,fx+18,y);ctx.stroke();ctx.restore()
        if(bloom>0.15){
          const ps=4+bloom*5,rot=t*(isA?0.15:0.05)+i*0.8
          for(let p=0;p<5;p++){const ang=(p/5)*Math.PI*2+rot;ctx.save();ctx.globalAlpha=bloom*0.7;ctx.fillStyle=isA?'#c8975a':'#7cb987';ctx.beginPath();ctx.arc(fx+18+Math.cos(ang)*ps,y+Math.sin(ang)*ps,ps*0.55,0,Math.PI*2);ctx.fill();ctx.restore()}
          ctx.save();ctx.globalAlpha=bloom;ctx.fillStyle=isA?'#ffe8a0':'#c8975a';ctx.beginPath();ctx.arc(fx+18,y,2.5,0,Math.PI*2);ctx.fill();ctx.restore()
        }
      })
      t+=0.016;rafRef.current=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener('resize',resize)}
  },[])
  return (
    <div style={{width:'220px',flexShrink:0,background:'rgba(4,10,5,0.95)',borderRight:'1px solid rgba(200,151,90,0.08)',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',height:'100%',padding:'2rem 0'}}>
        <Link href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',color:'var(--gold)',textDecoration:'none',padding:'0 1.5rem',marginBottom:'2.5rem',display:'block'}}>felt.</Link>
        <nav style={{flex:1}}>
          {navItems.map((item,i)=>{const isA=item.href==='/my-story';return(
            <Link key={item.label} href={item.href} onMouseEnter={()=>{hoveredItem.current=i;setHov(i)}} onMouseLeave={()=>{hoveredItem.current=-1;setHov(-1)}} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.85rem 1.5rem 0.85rem 3.2rem',textDecoration:'none',color:isA?'var(--cream)':hov===i?'var(--parchment)':'var(--muted)',background:isA?'rgba(200,151,90,0.06)':'transparent',borderRight:isA?'2px solid var(--gold)':'2px solid transparent',transition:'all 0.3s',fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',fontStyle:isA?'italic':'normal'}}>
              <span style={{fontSize:'0.7rem',color:isA?'var(--gold)':'rgba(200,151,90,0.3)'}}>{item.icon}</span>{item.label}
            </Link>
          )})}
        </nav>
        <div style={{padding:'0 1.5rem',borderTop:'1px solid rgba(200,151,90,0.08)',paddingTop:'1.5rem'}}>
          <p style={{color:'var(--parchment)',fontStyle:'italic',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.9rem',marginBottom:'0.75rem'}}>{user?.name}</p>
          <button onClick={onLogout} style={{background:'transparent',border:'none',color:'rgba(107,138,114,0.5)',fontSize:'0.8rem',fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',cursor:'none',padding:0}} onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(107,138,114,0.5)'}>sign out</button>
        </div>
      </div>
    </div>
  )
}

// ─── Paper sound ──────────────────────────────────────────────────────────────
function usePageSound() {
  const acRef = useRef<AudioContext|null>(null)
  return useCallback(()=>{
    try{
      if(!acRef.current)acRef.current=new AudioContext()
      const ac=acRef.current,sr=ac.sampleRate
      const len=sr*0.09,buf=ac.createBuffer(1,len,sr),d=buf.getChannelData(0)
      let prev=0
      for(let i=0;i<len;i++){const w=Math.random()*2-1;prev=0.965*prev+0.035*w;d[i]=prev*5*Math.sin((i/len)*Math.PI)}
      const src=ac.createBufferSource();src.buffer=buf
      const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=4200;bp.Q.value=1.2
      const g=ac.createGain();g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.09)
      src.connect(bp);bp.connect(g);g.connect(ac.destination);src.start()
      const tb=ac.createBuffer(1,sr*0.04,sr),td=tb.getChannelData(0)
      for(let i=0;i<tb.length;i++)td[i]=(Math.random()*2-1)*Math.pow(1-i/tb.length,4)
      const ts=ac.createBufferSource();ts.buffer=tb
      const tlp=ac.createBiquadFilter();tlp.type='lowpass';tlp.frequency.value=700
      const tg=ac.createGain();tg.gain.setValueAtTime(0.22,ac.currentTime+0.07);tg.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.12)
      ts.connect(tlp);tlp.connect(tg);tg.connect(ac.destination);ts.start(ac.currentTime+0.07)
    }catch(e){}
  },[])
}

// ─── Shared page CSS injected globally ───────────────────────────────────────
// This ensures pages ALWAYS show warm parchment regardless of app theme
const PAGE_STYLES = `
  .felt-book .stf__parent { background: transparent !important; }
  .felt-book .stf__block { background: transparent !important; }
  .felt-book .page-inner {
    background: #fef9f0 !important;
    color: #2a1a08 !important;
  }
  .felt-book .stf__block {
    box-shadow:
      3px 0 0 #e8dcc8, 5px 0 0 #ddd0b8, 7px 0 0 #d2c4aa,
      0 40px 80px rgba(0,0,0,0.65), 0 8px 20px rgba(0,0,0,0.3) !important;
  }
  @keyframes shimmer2 { 0%,100%{opacity:0.4} 50%{opacity:0.85} }
`

// ─── Page inner wrapper — forces bright parchment ────────────────────────────
function PageInner({ children, spineLeft = false }: { children: React.ReactNode; spineLeft?: boolean }) {
  return (
    <div className="page-inner" style={{
      width:'100%', height:'100%',
      background:'#fef9f0',  // warm golden parchment — explicit, no variables
      position:'relative', overflow:'hidden', boxSizing:'border-box',
      // ruled lines
      backgroundImage:`
        linear-gradient(145deg, #fef9f0 0%, #fdf3e3 50%, #faf0dc 100%),
        repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,145,80,0.12) 27px, rgba(180,145,80,0.12) 28px)
      `,
      backgroundBlendMode:'multiply',
    }}>
      {/* spine shadow */}
      {spineLeft && <div style={{position:'absolute',left:0,top:0,bottom:0,width:'18px',background:'linear-gradient(to right,rgba(0,0,0,0.07),transparent)',zIndex:3,pointerEvents:'none'}}/>}
      {children}
    </div>
  )
}

// ─── Cover ────────────────────────────────────────────────────────────────────
const CoverPage = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} data-density="hard" style={{width:'100%',height:'100%'}}>
    <div style={{width:'100%',height:'100%',position:'relative',overflow:'hidden',
      background:'linear-gradient(160deg,#7a4020 0%,#9b5228 30%,#8a4418 60%,#a85c30 100%)'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 40% 40%,rgba(180,100,40,0.3) 0%,rgba(0,0,0,0.45) 100%)'}}/>
      {/* leather texture */}
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)'}}/>
      <div style={{position:'absolute',inset:'1.2rem',border:'1px solid rgba(240,190,80,0.32)'}}/>
      <div style={{position:'absolute',inset:'1.9rem',border:'1px solid rgba(240,190,80,0.16)'}}/>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'3rem',textAlign:'center'}}>
        <div style={{width:'44px',height:'1px',background:'rgba(240,185,70,0.6)',marginBottom:'2rem'}}/>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:'3.2rem',color:'#f5c850',letterSpacing:'0.15em',marginBottom:'0.5rem',textShadow:'0 2px 12px rgba(0,0,0,0.5)'}}>felt.</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.8rem',color:'rgba(245,200,80,0.65)',letterSpacing:'0.35em',textTransform:'uppercase'}}>a life in moments</p>
        <div style={{width:'44px',height:'1px',background:'rgba(240,185,70,0.6)',marginTop:'2rem'}}/>
      </div>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'6px',background:'linear-gradient(to right,rgba(0,0,0,0.4),transparent)'}}/>
      <div style={{position:'absolute',right:0,top:0,bottom:0,width:'4px',background:'linear-gradient(to left,rgba(0,0,0,0.2),transparent)'}}/>
    </div>
  </div>
))
CoverPage.displayName='CoverPage'

// ─── Intro ────────────────────────────────────────────────────────────────────
const IntroPage = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} data-density="hard" style={{width:'100%',height:'100%'}}>
    <PageInner spineLeft>
      <div style={{padding:'2.5rem 2.2rem 2rem 2.8rem',height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{width:'36px',height:'2px',background:'rgba(150,110,50,0.4)',marginBottom:'2rem'}}/>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'1.05rem',color:'#3a2008',lineHeight:1.9,marginBottom:'1.8rem'}}>
          "Every moment you've felt lives here, written in the language of what mattered."
        </p>
        <div style={{width:'36px',height:'2px',background:'rgba(150,110,50,0.4)'}}/>
      </div>
    </PageInner>
  </div>
))
IntroPage.displayName='IntroPage'

// ─── Elegant frames ────────────────────────────────────────────────────────────
const getFrame = (seed: number, color: string): React.CSSProperties => {
  const frames: React.CSSProperties[] = [
    // Gallery shadow float
    { boxShadow:`3px 4px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(150,110,50,0.2)`, borderRadius:'2px' },
    // Color accent bottom bar
    { borderBottom:`3px solid ${color}`, boxShadow:'2px 3px 14px rgba(0,0,0,0.18)' },
    // Fine outline mat
    { outline:'1px solid rgba(150,110,50,0.35)', outlineOffset:'5px', boxShadow:'2px 3px 12px rgba(0,0,0,0.15)' },
    // Warm glow
    { boxShadow:`0 0 0 1px rgba(150,110,50,0.3), 4px 5px 20px rgba(0,0,0,0.22), 0 0 12px ${color}22` },
    // Corner shadow
    { boxShadow:'4px 4px 0 rgba(150,110,50,0.25), 6px 6px 16px rgba(0,0,0,0.18)' },
  ]
  return frames[seed % frames.length]
}

// ─── Determine if a moment needs 2 pages ────────────────────────────────────
function needsTwoPages(m: Moment) {
  const total = (m.poeticText?.length||0) + (m.description?.length||0)
  return total > 100 && !!m.frontPhotoUrl
}

// ─── Single compact page ──────────────────────────────────────────────────────
const CompactPage = forwardRef<HTMLDivElement,{m:Moment;pNum:number;seed:number}>(({m,pNum,seed},ref)=>{
  const color = EC[m.emotionWord?.toLowerCase()]||'#8a6030'
  const frame = getFrame(seed, color)
  const photoOnTop = seed%2===0
  return (
    <div ref={ref} style={{width:'100%',height:'100%'}}>
      <PageInner spineLeft>
        <div style={{padding:'1.5rem 1.8rem 1.2rem 2.2rem',height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',gap:'0.75rem',position:'relative',zIndex:1}}>
          {/* date */}
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.6rem',color:'rgba(80,45,10,0.5)',fontStyle:'italic'}}>
            {new Date(m.capturedAt).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
          </p>

          {photoOnTop ? (
            <>
              {/* Photo centered, big */}
              {m.frontPhotoUrl&&(
                <div style={{...frame,overflow:'hidden',flexShrink:0,marginLeft:'auto',marginRight:'auto',width:'100%'}}>
                  <img src={m.frontPhotoUrl} alt="" style={{display:'block',width:'100%',height:'210px',objectFit:'cover'}}/>
                </div>
              )}
              {/* emotion */}
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',background:color,flexShrink:0,boxShadow:`0 0 5px ${color}88`}}/>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:'0.5rem',letterSpacing:'0.22em',color:'rgba(60,35,8,0.6)',textTransform:'uppercase'}}>{m.emotionWord||'moment'}{m.location?` · ${m.location}`:''}</span>
              </div>
              {m.poeticText&&<p style={{fontFamily:"'Playfair Display',serif",fontStyle:'italic',fontSize:'0.88rem',color:'#2a1508',lineHeight:1.85,paddingLeft:'0.6rem',borderLeft:`2px solid ${color}66`}}>"{m.poeticText}"</p>}
              {m.description&&<p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.82rem',color:'#4a2a0a',lineHeight:1.75,marginTop:'auto'}}>{m.description}</p>}
            </>
          ) : (
            <>
              {/* text first */}
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',background:color,flexShrink:0,boxShadow:`0 0 5px ${color}88`}}/>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:'0.5rem',letterSpacing:'0.22em',color:'rgba(60,35,8,0.6)',textTransform:'uppercase'}}>{m.emotionWord||'moment'}{m.location?` · ${m.location}`:''}</span>
              </div>
              {m.poeticText&&<p style={{fontFamily:"'Playfair Display',serif",fontStyle:'italic',fontSize:'0.88rem',color:'#2a1508',lineHeight:1.85,paddingLeft:'0.6rem',borderLeft:`2px solid ${color}66`}}>"{m.poeticText}"</p>}
              {m.description&&<p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.82rem',color:'#4a2a0a',lineHeight:1.75}}>{m.description}</p>}
              {/* photo centered below */}
              {m.frontPhotoUrl&&(
                <div style={{...frame,overflow:'hidden',flexShrink:0,marginTop:'auto',marginLeft:'auto',marginRight:'auto',width:'100%'}}>
                  <img src={m.frontPhotoUrl} alt="" style={{display:'block',width:'100%',height:'200px',objectFit:'cover'}}/>
                </div>
              )}
            </>
          )}

          {m.emotionAnalysis?.weatherMood&&<p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.6rem',color:'rgba(80,45,10,0.38)',borderTop:'1px solid rgba(150,110,50,0.18)',paddingTop:'0.35rem'}}>{m.emotionAnalysis.weatherMood}</p>}
          <p style={{position:'absolute',bottom:'0.6rem',right:'1rem',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.52rem',color:'rgba(80,45,10,0.25)',fontStyle:'italic'}}>{pNum}</p>
        </div>
      </PageInner>
    </div>
  )
})
CompactPage.displayName='CompactPage'

// ─── Photo page (left of two-page spread) ────────────────────────────────────
const PhotoPage = forwardRef<HTMLDivElement,{m:Moment;pNum:number;seed:number}>(({m,pNum,seed},ref)=>{
  const color = EC[m.emotionWord?.toLowerCase()]||'#8a6030'
  const frame = getFrame(seed, color)
  const layout = seed % 3
  return (
    <div ref={ref} style={{width:'100%',height:'100%'}}>
      <PageInner spineLeft>
        <div style={{padding:'1.4rem 1.8rem 1.2rem 2.2rem',height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',position:'relative',zIndex:1,gap:'0.7rem'}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.6rem',color:'rgba(80,45,10,0.48)',fontStyle:'italic'}}>
            {new Date(m.capturedAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </p>

          {layout===0&&(
            // BIG photo centered taking most of page, small text below
            <>
              {m.frontPhotoUrl&&(
                <div style={{...frame,overflow:'hidden',flexShrink:0,marginLeft:'auto',marginRight:'auto',width:'100%'}}>
                  <img src={m.frontPhotoUrl} alt="" style={{display:'block',width:'100%',height:'300px',objectFit:'cover'}}/>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',background:color,flexShrink:0,boxShadow:`0 0 5px ${color}88`}}/>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:'0.5rem',letterSpacing:'0.22em',color:'rgba(60,35,8,0.6)',textTransform:'uppercase'}}>{m.emotionWord||'moment'}{m.location?` · ${m.location}`:''}</span>
              </div>
              {m.poeticText&&<p style={{fontFamily:"'Playfair Display',serif",fontStyle:'italic',fontSize:'0.85rem',color:'#2a1508',lineHeight:1.8,paddingLeft:'0.6rem',borderLeft:`2px solid ${color}66`}}>"{m.poeticText}"</p>}
            </>
          )}

          {layout===1&&(
            // Text at top, big photo centered below
            <>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',background:color,flexShrink:0}}/>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:'0.5rem',letterSpacing:'0.2em',color:'rgba(60,35,8,0.6)',textTransform:'uppercase'}}>{m.emotionWord||'moment'}{m.location?` · ${m.location}`:''}</span>
              </div>
              {m.poeticText&&<p style={{fontFamily:"'Playfair Display',serif",fontStyle:'italic',fontSize:'0.88rem',color:'#2a1508',lineHeight:1.85,paddingLeft:'0.6rem',borderLeft:`2px solid ${color}66`}}>"{m.poeticText}"</p>}
              {m.frontPhotoUrl&&(
                <div style={{...frame,overflow:'hidden',marginTop:'auto',marginLeft:'auto',marginRight:'auto',width:'100%'}}>
                  <img src={m.frontPhotoUrl} alt="" style={{display:'block',width:'100%',height:'270px',objectFit:'cover'}}/>
                </div>
              )}
            </>
          )}

          {layout===2&&(
            // Photo centered with caption below it
            <>
              {m.frontPhotoUrl&&(
                <div style={{...frame,overflow:'hidden',flexShrink:0,marginLeft:'auto',marginRight:'auto',width:'100%',flex:1}}>
                  <img src={m.frontPhotoUrl} alt="" style={{display:'block',width:'100%',height:'100%',objectFit:'cover',minHeight:'250px'}}/>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flexShrink:0}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',background:color,flexShrink:0}}/>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:'0.5rem',letterSpacing:'0.22em',color:'rgba(60,35,8,0.6)',textTransform:'uppercase'}}>{m.emotionWord||'moment'}{m.location?` · ${m.location}`:''}</span>
              </div>
            </>
          )}

          <p style={{position:'absolute',bottom:'0.6rem',right:'1rem',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.52rem',color:'rgba(80,45,10,0.25)',fontStyle:'italic'}}>{pNum}</p>
        </div>
      </PageInner>
    </div>
  )
})
PhotoPage.displayName='PhotoPage'

// ─── Text page (right of two-page spread) ────────────────────────────────────
const TextPage = forwardRef<HTMLDivElement,{m:Moment;pNum:number}>(({m,pNum},ref)=>{
  const color = EC[m.emotionWord?.toLowerCase()]||'#8a6030'
  return (
    <div ref={ref} style={{width:'100%',height:'100%'}}>
      <PageInner spineLeft>
        <div style={{padding:'1.8rem 1.8rem 1.4rem 2.4rem',height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',position:'relative',zIndex:1}}>
          <div style={{marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(150,110,50,0.22)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.45rem',marginBottom:'0.3rem'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:color,boxShadow:`0 0 6px ${color}88`,flexShrink:0}}/>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:'0.52rem',letterSpacing:'0.25em',color:'rgba(60,35,8,0.6)',textTransform:'uppercase'}}>{m.emotionWord||'moment'}{m.location?` · ${m.location}`:''}</span>
            </div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.65rem',color:'rgba(80,45,10,0.45)',fontStyle:'italic',marginLeft:'1.1rem'}}>
              {new Date(m.capturedAt).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
            </p>
          </div>
          {m.poeticText&&(
            <div style={{paddingLeft:'0.85rem',borderLeft:`3px solid ${color}66`,marginBottom:'1.2rem'}}>
              <p style={{fontFamily:"'Playfair Display',serif",fontStyle:'italic',fontSize:'1rem',color:'#2a1508',lineHeight:2}}>"{m.poeticText}"</p>
            </div>
          )}
          {m.description&&(
            <>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.52rem',letterSpacing:'0.2em',color:'rgba(80,45,10,0.45)',textTransform:'uppercase',marginBottom:'0.4rem'}}>What you felt</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.92rem',color:'#4a2a0a',lineHeight:1.85}}>{m.description}</p>
            </>
          )}
          {m.emotionAnalysis?.weatherMood&&(
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.68rem',color:'rgba(80,45,10,0.32)',marginTop:'auto',paddingTop:'0.6rem',borderTop:'1px solid rgba(150,110,50,0.18)',lineHeight:1.6}}>{m.emotionAnalysis.weatherMood}</p>
          )}
          <p style={{position:'absolute',bottom:'0.7rem',right:'1.1rem',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.55rem',color:'rgba(80,45,10,0.25)',fontStyle:'italic'}}>{pNum}</p>
        </div>
      </PageInner>
    </div>
  )
})
TextPage.displayName='TextPage'

// ─── Back cover — animated canvas with floating motes ────────────────────────
const BackCover = forwardRef<HTMLDivElement>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    const particles = Array.from({length:40},()=>({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.8+0.4,
      vx: (Math.random()-0.5)*0.18,
      vy: (Math.random()-0.5)*0.18,
      a: Math.random(),
      va: (Math.random()-0.5)*0.008,
    }))
    let t=0
    const draw=()=>{
      ctx.clearRect(0,0,W,H)
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.a+=p.va
        if(p.x<0)p.x=W; if(p.x>W)p.x=0
        if(p.y<0)p.y=H; if(p.y>H)p.y=0
        if(p.a<0.1||p.a>0.9)p.va*=-1
        ctx.globalAlpha = p.a*0.6
        ctx.fillStyle='#f5c850'
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill()
      })
      // gentle pulsing center glow
      const g = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.4)
      g.addColorStop(0,`rgba(200,140,40,${0.04+0.02*Math.sin(t*0.5)})`)
      g.addColorStop(1,'rgba(0,0,0,0)')
      ctx.globalAlpha=1; ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
      t+=0.02; rafRef.current=requestAnimationFrame(draw)
    }
    draw()
    return()=>cancelAnimationFrame(rafRef.current)
  },[])
  return (
    <div ref={ref} data-density="hard" style={{width:'100%',height:'100%'}}>
      <div style={{width:'100%',height:'100%',position:'relative',overflow:'hidden',
        background:'linear-gradient(160deg,#7a4020 0%,#9b5228 30%,#8a4418 60%,#a85c30 100%)'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 60% 60%,rgba(150,80,20,0.3),rgba(0,0,0,0.5))'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)'}}/>
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:'1.2rem',border:'1px solid rgba(240,185,70,0.28)'}}/>
        <div style={{position:'absolute',inset:'1.9rem',border:'1px solid rgba(240,185,70,0.14)'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'3rem',textAlign:'center'}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'1.1rem',color:'rgba(245,200,80,0.75)',lineHeight:1.9,marginBottom:'2rem',maxWidth:'260px',textShadow:'0 1px 6px rgba(0,0,0,0.4)'}}>
            "What you felt was real.<br/>That is enough."
          </p>
          <div style={{width:'44px',height:'1px',background:'rgba(240,185,70,0.5)',marginBottom:'1.5rem'}}/>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',color:'rgba(245,200,80,0.5)',letterSpacing:'0.15em',textShadow:'0 2px 10px rgba(0,0,0,0.4)'}}>felt.</p>
        </div>
        <div style={{position:'absolute',right:0,top:0,bottom:0,width:'6px',background:'linear-gradient(to left,rgba(0,0,0,0.4),transparent)'}}/>
      </div>
    </div>
  )
})
BackCover.displayName='BackCover'


function buildPages(raw: Moment[]) {
  const sorted = [...raw].sort((a,b)=>new Date(a.capturedAt).getTime()-new Date(b.capturedAt).getTime())
  const out: React.ReactElement[] = []
  let pNum = 1
  sorted.forEach((m, i) => {
    const seed = i * 3 + 5
    if (needsTwoPages(m)) {
      out.push(<PhotoPage key={`ph-${m.id}`} m={m} pNum={pNum++} seed={seed}/>)
      out.push(<TextPage key={`tx-${m.id}`} m={m} pNum={pNum++}/>)
    } else {
      out.push(<CompactPage key={`cp-${m.id}`} m={m} pNum={pNum++} seed={seed}/>)
    }
  })
  return out
}

// ─── Book component ───────────────────────────────────────────────────────────
// ─── Ink Drop PDF Button ──────────────────────────────────────────────────────
function InkDropDownload({ moments, user }: { moments: Moment[]; user: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const [hov, setHov] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const hovRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const DPR = window.devicePixelRatio || 1
    const CW = 80, CH = 130
    canvas.width = CW * DPR; canvas.height = CH * DPR
    canvas.style.width = CW + 'px'; canvas.style.height = CH + 'px'
    ctx.scale(DPR, DPR)
    const cx = CW / 2
    const ANCHOR_Y = 8
    const LAND_Y = CH - 18

    // 5 phases: 0=form, 1=hang, 2=fall, 3=splash, 4=pause
    let phase = 0, pt = 0
    const spd = [0.010, 0.020, 0.038, 0.038, 0.055]

    const dot = (x:number, y:number, r:number, a:number) => {
      if (r < 0.2) return
      const g = ctx.createRadialGradient(x-r*.3, y-r*.3, 0, x, y, r*1.4)
      g.addColorStop(0, `rgba(255,230,110,${a})`)
      g.addColorStop(0.4, `rgba(215,150,40,${a*.95})`)
      g.addColorStop(1, `rgba(110,55,8,${a*.8})`)
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill()
      // highlight
      ctx.fillStyle = `rgba(255,255,200,${a*.4})`
      ctx.beginPath(); ctx.ellipse(x-r*.3, y-r*.3, r*.25, r*.2, -0.4, 0, Math.PI*2); ctx.fill()
    }

    // Draw a proper teardrop: pointy top, round bottom
    const teardrop = (x:number, cy:number, rx:number, ry:number, a:number) => {
      if (rx < 0.3 || ry < 0.3) return
      const g = ctx.createRadialGradient(x-rx*.3, cy, 0, x, cy+ry*.2, Math.max(rx,ry)*1.4)
      g.addColorStop(0, `rgba(255,230,110,${a})`)
      g.addColorStop(0.4, `rgba(215,150,40,${a*.95})`)
      g.addColorStop(1, `rgba(110,55,8,${a*.8})`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(x, cy - ry)           // pointy top
      ctx.bezierCurveTo(x+rx*.8, cy-ry*.3, x+rx, cy+ry*.4, x, cy+ry)  // right side
      ctx.bezierCurveTo(x-rx, cy+ry*.4, x-rx*.8, cy-ry*.3, x, cy-ry)  // left side
      ctx.fill()
      ctx.fillStyle = `rgba(255,255,200,${a*.4})`
      ctx.beginPath(); ctx.ellipse(x-rx*.3, cy-ry*.2, rx*.25, ry*.22, -0.3, 0, Math.PI*2); ctx.fill()
    }

    const draw = () => {
      ctx.clearRect(0, 0, CW, CH)
      pt += spd[phase]
      if (pt >= 1) { pt = 0; phase = (phase+1) % 5 }
      const p = pt
      const eio = (t:number) => t<.5 ? 2*t*t : -1+(4-2*t)*t

      // anchor dot at top
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#c8750a'
      ctx.beginPath(); ctx.arc(cx, ANCHOR_Y, 2, 0, Math.PI*2); ctx.fill()
      ctx.globalAlpha = 1

      if (phase === 0) {
        // FORM — drop grows from anchor, teardrop pointing up (pointy top, round bottom)
        const ep = eio(p)
        const rx = ep * 7
        const ry = ep * 10
        const y = ANCHOR_Y + 4 + ry  // bottom of drop
        // thread
        if (ep > 0.15) {
          ctx.strokeStyle = `rgba(160,90,20,${ep*.5})`; ctx.lineWidth = ep*2; ctx.lineCap='round'
          ctx.beginPath(); ctx.moveTo(cx, ANCHOR_Y+2); ctx.lineTo(cx, y-ry); ctx.stroke()
        }
        teardrop(cx, y - ry*.5, rx, ry, ep)

      } else if (phase === 1) {
        // HANG — drop sways gently, builds tension
        const sway = Math.sin(p * Math.PI * 2.5) * 2.8 * (1 - p*.3)
        const pulse = 1 + .05 * Math.sin(p * Math.PI * 4)
        const y = ANCHOR_Y + 14
        // thread
        ctx.strokeStyle = 'rgba(160,90,20,0.4)'; ctx.lineWidth = 1.5; ctx.lineCap='round'
        ctx.beginPath(); ctx.moveTo(cx, ANCHOR_Y+2); ctx.quadraticCurveTo(cx+sway*.2, ANCHOR_Y+8, cx+sway, y-10*pulse); ctx.stroke()
        teardrop(cx+sway, y-5*pulse, 7, 10*pulse, 1)

      } else if (phase === 2) {
        // FALL — pure physics, drop accelerates downward
        const ep = eio(p) // still ease but heavier at start
        const grav = p * p * 1.2 + p * .4  // parabolic with some ease
        const dropY = ANCHOR_Y + 14 + grav * (LAND_Y - ANCHOR_Y - 14)
        // elongate with speed
        const speed = p * p
        const rx = 7 * (1 - speed*.2)
        const ry = 10 * (1 + speed*.5)
        // faint trail
        if (p > .25) {
          const trailLen = speed * 20
          const tg = ctx.createLinearGradient(cx, dropY-ry-trailLen, cx, dropY-ry)
          tg.addColorStop(0,'rgba(200,140,40,0)'); tg.addColorStop(1,`rgba(200,140,40,${speed*.3})`)
          ctx.strokeStyle=tg; ctx.lineWidth=rx*.6; ctx.lineCap='round'
          ctx.beginPath(); ctx.moveTo(cx, dropY-ry-trailLen); ctx.lineTo(cx, dropY-ry); ctx.stroke()
        }
        teardrop(cx, dropY, rx, ry, 1)

      } else if (phase === 3) {
        // SPLASH
        const ep = eio(p)
        const sy = LAND_Y
        // flatten and disappear
        if (p < .35) {
          const fp = p/.35
          teardrop(cx, sy, 7+fp*9, 10*(1-fp*.95), 1-fp*.8)
        }
        // ripple rings
        for (let r=0; r<2; r++) {
          const delay = r * .18
          if (p > delay) {
            const rp = Math.min(1, (p-delay)/.82)
            const ringR = rp * (18 + r*6)
            ctx.globalAlpha = (1-rp) * (.55 - r*.15)
            ctx.strokeStyle='rgba(200,150,40,0.9)'; ctx.lineWidth=1.5-r*.4
            ctx.beginPath(); ctx.ellipse(cx, sy, ringR, ringR*.28, 0, 0, Math.PI*2); ctx.stroke()
          }
        }
        ctx.globalAlpha = 1
        // crown droplets arcing up
        const nD = 5
        for (let i=0; i<nD; i++) {
          const t2 = i/(nD-1)  // 0 to 1 across
          const ang = -Math.PI*.6 + t2 * Math.PI*.6 * 2  // fan out
          const dist = p * 13 * (0.7 + Math.abs(t2-.5)*.6)
          const bx = cx + Math.cos(ang) * dist
          // parabolic arc upward then down
          const vy0 = 18 + Math.abs(t2-.5)*8
          const by = sy - p*vy0 + p*p*vy0*1.8
          const dr = (2 - Math.abs(t2-.5)*1.5) * (1-p*.8)
          if (dr > 0.2) { ctx.globalAlpha=(1-p)*.9; dot(bx,by,dr,1); ctx.globalAlpha=1 }
        }
      }
      // phase 4 = nothing (pause/reset)

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const sorted = [...moments].sort((a,b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, H = 297
      const margin = 20

      // Helper: add parchment background
      const addParchment = () => {
        pdf.setFillColor(254, 249, 240)
        pdf.rect(0, 0, W, H, 'F')
        // subtle ruled lines
        pdf.setDrawColor(180, 155, 110, 0.15)
        pdf.setLineWidth(0.1)
        for (let y = 30; y < H - 20; y += 8) {
          pdf.line(margin, y, W - margin, y)
        }
      }

      // Helper: add page number
      const addPageNum = (n: number) => {
        pdf.setFont('times', 'italic')
        pdf.setFontSize(8)
        pdf.setTextColor(120, 80, 30, 0.4)
        pdf.text(String(n), W - margin, H - 10, { align: 'right' })
      }

      // Helper: emotion color as hex
      const getEC = (word: string) => {
        const m: Record<string,string> = {
          nostalgic:'#5a7fa0', belonging:'#4a8a5f', wonder:'#b07830', peace:'#5a7a60',
          joy:'#c07030', melancholy:'#6858a0', awe:'#a08030', love:'#a05050',
          excited:'#c07030', sky:'#4a8aaa', sad:'#6858a0', happy:'#6a8a30',
          frustrated:'#a03030', longing:'#6858a0', expansive:'#4a8aaa', stillness:'#5a7a68',
        }
        return m[word?.toLowerCase()] || '#8a6030'
      }
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
        return [r,g,b]
      }

      // ── COVER PAGE ──
      pdf.setFillColor(122, 64, 32)
      pdf.rect(0, 0, W, H, 'F')
      pdf.setFillColor(155, 82, 40)
      pdf.rect(0, 0, W, H/2, 'F')
      // border
      pdf.setDrawColor(240, 185, 70); pdf.setLineWidth(0.5)
      pdf.rect(12, 12, W-24, H-24)
      pdf.rect(18, 18, W-36, H-36)
      // title
      pdf.setFont('times', 'bolditalic')
      pdf.setTextColor(245, 200, 80)
      pdf.setFontSize(52)
      pdf.text('felt.', W/2, H/2 - 10, { align: 'center' })
      pdf.setFontSize(11)
      pdf.setFont('times', 'italic')
      pdf.setTextColor(245, 200, 80, 0.7)
      pdf.text('A LIFE IN MOMENTS', W/2, H/2 + 10, { align: 'center' })
      pdf.setLineWidth(0.4)
      pdf.setDrawColor(240, 185, 70, 0.6)
      pdf.line(W/2 - 20, H/2 - 20, W/2 + 20, H/2 - 20)
      pdf.line(W/2 - 20, H/2 + 18, W/2 + 20, H/2 + 18)
      // owner name
      if (user?.name) {
        pdf.setFontSize(10); pdf.setFont('times','italic'); pdf.setTextColor(245, 200, 80, 0.5)
        pdf.text(user.name, W/2, H - 35, { align: 'center' })
      }

      let pageNum = 1

      // ── MOMENT PAGES ──
      for (const m of sorted) {
        pdf.addPage()
        addParchment()
        pageNum++

        const color = getEC(m.emotionWord||'')
        const [cr,cg,cb] = hexToRgb(color)
        let y = margin + 5

        // date
        pdf.setFont('times', 'italic'); pdf.setFontSize(8)
        pdf.setTextColor(100, 65, 20, 0.55)
        pdf.text(new Date(m.capturedAt).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}), margin, y)
        y += 8

        // emotion dot + word
        pdf.setFillColor(cr, cg, cb)
        pdf.circle(margin + 2, y - 2, 1.5, 'F')
        pdf.setFont('times', 'bold'); pdf.setFontSize(7)
        pdf.setTextColor(80, 50, 15)
        const label = `${(m.emotionWord||'moment').toUpperCase()}${m.location ? ' · ' + m.location.toUpperCase() : ''}`
        pdf.text(label, margin + 6, y)
        y += 10

        // photo — fetch via backend proxy to bypass S3 CORS
        if (m.frontPhotoUrl) {
          try {
            const token = localStorage.getItem('felt_token')
            const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/moments/proxy-image?url=${encodeURIComponent(m.frontPhotoUrl)}`
            const resp = await fetch(proxyUrl, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (resp.ok) {
              const blob = await resp.blob()
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
              })
              const imgW = W - margin * 2
              const imgH = 85
              pdf.setFillColor(cr, cg, cb)
              pdf.rect(margin, y, 2, imgH, 'F')
              const fmt = m.frontPhotoUrl.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG'
              pdf.addImage(dataUrl, fmt, margin + 3, y, imgW - 3, imgH, '', 'MEDIUM')
              pdf.setDrawColor(150, 110, 50, 0.15); pdf.setLineWidth(0.2)
              pdf.line(margin + 3, y + imgH + 0.5, margin + imgW, y + imgH + 0.5)
              y += imgH + 8
            }
          } catch(e) {
            console.warn('Image proxy failed for:', m.frontPhotoUrl, e)
            y += 5
          }
        }

        // separator
        pdf.setDrawColor(cr, cg, cb, 0.4); pdf.setLineWidth(0.5)
        pdf.line(margin, y, W - margin, y)
        y += 7

        // poetic text
        if (m.poeticText) {
          pdf.setFont('times', 'italic'); pdf.setFontSize(12)
          pdf.setTextColor(42, 21, 8)
          // accent bar
          pdf.setFillColor(cr, cg, cb, 0.4)
          pdf.rect(margin, y - 4, 2, 28, 'F')
          const lines = pdf.splitTextToSize(`"${m.poeticText}"`, W - margin * 2 - 6)
          pdf.text(lines, margin + 5, y)
          y += lines.length * 7 + 6
        }

        // user description
        if (m.description) {
          pdf.setFont('times', 'normal'); pdf.setFontSize(8.5)
          pdf.setTextColor(80, 50, 15, 0.7)
          pdf.text('WHAT YOU FELT', margin, y); y += 5
          pdf.setFont('times', 'italic'); pdf.setFontSize(10); pdf.setTextColor(70, 40, 12)
          const dlines = pdf.splitTextToSize(m.description, W - margin * 2)
          pdf.text(dlines, margin, y)
          y += dlines.length * 6 + 5
        }

        // weather mood
        if (m.emotionAnalysis?.weatherMood) {
          pdf.setFont('times', 'italic'); pdf.setFontSize(8.5)
          pdf.setTextColor(100, 65, 20, 0.38)
          pdf.setDrawColor(150, 110, 50, 0.18); pdf.setLineWidth(0.2)
          pdf.line(margin, H - 22, W - margin, H - 22)
          const wlines = pdf.splitTextToSize(m.emotionAnalysis.weatherMood, W - margin * 2)
          pdf.text(wlines, margin, H - 18)
        }

        addPageNum(pageNum - 1)
      }

      // ── BACK COVER ──
      pdf.addPage()
      pdf.setFillColor(122, 64, 32); pdf.rect(0, 0, W, H, 'F')
      pdf.setFillColor(168, 92, 48); pdf.rect(W/3, 0, W*2/3, H, 'F')
      pdf.setDrawColor(240, 185, 70, 0.28); pdf.setLineWidth(0.5)
      pdf.rect(12, 12, W-24, H-24)
      pdf.setFont('times', 'bolditalic'); pdf.setFontSize(13)
      pdf.setTextColor(245, 200, 80, 0.75)
      pdf.text('"What you felt was real.', W/2, H/2 - 8, { align: 'center' })
      pdf.text('That is enough."', W/2, H/2 + 4, { align: 'center' })
      pdf.setDrawColor(240, 185, 70, 0.45); pdf.line(W/2-18, H/2+14, W/2+18, H/2+14)
      pdf.setFontSize(18); pdf.setFont('times','bolditalic'); pdf.setTextColor(245, 200, 80, 0.45)
      pdf.text('felt.', W/2, H/2 + 26, { align: 'center' })

      pdf.save(`${user?.name || 'my'}-felt-story.pdf`)
    } catch(e) {
      console.error('PDF error:', e)
    }
    setDownloading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0', cursor:'none' }}
      onMouseEnter={() => { hovRef.current = true; setHov(true) }}
      onMouseLeave={() => { hovRef.current = false; setHov(false) }}
      onClick={handleDownload}
    >
      <canvas ref={canvasRef} style={{ width:'80px', height:'140px', display:'block' }}/>
      <p style={{
        fontFamily:"'Playfair Display',serif", fontStyle:'italic',
        fontSize:'0.68rem', letterSpacing:'0.03em',
        color: downloading ? 'rgba(200,151,90,0.45)' : hov ? '#f0c850' : 'rgba(200,151,90,0.5)',
        textAlign:'center', whiteSpace:'pre-line',
        animation: downloading ? 'none' : 'inkBeat 2s ease-in-out infinite',
        textShadow: hov ? '0 0 14px rgba(240,185,70,0.7)' : 'none',
        transition:'all 0.3s', maxWidth:'85px', lineHeight:1.4,
        marginTop:'-8px',
      }}>
        {downloading ? 'preparing\nyour book...' : 'download\nmy story'}
      </p>
      <style>{`
        @keyframes inkBeat {
          0%,100% { opacity:0.45; letter-spacing:0.03em; }
          50% { opacity:1; letter-spacing:0.06em; text-shadow: 0 0 12px rgba(240,185,70,0.55); }
        }
      `}</style>
    </div>
  )
}

// ─── Book component ───────────────────────────────────────────────────────────
function Book({ moments, user }: { moments: Moment[]; user: any }) {
  const bookRef = useRef<any>(null)
  const [page, setPage] = useState(0)
  const playSound = usePageSound()
  const pages = buildPages(moments)
  const totalVisible = pages.length

  const onFlip = useCallback((e:any)=>{ setPage(e.data); playSound() },[playSound])
  const flipNext = ()=>{ bookRef.current?.pageFlip().flipNext(); playSound() }
  const flipPrev = ()=>{ bookRef.current?.pageFlip().flipPrev(); playSound() }

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',position:'relative'}}>
      <style>{PAGE_STYLES}</style>

      {/* ink drop download — top right of book */}
      <div style={{position:'absolute',top:'-20px',right:'-10px',zIndex:50}}>
        <InkDropDownload moments={moments} user={user}/>
      </div>

      <HTMLFlipBook
        ref={bookRef}
        width={340} height={480}
        size="stretch"
        minWidth={260} maxWidth={440}
        minHeight={360} maxHeight={580}
        maxShadowOpacity={0.6}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={onFlip}
        flippingTime={750}
        style={{margin:'0 auto'}}
        className="felt-book"
        startPage={0}
        drawShadow={true}
        usePortrait={false}
      >
        <CoverPage/>
        <IntroPage/>
        {pages}
        <BackCover/>
      </HTMLFlipBook>

      <div style={{display:'flex',alignItems:'center',gap:'2rem',marginTop:'1.8rem'}}>
        <button onClick={flipPrev} style={{background:'transparent',border:'1px solid rgba(200,151,90,0.2)',color:page===0?'rgba(200,151,90,0.15)':'var(--gold)',width:'44px',height:'44px',borderRadius:'50%',fontSize:'1rem',cursor:'none',transition:'all 0.3s'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(200,151,90,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
        >←</button>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.82rem',color:'var(--muted)',textAlign:'center',minWidth:'120px'}}>
          {page===0?'Cover':`Page ${page} of ${totalVisible}`}
        </p>
        <button onClick={flipNext} style={{background:'transparent',border:'1px solid rgba(200,151,90,0.2)',color:page>=totalVisible?'rgba(200,151,90,0.15)':'var(--gold)',width:'44px',height:'44px',borderRadius:'50%',fontSize:'1rem',cursor:'none',transition:'all 0.3s'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(200,151,90,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
        >→</button>
      </div>

      {page===0&&(
        <p style={{marginTop:'0.8rem',fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.78rem',color:'rgba(200,151,90,0.4)',animation:'shimmer2 2.5s ease-in-out infinite'}}>
          drag the corner of the cover or press →
        </p>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyStoryPage() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    const token=localStorage.getItem('felt_token')
    const ud=localStorage.getItem('felt_user')
    if(!token){window.location.href='/login';return}
    if(ud)setUser(JSON.parse(ud))
    // Refetch fresh user data in case it changed in Settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json()).then(d=>{
        const u = d?.data?.data || d?.data || d
        if (u && (u.id || u.email)) { setUser(u); localStorage.setItem('felt_user', JSON.stringify(u)) }
      }).catch(()=>{})
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/moments`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json()).then(d=>{
        const raw=(d.data||[]).filter((m:any)=>m.isGenerated&&m.poeticText)
        setMoments(raw);setLoading(false)
      }).catch(()=>setLoading(false))
  },[])

  const logout=()=>{localStorage.removeItem('felt_token');localStorage.removeItem('felt_user');window.location.href='/'}

  return (
    <>
      <Cursor/>
      <div style={{display:'flex',minHeight:'100vh',position:'relative',zIndex:2}}>
        <VineSidebar user={user} onLogout={logout}/>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem 2rem'}}>
          {loading
            ? <p style={{color:'var(--muted)',fontStyle:'italic',fontFamily:"'Playfair Display',serif",animation:'pulse 2s ease-in-out infinite'}}>Opening your book...</p>
            : moments.length===0
              ? <div style={{textAlign:'center'}}><p style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',marginBottom:'1rem'}}>No felt moments yet</p><Link href="/moments/new" style={{color:'var(--gold)',fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic'}}>Capture your first moment →</Link></div>
              : <Book moments={moments} user={user}/>
          }
        </div>
      </div>
    </>
  )
}