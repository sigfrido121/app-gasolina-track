# Módulo 1: Fundamentos y Base de Datos

Bienvenido al primer módulo de aprendizaje. Aquí estableceremos los cimientos de tu aplicación **GasTrack AI**.
No solo copiaremos código, entenderemos *por qué* lo escribimos así.

## 1. Inicialización y Entorno (Conceptos)

En el desarrollo moderno con React, usamos frameworks como **Next.js** porque nos solucionan problemas complejos:
-   **Routing**: Sistema de archivos (`app/page.tsx` es tu home).
-   **Performance**: Minimiza el JavaScript que se envía al navegador.
-   **Fullstack**: Nos permite escribir backend (Server Actions) junto al frontend.

### Tu Tarea (Manual)
Ejecuta esto en tu terminal para crear el esqueleto (si no lo has hecho ya):
```bash
npx create-next-app@latest . --typescript --tailwind --eslint
# Te preguntará cosas. Dile "Yes" a todo, especialmente "App Router".
```

Luego, instala las herramientas para conectar con la Base de Datos y usar utilidades de estilos:
```bash
npm install mongoose clsx tailwind-merge lucide-react zod
```

---

## 2. La Capa de Datos (MongoDB + Mongoose)

Vamos a configurar la conexión a tu base de datos.
En desarrollo (`npm run dev`), Next.js recarga el servidor constantemente ("Hot Module Replacement"). Si abrimos una conexión nueva cada vez, saturaremos la base de datos.

### Archivo: `src/lib/db.ts`

**Explicación del Patrón Singleton**:
Guardamos la conexión en una variable global (`global.mongoose`) para que sobreviva a las recargas del servidor en desarrollo.

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable MONGODB_URI en tu archivo .env.local');
}

/**
 * Interface para cachear la conexión en el objeto global
 * Esto previene que creemos múltiples conexiones en modo desarrollo
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extendemos el tipo global de NodeJS para incluir nuestra propiedad mongoose
declare global {
  var mongoose: MongooseCache;
}

// Inicializamos la variable cacheada si no existe
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // No encolar comandos si no estamos conectados
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

---

## 3. El Modelo de Datos (Schema)

Definiremos qué forma tiene un "Repostaje" (Refuel). Mongoose nos ayuda a imponer estructura sobre una base de datos flexible como MongoDB.

### Archivo: `src/models/Refuel.ts`

**Puntos Clave**:
-   Usamos `models.Refuel || model('Refuel', ...)` para evitar el error "OverwriteModelError" al recargar en desarrollo.
-   Definimos tipos estrictos con TypeScript.

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Definimos la interfaz de TypeScript (para usarlo en nuestro código)
export interface IRefuel extends Document {
  date: Date;
  amount: number;       // Precio total pagado (€)
  liters: number;       // Litros repostados
  odometer: number;     // Kilometraje actual del coche
  pricePerLiter: number;// Precio por litro (calculado o extraído)
  evidenceUrl?: string; // URL de la foto (opcional)
  createdAt: Date;
  updatedAt: Date;
}

// 2. Definimos el Schema de Mongoose (para la base de datos)
const RefuelSchema = new Schema<IRefuel>(
  {
    date: { 
      type: Date, 
      required: true, 
      default: Date.now 
    },
    amount: { 
      type: Number, 
      required: [true, 'El importe es obligatorio'], 
      min: 0 
    },
    liters: { 
      type: Number, 
      required: [true, 'Los litros son obligatorios'], 
      min: 0 
    },
    odometer: { 
      type: Number, 
      required: [true, 'El kilometraje es obligatorio'], 
      min: 0 
    },
    pricePerLiter: { 
      type: Number, 
      required: true 
    },
    evidenceUrl: { 
      type: String 
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

// 3. Exportamos el modelo, pero comprobamos si ya existe primero
const Refuel: Model<IRefuel> = mongoose.models.Refuel || mongoose.model<IRefuel>('Refuel', RefuelSchema);

export default Refuel;
```

---

## 4. Configuración del Entorno

Debes crear un archivo `.env.local` en la raíz de tu proyecto. **NUNCA** subas esto a GitHub si tienes datos reales.

```env
# Ejemplo para conexión local al contenedor que creaste
MONGODB_URI=mongodb://admin:tupassword@localhost:27017/gas_track?authSource=admin
```
*Asegúrate de cambiar `tupassword` y el puerto si es diferente.*

---
¡Felicidades! Has completado el Módulo 1.
Ahora tienes una aplicación Next.js vacía pero con un motor de base de datos potente y configurado profesionalmente.

**¿Qué sigue?**
En el próximo módulo crearemos la lógica para insertar datos (Server Actions) y diseñaremos el formulario.
