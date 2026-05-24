export type CategoriaArma = 'simple_melee' | 'simple_rango' | 'marcial_melee' | 'marcial_rango'

export interface ArmaBase {
  id: string
  nombre: string
  categoria: CategoriaArma
  dano: string
  tipo_dano: string
  propiedades: string[]
  maestria: string
}

export const ARMAS: ArmaBase[] = [
  // ── Simples cuerpo a cuerpo ────────────────────────────────────────────────
  { id: 'baston',          nombre: 'Bastón',          categoria: 'simple_melee', dano: '1d6',  tipo_dano: 'contundente', propiedades: ['Versátil (1d8)'],                          maestria: 'Derribar'  },
  { id: 'daga',            nombre: 'Daga',            categoria: 'simple_melee', dano: '1d4',  tipo_dano: 'perforante',  propiedades: ['Finura', 'Ligera', 'Arrojadiza (20/60)'],  maestria: 'Mordisqueo' },
  { id: 'garrote',         nombre: 'Garrote',         categoria: 'simple_melee', dano: '1d8',  tipo_dano: 'contundente', propiedades: ['Dos manos'],                               maestria: 'Empujar'   },
  { id: 'hacha-de-mano',   nombre: 'Hacha de mano',   categoria: 'simple_melee', dano: '1d6',  tipo_dano: 'cortante',    propiedades: ['Ligera', 'Arrojadiza (20/60)'],            maestria: 'Hostigar'  },
  { id: 'hoz',             nombre: 'Hoz',             categoria: 'simple_melee', dano: '1d4',  tipo_dano: 'cortante',    propiedades: ['Ligera'],                                  maestria: 'Mordisqueo' },
  { id: 'jabalina',        nombre: 'Jabalina',        categoria: 'simple_melee', dano: '1d6',  tipo_dano: 'perforante',  propiedades: ['Arrojadiza (30/120)'],                     maestria: 'Ralentizar' },
  { id: 'lanza',           nombre: 'Lanza',           categoria: 'simple_melee', dano: '1d6',  tipo_dano: 'perforante',  propiedades: ['Arrojadiza (20/60)', 'Versátil (1d8)'],    maestria: 'Aturdir'   },
  { id: 'martillo-ligero', nombre: 'Martillo ligero', categoria: 'simple_melee', dano: '1d4',  tipo_dano: 'contundente', propiedades: ['Ligera', 'Arrojadiza (20/60)'],            maestria: 'Mordisqueo' },
  { id: 'maza',            nombre: 'Maza',            categoria: 'simple_melee', dano: '1d6',  tipo_dano: 'contundente', propiedades: [],                                          maestria: 'Aturdir'   },
  { id: 'porra',           nombre: 'Porra',           categoria: 'simple_melee', dano: '1d4',  tipo_dano: 'contundente', propiedades: ['Ligera'],                                  maestria: 'Ralentizar' },

  // ── Simples a distancia ────────────────────────────────────────────────────
  { id: 'arco-corto',        nombre: 'Arco corto',        categoria: 'simple_rango', dano: '1d6', tipo_dano: 'perforante', propiedades: ['Munición (80/320)', 'Dos manos'],         maestria: 'Hostigar'   },
  { id: 'ballesta-ligera',   nombre: 'Ballesta ligera',   categoria: 'simple_rango', dano: '1d8', tipo_dano: 'perforante', propiedades: ['Munición (80/320)', 'Carga', 'Dos manos'], maestria: 'Ralentizar' },
  { id: 'dardo',             nombre: 'Dardo',             categoria: 'simple_rango', dano: '1d4', tipo_dano: 'perforante', propiedades: ['Finura', 'Arrojadiza (20/60)'],            maestria: 'Hostigar'   },
  { id: 'honda',             nombre: 'Honda',             categoria: 'simple_rango', dano: '1d4', tipo_dano: 'contundente', propiedades: ['Munición (30/120)'],                     maestria: 'Ralentizar' },

  // ── Marciales cuerpo a cuerpo ──────────────────────────────────────────────
  { id: 'alabarda',              nombre: 'Alabarda',              categoria: 'marcial_melee', dano: '1d10', tipo_dano: 'cortante',    propiedades: ['Pesada', 'Alcance', 'Dos manos'],            maestria: 'Segar'     },
  { id: 'cimitarra',             nombre: 'Cimitarra',             categoria: 'marcial_melee', dano: '1d6',  tipo_dano: 'cortante',    propiedades: ['Finura', 'Ligera'],                           maestria: 'Mordisqueo' },
  { id: 'espada-corta',          nombre: 'Espada corta',          categoria: 'marcial_melee', dano: '1d6',  tipo_dano: 'perforante',  propiedades: ['Finura', 'Ligera'],                           maestria: 'Hostigar'  },
  { id: 'espada-larga',          nombre: 'Espada larga',          categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'cortante',    propiedades: ['Versátil (1d10)'],                            maestria: 'Aturdir'   },
  { id: 'estoque',               nombre: 'Estoque',               categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'perforante',  propiedades: ['Finura'],                                     maestria: 'Hostigar'  },
  { id: 'estrella-de-la-manana', nombre: 'Estrella de la mañana', categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'perforante',  propiedades: [],                                             maestria: 'Aturdir'   },
  { id: 'glaive',                nombre: 'Glaive',                categoria: 'marcial_melee', dano: '1d10', tipo_dano: 'cortante',    propiedades: ['Pesada', 'Alcance', 'Dos manos'],             maestria: 'Rozar'     },
  { id: 'gran-hacha',            nombre: 'Gran hacha',            categoria: 'marcial_melee', dano: '1d12', tipo_dano: 'cortante',    propiedades: ['Pesada', 'Dos manos'],                        maestria: 'Segar'     },
  { id: 'hacha-de-batalla',      nombre: 'Hacha de batalla',      categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'cortante',    propiedades: ['Versátil (1d10)'],                            maestria: 'Derribar'  },
  { id: 'lanza-de-caballeria',   nombre: 'Lanza de caballería',   categoria: 'marcial_melee', dano: '1d10', tipo_dano: 'perforante',  propiedades: ['Pesada', 'Alcance', 'Dos manos'],             maestria: 'Derribar'  },
  { id: 'latigo',                nombre: 'Látigo',                categoria: 'marcial_melee', dano: '1d4',  tipo_dano: 'cortante',    propiedades: ['Finura', 'Alcance'],                          maestria: 'Ralentizar' },
  { id: 'mandoble',              nombre: 'Mandoble',              categoria: 'marcial_melee', dano: '2d6',  tipo_dano: 'cortante',    propiedades: ['Pesada', 'Dos manos'],                        maestria: 'Rozar'     },
  { id: 'martillo-de-guerra',    nombre: 'Martillo de guerra',    categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'contundente', propiedades: ['Versátil (1d10)'],                            maestria: 'Empujar'   },
  { id: 'mayal',                 nombre: 'Mayal',                 categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'contundente', propiedades: [],                                             maestria: 'Aturdir'   },
  { id: 'mazo',                  nombre: 'Mazo',                  categoria: 'marcial_melee', dano: '2d6',  tipo_dano: 'contundente', propiedades: ['Pesada', 'Dos manos'],                        maestria: 'Derribar'  },
  { id: 'pica',                  nombre: 'Pica',                  categoria: 'marcial_melee', dano: '1d10', tipo_dano: 'perforante',  propiedades: ['Pesada', 'Alcance', 'Dos manos'],             maestria: 'Empujar'   },
  { id: 'pico-de-guerra',        nombre: 'Pico de guerra',        categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'perforante',  propiedades: [],                                             maestria: 'Aturdir'   },
  { id: 'tridente',              nombre: 'Tridente',              categoria: 'marcial_melee', dano: '1d8',  tipo_dano: 'perforante',  propiedades: ['Arrojadiza (20/60)', 'Versátil (1d10)'],      maestria: 'Derribar'  },

  // ── Marciales a distancia ──────────────────────────────────────────────────
  { id: 'arco-largo',         nombre: 'Arco largo',         categoria: 'marcial_rango', dano: '1d8',  tipo_dano: 'perforante', propiedades: ['Munición (150/600)', 'Pesada', 'Dos manos'],          maestria: 'Ralentizar' },
  { id: 'ballesta-de-mano',   nombre: 'Ballesta de mano',   categoria: 'marcial_rango', dano: '1d6',  tipo_dano: 'perforante', propiedades: ['Munición (30/120)', 'Ligera', 'Carga'],               maestria: 'Hostigar'   },
  { id: 'ballesta-pesada',    nombre: 'Ballesta pesada',    categoria: 'marcial_rango', dano: '1d10', tipo_dano: 'perforante', propiedades: ['Munición (100/400)', 'Pesada', 'Carga', 'Dos manos'],  maestria: 'Empujar'    },
  { id: 'cerbatana',          nombre: 'Cerbatana',          categoria: 'marcial_rango', dano: '1',    tipo_dano: 'perforante', propiedades: ['Munición (25/100)', 'Carga'],                          maestria: 'Hostigar'   },
  { id: 'red',                nombre: 'Red',                categoria: 'marcial_rango', dano: '—',    tipo_dano: '—',          propiedades: ['Arrojadiza (5/15)'],                                  maestria: 'Atrapar'    },
]

const PROF_SIMPLE  = /sencill|simple/i
const PROF_MARCIAL = /marcial/i

export function tieneCompetencia(categoria: CategoriaArma, claseProficiencias: string[]): boolean {
  const esSimple  = categoria.startsWith('simple')
  const esMarcial = categoria.startsWith('marcial')
  return (esSimple  && claseProficiencias.some(p => PROF_SIMPLE.test(p)))
      || (esMarcial && claseProficiencias.some(p => PROF_MARCIAL.test(p)))
}

export function labelCategoria(cat: CategoriaArma): string {
  switch (cat) {
    case 'simple_melee':  return 'Simple CaC'
    case 'simple_rango':  return 'Simple Dist.'
    case 'marcial_melee': return 'Marcial CaC'
    case 'marcial_rango': return 'Marcial Dist.'
  }
}
