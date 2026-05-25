import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CharacterDraft, CombatStats } from '@/types/character'
import type { ItemDetalle } from '@/services/itemService'
import { getMod, getProfBonus, formatMod, STAT_NAMES, type StatKey } from '@/utils/dnd'

// ── Mapeo nombre completo → clave de stat ─────────────────────────────────

const SALV_TO_KEY: Record<string, StatKey> = {
  'Fuerza':        'fue',
  'Destreza':      'des',
  'Constitución':  'con',
  'Inteligencia':  'int',
  'Sabiduría':     'sab',
  'Carisma':       'car',
}

function getProfSaves(claseDetalle: ItemDetalle | null): Set<StatKey> {
  if (!claseDetalle?.datos) return new Set()
  const d = claseDetalle.datos as Record<string, unknown>
  const clase = (d.clase ?? d) as Record<string, unknown>
  const competencias = clase.competencias as Record<string, unknown> | undefined
  const salvaciones = competencias?.salvaciones as string[] | undefined
  const keys = (salvaciones ?? []).map((name) => SALV_TO_KEY[name]).filter(Boolean) as StatKey[]
  return new Set(keys)
}

// ── Level button ──────────────────────────────────────────────────────────

function LevelButton({ nivel, onChange }: { nivel: number; onChange: (n: number) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border/60 hover:border-primary/60 transition-colors shrink-0"
      >
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Nv</span>
        <span className="text-primary font-black text-base leading-none">{nivel}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Seleccionar nivel</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2 pt-2">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { onChange(n); setOpen(false) }}
                className={`h-10 rounded-lg text-sm font-bold border transition-all ${
                  nivel === n
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-secondary border-border hover:border-primary/60 text-foreground'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Stat box ──────────────────────────────────────────────────────────────

function StatBox({ stat, value, onChange }: { stat: StatKey; value: number; onChange: (v: number) => void }) {
  const mod = getMod(value)
  return (
    <div className="flex flex-col items-center gap-0.5 bg-secondary rounded-lg border border-border/60 p-1.5 min-w-0">
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold leading-none">
        {STAT_NAMES[stat]}
      </span>
      <span className="text-xl font-black text-primary leading-tight">{formatMod(mod)}</span>
      <input
        type="number"
        value={value}
        min={1}
        max={30}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent border-none text-center text-xs text-muted-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  )
}

// ── Escudo CA ─────────────────────────────────────────────────────────────

function CAShield({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">CA</span>
      <div className="relative flex items-center justify-center" style={{ width: 48, height: 56 }}>
        <svg viewBox="0 0 52 60" className="absolute inset-0 w-full h-full" fill="none">
          <path
            d="M26 2L50 12V32C50 48 26 58 26 58C26 58 2 48 2 32V12Z"
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        </svg>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 bg-transparent border-none text-center text-xl font-black text-primary focus:outline-none w-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
  )
}

// ── Barra HP ──────────────────────────────────────────────────────────────

function HPBar({ combate, onChange }: { combate: CombatStats; onChange: (v: Partial<CombatStats>) => void }) {
  const pct = Math.max(0, Math.min(100, (combate.pv_actual / Math.max(1, combate.pv_max)) * 100))
  const color = pct > 50 ? 'bg-primary' : pct > 25 ? 'bg-yellow-500' : 'bg-destructive'

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">PV</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={combate.pv_actual}
            min={0}
            max={combate.pv_max}
            onChange={(e) => onChange({ pv_actual: Number(e.target.value) })}
            className="w-10 bg-transparent border-b border-border/60 text-center text-sm font-black text-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground text-xs">/</span>
          <input
            type="number"
            value={combate.pv_max}
            min={1}
            onChange={(e) => onChange({ pv_max: Number(e.target.value) })}
            className="w-10 bg-transparent border-b border-border/60 text-center text-xs text-muted-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      <div className="h-2 rounded-full bg-secondary border border-border/40 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── TopBar ────────────────────────────────────────────────────────────────

const STAT_KEYS: StatKey[] = ['fue', 'des', 'con', 'int', 'sab', 'car']

interface Props {
  draft: CharacterDraft
  claseDetalle: ItemDetalle | null
  onChange: (partial: Partial<CharacterDraft>) => void
}

export default function TopBar({ draft, claseDetalle, onChange }: Props) {
  const prof = getProfBonus(draft.nivel)
  const stats = draft.stats
  const profSaves = getProfSaves(claseDetalle)

  const updateCombate = (v: Partial<CombatStats>) =>
    onChange({ combate: { ...draft.combate, ...v } })

  return (
    <div className="flex flex-col shrink-0 border-b border-border/40">

      {/* Fila 1: Nombre + Nivel + Atributos */}
      <div className="flex items-center gap-3 px-4 py-2">
        <Input
          value={draft.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Nombre del personaje..."
          className="border-border/60 bg-secondary font-semibold w-52 shrink-0"
        />
        <LevelButton nivel={draft.nivel} onChange={(n) => onChange({ nivel: n })} />
        <div className="w-px h-6 bg-border/40 mx-1 shrink-0" />
        <div className="flex gap-2 flex-1">
          {STAT_KEYS.map((k) => (
            <StatBox
              key={k}
              stat={k}
              value={draft.stats[k]}
              onChange={(v) => onChange({ stats: { ...draft.stats, [k]: v } })}
            />
          ))}
        </div>
      </div>

      {/* Fila 2: CA + HP + Salvaciones (solo si hay clase) */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-border/20 bg-secondary/10">
        <CAShield value={draft.combate.ca} onChange={(v) => updateCombate({ ca: v })} />

        <div className="w-44 shrink-0">
          <HPBar combate={draft.combate} onChange={updateCombate} />
        </div>

        {claseDetalle && (
          <>
            <div className="w-px h-10 bg-border/40 shrink-0" />

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Salvaciones · Prof +{prof}
              </span>
              <div className="flex gap-4">
                {STAT_KEYS.filter((k) => profSaves.has(k)).map((k) => {
                  const mod = getMod(stats[k]) + prof
                  return (
                    <div key={k} className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded-full border-2 shrink-0 bg-primary border-primary" />
                      <span className="font-bold text-primary">{formatMod(mod)}</span>
                      <span className="text-muted-foreground text-[10px]">{STAT_NAMES[k]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
