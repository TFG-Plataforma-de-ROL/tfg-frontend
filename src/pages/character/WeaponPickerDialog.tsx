import { useState, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { ARMAS, tieneCompetencia, labelCategoria, type ArmaBase, type CategoriaArma } from '@/data/armasData'

type Filtro = 'todas' | 'simples' | 'marciales' | 'competentes'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (arma: ArmaBase) => void
  claseProficiencias: string[]
}

function CategoriaBadge({ categoria }: { categoria: CategoriaArma }) {
  const isSimple = categoria.startsWith('simple')
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold shrink-0 ${
      isSimple ? 'bg-blue-600/80 text-white' : 'bg-orange-600/80 text-white'
    }`}>
      {isSimple ? 'S' : 'M'}
    </span>
  )
}

function ProfBadge() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-600/20 text-green-400 text-[9px] font-bold shrink-0" title="Competente">
      ✓
    </span>
  )
}

export default function WeaponPickerDialog({ open, onClose, onAdd, claseProficiencias }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const armasFiltradas = useMemo(() => {
    let lista = ARMAS
    if (filtro === 'simples')     lista = lista.filter(a => a.categoria.startsWith('simple'))
    if (filtro === 'marciales')   lista = lista.filter(a => a.categoria.startsWith('marcial'))
    if (filtro === 'competentes') lista = lista.filter(a => tieneCompetencia(a.categoria, claseProficiencias))
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      lista = lista.filter(a => a.nombre.toLowerCase().includes(q) || a.tipo_dano.toLowerCase().includes(q))
    }
    return lista
  }, [filtro, busqueda, claseProficiencias])

  const selectedArma = ARMAS.find(a => a.id === selected) ?? null

  const handleAdd = () => {
    if (!selectedArma) return
    onAdd(selectedArma)
    setSelected(null)
    setBusqueda('')
    onClose()
  }

  const handleClose = () => {
    setSelected(null)
    setBusqueda('')
    onClose()
  }

  const FILTROS: { key: Filtro; label: string }[] = [
    { key: 'todas',      label: 'Todas'      },
    { key: 'simples',    label: 'Simples'    },
    { key: 'marciales',  label: 'Marciales'  },
    { key: 'competentes', label: 'Competentes' },
  ]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl h-[560px] p-0 flex flex-col gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border/40 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Añadir Arma</span>
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
          {/* Weapon list */}
          <div className="w-64 shrink-0 border-r border-border/40 flex flex-col">
            {/* Search */}
            <div className="p-2 border-b border-border/40 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar arma..."
                  className="h-7 text-xs bg-secondary border-border/60 pl-8"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {armasFiltradas.length === 0 && (
                <p className="text-xs text-muted-foreground italic p-4">Sin resultados.</p>
              )}
              {armasFiltradas.map(arma => {
                const comp = tieneCompetencia(arma.categoria, claseProficiencias)
                return (
                  <button
                    key={arma.id}
                    type="button"
                    onClick={() => setSelected(arma.id === selected ? null : arma.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-border/20 last:border-0 flex items-center gap-2 ${
                      selected === arma.id
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'hover:bg-secondary/60 text-foreground'
                    }`}
                  >
                    <CategoriaBadge categoria={arma.categoria} />
                    <span className="flex-1 text-xs truncate">{arma.nombre}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{arma.dano}</span>
                    {comp && <ProfBadge />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Weapon detail */}
          <div className="flex-1 p-5 overflow-y-auto">
            {!selectedArma && (
              <p className="text-sm text-muted-foreground italic">
                Selecciona un arma para ver sus detalles.
              </p>
            )}
            {selectedArma && (
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-bold">{selectedArma.nombre}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{labelCategoria(selectedArma.categoria)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/60 rounded-md p-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Daño</p>
                    <p className="text-sm font-bold">{selectedArma.dano}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{selectedArma.tipo_dano}</p>
                  </div>
                  <div className="bg-secondary/60 rounded-md p-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Maestría</p>
                    <p className="text-sm font-bold">{selectedArma.maestria}</p>
                  </div>
                </div>

                {selectedArma.propiedades.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Propiedades</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedArma.propiedades.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-secondary rounded-full text-[11px] text-foreground/80">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tieneCompetencia(selectedArma.categoria, claseProficiencias) && (
                  <div className="flex items-center gap-1.5 text-green-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    Tu personaje tiene competencia con esta arma
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/40 shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose}>Cancelar</Button>
          <Button size="sm" onClick={handleAdd} disabled={!selectedArma}>Añadir</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
