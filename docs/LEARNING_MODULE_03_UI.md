# Módulo 3: Interfaz de Usuario (UI) y Formularios

Ahora que tenemos la base de datos y la lógica, necesitamos que el usuario pueda interactuar con ellas. Construiremos un formulario que invoque a nuestro Server Action.

## 1. Componentes "Client Side"

En Next.js (App Router), los componentes son de Servidor por defecto. Sin embargo, para usar interactividad (botones, inputs que se escriben, hooks como `useState` o `useFormStatus`), necesitamos convertir el componente a "Cliente" usando `'use client'`.

### Archivo: `src/components/forms/RefuelForm.tsx`

**Conceptos Clave**:
-   `useFormStatus`: Un hook genial de React que nos dice si el formulario se está enviando (pending), para deshabilitar el botón y evitar doble clic.
-   Componentización: Usaremos clases de Tailwind para dar estilo rápido.

```typescript
'use client';

import { addRefuel } from '@/actions/refuel-actions';
import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react'; // Icono de carga

// Pequeño sub-componente para el botón de enviar
function SubmitButton() {
  // useFormStatus debe usarse dentro de un componente que esté DENTRO del <form>
  // o podemos usarlo aquí si este componente se usa dentro del form.
  // Pero Next.js ahora permite importarlo de 'react-dom'.
  
  // Nota para aprendizaje: En versiones recientes de React/Next, usamos useFormStatus
  // import { useFormStatus } from 'react-dom';
  // const { pending } = useFormStatus();
  
  // Por simplicidad en este tutorial, mostraremos un estado local abajo,
  // pero lo ideal es useFormStatus.
  return <button type="submit">Guardar</button>; 
}

export default function RefuelForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string>('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setMessage('');

    try {
      // Invocamos el Server Action directamente
      const result = await addRefuel(formData);

      if (result.success) {
        setMessage('✅ ¡Guardado con éxito!');
        formRef.current?.reset(); // Limpia el formulario
      } else {
        setMessage(`❌ Error: ${result.message}`);
        // Si hubiera errores de validación detallados, aquí los mostraríamos
      }
    } catch (e) {
      setMessage('❌ Error de conexión');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">
        Nuevo Repostaje
      </h2>

      <form 
        ref={formRef} 
        action={handleSubmit} 
        className="space-y-4"
      >
        {/* Campo: Importe */}
        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-600 dark:text-zinc-400">
            Importe Total (€)
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="50.00"
            required
            className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
        </div>

        {/* Campo: Litros */}
        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-600 dark:text-zinc-400">
            Litros
          </label>
          <input
            name="liters"
            type="number"
            step="0.01"
            placeholder="30.5"
            required
            className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
        </div>

        {/* Campo: Kilometraje */}
        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-600 dark:text-zinc-400">
            Kilometraje Actual
          </label>
          <input
            name="odometer"
            type="number"
            placeholder="120500"
            required
            className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent"
          />
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`text-sm p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            'Añadir Gasto'
          )}
        </button>
      </form>
    </div>
  );
}
```

---

## 2. La Página Principal

Ahora usaremos nuestro componente en una página real.

### Archivo: `src/app/page.tsx`

```typescript
import RefuelForm from '@/components/forms/RefuelForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-600">
            GasTrack AI
          </h1>
          <p className="text-zinc-500 mt-2">Control inteligente de combustible</p>
        </header>

        <section>
          <RefuelForm />
        </section>
      </div>
    </main>
  );
}
```

---
¡Módulo 3 Completado!
Ya tienes una aplicación "Full Stack" básica.
- Tienes base de datos.
- Tienes validación en servidor.
- Tienes interfaz de usuario.

El siguiente paso, el más emocionante, será integrar la **Inteligencia Artificial** para no tener que rellenar este formulario a mano nunca más.
