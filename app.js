// ---- ELEMENTOS DOM ----
const statusBadge = document.getElementById("status");
const modeText = document.getElementById("mode");
const heardDiv = document.getElementById("heard");
const resultDiv = document.getElementById("result");
const hintDiv = document.getElementById("hint");
const historyList = document.getElementById("history");

// ---- CONFIGURACIÓN ----
let OPENAI_API_KEY = null; // ahora dinámica
const SUSPEND_TIME = 5000;
let suspended = false;
let silenceTimer;

// ---- SPEECH RECOGNITION ----
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "es-MX";
recognition.continuous = true;
recognition.interimResults = false;

// =====================================================
// 🔑 CARGAR API KEY SIN BLOQUEAR EL MICROFONO
// =====================================================
async function loadApiKey() {
  try {
    const response = await fetch("https://698df129aded595c253097c5.mockapi.io/APIKEY");
    const data = await response.json();

    if (data.length > 0 && data[0].APIKEY) {
      OPENAI_API_KEY = data[0].APIKEY;
      console.log("API KEY cargada");
    } else {
      console.error("No se encontró APIKEY en MockAPI");
    }

  } catch (error) {
    console.error("Error cargando API KEY:", error);
    hintDiv.textContent = "No se pudo cargar la API KEY";
  }
}

// ---- INICIO AUTOMÁTICO ----
window.onload = () => {
  startRecognition(); // iniciar micro inmediato
  loadApiKey();       // cargar key en paralelo
};

// ---- FUNCIONES ----
function startRecognition() {
  try {
    recognition.start();
    resetSilenceTimer();
  } catch (e) {
    console.warn("Reconocimiento ya activo");
  }
}

// ---- EVENTO PRINCIPAL ----
recognition.onresult = async (event) => {

  const text = event.results[event.results.length - 1][0].transcript
    .trim()
    .toLowerCase();

  heardDiv.textContent = text;
  resetSilenceTimer();

  // Si está suspendido
  if (suspended) {
    if (text.includes("alexa")) {
      suspended = false;
      modeText.textContent = "Modo activo";
      statusBadge.textContent = "Escuchando...";
      statusBadge.className = "badge bg-success";
      hintDiv.textContent = "";
    }
    return;
  }

  // Si aún no hay API key
  if (!OPENAI_API_KEY) {
    resultDiv.textContent = "Cargando IA...";
    return;
  }

  const order = await analyzeOrder(text);
  resultDiv.textContent = order;
  addToHistory(text, order);
};

// Reinicio automático
recognition.onerror = () => startRecognition();
recognition.onend = () => startRecognition();

// ---- MODO SUSPENDIDO ----
function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    suspended = true;
    modeText.textContent = "Modo suspendido";
    statusBadge.textContent = "Suspendido";
    statusBadge.className = "badge bg-secondary";
    hintDiv.textContent = "Di 'Alexa' para reactivar el modo activo.";
  }, SUSPEND_TIME);
}

// ---- HISTORIAL ----
function addToHistory(text, order = null) {
  const li = document.createElement("li");
  li.className = "list-group-item bg-dark text-light";

  if (order) {
    li.innerHTML = `<strong>Usuario:</strong> "${text}"<br><strong>→ Orden:</strong> ${order}`;
  } else {
    li.innerHTML = `<strong>Usuario:</strong> "${text}"`;
  }

  historyList.appendChild(li);
}

// =====================================================
// 🧠 OPENAI
// =====================================================
async function analyzeOrder(text) {

  const prompt = `
Clasifica la siguiente orden de voz.
Responde SOLO exactamente una de estas opciones:

avanzar
retroceder
detener
vuelta derecha
vuelta izquierda
90° derecha
90° izquierda
360° derecha
360° izquierda

Si no coincide claramente, responde:
Orden no reconocida

Orden: "${text}"
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 10
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error(error);
    return "Error al interpretar la orden";
  }
}

