import { getRefuels } from '@/actions/refuel-actions';
import { Fuel, History, TrendingUp } from 'lucide-react';
import DashboardContainer from '@/components/DashboardContainer';

// Force dynamic rendering — never cache this page (it depends on DB data)
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: refuels } = await getRefuels();

  // Calcular KPIs básicos (en el servidor)
  const totalSpent = refuels?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  const totalLiters = refuels?.reduce((acc: number, curr: any) => acc + curr.liters, 0) || 1;
  const avgConsumption = refuels?.length > 1
    ? ((refuels[0].liters / (refuels[0].odometer - refuels[1].odometer)) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen pb-20">
      {/* Header / Hero Section */}
      <div className="relative overflow-hidden bg-zinc-950 px-6 py-12 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0))]" />
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            GasTrack AI
          </h1>
          <p className="text-lg leading-8 text-zinc-400">
            Seguimiento inteligente con IA. Analiza tus gastos y visualiza tu progreso.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Gasto Total"
            value={`${totalSpent.toFixed(2)}€`}
            icon={<Fuel className="h-5 w-5 text-blue-500" />}
            subValue="Histórico acumulado"
          />
          <StatCard
            title="Consumo Medio"
            value={`${avgConsumption} L/100km`}
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            subValue="Último registro real"
          />
          <StatCard
            title="Precio Medio"
            value={`${(totalSpent / totalLiters).toFixed(3)}€/L`}
            icon={<History className="h-5 w-5 text-orange-500" />}
            subValue="Promedio histórico"
          />
        </div>

        {/* Client Components (Dashboard Container) */}
        <DashboardContainer refuels={refuels} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subValue }: { title: string; value: string; icon: React.ReactNode; subValue: string }) {
  return (
    <div className="glass p-6 rounded-2xl space-y-1 shadow-sm border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between text-muted-foreground mb-2">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{subValue}</div>
    </div>
  );
}


