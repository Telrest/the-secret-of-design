import {
  createContext, lazy, Suspense, useCallback, useContext, useEffect, useLayoutEffect,
  useMemo, useRef, useState,
  type CSSProperties, type MouseEvent, type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'

// 只有点击游戏入口后才下载三维徽章，首页不提前加载 three.js。
const EntranceBadge = lazy(() => import('./EntranceBadge'))

interface EntranceOrigin { id: number; x: number; y: number }
interface EntranceContext {
  enter: (event: MouseEvent<HTMLElement>) => void
  settled: () => void
  active: boolean
}
const Context = createContext<EntranceContext>({ enter: () => {}, settled: () => {}, active: false })
export const useGameEntrance = () => useContext(Context)

export function GameEntranceProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [origin, setOrigin] = useState<EntranceOrigin | null>(null)
  const [ready, setReady] = useState(false)
  const serial = useRef(0)
  const pageRef = useRef<HTMLDivElement>(null)
  const active = origin !== null

  const enter = useCallback((event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey || pathname === '/game') return
    const cta = event.currentTarget.querySelector('.mowan-teaser__cta') ?? event.currentTarget
    const box = cta.getBoundingClientRect()
    const visible = box.bottom > 0 && box.top < window.innerHeight
    const x = visible ? box.left + box.width / 2 : event.clientX
    const y = visible ? box.top + box.height / 2 : event.clientY
    setReady(false)
    setOrigin({
      id: ++serial.current,
      x: Math.max(16, Math.min(window.innerWidth - 16, x)),
      y: Math.max(16, Math.min(window.innerHeight - 16, y)),
    })
  }, [pathname])
  const settled = useCallback(() => setReady(true), [])
  const finish = useCallback(() => {
    setOrigin(null)
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('.mowan-start:not(:disabled)')?.focus({ preventScroll: true })
    })
  }, [])

  // 后退或切换到别的页面时立即撤掉遮罩。
  useEffect(() => {
    if (pathname !== '/game') setOrigin(null)
  }, [pathname])

  useLayoutEffect(() => {
    if (!active) return
    const overflow = document.body.style.overflow
    const page = pageRef.current
    document.body.style.overflow = 'hidden'
    if (page) page.inert = true
    return () => {
      document.body.style.overflow = overflow
      if (page) page.inert = false
    }
  }, [active])

  const context = useMemo(() => ({ enter, settled, active }), [enter, settled, active])
  return (
    <Context.Provider value={context}>
      <div ref={pageRef}>{children}</div>
      {origin && <Entrance key={origin.id} origin={origin} ready={ready} onFinish={finish} />}
    </Context.Provider>
  )
}

function BadgeFallback() {
  return <img className="game-entrance__fallback" src={`${import.meta.env.BASE_URL}mowan/beihang-logo.jpg`} alt="" />
}

function Entrance({ origin, ready, onFinish }: {
  origin: EntranceOrigin; ready: boolean; onFinish: () => void
}) {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [arrived, setArrived] = useState(false)
  const [centered, setCentered] = useState(reduced)
  const [fading, setFading] = useState(false)
  const skipRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => { skipRef.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => setArrived(true), reduced ? 350 : 3200)
    return () => window.clearTimeout(timer)
  }, [reduced])
  useEffect(() => {
    if (arrived && centered && ready) setFading(true)
  }, [arrived, centered, ready])
  useEffect(() => {
    if (!fading) return
    const timer = window.setTimeout(onFinish, reduced ? 220 : 900)
    return () => window.clearTimeout(timer)
  }, [fading, onFinish, reduced])

  return (
    <div
      className={`game-entrance${centered ? ' has-arrived' : ''}${fading ? ' is-leaving' : ''}`}
      style={{ '--entry-x': `${origin.x}px`, '--entry-y': `${origin.y}px` } as CSSProperties}
      role="dialog" aria-modal="true" aria-label="魔丸模式入场" aria-describedby="entrance-status"
      onKeyDownCapture={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape') onFinish()
        if (event.key === 'Tab') { event.preventDefault(); skipRef.current?.focus() }
      }}
    >
      <div className="game-entrance__dark" />
      <div className="game-entrance__rays" />
      <div className="game-entrance__halo" />
      <div className="game-entrance__flight" aria-hidden="true" onAnimationEnd={(event) => {
        if (event.animationName === 'entrance-flight') setCentered(true)
      }}>
        <div className="game-entrance__badge">
          <BadgeFallback />
          <Suspense fallback={null}><EntranceBadge /></Suspense>
        </div>
      </div>
      <div className="game-entrance__caption">
        <p className="game-entrance__eyebrow">BEIHANG · 魔丸模式</p>
        <p className="game-entrance__title">准备，冲向满绩。</p>
        <p id="entrance-status" className="game-entrance__status" role="status">
          {ready ? '发动机就绪 · 即将入场' : '正在唤醒发动机…'}
        </p>
      </div>
      <button type="button" className="game-entrance__skip" ref={skipRef} onClick={onFinish}>
        跳过入场 <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
