import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { StatBlock, AbilitySetup } from '@/types/character'
import { getMod, formatMod } from '@/utils/dnd'

// ── Constants ──────────────────────────────────────────────────────────────

const STAT_ORDER: (keyof StatBlock)[] = ['fue', 'des', 'con', 'int', 'sab', 'car']

const STAT_FULL: Record<keyof StatBlock, string> = {
  fue: 'Fuerza', des: 'Destreza', con: 'Constitución',
  int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma',
}

const STAT_FROM_NAME: Record<string, keyof StatBlock> = {
  'Fuerza': 'fue', 'Destreza': 'des', 'Constitución': 'con',
  'Inteligencia': 'int', 'Sabiduría': 'sab', 'Carisma': 'car',
}

const STANDARD = [15, 14, 13, 12, 10, 8]

const PB_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
const PB_BUDGET = 27

const EMPTY_STATS: StatBlock = { fue: 8, des: 8, con: 8, int: 8, sab: 8, car: 8 }
const ZERO_STATS: StatBlock  = { fue: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 }

function roll4d6(): number {
  const rolls = Array.from({ length: 4 }, () => Math.ceil(Math.random() * 6))
  return rolls.reduce((a, b) => a + b, 0) - Math.min(...rolls)
}

// ── Step 1: Method selection ───────────────────────────────────────────────

const METHODS: { key: AbilitySetup['method']; title: string; desc: string }[] = [
  { key: 'standard_array', title: 'Matriz estándar',    desc: 'Asigna [15, 14, 13, 12, 10, 8] a tus características' },
  { key: 'point_buy',      title: 'Compra de puntos',   desc: '27 puntos para gastar, valores entre 8 y 15' },
  { key: 'roll',           title: 'Tirada de dados',    desc: 'Tira 4d6 y descarta el menor, para cada característica' },
]

function Step1({ method, onSelect }: {
  method: AbilitySetup['method'] | null
  onSelect: (m: AbilitySetup['method']) => void
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-muted-foreground">Elige cómo generar tus puntuaciones de característica:</p>
      {METHODS.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSelect(opt.key)}
          className={`text-left p-4 rounded-lg border transition-colors ${
            method === opt.key
              ? 'border-primary bg-primary/10'
              : 'border-border/60 bg-secondary/20 hover:bg-secondary/60'
          }`}
        >
          <p className="font-semibold text-sm">{opt.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
        </button>
      ))}
    </div>
  )
}

// ── Step 2a: Standard array / Roll assignment ──────────────────────────────

function Step2Pool({
  pool,
  assignments,
  isRoll,
  onAssign,
  onReroll,
}: {
  pool: number[]
  assignments: Partial<Record<keyof StatBlock, number>>
  isRoll: boolean
  onAssign: (stat: keyof StatBlock, val: number | null) => void
  onReroll: () => void
}) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {isRoll && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex gap-1.5 flex-wrap">
            {pool.map((v, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-secondary border border-border/60 text-sm font-mono">{v}</span>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onReroll} className="h-7 text-xs ml-2 shrink-0">
            Tirar de nuevo
          </Button>
        </div>
      )}
      {STAT_ORDER.map(stat => {
        const current = assignments[stat]
        const usedByOthers = STAT_ORDER
          .filter(s => s !== stat)
          .map(s => assignments[s])
          .filter((v): v is number => v !== undefined)
        const available = pool.filter(v => !usedByOthers.includes(v))

        return (
          <div key={stat} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24 shrink-0">{STAT_FULL[stat]}</span>
            <select
              className="flex-1 bg-background border border-border/60 rounded px-2 py-1 text-sm"
              value={current ?? ''}
              onChange={e => onAssign(stat, e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">—</option>
              {available.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <span className="text-xs text-muted-foreground w-8 text-right font-mono">
              {current !== undefined ? formatMod(getMod(current)) : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Step 2b: Point buy ─────────────────────────────────────────────────────

function Step2PointBuy({
  scores,
  onChange,
}: {
  scores: StatBlock
  onChange: (stat: keyof StatBlock, val: number) => void
}) {
  const pointsSpent = STAT_ORDER.reduce((sum, s) => sum + (PB_COST[scores[s]] ?? 0), 0)
  const remaining = PB_BUDGET - pointsSpent

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Puntos restantes:</span>
        <span className={`font-bold text-sm ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
          {remaining} / {PB_BUDGET}
        </span>
      </div>
      {STAT_ORDER.map(stat => {
        const val = scores[stat]
        const costNext = PB_COST[val + 1] ?? 99
        const canInc = val < 15 && remaining >= costNext - PB_COST[val]
        const canDec = val > 8
        return (
          <div key={stat} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24 shrink-0">{STAT_FULL[stat]}</span>
            <button type="button" disabled={!canDec} onClick={() => onChange(stat, val - 1)}
              className="w-6 h-6 rounded border border-border/60 text-sm disabled:opacity-30 hover:bg-secondary transition-colors">−</button>
            <span className="w-8 text-center text-sm font-mono font-semibold">{val}</span>
            <button type="button" disabled={!canInc} onClick={() => onChange(stat, val + 1)}
              className="w-6 h-6 rounded border border-border/60 text-sm disabled:opacity-30 hover:bg-secondary transition-colors">+</button>
            <span className="text-xs text-muted-foreground ml-1 font-mono w-8">{formatMod(getMod(val))}</span>
            <span className="text-xs text-muted-foreground ml-auto">{PB_COST[val]}pt</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Step 3: Trasfondo bonus ────────────────────────────────────────────────

function Step3({
  trasfondoCaracteristicas,
  baseScores,
  bonusMode, setBonusMode,
  bonus2stat, setBonus2stat,
  bonus1stat, setBonus1stat,
}: {
  trasfondoCaracteristicas: string[] | null
  baseScores: StatBlock
  bonusMode: '+2+1' | '+1+1+1'
  setBonusMode: (m: '+2+1' | '+1+1+1') => void
  bonus2stat: keyof StatBlock | null
  setBonus2stat: (s: keyof StatBlock | null) => void
  bonus1stat: keyof StatBlock | null
  setBonus1stat: (s: keyof StatBlock | null) => void
}) {
  if (!trasfondoCaracteristicas || trasfondoCaracteristicas.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-40">
        <p className="text-sm text-muted-foreground text-center">
          Selecciona un trasfondo para ver las opciones de mejora de características.
        </p>
      </div>
    )
  }

  const allowed = trasfondoCaracteristicas
    .map(n => STAT_FROM_NAME[n])
    .filter((s): s is keyof StatBlock => Boolean(s))

  const finalScores = { ...baseScores }
  if (bonusMode === '+1+1+1') {
    for (const s of allowed) finalScores[s] += 1
  } else {
    if (bonus2stat) finalScores[bonus2stat] += 2
    if (bonus1stat) finalScores[bonus1stat] += 1
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Características permitidas</p>
        <p className="text-sm font-medium">{trasfondoCaracteristicas.join(', ')}</p>
      </div>

      <div className="flex gap-2">
        {(['+2+1', '+1+1+1'] as const).map(mode => (
          <button
            key={mode}
            type="button"
            onClick={() => { setBonusMode(mode); setBonus2stat(null); setBonus1stat(null) }}
            className={`flex-1 py-2 text-sm rounded border transition-colors ${
              bonusMode === mode
                ? 'border-primary bg-primary/10 font-semibold'
                : 'border-border/60 bg-secondary/20 hover:bg-secondary/60'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {bonusMode === '+2+1' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary w-6">+2</span>
            <div className="flex gap-2 flex-1">
              {allowed.map(s => (
                <button key={s} type="button"
                  onClick={() => { setBonus2stat(s); if (bonus1stat === s) setBonus1stat(null) }}
                  className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                    bonus2stat === s ? 'border-primary bg-primary/20 font-semibold' : 'border-border/60 hover:bg-secondary/60'
                  }`}
                >
                  {STAT_FULL[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary w-6">+1</span>
            <div className="flex gap-2 flex-1">
              {allowed.filter(s => s !== bonus2stat).map(s => (
                <button key={s} type="button"
                  onClick={() => setBonus1stat(s)}
                  className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                    bonus1stat === s ? 'border-primary bg-primary/20 font-semibold' : 'border-border/60 hover:bg-secondary/60'
                  }`}
                >
                  {STAT_FULL[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {bonusMode === '+1+1+1' && (
        <p className="text-xs text-muted-foreground">Las tres características recibirán +1 automáticamente.</p>
      )}

      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Vista previa final</p>
        <div className="grid grid-cols-6 gap-1">
          {STAT_ORDER.map(s => (
            <div key={s} className="flex flex-col items-center p-2 rounded bg-secondary/40 border border-border/40">
              <span className="text-[9px] text-muted-foreground uppercase">{s}</span>
              <span className="font-bold text-sm">{finalScores[s]}</span>
              <span className="text-[10px] text-muted-foreground">{formatMod(getMod(finalScores[s]))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  initial: AbilitySetup | null
  trasfondoCaracteristicas: string[] | null
  onAccept: (setup: AbilitySetup) => void
}

export default function AbilityWizardModal({ open, onClose, initial, trasfondoCaracteristicas, onAccept }: Props) {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<AbilitySetup['method'] | null>(null)

  const [pool, setPool] = useState<number[]>([...STANDARD])
  const [assignments, setAssignments] = useState<Partial<Record<keyof StatBlock, number>>>({})
  const [pbScores, setPbScores] = useState<StatBlock>({ ...EMPTY_STATS })

  const [bonusMode, setBonusMode] = useState<'+2+1' | '+1+1+1'>('+2+1')
  const [bonus2stat, setBonus2stat] = useState<keyof StatBlock | null>(null)
  const [bonus1stat, setBonus1stat] = useState<keyof StatBlock | null>(null)

  useEffect(() => {
    if (!open) return
    setStep(1)
    setBonusMode('+2+1')
    setBonus2stat(null)
    setBonus1stat(null)

    if (initial) {
      setMethod(initial.method)
      if (initial.method === 'point_buy') {
        setPbScores({ ...initial.baseScores })
        setPool([...STANDARD])
        setAssignments({})
      } else {
        setAssignments({ ...initial.baseScores } as Record<keyof StatBlock, number>)
        const vals = Object.values(initial.baseScores).sort((a, b) => b - a)
        setPool(initial.method === 'roll' ? vals : [...STANDARD])
      }
      // Restore bonus mode from saved bonuses
      const b = initial.trasfondoBonuses
      const allowed = (trasfondoCaracteristicas ?? [])
        .map(n => STAT_FROM_NAME[n])
        .filter((s): s is keyof StatBlock => Boolean(s))
      if (allowed.length > 0 && allowed.every(s => b[s] === 1)) {
        setBonusMode('+1+1+1')
      } else {
        setBonusMode('+2+1')
        setBonus2stat(allowed.find(s => b[s] === 2) ?? null)
        setBonus1stat(allowed.find(s => b[s] === 1) ?? null)
      }
    } else {
      setMethod(null)
      setPool([...STANDARD])
      setAssignments({})
      setPbScores({ ...EMPTY_STATS })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function getBaseScores(): StatBlock {
    if (method === 'point_buy') return { ...pbScores }
    return STAT_ORDER.reduce((acc, s) => ({ ...acc, [s]: assignments[s] ?? 8 }), {} as StatBlock)
  }

  function getBonuses(): StatBlock {
    const bonuses = { ...ZERO_STATS }
    const allowed = (trasfondoCaracteristicas ?? [])
      .map(n => STAT_FROM_NAME[n])
      .filter((s): s is keyof StatBlock => Boolean(s))
    if (allowed.length === 0) return bonuses
    if (bonusMode === '+1+1+1') {
      for (const s of allowed) bonuses[s] = 1
    } else {
      if (bonus2stat && allowed.includes(bonus2stat)) bonuses[bonus2stat] = 2
      if (bonus1stat && allowed.includes(bonus1stat)) bonuses[bonus1stat] = 1
    }
    return bonuses
  }

  function canNext(): boolean {
    if (step === 1) return method !== null
    if (step === 2) {
      if (method === 'point_buy') {
        return STAT_ORDER.reduce((sum, s) => sum + (PB_COST[pbScores[s]] ?? 0), 0) <= PB_BUDGET
      }
      return STAT_ORDER.every(s => assignments[s] !== undefined)
    }
    return true
  }

  function canAccept(): boolean {
    if (!trasfondoCaracteristicas || trasfondoCaracteristicas.length === 0) return true
    if (bonusMode === '+1+1+1') return true
    return bonus2stat !== null && bonus1stat !== null
  }

  function handleNext() {
    if (step === 1 && method === 'roll') {
      const rolled = Array.from({ length: 6 }, () => roll4d6()).sort((a, b) => b - a)
      setPool(rolled)
      setAssignments({})
    }
    setStep(s => s + 1)
  }

  function handleReroll() {
    const rolled = Array.from({ length: 6 }, () => roll4d6()).sort((a, b) => b - a)
    setPool(rolled)
    setAssignments({})
  }

  function handleAccept() {
    if (!method) return
    const baseScores = getBaseScores()
    const trasfondoBonuses = getBonuses()
    onAccept({ method, baseScores, trasfondoBonuses })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-md p-0 flex flex-col gap-0 [&>button]:hidden">
        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold">Características</span>
          <span className="text-xs text-muted-foreground">Paso {step} de 3</span>
        </div>

        <div className="overflow-y-auto max-h-[480px]">
          {step === 1 && <Step1 method={method} onSelect={setMethod} />}

          {step === 2 && method !== 'point_buy' && (
            <Step2Pool
              pool={pool}
              assignments={assignments}
              isRoll={method === 'roll'}
              onAssign={(stat, val) =>
                setAssignments(prev => {
                  const next = { ...prev }
                  if (val === null) delete next[stat]
                  else next[stat] = val
                  return next
                })
              }
              onReroll={handleReroll}
            />
          )}

          {step === 2 && method === 'point_buy' && (
            <Step2PointBuy
              scores={pbScores}
              onChange={(stat, val) => setPbScores(prev => ({ ...prev, [stat]: val }))}
            />
          )}

          {step === 3 && (
            <Step3
              trasfondoCaracteristicas={trasfondoCaracteristicas}
              baseScores={getBaseScores()}
              bonusMode={bonusMode} setBonusMode={setBonusMode}
              bonus2stat={bonus2stat} setBonus2stat={setBonus2stat}
              bonus1stat={bonus1stat} setBonus1stat={setBonus1stat}
            />
          )}
        </div>

        <div className="flex justify-between gap-2 px-4 py-3 border-t border-border/40 shrink-0">
          {step > 1
            ? <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>← Atrás</Button>
            : <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          }
          {step < 3
            ? <Button size="sm" disabled={!canNext()} onClick={handleNext}>Siguiente →</Button>
            : <Button size="sm" disabled={!canAccept()} onClick={handleAccept}>Aceptar</Button>
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
