'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RefuelChartProps {
    data: any[];
}

export default function RefuelChart({ data }: RefuelChartProps) {
    if (data.length < 2) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground italic">
                Necesitas al menos 2 registros para ver la evolución
            </div>
        );
    }

    // Sort chronologically (oldest first)
    const sorted = [...data].reverse();

    // Calculate L/100km and €/100km between consecutive fill-ups
    const chartData = sorted.map((item, i) => {
        const fecha = new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });

        // For the first record we can't calculate consumption (no previous reference)
        if (i === 0) {
            return { fecha, consumo: null, costePor100: null };
        }

        // Use tripDistance if available and reasonable, otherwise calculate from odometer difference
        const prev = sorted[i - 1];
        let kmRecorridos = item.tripDistance;

        // Sanity check: if tripDistance is missing, zero, or absurdly large (>10000), use odometer diff
        if (!kmRecorridos || kmRecorridos <= 0 || kmRecorridos > 10000) {
            kmRecorridos = item.odometer - prev.odometer;
        }

        // Skip if we still can't get valid km
        if (!kmRecorridos || kmRecorridos <= 0) {
            return { fecha, consumo: null, costePor100: null };
        }

        // L/100km = (liters / km) * 100
        const consumo = parseFloat(((item.liters / kmRecorridos) * 100).toFixed(2));
        // €/100km = (amount / km) * 100
        const costePor100 = parseFloat(((item.amount / kmRecorridos) * 100).toFixed(2));

        return { fecha, consumo, costePor100 };
    }).filter(d => d.consumo !== null); // Remove entries without valid data

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground italic">
                No hay suficientes datos válidos para calcular el consumo
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                        dataKey="fecha"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#3b82f6"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        unit=" L"
                        domain={['auto', 'auto']}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#f59e0b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        unit="€"
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                        formatter={(value: any, name: any) => {
                            if (name === 'Consumo (L/100km)') return [`${value} L/100km`, name];
                            if (name === 'Coste (€/100km)') return [`${value} €/100km`, name];
                            return [`${value}`, name];
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="consumo"
                        name="Consumo (L/100km)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="costePor100"
                        name="Coste (€/100km)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#f59e0b' }}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
