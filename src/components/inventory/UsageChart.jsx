import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function UsageChart({ logs = [], allocated10 = 20, allocated20 = 20 }) {
  // Aggregate logs by date
  const byDate = {};
  logs.forEach(log => {
    const d = log.date || log.created_date?.slice(0, 10);
    if (!d) return;
    if (!byDate[d]) byDate[d] = { date: d, used_10kg: 0, used_20kg: 0 };
    if (log.box_type === '10kg') byDate[d].used_10kg += (log.quantity_used || 0);
    if (log.box_type === '20kg') byDate[d].used_20kg += (log.quantity_used || 0);
  });

  const data = Object.values(byDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // last 30 days

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">No usage data yet — logs will appear after boxes are used</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="g10" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="g20" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8 }}
          formatter={(v, n) => [v, n === 'used_10kg' ? '10 KG Used' : '20 KG Used']}
        />
        <Legend formatter={v => v === 'used_10kg' ? '10 KG Boxes' : '20 KG Boxes'} wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="used_10kg" stroke="#3b82f6" fill="url(#g10)" strokeWidth={2} />
        <Area type="monotone" dataKey="used_20kg" stroke="#f59e0b" fill="url(#g20)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}