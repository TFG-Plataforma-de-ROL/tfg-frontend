import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CharacterDraft, CombatStats } from '@/types/character'
import type { Item } from '@/services/itemService'
import {
  getMod, getProfBonus, getSkillMod, getPassivePerception, getInitiative,
  getSpellDC, getSpellAttackBonus, getCasterStat, formatMod, SKILLS, STAT_NAMES,
  type StatKey,
} from '@/utils/dnd'

interface Props {
  draft: CharacterDraft
  razaItem: Item | null
  claseItem: Item | null
  onChange: (partial: Partial<CharacterDraft>) => void
}

// ── Level button con popover ───────────────────────────────────────────────

function LevelButton({ nivel, onChange }: { nivel: number; onChange: (n: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border/60 hover:border-primary/60 transition-colors"
      >
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Nv</span>
        <span className="text-primary font-black text-base leading-none">{nivel}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg p-2 shadow-xl">
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { onChange(n); setOpen(false) }}
                className={`w-8 h-8 rounded text-xs font-bold border transition-all ${
                  nivel === n
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-secondary border-border hover:border-primary/60 text-foreground'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Stat box: modificador grande, valor base editable pequeño ─────────────

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

// ── Escudo de CA ──────────────────────────────────────────────────────────

function CAShield({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">CA</span>
      <div className="relative flex items-center justify-center" style={{ width: 52, height: 60 }}>
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
          className="relative z-10 bg-transparent border-none text-center text-2xl font-black text-primary focus:outline-none w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
  )
}

// ── Barra de HP ───────────────────────────────────────────────────────────

function HPBar({ combate, onChange }: { combate: CombatStats; onChange: (v: Partial<CombatStats>) => void }) {
  const pct = Math.max(0, Math.min(100, (combate.pv_actual / Math.max(1, combate.pv_max)) * 100))
  const color = pct > 50 ? 'bg-primary' : pct > 25 ? 'bg-yellow-500' : 'bg-destructive'

  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
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

// ── Círculo de competencia ─────────────────────────────────────────────────

function ProfCircle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-colors ${
        active ? 'bg-primary border-primary' : 'border-muted-foreground bg-transparent'
      }`}
    />
  )
}

// ── Panel principal ────────────────────────────────────────────────────────

export default function CenterPanel({ draft, razaItem, claseItem, onChange }: Props) {
  const stats = draft.stats
  const nivel = draft.nivel
  const prof = getProfBonus(nivel)
  const salvs = draft.salvaciones
  const habs = draft.habilidades
  const statKeys: StatKey[] = ['fue', 'des', 'con', 'int', 'sab', 'car']

  const tamaño = (razaItem?.todos_datos as Record<string, string> | null)?.tamaño ?? '—'

  const updateStat = (k: StatKey, v: number) => onChange({ stats: { ...stats, [k]: v } })
  const updateCombate = (v: Partial<CombatStats>) => onChange({ combate: { ...draft.combate, ...v } })
  const toggleSalv = (k: StatKey) => onChange({ salvaciones: { ...salvs, [k]: !salvs[k] } })
  const toggleHab = (key: keyof typeof habs) => onChange({ habilidades: { ...habs, [key]: !habs[key] } })

  const casterStat = getCasterStat(claseItem?.nombre)
  const percep = getPassivePerception(stats.sab, habs.percepcion, nivel)
  const init = getInitiative(stats.des)

  return (
    <div className="flex flex-col gap-4">

      {/* Nombre + Nivel */}
      <div className="flex items-center gap-2">
        <Input
          value={draft.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Nombre del personaje..."
          className="border-border/60 bg-secondary flex-1 font-semibold"
        />
        <LevelButton nivel={nivel} onChange={(n) => onChange({ nivel: n })} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-1.5">
        {statKeys.map((k) => (
          <StatBox key={k} stat={k} value={stats[k]} onChange={(v) => updateStat(k, v)} />
        ))}
      </div>

      {/* CA + HP + Velocidad + Tamaño */}
      <div className="flex items-end gap-3">
        <CAShield value={draft.combate.ca} onChange={(v) => updateCombate({ ca: v })} />
        <HPBar combate={draft.combate} onChange={updateCombate} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Velocidad</Label>
          <input
            type="number"
            value={draft.combate.velocidad}
            min={0}
            onChange={(e) => updateCombate({ velocidad: Number(e.target.value) })}
            className="w-full bg-secondary border border-border/60 rounded-md text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-ring p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Tamaño</Label>
          <div className="bg-secondary border border-border/60 rounded-md text-center text-sm font-medium text-muted-foreground p-1">
            {tamaño}
          </div>
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* Salvaciones */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Salvaciones · Prof +{prof}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {statKeys.map((k) => {
            const mod = getMod(stats[k]) + (salvs[k] ? prof : 0)
            return (
              <div key={k} className="flex items-center gap-1.5 text-xs">
                <ProfCircle active={salvs[k]} onClick={() => toggleSalv(k)} />
                <span className="w-7 text-right font-bold text-primary">{formatMod(mod)}</span>
                <span className="text-muted-foreground">{STAT_NAMES[k]}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* Inspiración */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Inspiración</span>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ inspiracion: draft.inspiracion === n ? n - 1 : n })}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                n <= draft.inspiracion ? 'bg-yellow-400 border-yellow-400' : 'border-muted-foreground'
              }`}
            />
          ))}
        </div>
      </div>

      {/* DC conjuros (solo lanzadores) */}
      {casterStat && (() => {
        const dc = getSpellDC(stats[casterStat], nivel)
        const atk = getSpellAttackBonus(stats[casterStat], nivel)
        return (
          <div className="flex gap-6 text-xs">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-muted-foreground uppercase tracking-wide text-[10px]">DC Conjuros</span>
              <span className="text-lg font-black text-primary">{dc}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-muted-foreground uppercase tracking-wide text-[10px]">Ataque Conjuro</span>
              <span className="text-lg font-black text-primary">{formatMod(atk)}</span>
            </div>
          </div>
        )
      })()}

      {/* Percepción pasiva + Iniciativa */}
      <div className="flex gap-6 text-xs">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Perc. Pasiva</span>
          <span className="text-lg font-black">{percep}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Iniciativa</span>
          <span className="text-lg font-black">{formatMod(init)}</span>
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* Habilidades */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Habilidades</p>
        <div className="flex flex-col gap-0.5">
          {SKILLS.map((skill) => {
            const mod = getSkillMod(stats[skill.stat], habs[skill.key], nivel)
            return (
              <div key={skill.key} className="flex items-center gap-1.5 text-xs py-0.5">
                <ProfCircle active={habs[skill.key]} onClick={() => toggleHab(skill.key)} />
                <span className="w-6 text-right font-bold text-primary">{formatMod(mod)}</span>
                <span className="text-muted-foreground truncate">{skill.nombre}</span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
