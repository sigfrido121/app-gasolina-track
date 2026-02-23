# Prompt Maestro para Generación de Código

Este documento contiene el contexto completo que debes proporcionar a una IA (vía Google AI Studio, ChatGPT, Claude, etc.) para que genere el código de la aplicación **GasTrack AI** siguiendo nuestras especificaciones.

---

## Instrucciones para el Prompting

**Copie y pegue todo el contenido a continuación en su chat con la IA:**

***

### Rol
Actúa como un Ingeniero de Software Senior experto en Next.js (App Router), Tailwind CSS, Node.js y desarrollo de aplicaciones integradas con IA.

### Objetivo
Tu tarea es construir una aplicación web llamada **"consumo combustible"**. 
El objetivo es llevar el control de gastos de gasolina y predecir costes de viaje.
Ya se han definido los requisitos y la arquitectura. Debes seguir los documentos proporcionados a continuación estrictamente.

### Documentación del Proyecto

#### 1. Visión y Stack (Del Project Charter)
- **App**: Control de gastos vehiculares con "Smart Capture" (Foto/Voz).
- **Stack**: Next.js 14+, Tailwind, Server Actions, Mongoose, Google Gemini API.
- **Diseño**: Premium, moderno, dark mode por defecto.

#### 2. Requisitos Funcionales (Del PRD)
- Ingreso de repostajes manual, por foto (OCR con IA), o voz.
- Dashboard con gráficos de consumo.
- Calculadora predictiva de coste de viaje.
- Alertas de mantenimiento basadas en kilometraje.

#### 3. Arquitectura Técnica
- **Frontend**: Componentes reutilizables, Shadcn/UI.
- **Backend API**: Server Actions (`src/actions`).
- **Base de Datos**: MongoDB. Esquema `Refuel` con campos: `date`, `amount`, `liters`, `odometer`, `price_per_liter`, `evidence_url`.
- **IA**: Integración con Google Gemini Pro Vision para analizar imágenes de tickets/surtidores y odómetros.

### Tarea Inicial
Por favor, genera la estructura inicial del proyecto y los siguientes archivos clave:
1. `src/lib/db.ts`: Conexión robusta a MongoDB (cacheada para HMR).
2. `src/models/Refuel.ts`: Esquema Mongoose.
3. `src/lib/gemini.ts`: Cliente para llamar a la API de Gemini.
4. `src/components/forms/RefuelForm.tsx`: Formulario que acepta fichero (foto) y rellena los campos automáticamente llamando a un Server Action de análisis.

***
