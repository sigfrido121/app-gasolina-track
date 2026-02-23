# Arquitectura del Sistema

## 1. Diagrama de Alto Nivel

```mermaid
graph TD
    User[Usuario (Móvil/Web)] -->|HTTPS| Frontend[Next.js App (Vercel/Local)]
    
    subgraph "Frontend Layer (Client)"
        UI[Componentes UI (React/Tailwind)]
        Camera[Módulo de Cámara/Upload]
        Mic[Grabadora de Voz]
    end
    
    subgraph "Backend Layer (Server Actions)"
        Router[App Router API]
        Controller[Controladores de Lógica]
        
        subgraph "AI Services Adapter"
            GeminiClient[Google Gemini Client]
        end
        
        subgraph "Data Layer"
            Mongoose[Mongoose ORM]
        end
    end
    
    subgraph "External Services"
        GeminiAPI[Google Gemini API (Vision/Pro)]
        MongoDB[MongoDB Container/Atlas]
        CloudStorage[File Storage (Local/S3/Cloudinary)]
    end

    Frontend --> Router
    Router --> Controller
    Controller --> GeminiClient
    GeminiClient --> GeminiAPI
    Controller --> Mongoose
    Mongoose --> MongoDB
```

## 2. Tecnologías y Librerías Clave

### Frontend
-   **Framework**: Next.js 14+ (App Router).
-   **Estilos**: Tailwind CSS + `clsx` + `tailwind-merge`.
-   **Componentes**: Shadcn/UI (Radix UI headless + Tailwind).
-   **Iconos**: Lucide React.
-   **Estado**: React Hooks (useState, useFormStatus) o Zustand (si crece la complejidad).
-   **Gráficos**: Recharts o Chart.js.

### Backend / API
-   **Runtime**: Node.js (vía Next.js Server Actions).
-   **Validación**: Zod (indispensable para validar outputs de la IA y inputs de usuario).
-   **DB Client**: Mongoose.

### IA / Procesamiento
-   **SDK**: `@google/generative-ai`.
-   **Prompt Engineering**: Uso de "System Instructions" para forzar salidas JSON estrictas desde Gemini.

## 3. Flujo de Datos "Smart Entry"

1.  **Captura**: El usuario sube una imagen (`Blob`).
2.  **Conversión**: El servidor convierte `Blob` a base64.
3.  **Prompting**: Se envía a Gemini con un prompt específico: *"Analiza esta imagen. Extrae el odómetro y el importe del surtidor. Responde SOLO en JSON formato..."*.
4.  **Parsing**: Se recibe el string JSON, se limpia y se valida con Zod.
5.  **Confirmación**: Se muestra al usuario los datos extraídos en un formulario pre-rellenado para que confirme o corrija.
6.  **Persistencia**: Se guarda en MongoDB.

## 4. Estructura de Directorios

```
/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes (si son necesarias)
│   │   ├── (dashboard)/     # Layout autenticado
│   │   │   ├── page.tsx     # Dashboard principal
│   │   │   ├── add/         # Página de añadir gasto
│   │   │   └── history/     # Historial
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React Components
│   │   ├── ui/              # Shadcn components (Button, Card...)
│   │   ├── forms/           # Formularios complejos
│   │   └── charts/          # Gráficos
│   ├── lib/                 # Utilidades
│   │   ├── db.ts            # Conexión MongoDB
│   │   ├── gemini.ts        # Cliente IA
│   │   └── utils.ts         # Helpers
│   ├── models/              # Mongoose Schemas (Refuel, User)
│   └── actions/             # Server Actions (backend logic)
├── public/
├── docs/                    # Esta documentación
└── package.json
```
