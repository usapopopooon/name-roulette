import { useEffect, useRef } from 'react'

export interface ManualDialogProps {
  onClose: () => void
}

const sections = [
  {
    title: '基本の使い方',
    items: [
      '左のテキストエリアに参加者の名前を改行区切りで入力します',
      '「スタート！」ボタンを押すとルーレットが回転し、当選者が決まります',
      '「リセット」ボタンで当選履歴や確率の変更をリセットできます',
    ],
  },
  {
    title: 'ドラッグ回転',
    items: [
      'ルーレットをドラッグして直接回すことができます',
      '勢いよく離すと慣性で回り続けます',
    ],
  },
  {
    title: '「さん」付けオプション',
    items: [
      'チェックを入れると、各参加者の名前の横に「さん」が表示されます',
      'ルーレットや当選表示にも反映されます',
    ],
  },
  {
    title: '右クリックメニュー',
    items: [
      'ルーレット上の名前を右クリックすると、メニューが表示されます',
      '「確率を倍にする」で当選確率を2倍に',
      '「確率を半分にする」で当選確率を1/2に',
      '「削除」で参加者を除外',
    ],
  },
  {
    title: '「待った！」機能',
    items: [
      '当選表示の「待った！」ボタンで異議を申し立てられます',
      '当選者の確率が半分になり、自動で再抽選されます',
    ],
  },
  {
    title: '前回当選者の除外',
    items: [
      '前回の当選者がいる状態でスタートすると、除外するか確認されます',
      '除外すると、その人の当選確率が0になります',
    ],
  },
  {
    title: '当選者のシフト',
    items: ['当選表示を右クリックすると、隣の候補者にシフトできます'],
  },
  {
    title: 'URL共有',
    items: [
      '「共有リンクをコピー」で参加者リストや設定をURLに含めて共有できます',
      'リンクを開くと同じ参加者リストが復元されます',
    ],
  },
  {
    title: '動物乱入',
    items: [
      'まれに猫やアヒルが画面を横切り、ルーレットが少しだけ回って結果が変わることがあります',
    ],
  },
]

export function ManualDialog({ onClose }: ManualDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="使い方"
        tabIndex={-1}
        className="relative max-w-lg w-[90vw] max-h-[80vh] overflow-y-auto p-8 rounded-2xl bg-gradient-to-br from-dark-secondary/95 to-dark-tertiary/95 border-2 border-purple-start/30 shadow-[0_0_40px_rgba(102,126,234,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none cursor-pointer transition-colors"
          aria-label="閉じる"
        >
          &times;
        </button>

        <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-6">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-current text-base font-bold leading-none">
            ?
          </span>
          使い方
        </h2>

        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-semibold text-purple-start mb-1.5">
                {section.title}
              </h3>
              <ul className="space-y-1 text-sm text-gray-300">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="pl-4 relative before:content-['・'] before:absolute before:left-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
