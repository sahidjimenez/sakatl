export function BarChart({
  data,
  height = 140,
  barColor = "#22c55e",
  formatValue,
}: {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const barHeight = Math.max(2, Math.round((d.value / max) * (height - 28)));
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-semibold text-[#9099a3]">
              {d.value > 0 ? (formatValue ? formatValue(d.value) : Math.round(d.value)) : ""}
            </span>
            <div
              className="w-full max-w-[28px] rounded-t-md bg-current"
              style={{ height: barHeight, color: barColor, opacity: d.value > 0 ? 1 : 0.15 }}
            />
            <span className="text-[10px] whitespace-nowrap text-[#6b7280]">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({
  data,
  height = 120,
  color = "#4ade80",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 300;
  const padY = 12;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - padY - ((d.value - min) / range) * (height - padY * 2);
    return { x, y };
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[#6b7280]">
        <span>{data[0].label}</span>
        {data.length > 1 && <span>{data[data.length - 1].label}</span>}
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  height = 56,
  color = "#4ade80",
}: {
  data: number[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 300;
  const padY = 8;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - padY - ((v - min) / range) * (height - padY * 2),
  }));
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={8} fill={color} opacity={0.25} />
      <circle cx={last.x} cy={last.y} r={4} fill={color} />
    </svg>
  );
}

export function HorizontalBarList({
  data,
  barColor = "#4ade80",
}: {
  data: { label: string; value: number }[];
  barColor?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#f1f3f4] capitalize">{d.label}</span>
            <span className="text-[#9099a3]">{d.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2f37]">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.round((d.value / max) * 100)}%`, backgroundColor: barColor }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
