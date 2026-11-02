import { Link } from 'react-router-dom'

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  document.querySelector<HTMLAnchorElement>('.site-header .brand')?.focus({ preventScroll: true })
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__col">
          <p className="site-footer__brand">设计的秘密</p>
          <p className="site-footer__note">大学网站作业 · 交互式原理展馆</p>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__label">参考与许可</p>
          <p className="site-footer__note">
            建模与验证方法参考{' '}
            <a href="https://github.com/elvarofficial/teardown" target="_blank" rel="noreferrer noopener">
              elvarofficial/teardown
            </a>
            （MIT）。完整来源见 <Link to="/about">关于展馆</Link>。
          </p>
        </div>
        <div className="site-footer__top">
          <button type="button" className="btn site-footer__top-button" onClick={scrollToTop}>
            <span aria-hidden="true">↑</span>
            回到顶部
          </button>
        </div>
      </div>
    </footer>
  )
}
