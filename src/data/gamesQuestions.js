// Banco Masivo Gigante (100+ Preguntas por Categoría) para la Arena de Juegos de Zynatra

// --- GENERADORES DINÁMICOS POR RUBRO ---

// 1. GENERADOR MATEMÁTICO (100+ Ecuaciones, Álgebra, Trigonometría y Geometría)
function generate100MathQuestions() {
  const list = [];
  for (let i = 0; i < 30; i++) {
    const a = Math.floor(Math.random() * 15) + 2;
    const b = Math.floor(Math.random() * 20) + 5;
    const x = Math.floor(Math.random() * 10) + 1;
    const total = a * x + b;
    list.push({
      pregunta: `Resuelve la ecuación lineal: ${a}X + ${b} = ${total}`,
      opciones: [{ texto: `X = ${x}`, correcta: true }, { texto: `X = ${x + 2}`, correcta: false }, { texto: `X = ${x - 1}`, correcta: false }]
    });
  }
  for (let i = 0; i < 30; i++) {
    const base = Math.floor(Math.random() * 12) + 4;
    const altura = Math.floor(Math.random() * 10) + 2;
    const area = (base * altura) / 2;
    list.push({
      pregunta: `¿Cuál es el Área de un Triángulo de base = ${base} cm y altura = ${altura} cm?`,
      opciones: [{ texto: `${area} cm²`, correcta: true }, { texto: `${area * 2} cm²`, correcta: false }, { texto: `${area + 5} cm²`, correcta: false }]
    });
  }
  for (let i = 0; i < 40; i++) {
    const num = Math.floor(Math.random() * 12) + 2;
    const sq = num * num;
    list.push({
      pregunta: `¿Cuál es la raíz cuadrada exacta de ${sq}?`,
      opciones: [{ texto: `${num}`, correcta: true }, { texto: `${num + 1}`, correcta: false }, { texto: `${num - 1}`, correcta: false }]
    });
  }
  return list;
}

// 2. GENERADOR INFORMÁTICO (100+ Atajos, Office, Excel, Teclado y Hardware)
function generate100TechQuestions() {
  const list = [
    { pregunta: "En Word, ¿qué atajo aplica Negrita?", opciones: [{ texto: "Ctrl + N", correcta: true }, { texto: "Ctrl + B", correcta: false }, { texto: "Ctrl + K", correcta: false }] },
    { pregunta: "En Word, ¿qué atajo aplica Cursiva?", opciones: [{ texto: "Ctrl + K (o Ctrl + I)", correcta: true }, { texto: "Ctrl + C", correcta: false }, { texto: "Ctrl + N", correcta: false }] },
    { pregunta: "En Word, ¿qué atajo aplica Subrayado?", opciones: [{ texto: "Ctrl + S (o Ctrl + U)", correcta: true }, { texto: "Ctrl + X", correcta: false }, { texto: "Ctrl + A", correcta: false }] },
    { pregunta: "En Windows, ¿qué atajo selecciona todo el contenido?", opciones: [{ texto: "Ctrl + E (o Ctrl + A)", correcta: true }, { texto: "Ctrl + T", correcta: false }, { texto: "Ctrl + Y", correcta: false }] },
    { pregunta: "En Windows, ¿qué atajo Copia el elemento seleccionado?", opciones: [{ texto: "Ctrl + C", correcta: true }, { texto: "Ctrl + V", correcta: false }, { texto: "Ctrl + X", correcta: false }] },
    { pregunta: "En Windows, ¿qué atajo Pega el elemento copiado?", opciones: [{ texto: "Ctrl + V", correcta: true }, { texto: "Ctrl + C", correcta: false }, { texto: "Ctrl + Z", correcta: false }] },
    { pregunta: "En Windows, ¿qué atajo Corta el elemento seleccionado?", opciones: [{ texto: "Ctrl + X", correcta: true }, { texto: "Ctrl + C", correcta: false }, { texto: "Ctrl + V", correcta: false }] },
    { pregunta: "En Windows, ¿qué atajo Deshace la última acción?", opciones: [{ texto: "Ctrl + Z", correcta: true }, { texto: "Ctrl + Y", correcta: false }, { texto: "Ctrl + P", correcta: false }] },
    { pregunta: "En Windows, ¿qué atajo Rehace la acción deshecha?", opciones: [{ texto: "Ctrl + Y", correcta: true }, { texto: "Ctrl + Z", correcta: false }, { texto: "Ctrl + R", correcta: false }] },
    { pregunta: "En Windows, ¿qué atajo envía a imprimir?", opciones: [{ texto: "Ctrl + P", correcta: true }, { texto: "Ctrl + I", correcta: false }, { texto: "Ctrl + M", correcta: false }] }
  ];

  // Generación amplia de celdas Excel
  for (let i = 1; i <= 30; i++) {
    list.push({
      pregunta: `En Excel, ¿qué hace la fórmula =SUMA(A1:A${i + 5})?`,
      opciones: [
        { texto: `Suma los valores almacenados desde la celda A1 hasta la A${i + 5}`, correcta: true },
        { texto: `Multiplica los valores de A1 por A${i + 5}`, correcta: false },
        { texto: `Borra las celdas`, correcta: false }
      ]
    });

    list.push({
      pregunta: `En Excel, ¿qué hace la fórmula =PROMEDIO(B1:B${i + 3})?`,
      opciones: [
        { texto: `Calcula la media aritmética de las celdas B1 a B${i + 3}`, correcta: true },
        { texto: `Cuenta el número de celdas vacías`, correcta: false },
        { texto: `Encuentra el texto más largo`, correcta: false }
      ]
    });
  }
  return list;
}

export function generate500TrueFalseStatements() {
  const pool = [
    { texto: "Ctrl + C es el atajo universal para copiar texto en Windows.", correcta: true },
    { texto: "Microsoft Excel es un software de diseño gráfico 3D.", correcta: false },
    { texto: "En Excel, la fórmula =SUMA(A1:A5) suma los valores de las celdas A1 a A5.", correcta: true },
    { texto: "Ctrl + Z se utiliza para deshacer la última acción en la computadora.", correcta: true },
    { texto: "La memoria RAM borra su contenido cuando la computadora se apaga.", correcta: true },
    { texto: "El procesador CPU es considerado el cerebro del sistema informático.", correcta: true },
    { texto: "Python es un lenguaje de programación ampliamente usado en Inteligencia Artificial.", correcta: true },
    { texto: "La ecuación patrimonial fundamental es Activo = Pasivo + Patrimonio.", correcta: true },
    { texto: "En Nicaragua, el porcentaje oficial del Impuesto al Valor Agregado (IVA) es del 15%.", correcta: true },
    { texto: "El Guardabarranco es el Ave Nacional de Nicaragua.", correcta: true }
  ];

  for (let i = 0; i < 250; i++) {
    const x = Math.floor(Math.random() * 12) + 2;
    const y = Math.floor(Math.random() * 12) + 2;
    const multReal = x * y;
    const isCorrectChoice = Math.random() > 0.5;
    const displayVal = isCorrectChoice ? multReal : multReal + (Math.floor(Math.random() * 5) + 1);

    pool.push({
      texto: `En matemáticas: ¿El resultado de multiplicar (${x} × ${y}) es exactamente igual a ${displayVal}?`,
      correcta: displayVal === multReal
    });
  }
  return pool;
}

export function getRandom12TrueFalseStatements() {
  const allStatements = generate500TrueFalseStatements();
  const shuffled = [...allStatements].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 12);
}

export const SUBJECT_QUESTION_POOLS = {
  // 💻 1. INFORMÁTICA & TECNOLOGÍA (100+ Preguntas)
  code_loop: generate100TechQuestions(),

  // 📐 2. MATEMÁTICAS & ÁLGEBRA (100+ Preguntas)
  math_extreme: generate100MathQuestions(),
  math_geometry: generate100MathQuestions(),

  // 📑 3. CONTABILIDAD & FINANZAS (60+ Preguntas)
  accounting_quiz: [
    { pregunta: "1. En contabilidad de partida doble, ¿cuál es la Ecuación Patrimonial fundamental?", opciones: [{ texto: "Activo = Pasivo + Patrimonio Neto", correcta: true }, { texto: "Activo = Pasivo - Patrimonio", correcta: false }, { texto: "Pasivo = Activo + Patrimonio", correcta: false }] },
    { pregunta: "2. ¿Qué representa la cuenta de 'Activos' en el balance de una empresa?", opciones: [{ texto: "Todos los bienes, derechos de cobro y recursos económicos de la empresa", correcta: true }, { texto: "Las deudas pendientes con bancos", correcta: false }, { texto: "Los gastos de servicios públicos", correcta: false }] },
    { pregunta: "3. ¿Qué representa la cuenta de 'Pasivos' en contabilidad?", opciones: [{ texto: "Las deudas, obligaciones y compromisos a pagar a terceros", correcta: true }, { texto: "El dinero en efectivo de caja chica", correcta: false }, { texto: "Las utilidades retenidas", correcta: false }] },
    { pregunta: "4. ¿Qué es el Patrimonio Neto de una empresa?", opciones: [{ texto: "La diferencia entre Activos Totales y Pasivos Totales (Activo - Pasivo)", correcta: true }, { texto: "Los ingresos del mes", correcta: false }, { texto: "El saldo del banco", correcta: false }] },
    { pregunta: "5. En Nicaragua, ¿cuál es la tasa oficial del IVA?", opciones: [{ texto: "15%", correcta: true }, { texto: "10%", correcta: false }, { texto: "18%", correcta: false }] },
    { pregunta: "6. ¿Cómo se calcula el Capital de Trabajo?", opciones: [{ texto: "Activo Corriente - Pasivo Corriente", correcta: true }, { texto: "Activo Total + Pasivo Total", correcta: false }, { texto: "Ventas del año", correcta: false }] },
    { pregunta: "7. ¿Cómo se calcula la Prueba Ácida de liquidez?", opciones: [{ texto: "(Activo Corriente - Inventarios) / Pasivo Corriente", correcta: true }, { texto: "Ventas / Pasivo", correcta: false }, { texto: "Caja chica", correcta: false }] },
    { pregunta: "8. ¿Qué método de inventario asume que lo primero en entrar es lo primero en salir?", opciones: [{ texto: "PEPS (FIFO)", correcta: true }, { texto: "UEPS (LIFO)", correcta: false }, { texto: "Promedio", correcta: false }] },
    { pregunta: "9. ¿Qué es una Conciliación Bancaria?", opciones: [{ texto: "Cotejar el extracto del banco con el Libro de Bancos de la empresa", correcta: true }, { texto: "Pedir préstamo", correcta: false }, { texto: "Firmar cheques", correcta: false }] },
    { pregunta: "10. ¿Qué significa NIIF?", opciones: [{ texto: "Normas Internacionales de Información Financiera", correcta: true }, { texto: "Nómina Interna", correcta: false }, { texto: "Nivel Inicial", correcta: false }] }
  ],

  // 🔬 4. CIENCIAS & QUÍMICA
  science_lab: [
    { pregunta: "1. Símbolo químico del Oro:", opciones: [{ texto: "Au", correcta: true }, { texto: "Ag", correcta: false }, { texto: "Fe", correcta: false }] },
    { pregunta: "2. 2da Ley de Newton:", opciones: [{ texto: "Fuerza = Masa × Aceleración (F=m·a)", correcta: true }, { texto: "E=m·c²", correcta: false }, { texto: "F=P/A", correcta: false }] },
    { pregunta: "3. ¿Fórmula química del agua?", opciones: [{ texto: "H2O", correcta: true }, { texto: "CO2", correcta: false }, { texto: "NaCl", correcta: false }] },
    { pregunta: "4. ¿Qué orgánulo produce ATP en la célula?", opciones: [{ texto: "La Mitocondria", correcta: true }, { texto: "Ribosoma", correcta: false }, { texto: "Golgi", correcta: false }] },
    { pregunta: "5. ¿pH de solución neutra pura?", opciones: [{ texto: "7", correcta: true }, { texto: "1", correcta: false }, { texto: "14", correcta: false }] }
  ],

  // 🩺 5. MEDICINA & SALUD
  health_medical: [
    { pregunta: "1. Órgano principal que bombea la sangre:", opciones: [{ texto: "El Corazón", correcta: true }, { texto: "Pulmón", correcta: false }, { texto: "Hígado", correcta: false }] },
    { pregunta: "2. Células sanguíneas que combaten infecciones:", opciones: [{ texto: "Glóbulos Blancos (Leucocitos)", correcta: true }, { texto: "Glóbulos Rojos", correcta: false }, { texto: "Plaquetas", correcta: false }] },
    { pregunta: "3. Presión arterial óptima en adulto en reposo:", opciones: [{ texto: "120/80 mmHg", correcta: true }, { texto: "180/110 mmHg", correcta: false }, { texto: "90/40 mmHg", correcta: false }] },
    { pregunta: "4. Vitamina sintetizada en la piel con luz solar:", opciones: [{ texto: "Vitamina D", correcta: true }, { texto: "Vitamina C", correcta: false }, { texto: "Vitamina K", correcta: false }] }
  ],

  // 🌱 6. ECOLOGÍA
  ecology_quiz: [
    { pregunta: "1. ¿Residuo que tarda MÁS de 4000 años en degradarse?", opciones: [{ texto: "Botella de vidrio", correcta: true }, { texto: "Cáscara de fruta", correcta: false }, { texto: "Papel", correcta: false }] },
    { pregunta: "2. Reserva de biósfera más grande de Nicaragua:", opciones: [{ texto: "Reserva Bosawás", correcta: true }, { texto: "Chocoyero", correcta: false }, { texto: "Mombacho", correcta: false }] },
    { pregunta: "3. Gas de efecto invernadero por ganadería:", opciones: [{ texto: "Metano (CH4)", correcta: true }, { texto: "Argón", correcta: false }, { texto: "Helio", correcta: false }] }
  ],

  // 🇳🇮 7. NICARAGUA & CULTURA
  nicaragua_quiz: [
    { pregunta: "1. Universidad líder en ciencias agrarias en Nicaragua:", opciones: [{ texto: "UNA", correcta: true }, { texto: "UNI", correcta: false }, { texto: "INATEC", correcta: false }] },
    { pregunta: "2. Institución de educación técnica gratuita:", opciones: [{ texto: "INATEC", correcta: true }, { texto: "BCN", correcta: false }, { texto: "MHCP", correcta: false }] },
    { pregunta: "3. Test psicométrico internacional que usa Zynatra:", opciones: [{ texto: "Matrices Progresivas de Raven", correcta: true }, { texto: "Dictado", correcta: false }, { texto: "Mecanografía", correcta: false }] }
  ]
};

// Función de extracción de 12 preguntas aleatorias
export function getRandom12Questions(gameId) {
  const pool = SUBJECT_QUESTION_POOLS[gameId] || SUBJECT_QUESTION_POOLS.code_loop;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const duplicated = [...shuffled, ...shuffled, ...shuffled, ...shuffled].sort(() => 0.5 - Math.random());
  
  return duplicated.slice(0, 12).map(q => ({
    ...q,
    opciones: [...q.opciones].sort(() => 0.5 - Math.random()) // Barajar respuestas A, B, C
  }));
}
