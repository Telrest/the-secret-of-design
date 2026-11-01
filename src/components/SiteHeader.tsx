import { NavLink } from 'react-router-dom'

/** 站名标记：一枚图纸角标，不用位图，缩放不糊 */
function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 9.5h25M1.5 18.5h25M9.5 1.5v25M18.5 1.5v25" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
      <circle cx="14" cy="14" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 1.5v5M14 21.5v5M1.5 14h5M21.5 14h5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header className="site-header">
      {/* 子站上下文：说明这是一座挂在博客实验室下的展馆，而不是独立站点。 */}
      <div className="blog-context">
        <div className="shell blog-context__inner">
          <a className="blog-context__back" href="../../">
            <span aria-hidden="true">←</span> Telrest 的博客
          </a>
          <span className="blog-context__sep" aria-hidden="true">/</span>
          <a className="blog-context__crumb" href="../../lab/">实验室</a>
          <span className="blog-context__sep" aria-hidden="true">/</span>
          <span className="blog-context__current">实验 003 · 设计的秘密</span>
        </div>
      </div>
      <div className="shell site-header__inner">
        <NavLink to="/" className="brand" aria-label="设计的秘密 · 返回首页">
          <BrandMark />
          <span className="brand__text">
            <span className="brand__name">设计的秘密</span>
            <span className="brand__sub">一座可以亲手操作的原理展馆</span>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="主导航">
          <NavLink to="/" end className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}>
            首页
          </NavLink>
          <NavLink to="/game" className={({ isActive }) => `site-nav__link site-nav__link--play${isActive ? ' is-active' : ''}`}>
            魔丸模式
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}>
            关于展馆
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
