import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { personajeService } from '@/services/personajeService'
import { fichaService, draftToCampos, fichaToCharacterDraft } from '@/services/fichaService'
import { itemService } from '@/services/itemService'
import type { Item } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

const DEFAULT_DRAFT: CharacterDraft = {
  nombre: '',
  nivel: 1,
  id_raza: null,
  id_clase: null,
  id_trasfondo: null,
  stats: { fue: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 },
  combate: { ca: 10, pv_max: 8, velocidad: 30 },
  salvaciones: { fue: false, des: false, con: false, int: false, sab: false, car: false },
  habilidades: {
    acrobacias: false, atletismo: false, engano: false, historia: false,
    intimidacion: false, interpretacion: false, investigacion: false,
    juegoDeManos: false, medicina: false, naturaleza: false, percepcion: false,
    perspicacia: false, persuasion: false, religion: false, sigilo: false,
    supervivencia: false, trato_con_animales: false, arcanos: false,
  },
  inspiracion: 0,
  armas: [],
  equipo: [],
  conjuros: [],
  rasgos: [],
  detalles: {
    historia: '', rasgos_de_personalidad: '', ideales: '',
    vinculos: '', defectos: '', apariencia: '',
    edad: '', altura: '', peso: '', ojos: '', piel: '', pelo: '',
  },
}

// DnD 5e sistema_rol id — matches seed (id 1)
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

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Load catalog data
  useEffect(() => {
    Promise.all([
      itemService.getItems('raza', DND_SISTEMA_ROL_ID),
      itemService.getItems('clase', DND_SISTEMA_ROL_ID),
      itemService.getItems('trasfondo', DND_SISTEMA_ROL_ID),
    ]).then(([r, c, t]) => {
      setRazas(r)
      setClases(c)
      setTrasfondos(t)
    })
  }, [])

  // Load existing character data when editing
  useEffect(() => {
    if (!isEditing || !id) {
      setLoading(false)
      return
    }
    const personajeIdNum = Number(id)
    setPersonajeId(personajeIdNum)

    fichaService.getFichas(personajeIdNum)
      .then(async (fichas) => {
        if (fichas.length === 0) {
          // Personaje exists but no ficha yet — this happens when navigating from dashboard
          // We'll create the ficha on first save
          setLoading(false)
          return
        }
        const ficha = fichas[0]
        setFichaId(ficha.id_ficha)
        const detalle = await fichaService.getFichaById(personajeIdNum, ficha.id_ficha)
        const loaded = fichaToCharacterDraft(detalle)
        setDraft((prev) => ({ ...prev, nombre: ficha.nombre, ...loaded }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isEditing])

  const handleChange = useCallback((partial: Partial<CharacterDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }))
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

      // Create personaje if new
      if (!pjId) {
        const pj = await personajeService.createPersonaje({
          nombre: draft.nombre,
          id_sistema_rol: DND_SISTEMA_ROL_ID,
        })
        pjId = pj.id_personaje
        setPersonajeId(pjId)
      } else {
        // Update personaje name
        await personajeService.updatePersonaje(pjId, { nombre: draft.nombre })
      }

      // Create ficha if not yet existing
      if (!fId) {
        const ficha = await fichaService.createFicha(pjId, draft.nombre, DND_SISTEMA_ROL_ID)
        fId = ficha.id_ficha
        setFichaId(fId)
      }

      // Save campos
      const campos = draftToCampos(draft)
      await fichaService.saveCampos(pjId, fId, campos)

      setSaveMsg({ tipo: 'ok', texto: 'Personaje guardado' })

      // Navigate to edit URL if we were on /nuevo
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
    if (!personajeId) return
    window.open(`/api/personajes/${personajeId}/export`, '_blank')
  }

  const claseItem = clases.find((c) => c.id_item === draft.id_clase) ?? null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">Cargando personaje...</p>
      </div>
    )
  }

  return (
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

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-64 shrink-0 border-r border-border/40 p-4 overflow-y-auto">
          <LeftPanel
            draft={draft}
            razas={razas}
            clases={clases}
            trasfondos={trasfondos}
            onChange={handleChange}
          />
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto p-4">
          <RightPanel draft={draft} claseItem={claseItem} onChange={handleChange} />
        </div>
      </div>
    </div>
  )
}
