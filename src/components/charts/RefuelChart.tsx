'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RefuelChartProps {
    data: any[];
}

export default function RefuelChart({ data }: RefuelChartProps) {
    // Formatear datos para el gráfico (invertir orden para que sea cronológico)
    const chartData = [...data].reverse().map(item => ({
        fecha: new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
        gasto: item.amount,
        km: item.odometer,
    }));

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground italic">
                Añade registros para ver la evolución
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
                        unit="€"
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10b981"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        unit="km"
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="gasto"
                        name="Gasto (€)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="km"
                        name="Kilómetros"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#10b981' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
