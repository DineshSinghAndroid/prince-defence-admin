import { TrendingUp } from "lucide-react";

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 300;
const PADDING = { top: 24, right: 24, bottom: 42, left: 42 };

const toDate = (dateKey) => new Date(`${dateKey}T00:00:00.000Z`);

const getDateKeys = (from, to) => {
  const keys = [];
  const cursor = toDate(from);
  const end = toDate(to);
  while (cursor <= end && keys.length < 366) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
};

const formatDate = (dateKey) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(toDate(dateKey));

export default function AnalyticsTrendChart({
  from,
  to,
  data = [],
  series,
  title,
  description,
  loading = false,
  emptyMessage = "No activity in this date range.",
  eyebrow = "ANALYTICS TERMINAL",
}) {
  const dateKeys = from && to ? getDateKeys(from, to) : [];
  if (!dateKeys.length || !series?.length) return null;

  const valuesByDate = new Map(data.map((item) => [item.dateKey, item]));
  const rows = dateKeys.map((dateKey) => ({
    dateKey,
    ...(valuesByDate.get(dateKey) || {}),
  }));
  const chartWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) => series.map(({ key }) => Number(row[key] || 0)))
  );
  const x = (index) =>
    PADDING.left +
    (rows.length === 1 ? chartWidth / 2 : (index / (rows.length - 1)) * chartWidth);
  const y = (value) => PADDING.top + chartHeight - (value / maxValue) * chartHeight;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#203653] bg-[#0B1728] p-5 text-white shadow-[0_18px_50px_rgba(11,23,40,0.18)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#8FA4BE]">
            <TrendingUp size={14} className="text-[#34D399]" />
            {eyebrow}
          </span>
          <h2 className="mt-2 text-lg font-bold text-white">{title}</h2>
          <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-[#B6C4D7]">
          {series.map(({ key, label, color }) => (
            <span key={key} className="inline-flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[#0E1D31] px-2 py-4 sm:px-4">
        {data.length ? (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              role="img"
              aria-label={`${title} from ${from} to ${to}`}
              className="h-auto min-w-[650px] w-full"
            >
              <defs>
                {series.map(({ key, color }) => (
                  <linearGradient key={key} id={`trend-fill-${key}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                  </linearGradient>
                ))}
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                const gridY = PADDING.top + chartHeight * step;
                return (
                  <g key={step}>
                    <line
                      x1={PADDING.left}
                      x2={CHART_WIDTH - PADDING.right}
                      y1={gridY}
                      y2={gridY}
                      stroke="#FFFFFF"
                      strokeOpacity="0.1"
                      strokeDasharray="2 7"
                    />
                    <text x={PADDING.left - 10} y={gridY + 4} textAnchor="end" fill="#94A3B8" fontSize="11">
                      {Math.round(maxValue * (1 - step))}
                    </text>
                  </g>
                );
              })}

              {series.map(({ key, color }) => {
                const points = rows.map((row, index) => [x(index), y(Number(row[key] || 0))]);
                const linePath = points
                  .map(([pointX, pointY], index) => `${index ? "L" : "M"}${pointX},${pointY}`)
                  .join(" ");
                const areaPath = `${linePath} L${x(rows.length - 1)},${PADDING.top + chartHeight} L${x(0)},${PADDING.top + chartHeight} Z`;

                return (
                  <g key={key}>
                    <path d={areaPath} fill={`url(#trend-fill-${key})`} />
                    <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map(([pointX, pointY], index) => (
                      <circle
                        key={rows[index].dateKey}
                        cx={pointX}
                        cy={pointY}
                        r="3.5"
                        fill="#0B1728"
                        stroke={color}
                        strokeWidth="2"
                      >
                        <title>
                          {formatDate(rows[index].dateKey)}: {Number(rows[index][key] || 0)}
                        </title>
                      </circle>
                    ))}
                  </g>
                );
              })}

              {rows.map((row, index) => {
                const interval = Math.max(1, Math.ceil(rows.length / 8));
                if (index % interval !== 0 && index !== rows.length - 1) return null;
                return (
                  <text key={row.dateKey} x={x(index)} y={CHART_HEIGHT - 12} textAnchor="middle" fill="#94A3B8" fontSize="11">
                    {formatDate(row.dateKey)}
                  </text>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-[#94A3B8]">
            {loading ? "Loading chart data…" : emptyMessage}
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] text-[#718198]">
        {from} to {to} · India Standard Time
      </p>
    </section>
  );
}
