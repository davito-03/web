// --- Datos Extendidos (Diccionario) ---
const dictionary = {
    greetings: [
        { lv: "Sveiki", es: "Hola" }, { lv: "Labrīt", es: "Buenos días" },
        { lv: "Labdien", es: "Buenas tardes" }, { lv: "Labvakar", es: "Buenas noches" },
        { lv: "Atā", es: "Adiós" }, { lv: "Uz redzēšanos", es: "Hasta luego" }
    ],
    basics: [
        { lv: "Jā", es: "Sí" }, { lv: "Nē", es: "No" }, { lv: "Lūdzu", es: "Por favor" },
        { lv: "Paldies", es: "Gracias" }, { lv: "Liels paldies", es: "Muchas gracias" },
        { lv: "Atvainojiet", es: "Perdón / Disculpe" }
    ],
    pronouns: [
        { lv: "Es", es: "Yo" }, { lv: "Tu", es: "Tú" }, { lv: "Viņš", es: "Él" },
        { lv: "Viņa", es: "Ella" }, { lv: "Mēs", es: "Nosotros" }, { lv: "Jūs", es: "Vosotros / Ustedes" },
        { lv: "Viņi", es: "Ellos" }
    ],
    sentences_basic: [
        { lv: "Es esmu liels", es: "Yo soy grande" }, { lv: "Tu gribi ēst", es: "Tú quieres comer" },
        { lv: "Viņš dzer ūdeni", es: "Él bebe agua" }, { lv: "Mēs ejam mājās", es: "Nosotros vamos a casa" },
        { lv: "Man patīk kafija", es: "Me gusta el café" }
    ],
    food: [
        { lv: "Ūdens", es: "Agua" }, { lv: "Maize", es: "Pan" }, { lv: "Piens", es: "Leche" },
        { lv: "Kafija", es: "Café" }, { lv: "Tēja", es: "Té" }, { lv: "Gaļa", es: "Carne" },
        { lv: "Zivs", es: "Pescado" }, { lv: "Siers", es: "Queso" }, { lv: "Ābols", es: "Manzana" }
    ],
    animals: [
        { lv: "Suns", es: "Perro" }, { lv: "Kaķis", es: "Gato" }, { lv: "Putns", es: "Pájaro" },
        { lv: "Zirgs", es: "Caballo" }, { lv: "Govs", es: "Vaca" }, { lv: "Cūka", es: "Cerdo" },
        { lv: "Pele", es: "Ratón" }
    ],
    sentences_restaurant: [
        { lv: "Es gribu rēķinu", es: "Yo quiero la cuenta" }, { lv: "Kur ir tualete", es: "¿Dónde está el baño?" },
        { lv: "Cik tas maksā", es: "¿Cuánto cuesta esto?" }, { lv: "Vienu kafiju lūdzu", es: "Un café por favor" }
    ],
    professions: [
        { lv: "Skolotājs", es: "Profesor" }, { lv: "Ārsts", es: "Médico" }, { lv: "Policists", es: "Policía" },
        { lv: "Inženieris", es: "Ingeniero" }, { lv: "Pavārs", es: "Cocinero" }, { lv: "Mākslinieks", es: "Artista" }
    ],
    adjectives: [
        { lv: "Liels", es: "Grande" }, { lv: "Mazs", es: "Pequeño" }, { lv: "Labs", es: "Bueno" },
        { lv: "Slikts", es: "Malo" }, { lv: "Skaists", es: "Hermoso" }, { lv: "Jauns", es: "Nuevo/Joven" },
        { lv: "Vecs", es: "Viejo" }
    ],
    travel: [
        { lv: "Kur ir lidosta?", es: "¿Dónde está el aeropuerto?" }, { lv: "Man vajag taksometru", es: "Necesito un taxi" },
        { lv: "Vai jūs runājat angliski?", es: "¿Habla usted inglés?" }, { lv: "Kur ir mana viesnīca?", es: "¿Dónde está mi hotel?" },
        { lv: "Viena biļete", es: "Un boleto" }
    ],
    shopping: [
        { lv: "Es pērku maizi", es: "Yo compro pan" }, { lv: "Tas ir dārgi", es: "Esto es caro" },
        { lv: "Vai jums ir siers?", es: "¿Tienen queso?" }, { lv: "Es gribu šo", es: "Quiero esto" }
    ],
    verbs2: [
        { lv: "Strādāt", es: "Trabajar" }, { lv: "Spēlēt", es: "Jugar" }, { lv: "Gulēt", es: "Dormir" },
        { lv: "Lasīt", es: "Leer" }, { lv: "Rakstīt", es: "Escribir" }, { lv: "Mīlēt", es: "Amar" }
    ]
};

const levels = [
    { id: 1, name: "Saludos", data: dictionary.greetings },
    { id: 2, name: "Básicos", data: dictionary.basics },
    { id: 3, name: "Pronombres", data: dictionary.pronouns },
    { id: 4, name: "Frases Simples", data: dictionary.sentences_basic },
    { id: 5, name: "Comida", data: dictionary.food },
    { id: 6, name: "Animales", data: dictionary.animals },
    { id: 7, name: "Restaurante", data: dictionary.sentences_restaurant },
    { id: 8, name: "Profesiones", data: dictionary.professions },
    { id: 9, name: "Adjetivos", data: dictionary.adjectives },
    { id: 10, name: "Viajes", data: dictionary.travel },
    { id: 11, name: "Compras", data: dictionary.shopping },
    { id: 12, name: "Verbos II", data: dictionary.verbs2 }
];

// --- Estado Global ---
let state = {
    screen: 'map', // 'map' | 'practice' | 'chat' | 'settings' | 'lesson'
    currentLevelId: null,
    questions: [],
    currentQuestionIndex: 0,
    isChecking: false,
    feedback: null,
    xp: parseInt(localStorage.getItem('latvian_xp')) || 0,
    streak: parseInt(localStorage.getItem('latvian_streak')) || 1,
    hearts: 5,
    completedLevels: JSON.parse(localStorage.getItem('latvian_completed')) || [],
    mistakes: JSON.parse(localStorage.getItem('latvian_mistakes')) || [],
    apiKey: localStorage.getItem('latvian_apikey') || '',
    darkMode: localStorage.getItem('latvian_darkmode') === 'true',
    aiExplanation: null,
    isExplaining: false,
    
    // Modalidades
    selectedOptionIndex: null,
    matchState: { selectedId: null, matchedIds: [] },
    sentenceState: { constructed: [], pool: [] },
    
    // Chat IA
    chatMessages: [],
    chatScenario: null
};

function saveProgress() {
    localStorage.setItem('latvian_xp', state.xp);
    localStorage.setItem('latvian_streak', state.streak);
    localStorage.setItem('latvian_completed', JSON.stringify(state.completedLevels));
    localStorage.setItem('latvian_mistakes', JSON.stringify(state.mistakes));
    localStorage.setItem('latvian_darkmode', state.darkMode);
}

function speakLatvian(text) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=lv&client=tw-ob&q=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Error TTS:", e));
}

// Generate questions logic (highly randomized)
function generateQuestions(levelData, count = 5) {
    let questions = [];
    // Deep copy and full shuffle
    let data = [...levelData].sort(() => 0.5 - Math.random());
    let poolSize = Math.min(count, data.length);
    
    for (let i = 0; i < poolSize; i++) {
        const item = data[i];
        const isSentence = item.lv.includes(' ');
        let modalityRandom = Math.random();
        
        if (isSentence && modalityRandom > 0.3) {
            let pool = item.lv.split(' ').sort(() => 0.5 - Math.random());
            questions.push({
                type: 'construct-sentence',
                prompt: item.es, promptLang: 'es', correctAnswer: item.lv, words: pool, originalItem: item
            });
        } else if (modalityRandom > 0.6 && levelData.length >= 4) {
            let pairsData = [...levelData].sort(() => 0.5 - Math.random()).slice(0, 4);
            let pairs = [];
            pairsData.forEach((pd, idx) => {
                pairs.push({ id: `lv_${idx}`, text: pd.lv, lang: 'lv', pairId: idx });
                pairs.push({ id: `es_${idx}`, text: pd.es, lang: 'es', pairId: idx });
            });
            pairs.sort(() => 0.5 - Math.random());
            questions.push({
                type: 'match-pairs', prompt: "Empareja las palabras", promptLang: 'es', pairs: pairs, originalItem: item
            });
        } else {
            const isLatvianToSpanish = Math.random() > 0.5;
            let options = [{ text: isLatvianToSpanish ? item.es : item.lv, isCorrect: true }];
            let pool = [...levelData].filter(x => x !== item).sort(() => 0.5 - Math.random());
            for (let j = 0; j < Math.min(3, pool.length); j++) {
                options.push({ text: isLatvianToSpanish ? pool[j].es : pool[j].lv, isCorrect: false });
            }
            options.sort(() => 0.5 - Math.random());
            questions.push({
                type: 'multiple-choice',
                prompt: isLatvianToSpanish ? item.lv : item.es, promptLang: isLatvianToSpanish ? 'lv' : 'es',
                options: options, originalItem: item
            });
        }
    }
    // Final shuffle of generated questions
    return questions.sort(() => 0.5 - Math.random());
}

// --- Integración IA (Gemini) ---
async function askGemini(systemPrompt, userPrompt) {
    if (!state.apiKey) return "Falta configurar API Key.";
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });
        const data = await res.json();
        if (data.error) return "Error: " + data.error.message;
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "Error de conexión con la IA.";
    }
}

window.explainWithAI = async function() {
    if (!state.apiKey) { alert("Configura tu API Key en Ajustes primero."); return; }
    
    const currentQ = state.questions[state.currentQuestionIndex];
    let prompt = "";
    if (currentQ.type === 'multiple-choice') {
        prompt = `Me equivoqué. La frase era '${currentQ.prompt}' y la correcta es '${currentQ.options.find(o=>o.isCorrect).text}'. Explica por qué de forma sencilla (máx 2 párrafos cortos).`;
    } else {
        prompt = `Tenía que traducir '${currentQ.prompt}' al letón. La correcta es '${currentQ.correctAnswer}'. Explícame la estructura de esta frase (máx 2 párrafos cortos).`;
    }
    
    state.isExplaining = true; updateUI();
    state.aiExplanation = await askGemini("Eres un profesor amigable de letón.", prompt);
    state.isExplaining = false; updateUI();
}

window.sendChatMessage = async function() {
    if (!state.apiKey) { alert("Configura tu API Key en Ajustes primero."); return; }
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    // Add user message
    state.chatMessages.push({ role: 'user', text });
    input.value = '';
    updateUI();
    
    // Prepare conversation history for Gemini
    let conversationHistory = state.chatMessages.map(m => `${m.role === 'user' ? 'Alumno' : 'Tutor'}: ${m.text}`).join('\n');
    let systemPrompt = `Eres un tutor de letón nativo. Estamos haciendo un roleplay: "${state.chatScenario}". 
    Reglas: 
    1. Responde SIEMPRE en letón sencillo. 
    2. Si el alumno comete un error gramatical grave, corrígelo brevemente en español entre paréntesis y luego sigue en letón.
    3. Tus respuestas deben ser cortas (1-2 frases).`;
    
    let aiResponse = await askGemini(systemPrompt, `Historial:\n${conversationHistory}\n\nAlumno: ${text}`);
    
    state.chatMessages.push({ role: 'ai', text: aiResponse });
    updateUI();
    
    // Auto speak the latvian part (trying to clean spanish parenthesis)
    let latvianPart = aiResponse.replace(/\(.*?\)/g, '').trim();
    if(latvianPart) speakLatvian(latvianPart);
}

// --- Renderizadores ---
function renderNavBar() {
    return `
        <div class="bottom-nav">
            <div class="nav-item ${state.screen === 'map' ? 'active' : ''}" onclick="switchTab('map')">
                <svg viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>Ruta
            </div>
            <div class="nav-item ${state.screen === 'practice' ? 'active' : ''}" onclick="switchTab('practice')">
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>Práctica
            </div>
            <div class="nav-item ${state.screen === 'chat' ? 'active' : ''}" onclick="switchTab('chat')">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>Conversar
            </div>
            <div class="nav-item ${state.screen === 'settings' ? 'active' : ''}" onclick="switchTab('settings')">
                <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>Ajustes
            </div>
        </div>
    `;
}

function renderMap() {
    return `
        <div class="top-bar">
            <div style="display: flex; gap: 15px;">
                <div class="stat"><svg viewBox="0 0 24 24" fill="#ff9600"><path d="M12 2L9 8H3l5 4.5-2 7.5 6-4.5 6 4.5-2-7.5 5-4.5h-6z"/></svg>${state.streak}</div>
                <div class="stat"><svg viewBox="0 0 24 24" fill="#1cb0f6"><path d="M12 2l3 6h6l-5 5 2 7-6-4-6 4 2-7-5-5h6z"/></svg>${state.xp} XP</div>
            </div>
        </div>
        <div class="main-view map-view">
            ${levels.map((level, index) => {
                const isUnlocked = index === 0 || state.completedLevels.includes(levels[index-1].id);
                const isCompleted = state.completedLevels.includes(level.id);
                return `
                    <div class="level-node ${!isUnlocked ? 'locked' : ''}" 
                         onclick="startLesson(${level.id}, ${isUnlocked})"
                         style="transform: translateX(${index % 2 === 0 ? '-20px' : '20px'})">
                        ${isCompleted ? '<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M12 2l3 6h6l-5 5 2 7-6-4-6 4 2-7-5-5h6z"/></svg>'}
                    </div>
                `;
            }).join('')}
        </div>
        ${renderNavBar()}
    `;
}

function renderPractice() {
    return `
        <div class="top-bar"><div class="stat" style="color:var(--secondary-color)">Práctica y Repaso</div></div>
        <div class="main-view">
            <button class="check-btn" style="background-color: var(--secondary-color); box-shadow: 0 4px 0 var(--secondary-shadow); margin-bottom: 20px;" onclick="startGeneralReview()">🌟 REPASO GENERAL</button>
            <p style="color: var(--text-light); margin-bottom: 20px; font-size: 0.9rem;">Mezcla todo lo que has aprendido en una lección aleatoria.</p>
            <hr style="border: 1px solid var(--border-color); margin-bottom: 20px;">
            
            <h3 style="color: var(--danger-color); margin-bottom: 10px;">Repaso de Errores</h3>
            ${state.mistakes.length === 0 ? 
                `<div style="text-align:center; margin-top:20px; color:#afafaf;"><p>¡No tienes errores pendientes!</p></div>` 
                : 
                `<button class="check-btn" style="margin-bottom: 30px; background-color: var(--danger-color); box-shadow: 0 4px 0 var(--danger-shadow);" onclick="startMistakesPractice()">Corregir Errores (${state.mistakes.length})</button>
                 ${state.mistakes.map(m => `<div class="mistake-card"><h4>${m.lv}</h4><p>${m.es}</p></div>`).join('')}`
            }
        </div>
        ${renderNavBar()}
    `;
}

function renderChat() {
    if (!state.chatScenario) {
        return `
            <div class="top-bar"><div class="stat" style="color:var(--text-main)">Tutor IA</div></div>
            <div class="main-view">
                <h2 style="margin-bottom: 20px;">Elige una situación</h2>
                <button class="option-btn" style="margin-bottom: 10px;" onclick="startChat('En un restaurante pidiendo comida')">🍽️ En un Restaurante</button>
                <button class="option-btn" style="margin-bottom: 10px;" onclick="startChat('Charla casual con un amigo nuevo')">👋 Conocer a alguien</button>
                <button class="option-btn" style="margin-bottom: 10px;" onclick="startChat('En el aeropuerto perdido')">✈️ Perdido en el aeropuerto</button>
                <button class="option-btn" style="margin-bottom: 10px;" onclick="startChat('De compras en el mercado')">🛒 De compras</button>
            </div>
            ${renderNavBar()}
        `;
    }
    
    return `
        <div class="top-bar">
            <div class="stat" style="color:var(--text-main); font-size:1rem;">${state.chatScenario}</div>
            <div class="close-btn" onclick="state.chatScenario=null; state.chatMessages=[]; updateUI()"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>
        </div>
        <div class="main-view" style="padding-bottom: 20px;">
            <div class="chat-container" id="chat-box">
                ${state.chatMessages.map(m => `
                    <div class="chat-msg ${m.role}">
                        ${m.text.replace(/\n/g, '<br/>')}
                        ${m.role === 'ai' ? `<button style="background:none; border:none; margin-top:5px; cursor:pointer;" onclick="speakLatvian('${m.text.replace(/\(.*?\)/g, '').replace(/'/g,"\\'").trim()}')">🔊</button>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" class="chat-input" placeholder="Escribe en letón..." onkeypress="if(event.key==='Enter') sendChatMessage()">
                <button class="chat-send-btn" onclick="sendChatMessage()"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
            </div>
        </div>
    `;
}

function renderSettings() {
    return `
        <div class="top-bar"><div class="stat" style="color:var(--text-main)">Ajustes y Cuenta</div></div>
        <div class="main-view">
            <h2 class="question-title" style="margin-bottom: 10px;">✨ Configuración IA</h2>
            <p style="margin-bottom: 15px; font-size: 1rem; color: var(--text-light); line-height: 1.5;">
                Para usar el Tutor IA y Conversar, necesitas una API Key de Gemini. <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--secondary-color); font-weight: bold; text-decoration: none;">Obtén tu clave aquí</a>.
            </p>
            <input type="password" id="api-key-input" placeholder="Pega tu API Key de Gemini..." value="${state.apiKey}" 
                   style="width: 100%; padding: 15px; border-radius: 12px; border: 2px solid var(--border-color); font-size: 1.1rem; margin-bottom: 20px; outline: none;">
            <button class="check-btn" style="background-color: #9c27b0; box-shadow: 0 4px 0 #7b1fa2;" onclick="saveSettings()">Guardar API Key</button>
            
            <hr style="border: 1px solid var(--border-color); margin: 30px 0;">
            <h2 class="question-title" style="margin-bottom: 10px;">🎨 Apariencia</h2>
            <button class="option-btn" onclick="toggleDarkMode()">
                ${state.darkMode ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}
            </button>
            
            <button class="check-btn" style="background-color: var(--danger-color); box-shadow: 0 4px 0 var(--danger-shadow); margin-top: 50px;" onclick="resetProgress()">Borrar Todo el Progreso</button>
        </div>
        ${renderNavBar()}
    `;
}

function renderLesson() {
    if (state.questions.length === 0) return '';
    const progress = (state.currentQuestionIndex / state.questions.length) * 100;
    const currentQ = state.questions[state.currentQuestionIndex];
    let isBtnDisabled = true;
    let exerciseHTML = '';
    
    if (currentQ.type === 'multiple-choice') {
        isBtnDisabled = state.selectedOptionIndex === null && !state.isChecking;
        exerciseHTML = `
            ${currentQ.promptLang === 'lv' ? `<button class="speaker-btn" onclick="speakLatvian('${currentQ.prompt.replace(/'/g,"\\'")}')"><svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button>` : ''}
            <h3 style="font-size: 1.8rem; margin-bottom: 20px; color: var(--secondary-color)">${currentQ.prompt}</h3>
            <div class="options-grid" id="options-container">
                ${currentQ.options.map((opt, idx) => `<button class="option-btn ${state.selectedOptionIndex === idx ? 'selected' : ''}" onclick="selectOption(${idx})" ${state.isChecking ? 'disabled' : ''}>${opt.text}</button>`).join('')}
            </div>`;
    } else if (currentQ.type === 'match-pairs') {
        const remainingPairs = currentQ.pairs.filter(p => !state.matchState.matchedIds.includes(p.id));
        isBtnDisabled = remainingPairs.length > 0 && !state.isChecking;
        exerciseHTML = `<div class="match-grid" id="options-container">
            ${currentQ.pairs.map((pair) => `<button class="match-btn ${state.matchState.matchedIds.includes(pair.id) ? 'hidden-pair' : ''} ${state.matchState.selectedId === pair.id ? 'selected' : ''}" onclick="selectMatchPair('${pair.id}')" ${state.isChecking ? 'disabled' : ''}>${pair.text}</button>`).join('')}
        </div>`;
    } else if (currentQ.type === 'construct-sentence') {
        isBtnDisabled = state.sentenceState.constructed.length !== currentQ.words.length && !state.isChecking;
        exerciseHTML = `<h3 style="font-size: 1.5rem; margin-bottom: 20px; color: var(--text-main)">${currentQ.prompt}</h3>
            <div class="sentence-dropzone" id="options-container">
                ${state.sentenceState.constructed.map((word, idx) => `<div class="word-block" onclick="${state.isChecking ? '' : `removeSentenceWord(${idx})`}">${word}</div>`).join('')}
            </div>
            <div class="sentence-pool">
                ${state.sentenceState.pool.map((word, idx) => `<div class="word-block" onclick="${state.isChecking ? '' : `addSentenceWord(${idx})`}">${word}</div>`).join('')}
            </div>`;
    }

    let correctText = currentQ.type === 'construct-sentence' ? currentQ.correctAnswer : (currentQ.type === 'multiple-choice' ? currentQ.options.find(o => o.isCorrect).text : "");
    
    return `
        <div class="lesson-view">
            <div class="lesson-header">
                <div class="close-btn" onclick="quitLesson()"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>
                <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${progress}%"></div></div>
                <div class="stat hearts"><svg viewBox="0 0 24 24" fill="#ff4b4b"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>${state.hearts}</div>
            </div>
            <div class="question-container"><h2 class="question-title">${currentQ.prompt ? "¿Qué significa esto?" : "Resuelve el ejercicio"}</h2>${exerciseHTML}</div>
            
            <div class="bottom-bar ${state.feedback ? state.feedback : ''}">
                <div class="feedback-msg">
                    ${state.feedback === 'correct' ? '¡Excelente!' : 'Incorrecto:'}
                    ${state.feedback === 'incorrect' ? `<div style="font-size: 1.1rem; color: #ea2b2b; margin-top: 5px">${correctText}</div>` : ''}
                    ${state.feedback === 'incorrect' && state.apiKey && currentQ.type !== 'match-pairs' ? `<button style="display: block; margin-top: 10px; padding: 8px 12px; background: #9c27b0; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;" onclick="explainWithAI()">${state.isExplaining ? 'Pensando...' : '✨ Explicar con IA'}</button>` : ''}
                </div>
                <button class="check-btn" onclick="handleBottomBtnClick()" ${isBtnDisabled ? 'disabled' : ''}>${state.isChecking ? 'Continuar' : 'Comprobar'}</button>
            </div>
            
            ${state.aiExplanation ? `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3 style="color: var(--primary-color); margin-bottom: 15px; font-size: 1.5rem;">✨ Tutor IA</h3>
                        <div style="font-size: 1.1rem; line-height: 1.6; color: var(--text-main); margin-bottom: 25px;">${state.aiExplanation.replace(/\n/g, '<br/>')}</div>
                        <button class="check-btn" onclick="state.aiExplanation = null; updateUI()">Entendido</button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function updateUI() {
    if (state.darkMode) document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');

    const appEl = document.getElementById('app');
    if (state.screen === 'lesson') appEl.innerHTML = renderLesson();
    else if (state.screen === 'practice') appEl.innerHTML = renderPractice();
    else if (state.screen === 'chat') appEl.innerHTML = renderChat();
    else if (state.screen === 'settings') appEl.innerHTML = renderSettings();
    else appEl.innerHTML = renderMap();
    
    if (state.screen === 'chat' && state.chatScenario) {
        let chatBox = document.getElementById('chat-box');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// --- Navigation & Actions ---
window.switchTab = function(tab) { state.screen = tab; updateUI(); }
window.toggleDarkMode = function() { state.darkMode = !state.darkMode; saveProgress(); updateUI(); }
window.saveSettings = function() {
    const key = document.getElementById('api-key-input').value.trim();
    state.apiKey = key; localStorage.setItem('latvian_apikey', key); alert("API Key guardada.");
}
window.resetProgress = function() { if(confirm("¿Seguro que quieres borrar todo?")) { localStorage.clear(); location.reload(); } }

window.startChat = function(scenario) {
    if (!state.apiKey) { alert("Configura la API Key de Gemini en Ajustes primero."); return; }
    state.chatScenario = scenario;
    state.chatMessages = [{ role: 'ai', text: "Sveiki! Vai mēs varam sākt? (¡Hola! ¿Podemos empezar?)" }];
    updateUI();
    speakLatvian("Sveiki! Vai mēs varam sākt?");
}

// --- Lesson Logic ---
window.startLesson = function(levelId, isUnlocked) {
    if (!isUnlocked) return;
    const level = levels.find(l => l.id === levelId);
    state.currentLevelId = levelId;
    state.questions = generateQuestions(level.data, 5);
    setupQuestion(0);
}

window.startMistakesPractice = function() {
    if (state.mistakes.length === 0) return;
    state.currentLevelId = 'mistakes';
    state.questions = generateQuestions(state.mistakes, 10);
    setupQuestion(0);
}

window.startGeneralReview = function() {
    if (state.completedLevels.length === 0) {
        alert("Primero completa algunos niveles en la ruta principal."); return;
    }
    let allData = [];
    state.completedLevels.forEach(lvlId => {
        const level = levels.find(l => l.id === lvlId);
        if (level) allData = allData.concat(level.data);
    });
    // Remove duplicates
    allData = allData.filter((v,i,a)=>a.findIndex(v2=>(v2.lv===v.lv))===i);
    
    state.currentLevelId = 'review';
    state.questions = generateQuestions(allData, 10);
    setupQuestion(0);
}

function setupQuestion(idx) {
    state.currentQuestionIndex = idx; state.hearts = 5; state.screen = 'lesson';
    state.isChecking = false; state.feedback = null; state.aiExplanation = null;
    const currentQ = state.questions[idx];
    if (currentQ.type === 'multiple-choice') state.selectedOptionIndex = null;
    else if (currentQ.type === 'match-pairs') state.matchState = { selectedId: null, matchedIds: [] };
    else if (currentQ.type === 'construct-sentence') state.sentenceState = { constructed: [], pool: [...currentQ.words] };
    updateUI();
    if (currentQ.promptLang === 'lv' && currentQ.prompt) speakLatvian(currentQ.prompt);
}

window.quitLesson = function() {
    state.screen = state.currentLevelId === 'mistakes' || state.currentLevelId === 'review' ? 'practice' : 'map';
    updateUI();
}

// --- Modality Interactions ---
window.selectOption = function(idx) { if (state.isChecking) return; state.selectedOptionIndex = idx; updateUI(); }
window.addSentenceWord = function(idx) { const w = state.sentenceState.pool.splice(idx, 1)[0]; state.sentenceState.constructed.push(w); updateUI(); }
window.removeSentenceWord = function(idx) { const w = state.sentenceState.constructed.splice(idx, 1)[0]; state.sentenceState.pool.push(w); updateUI(); }

window.selectMatchPair = function(id) {
    if (state.isChecking) return;
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!state.matchState.selectedId) { state.matchState.selectedId = id; } 
    else {
        const first = currentQ.pairs.find(p => p.id === state.matchState.selectedId);
        const second = currentQ.pairs.find(p => p.id === id);
        if (first.id !== second.id && first.pairId === second.pairId) {
            state.matchState.matchedIds.push(first.id, second.id);
            state.matchState.selectedId = null;
            speakLatvian(first.lang === 'lv' ? first.text : second.text);
            if (state.matchState.matchedIds.length === currentQ.pairs.length) handleBottomBtnClick();
        } else if (first.id === second.id) {
            state.matchState.selectedId = null;
        } else {
            state.hearts--;
            const c = document.getElementById('options-container');
            if(c) { c.classList.add('shake'); setTimeout(()=>c.classList.remove('shake'), 400); }
            state.matchState.selectedId = null;
            addMistake(currentQ.originalItem);
            if (state.hearts <= 0) { alert("Te has quedado sin vidas."); quitLesson(); return; }
        }
    }
    updateUI();
}

// --- Verification & Progress ---
function addMistake(item) {
    if (item && !state.mistakes.find(m => m.lv === item.lv)) { state.mistakes.push(item); saveProgress(); }
}
function removeMistake(item) {
    if (item && state.currentLevelId === 'mistakes') { state.mistakes = state.mistakes.filter(m => m.lv !== item.lv); saveProgress(); }
}

window.handleBottomBtnClick = function() {
    if (state.isChecking) {
        if (state.currentQuestionIndex >= state.questions.length - 1) {
            state.xp += 10;
            if (typeof state.currentLevelId === 'number' && !state.completedLevels.includes(state.currentLevelId)) {
                state.completedLevels.push(state.currentLevelId);
            }
            saveProgress();
            quitLesson();
        } else {
            setupQuestion(state.currentQuestionIndex + 1);
        }
    } else {
        const currentQ = state.questions[state.currentQuestionIndex];
        let isCorrect = false;
        if (currentQ.type === 'multiple-choice') isCorrect = currentQ.options[state.selectedOptionIndex].isCorrect;
        else if (currentQ.type === 'match-pairs') isCorrect = true;
        else if (currentQ.type === 'construct-sentence') isCorrect = (state.sentenceState.constructed.join(' ') === currentQ.correctAnswer);
        
        state.isChecking = true;
        state.feedback = isCorrect ? 'correct' : 'incorrect';
        
        if (!isCorrect) {
            state.hearts--;
            const c = document.getElementById('options-container');
            if(c) c.classList.add('shake');
            addMistake(currentQ.originalItem);
            if (state.hearts <= 0) { alert("Te has quedado sin vidas."); quitLesson(); return; }
        } else {
            removeMistake(currentQ.originalItem);
            if (currentQ.type === 'construct-sentence') speakLatvian(currentQ.correctAnswer);
        }
        updateUI();
    }
}

// Initial
updateUI();
