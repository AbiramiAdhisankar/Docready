/** Before/after page pair. Real text in real fonts, so the contrast is the point. */
const body = 'Reinforcement learning studies how an agent improves its decisions by interacting with an environment and learning from reward.'

export default function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl" role="img" aria-label="A messy document with mixed fonts next to the same document formatted cleanly in Times New Roman, justified, with a header and page number">
      <div className="grid grid-cols-2 items-start gap-3 sm:gap-6">
        <div className="-rotate-2 rounded-page bg-white p-3 shadow-sheet sm:p-5" aria-hidden>
          <p className="mb-2 text-[9px] font-semibold text-muted">report-v3-final(2).docx</p>
          <p style={{ fontFamily: '"Comic Sans MS","Comic Neue",cursive' }} className="text-[13px] font-bold leading-tight sm:text-base">Seminar report</p>
          <p style={{ fontFamily: 'Verdana,sans-serif' }} className="mt-1.5 text-left text-[8px] leading-snug sm:text-[10px]">1. Introduction</p>
          <p style={{ fontFamily: '"Courier New",monospace' }} className="mt-1 text-left text-[7px] leading-none sm:text-[9px]">{body}</p>
          <p style={{ fontFamily: 'Georgia,serif' }} className="mt-3 text-center text-[9px] leading-snug sm:text-[11px]">{body}</p>
          <p style={{ fontFamily: 'Arial,sans-serif' }} className="mt-1 text-right text-[8px] leading-tight sm:text-[10px]">{body.slice(0, 70)}</p>
        </div>
        <div className="relative rotate-1 rounded-page bg-white px-4 pb-6 pt-5 shadow-sheet sm:px-7 sm:pb-8 sm:pt-7" aria-hidden>
          <div className="pointer-events-none absolute inset-x-3 inset-y-3 border border-dashed border-accent/25 sm:inset-x-5 sm:inset-y-5" />
          <p className="absolute right-4 top-1.5 text-[7px] text-muted sm:right-7 sm:text-[9px]" style={{ fontFamily: '"Times New Roman",serif' }}>Seminar Report</p>
          <p style={{ fontFamily: '"Times New Roman",Times,serif' }} className="text-center text-[13px] font-bold sm:text-base">Seminar Report</p>
          <p style={{ fontFamily: '"Times New Roman",Times,serif' }} className="mt-2 text-[9px] font-bold sm:text-[11px]">1. Introduction</p>
          <p style={{ fontFamily: '"Times New Roman",Times,serif', lineHeight: 1.5, textAlign: 'justify' }} className="mt-1 text-[8px] sm:text-[10px]">{body} {body.slice(0, 60)}</p>
          <p style={{ fontFamily: '"Times New Roman",Times,serif', lineHeight: 1.5, textAlign: 'justify' }} className="mt-1 text-[8px] sm:text-[10px]">{body}</p>
          <p className="mt-3 text-center text-[8px] text-muted sm:text-[10px]" style={{ fontFamily: '"Times New Roman",serif' }}>1</p>
        </div>
      </div>
      <p className="mt-5 text-center text-xs font-medium text-muted sm:text-sm">
        Times New Roman · 12 pt · Justified · 1.5 spacing · A4
      </p>
    </div>
  )
}
