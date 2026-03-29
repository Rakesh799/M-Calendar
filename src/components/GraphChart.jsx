const CHART_WIDTH = 640;
const CHART_HEIGHT = 290;
const CHART_PADDING = 32;
const CHART_BOTTOM_PADDING = 62;

export default function GraphChart({ data, graphView }) {
  const chartValues = data.map(item => item.value);
  const maxValue = Math.max(...chartValues, 3);
  const innerWidth = CHART_WIDTH - CHART_PADDING * 2;
  const innerHeight = CHART_HEIGHT - CHART_PADDING - CHART_BOTTOM_PADDING;
  const barWidth = data.length === 0
    ? 0
    : Math.min(48, Math.max(20, innerWidth / data.length - 10));

  const chartBars = data.map((item, index) => {
    const step = innerWidth / Math.max(data.length, 1);
    const x = CHART_PADDING + index * step + (step - barWidth) / 2;
    const height = (item.value / maxValue) * innerHeight;
    const y = CHART_HEIGHT - CHART_BOTTOM_PADDING - height;

    return {
      ...item,
      x,
      y,
      height,
      labelX: x + barWidth / 2,
    };
  });

  if (chartBars.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center text-gray-500">
        No data available yet. Add a few calendar entries to see the graph.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="min-w-[640px]"
        role="img"
        aria-label={`Bar chart of calendar entries by ${graphView}`}
      >
        {Array.from({ length: maxValue }, (_, index) => index + 1).map(level => {
          const adjustedY = CHART_HEIGHT - CHART_BOTTOM_PADDING - (level / maxValue) * innerHeight;

          return (
            <g key={level}>
              <line
                x1={CHART_PADDING}
                y1={adjustedY}
                x2={CHART_WIDTH - CHART_PADDING}
                y2={adjustedY}
                className="stroke-gray-200"
                strokeWidth="1"
              />
              <text
                x={12}
                y={adjustedY + 4}
                className="fill-gray-500 text-[11px]"
              >
                {level}
              </text>
            </g>
          );
        })}

        <line
          x1={CHART_PADDING}
          y1={CHART_HEIGHT - CHART_BOTTOM_PADDING}
          x2={CHART_WIDTH - CHART_PADDING}
          y2={CHART_HEIGHT - CHART_BOTTOM_PADDING}
          className="stroke-gray-300"
          strokeWidth="1.5"
        />

        {chartBars.map(bar => (
          <g key={bar.key}>
            <rect
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.height}
              rx="8"
              fill="#047857"
            />
            <text
              x={bar.labelX}
              y={bar.y - 8}
              textAnchor="middle"
              className="fill-emerald-900 text-[11px]"
            >
              {bar.value}
            </text>
            <text
              x={bar.labelX}
              y={CHART_HEIGHT - 26}
              textAnchor="middle"
              className="fill-gray-500 text-[10px]"
            >
              <tspan x={bar.labelX}>{bar.label.primary}</tspan>
              {bar.label.secondary && (
                <tspan x={bar.labelX} dy="12" className="text-[9px] font-semibold tracking-[0.18em]">
                  {bar.label.secondary}
                </tspan>
              )}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
