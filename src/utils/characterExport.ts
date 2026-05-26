import { PDFDocument } from 'pdf-lib'
import type { CharacterDraft } from '@/types/character'
import { getMod, getProfBonus, getSkillMod, formatMod, getSpellSlots, getLanzamientoInfo, getSpellDC, getSpellAttackBonus } from '@/utils/dnd'
import type { Item, ItemDetalle } from '@/services/itemService'

export interface ExportContext {
  draft: CharacterDraft
  razas: Item[]
  clases: Item[]
  trasfondos: Item[]
  claseDetalle: ItemDetalle | null
  subclaseDetalle: ItemDetalle | null
}

function findName(items: Item[], id: number | null): string {
  if (!id) return ''
  return items.find(i => i.id_item === id)?.nombre ?? ''
}

// Skill field names in the PDF (order = alphabetical on the WotC sheet)
const SKILL_PDF_FIELDS: Record<string, { textField: string; checkBox: string }> = {
  acrobacias:         { textField: 'Acrobatics',    checkBox: 'Check Box 23' },
  trato_con_animales: { textField: 'Animal',         checkBox: 'Check Box 24' },
  arcanos:            { textField: 'Arcana',         checkBox: 'Check Box 25' },
  atletismo:          { textField: 'Athletics',      checkBox: 'Check Box 26' },
  engano:             { textField: 'Deception ',     checkBox: 'Check Box 27' },
  historia:           { textField: 'History ',       checkBox: 'Check Box 28' },
  perspicacia:        { textField: 'Insight',        checkBox: 'Check Box 29' },
  intimidacion:       { textField: 'Intimidation',   checkBox: 'Check Box 30' },
  investigacion:      { textField: 'Investigation ', checkBox: 'Check Box 31' },
  medicina:           { textField: 'Medicine',       checkBox: 'Check Box 32' },
  naturaleza:         { textField: 'Nature',         checkBox: 'Check Box 33' },
  percepcion:         { textField: 'Perception ',    checkBox: 'Check Box 34' },
  interpretacion:     { textField: 'Performance',    checkBox: 'Check Box 35' },
  persuasion:         { textField: 'Persuasion',     checkBox: 'Check Box 36' },
  religion:           { textField: 'Religion',       checkBox: 'Check Box 37' },
  juegoDeManos:       { textField: 'SleightofHand',  checkBox: 'Check Box 38' },
  sigilo:             { textField: 'Stealth ',       checkBox: 'Check Box 39' },
  supervivencia:      { textField: 'Survival',       checkBox: 'Check Box 40' },
}

// Spell fields per level: [fieldNames] indexed by spell level (0=cantrips)
const SPELL_FIELDS: Record<number, string[]> = {
  0: Array.from({ length: 10 }, (_, i) => `Spells ${1014 + i}`),
  1: Array.from({ length: 10 }, (_, i) => `Spells ${1024 + i}`),
  2: Array.from({ length: 13 }, (_, i) => `Spells ${1034 + i}`),
  3: Array.from({ length: 13 }, (_, i) => `Spells ${1047 + i}`),
  4: Array.from({ length: 13 }, (_, i) => `Spells ${1060 + i}`),
  5: Array.from({ length: 9 },  (_, i) => `Spells ${1073 + i}`),
  6: Array.from({ length: 9 },  (_, i) => `Spells ${1082 + i}`),
  7: Array.from({ length: 9 },  (_, i) => `Spells ${1091 + i}`),
  8: Array.from({ length: 7 },  (_, i) => `Spells 10${100 + i}`),
  9: Array.from({ length: 7 },  (_, i) => `Spells 1010${i + 7}`),
}

// Slot fields per spell level (1-9 → suffix 19-27)
const SLOT_SUFFIX: Record<number, string> = { 1:'19', 2:'20', 3:'21', 4:'22', 5:'23', 6:'24', 7:'25', 8:'26', 9:'27' }

export async function exportCharacterToPDF(ctx: ExportContext): Promise<void> {
  const { draft: d, razas, clases, trasfondos, claseDetalle, subclaseDetalle } = ctx
  const nivel = d.nivel
  const prof = getProfBonus(nivel)

  const pdfBytes = await fetch('/dnd5e_fillable.pdf').then(r => r.arrayBuffer())
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const form = pdfDoc.getForm()

  function setText(name: string, value: string) {
    try { form.getTextField(name).setText(value) } catch { /* field may not exist */ }
  }
  function setCheck(name: string, checked: boolean) {
    try {
      const cb = form.getCheckBox(name)
      if (checked) cb.check(); else cb.uncheck()
    } catch { /* field may not exist */ }
  }

  // ── Página 1: info básica ─────────────────────────────────────────────────
  setText('CharacterName', d.nombre)
  setText('ClassLevel', `${findName(clases, d.id_clase)} ${nivel}`)
  setText('Background', findName(trasfondos, d.id_trasfondo))
  setText('Race ', findName(razas, d.id_raza))
  setText('Inspiration', d.inspiracion > 0 ? String(d.inspiracion) : '')
  setText('ProfBonus', `+${prof}`)

  // ── Características ───────────────────────────────────────────────────────
  setText('STR',    String(d.stats.fue));  setText('STRmod',   formatMod(getMod(d.stats.fue)))
  setText('DEX',    String(d.stats.des));  setText('DEXmod ',  formatMod(getMod(d.stats.des)))
  setText('CON',    String(d.stats.con));  setText('CONmod',   formatMod(getMod(d.stats.con)))
  setText('INT',    String(d.stats.int));  setText('INTmod',   formatMod(getMod(d.stats.int)))
  setText('WIS',    String(d.stats.sab));  setText('WISmod',   formatMod(getMod(d.stats.sab)))
  setText('CHA',    String(d.stats.car));  setText('CHamod',   formatMod(getMod(d.stats.car)))

  // ── Combate ───────────────────────────────────────────────────────────────
  setText('AC',         String(d.combate.ca))
  setText('Initiative', formatMod(getMod(d.stats.des)))
  setText('Speed',      String(d.combate.velocidad))
  setText('HPMax',      String(d.combate.pv_max))
  setText('HPCurrent',  String(d.combate.pv_actual))
  setText('HDTotal',    String(nivel))

  // ── Salvaciones ───────────────────────────────────────────────────────────
  const saveEntries: Array<{ key: keyof typeof d.salvaciones; textField: string; checkBox: string }> = [
    { key: 'fue', textField: 'ST Strength',     checkBox: 'Check Box 11' },
    { key: 'des', textField: 'ST Dexterity',    checkBox: 'Check Box 18' },
    { key: 'con', textField: 'ST Constitution', checkBox: 'Check Box 19' },
    { key: 'int', textField: 'ST Intelligence', checkBox: 'Check Box 20' },
    { key: 'sab', textField: 'ST Wisdom',       checkBox: 'Check Box 21' },
    { key: 'car', textField: 'ST Charisma',     checkBox: 'Check Box 22' },
  ]
  const statForSave: Record<keyof typeof d.salvaciones, keyof typeof d.stats> = {
    fue: 'fue', des: 'des', con: 'con', int: 'int', sab: 'sab', car: 'car',
  }
  saveEntries.forEach(({ key, textField, checkBox }) => {
    const proficient = d.salvaciones[key]
    const mod = getMod(d.stats[statForSave[key]]) + (proficient ? prof : 0)
    setText(textField, formatMod(mod))
    setCheck(checkBox, proficient)
  })

  // ── Habilidades ───────────────────────────────────────────────────────────
  const skillStatMap: Record<string, keyof typeof d.stats> = {
    acrobacias: 'des', trato_con_animales: 'sab', arcanos: 'int', atletismo: 'fue',
    engano: 'car', historia: 'int', perspicacia: 'sab', intimidacion: 'car',
    investigacion: 'int', medicina: 'sab', naturaleza: 'int', percepcion: 'sab',
    interpretacion: 'car', persuasion: 'car', religion: 'int', juegoDeManos: 'des',
    sigilo: 'des', supervivencia: 'sab',
  }
  Object.entries(SKILL_PDF_FIELDS).forEach(([key, { textField, checkBox }]) => {
    const k = key as keyof typeof d.habilidades
    const proficient = d.habilidades[k]
    const stat = skillStatMap[key] as keyof typeof d.stats
    setText(textField, formatMod(getSkillMod(d.stats[stat], proficient, nivel)))
    setCheck(checkBox, proficient)
  })
  setText('Passive', String(10 + getSkillMod(d.stats.sab, d.habilidades.percepcion, nivel)))

  // ── Armas (hasta 3) ───────────────────────────────────────────────────────
  const wpnFields = [
    { name: 'Wpn Name',   atk: 'Wpn1 AtkBonus',   dmg: 'Wpn1 Damage' },
    { name: 'Wpn Name 2', atk: 'Wpn2 AtkBonus ',  dmg: 'Wpn2 Damage ' },
    { name: 'Wpn Name 3', atk: 'Wpn3 AtkBonus  ', dmg: 'Wpn3 Damage ' },
  ]
  d.armas.slice(0, 3).forEach((arma, i) => {
    setText(wpnFields[i].name, arma.nombre)
    const isRanged  = arma.categoria?.includes('rango') ?? false
    const isFinesse = arma.propiedades?.some(p => p.toLowerCase().includes('finura')) ?? false
    const usesDex   = isRanged || isFinesse
    const strMod    = getMod(d.stats.fue)
    const dexMod    = getMod(d.stats.des)
    const statMod   = usesDex ? (isFinesse ? Math.max(strMod, dexMod) : dexMod) : strMod
    setText(wpnFields[i].atk,  formatMod(prof + statMod + arma.bonus_ataque))
    setText(wpnFields[i].dmg,  `${arma.dano} ${arma.tipo_dano}`)
  })

  // ── Equipo y monedas ──────────────────────────────────────────────────────
  setText('Equipment', d.equipo.map(e => `${e.cantidad > 1 ? e.cantidad + 'x ' : ''}${e.nombre}`).join('\n'))
  setText('CP', d.monedas.cobre   > 0 ? String(d.monedas.cobre)   : '')
  setText('SP', d.monedas.plata   > 0 ? String(d.monedas.plata)   : '')
  setText('GP', d.monedas.oro     > 0 ? String(d.monedas.oro)     : '')
  setText('PP', d.monedas.platino > 0 ? String(d.monedas.platino) : '')

  // ── Personalidad ──────────────────────────────────────────────────────────
  setText('PersonalityTraits ', d.detalles.rasgos_de_personalidad)
  setText('Ideals',             d.detalles.ideales)
  setText('Bonds',              d.detalles.vinculos)
  setText('Flaws',              d.detalles.defectos)

  // ── Rasgos y competencias ─────────────────────────────────────────────────
  if (d.rasgos.length > 0) {
    setText('Features and Traits', d.rasgos.map(r => `${r.nombre}:\n${r.descripcion}`).join('\n\n'))
  }

  // ── Página 2: apariencia e historia ──────────────────────────────────────
  setText('CharacterName 2', d.nombre)
  setText('Age',    d.detalles.edad)
  setText('Height', d.detalles.altura)
  setText('Weight', d.detalles.peso)
  setText('Eyes',   d.detalles.ojos)
  setText('Skin',   d.detalles.piel)
  setText('Hair',   d.detalles.pelo)
  setText('Backstory', d.detalles.historia)
  if (d.rasgos.length > 0) {
    setText('Feat+Traits', d.rasgos.map(r => `${r.nombre}:\n${r.descripcion}`).join('\n\n'))
  }

  // ── Página 3: conjuros ────────────────────────────────────────────────────
  if (d.conjuros.length > 0) {
    const claseNombre = findName(clases, d.id_clase)
    setText('Spellcasting Class 2', claseNombre)

    const lanzInfo = getLanzamientoInfo(claseDetalle, subclaseDetalle)
    if (lanzInfo) {
      const spellStat = d.stats[lanzInfo.stat]
      setText('SpellcastingAbility 2', lanzInfo.stat.toUpperCase())
      setText('SpellSaveDC  2',   String(getSpellDC(spellStat, nivel)))
      setText('SpellAtkBonus 2',  formatMod(getSpellAttackBonus(spellStat, nivel)))

      const slots = getSpellSlots(nivel, lanzInfo.tipo)
      slots.forEach((total, i) => {
        if (total === 0) return
        const spellLevel = i + 1
        const suffix = SLOT_SUFFIX[spellLevel]
        if (!suffix) return
        const used = d.casillas_usadas[spellLevel] ?? 0
        setText(`SlotsTotal ${suffix}`,     String(total))
        setText(`SlotsRemaining ${suffix}`, String(Math.max(0, total - used)))
      })
    }

    const byLevel: Record<number, typeof d.conjuros> = {}
    d.conjuros.forEach(s => {
      if (!byLevel[s.nivel]) byLevel[s.nivel] = []
      byLevel[s.nivel].push(s)
    })
    Object.entries(byLevel).forEach(([lvl, spells]) => {
      const fields = SPELL_FIELDS[Number(lvl)] ?? []
      spells.forEach((spell, i) => {
        if (i < fields.length) setText(fields[i], spell.nombre)
      })
    })
  }

  // ── Descargar ─────────────────────────────────────────────────────────────
  const filledBytes = await pdfDoc.save()
  const blob = new Blob([filledBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${d.nombre || 'personaje'}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
