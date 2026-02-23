# Módulo 2: Server Actions y Lógica de Negocio

En este módulo construiremos el "cerebro" de la aplicación.
Next.js introdujo los **Server Actions**, que nos permiten ejecutar funciones en el servidor (backend) directamente desde nuestros componentes (frontend), sin tener que crear manualmente endpoints de API (`/api/guardar-datos`).

## 1. Validación de Datos (Zod)

Antes de guardar nada en la base de datos, debemos asegurarnos de que los datos son correctos. "Never trust user input" (Nunca confíes en lo que escribe el usuario).

Usaremos **Zod** para crear un esquema de validación.

### Archivo: `src/lib/validations.ts`

```typescript
import { z } from 'zod';

export const RefuelSchema = z.object({
  amount: z.coerce.number().positive("El importe debe ser mayor a 0"),
  liters: z.coerce.number().positive("Los litros deben ser mayor a 0"),
  odometer: z.coerce.number().int().positive("El kilometraje debe ser positivo"),
  date: z.coerce.date().default(() => new Date()),
});

// Tipo inferido automáticamente de Zod
export type RefuelInput = z.infer<typeof RefuelSchema>;
```
*Nota: `z.coerce.number()` es genial porque transforma strings ("50") en números (50) automáticamente.*

---

## 2. Server Action (Backend Logic)

Crearemos una función asíncrona marcada con `'use server'`. Esto le dice a Next.js que esta función nunca debe enviarse al navegador; solo se ejecuta en el servidor.

### Archivo: `src/actions/refuel-actions.ts`

**Qué aprenderás aquí**:
-   Cómo conectar a la BD bajo demanda.
-   Cómo validar datos con Zod.
-   Cómo manejar errores y devolverlos al frontend.
-   `revalidatePath`: Cómo decirle a Next.js que "refresque" la lista de datos.

```typescript
'use server';

import connectDB from '@/lib/db';
import Refuel from '@/models/Refuel';
import { RefuelSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

// Definimos un tipo para la respuesta de nuestra acción
type ActionResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>; // Errores de validación de Zod
};

export async function addRefuel(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Extraer datos del FormData (nativo de Web API)
    const rawData = {
      amount: formData.get('amount'),
      liters: formData.get('liters'),
      odometer: formData.get('odometer'),
      date: formData.get('date') || new Date(),
    };

    // 2. Validar con Zod
    const validatedFields = RefuelSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Error en los datos enviados',
      };
    }

    const data = validatedFields.data;

    // 3. Cálculos derivados
    // Calculamos precio por litro automáticamente
    const pricePerLiter = data.amount / data.liters;

    // 4. Conectar a BD
    await connectDB();

    // 5. Guardar en MongoDB
    await Refuel.create({
      ...data,
      pricePerLiter, // Guardamos el dato calculado
    });

    // 6. Refrescar caché
    // Esto es magia: actualiza la página '/dashboard' y '/history' con los nuevos datos
    revalidatePath('/dashboard');
    revalidatePath('/history');

    return { success: true, message: 'Repostaje guardado correctamente' };

  } catch (error) {
    console.error('Error saving refuel:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}
```

---

## 3. Consultando Datos (Server Component)

También necesitamos una función para leer los datos. Como usaremos Componentes de Servidor, esta función puede llamar a la BD directamente.

### Añadir al final de `src/actions/refuel-actions.ts`

```typescript
export async function getRefuels() {
  try {
    await connectDB();
    // `.lean()` devuelve objetos JS puros en lugar de documentos Mongoose (más rápido)
    // Ordenamos por fecha descendente (lo más nuevo primero)
    const refuels = await Refuel.find().sort({ date: -1 }).lean();
    
    // Necesitamos serializar las fechas y los IDs para pasarlos a componentes cliente si fuera necesario
    // Pero en Server Components puros, podemos usarlos tal cual.
    return { success: true, data: JSON.parse(JSON.stringify(refuels)) };
  } catch (error) {
    console.error('Error fetching refuels:', error);
    return { success: false, data: [] };
  }
}
```

---
¡Módulo 2 Completado!
Ahora tienes un backend funcional. Tienes una forma segura de escribir datos (`addRefuel`) y una forma de leerlos (`getRefuels`).

**¿Qué falta?** La Interfaz de Usuario (UI). En el siguiente módulo construiremos los formularios y le daremos estilo visual.
