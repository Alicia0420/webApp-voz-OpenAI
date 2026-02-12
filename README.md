# 🎙️ Web App de Control por Voz con OpenAI

Aplicación web que reconoce comandos por voz en tiempo real y los interpreta mediante inteligencia artificial usando la API de OpenAI.

La app escucha automáticamente al cargarse la página, entra en modo suspendido si no detecta voz durante unos segundos y se reactiva al escuchar la palabra clave **"Alexa"**.

---

## 🚀 Funcionalidades

✅ Escucha automática al cargar la página  
✅ Suspensión automática por silencio  
✅ Reactivación por palabra clave ("Alexa")  
✅ Reconocimiento de voz en español (es-MX)  
✅ Interpretación inteligente de órdenes mediante OpenAI  
✅ Historial de texto escuchado e interpretación  
✅ Interfaz moderna con Bootstrap  
✅ Manejo de estados (activo / suspendido)

---

## 🧠 Órdenes que puede reconocer

La IA responde únicamente con una de estas opciones:

- avanzar  
- retroceder  
- detener  
- vuelta derecha  
- vuelta izquierda  
- 90° derecha  
- 90° izquierda  
- 360° derecha  
- 360° izquierda  

Si no detecta una orden válida:

Orden no reconocida

---

## 🧩 Tecnologías utilizadas

- HTML5  
- CSS3  
- Bootstrap 5  
- JavaScript (ES6+)  
- Async / Await  
- Fetch API  
- Web Speech API (SpeechRecognition)  
- OpenAI API  

---

## 📁 Estructura del proyecto

/voice-control
│
├── index.html
├── styles.css
├── app.js
└── README.md

---

## ⚙️ Funcionamiento general

1. La página carga y activa el reconocimiento de voz.
2. Si no detecta voz durante un tiempo definido → modo suspendido.
3. Si el usuario dice **"Alexa"** → modo activo nuevamente.
4. El texto reconocido se envía a OpenAI.
5. La IA clasifica la orden.
6. Se muestra:
   - texto escuchado
   - interpretación
   - historial

---

## 🔑 Configuración de la API Key

⚠️ Nunca coloques tu API Key directamente en el código del frontend en producción.

Opciones recomendadas:

- Backend propio (Node.js, PHP, etc.)
- Variables de entorno
- Proxy seguro para llamadas a OpenAI
- Servicio de gestión de secretos

Si una clave fue expuesta, debes revocarla inmediatamente desde el panel de OpenAI.

--
## 👩‍💻 Autor

Proyecto desarrollado como práctica de interacción humano-computadora y reconocimiento de voz con inteligencia artificial.

---

## 📜 Licencia

Proyecto de uso educativo y experimental.