'use server';

import connectDB from '@/lib/db';
import Refuel from '@/models/Refuel';
import { RefuelSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function addRefuel(formData: FormData) {
    try {
        // Helper para limpiar números (ej: "76,52" -> "76.52")
        const cleanNumber = (val: FormDataEntryValue | null) => {
            if (!val || typeof val !== 'string') return undefined; // Check for string type
            const trimmed = val.trim();
            if (trimmed === '') return undefined;
            return trimmed.replace(',', '.');
        };

        const rawData = {
            amount: cleanNumber(formData.get('amount')),
            liters: cleanNumber(formData.get('liters')),
            pricePerLiter: cleanNumber(formData.get('pricePerLiter')),
            odometer: cleanNumber(formData.get('odometer')),
            tripDistance: cleanNumber(formData.get('tripDistance')),
            isFullTank: formData.get('isFullTank') === 'on',
            date: formData.get('date'),
            notes: formData.get('notes') || undefined,
        };

        console.log('Processing refuel data:', rawData); // Debug log

        const validatedFields = RefuelSchema.safeParse(rawData);

        if (!validatedFields.success) {
            console.error('Validation errors:', validatedFields.error.flatten().fieldErrors);
            const errors = validatedFields.error.flatten().fieldErrors;
            const errorMessages = Object.entries(errors).map(([key, msgs]) => `${key}: ${msgs?.join(', ')}`).join(' | ');

            return {
                success: false,
                errors: errors,
                message: `Error en los datos: ${errorMessages || 'verifica los campos.'}`,
            };
        }

        let { amount, liters, pricePerLiter, odometer, tripDistance, isFullTank, date, notes } = validatedFields.data;
        let isEstimated = false;

        await connectDB();

        // 1. Obtener contexto (último repostaje y promedios)
        const lastRefuel = await Refuel.findOne().sort({ date: -1 });
        const stats = await Refuel.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: "$pricePerLiter" },
                    avgConsumption: { $avg: { $cond: [{ $and: ["$tripDistance", "$liters", "$isFullTank"] }, { $multiply: [{ $divide: ["$liters", "$tripDistance"] }, 100] }, null] } }
                }
            }
        ]);

        // Default values if no history (e.g. 1.5€/L, 6L/100km)
        const avgPrice = stats[0]?.avgPrice || 1.5;
        const avgConsumption = stats[0]?.avgConsumption || 6.0;

        // 2. Lógica de Estimación de Datos Faltantes (Triangulación de Costes)

        // Caso A: Falta Precio/L -> Usar Promedio
        if (!pricePerLiter) {
            if (amount && liters) {
                pricePerLiter = amount / liters;
            } else {
                pricePerLiter = avgPrice;
                isEstimated = true; // Usamos un promedio, la predicción entra en juego
            }
        }

        // Caso B: Falta Litros -> Importe / Precio
        if (!liters) {
            if (amount && pricePerLiter) {
                liters = amount / pricePerLiter;
                if (!formData.get('liters')) isEstimated = true; // Fue calculado, aunque sea exacto, es inferido si no se metió
            }
        }

        // Caso C: Falta Importe -> Litros * Precio
        if (!amount) {
            if (liters && pricePerLiter) {
                amount = liters * pricePerLiter;
                isEstimated = true;
            }
        }

        // Safety check: Debemos tener al menos amount y liters estimados a estas alturas
        if (!amount || !liters) {
            return { success: false, message: 'No hay suficientes datos para estimar el repostaje. Introduce al menos el Importe.' };
        }

        // 3. Lógica de Odómetro y Distancia

        // Caso: Usuario introduce Distancia Recorrida (Trip) pero no Odómetro
        if (tripDistance && !odometer) {
            if (lastRefuel) {
                odometer = lastRefuel.odometer + tripDistance;
            } else {
                // Primer registro, necesitamos odómetro obligatorio
                return { success: false, message: 'Para el primer registro, el odómetro total es obligatorio.' };
            }
        }

        // Caso: Usuario introduce Odómetro pero no Distancia (Lo normal)
        if (odometer && !tripDistance) {
            if (lastRefuel) {
                tripDistance = odometer - lastRefuel.odometer;
            } else {
                tripDistance = 0; // Primer registro
            }
        }

        // Caso Extremo: No hay Odómetro ni Distancia (Solo Importe) -> Predecir recorrido basado en consumo
        if (!odometer && !tripDistance) {
            // Estimamos distancia basada en litros repostados y consumo medio
            // Distancia = (Litros * 100) / ConsumoMedio
            tripDistance = (liters * 100) / avgConsumption;
            isEstimated = true;

            if (lastRefuel) {
                odometer = lastRefuel.odometer + tripDistance;
            } else {
                return { success: false, message: 'Imposible estimar kilometraje sin historial previo.' };
            }
        }

        await Refuel.create({
            date,
            amount,
            liters,
            pricePerLiter,
            odometer,
            tripDistance,
            isFullTank,
            isEstimated,
            notes,
        });

        revalidatePath('/');
        return { success: true, message: isEstimated ? 'Guardado (Valores estimados)' : 'Guardado correctamente' };

    } catch (error: any) {
        console.error('Error saving refuel:', error);
        return { success: false, message: error.message || 'Error interno del servidor' };
    }
}

export async function getRefuels() {
    try {
        await connectDB();
        const refuels = await Refuel.find().sort({ date: -1 }).limit(10).lean();
        return { success: true, data: JSON.parse(JSON.stringify(refuels)) };
    } catch (error) {
        console.error('Error fetching refuels:', error);
        return { success: false, data: [] };
    }
}

export async function deleteRefuel(id: string) {
    try {
        await connectDB();
        await Refuel.findByIdAndDelete(id);
        revalidatePath('/');
        return { success: true, message: 'Repostaje eliminado' };
    } catch (error: any) {
        console.error('Error deleting refuel:', error);
        return { success: false, message: 'No se pudo eliminar el registro' };
    }
}


export async function updateRefuel(id: string, formData: FormData) {
    try {
        const cleanNumber = (val: FormDataEntryValue | null) => {
            if (!val || typeof val !== 'string') return undefined;
            const trimmed = val.trim();
            if (trimmed === '') return undefined;
            return trimmed.replace(',', '.');
        };

        const rawData = {
            amount: cleanNumber(formData.get('amount')),
            liters: cleanNumber(formData.get('liters')),
            pricePerLiter: cleanNumber(formData.get('pricePerLiter')),
            odometer: cleanNumber(formData.get('odometer')),
            tripDistance: cleanNumber(formData.get('tripDistance')),
            isFullTank: formData.get('isFullTank') === 'on',
            date: formData.get('date'),
            notes: formData.get('notes') || undefined,
        };

        const validatedFields = RefuelSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Error en la validación de los datos.',
            };
        }

        await connectDB();
        await Refuel.findByIdAndUpdate(id, validatedFields.data);
        revalidatePath('/');
        return { success: true, message: 'Repostaje actualizado' };
    } catch (error: any) {
        console.error('Error updating refuel:', error);
        return { success: false, message: 'Error interno al actualizar' };
    }
}

