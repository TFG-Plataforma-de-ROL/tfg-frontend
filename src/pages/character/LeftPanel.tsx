import { useState } from 'react'
import { User, Sword, BookOpen, ChevronRight, Sliders, Package } from 'lucide-react'
import type { Item, ItemDetalle } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'
import { getMod, formatMod, SKILLS } from '@/utils/dnd'
import { getRazaInfo, getClaseInfo, getClaseHabilidades, getTrasfondoInfo, getClaseEquipo, getTrasfondoEquipo } from '@/utils/characterDetails'
import { clasificarEquipo } from '@/utils/equipoInicialUtils'
import { ARMADURAS, calcularCA } from '@/data/armadurasData'
import EquipoInicialDialog from './EquipoInicialDialog'
import LevelProgressionPanel from './LevelProgressionPanel'

const STAT_ORDER: (keyof CharacterDraft['stats'])[] = ['fue', 'des', 'con', 'int', 'sab', 'car']

const METHOD_LABEL: Record<NonNullable<CharacterDraft['abilitySetup']>['method'], string> = {
  standard_array: 'Matriz estándar',
  point_buy:      'Compra de puntos',
  roll:           'Tirada de dados',
}

interface Props {
  draft: CharacterDraft
  razas: Item[]
  clases: Item[]
  trasfondos: Item[]
  razaDetalle: ItemDetalle | null
  claseDetalle: ItemDetalle | null
  trasfondoDetalle: ItemDetalle | null
  estilosCombate: Item[]
  subclasesPorClase: Record<string, Item[]>
  onChange: (partial: Partial<CharacterDraft>) => void
  onOpenDialog: (type: 'raza' | 'clase' | 'trasfondo') => void
  onOpenWizard: () => void
}

interface CardProps {
  icon: React.ElementType
  label: string
  selected: Item | undefined
  onClick: () => void
  children?: React.ReactNode
}

function SelectionCard({ icon: Icon, label, selected, onClick, children }: CardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/80 transition-colors text-left"
        onClick={onClick}
      >
        <Icon className="h-5 w-5 text-primary shrink-0" />
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
            {label}
          </span>
          <span className={`text-sm font-medium truncate w-full ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {selected ? selected.nombre : 'Sin seleccionar'}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {children}
    </div>
  )
}

// ── Bloque de info compacto ────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1 text-[10px] leading-tight">
      <span className="text-muted-foreground/60 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="text-muted-foreground truncate">{value}</span>
    </div>
  )
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border/40 text-muted-foreground truncate max-w-full">
          {item}
        </span>
      ))}
    </div>
  )
}

// ── Card de habilidades de clase ───────────────────────────────────────────

interface HabilidadesClaseCardProps {
  opciones: { elige: number; de: string[] }
  seleccionadas: (keyof CharacterDraft['habilidades'])[]
  onChange: (keys: (keyof CharacterDraft['habilidades'])[]) => void
}

function HabilidadesClaseCard({ opciones, seleccionadas, onChange }: HabilidadesClaseCardProps) {
  const toggle = (key: keyof CharacterDraft['habilidades']) => {
    if (seleccionadas.includes(key)) {
      onChange(seleccionadas.filter(k => k !== key))
    } else if (seleccionadas.length < opciones.elige) {
      onChange([...seleccionadas, key])
    }
  }

  return (
    <div className="ml-3 flex flex-col gap-1.5 border border-border/40 rounded-lg p-2 bg-secondary/20">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Habilidades</span>
        <span className="text-[10px] text-muted-foreground">
          {seleccionadas.length}/{opciones.elige}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {opciones.de.map(nombre => {
          const skill = SKILLS.find(s => s.nombre.toLowerCase() === nombre.toLowerCase())
          if (!skill) return null
          const activa = seleccionadas.includes(skill.key)
          const agotado = !activa && seleccionadas.length >= opciones.elige
          return (
            <button
              key={skill.key}
              type="button"
              disabled={agotado}
              onClick={() => toggle(skill.key)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                activa
                  ? 'bg-primary/20 border-primary/60 text-primary'
                  : agotado
                    ? 'bg-secondary border-border/30 text-muted-foreground/40 cursor-not-allowed'
                    : 'bg-secondary border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {nombre}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Card de características ────────────────────────────────────────────────

function CharacteristicsCard({ draft, onClick }: { draft: CharacterDraft; onClick: () => void }) {
  const setup = draft.abilitySetup
  const finalStats = setup
    ? STAT_ORDER.reduce((acc, s) => ({
        ...acc,
        [s]: setup.baseScores[s] + setup.trasfondoBonuses[s],
      }), {} as CharacterDraft['stats'])
    : null

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/80 transition-colors text-left"
      >
        <Sliders className="h-5 w-5 text-primary shrink-0" />
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
            Características
          </span>
          <span className={`text-sm font-medium truncate w-full ${setup ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {setup ? METHOD_LABEL[setup.method] : 'Sin configurar'}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {finalStats && (
        <div className="px-1">
          <div className="grid grid-cols-6 gap-1">
            {STAT_ORDER.map(s => (
              <div key={s} className="flex flex-col items-center p-1 rounded bg-secondary/40 border border-border/40">
                <span className="text-[9px] text-muted-foreground uppercase">{s}</span>
                <span className="font-bold text-xs">{finalStats[s]}</span>
                <span className="text-[9px] text-muted-foreground">{formatMod(getMod(finalStats[s]))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────

export default function LeftPanel({ draft, razas, clases, trasfondos, razaDetalle, claseDetalle, trasfondoDetalle, estilosCombate, subclasesPorClase, onChange, onOpenDialog, onOpenWizard }: Props) {
  const [equipoDialogOpen, setEquipoDialogOpen] = useState(false)

  const prof = Math.ceil(draft.nivel / 4) + 1

  const razaItem = razas.find((r) => r.id_item === draft.id_raza)
  const claseItem = clases.find((c) => c.id_item === draft.id_clase)
  const trasfondoItem = trasfondos.find((t) => t.id_item === draft.id_trasfondo)

  const razaInfo = getRazaInfo(razaDetalle)
  const claseInfo = getClaseInfo(claseDetalle)
  const claseHabilidades = getClaseHabilidades(claseDetalle)
  const trasfondoInfo = getTrasfondoInfo(trasfondoDetalle)
  const claseEquipo = getClaseEquipo(claseDetalle)
  const trasfondoEquipo = getTrasfondoEquipo(trasfondoDetalle)

  const handleHabilidadesClase = (keys: (keyof CharacterDraft['habilidades'])[]) => {
    const prev = draft.habilidades_clase
    const removed = prev.filter(k => !keys.includes(k))
    const added = keys.filter(k => !prev.includes(k))
    const newHabilidades = { ...draft.habilidades }
    removed.forEach(k => { newHabilidades[k] = false })
    added.forEach(k => { newHabilidades[k] = true })
    onChange({ habilidades_clase: keys, habilidades: newHabilidades })
  }

  const { clase_opcion, trasfondo_opcion } = draft.equipo_inicial
  const equipoStatus = (() => {
    const parts: string[] = []
    if (clase_opcion) parts.push(`Clase: Op. ${clase_opcion.toUpperCase()}`)
    if (trasfondo_opcion) parts.push(`Trasfondo: Op. ${trasfondo_opcion.toUpperCase()}`)
    return parts.length > 0 ? parts.join(' · ') : 'Sin seleccionar'
  })()

  const handleEquipoAccept = (claseOpcion: string | null, trasfondoOpcion: 'a' | 'b' | null) => {
    // Base: keep only manually-added weapons and equipment (no fuente tag)
    let armas  = draft.armas.filter(a => !a.fuente)
    let equipo = draft.equipo.filter(e => !e.fuente)
    let armaduraId    = draft.armadura_equipada
    let escudoEquipado = draft.escudo_equipado

    // Base monedas: subtract previous initial equipment monedas
    const prevMC = draft.equipo_inicial.monedas_clase    ?? { platino: 0, oro: 0, plata: 0, cobre: 0 }
    const prevMT = draft.equipo_inicial.monedas_trasfondo ?? { platino: 0, oro: 0, plata: 0, cobre: 0 }
    let monedas = {
      platino: Math.max(0, draft.monedas.platino - prevMC.platino - prevMT.platino),
      oro:     Math.max(0, draft.monedas.oro     - prevMC.oro     - prevMT.oro),
      plata:   Math.max(0, draft.monedas.plata   - prevMC.plata   - prevMT.plata),
      cobre:   Math.max(0, draft.monedas.cobre   - prevMC.cobre   - prevMT.cobre),
    }

    let monedasClase    = { platino: 0, oro: 0, plata: 0, cobre: 0 }
    let monedasTrasfondo = { platino: 0, oro: 0, plata: 0, cobre: 0 }

    if (claseOpcion && claseEquipo) {
      const c = clasificarEquipo(claseEquipo[claseOpcion] ?? [], 'clase')
      armas  = [...armas,  ...c.armas.map(a => ({ ...a, id: crypto.randomUUID() }))]
      equipo = [...equipo, ...c.equipo.map(e => ({ ...e, id: crypto.randomUUID() }))]
      if (c.armaduraId)  armaduraId     = c.armaduraId
      if (c.escudo)      escudoEquipado = true
      monedasClase = c.monedas
    }

    if (trasfondoOpcion) {
      const lista = trasfondoOpcion === 'a' ? (trasfondoEquipo ?? []) : ['50 po']
      const t = clasificarEquipo(lista, 'trasfondo')
      armas  = [...armas,  ...t.armas.map(a => ({ ...a, id: crypto.randomUUID() }))]
      equipo = [...equipo, ...t.equipo.map(e => ({ ...e, id: crypto.randomUUID() }))]
      if (t.armaduraId)  armaduraId     = t.armaduraId
      if (t.escudo)      escudoEquipado = true
      monedasTrasfondo = t.monedas
    }

    monedas = {
      platino: monedas.platino + monedasClase.platino + monedasTrasfondo.platino,
      oro:     monedas.oro     + monedasClase.oro     + monedasTrasfondo.oro,
      plata:   monedas.plata   + monedasClase.plata   + monedasTrasfondo.plata,
      cobre:   monedas.cobre   + monedasClase.cobre   + monedasTrasfondo.cobre,
    }

    const armaduraData = ARMADURAS.find(a => a.id === armaduraId) ?? null
    const ca = calcularCA(armaduraData, escudoEquipado, draft.stats.des)

    onChange({
      armas,
      equipo,
      monedas,
      armadura_equipada: armaduraId,
      escudo_equipado:   escudoEquipado,
      combate: { ...draft.combate, ca },
      equipo_inicial: { clase_opcion: claseOpcion, trasfondo_opcion: trasfondoOpcion, monedas_clase: monedasClase, monedas_trasfondo: monedasTrasfondo },
    })
  }

  return (
    <div className="flex flex-col gap-3 p-3 h-full">
      <SelectionCard
        icon={User}
        label="Raza"
        selected={razaItem}
        onClick={() => onOpenDialog('raza')}
      >
        {razaInfo && (
          <div className="px-1 flex flex-col gap-1.5">
            {(razaInfo.tamaño || razaInfo.velocidad) && (
              <InfoRow
                label="Mov"
                value={[razaInfo.tamaño, razaInfo.velocidad ? `${razaInfo.velocidad} pies` : ''].filter(Boolean).join(' · ')}
              />
            )}
            {razaInfo.rasgos.length > 0 && <TagList items={razaInfo.rasgos.map(r => r.nombre)} />}
          </div>
        )}
      </SelectionCard>

      <SelectionCard
        icon={Sword}
        label="Clase"
        selected={claseItem}
        onClick={() => onOpenDialog('clase')}
      >
        {claseInfo && (
          <div className="px-1 flex flex-col gap-1.5">
            {(claseInfo.dado || claseInfo.nivel1) && (
              <InfoRow
                label="Golpe"
                value={[claseInfo.dado, claseInfo.nivel1 ? `${claseInfo.nivel1} PV nv1` : ''].filter(Boolean).join(' · ')}
              />
            )}
            {claseInfo.salvaciones && claseInfo.salvaciones.length > 0 && (
              <InfoRow label="Salv" value={claseInfo.salvaciones.join(', ')} />
            )}
            {claseInfo.rasgosN1.length > 0 && <TagList items={claseInfo.rasgosN1.map(r => r.nombre)} />}
          </div>
        )}
      </SelectionCard>

      {claseHabilidades && (
        <HabilidadesClaseCard
          opciones={claseHabilidades}
          seleccionadas={draft.habilidades_clase}
          onChange={handleHabilidadesClase}
        />
      )}

      <SelectionCard
        icon={BookOpen}
        label="Trasfondo"
        selected={trasfondoItem}
        onClick={() => onOpenDialog('trasfondo')}
      >
        {trasfondoInfo && (
          <div className="px-1 flex flex-col gap-1.5">
            {trasfondoInfo.caracteristicas && trasfondoInfo.caracteristicas.length > 0 && (
              <InfoRow label="Mejora" value={trasfondoInfo.caracteristicas.join(', ')} />
            )}
            {trasfondoInfo.habilidades && trasfondoInfo.habilidades.length > 0 && (
              <InfoRow label="Hab" value={trasfondoInfo.habilidades.join(', ')} />
            )}
            {trasfondoInfo.herramientas && trasfondoInfo.herramientas.length > 0 && (
              <InfoRow label="Tool" value={trasfondoInfo.herramientas.join(', ')} />
            )}
            {trasfondoInfo.dote && <InfoRow label="Dote" value={trasfondoInfo.dote.nombre} />}
          </div>
        )}
      </SelectionCard>

      <hr className="border-border/40" />

      <CharacteristicsCard draft={draft} onClick={onOpenWizard} />

      <hr className="border-border/40" />

      <button
        type="button"
        onClick={() => setEquipoDialogOpen(true)}
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/80 transition-colors text-left"
      >
        <Package className="h-5 w-5 text-primary shrink-0" />
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
            Equipo Inicial
          </span>
          <span className={`text-sm font-medium truncate w-full ${clase_opcion || trasfondo_opcion ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {equipoStatus}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      <EquipoInicialDialog
        open={equipoDialogOpen}
        onClose={() => setEquipoDialogOpen(false)}
        claseNombre={claseItem?.nombre ?? ''}
        trasfondoNombre={trasfondoItem?.nombre ?? ''}
        claseEquipo={claseEquipo}
        trasfondoEquipo={trasfondoEquipo}
        current={draft.equipo_inicial}
        onAccept={handleEquipoAccept}
      />

      <hr className="border-border/40" />
      <LevelProgressionPanel
        draft={draft}
        claseDetalle={claseDetalle}
        claseNombre={claseItem?.nombre}
        estilosCombate={estilosCombate}
        subclases={claseItem ? (subclasesPorClase[claseItem.nombre] ?? []) : []}
        onChange={onChange}
      />

      <div className="mt-auto pt-4 border-t border-border/40 flex flex-col gap-1 text-xs text-muted-foreground">
        <p>Bono de competencia: <span className="font-bold text-foreground">+{prof}</span></p>
        {draft.id_raza === null && <p className="text-yellow-500/80">Selecciona una raza</p>}
        {draft.id_clase === null && <p className="text-yellow-500/80">Selecciona una clase</p>}
        {draft.id_trasfondo === null && <p className="text-yellow-500/80">Selecciona un trasfondo</p>}
      </div>
    </div>
  )
  
}
