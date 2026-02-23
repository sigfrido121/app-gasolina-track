# Plan de Implementación (Paso a Paso)

Este documento guía la construcción de la aplicación de principio a fin.

## Fase 1: Configuración del Entorno y Base de Datos
1.  **Inicializar Proyecto**: Crear Next.js app con TypeScript, Tailwind, ESLint.
    ```bash
    npx create-next-app@latest . --typescript --tailwind --eslint
    ```
2.  **Configuración UI**: Instalar `lucide-react`, `clsx`, `tailwind-merge`. Instalar componentes base de Shadcn (Button, Input, Card, Label).
3.  **Base de Datos**:
    -   Configurar conexión Mongoose en `src/lib/db.ts`.
    -   Definir Schema `Refuel` en `src/models/Refuel.ts`.
    -   Verificar conexión contra el contenedor local de MongoDB.

## Fase 2: Funcionalidad Core (CRUD Manual)
1.  **Server Actions**: Crear `addRefuel` y `getRefuels` en `src/actions/refuel-actions.ts`.
2.  **Formulario Manual**: Crear página `/add` con un formulario que acepte: Precio, Litros, Km.
3.  **Listado**: Crear página `/history` o dashboard principal que muestre tarjetas con los últimos repostajes.
4.  **Validación**: Usar `zod` para validar que los números sean positivos y los km mayores al registro anterior (opcional pero recomendado).

## Fase 3: Integración de IA (Gemini)
1.  **Setup API**: Obtener API Key de Google AI Studio y configurar variable de entorno `GEMINI_API_KEY`.
2.  **Cliente IA**: Crear `src/lib/gemini.ts` para inicializar el modelo `gemini-1.5-flash`.
3.  **Función de Análisis**: Crear función `analyzeImage(base64Image)` que retorne un JSON con `{ totalAmount, liters, odometer }`.
4.  **Frontend de Carga**: Añadir input `type="file"` que acepte cámara en móviles.
5.  **Integración**: Al subir foto -> Server Action -> Gemini -> Rellenar Formulario Manual automáticamente.

## Fase 4: Dashboard y Ciencia de Datos
1.  **Cálculos**: Crear utilidades para calcular:
    -   Consumo (L/100km) entre dos repostajes consecutivos: `(Litros / (Km_Actual - Km_Anterior)) * 100`.
2.  **Gráficos**: Integrar una librería de gráficos para mostrar la tendencia de precio/litro y consumo.
3.  **Estimador**: Crear un pequeño formulario "Calculadora de Viaje" que tome el promedio de consumo histórico y lo multiplique por la distancia introducida.

## Fase 5: Pulido y UX
1.  **Feedback Visual**: Spinners de carga mientras la IA "piensa".
2.  **Manejo de Errores**: ¿Qué pasa si la foto está borrosa? (Mensaje amigable).
3.  **Estilos Premium**: Aplicar gradientes sutiles, bordes redondeados, modo oscuro.

## Fase 6: Mantenimiento (Bonus)
1.  Añadir campo en la BD para "Configuración de Mantenimiento" (ej. "Avisar cada 15k km").
2.  Mostrar alerta en el Dashboard si `Km_Actual > Ultimo_Mantenimiento + 15000`.
