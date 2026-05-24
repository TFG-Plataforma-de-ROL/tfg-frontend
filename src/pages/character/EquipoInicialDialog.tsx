import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { EquipoInicial } from '@/types/character'

const TRASFONDO_OPCION_B = ['50 po']

interface Props {
  open: boolean
  onClose: () => void
  claseNombre: string
  trasfondoNombre: string
  claseEquipo: Record<string, string[]> | null
  trasfondoEquipo: string[] | null
  current: EquipoInicial
  onAccept: (claseOpcion: string | null, trasfondoOpcion: 'a' | 'b' | null) => void
}

function OptionCard({
  label, items, selected, onClick,
}: { label: string; items: string[]; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-2 p-3 rounded-lg border text-left transition-colors w-full ${
        selected
          ? 'border-primary/60 bg-primary/10'
          : 'border-border/50 bg-secondary/30 hover:bg-secondary/60'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? 'border-primary' : 'border-muted-foreground/40'
        }`}>
          {selected && <span className="w-2 h-2 rounded-full bg-primary block" />}
        </span>
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <ul className="pl-5 flex flex-col gap-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground">• {item}</li>
        ))}
      </ul>
    </button>
  )
}

export default function EquipoInicialDialog({
  open, onClose, claseNombre, trasfondoNombre, claseEquipo, trasfondoEquipo, current, onAccept,
}: Props) {
  const [pendingClase, setPendingClase] = useState<string | null>(current.clase_opcion)
  const [pendingTrasfondo, setPendingTrasfondo] = useState<'a' | 'b' | null>(current.trasfondo_opcion)

  useEffect(() => {
    if (open) {
      setPendingClase(current.clase_opcion)
      setPendingTrasfondo(current.trasfondo_opcion)
    }
  }, [open, current.clase_opcion, current.trasfondo_opcion])

  const handleAccept = () => {
    onAccept(pendingClase, pendingTrasfondo)
    onClose()
  }

  const hasContent = claseEquipo || trasfondoEquipo

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0 flex flex-col gap-0 [&>button]:hidden">
        <div className="px-5 py-3 border-b border-border/40 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Equipo Inicial</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 max-h-[70vh]">
          {!hasContent && (
            <p className="text-sm text-muted-foreground italic">
              Selecciona una clase y/o trasfondo para ver las opciones de equipo inicial.
            </p>
          )}

          {claseEquipo && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Por Clase{claseNombre ? ` — ${claseNombre}` : ''}
              </p>
              {Object.entries(claseEquipo).map(([key, items]) => (
                <OptionCard
                  key={key}
                  label={`Opción ${key.toUpperCase()}`}
                  items={items}
                  selected={pendingClase === key}
                  onClick={() => setPendingClase(pendingClase === key ? null : key)}
                />
              ))}
            </div>
          )}

          {trasfondoEquipo && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Por Trasfondo{trasfondoNombre ? ` — ${trasfondoNombre}` : ''}
              </p>
              <OptionCard
                label="Opción A"
                items={trasfondoEquipo}
                selected={pendingTrasfondo === 'a'}
                onClick={() => setPendingTrasfondo(pendingTrasfondo === 'a' ? null : 'a')}
              />
              <OptionCard
                label="Opción B"
                items={TRASFONDO_OPCION_B}
                selected={pendingTrasfondo === 'b'}
                onClick={() => setPendingTrasfondo(pendingTrasfondo === 'b' ? null : 'b')}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/40 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleAccept}>Aceptar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
