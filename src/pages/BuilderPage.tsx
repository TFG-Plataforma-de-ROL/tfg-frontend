import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { personajeService } from '../services/personajeService';
import { sistemaRolService } from '../services/sistemaRolService';
import { fichaService } from '../services/fichaService';
import { plantillaService } from '../services/plantillaService';
import { itemService } from '../services/itemService';
import { campoValorService } from '../services/campoValorService';
import type { Personaje, SistemaRol, FichaPersonaje, CampoPlantilla, Item, CampoValor } from '../types';

// ---- estilos ----
const s = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '1.5rem' } as const,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' } as const,
  back: { background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', padding: 0, fontSize: '0.9rem' } as const,
  titulo: { margin: '0 0 0.25rem', fontSize: '1.4rem' } as const,
  subtitulo: { margin: 0, color: '#666', fontSize: '0.85rem' } as const,
  nivelBar: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const } as const,
  nivelBtn: (active: boolean) => ({
    padding: '0.3rem 0.75rem',
    border: `2px solid ${active ? '#1976d2' : '#ccc'}`,
    borderRadius: 20,
    background: active ? '#1976d2' : '#fff',
    color: active ? '#fff' : '#333',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 400,
  } as const),
  panels: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' } as const,
  panel: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1.25rem' } as const,
  panelTitle: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#333', borderBottom: '2px solid #1976d2', paddingBottom: '0.5rem' } as const,
  nivelSection: { marginBottom: '1.25rem' } as const,
  nivelLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#1976d2', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: '0.5rem' },
  campoWrap: { marginBottom: '0.75rem' } as const,
  campoLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: '0.85rem', fontWeight: 600 } as const,
  savedTag: { fontSize: '0.7rem', color: '#43a047', fontWeight: 400 } as const,
  input: { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 56 },
  select: { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem', boxSizing: 'border-box' as const },
  fichaRow: { padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' } as const,
  fichaKey: { color: '#555', fontWeight: 600 } as const,
  fichaVal: { color: '#222', textAlign: 'right' as const, maxWidth: '55%' },
  fichaEmpty: { color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic' } as const,
  err: { background: '#fde8e8', color: '#c62828', borderRadius: 4, padding: '0.75rem', marginBottom: '1rem' } as const,
};

// ---- tipos locales ----
type ValoresMap = Record<number, CampoValor>; // keyed by id_campo_plantilla
type ItemsMap = Record<string, Item[]>;        // keyed by tipo_item (= filtro_item)
type PendingMap = Record<number, string | number | null>; // valores en edición local

export default function BuilderPage() {
  const { personajeId } = useParams<{ personajeId: string }>();
  const navigate = useNavigate();

  const [personaje, setPersonaje] = useState<Personaje | null>(null);
  const [sistema, setSistema] = useState<SistemaRol | null>(null);
  const [ficha, setFicha] = useState<FichaPersonaje | null>(null);
  const [campos, setCampos] = useState<CampoPlantilla[]>([]);
  const [valores, setValores] = useState<ValoresMap>({});
  const [items, setItems] = useState<ItemsMap>({});
  const [nivelActual, setNivelActual] = useState(1);
  const [pending, setPending] = useState<PendingMap>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---- carga inicial ----
  useEffect(() => {
    if (!personajeId) return;
    const pid = Number(personajeId);

    async function load() {
      try {
        // 1. Personaje
        const p = await personajeService.getById(pid);
        setPersonaje(p);

        // 2. Sistema de rol
        const sis = await sistemaRolService.getById(p.id_sistema_rol);
        setSistema(sis);
        setNivelActual(1);

        // 3. Ficha (auto-crear si no existe)
        let f: FichaPersonaje;
        const fichas = await fichaService.getAll(pid);
        if (fichas.length > 0) {
          f = fichas[0];
        } else {
          f = await fichaService.create(pid, { nombre: `Ficha de ${p.nombre}`, id_sistema_rol: p.id_sistema_rol });
        }
        setFicha(f);

        // 4. Plantilla (primera del sistema)
        const plantillas = await plantillaService.getBySistema(p.id_sistema_rol);
        if (plantillas.length > 0) {
          const camposArr = plantillas[0].campos;
          setCampos(camposArr);

          // 5. Items necesarios (un fetch por cada filtro_item distinto)
          const filtros = [...new Set(
            camposArr
              .filter(c => c.tipo_campo === 'item' && c.filtro_item)
              .map(c => c.filtro_item!)
          )];
          const itemsMap: ItemsMap = {};
          await Promise.all(filtros.map(async filtro => {
            const lista = await itemService.getFiltered({ id_sistema_rol: p.id_sistema_rol, tipo_item: filtro });
            itemsMap[filtro] = lista;
          }));
          setItems(itemsMap);
        }

        // 6. Valores guardados
        const vals = await campoValorService.getAll(pid, f.id_ficha);
        const map: ValoresMap = {};
        for (const v of vals) map[v.id_campo_plantilla] = v;
        setValores(map);

      } catch {
        setError('Error al cargar los datos del personaje.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [personajeId]);

  // ---- obtener valor actual de un campo ----
  function getDisplayValue(campo: CampoPlantilla): string | number {
    if (campo.id_campo_plantilla in pending) {
      return pending[campo.id_campo_plantilla] ?? '';
    }
    const v = valores[campo.id_campo_plantilla];
    if (!v) return '';
    if (campo.tipo_campo === 'item') return v.id_item_valor ?? '';
    if (campo.tipo_campo === 'numero') return v.valor_numero ?? '';
    return v.valor_texto ?? '';
  }

  // ---- guardar un campo ----
  const saveValor = useCallback(async (campo: CampoPlantilla, value: string | number | null) => {
    if (!ficha || !personaje) return;
    const pid = personaje.id_personaje;
    const fid = ficha.id_ficha;
    const cid = campo.id_campo_plantilla;

    setSaving(prev => ({ ...prev, [cid]: true }));
    try {
      const data = {
        id_campo_plantilla: cid,
        id_item_valor: campo.tipo_campo === 'item' ? (value !== '' && value !== null ? Number(value) : null) : null,
        valor_texto: campo.tipo_campo === 'texto' ? (value as string) || null : null,
        valor_numero: campo.tipo_campo === 'numero' ? (value !== '' && value !== null ? Number(value) : null) : null,
      };

      const existing = valores[cid];
      if (existing) {
        await campoValorService.update(pid, fid, existing.id_campo_valor, data);
        setValores(prev => ({ ...prev, [cid]: { ...existing, ...data } }));
      } else {
        const nuevo = await campoValorService.create(pid, fid, data);
        setValores(prev => ({ ...prev, [cid]: nuevo }));
      }
      // Limpia el pending una vez guardado
      setPending(prev => { const n = { ...prev }; delete n[cid]; return n; });
    } catch {
      setError('Error al guardar el valor.');
    } finally {
      setSaving(prev => ({ ...prev, [cid]: false }));
    }
  }, [ficha, personaje, valores]);

  // ---- renderizar input según tipo_campo ----
  function renderInput(campo: CampoPlantilla) {
    const val = getDisplayValue(campo);
    const isSaving = saving[campo.id_campo_plantilla];
    const isSaved = campo.id_campo_plantilla in valores && !(campo.id_campo_plantilla in pending);

    const onChange = (v: string | number) =>
      setPending(prev => ({ ...prev, [campo.id_campo_plantilla]: v }));

    const onBlur = () => {
      const current = pending[campo.id_campo_plantilla];
      if (campo.id_campo_plantilla in pending) {
        saveValor(campo, current ?? null);
      }
    };

    return (
      <div style={s.campoWrap}>
        <div style={s.campoLabel}>
          <span>{campo.nombre_campo}</span>
          {isSaving && <span style={{ fontSize: '0.7rem', color: '#888' }}>Guardando…</span>}
          {!isSaving && isSaved && <span style={s.savedTag}>✓</span>}
        </div>

        {campo.tipo_campo === 'texto' && (
          <textarea
            style={s.textarea}
            value={val}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={isSaving}
          />
        )}

        {campo.tipo_campo === 'numero' && (
          <input
            style={s.input}
            type="number"
            value={val}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={isSaving}
          />
        )}

        {campo.tipo_campo === 'item' && (
          <select
            style={s.select}
            value={val}
            onChange={e => {
              const v = e.target.value;
              setPending(prev => ({ ...prev, [campo.id_campo_plantilla]: v }));
              saveValor(campo, v || null);
            }}
            disabled={isSaving}
          >
            <option value="">— Seleccionar —</option>
            {(campo.filtro_item ? items[campo.filtro_item] ?? [] : []).map(item => (
              <option key={item.id_item} value={item.id_item}>
                {item.nombre}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  // ---- label de valor para el panel derecho ----
  function getValorLabel(campo: CampoPlantilla): string | null {
    const v = valores[campo.id_campo_plantilla];
    if (!v) return null;
    if (campo.tipo_campo === 'item') {
      if (!v.id_item_valor) return null;
      const lista = campo.filtro_item ? items[campo.filtro_item] ?? [] : [];
      return lista.find(i => i.id_item === v.id_item_valor)?.nombre ?? String(v.id_item_valor);
    }
    if (campo.tipo_campo === 'numero') return v.valor_numero !== null && v.valor_numero !== undefined ? String(v.valor_numero) : null;
    return v.valor_texto || null;
  }

  // ---- campos visibles en el panel derecho (hasta nivelActual) ----
  const camposConValor = campos
    .filter(c => c.nivel_disponible <= nivelActual)
    .map(c => ({ campo: c, label: getValorLabel(c) }))
    .filter(({ label }) => label !== null);

  // ---- agrupar campos por nivel (panel izquierdo) ----
  const niveles = sistema ? Array.from({ length: sistema.nivel_maximo }, (_, i) => i + 1) : [];
  const camposPorNivel: Record<number, CampoPlantilla[]> = {};
  for (const c of campos) {
    if (!camposPorNivel[c.nivel_disponible]) camposPorNivel[c.nivel_disponible] = [];
    camposPorNivel[c.nivel_disponible].push(c);
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando personaje…</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <button style={s.back} onClick={() => navigate('/personajes')}>← Mis personajes</button>
          <h1 style={s.titulo}>{personaje?.nombre}</h1>
          <p style={s.subtitulo}>{sistema?.nombre} · Ficha: {ficha?.nombre}</p>
        </div>
      </div>

      {error && <div style={s.err}>{error}</div>}

      {/* Selector de nivel activo */}
      <div style={s.nivelBar}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: 4 }}>Nivel:</span>
        {niveles.map(n => (
          <button key={n} style={s.nivelBtn(n === nivelActual)} onClick={() => setNivelActual(n)}>
            {n}
          </button>
        ))}
      </div>

      <div style={s.panels}>
        {/* Panel izquierdo — elecciones por nivel */}
        <div style={s.panel}>
          <p style={s.panelTitle}>Elecciones por nivel</p>
          {campos.length === 0 && (
            <p style={{ color: '#888', fontSize: '0.875rem' }}>
              Este sistema no tiene plantilla configurada aún. Un administrador debe crear los campos.
            </p>
          )}
          {niveles.filter(n => n <= nivelActual).map(n => {
            const camposNivel = camposPorNivel[n] ?? [];
            if (camposNivel.length === 0) return null;
            return (
              <div key={n} style={s.nivelSection}>
                <div style={s.nivelLabel}>Nivel {n}</div>
                {camposNivel.map(campo => renderInput(campo))}
              </div>
            );
          })}
        </div>

        {/* Panel derecho — ficha acumulada */}
        <div style={s.panel}>
          <p style={s.panelTitle}>Ficha del personaje (hasta nivel {nivelActual})</p>
          {camposConValor.length === 0 ? (
            <p style={s.fichaEmpty}>Aún no hay valores guardados.</p>
          ) : (
            camposConValor.map(({ campo, label }) => (
              <div key={campo.id_campo_plantilla} style={s.fichaRow}>
                <span style={s.fichaKey}>{campo.nombre_campo}</span>
                <span style={s.fichaVal}>{label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
