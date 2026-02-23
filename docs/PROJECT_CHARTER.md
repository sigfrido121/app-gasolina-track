# Project Charter: AutoGasto AI (GasTrack)

## 1. Visión del Proyecto
Crear una aplicación web progresiva (PWA) inteligente que elimine la fricción del seguimiento de gastos vehiculares mediante el uso de Inteligencia Artificial Multimodal (Texto, Visión, Audio). El objetivo no es solo registrar datos, sino empoderar al usuario con predicciones de costes precisas para futuros viajes y alertas preventivas de mantenimiento.

## 2. Enfoque Educativo (El "Por qué" de las decisiones)
Como ingenieros de software, buscamos el equilibrio entre **Innovación**, **Usabilidad** y **Mantenibilidad**.

-   **Frontend Moderno**: Usaremos **Next.js** con **Tailwind CSS**. *Lección*: Frameworks como Next.js ofrecen renderizado híbrido y optimización automática, crucial para apps que deben sentirse rápidas como una nativa.
-   **IA Integrada**: En lugar de reglas fijas ("si dice 'gasolina', guarda esto"), usaremos Modelos de Lenguaje (LLMs) como Gemini para interpretar la "intención" del usuario y extraer datos estructurados de fuentes no estructuradas (fotos, voz). *Lección*: El futuro del software es probabilístico y adaptable.
-   **Base de Datos NoSQL**: Usaremos **MongoDB**. *Lección*: La flexibilidad de los esquemas JSON encaja perfectamente con la naturaleza variada de los datos de entrada (metadatos de fotos, textos libres, etc.).

## 3. Propuesta de Valor Mejorada
En lugar de solo un formulario manual, proponemos **"Smart Capture"**:
1.  **Modo "Foto Rápida"**: Llegas a la gasolinera, tomas foto al surtidor (precio/litros) y al tablero (km). La app hace el resto.
2.  **Modo "Copiloto de Voz"**: Mientras conduces, dices "He echado 40 euros y el coche marca 150000 km". La app lo registra.
3.  **Predicción de Viajes**: "¿Cuánto me costará ir a Madrid?" -> La app analiza tu histórico de consumo real y el precio actual del combustible para darte una estimación precisa.

## 4. Stack Tecnológico
-   **Core**: Next.js 14+ (App Router).
-   **UI**: Tailwind CSS + Shadcn/UI (Diseño premium y accesible).
-   **Backend**: Server Actions de Next.js.
-   **Database**: MongoDB (vía Mongoose).
-   **AI**: Google Gemini API (Vision para fotos, Pro para texto/audio).
-   **Images**: Cloudinary o almacenamiento local (empezaremos local/base64 para simplificar desarrollo).

---
Este documento sirve como la "Estrella del Norte" para el desarrollo del proyecto.
