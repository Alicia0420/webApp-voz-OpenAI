// =====================================================
// 🟢 PANTALLA DE BIENVENIDA
// =====================================================
const modal = document.getElementById("welcomeModal");
const startBtn = document.getElementById("startSystem");

startBtn.addEventListener("click", () => {
  modal.style.display = "none";
  startRecognition();
  loadApiKey();
});

// =====================================================
// ---- ELEMENTOS DOM ----
// =====================================================
const statusBadge = document.getElementById("status");
const modeText = document.getElementById("mode");
const heardDiv = document.getElementById("heard");
const resultDiv = document.getElementById("result");
const hintDiv = document.getElementById("hint");
const historyList = document.getElementById("history");
const listeningRing = document.getElementById("listeningRing");

// =====================================================
// ---- CONFIGURACIÓN ----
// =====================================================
let OPENAI_API_KEY = null;
const SUSPEND_TIME = 15000;
let suspended = false;
let silenceTimer;

// =====================================================
// ---- SPEECH RECOGNITION ----
// =====================================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "es-MX";
recognition.continuous = true;
recognition.interimResults = false;

// =====================================================
// 🔑 CARGAR API KEY (TU FUNCIÓN ORIGINAL)
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
    hintDiv.textContent = "No se pudo cargar la IA.";
  }
}

// =====================================================
// 🎤 INICIAR ESCUCHA (TU FUNCIÓN ORIGINAL)
// =====================================================
function startRecognition() {

  listeningRing.classList.remove("listening-off");
  listeningRing.classList.add("listening-active");

  try {
    recognition.start();
    if (!suspended) resetSilenceTimer();
  } catch (e) {
    console.warn("Reconocimiento ya activo");
  }
}

// =====================================================
// 🎤 EVENTO PRINCIPAL (TU LÓGICA ORIGINAL)
// =====================================================
recognition.onresult = async (event) => {

  const text = event.results[event.results.length - 1][0].transcript
    .trim()
    .toLowerCase();

  // 😴 SI ESTÁ SUSPENDIDO
  if (suspended) {

    if (text.includes("lenny")) {

      heardDiv.textContent = text;

      suspended = false;

      modeText.textContent = "Modo activo (Realiza la orden de movimiento)";
      statusBadge.textContent = "Micrófono activo";
      statusBadge.className = "badge bg-success";
      hintDiv.textContent = "";

      listeningRing.classList.remove("listening-off");
      listeningRing.classList.add("listening-active");

      resetSilenceTimer();
    }

    return;
  }

  // 🎤 MODO ACTIVO NORMAL
  heardDiv.textContent = text;
  resetSilenceTimer();

  if (!OPENAI_API_KEY) {
    resultDiv.textContent = "Cargando IA...";
    return;
  }

  const order = await analyzeOrder(text);
  resultDiv.textContent = order;
  addToHistory(text, order);
};

// Reinicio automático (igual que tú)
recognition.onerror = () => startRecognition();
recognition.onend = () => startRecognition();

// =====================================================
// 😴 TEMPORIZADOR DE SILENCIO (TU FUNCIÓN ORIGINAL)
// =====================================================
function resetSilenceTimer() {

  clearTimeout(silenceTimer);

  silenceTimer = setTimeout(() => {

    suspended = true;

    modeText.textContent = "Modo suspendido (Di Lenny para dar una orden)";
    statusBadge.textContent = "Micrófono en pausa";
    statusBadge.className = "badge bg-secondary";
    hintDiv.textContent = "Di 'Lenny' para reactivar el sistema.";

    listeningRing.classList.remove("listening-active");
    listeningRing.classList.add("listening-off");

  }, SUSPEND_TIME);
}

// =====================================================
// 📝 HISTORIAL (TU FUNCIÓN ORIGINAL)
// =====================================================
function addToHistory(text, order = null) {

  const li = document.createElement("li");
  li.className = "list-group-item bg-dark text-light";

  if (order) {
    li.innerHTML = `<strong>Usuario:</strong> "${text}"<br><strong>→ Acción:</strong> ${order}`;
  } else {
    li.innerHTML = `<strong>Usuario:</strong> "${text}"`;
  }

  historyList.prepend(li);

  if (historyList.scrollTop < 40) {
    historyList.scrollTop = 0;
  }
}

// =====================================================
// 🧠 OPENAI — TU PROMPT ORIGINAL COMPLETO
// =====================================================
async function analyzeOrder(text) {

  const prompt = `
Eres un clasificador estricto de comandos de movimiento.

Tu única tarea es identificar la intención DIRECTA del usuario.
NO interpretes emociones, contexto ni supuestos.

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
Orden no reconocida

REGLAS OBLIGATORIAS:

1. Si el usuario da un comando directo, respétalo sin modificarlo.
   Ejemplo:
   "avanza" → avanzar
   "ve hacia adelante" → avanzar
   "retrocede" → retroceder

2. SOLO invierte la acción si hay negación explícita o contradicción clara.
   Ejemplos válidos de inversión:
   "haz lo contrario de avanzar"
   "no avances"
   "en vez de avanzar, retrocede"

3. Si NO hay palabras de negación (no, contrario, opuesto, inverso, etc),
   NO cambies la dirección.

4. Frases equivalentes:
   adelante = avanzar
   atrás = retroceder
   gira derecha = vuelta derecha
   gira izquierda = vuelta izquierda

5. Si no está claro → Orden no reconocida

Responde SOLO la palabra final.
Sin explicación.

Orden del usuario: "${text}"
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


