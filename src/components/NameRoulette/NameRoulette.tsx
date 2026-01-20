import { useCallback, useEffect, useState } from 'react'
import { RouletteWheel } from '../RouletteWheel'
import { NameInput } from '../NameInput'
import { ResultDisplay } from '../ResultDisplay'
import { ActionButton } from '../ActionButton'
import { Checkbox } from '../Checkbox'
import { ShareButton } from '../ShareButton'
import { ConfirmDialog } from '../ConfirmDialog'
import { ContextMenu } from '../ContextMenu'
import {
  CatInterruptionOverlay,
  type InterruptionType,
} from '../CatInterruptionOverlay'
import {
  useRoulette,
  useNameList,
  useURLSync,
  getLastWinnerFromURL,
} from '../../hooks'

export function NameRoulette() {
  const {
    rawNames,
    nameList,
    displayNameList,
    weights,
    withHonorific,
    setWithHonorific,
    handleNamesChange,
    halveWeight,
    doubleWeight,
    excludeName,
    restoreName,
    removeName,
    resetWeights,
  } = useNameList()

  // 前回の当選者を記録（URLから初期化）
  const [lastWinner, setLastWinner] = useState<string | null>(() =>
    getLastWinnerFromURL()
  )
  // 「待った」で重みが半分になった人（次の「待った」時に復活させる）
  const [challengedPerson, setChallengedPerson] = useState<string | null>(null)
  // 除外確認ダイアログの表示状態
  const [showExcludeConfirm, setShowExcludeConfirm] = useState(false)
  // 「待った」確認ダイアログの表示状態
  const [showChallengeConfirm, setShowChallengeConfirm] = useState(false)
  // コンテキストメニューの状態
  const [contextMenu, setContextMenu] = useState<{
    name: string
    x: number
    y: number
  } | null>(null)
  // 乱入演出の状態（null = なし、'cat' or 'duck' = 乱入中）
  const [interruptionType, setInterruptionType] =
    useState<InterruptionType | null>(null)
  // 乱入判定済みフラグ（同じ結果で複数回判定しないため）
  const [interruptionChecked, setInterruptionChecked] = useState(false)
  // 乱入が一度発生したフラグ（連続で発生しないように）
  const [interruptionOccurred, setInterruptionOccurred] = useState(false)

  const {
    isSpinning,
    rotation,
    result,
    spin,
    reset,
    addRotationWithVelocity,
    setDragging,
    shiftResult,
  } = useRoulette()

  const { copyShareLink } = useURLSync({
    names: rawNames,
    withHonorific,
    lastWinner,
  })

  // 結果が出たら60%の確率で乱入（猫30%、アヒル30%）（一度発生したら連続で発生しない）
  useEffect(() => {
    if (result && !isSpinning && !interruptionChecked) {
      setInterruptionChecked(true)
      if (!interruptionOccurred && Math.random() < 0.6) {
        // 猫とアヒルを50%ずつ
        const type: InterruptionType = Math.random() < 0.5 ? 'cat' : 'duck'
        setInterruptionType(type)
        setInterruptionOccurred(true)
      }
    }
    // 結果がリセットされたらフラグもリセット
    if (!result) {
      setInterruptionChecked(false)
    }
  }, [result, isSpinning, interruptionChecked, interruptionOccurred])

  // 乱入演出完了後の処理
  const handleInterruptionComplete = useCallback(() => {
    setInterruptionType(null)
    reset()
    // 少し遅延してから再スピン（ちょっとだけ回す）
    setTimeout(() => {
      spin(displayNameList, weights, { nudge: true })
    }, 100)
  }, [reset, spin, displayNameList, weights])

  // スタートボタンのハンドラ
  const handleStart = useCallback(() => {
    // 前回の当選者がいて、まだ除外されていない場合は確認ダイアログを表示
    // ただし、除外すると2人未満になる場合は確認しない
    if (lastWinner && displayNameList.length >= 3) {
      const baseName = lastWinner.replace(/さん$/, '')
      const winnerIndex = nameList.indexOf(baseName)
      // 当選者がまだリストにいて、重みが0でない場合のみ確認
      if (winnerIndex !== -1 && weights[winnerIndex] > 0) {
        setShowExcludeConfirm(true)
        return
      }
    }
    spin(displayNameList, weights)
  }, [lastWinner, nameList, weights, spin, displayNameList])

  // 除外して開始
  const handleExcludeAndStart = useCallback(() => {
    if (lastWinner) {
      const newWeights = excludeName(lastWinner)
      setShowExcludeConfirm(false)
      spin(displayNameList, newWeights)
    }
  }, [lastWinner, excludeName, spin, displayNameList])

  // 除外せずに開始
  const handleStartWithoutExclude = useCallback(() => {
    setShowExcludeConfirm(false)
    spin(displayNameList, weights)
  }, [spin, displayNameList, weights])

  const handleDragStart = useCallback(() => {
    setDragging(true, displayNameList, weights)
  }, [setDragging, displayNameList, weights])

  const handleDragEnd = useCallback(() => {
    setDragging(false, displayNameList, weights)
  }, [setDragging, displayNameList, weights])

  // 完全リセット（リセットボタン用）
  const handleFullReset = useCallback(() => {
    reset()
    resetWeights()
    setLastWinner(null)
    setChallengedPerson(null)
  }, [reset, resetWeights])

  // 結果画面を閉じる（当選者を記録して次回の確認に使う）
  const handleCloseResult = useCallback(() => {
    if (result) {
      // 前回の除外者がいれば復活させる（前々回以前は除外しない）
      if (lastWinner) {
        restoreName(lastWinner)
      }
      // 「待った」で半分になった人も復活させる
      if (challengedPerson) {
        restoreName(challengedPerson)
        setChallengedPerson(null)
      }
      setLastWinner(result)
    }
    // 次のターンでは乱入の出現確率をリセット
    setInterruptionOccurred(false)
    reset()
  }, [result, reset, lastWinner, challengedPerson, restoreName])

  // 「待った」ボタンを押した時（確認ダイアログを表示）
  const handleChallenge = useCallback(() => {
    if (result) {
      setShowChallengeConfirm(true)
    }
  }, [result])

  // 「待った」確認で「はい」を選んだ時
  const handleChallengeConfirm = useCallback(() => {
    if (result) {
      // 前回「待った」された人がいれば復活させる
      if (challengedPerson && challengedPerson !== result) {
        restoreName(challengedPerson)
      }
      // 当選者の重みを半分にして再抽選（halveWeightは更新後のweightsを返す）
      const newWeights = halveWeight(result)
      setChallengedPerson(result)
      setShowChallengeConfirm(false)
      // 動物乱入の確率をリセット
      setInterruptionOccurred(false)
      reset()
      // 少し遅延してから再スピン
      setTimeout(() => {
        spin(displayNameList, newWeights)
      }, 100)
    }
  }, [
    result,
    halveWeight,
    reset,
    spin,
    displayNameList,
    challengedPerson,
    restoreName,
  ])

  // 「待った」確認で「いいえ」を選んだ時（確率変更なしで再抽選）
  const handleChallengeCancel = useCallback(() => {
    setShowChallengeConfirm(false)
    // 動物乱入の確率をリセット
    setInterruptionOccurred(false)
    reset()
    // 少し遅延してから再スピン
    setTimeout(() => {
      spin(displayNameList, weights)
    }, 100)
  }, [reset, spin, displayNameList, weights])

  // 当選者を前後にシフト
  const handleShiftResult = useCallback(
    (direction: -1 | 1) => {
      shiftResult(direction, displayNameList, weights)
    },
    [shiftResult, displayNameList, weights]
  )

  // コンテキストメニューを開く
  const handleRouletteContextMenu = useCallback(
    (name: string, x: number, y: number) => {
      if (!isSpinning) {
        setContextMenu({ name, x, y })
      }
    },
    [isSpinning]
  )

  // コンテキストメニューを閉じる
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const canStart = nameList.length >= 2 && !isSpinning

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-5 font-['Segoe_UI','Hiragino_Sans',sans-serif] text-white">
      <h1 className="text-center text-[clamp(1.5rem,5vw,2.5rem)] mb-5 [text-shadow:0_0_20px_rgba(255,200,100,0.5)]">
        🎯 お名前ルーレット
      </h1>

      <div className="flex justify-center">
        <div className="flex gap-4 items-start max-md:flex-col max-md:items-center">
          <div className="flex flex-col items-center gap-4 max-md:w-full max-md:[&>div:first-child]:!w-80 max-md:[&>div:first-child]:!h-80">
            <RouletteWheel
              items={displayNameList}
              weights={weights}
              rotation={rotation}
              size={640}
              isSpinning={isSpinning}
              onDragRotate={addRotationWithVelocity}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onContextMenu={handleRouletteContextMenu}
            />

            <div className="flex gap-4 flex-wrap justify-center">
              <ActionButton
                variant="primary"
                onClick={handleStart}
                disabled={!canStart}
              >
                {isSpinning ? '回転中...' : 'スタート！'}
              </ActionButton>
              <ActionButton variant="secondary" onClick={handleFullReset}>
                リセット
              </ActionButton>
            </div>
          </div>

          <div className="w-70 shrink-0 max-md:w-full">
            <NameInput
              value={rawNames}
              onChange={handleNamesChange}
              disabled={isSpinning}
              count={nameList.length}
            />

            <Checkbox
              label="名前に「さん」をつける"
              checked={withHonorific}
              onChange={setWithHonorific}
              disabled={isSpinning}
            />

            <ShareButton onCopy={copyShareLink} />
          </div>
        </div>
      </div>

      {/* 乱入判定が完了し、乱入でない場合のみ結果を表示（乱入時はファンファーレを鳴らさない） */}
      {interruptionChecked && !interruptionType && (
        <ResultDisplay
          result={result}
          candidates={displayNameList}
          onClose={handleCloseResult}
          onChallenge={handleChallenge}
          onShift={handleShiftResult}
        />
      )}

      <CatInterruptionOverlay
        show={!!interruptionType}
        type={interruptionType ?? undefined}
        onComplete={handleInterruptionComplete}
      />

      {showExcludeConfirm && lastWinner && (
        <ConfirmDialog
          message={`前回の当選者「${lastWinner}」を\n除外しますか？`}
          onYes={handleExcludeAndStart}
          onNo={handleStartWithoutExclude}
        />
      )}

      {showChallengeConfirm && result && (
        <ConfirmDialog
          message={`「${result}」の当選確率を\n下げますか？`}
          onYes={handleChallengeConfirm}
          onNo={handleChallengeCancel}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: `「${contextMenu.name}」の確率を倍にする`,
              onClick: () => doubleWeight(contextMenu.name),
            },
            {
              label: `「${contextMenu.name}」を削除`,
              onClick: () => removeName(contextMenu.name),
              danger: true,
            },
          ]}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  )
}
