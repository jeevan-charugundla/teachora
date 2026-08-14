import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';

const COLORS = ['#0d9488', '#0284c7', '#7c3aed', '#e11d48', '#d97706', '#16a34a', '#0891b2', '#9333ea'];

interface ChartPreviewProps {
  data: any;
}

export function ChartPreview({ data }: ChartPreviewProps) {
  if (!data || !data.data) return null;

  const chartData = data.data;
  const chartType = data.chartType || 'Bar';
  const xLabel = data.xAxisLabel || '';
  const yLabel = data.yAxisLabel || '';
  const showLegend = data.showLegend !== false;
  const showValues = data.showValues !== false;

  const margin = { top: 20, right: 30, left: yLabel ? 20 : 0, bottom: xLabel ? 30 : 10 };

  const renderChart = () => {
    if (chartType === 'Line') {
      return (
        <LineChart data={chartData} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" stroke="#6b7280" fontSize={11} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#6b7280' } : undefined} />
          <YAxis stroke="#6b7280" fontSize={11} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' } : undefined} />
          <Tooltip />
          {showLegend && <Legend />}
          <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 5, fill: '#0d9488' }}>
            {showValues && <LabelList dataKey="value" position="top" fontSize={10} />}
          </Line>
        </LineChart>
      );
    }

    if (chartType === 'Area') {
      return (
        <AreaChart data={chartData} margin={margin}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" stroke="#6b7280" fontSize={11} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#6b7280' } : undefined} />
          <YAxis stroke="#6b7280" fontSize={11} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' } : undefined} />
          <Tooltip />
          {showLegend && <Legend />}
          <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fill="url(#areaGrad)">
            {showValues && <LabelList dataKey="value" position="top" fontSize={10} />}
          </Area>
        </AreaChart>
      );
    }

    if (chartType === 'Pie') {
      return (
        <PieChart margin={margin}>
          <Tooltip />
          {showLegend && <Legend />}
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label={showValues ? ({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%` : undefined}
          >
            {chartData.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    }

    // Default: Bar chart (also used for 'Comparison')
    return (
      <BarChart data={chartData} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" stroke="#6b7280" fontSize={11} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#6b7280' } : undefined} />
        <YAxis stroke="#6b7280" fontSize={11} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' } : undefined} />
        <Tooltip />
        {showLegend && <Legend />}
        <Bar dataKey="value" fill="#0d9488" radius={[8, 8, 0, 0]}>
          {chartData.map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          {showValues && <LabelList dataKey="value" position="top" fontSize={10} />}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">• {chartType} Chart</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
        {data.purpose && <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{data.purpose}</p>}
      </div>

      {/* Live Interactive Chart Canvas */}
      <div className="card p-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        {(xLabel || yLabel) && (
          <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] font-medium">
            {xLabel && <span>X: {xLabel}</span>}
            {yLabel && <span>Y: {yLabel}</span>}
          </div>
        )}
      </div>

      {/* Insights */}
      {data.insights && (
        <div className="p-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
          <p className="text-xs font-bold text-[var(--color-text-primary)] mb-1">📊 Data Insights</p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{data.insights}</p>
        </div>
      )}

      {/* Raw Data Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
          Data Values ({chartData.length} entries)
        </h3>
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] text-[var(--color-text-tertiary)]">
              <tr>
                <th className="py-2 px-3">{xLabel || 'Label'}</th>
                <th className="py-2 px-3">{yLabel || 'Value'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {chartData.map((row: any, i: number) => (
                <tr key={i} className="bg-[var(--color-surface)]">
                  <td className="py-2 px-3 font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {row.label}
                  </td>
                  <td className="py-2 px-3 font-bold text-[var(--color-primary-700)]">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
