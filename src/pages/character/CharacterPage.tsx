import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { personajeService } from '@/services/personajeService'
import { fichaService, draftToCampos, fichaToCharacterDraft } from '@/services/fichaService'
import { getTrasfondoHabilidades, getClaseInfo } from '@/utils/characterDetails'
import { getMod } from '@/utils/dnd'
import { exportCharacterToPDF } from '@/utils/characterExport'
import { itemService } from '@/services/itemService'
import type { Item, ItemDetalle } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'
import { calcularCA, ARMADURAS } from '@/data/armadurasData'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import TopBar from './TopBar'
import ItemSelectionDialog from './ItemSelectionDialog'
import AbilityWizardModal from './AbilityWizardModal'

const DEFAULT_DRAFT: CharacterDraft = {
  nombre: '',
  nivel: 1,
  hp_por_nivel: [],
  id_raza: null,
  id_clase: null,
  id_trasfondo: null,
  habilidades_clase: [],
  habilidades_trasfondo: [],
  estilo_combate_id: null,
  id_subclase: null,
  abilitySetup: null,
  stats: { fue: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 },
  combate: { ca: 10, pv_max: 8, pv_actual: 8, velocidad: 30 },
  salvaciones: { fue: false, des: false, con: false, int: false, sab: false, car: false },
  habilidades: {
    acrobacias: false, atletismo: false, engano: false, historia: false,
    intimidacion: false, interpretacion: false, investigacion: false,
    juegoDeManos: false, medicina: false, naturaleza: false, percepcion: false,
    perspicacia: false, persuasion: false, religion: false, sigilo: false,
    supervivencia: false, trato_con_animales: false, arcanos: false,
  },
  inspiracion: 0,
  armadura_equipada: null,
  escudo_equipado: false,
  armas: [],
  equipo: [],
  equipo_inicial: { clase_opcion: null, trasfondo_opcion: null, monedas_clase: { platino: 0, oro: 0, plata: 0, cobre: 0 }, monedas_trasfondo: { platino: 0, oro: 0, plata: 0, cobre: 0 } },
  monedas: { platino: 0, oro: 0, plata: 0, cobre: 0 },
  conjuros: [],
  casillas_usadas: {},
  rasgos: [],
  detalles: {
    historia: '', rasgos_de_personalidad: '', ideales: '',
    vinculos: '', defectos: '', apariencia: '',
    edad: '', altura: '', peso: '', ojos: '', piel: '', pelo: '',
  },
}

const DND_SISTEMA_ROL_ID = 1

export default function CharacterPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [draft, setDraft] = useState<CharacterDraft>(DEFAULT_DRAFT)
  const [fichaId, setFichaId] = useState<number | null>(null)
  const [personajeId, setPersonajeId] = useState<number | null>(null)

  const [razas, setRazas] = useState<Item[]>([])
  const [clases, setClases] = useState<Item[]>([])
  const [trasfondos, setTrasfondos] = useState<Item[]>([])
  const [estilosCombate, setEstilosCombate] = useState<Item[]>([])
  const [subclasesPorClase, setSubclasesPorClase] = useState<Record<string, Item[]>>({})

  const [dialogOpen, setDialogOpen] = useState<'raza' | 'clase' | 'trasfondo' | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  const [razaDetalle,      setRazaDetalle]      = useState<ItemDetalle | null>(null)
  const [claseDetalle,     setClaseDetalle]     = useState<ItemDetalle | null>(null)
  const [trasfondoDetalle, setTrasfondoDetalle] = useState<ItemDetalle | null>(null)
  const [subclaseDetalle,  setSubclaseDetalle]  = useState<ItemDetalle | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  useEffect(() => {
    Promise.all([
      itemService.getItems('raza', DND_SISTEMA_ROL_ID),
      itemService.getItems('clase', DND_SISTEMA_ROL_ID),
      itemService.getItems('trasfondo', DND_SISTEMA_ROL_ID),
      itemService.getItems('estilo_combate', DND_SISTEMA_ROL_ID),
      itemService.getItems('subclase_guerrero', DND_SISTEMA_ROL_ID),
      itemService.getItems('subclase_mago', DND_SISTEMA_ROL_ID),
      itemService.getItems('subclase_picaro', DND_SISTEMA_ROL_ID),
      itemService.getItems('subclase_clerigo', DND_SISTEMA_ROL_ID),
    ]).then(([r, c, t, ec, sg, sm, sp, sc]) => {
      setRazas(r)
      setClases(c)
      setTrasfondos(t)
      setEstilosCombate(ec)
      setSubclasesPorClase({ Guerrero: sg, Mago: sm, Pícaro: sp, Clérigo: sc })
    }).catch((err) => console.error('Error cargando items:', err))
  }, [])

  useEffect(() => {
    if (!isEditing || !id) { setLoading(false); return }
    const personajeIdNum = Number(id)
    setPersonajeId(personajeIdNum)

    fichaService.getFichas(personajeIdNum)
      .then(async (fichas) => {
        if (fichas.length === 0) { setLoading(false); return }
        const ficha = fichas[0]
        setFichaId(ficha.id_ficha)
        const detalle = await fichaService.getFichaById(personajeIdNum, ficha.id_ficha)
        const loaded = fichaToCharacterDraft(detalle)
        setDraft((prev) => ({ ...prev, nombre: ficha.nombre, ...loaded }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isEditing])

  useEffect(() => {
    if (!draft.id_raza) { setRazaDetalle(null); return }
    itemService.getItemById(draft.id_raza).then(setRazaDetalle).catch(() => setRazaDetalle(null))
  }, [draft.id_raza])

  useEffect(() => {
    if (!draft.id_clase) { setClaseDetalle(null); return }
    itemService.getItemById(draft.id_clase).then(setClaseDetalle).catch(() => setClaseDetalle(null))
  }, [draft.id_clase])

  useEffect(() => {
    if (!draft.id_trasfondo) { setTrasfondoDetalle(null); return }
    itemService.getItemById(draft.id_trasfondo).then(setTrasfondoDetalle).catch(() => setTrasfondoDetalle(null))
  }, [draft.id_trasfondo])

  useEffect(() => {
    if (!draft.id_subclase) { setSubclaseDetalle(null); return }
    itemService.getItemById(draft.id_subclase).then(setSubclaseDetalle).catch(() => setSubclaseDetalle(null))
  }, [draft.id_subclase])

  useEffect(() => {
    if (!trasfondoDetalle) return
    const keys = getTrasfondoHabilidades(trasfondoDetalle)
    if (keys.length === 0) return
    setDraft(prev => {
      const newHabs = { ...prev.habilidades }
      keys.forEach(k => { newHabs[k] = true })
      return { ...prev, habilidades: newHabs, habilidades_trasfondo: keys }
    })
  }, [trasfondoDetalle])

  const claseDetalleRef = useRef(claseDetalle)
  claseDetalleRef.current = claseDetalle

  // Reconstruye hp_por_nivel cuando cambia la clase (o cuando está vacío tras carga)
  useEffect(() => {
    const info = getClaseInfo(claseDetalle)
    if (!info?.nivel1) return
    const dieMax = parseInt((info.dado ?? '').replace('d', ''), 10) || info.nivel1
    setDraft(prev => {
      if (prev.hp_por_nivel.length === prev.nivel) return prev
      const conMod = getMod(prev.stats.con)
      const hp_por_nivel = Array.from({ length: prev.nivel }, (_, i) =>
        i === 0 ? info.nivel1! + conMod : dieMax + conMod
      )
      const pv_max = hp_por_nivel.reduce((a, b) => a + b, 0)
      const atFull = prev.combate.pv_actual >= prev.combate.pv_max
      return {
        ...prev,
        hp_por_nivel,
        combate: { ...prev.combate, pv_max, pv_actual: atFull ? pv_max : prev.combate.pv_actual },
      }
    })
  }, [claseDetalle])

  const handleChange = useCallback((partial: Partial<CharacterDraft>) => {
    setDraft((prev) => {
      let next = { ...prev, ...partial }

      // CA
      if (partial.stats !== undefined) {
        const armadura = ARMADURAS.find(a => a.id === next.armadura_equipada) ?? null
        const ca = calcularCA(armadura, next.escudo_equipado, next.stats.des)
        next = { ...next, combate: { ...next.combate, ca } }
      }

      // HP: nivel o CON cambian
      const nivelChanged = partial.nivel !== undefined && partial.nivel !== prev.nivel
      const conChanged = partial.stats !== undefined && partial.stats.con !== prev.stats.con
      if (nivelChanged || conChanged) {
        const info = getClaseInfo(claseDetalleRef.current)
        if (info?.nivel1) {
          const dieMax = parseInt((info.dado ?? '').replace('d', ''), 10) || info.nivel1
          const conMod = getMod(next.stats.con)
          let hp = [...next.hp_por_nivel]

          if (nivelChanged) {
            const oldNivel = prev.nivel
            const newNivel = next.nivel
            if (newNivel > oldNivel) {
              for (let i = oldNivel; i < newNivel; i++) {
                hp[i] = dieMax + conMod
              }
            } else {
              hp = hp.slice(0, newNivel)
            }
          }

          if (conChanged) {
            const idx = next.nivel - 1
            while (hp.length <= idx) {
              const i = hp.length
              hp.push(i === 0 ? info.nivel1 + conMod : dieMax + conMod)
            }
            hp[idx] = idx === 0 ? info.nivel1 + conMod : dieMax + conMod
          }

          const pv_max = hp.reduce((a, b) => a + b, 0)
          const atFull = prev.combate.pv_actual >= prev.combate.pv_max
          next = {
            ...next,
            hp_por_nivel: hp,
            combate: { ...next.combate, pv_max, pv_actual: atFull ? pv_max : next.combate.pv_actual },
          }
        }
      }

      // Clase cambia → limpiar equipo/armas y resetear hp_por_nivel
      if (partial.id_clase !== undefined && partial.id_clase !== prev.id_clase) {
        const mc = next.equipo_inicial.monedas_clase
        next = {
          ...next,
          hp_por_nivel: [],
          armas:  next.armas.filter(a => a.fuente !== 'clase'),
          equipo: next.equipo.filter(e => e.fuente !== 'clase'),
          monedas: {
            platino: Math.max(0, next.monedas.platino - mc.platino),
            oro:     Math.max(0, next.monedas.oro     - mc.oro),
            plata:   Math.max(0, next.monedas.plata   - mc.plata),
            cobre:   Math.max(0, next.monedas.cobre   - mc.cobre),
          },
          equipo_inicial: { ...next.equipo_inicial, clase_opcion: null, monedas_clase: { platino: 0, oro: 0, plata: 0, cobre: 0 } },
        }
      }

      if (partial.id_trasfondo !== undefined && partial.id_trasfondo !== prev.id_trasfondo) {
        const habsSinTrasfondo = { ...next.habilidades }
        prev.habilidades_trasfondo.forEach(k => { habsSinTrasfondo[k] = false })
        const mt = next.equipo_inicial.monedas_trasfondo
        next = {
          ...next,
          armas:  next.armas.filter(a => a.fuente !== 'trasfondo'),
          equipo: next.equipo.filter(e => e.fuente !== 'trasfondo'),
          monedas: {
            platino: Math.max(0, next.monedas.platino - mt.platino),
            oro:     Math.max(0, next.monedas.oro     - mt.oro),
            plata:   Math.max(0, next.monedas.plata   - mt.plata),
            cobre:   Math.max(0, next.monedas.cobre   - mt.cobre),
          },
          equipo_inicial: { ...next.equipo_inicial, trasfondo_opcion: null, monedas_trasfondo: { platino: 0, oro: 0, plata: 0, cobre: 0 } },
          habilidades: habsSinTrasfondo,
          habilidades_trasfondo: [],
        }
      }

      return next
    })
    setSaveMsg(null)
  }, [])

  const handleSave = async () => {
    if (!draft.nombre.trim()) {
      setSaveMsg({ tipo: 'err', texto: 'El personaje necesita un nombre' })
      return
    }
    setSaving(true)
    setSaveMsg(null)
    try {
      let pjId = personajeId
      let fId = fichaId

      if (!pjId) {
        const pj = await personajeService.createPersonaje({ nombre: draft.nombre, id_sistema_rol: DND_SISTEMA_ROL_ID })
        pjId = pj.id_personaje
        setPersonajeId(pjId)
      } else {
        await personajeService.updatePersonaje(pjId, { nombre: draft.nombre })
      }

      if (!fId) {
        const ficha = await fichaService.createFicha(pjId, draft.nombre, DND_SISTEMA_ROL_ID)
        fId = ficha.id_ficha
        setFichaId(fId)
      }

      await fichaService.saveCampos(pjId, fId, draftToCampos(draft))
      setSaveMsg({ tipo: 'ok', texto: 'Personaje guardado' })

      if (!isEditing) {
        navigate(ROUTES.PRIVATE.PERSONAJE_EDITAR.replace(':id', String(pjId)), { replace: true })
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setSaveMsg({ tipo: 'err', texto: e.response?.data?.error ?? 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    exportCharacterToPDF({ draft, razas, clases, trasfondos, claseDetalle, subclaseDetalle })
  }

  const dialogConfig = dialogOpen ? {
    raza:      { title: 'Raza',      items: razas,      currentId: draft.id_raza,      field: 'id_raza'      as const },
    clase:     { title: 'Clase',     items: clases,     currentId: draft.id_clase,     field: 'id_clase'     as const },
    trasfondo: { title: 'Trasfondo', items: trasfondos, currentId: draft.id_trasfondo, field: 'id_trasfondo' as const },
  }[dialogOpen] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">Cargando personaje...</p>
      </div>
    )
  }

  return (
    <>
    <div className="flex flex-col h-full gap-0">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PRIVATE.DASHBOARD)} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold truncate max-w-[200px]">
            {draft.nombre || (isEditing ? 'Personaje' : 'Nuevo personaje')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className={`text-xs ${saveMsg.tipo === 'ok' ? 'text-green-400' : 'text-destructive'}`}>
              {saveMsg.texto}
            </span>
          )}
          {isEditing && fichaId && (
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 border-border/60">
              <Download className="h-3.5 w-3.5 mr-1" />
              PDF
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 bg-primary hover:bg-primary/90">
            <Save className="h-3.5 w-3.5 mr-1" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Main area: LeftPanel full height + columna derecha con TopBar encima */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: llega desde el header hasta abajo */}
        <div className="w-60 shrink-0 border-r border-border/40 overflow-y-auto">
          <LeftPanel
            draft={draft}
            razas={razas}
            clases={clases}
            trasfondos={trasfondos}
            razaDetalle={razaDetalle}
            claseDetalle={claseDetalle}
            trasfondoDetalle={trasfondoDetalle}
            estilosCombate={estilosCombate}
            subclasesPorClase={subclasesPorClase}
            onChange={handleChange}
            onOpenDialog={setDialogOpen}
            onOpenWizard={() => setWizardOpen(true)}
          />
        </div>

        {/* Columna derecha: TopBar + Center + Right */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* TopBar: nombre + nivel + stats + CA + HP + salv */}
          <TopBar draft={draft} claseDetalle={claseDetalle} onChange={handleChange} />

          {/* Center + Right panels */}
          <div className="flex flex-1 overflow-hidden">

            {/* Center: velocidad, inspiración, habilidades */}
            <div className="w-64 shrink-0 border-r border-border/40 overflow-hidden flex flex-col">
              <CenterPanel
                draft={draft}
                razaDetalle={razaDetalle}
                claseDetalle={claseDetalle}
                onChange={handleChange}
              />
            </div>

            {/* Right: tabs */}
            <div className="flex-1 overflow-hidden p-4 flex flex-col">
              <RightPanel
                draft={draft}
                onChange={handleChange}
                razaDetalle={razaDetalle}
                claseDetalle={claseDetalle}
                trasfondoDetalle={trasfondoDetalle}
                subclaseDetalle={subclaseDetalle}
              />
            </div>

          </div>
        </div>
      </div>
    </div>

    {dialogConfig && (
      <ItemSelectionDialog
        open={Boolean(dialogOpen)}
        onClose={() => setDialogOpen(null)}
        title={dialogConfig.title}
        items={dialogConfig.items}
        currentId={dialogConfig.currentId}
        onAccept={(id) => handleChange({ [dialogConfig.field]: id })}
      />
    )}

    <AbilityWizardModal
      open={wizardOpen}
      onClose={() => setWizardOpen(false)}
      initial={draft.abilitySetup}
      trasfondoCaracteristicas={(() => {
        if (!trasfondoDetalle?.datos) return null
        const d = trasfondoDetalle.datos as { trasfondo?: { mejora_caracteristicas?: string[] } }
        return d.trasfondo?.mejora_caracteristicas ?? null
      })()}
      onAccept={(setup) => {
        const stats = {
          fue: setup.baseScores.fue + setup.trasfondoBonuses.fue,
          des: setup.baseScores.des + setup.trasfondoBonuses.des,
          con: setup.baseScores.con + setup.trasfondoBonuses.con,
          int: setup.baseScores.int + setup.trasfondoBonuses.int,
          sab: setup.baseScores.sab + setup.trasfondoBonuses.sab,
          car: setup.baseScores.car + setup.trasfondoBonuses.car,
        }
        handleChange({ abilitySetup: setup, stats })
      }}
    />
    </>
  )
}
