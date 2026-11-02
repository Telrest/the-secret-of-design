import './GuideModeNotice.css'

interface GuideModeNoticeProps {
  onExit: () => void
  /** 二维图表没有 ModelStage，用普通文档流呈现同样的提示条。 */
  inline?: boolean
  /** 骨骼舞台还承载标注层，需要独立的可点击浮层。 */
  overlay?: boolean
}

export function GuideModeNotice({ onExit, inline = false, overlay = false }: GuideModeNoticeProps) {
  const content = (
    <>
      <p className="stage-notice__text">现在处于导览模式，退出导览模式以自由操作</p>
      <button type="button" className="stage-notice__action" onClick={onExit}>
        退出导览
      </button>
    </>
  )

  return inline ? (
    <div
      className="model-stage__notice"
      style={{ position: 'static', transform: 'none', maxWidth: '100%', marginBottom: 16 }}
    >
      {content}
    </div>
  ) : overlay ? (
    <div className="guide-mode-notice--overlay">{content}</div>
  ) : content
}
