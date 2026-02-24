'use client';

import { useState } from 'react';
import RefuelForm from './forms/RefuelForm';
import RefuelChart from './charts/RefuelChart';
import { deleteRefuel } from '@/actions/refuel-actions';
import { Fuel, Trash2, Edit2, Info } from 'lucide-react';

interface DashboardContainerProps {
    refuels: any[];
}

export default function DashboardContainer({ refuels }: DashboardContainerProps) {
    const [editingRefuel, setEditingRefuel] = useState<any>(null);

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
            await deleteRefuel(id);
        }
    };

    const handleEdit = (refuel: any) => {
        setEditingRefuel(refuel);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-6 -mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content: Stats & Chart & List */}
            <div className="lg:col-span-8 space-y-8">

                {/* Chart Section */}
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg">Eficiencia y Coste</h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>L/100km</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span>€/100km</span>
                            </div>
                        </div>
                    </div>
                    <RefuelChart data={refuels} />
                </div>

                {/* Activity / History */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-semibold">Actividad Reciente</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {refuels && refuels.length > 0 ? (
                            refuels.map((item: any) => (
                                <div key={item._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Fuel className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-lg">{item.amount.toFixed(2)}€</p>
                                                {item.isEstimated && (
                                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1" title="Valores estimados automáticamente">
                                                        <Info className="h-3 w-3" />
                                                        Estimado
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium">{item.liters.toFixed(2)} L</p>
                                            <p className="text-xs text-muted-foreground">{item.odometer.toLocaleString()} km</p>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center text-muted-foreground">
                                No hay registros todavía. Empieza añadiendo tu primer repostaje.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar: Form */}
            <div className="lg:col-span-4 space-y-8">
                <RefuelForm
                    initialData={editingRefuel}
                    onCancel={() => setEditingRefuel(null)}
                />

                {/* Trip Calculator (Placeholder for now) */}
                <div className="glass p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <Fuel className="h-5 w-5 text-primary" />
                        <h4>Calculadora de Viaje</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Estima el coste de tu próximo viaje basado en tu consumo real.
                    </p>
                    <div className="space-y-3">
                        <input
                            type="number"
                            placeholder="Distancia del viaje (km)"
                            className="w-full bg-secondary/30 border-none rounded-lg px-4 py-2 text-sm outline-none"
                        />
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <p className="text-xs text-muted-foreground">Coste Estimado</p>
                            <p className="text-xl font-bold">0.00€</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
