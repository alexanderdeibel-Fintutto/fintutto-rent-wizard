import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalculatorResults } from '@/types/calculator';
import { formatCurrency } from '@/hooks/useCalculator';

interface ResultsChartsProps {
  results: CalculatorResults;
}

const COLORS = {
  primary: 'hsl(239, 84%, 67%)',
  secondary: 'hsl(263, 70%, 50%)',
  success: 'hsl(160, 84%, 39%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 60%)',
  muted: 'hsl(240, 4%, 46%)',
};

export const ResultsCharts = ({ results }: ResultsChartsProps) => {
  // Kaufnebenkosten für Donut-Chart
  const kaufnebenkostenData = [
    { name: 'Grunderwerbsteuer', value: results.grunderwerbsteuerBetrag, color: COLORS.primary },
    { name: 'Notarkosten', value: results.notarkostenBetrag, color: COLORS.secondary },
    { name: 'Maklergebühr', value: results.maklergebuehrBetrag, color: COLORS.warning },
    { name: 'Grundbuchkosten', value: results.grundbuchkostenBetrag, color: COLORS.success },
  ];

  // Tilgungsplan-Daten für Balkendiagramm
  const tilgungsplanData = results.tilgungsplan.slice(0, 10).map((jahr) => ({
    jahr: `Jahr ${jahr.jahr}`,
    Zinsen: Math.round(jahr.zinsen),
    Tilgung: Math.round(jahr.tilgung),
  }));

  // Cashflow-Entwicklung für Liniendiagramm
  const cashflowData = results.cashflowEntwicklung.map((jahr) => ({
    jahr: `Jahr ${jahr.jahr}`,
    Cashflow: Math.round(jahr.cashflow),
    Kumuliert: Math.round(jahr.kumuliert),
  }));

  return (
    <div className="space-y-4">
      {/* Cashflow-Entwicklung */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cashflow-Entwicklung (10 Jahre)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="jahr" 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Cashflow" 
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Kumuliert" 
                  stroke={COLORS.success}
                  strokeWidth={2}
                  dot={{ fill: COLORS.success, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tilgungsplan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tilgungsplan (Zinsen vs. Tilgung)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tilgungsplanData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="jahr" 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey="Zinsen" stackId="a" fill={COLORS.destructive} />
                <Bar dataKey="Tilgung" stackId="a" fill={COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Kaufnebenkosten Donut */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Kaufnebenkosten-Aufschlüsselung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kaufnebenkostenData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {kaufnebenkostenData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center font-mono text-lg font-semibold">
            Gesamt: {formatCurrency(results.kaufnebenkostenGesamt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
