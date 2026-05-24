import { useState, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Volume2 } from 'lucide-react'
import {
  ARMADURAS, tieneCompetenciaArmadura, labelCategoriaArmadura, formulaCA,
  type ArmaduraBase, type CategoriaArmadura,
} from '@/data/armadurasData'

type Filtro = 'todas' | 'ligera' | 'mediana' | 'pesada' | 'competentes'

interface Props {
  open: boolean
  onClose: () => void
  onEquip: (armaduraId: string | null) => void
  equipadaId: string | null
  claseProficiencias: string[]
}

function CategoriaBadge({ categoria }: { categoria: CategoriaArmadura }) {
  const colors: Record<CategoriaArmadura, string> = {
    ligera:  'bg-sky-600/80 text-white',
    mediana: 'bg-amber-600/80 text-white',
    pesada:  'bg-slate-600/80 text-white',
  }
  const letters: Record<CategoriaArmadura, string> = { ligera: 'L', mediana: 'M', pesada: 'P' }
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold shrink-0 ${colors[categoria]}`}>
      {letters[categoria]}
    </span>
  )
}

export default function ArmorPickerDialog({ open, onClose, onEquip, equipadaId, claseProficiencias }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [selected, setSelected] = useState<string | null>(equipadaId)

  const armasFiltradas = useMemo(() => {
    let lista = ARMADURAS
    if (filtro === 'ligera')      lista = lista.filter(a => a.categoria === 'ligera')
    if (filtro === 'mediana')     lista = lista.filter(a => a.categoria === 'mediana')
    if (filtro === 'pesada')      lista = lista.filter(a => a.categoria === 'pesada')
    if (filtro === 'competentes') lista = lista.filter(a => tieneCompetenciaArmadura(a.categoria, claseProficiencias))
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      lista = lista.filter(a => a.nombre.toLowerCase().includes(q))
    }
    return lista
  }, [filtro, busqueda, claseProficiencias])

  const selectedArmadura = ARMADURAS.find(a => a.id === selected) ?? null

  const handleEquip = () => {
    onEquip(selected)
    setBusqueda('')
    onClose()
  }

  const handleRemove = () => {
    onEquip(null)
    setSelected(null)
    setBusqueda('')
    onClose()
  }

  const handleClose = () => {
    setSelected(equipadaId)
    setBusqueda('')
    onClose()
  }

  const FILTROS: { key: Filtro; label: string }[] = [
    { key: 'todas',       label: 'Todas'      },
    { key: 'ligera',      label: 'Ligera'     },
    { key: 'mediana',     label: 'Mediana'    },
    { key: 'pesada',      label: 'Pesada'     },
    { key: 'competentes', label: 'Competentes' },
  ]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl h-[560px] p-0 flex flex-col gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border/40 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Equipar Armadura</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-border/40 shrink-0 px-1">
          {FILTROS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                filtro === f.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Armor list */}
          <div className="w-64 shrink-0 border-r border-border/40 flex flex-col">
            <div className="p-2 border-b border-border/40 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar armadura..."
                  className="h-7 text-xs bg-secondary border-border/60 pl-8"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {armasFiltradas.length === 0 && (
                <p className="text-xs text-muted-foreground italic p-4">Sin resultados.</p>
              )}
              {armasFiltradas.map(armadura => {
                const comp = tieneCompetenciaArmadura(armadura.categoria, claseProficiencias)
                const esEquipada = equipadaId === armadura.id
                return (
                  <button
                    key={armadura.id}
                    type="button"
                    onClick={() => setSelected(armadura.id === selected ? null : armadura.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-border/20 last:border-0 flex items-center gap-2 ${
                      selected === armadura.id
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'hover:bg-secondary/60 text-foreground'
                    }`}
                  >
                    <CategoriaBadge categoria={armadura.categoria} />
                    <span className="flex-1 text-xs truncate">{armadura.nombre}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {armadura.categoria === 'pesada' ? armadura.ca_base : `${armadura.ca_base}+`}
                    </span>
                    {armadura.desventaja_sigilo && (
                      <Volume2 className="h-3 w-3 text-orange-400/70 shrink-0" title="Desventaja en sigilo" />
                    )}
                    {comp && (
                      <span className="w-3.5 h-3.5 rounded-full bg-green-600/20 flex items-center justify-center shrink-0" title="Competente">
                        <span className="text-green-400 text-[8px] font-bold">C</span>
                      </span>
                    )}
                    {esEquipada && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" title="Equipada" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex-1 p-5 overflow-y-auto">
            {!selectedArmadura && (
              <p className="text-sm text-muted-foreground italic">
                Selecciona una armadura para ver sus detalles.
              </p>
            )}
            {selectedArmadura && (
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-bold">{selectedArmadura.nombre}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{labelCategoriaArmadura(selectedArmadura.categoria)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/60 rounded-md p-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">CA base</p>
                    <p className="text-xl font-bold">{selectedArmadura.ca_base}</p>
                    <p className="text-[10px] text-muted-foreground">{formulaCA(selectedArmadura)}</p>
                  </div>
                  <div className="bg-secondary/60 rounded-md p-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Coste</p>
                    <p className="text-sm font-bold">{selectedArmadura.coste}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  {selectedArmadura.fuerza_minima && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-28">Fuerza mínima:</span>
                      <span className="font-semibold text-amber-400">{selectedArmadura.fuerza_minima}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-28">Penalización sigilo:</span>
                    {selectedArmadura.desventaja_sigilo
                      ? <span className="font-semibold text-orange-400 flex items-center gap-1"><Volume2 className="h-3 w-3" /> Desventaja</span>
                      : <span className="text-muted-foreground">Ninguna</span>
                    }
                  </div>
                </div>

                {tieneCompetenciaArmadura(selectedArmadura.categoria, claseProficiencias) && (
                  <div className="flex items-center gap-1.5 text-green-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    Tu personaje tiene competencia con esta armadura
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 px-4 py-3 border-t border-border/40 shrink-0">
          <div>
            {equipadaId && (
              <Button variant="ghost" size="sm" onClick={handleRemove} className="text-destructive hover:text-destructive/80 text-xs">
                Desequipar armadura
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>Cancelar</Button>
            <Button size="sm" onClick={handleEquip} disabled={!selectedArmadura}>Equipar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
