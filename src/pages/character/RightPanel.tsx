import { useState } from 'react'
import type { CharacterDraft, WeaponEntry, EquipmentEntry, SpellEntry, FeatEntry, Monedas } from '@/types/character'
import type { ItemDetalle } from '@/services/itemService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ChevronDown, Sword, Shield, Volume2, Sparkles, RotateCcw } from 'lucide-react'
import { getRazaInfo, getClaseRasgosAgrupadosPorNivel, getTrasfondoInfo } from '@/utils/characterDetails'
import type { RasgoConDesc } from '@/utils/characterDetails'
import WeaponPickerDialog from './WeaponPickerDialog'
import ArmorPickerDialog from './ArmorPickerDialog'
import SpellPickerDialog from './SpellPickerDialog'
import { ARMAS, tieneCompetencia, type ArmaBase, type CategoriaArma } from '@/data/armasData'
import {
  ARMADURAS, calcularCA, formulaCA,
  tieneCompetenciaArmadura, tieneCompetenciaEscudo,
} from '@/data/armadurasData'
import type { HechizoDato } from '@/data/hechizosData'
import {
  getSpellDC, getSpellAttackBonus, formatMod,
  getLanzamientoInfo, getSpellSlots, getCantripCount,
} from '@/utils/dnd'

interface BaseProps {
  draft: CharacterDraft
  onChange: (partial: Partial<CharacterDraft>) => void
}

interface Props extends BaseProps {
  razaDetalle: ItemDetalle | null
  claseDetalle: ItemDetalle | null
  trasfondoDetalle: ItemDetalle | null
  subclaseDetalle?: ItemDetalle | null
}

// ── Armas ──────────────────────────────────────────────────────────────────

function calcProfBonus(nivel: number): number {
  return Math.ceil(nivel / 4) + 1
}

function calcStatMod(w: WeaponEntry, stats: CharacterDraft['stats']): number {
  const fueMod = Math.floor((stats.fue - 10) / 2)
  const desMod = Math.floor((stats.des - 10) / 2)
  const props = w.propiedades ?? ARMAS.find(a => a.nombre === w.nombre)?.propiedades ?? []
  const tieneFinura = props.some(p => /finura/i.test(p))
  const esRango = (w.categoria ?? '').includes('rango')
  return tieneFinura ? Math.max(fueMod, desMod) : esRango ? desMod : fueMod
}

function calcImpactar(w: WeaponEntry, draft: CharacterDraft, comp: boolean): number {
  return calcStatMod(w, draft.stats) + (comp ? calcProfBonus(draft.nivel) : 0)
}

function WeaponsTab({ draft, onChange, claseDetalle }: BaseProps & { claseDetalle: ItemDetalle | null }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const claseData = (claseDetalle?.datos as Record<string, unknown> | undefined)
  const claseProficiencias: string[] = (claseData?.clase as Record<string, unknown> | undefined)
    ?.competencias
    ? ((claseData?.clase as Record<string, unknown>).competencias as Record<string, unknown>).armas as string[]
    : []

  const update = (id: string, partial: Partial<WeaponEntry>) =>
    onChange({ armas: draft.armas.map((w) => w.id === id ? { ...w, ...partial } : w) })
  const remove = (id: string) =>
    onChange({ armas: draft.armas.filter((w) => w.id !== id) })

  const handleAddFromPicker = (arma: ArmaBase) => {
    const entry: WeaponEntry = {
      id: crypto.randomUUID(),
      nombre: arma.nombre,
      bonus_ataque: 0,
      dano: arma.dano,
      tipo_dano: arma.tipo_dano,
      categoria: arma.categoria,
      propiedades: arma.propiedades,
    }
    onChange({ armas: [...draft.armas, entry] })
  }

  return (
    <div className="flex flex-col gap-2">
      {draft.armas.length > 0 && (
        <>
          <div className="grid grid-cols-[20px_1fr_44px_76px_72px_1fr_24px] gap-1 text-[10px] uppercase tracking-wide text-muted-foreground px-1">
            <span />
            <span>Nombre</span>
            <span className="text-center">Impactar</span>
            <span className="text-center">Daño</span>
            <span className="text-center">Tipo</span>
            <span>Propiedades</span>
            <span />
          </div>

          {draft.armas.map((w) => {
            const comp = w.categoria
              ? tieneCompetencia(w.categoria as CategoriaArma, claseProficiencias)
              : false
            const impactar = calcImpactar(w, draft, comp)
            const statMod = calcStatMod(w, draft.stats)
            const props = w.propiedades ?? ARMAS.find(a => a.nombre === w.nombre)?.propiedades ?? []
            return (
              <div key={w.id} className="grid grid-cols-[20px_1fr_44px_76px_72px_1fr_24px] gap-1 items-center">
                <div className="flex items-center justify-center">
                  {comp
                    ? <span className="w-4 h-4 rounded-full bg-green-600/20 flex items-center justify-center" title="Competente">
                        <span className="text-green-400 text-[9px] font-bold">C</span>
                      </span>
                    : <span className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                        <Sword className="h-2.5 w-2.5 text-muted-foreground/50" />
                      </span>
                  }
                </div>
                <Input value={w.nombre} onChange={(e) => update(w.id, { nombre: e.target.value })}
                  placeholder="Espada larga" className="h-7 text-xs bg-secondary border-border/60" />
                <div className="h-7 bg-secondary/60 border border-border/40 rounded-md flex items-center justify-center text-xs font-semibold tabular-nums">
                  {impactar >= 0 ? `+${impactar}` : `${impactar}`}
                </div>
                <div className="h-7 bg-secondary/60 border border-border/40 rounded-md flex items-center justify-center text-xs font-semibold tabular-nums">
                  {w.dano}{statMod >= 0 ? `+${statMod}` : statMod}
                </div>
                <div className="h-7 flex items-center justify-center text-[11px] text-muted-foreground truncate px-1" title={w.tipo_dano}>
                  {w.tipo_dano ? w.tipo_dano.charAt(0).toUpperCase() + w.tipo_dano.slice(1) : '—'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate leading-none" title={props.join(', ')}>
                  {props.length > 0 ? props.join(', ') : '—'}
                </div>
                <button type="button" onClick={() => remove(w.id)} className="text-destructive hover:text-destructive/80 flex items-center justify-center">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </>
      )}

      {draft.armas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
          <Sword className="h-8 w-8 opacity-20" />
          <p className="text-xs">Aún no has añadido ningún arma</p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setPickerOpen(true)}
        className="mt-1 border-dashed border-border/60 text-xs h-7"
      >
        <Plus className="h-3 w-3 mr-1" /> Añadir arma
      </Button>

      <WeaponPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddFromPicker}
        claseProficiencias={claseProficiencias}
      />
    </div>
  )
}

// ── Defensa ────────────────────────────────────────────────────────────────

function DefenseTab({ draft, onChange, claseDetalle }: BaseProps & { claseDetalle: ItemDetalle | null }) {
  const [armorPickerOpen, setArmorPickerOpen] = useState(false)

  const claseData = (claseDetalle?.datos as Record<string, unknown> | undefined)
  const claseComp = (claseData?.clase as Record<string, unknown> | undefined)?.competencias as Record<string, unknown> | undefined
  const claseProfArmaduras: string[] = (claseComp?.armaduras as string[] | undefined) ?? []

  const armaduraEquipada = ARMADURAS.find(a => a.id === draft.armadura_equipada) ?? null
  const escudo = draft.escudo_equipado

  const handleEquipArmadura = (id: string | null) => {
    const armadura = id ? ARMADURAS.find(a => a.id === id) ?? null : null
    const nuevaCA = calcularCA(armadura, escudo, draft.stats.des)
    onChange({ armadura_equipada: id, combate: { ...draft.combate, ca: nuevaCA } })
  }

  const handleToggleEscudo = () => {
    const nuevoEscudo = !escudo
    const nuevaCA = calcularCA(armaduraEquipada, nuevoEscudo, draft.stats.des)
    onChange({ escudo_equipado: nuevoEscudo, combate: { ...draft.combate, ca: nuevaCA } })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Competencias de armaduras */}
      {claseProfArmaduras.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-secondary/40 border border-border/30">
          <span className="text-xs">Competencias de armaduras:</span>
          <div className="flex flex-wrap gap-1">
            {claseProfArmaduras.map((categoria) => (
              <span key={categoria} className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded">
                {categoria}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Escudo */}
      <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/40 border border-border/30">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs">Escudo (+2 CA)</span>
          {tieneCompetenciaEscudo(claseProfArmaduras) && (
            <span className="w-3.5 h-3.5 rounded-full bg-green-600/20 flex items-center justify-center" title="Competente con escudos">
              <span className="text-green-400 text-[8px] font-bold">C</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleEscudo}
          className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
            escudo ? 'bg-primary' : 'bg-secondary border border-border/60'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
            escudo ? 'left-5' : 'left-1'
          }`} />
        </button>
      </div>

      {/* Armadura equipada */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Armadura</p>
        {armaduraEquipada ? (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-secondary/60 border border-border/40">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0 ${
              armaduraEquipada.categoria === 'ligera'  ? 'bg-sky-600/80 text-white' :
              armaduraEquipada.categoria === 'mediana' ? 'bg-amber-600/80 text-white' :
              'bg-slate-600/80 text-white'
            }`}>
              {armaduraEquipada.categoria === 'ligera' ? 'L' : armaduraEquipada.categoria === 'mediana' ? 'M' : 'P'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{armaduraEquipada.nombre}</p>
              <p className="text-[10px] text-muted-foreground">{formulaCA(armaduraEquipada)}</p>
            </div>
            {armaduraEquipada.desventaja_sigilo && (
              <span title="Desventaja en sigilo"><Volume2 className="h-3.5 w-3.5 text-orange-400/80 shrink-0" /></span>
            )}
            {tieneCompetenciaArmadura(armaduraEquipada.categoria, claseProfArmaduras) && (
              <span className="w-4 h-4 rounded-full bg-green-600/20 flex items-center justify-center shrink-0" title="Competente">
                <span className="text-green-400 text-[9px] font-bold">C</span>
              </span>
            )}
            <Button
              type="button" variant="ghost" size="sm"
              onClick={() => setArmorPickerOpen(true)}
              className="h-6 px-2 text-[11px] shrink-0"
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setArmorPickerOpen(true)}
            className="w-full flex items-center gap-2 p-2.5 rounded-md border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <Shield className="h-4 w-4 opacity-40" />
            <span className="text-xs">Sin armadura — pulsa para equipar</span>
          </button>
        )}
      </div>

      <ArmorPickerDialog
        open={armorPickerOpen}
        onClose={() => setArmorPickerOpen(false)}
        onEquip={handleEquipArmadura}
        equipadaId={draft.armadura_equipada}
        claseProficiencias={claseProfArmaduras}
      />
    </div>
  )
}

// ── Equipo ─────────────────────────────────────────────────────────────────

const MONEDAS_CONFIG: { key: keyof Monedas; label: string; coinClass: string }[] = [
  { key: 'platino', label: 'Platino', coinClass: 'bg-gray-100 border border-gray-300 shadow-inner' },
  { key: 'oro',     label: 'Oro',     coinClass: 'bg-yellow-400 shadow-inner' },
  { key: 'plata',   label: 'Plata',   coinClass: 'bg-slate-300 border border-slate-400 shadow-inner' },
  { key: 'cobre',   label: 'Cobre',   coinClass: 'bg-amber-700 shadow-inner' },
]

function EquipmentTab({ draft, onChange }: BaseProps) {
  const monedas = draft.monedas
  const updateMonedas = (partial: Partial<Monedas>) =>
    onChange({ monedas: { ...monedas, ...partial } })

  const fueModificador = Math.floor((draft.stats.fue - 10) / 2)
  const bulkTotal = draft.equipo.reduce((sum, e) => sum + (e.carga ?? 0) * e.cantidad, 0)
  const encLimit = 5 + fueModificador
  const maxLimit = 10 + fueModificador
  const status = bulkTotal <= encLimit ? 'Sin carga' : bulkTotal <= maxLimit ? 'Cargado' : 'Sobrecargado'

  const addItem = () =>
    onChange({ equipo: [...draft.equipo, { id: crypto.randomUUID(), nombre: '', cantidad: 1 }] })
  const update = (id: string, partial: Partial<EquipmentEntry>) =>
    onChange({ equipo: draft.equipo.map((e) => e.id === id ? { ...e, ...partial } : e) })
  const remove = (id: string) =>
    onChange({ equipo: draft.equipo.filter((e) => e.id !== id) })

  return (
    <div className="flex flex-col gap-3">
      {/* Monedas */}
      <div className="grid grid-cols-4 gap-1.5">
        {MONEDAS_CONFIG.map(({ key, label, coinClass }) => (
          <div key={key} className="flex items-center gap-1.5 p-2 rounded-md bg-secondary/40 border border-border/40">
            <div className={`w-7 h-7 rounded-full shrink-0 ${coinClass}`} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] text-muted-foreground leading-none mb-0.5">{label}</span>
              <input
                type="number"
                value={monedas[key]}
                min={0}
                onChange={(e) => updateMonedas({ [key]: Math.max(0, Number(e.target.value)) })}
                className="w-full bg-transparent border-0 text-xs font-semibold p-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Carga */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
        <span>Carga total <span className="text-foreground font-semibold">{bulkTotal}</span></span>
        <span>{status} (Enc: {encLimit}; Máx: {maxLimit})</span>
      </div>

      {/* Botones de acción */}
      <Button type="button" variant="outline" size="sm" onClick={addItem}
        className="text-[11px] h-7 border-border/60">
        <Plus className="h-3 w-3 mr-1" /> Añadir Equipo
      </Button>

      {/* Inventario Principal */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-primary">Inventario Principal</span>
        {draft.equipo.map((e) => (
          <div key={e.id} className="flex gap-1 items-center">
            <Input value={e.nombre} onChange={(ev) => update(e.id, { nombre: ev.target.value })}
              placeholder="Mochila..." className="h-7 text-xs bg-secondary border-border/60 flex-1" />
            <input type="number" value={e.cantidad} min={1}
              onChange={(ev) => update(e.id, { cantidad: Number(ev.target.value) })}
              className="w-12 h-7 bg-secondary border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <button type="button" onClick={() => remove(e.id)} className="text-destructive hover:text-destructive/80 p-1">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {draft.equipo.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">Sin objetos en el inventario</p>
        )}
      </div>
    </div>
  )
}

// ── Conjuros ───────────────────────────────────────────────────────────────

interface SpellsTabProps extends BaseProps {
  claseDetalle: ItemDetalle | null
  subclaseDetalle?: ItemDetalle | null
}

function SpellSlotCircles({
  total, used, onToggle,
}: { total: number; used: number; onToggle: (idx: number) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          title={i < used ? 'Casilla gastada (clic para recuperar)' : 'Casilla disponible (clic para gastar)'}
          onClick={() => onToggle(i)}
          className={`w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${
            i < used
              ? 'bg-primary/30 border-primary/60'
              : 'bg-transparent border-muted-foreground/40 hover:border-primary/60'
          }`}
        />
      ))}
    </div>
  )
}

function SpellRow({
  spell, claseNombre, onReplace, onRemove,
}: {
  spell: SpellEntry
  claseNombre?: string | null
  onReplace: (h: HechizoDato) => void
  onRemove: () => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div className="grid grid-cols-[1fr_80px_80px_20px] gap-1 items-center group">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={`h-7 px-2 rounded-md border text-left text-xs truncate transition-colors ${
            spell.nombre
              ? 'bg-secondary/60 border-border/40 hover:border-primary/40 hover:text-primary'
              : 'bg-secondary/30 border-dashed border-border/40 text-primary/60 hover:text-primary hover:border-primary/40'
          }`}
        >
          {spell.nombre || 'No seleccionado'}
        </button>
        <div
          className="h-7 flex items-center justify-center text-[10px] text-muted-foreground truncate px-1 cursor-pointer"
          onClick={() => spell.nombre && setExpanded(e => !e)}
          title={spell.duracion}
        >
          {spell.duracion ?? '—'}
        </div>
        <div className="h-7 flex items-center justify-center text-[10px] text-muted-foreground truncate px-1" title={spell.alcance}>
          {spell.alcance ?? '—'}
        </div>
        <button type="button" onClick={onRemove} className="text-destructive/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {expanded && spell.descripcion && (
        <p className="text-[10px] text-muted-foreground leading-snug px-2 pb-1 bg-secondary/20 rounded-md">
          {spell.descripcion}
          {spell.concentracion && <span className="ml-2 text-amber-400/80">[Concentración]</span>}
          {spell.ritual && <span className="ml-2 text-cyan-400/80">[Ritual]</span>}
        </p>
      )}
      <SpellPickerDialog
        open={pickerOpen}
        nivel={spell.nivel}
        claseNombre={claseNombre}
        onSelect={onReplace}
        onClose={() => setPickerOpen(false)}
      />
    </>
  )
}

function SpellsTab({ draft, onChange, claseDetalle, subclaseDetalle }: SpellsTabProps) {
  const [pickerNivel, setPickerNivel] = useState<number | null>(null)

  const lanzamiento = getLanzamientoInfo(claseDetalle, subclaseDetalle ?? null)
  const claseNombre = claseDetalle?.nombre ?? null

  if (!lanzamiento) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <Sparkles className="h-10 w-10 opacity-15" />
        <p className="text-xs text-center max-w-[200px] leading-relaxed">
          Esta clase no puede lanzar conjuros, o aún no has seleccionado ninguna clase.
        </p>
      </div>
    )
  }

  const nivel = draft.nivel
  const stat = lanzamiento.stat
  const statVal = draft.stats[stat]
  const dc = getSpellDC(statVal, nivel)
  const atk = getSpellAttackBonus(statVal, nivel)
  const statLabel = stat.toUpperCase()

  const slots = getSpellSlots(nivel, lanzamiento.tipo)
  const cantripCount = getCantripCount(nivel, lanzamiento.trucos_por_nivel)

  // Spells by slot level
  const conjurosPorNivel = (n: number) => draft.conjuros.filter((s) => s.nivel === n)

  const addSpell = (nivel: number, hechizo: HechizoDato) => {
    const entry: SpellEntry = {
      id: crypto.randomUUID(),
      nombre: hechizo.nombre,
      nivel,
      escuela: hechizo.escuela,
      descripcion: hechizo.descripcion,
      tiempo_lanzamiento: hechizo.tiempo_lanzamiento,
      alcance: hechizo.alcance,
      duracion: hechizo.duracion,
      concentracion: hechizo.concentracion,
      ritual: hechizo.ritual,
    }
    onChange({ conjuros: [...draft.conjuros, entry] })
  }

  const replaceSpell = (id: string, hechizo: HechizoDato) => {
    onChange({
      conjuros: draft.conjuros.map((s) =>
        s.id === id
          ? {
              ...s,
              nombre: hechizo.nombre,
              escuela: hechizo.escuela,
              descripcion: hechizo.descripcion,
              tiempo_lanzamiento: hechizo.tiempo_lanzamiento,
              alcance: hechizo.alcance,
              duracion: hechizo.duracion,
              concentracion: hechizo.concentracion,
              ritual: hechizo.ritual,
            }
          : s,
      ),
    })
  }

  const removeSpell = (id: string) =>
    onChange({ conjuros: draft.conjuros.filter((s) => s.id !== id) })

  const casillasUsadas = draft.casillas_usadas ?? {}

  const toggleSlot = (spellLevel: number, idx: number) => {
    const used = casillasUsadas[spellLevel] ?? 0
    const newUsed = idx < used ? used - 1 : used + 1
    onChange({ casillas_usadas: { ...casillasUsadas, [spellLevel]: Math.min(newUsed, slots[spellLevel - 1] ?? 0) } })
  }

  const resetSlots = () => onChange({ casillas_usadas: {} })

  const cantripsActuales = conjurosPorNivel(0)

  return (
    <div className="flex flex-col gap-0">
      {/* Header bar */}
      <div className="flex items-center gap-4 px-1 pb-3 border-b border-border/30 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">DC</span>
          <span className="text-base font-black text-primary">{dc}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Ataque</span>
          <span className="text-base font-black text-primary">{formatMod(atk)}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">{statLabel}</span>
          <span className="text-[11px] text-muted-foreground">{formatMod(Math.floor((statVal - 10) / 2))}</span>
        </div>
        <button
          type="button"
          onClick={resetSlots}
          title="Recuperar todas las casillas (Descanso largo)"
          className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
        >
          <RotateCcw className="h-3 w-3" /> Desc. largo
        </button>
      </div>

      {/* Trucos (Cantrips) */}
      {cantripCount > 0 && (
        <div className="flex flex-col gap-1 mb-4">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">Trucos</span>
          <div className="grid grid-cols-[1fr_80px_80px_20px] gap-1 text-[9px] uppercase tracking-wide text-muted-foreground px-0.5 mb-0.5">
            <span>Nombre</span>
            <span className="text-center">Duración</span>
            <span className="text-center">Alcance</span>
            <span />
          </div>
          {cantripsActuales.map((s) => (
            <SpellRow
              key={s.id}
              spell={s}
              claseNombre={claseNombre}
              onReplace={(h) => replaceSpell(s.id, h)}
              onRemove={() => removeSpell(s.id)}
            />
          ))}
          {/* Fill empty cantrip slots */}
          {Array.from({ length: Math.max(0, cantripCount - cantripsActuales.length) }).map((_, i) => (
            <div key={`empty-cantrip-${i}`} className="grid grid-cols-[1fr_80px_80px_20px] gap-1 items-center">
              <button
                type="button"
                onClick={() => setPickerNivel(0)}
                className="h-7 px-2 rounded-md border border-dashed border-border/40 text-left text-xs text-primary/60 hover:text-primary hover:border-primary/40 transition-colors"
              >
                No seleccionado
              </button>
              <div className="h-7" />
              <div className="h-7" />
              <div />
            </div>
          ))}
          {cantripsActuales.length < cantripCount && (
            <button
              type="button"
              onClick={() => setPickerNivel(0)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors mt-0.5"
            >
              <Plus className="h-3 w-3" /> Añadir truco
            </button>
          )}
        </div>
      )}

      {/* Spell levels */}
      {slots.map((total, idx) => {
        if (total === 0) return null
        const spellLevel = idx + 1
        const spellsEsteNivel = conjurosPorNivel(spellLevel)
        const used = casillasUsadas[spellLevel] ?? 0

        return (
          <div key={spellLevel} className="flex flex-col gap-1 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                Nivel {spellLevel}
              </span>
              <SpellSlotCircles
                total={total}
                used={used}
                onToggle={(i) => toggleSlot(spellLevel, i)}
              />
              <span className="text-[9px] text-muted-foreground ml-auto">
                {total - used}/{total}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_80px_80px_20px] gap-1 text-[9px] uppercase tracking-wide text-muted-foreground px-0.5 mb-0.5">
              <span>Conjuro</span>
              <span className="text-center">Duración</span>
              <span className="text-center">Alcance</span>
              <span />
            </div>
            {spellsEsteNivel.map((s) => (
              <SpellRow
                key={s.id}
                spell={s}
                claseNombre={claseNombre}
                onReplace={(h) => replaceSpell(s.id, h)}
                onRemove={() => removeSpell(s.id)}
              />
            ))}
            <button
              type="button"
              onClick={() => setPickerNivel(spellLevel)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors mt-0.5"
            >
              <Plus className="h-3 w-3" /> Añadir conjuro de nivel {spellLevel}
            </button>
          </div>
        )
      })}

      {/* Global picker trigger */}
      {pickerNivel !== null && (
        <SpellPickerDialog
          open
          nivel={pickerNivel}
          claseNombre={claseNombre}
          onSelect={(h) => { addSpell(pickerNivel, h); setPickerNivel(null) }}
          onClose={() => setPickerNivel(null)}
        />
      )}
    </div>
  )
}

// ── Rasgos / Dotes ─────────────────────────────────────────────────────────

function FeatSection({ title, items }: { title: string; items: RasgoConDesc[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">{title}</span>
      {items.map((item) => (
        <div key={item.nombre}>
          <button
            type="button"
            onClick={() => item.descripcion && setExpanded(expanded === item.nombre ? null : item.nombre)}
            className={`flex items-center gap-1.5 py-0.5 pl-1 w-full text-left transition-colors ${item.descripcion ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
          >
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
            <span className="text-xs text-foreground">{item.nombre}</span>
            {item.descripcion && (
              <ChevronDown className={`h-3 w-3 ml-auto text-muted-foreground/60 shrink-0 transition-transform ${expanded === item.nombre ? 'rotate-180' : ''}`} />
            )}
          </button>
          {expanded === item.nombre && item.descripcion && (
            <p className="text-[11px] text-muted-foreground leading-snug pl-4 pr-1 pb-1">
              {item.descripcion}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function FeatsTab({ draft, onChange, razaDetalle, claseDetalle, trasfondoDetalle }: Props) {
  const razaInfo = getRazaInfo(razaDetalle)
  const trasfondoInfo = getTrasfondoInfo(trasfondoDetalle)

  const trasfondoFeats: RasgoConDesc[] = trasfondoInfo?.dote ? [trasfondoInfo.dote] : []
  const claseRasgosPorNivel = getClaseRasgosAgrupadosPorNivel(claseDetalle, draft.nivel)
  const razaFeats = razaInfo?.rasgos ?? []
  const hasAutoFeats = claseRasgosPorNivel.length > 0 || trasfondoFeats.length > 0 || razaFeats.length > 0

  const update = (id: string, partial: Partial<FeatEntry>) =>
    onChange({ rasgos: draft.rasgos.map((f) => f.id === id ? { ...f, ...partial } : f) })
  const remove = (id: string) =>
    onChange({ rasgos: draft.rasgos.filter((f) => f.id !== id) })

  return (
    <div className="flex flex-col gap-4">
      {hasAutoFeats && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="flex flex-col gap-3">
            {claseRasgosPorNivel.map(({ nivel: n, rasgos }) => (
              <FeatSection key={n} title={`Rasgos de Clase · Nv. ${n}`} items={rasgos} />
            ))}
            <FeatSection title="Rasgos de Trasfondo" items={trasfondoFeats} />
          </div>
          <div className="flex flex-col gap-3">
            <FeatSection title="Rasgos de Raza" items={razaFeats} />
          </div>
        </div>
      )}

      {hasAutoFeats && <hr className="border-border/40" />}

      <div className="flex flex-col gap-2">
        {draft.rasgos.length > 0 && (
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">Rasgos propios</span>
        )}
        {draft.rasgos.map((f) => (
          <div key={f.id} className="flex flex-col gap-1 p-2 rounded-md bg-secondary/60 border border-border/40">
            <div className="flex gap-1 items-center">
              <Input value={f.nombre} onChange={(e) => update(f.id, { nombre: e.target.value })}
                placeholder="Atacante feroz" className="h-7 text-xs bg-background border-border/60 flex-1" />
              <button type="button" onClick={() => remove(f.id)} className="text-destructive hover:text-destructive/80 p-1">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input value={f.descripcion} onChange={(e) => update(f.id, { descripcion: e.target.value })}
              placeholder="Descripción..." className="h-6 text-[11px] bg-background border-border/40" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Detalles ───────────────────────────────────────────────────────────────

function DetailsTab({ draft, onChange }: BaseProps) {
  const det = draft.detalles
  const update = (key: keyof typeof det, value: string) =>
    onChange({ detalles: { ...det, [key]: value } })

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {([
          ['historia', 'Historia'],
          ['rasgos_de_personalidad', 'Rasgos de Personalidad'],
          ['ideales', 'Ideales'],
          ['vinculos', 'Vínculos'],
          ['defectos', 'Defectos'],
          ['apariencia', 'Apariencia'],
        ] as const).map(([key, label]) => (
          <div key={key} className={`flex flex-col gap-1 ${key === 'historia' ? 'col-span-2' : ''}`}>
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
            <Textarea
              value={det[key]}
              onChange={(e) => update(key, e.target.value)}
              rows={key === 'historia' ? 3 : 2}
              className="text-xs bg-secondary border-border/60 resize-none"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {([
          ['edad', 'Edad'], ['altura', 'Altura'], ['peso', 'Peso'],
          ['ojos', 'Ojos'], ['piel', 'Piel'], ['pelo', 'Pelo'],
        ] as const).map(([key, label]) => (
          <div key={key} className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
            <Input value={det[key]} onChange={(e) => update(key, e.target.value)}
              className="h-7 text-xs bg-secondary border-border/60" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RightPanel principal ───────────────────────────────────────────────────

export default function RightPanel({ draft, onChange, razaDetalle, claseDetalle, trasfondoDetalle, subclaseDetalle }: Props) {
  const [tab, setTab] = useState('armas')

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
      <TabsList className="w-full grid grid-cols-6 h-8 shrink-0">
        <TabsTrigger value="armas"    className="text-[11px]">Armas</TabsTrigger>
        <TabsTrigger value="defensa"  className="text-[11px]">Defensa</TabsTrigger>
        <TabsTrigger value="equipo"   className="text-[11px]">Equipo</TabsTrigger>
        <TabsTrigger value="conjuros" className="text-[11px]">Conjuros</TabsTrigger>
        <TabsTrigger value="rasgos"   className="text-[11px]">Rasgos</TabsTrigger>
        <TabsTrigger value="detalles" className="text-[11px]">Detalles</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto mt-3">
        <TabsContent value="armas"    className="mt-0"><WeaponsTab   draft={draft} onChange={onChange} claseDetalle={claseDetalle} /></TabsContent>
        <TabsContent value="defensa"  className="mt-0"><DefenseTab   draft={draft} onChange={onChange} claseDetalle={claseDetalle} /></TabsContent>
        <TabsContent value="equipo"   className="mt-0"><EquipmentTab draft={draft} onChange={onChange} /></TabsContent>
        <TabsContent value="conjuros" className="mt-0"><SpellsTab    draft={draft} onChange={onChange} claseDetalle={claseDetalle} subclaseDetalle={subclaseDetalle} /></TabsContent>
        <TabsContent value="rasgos"   className="mt-0">
          <FeatsTab draft={draft} onChange={onChange} razaDetalle={razaDetalle} claseDetalle={claseDetalle} trasfondoDetalle={trasfondoDetalle} />
        </TabsContent>
        <TabsContent value="detalles" className="mt-0"><DetailsTab   draft={draft} onChange={onChange} /></TabsContent>
      </div>
    </Tabs>
  )
}
