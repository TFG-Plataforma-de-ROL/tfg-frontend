import { useState, useMemo } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Zap, Clock, Target } from 'lucide-react'
import { HECHIZOS, type HechizoDato } from '@/data/hechizosData'

interface Props {
  open: boolean
  nivel: number
  claseNombre?: string | null
  onSelect: (hechizo: HechizoDato) => void
  onClose: () => void
}

const SCHOOL_COLORS: Record<string, string> = {
  'Abjuración':    'bg-blue-600/20 text-blue-400',
  'Conjuración':   'bg-emerald-600/20 text-emerald-400',
  'Adivinación':   'bg-cyan-600/20 text-cyan-400',
  'Encantamiento': 'bg-pink-600/20 text-pink-400',
  'Evocación':     'bg-orange-600/20 text-orange-400',
  'Ilusión':       'bg-purple-600/20 text-purple-400',
  'Necromancia':   'bg-slate-500/20 text-slate-400',
  'Transmutación': 'bg-amber-600/20 text-amber-400',
}

export default function SpellPickerDialog({ open, nivel, claseNombre, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')

  const candidatos = useMemo(() => {
    let list = HECHIZOS.filter((h) => h.nivel === nivel)
    if (claseNombre) {
      list = list.filter((h) => h.clases.includes(claseNombre))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((h) => h.nombre.toLowerCase().includes(q) || h.escuela.toLowerCase().includes(q))
    }
    return list
  }, [nivel, claseNombre, search])

  if (!open) return null

  const titulo = nivel === 0 ? 'Seleccionar Truco' : `Seleccionar Conjuro de Nivel ${nivel}`

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
            <h3 className="font-semibold text-sm text-primary">{titulo}</h3>
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
          </div>

          {/* Search */}
          <div className="px-4 py-2 shrink-0 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o escuela..."
                className="pl-8 h-8 text-xs bg-secondary border-border/60"
                autoFocus
              />
            </div>
          </div>

          {/* Spell list */}
          <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
            {candidatos.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                {claseNombre
                  ? `No hay conjuros de nivel ${nivel} disponibles para ${claseNombre}`
                  : 'Sin resultados'}
              </p>
            )}
            {candidatos.map((h) => (
              <button
                key={h.nombre}
                type="button"
                onClick={() => { onSelect(h); onClose() }}
                className="flex flex-col gap-1 p-2.5 rounded-md text-left bg-secondary/40 hover:bg-secondary border border-transparent hover:border-border/40 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold group-hover:text-primary transition-colors flex-1">
                    {h.nombre}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {h.ritual && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">R</span>
                    )}
                    {h.concentracion && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-900/40 text-amber-400">C</span>
                    )}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${SCHOOL_COLORS[h.escuela] ?? 'bg-muted text-muted-foreground'}`}>
                      {h.escuela.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> {h.tiempo_lanzamiento}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Target className="h-2.5 w-2.5" /> {h.alcance}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Zap className="h-2.5 w-2.5" /> {h.duracion}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                  {h.descripcion}
                </p>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border/40 shrink-0 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
