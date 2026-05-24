import { Label } from '@/components/ui/label'
import type { CharacterDraft } from '@/types/character'
import type { ItemDetalle } from '@/services/itemService'
import {
  getSkillMod, getPassivePerception, getInitiative,
  getSpellDC, getSpellAttackBonus, getCasterStat, formatMod, SKILLS,
} from '@/utils/dnd'

interface Props {
  draft: CharacterDraft
  razaDetalle: ItemDetalle | null
  claseDetalle: ItemDetalle | null
  onChange: (partial: Partial<CharacterDraft>) => void
}

// ── Círculo de competencia ─────────────────────────────────────────────────

type ProfSource = 'none' | 'manual' | 'trasfondo'

function ProfCircle({ source, onClick }: { source: ProfSource; onClick: () => void }) {
  if (source === 'trasfondo') {
    return (
      <span
        title="Concedida por trasfondo"
        className="w-3.5 h-3.5 rounded-full shrink-0 bg-amber-500/80 border-2 border-amber-500 block"
      />
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-colors ${
        source === 'manual' ? 'bg-primary border-primary' : 'border-muted-foreground bg-transparent'
      }`}
    />
  )
}

// ── Panel principal ────────────────────────────────────────────────────────

export default function CenterPanel({ draft, razaDetalle, claseDetalle, onChange }: Props) {
  const stats = draft.stats
  const nivel = draft.nivel
  const habs = draft.habilidades

  type RazaD = { especie?: { tamaño?: string; velocidad?: number } }
  const razaD = razaDetalle?.datos as RazaD | null
  const tamaño    = razaD?.especie?.tamaño    ?? '—'
  const velocidad = razaD?.especie?.velocidad ?? null

  const habsTrasfondo = draft.habilidades_trasfondo

  const toggleHab = (key: keyof typeof habs) => {
    if (habsTrasfondo.includes(key)) return
    onChange({ habilidades: { ...habs, [key]: !habs[key] } })
  }

  const casterStat = getCasterStat(claseDetalle?.nombre)
  const percep = getPassivePerception(stats.sab, habs.percepcion, nivel)
  const init = getInitiative(stats.des)

  return (
    <div className="flex flex-col h-full">

      {/* Sección fija: combate y misc */}
      <div className="shrink-0 flex flex-col gap-3 p-4 border-b border-border/40">

        {/* Velocidad + Tamaño */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Velocidad</Label>
            <div className="bg-secondary border border-border/60 rounded-md text-center text-sm font-bold text-foreground p-1">
              {velocidad !== null ? `${velocidad} pies` : '—'}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Tamaño</Label>
            <div className="bg-secondary border border-border/60 rounded-md text-center text-sm font-medium text-muted-foreground p-1">
              {tamaño}
            </div>
          </div>
        </div>

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

      </div>

      {/* Sección scrollable: habilidades */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Habilidades</p>
        <div className="flex flex-col gap-0.5">
          {SKILLS.map((skill) => {
            const mod = getSkillMod(stats[skill.stat], habs[skill.key], nivel)
            const source: ProfSource = habsTrasfondo.includes(skill.key) ? 'trasfondo' : habs[skill.key] ? 'manual' : 'none'
            return (
              <div key={skill.key} className="flex items-center gap-1.5 text-xs py-0.5">
                <ProfCircle source={source} onClick={() => toggleHab(skill.key)} />
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
