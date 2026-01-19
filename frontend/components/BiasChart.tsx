'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ArticleCoverage } from '@/shared/types';

interface BiasChartProps {
  coverages: ArticleCoverage[];
}

const COLORS = {
  left: '#3b82f6', // blue
  center: '#6b7280', // gray
  right: '#ef4444', // red
};

const LABELS = {
  left: 'Izquierda',
  center: 'Centro',
  right: 'Derecha',
};

export default function BiasChart({ coverages }: BiasChartProps) {
  // Count coverages by bias
  const biasCounts = coverages.reduce((acc, coverage) => {
    const bias = coverage.media_source?.bias_rating || coverage.media_bias;
    if (bias) {
      acc[bias] = (acc[bias] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: LABELS.left, value: biasCounts.left || 0, color: COLORS.left },
    { name: LABELS.center, value: biasCounts.center || 0, color: COLORS.center },
    { name: LABELS.right, value: biasCounts.right || 0, color: COLORS.right },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Distribución de Sesgos</h3>
        <p className="text-gray-500 text-center py-8">No hay coberturas disponibles</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Distribución de Sesgos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        Total de coberturas: {total}
      </div>
    </div>
  );
}
