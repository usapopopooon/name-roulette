import { useEffect, useMemo, useState } from 'react'
import { RouletteWheel, type RouletteWheelItem } from '../RouletteWheel'
import { NameInput } from '../NameInput'
import { ResultDisplay, type ResultCandidate } from '../ResultDisplay'
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

interface WinnerState {
  id: string | null
  label: string | null
}

export function NameRoulette() {
  const {
    rawNames,
    nameList,
    participants,
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

  const initialLastWinnerLabel = getLastWinnerFromURL()
  const [lastWinner, setLastWinner] = useState<WinnerState>({
    id: null,
    label: initialLastWinnerLabel,
  })
  const [challengedPersonId, setChallengedPersonId] = useState<string | null>(
    null
  )
  const [showExcludeConfirm, setShowExcludeConfirm] = useState(false)
  const [showChallengeConfirm, setShowChallengeConfirm] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    id: string
    label: string
    x: number
    y: number
  } | null>(null)
  const [interruptionType, setInterruptionType] =
    useState<InterruptionType | null>(null)
  const [interruptionChecked, setInterruptionChecked] = useState(false)
  const [interruptionOccurred, setInterruptionOccurred] = useState(false)

  const rouletteItems = useMemo<RouletteWheelItem[]>(
    () => participants.map((participant) => ({
      id: participant.id,
      label: participant.displayName,
    })),
    [participants]
  )
  const resultCandidates = useMemo<ResultCandidate[]>(
    () => rouletteItems,
    [rouletteItems]
  )
  const participantMap = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant])),
    [participants]
  )

  useEffect(() => {
    if (!lastWinner.label || lastWinner.id) {
      return
    }

    const normalizedLastWinner = lastWinner.label.replace(/さん$/, '')
    const matchedParticipant = participants.find(
      (participant) => participant.name === normalizedLastWinner
    )

    if (matchedParticipant) {
      setLastWinner({
        id: matchedParticipant.id,
        label: matchedParticipant.displayName,
      })
    }
  }, [lastWinner, participants])

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

  const resultParticipant = result ? participantMap.get(result) ?? null : null
  const resultLabel = resultParticipant?.displayName ?? null

  const { copyShareLink } = useURLSync({
    names: rawNames,
    withHonorific,
    lastWinner: lastWinner.label,
  })

  useEffect(() => {
    if (result && !isSpinning && !interruptionChecked) {
      setInterruptionChecked(true)
      if (!interruptionOccurred && Math.random() < 0.6) {
        const type: InterruptionType = Math.random() < 0.5 ? 'cat' : 'duck'
        setInterruptionType(type)
        setInterruptionOccurred(true)
      }
    }
    if (!result) {
      setInterruptionChecked(false)
    }
  }, [result, isSpinning, interruptionChecked, interruptionOccurred])

  const handleInterruptionComplete = () => {
    setInterruptionType(null)
    reset()
    setTimeout(() => {
      spin(rouletteItems, weights, { nudge: true })
    }, 100)
  }

  const handleStart = () => {
    if (lastWinner.id && rouletteItems.length >= 3) {
      const winnerIndex = rouletteItems.findIndex((item) => item.id === lastWinner.id)
      if (winnerIndex !== -1 && weights[winnerIndex] > 0) {
        setShowExcludeConfirm(true)
        return
      }
    }
    spin(rouletteItems, weights)
  }

  const handleExcludeAndStart = () => {
    if (lastWinner.id) {
      const newWeights = excludeName(lastWinner.id)
      setShowExcludeConfirm(false)
      spin(rouletteItems, newWeights)
    }
  }

  const handleStartWithoutExclude = () => {
    setShowExcludeConfirm(false)
    spin(rouletteItems, weights)
  }

  const handleDragStart = () => {
    setDragging(true, rouletteItems, weights)
  }

  const handleDragEnd = () => {
    setDragging(false, rouletteItems, weights)
  }

  const handleFullReset = () => {
    reset()
    resetWeights()
    setLastWinner({ id: null, label: null })
    setChallengedPersonId(null)
  }

  const handleCloseResult = () => {
    if (result && resultLabel) {
      if (lastWinner.id) {
        restoreName(lastWinner.id)
      }
      if (challengedPersonId) {
        restoreName(challengedPersonId)
        setChallengedPersonId(null)
      }
      setLastWinner({ id: result, label: resultLabel })
    }
    setInterruptionOccurred(false)
    reset()
  }

  const handleChallenge = () => {
    if (result) {
      setShowChallengeConfirm(true)
    }
  }

  const handleChallengeConfirm = () => {
    if (result) {
      if (challengedPersonId && challengedPersonId !== result) {
        restoreName(challengedPersonId)
      }
      const newWeights = halveWeight(result)
      setChallengedPersonId(result)
      setShowChallengeConfirm(false)
      setInterruptionOccurred(false)
      reset()
      setTimeout(() => {
        spin(rouletteItems, newWeights)
      }, 100)
    }
  }

  const handleChallengeCancel = () => {
    setShowChallengeConfirm(false)
    setInterruptionOccurred(false)
    reset()
    setTimeout(() => {
      spin(rouletteItems, weights)
    }, 100)
  }

  const handleShiftResult = (direction: -1 | 1) => {
    shiftResult(direction, rouletteItems, weights)
  }

  const handleRouletteContextMenu = (
    item: RouletteWheelItem,
    x: number,
    y: number
  ) => {
    if (!isSpinning) {
      setContextMenu({ id: item.id, label: item.label, x, y })
    }
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const handleShuffle = () => {
    const lines = rawNames.split('\n').filter((line) => line.trim() !== '')
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[lines[i], lines[j]] = [lines[j], lines[i]]
    }
    handleNamesChange(lines.join('\n'))
  }

  const canStart = nameList.length >= 2 && !isSpinning
  const excludeLabel = lastWinner.label ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-5 font-['Segoe_UI','Hiragino_Sans',sans-serif] text-white">
      <h1 className="text-center text-[clamp(1.5rem,5vw,2.5rem)] mb-5 [text-shadow:0_0_20px_rgba(255,200,100,0.5)]">
        🎯 お名前ルーレット
      </h1>

      <div className="flex justify-center">
        <div className="flex gap-4 items-start max-md:flex-col max-md:items-center">
          <div className="flex flex-col items-center gap-4 max-md:w-full max-md:[&>div:first-child]:!w-80 max-md:[&>div:first-child]:!h-80">
            <RouletteWheel
              items={rouletteItems}
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
                type="button"
                variant="primary"
                onClick={handleStart}
                disabled={!canStart}
              >
                {isSpinning ? '回転中...' : 'スタート！'}
              </ActionButton>
              <ActionButton type="button" variant="secondary" onClick={handleFullReset}>
                リセット
              </ActionButton>
            </div>
          </div>

          <div className="w-70 shrink-0 max-md:w-full">
            <NameInput
              value={rawNames}
              onChange={handleNamesChange}
              onShuffle={handleShuffle}
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

      {interruptionChecked && !interruptionType && (
        <ResultDisplay
          resultId={result}
          resultLabel={resultLabel}
          candidates={resultCandidates}
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

      {showExcludeConfirm && lastWinner.id && (
        <ConfirmDialog
          message={`前回の当選者「${excludeLabel}」を\n除外しますか？`}
          onYes={handleExcludeAndStart}
          onNo={handleStartWithoutExclude}
        />
      )}

      {showChallengeConfirm && resultLabel && (
        <ConfirmDialog
          message={`「${resultLabel}」の当選確率を\n下げますか？`}
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
              label: `「${contextMenu.label}」の確率を倍にする`,
              onClick: () => doubleWeight(contextMenu.id),
            },
            {
              label: `「${contextMenu.label}」を削除`,
              onClick: () => removeName(contextMenu.id),
              danger: true,
            },
          ]}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  )
}
