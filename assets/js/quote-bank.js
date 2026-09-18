
console.log('💬 Cargando banco de citas...');

const QUOTE_BANK = [
    // --- Inspiracional / Éxito ---
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día. - Robert Collier",
    "La única forma de hacer un gran trabajo es amar lo que haces. - Steve Jobs",
    "No cuentes los días, haz que los días cuenten. - Muhammad Ali",
    "El futuro pertenece a quienes creen en la belleza de sus sueños. - Eleanor Roosevelt",
    "Sé tú mismo; todos los demás ya están ocupados. - Oscar Wilde",
    "Vive como si fueras a morir mañana. Aprende como si fueras a vivir para siempre. - Mahatma Gandhi",
    "La imaginación es más importante que el conocimiento. - Albert Einstein",
    "No llores porque terminó, sonríe porque sucedió. - Dr. Seuss",
    "El éxito no es final, el fracaso no es fatal: es el coraje de continuar lo que cuenta. - Winston Churchill",
    "No he fallado. He encontrado 10,000 formas que no funcionan. - Thomas Edison",
    "Solo aquellos que se arriesgan a ir demasiado lejos pueden descubrir qué tan lejos pueden llegar. - T.S. Eliot",
    "No hay atajos hacia ningún lugar que valga la pena ir. - Beverly Sills",
    "La diferencia entre lo ordinario y lo extraordinario es ese pequeño extra. - Jimmy Johnson",
    "El éxito es conseguir lo que quieres. La felicidad es querer lo que consigues. - Dale Carnegie",
    "El secreto del éxito es hacer de tu vocación tu vacación. - Mark Twain",
    "No hay elevador al éxito, tienes que tomar las escaleras. - Zig Ziglar",

    // --- Tecnología / Programación ---
    "La mejor manera de predecir el futuro es inventarlo. - Alan Kay",
    "El código nunca miente, los comentarios a veces sí. - Ron Jeffries",
    "Primero resuelve el problema, luego escribe el código. - John Johnson",
    "La simplicidad es la máxima sofisticación. - Leonardo da Vinci",
    "El debugging es como ser detective en una novela donde también eres el asesino. - Filipe Fortes",
    "Talk is cheap. Show me the code. - Linus Torvalds",
    "Cualquier tonto puede escribir código que una computadora pueda entender. Los buenos programadores escriben código que los humanos puedan entender. - Martin Fowler",
    "La optimización prematura es la raíz de todos los males. - Donald Knuth",
    "El mejor código es el que no existe. - Anónimo",
    "Hay dos tipos de lenguajes de programación: aquellos de los que la gente se queja y aquellos que nadie usa. - Bjarne Stroustrup",

    // --- Filosofía ---
    "Pienso, luego existo. - René Descartes",
    "El único conocimiento verdadero es saber que no sabes nada. - Sócrates",
    "La vida no examinada no vale la pena ser vivida. - Sócrates",
    "Lo que no me mata me hace más fuerte. - Friedrich Nietzsche",
    "El hombre está condenado a ser libre. - Jean-Paul Sartre",
    "Somos lo que repetidamente hacemos. La excelencia, entonces, no es un acto sino un hábito. - Aristóteles",
    "El mayor enemigo del conocimiento no es la ignorancia, es la ilusión del conocimiento. - Stephen Hawking",
    "La mente es todo. Lo que piensas, te conviertes. - Buddha",
    "Duda de todo, encuentra tu propia luz. - Buddha",

    // --- Educación ---
    "Dime y lo olvido, enséñame y lo recuerdo, involúcrame y lo aprendo. - Benjamin Franklin",
    "La educación es el arma más poderosa que puedes usar para cambiar el mundo. - Nelson Mandela",
    "La mente que se abre a una nueva idea jamás volverá a su tamaño original. - Albert Einstein",
    "El aprendizaje nunca agota la mente. - Leonardo da Vinci",
    "La inversión en conocimiento paga el mejor interés. - Benjamin Franklin",
    "La educación no es llenar un cubo, sino encender un fuego. - William Butler Yeats",

    // --- Creatividad ---
    "La creatividad es la inteligencia divirtiéndose. - Albert Einstein",
    "La lógica te llevará desde A hasta B. La imaginación te llevará a todas partes. - Albert Einstein",
    "La inspiración existe, pero tiene que encontrarte trabajando. - Pablo Picasso",
    "Todo niño es un artista. El problema es cómo seguir siendo artista una vez que crecemos. - Pablo Picasso",
    "La creatividad es permitirte cometer errores. El arte es saber cuáles conservar. - Scott Adams",

    // --- Vida ---
    "La vida no es sobre encontrarte a ti mismo, es sobre crearte a ti mismo. - George Bernard Shaw",
    "La vida es 10% lo que te sucede y 90% cómo reaccionas a ello. - Charles R. Swindoll",
    "Haz de tu vida un sueño y de tu sueño una realidad. - Antoine de Saint-Exupéry",
    "La vida es como montar en bicicleta. Para mantener tu equilibrio, debes seguir moviéndote. - Albert Einstein",
    "En el fondo, no son los años de tu vida los que cuentan. Es la vida en tus años. - Abraham Lincoln",
    "No esperes por el momento perfecto, toma el momento y hazlo perfecto. - Anónimo",
    "La vida es realmente simple, pero insistimos en complicarla. - Confucio",

    // --- Trabajo / Disciplina ---
    "El trabajo duro vence al talento cuando el talento no trabaja duro. - Tim Notke",
    "El genio es 1% inspiración y 99% transpiración. - Thomas Edison",
    "Elige un trabajo que ames y no tendrás que trabajar ni un día de tu vida. - Confucio",
    "La manera de empezar es dejar de hablar y empezar a hacer. - Walt Disney",
    "La excelencia no es un acto, sino un hábito. - Aristóteles",

    // --- Felicidad ---
    "La felicidad no es algo hecho. Viene de tus propias acciones. - Dalai Lama",
    "No hay camino a la felicidad: la felicidad es el camino. - Buddha",
    "La felicidad es cuando lo que piensas, lo que dices y lo que haces están en armonía. - Mahatma Gandhi",

    // --- Proverbios ---
    "La paciencia es amarga, pero su fruto es dulce. - Aristóteles",
    "El que no arriesga no gana. - Proverbio",
    "La práctica hace al maestro. - Proverbio",
    "A mal tiempo, buena cara. - Proverbio",
    "Camarón que se duerme se lo lleva la corriente. - Proverbio",
    "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora. - Proverbio chino",

    // --- Liderazgo ---
    "La innovación distingue entre un líder y un seguidor. - Steve Jobs",
    "El liderazgo no es sobre estar a cargo. Es sobre cuidar de los que están a tu cargo. - Simon Sinek",
    "Un líder es un distribuidor de esperanza. - Napoleón Bonaparte",

    // --- Amor ---
    "Donde hay amor, hay vida. - Mahatma Gandhi",
    "Amar no es mirarse el uno al otro, sino mirar juntos en la misma dirección. - Antoine de Saint-Exupéry",
    "El amor es la única fuerza capaz de transformar a un enemigo en amigo. - Martin Luther King Jr.",

    // --- Tiempo ---
    "El tiempo es lo más lento para el que espera; lo más rápido para el que teme. - William Shakespeare",
    "El tiempo que disfrutas perdiendo no está perdido. - Marthe Troly-Curtin",
    "El tiempo es la moneda de tu vida. Tú eres el único que puede determinar cómo se gastará. - Carl Sandburg",
    "Ayer es historia, mañana es un misterio, hoy es un regalo. - Eleanor Roosevelt"
];

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * QUOTE_BANK.length);
    return QUOTE_BANK[randomIndex];
}

function getRandomQuotes(count = 1) {
    const quotes = [];
    const usedIndices = new Set();

    for (let i = 0; i < count && i < QUOTE_BANK.length; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * QUOTE_BANK.length);
        } while (usedIndices.has(randomIndex));

        usedIndices.add(randomIndex);
        quotes.push(QUOTE_BANK[randomIndex]);
    }
    return quotes;
}

function getQuoteBankStats() {
    return {
        total: QUOTE_BANK.length,
        categories: {
            inspirational: QUOTE_BANK.filter(q => q.includes('éxito') || q.includes('logro')).length,
            philosophical: QUOTE_BANK.filter(q => q.includes('vida') || q.includes('existencia')).length,
            technology: QUOTE_BANK.filter(q => q.includes('código') || q.includes('programa')).length,
            love: QUOTE_BANK.filter(q => q.includes('amor') || q.includes('amar')).length,
            happiness: QUOTE_BANK.filter(q => q.includes('felicidad') || q.includes('feliz')).length
        }
    };
}

window.getRandomQuote = getRandomQuote;
window.getRandomQuotes = getRandomQuotes;
window.getQuoteBankStats = getQuoteBankStats;
Object.defineProperty(window, 'QUOTE_BANK_SIZE', { get: () => QUOTE_BANK.length });

console.log(`💬 Banco de citas listo: ${QUOTE_BANK.length} citas curadas`);
