export interface HechizoDato {
  nombre: string
  nivel: number
  escuela: string
  tiempo_lanzamiento: string
  alcance: string
  duracion: string
  concentracion: boolean
  ritual: boolean
  descripcion: string
  clases: string[]
  escalado: string | null
}

export const HECHIZOS: HechizoDato[] = [
  // ── Abjuración ─────────────────────────────────────────────────────────────
  {
    nombre: 'Escudo de la Hoja', nivel: 0, escuela: 'Abjuración',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Invocas una protección mágica que envuelve tu cuerpo. Mientras el conjuro está activo, tienes Resistencia al daño de Perforación, Contundente y Cortante causado por ataques de arma.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Resistencia', nivel: 0, escuela: 'Abjuración',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Tocas a una criatura dispuesta y le otorgas una pequeña reserva de poder defensivo. Una vez antes de que el conjuro termine, la criatura puede tirar un d4 y añadir el resultado a una tirada de salvación.',
    clases: ['Clérigo', 'Druida', 'Paladín'], escalado: null,
  },
  {
    nombre: 'Escudo', nivel: 1, escuela: 'Abjuración',
    tiempo_lanzamiento: '1 reacción', alcance: 'Personal',
    duracion: '1 asalto', concentracion: false, ritual: false,
    descripcion: 'Una barrera invisible de fuerza mágica aparece y te protege. Hasta el inicio de tu siguiente turno, tienes +5 a la CA y eres inmune a Proyectil Mágico.',
    clases: ['Mago', 'Hechicero'], escalado: null,
  },
  {
    nombre: 'Armadura de Mago', nivel: 1, escuela: 'Abjuración',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: '8 horas', concentracion: false, ritual: false,
    descripcion: 'Tocas a una criatura dispuesta que no lleva armadura. La CA base de la criatura objetivo se convierte en 13 + su modificador de Destreza. El conjuro termina si la criatura se pone armadura.',
    clases: ['Mago', 'Hechicero'], escalado: null,
  },
  {
    nombre: 'Restauración Menor', nivel: 2, escuela: 'Abjuración',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Tocas a una criatura y pones fin a una enfermedad o condición que le afecte. La condición puede ser Cegado, Ensordecido, Envenenado o Paralizado.',
    clases: ['Bardo', 'Clérigo', 'Druida', 'Paladín', 'Explorador'], escalado: null,
  },
  {
    nombre: 'Protección contra el Veneno', nivel: 2, escuela: 'Abjuración',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: '1 hora', concentracion: false, ritual: false,
    descripcion: 'Tocas a una criatura. Si está Envenenada, neutralizas el veneno. Por la duración, tiene Ventaja en las tiradas de salvación contra el Envenenamiento y Resistencia al daño por veneno.',
    clases: ['Clérigo', 'Druida', 'Paladín', 'Explorador'], escalado: null,
  },

  // ── Conjuración ────────────────────────────────────────────────────────────
  {
    nombre: 'Salpicadura Ácida', nivel: 0, escuela: 'Conjuración',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Lanzas una burbuja de ácido contra una o dos criaturas a 1,5 metros entre sí. Cada objetivo debe superar una tirada de salvación de Destreza o sufrirá 1d6 de daño por ácido.',
    clases: ['Hechicero', 'Mago'], escalado: 'El daño aumenta en 1d6 al alcanzar los niveles 5, 11 y 17.',
  },
  {
    nombre: 'Mano Mágica', nivel: 0, escuela: 'Conjuración',
    tiempo_lanzamiento: '1 acción', alcance: '9 metros',
    duracion: '1 minuto', concentracion: false, ritual: false,
    descripcion: 'Una mano espectral flotante aparece dentro del alcance. Puedes usarla para manipular objetos, abrir puertas sin cerradura o verter el contenido de un vial. No puede atacar ni activar objetos mágicos.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Niebla', nivel: 1, escuela: 'Conjuración',
    tiempo_lanzamiento: '1 acción', alcance: '36 metros',
    duracion: 'Conc., 1 hora', concentracion: true, ritual: false,
    descripcion: 'Creas una esfera de niebla densa de 6 metros de radio que oscurece el área. Un viento de velocidad moderada la dispersa.',
    clases: ['Druida', 'Explorador', 'Hechicero', 'Mago'], escalado: 'El radio aumenta 6 metros por nivel por encima del 1.',
  },
  {
    nombre: 'Encontrar Familiar', nivel: 1, escuela: 'Conjuración',
    tiempo_lanzamiento: '1 hora', alcance: '3 metros',
    duracion: 'Instantánea', concentracion: false, ritual: true,
    descripcion: 'Obtienes los servicios de un familiar que adopta la forma animal de tu elección. Puedes comunicarte telepáticamente con él y percibir a través de sus sentidos.',
    clases: ['Mago'], escalado: null,
  },
  {
    nombre: 'Paso Neblinoso', nivel: 2, escuela: 'Conjuración',
    tiempo_lanzamiento: '1 acción adicional', alcance: 'Personal',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Envuelto brevemente en una neblina plateada, te teletransportas hasta 18 metros a un espacio desocupado que puedas ver.',
    clases: ['Hechicero', 'Brujo', 'Mago', 'Paladín'], escalado: null,
  },
  {
    nombre: 'Red', nivel: 2, escuela: 'Conjuración',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Conc., 1 hora', concentracion: true, ritual: false,
    descripcion: 'Conjuras seda pegajosa en un cubo de 6 metros anclado entre superficies. Las criaturas en el área quedan Restringidas. Pueden liberarse con una prueba de Fuerza (CD 15).',
    clases: ['Hechicero', 'Mago'], escalado: null,
  },

  // ── Adivinación ───────────────────────────────────────────────────────────
  {
    nombre: 'Orientación', nivel: 0, escuela: 'Adivinación',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Tocas a una criatura dispuesta. Una vez antes de que el conjuro termine, la criatura puede tirar un d4 y añadir el resultado a una prueba de característica de su elección.',
    clases: ['Clérigo', 'Druida'], escalado: null,
  },
  {
    nombre: 'Golpe Verdadero', nivel: 0, escuela: 'Adivinación',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Usando un arma como foco, realizas un ataque mágico. Si impacta, el objetivo sufre 1d6 de daño radiante más 1d6 del tipo del arma.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: 'El daño aumenta en 1d6 al alcanzar los niveles 5, 11 y 17.',
  },
  {
    nombre: 'Detectar Magia', nivel: 1, escuela: 'Adivinación',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: 'Conc., 10 minutos', concentracion: true, ritual: true,
    descripcion: 'Percibes la presencia de magia a 18 metros de ti. Puedes usar tu acción para ver un débil resplandor alrededor de criaturas u objetos mágicos y percibir la escuela de magia correspondiente.',
    clases: ['Bardo', 'Clérigo', 'Druida', 'Paladín', 'Explorador', 'Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Identificar', nivel: 1, escuela: 'Adivinación',
    tiempo_lanzamiento: '1 minuto', alcance: 'Toque',
    duracion: 'Instantánea', concentracion: false, ritual: true,
    descripcion: 'Tocas un objeto durante el lanzamiento. Si es mágico, aprendes sus propiedades, si requiere sintonización, cuántas cargas tiene y si algún conjuro lo está afectando.',
    clases: ['Bardo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Ver Invisibilidad', nivel: 2, escuela: 'Adivinación',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: '1 hora', concentracion: false, ritual: false,
    descripcion: 'Por la duración, ves criaturas y objetos invisibles como si fueran visibles. También puedes percibir el Plano Etéreo; los objetos etéreos aparecen fantasmales y translúcidos.',
    clases: ['Bardo', 'Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Detectar Pensamientos', nivel: 2, escuela: 'Adivinación',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Puedes leer los pensamientos superficiales de una criatura visible a 9 metros de ti. Puedes intentar escudriñar más profundamente; la criatura puede resistir con una tirada de Sabiduría.',
    clases: ['Bardo', 'Hechicero', 'Mago'], escalado: null,
  },

  // ── Encantamiento ─────────────────────────────────────────────────────────
  {
    nombre: 'Amigos', nivel: 0, escuela: 'Encantamiento',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Mientras el conjuro está activo, tienes Ventaja en las pruebas de Carisma contra una criatura no hostil. Al terminar, la criatura sabe que has usado magia para influir en ella.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Insulto Vicioso', nivel: 0, escuela: 'Encantamiento',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Lanzas insultos mágicos contra una criatura que pueda oírte. Debe superar una tirada de Sabiduría o sufrirá 1d6 de daño psíquico y tendrá Desventaja en su próximo ataque.',
    clases: ['Bardo'], escalado: 'El daño aumenta en 1d6 al alcanzar los niveles 5, 11 y 17.',
  },
  {
    nombre: 'Encantar Persona', nivel: 1, escuela: 'Encantamiento',
    tiempo_lanzamiento: '1 acción', alcance: '9 metros',
    duracion: '1 hora', concentracion: false, ritual: false,
    descripcion: 'Intentas encantar a un humanoide visible. Debe superar una tirada de Sabiduría o quedará Encantado por ti durante la duración, considerándote un amigo querido. Al terminar, sabe que fue encantado.',
    clases: ['Bardo', 'Druida', 'Hechicero', 'Brujo', 'Mago'], escalado: 'Puedes afectar a una criatura adicional por nivel por encima del 1.',
  },
  {
    nombre: 'Orden', nivel: 1, escuela: 'Encantamiento',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: '1 asalto', concentracion: false, ritual: false,
    descripcion: 'Pronuncias una orden de una sola palabra a una criatura visible. Debe superar una tirada de Sabiduría o seguirá la orden en su siguiente turno. No funciona sobre No Muertos.',
    clases: ['Clérigo', 'Paladín'], escalado: 'Puedes afectar a una criatura adicional por nivel por encima del 1.',
  },
  {
    nombre: 'Sugestión', nivel: 2, escuela: 'Encantamiento',
    tiempo_lanzamiento: '1 acción', alcance: '9 metros',
    duracion: 'Conc., 8 horas', concentracion: true, ritual: false,
    descripcion: 'Sugieres un curso de acción en dos frases a una criatura que pueda oírte. Debe superar una tirada de Sabiduría o seguirá la sugerencia, siempre que no sea directamente dañina.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Retener Persona', nivel: 2, escuela: 'Encantamiento',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Elige a un humanoide visible. Debe superar una tirada de Sabiduría o quedará Paralizado. Al final de cada turno puede repetir la salvación para terminar el efecto.',
    clases: ['Bardo', 'Clérigo', 'Druida', 'Hechicero', 'Brujo', 'Mago'], escalado: 'Puedes afectar a un humanoide adicional por nivel por encima del 2.',
  },

  // ── Evocación ─────────────────────────────────────────────────────────────
  {
    nombre: 'Llamarada', nivel: 0, escuela: 'Evocación',
    tiempo_lanzamiento: '1 acción', alcance: '36 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Lanzas una llama de fuego contra una criatura u objeto inflamable. Haz un ataque de conjuro a distancia: si impacta, sufre 1d10 de daño por fuego.',
    clases: ['Hechicero', 'Mago'], escalado: 'El daño aumenta en 1d10 al alcanzar los niveles 5, 11 y 17.',
  },
  {
    nombre: 'Luz', nivel: 0, escuela: 'Evocación',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: '1 hora', concentracion: false, ritual: false,
    descripcion: 'Tocas un objeto. Emite luz brillante en 6 metros y luz tenue 6 metros más allá. La luz puede ser de cualquier color.',
    clases: ['Bardo', 'Clérigo', 'Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Proyectil Mágico', nivel: 1, escuela: 'Evocación',
    tiempo_lanzamiento: '1 acción', alcance: '36 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Creas tres dardos de fuerza mágica que impactan automáticamente. Cada dardo inflige 1d4+1 de daño por fuerza.',
    clases: ['Hechicero', 'Mago'], escalado: 'Se crea un dardo adicional por nivel por encima del 1.',
  },
  {
    nombre: 'Manos Ardientes', nivel: 1, escuela: 'Evocación',
    tiempo_lanzamiento: '1 acción', alcance: 'Cono de 4,5 m',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Una fina hoja de llamas barre desde tus dedos. Cada criatura en el cono debe superar una tirada de Destreza o sufrirá 3d6 de daño por fuego, o la mitad si tiene éxito.',
    clases: ['Hechicero', 'Mago'], escalado: 'El daño aumenta en 1d6 por nivel por encima del 1.',
  },
  {
    nombre: 'Rayo Abrasador', nivel: 2, escuela: 'Evocación',
    tiempo_lanzamiento: '1 acción', alcance: '27 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Creas tres rayos de fuego y los lanzas contra objetivos dentro del alcance. Haz un ataque de conjuro por rayo: si impacta, inflige 2d6 de daño por fuego.',
    clases: ['Hechicero', 'Mago'], escalado: 'Se crea un rayo adicional por nivel por encima del 2.',
  },
  {
    nombre: 'Añicos', nivel: 2, escuela: 'Evocación',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Un estruendo ensordecedor retumba en una esfera de 3 metros. Cada criatura debe superar una tirada de Constitución o sufrirá 3d8 de daño por trueno, o la mitad si tiene éxito.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: 'El daño aumenta en 1d8 por nivel por encima del 2.',
  },

  // ── Ilusión ───────────────────────────────────────────────────────────────
  {
    nombre: 'Ilusión Menor', nivel: 0, escuela: 'Ilusión',
    tiempo_lanzamiento: '1 acción', alcance: '9 metros',
    duracion: '1 minuto', concentracion: false, ritual: false,
    descripcion: 'Creas un sonido o la imagen de un objeto. Si es un sonido, puede ir de susurro a grito. Si es una imagen, no puede ser mayor que un cubo de 1,5 metros y es puramente visual.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Luces Danzarinas', nivel: 0, escuela: 'Ilusión',
    tiempo_lanzamiento: '1 acción', alcance: '36 metros',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Creas hasta cuatro luces flotantes del tamaño de una antorcha. Puedes combinarlas en una figura humanoide. Cada luz emite luz tenue en 3 metros.',
    clases: ['Bardo', 'Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Imagen Silenciosa', nivel: 1, escuela: 'Ilusión',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Conc., 10 minutos', concentracion: true, ritual: false,
    descripcion: 'Creas la imagen visual de un objeto o criatura no mayor que un cubo de 4,5 metros. La ilusión es puramente visual, sin sonido ni olor.',
    clases: ['Bardo', 'Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Disfrazarse', nivel: 1, escuela: 'Ilusión',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: '1 hora', concentracion: false, ritual: false,
    descripcion: 'Cambias tu aspecto ilusoriamente. Puedes parecer hasta 30 cm más alto o bajo y alterar tu ropa y rasgos. El cambio no resiste el tacto.',
    clases: ['Bardo', 'Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Invisibilidad', nivel: 2, escuela: 'Ilusión',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: 'Conc., 1 hora', concentracion: true, ritual: false,
    descripcion: 'Una criatura que toques se vuelve invisible junto con todo lo que lleve. El conjuro termina para ese objetivo si ataca o lanza un conjuro.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: 'Puedes afectar a una criatura adicional por nivel por encima del 2.',
  },
  {
    nombre: 'Imagen Especular', nivel: 2, escuela: 'Ilusión',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: '1 minuto', concentracion: false, ritual: false,
    descripcion: 'Tres réplicas ilusorias tuyas aparecen en tu espacio y copian tus movimientos. Cuando eres atacado, se tira un d20 para determinar si el ataque impacta a una réplica en tu lugar.',
    clases: ['Hechicero', 'Brujo', 'Mago'], escalado: null,
  },

  // ── Necromancia ───────────────────────────────────────────────────────────
  {
    nombre: 'Tañido del Muerto', nivel: 0, escuela: 'Necromancia',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Señalas a una criatura visible y el sonido de una campana funeraria la llena de agonía. Debe superar una tirada de Sabiduría o sufrirá 1d8 de daño necrótico (1d12 si le faltan puntos de golpe).',
    clases: ['Clérigo', 'Brujo', 'Mago'], escalado: 'El daño aumenta en 1d8 (o 1d12) al alcanzar los niveles 5, 11 y 17.',
  },
  {
    nombre: 'Toque Gélido', nivel: 0, escuela: 'Necromancia',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Invocas la mano de un cadáver para aferrar a una criatura. Haz un ataque de conjuro a distancia: si impacta, sufre 1d10 de daño necrótico y no puede recuperar puntos de golpe hasta tu siguiente turno.',
    clases: ['Hechicero', 'Brujo', 'Mago'], escalado: 'El daño aumenta en 1d10 al alcanzar los niveles 5, 11 y 17.',
  },
  {
    nombre: 'Infligir Heridas', nivel: 1, escuela: 'Necromancia',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Haz un ataque de conjuro cuerpo a cuerpo contra una criatura que alcances. Si impacta, el objetivo sufre 2d10 de daño necrótico.',
    clases: ['Clérigo'], escalado: 'El daño aumenta en 1d10 por nivel por encima del 1.',
  },
  {
    nombre: 'Vida Falsa', nivel: 1, escuela: 'Necromancia',
    tiempo_lanzamiento: '1 acción', alcance: 'Personal',
    duracion: '1 hora', concentracion: false, ritual: false,
    descripcion: 'Te fortaleces con una imitación de la vitalidad no muerta. Obtienes 1d4+4 puntos de golpe temporales que duran hasta que el conjuro termine.',
    clases: ['Hechicero', 'Mago'], escalado: 'Ganas 5 puntos de golpe temporales adicionales por nivel por encima del 1.',
  },
  {
    nombre: 'Rayo de Debilidad', nivel: 2, escuela: 'Necromancia',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Conc., 1 minuto', concentracion: true, ritual: false,
    descripcion: 'Un rayo de energía debilitante chisporrotea hacia una criatura visible. Si impacta, el objetivo inflige la mitad de daño con ataques de Fuerza. Al final de cada turno puede hacer una tirada de Constitución.',
    clases: ['Brujo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Ceguera/Sordera', nivel: 2, escuela: 'Necromancia',
    tiempo_lanzamiento: '1 acción', alcance: '9 metros',
    duracion: '1 minuto', concentracion: false, ritual: false,
    descripcion: 'Atas uno de los sentidos de un enemigo con magia. Debe superar una tirada de Constitución o quedará Cegado o Ensordecido (a tu elección). Puede repetir la salvación al final de cada turno.',
    clases: ['Bardo', 'Clérigo', 'Hechicero', 'Mago'], escalado: 'Puedes afectar a una criatura adicional por nivel por encima del 2.',
  },

  // ── Transmutación ─────────────────────────────────────────────────────────
  {
    nombre: 'Reparar', nivel: 0, escuela: 'Transmutación',
    tiempo_lanzamiento: '1 minuto', alcance: 'Toque',
    duracion: 'Instantánea', concentracion: false, ritual: false,
    descripcion: 'Repara una rotura o desgarro en un objeto que toques, siempre que no sea mayor de 30 cm. La reparación no deja rastro.',
    clases: ['Bardo', 'Clérigo', 'Druida', 'Mago'], escalado: null,
  },
  {
    nombre: 'Prestidigitación', nivel: 0, escuela: 'Transmutación',
    tiempo_lanzamiento: '1 acción', alcance: '3 metros',
    duracion: '1 hora', concentracion: false, ritual: false,
    descripcion: 'Un truco menor mágico para principiantes. Puedes crear efectos sensoriales inocuos, encender velas, limpiar objetos, enfriar o calentar hasta 1 kg de materia o crear marcas inofensivas.',
    clases: ['Bardo', 'Hechicero', 'Brujo', 'Mago'], escalado: null,
  },
  {
    nombre: 'Salto', nivel: 1, escuela: 'Transmutación',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: '1 minuto', concentracion: false, ritual: false,
    descripcion: 'Tocas a una criatura. Su distancia de salto se triplica hasta que el conjuro termine.',
    clases: ['Druida', 'Explorador', 'Hechicero', 'Mago'], escalado: 'Puedes afectar a una criatura adicional por nivel por encima del 1.',
  },
  {
    nombre: 'Caída de Pluma', nivel: 1, escuela: 'Transmutación',
    tiempo_lanzamiento: '1 reacción', alcance: '18 metros',
    duracion: '1 minuto', concentracion: false, ritual: false,
    descripcion: 'Elige hasta cinco criaturas que caigan dentro del alcance. Su velocidad de caída se reduce a 18 metros por asalto y no sufren daño por caída al aterrizar.',
    clases: ['Bardo', 'Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Levitar', nivel: 2, escuela: 'Transmutación',
    tiempo_lanzamiento: '1 acción', alcance: '18 metros',
    duracion: 'Conc., 10 minutos', concentracion: true, ritual: false,
    descripcion: 'Una criatura u objeto de hasta 500 kg dentro del alcance asciende hasta 6 metros y queda suspendido. Una criatura no dispuesta puede resistir con una tirada de Constitución.',
    clases: ['Hechicero', 'Mago'], escalado: null,
  },
  {
    nombre: 'Visión en la Oscuridad', nivel: 2, escuela: 'Transmutación',
    tiempo_lanzamiento: '1 acción', alcance: 'Toque',
    duracion: '8 horas', concentracion: false, ritual: false,
    descripcion: 'Tocas a una criatura dispuesta y le otorgas la capacidad de ver en la oscuridad hasta 18 metros durante la duración.',
    clases: ['Druida', 'Explorador', 'Hechicero', 'Mago'], escalado: null,
  },
]

export const HECHIZOS_POR_NIVEL = (nivel: number) =>
  HECHIZOS.filter((h) => h.nivel === nivel)

export const HECHIZOS_PARA_CLASE = (className: string) =>
  HECHIZOS.filter((h) => h.clases.includes(className))
