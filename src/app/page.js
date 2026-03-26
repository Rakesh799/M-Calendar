'use client';

import { useEffect, useRef, useState } from 'react';
import { getMonths } from '@/lib/calendar';

const COLORS = {
  1: 'bg-gradient-to-br from-lime-400 to-emerald-600',
  2: 'bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500',
  3: 'bg-gradient-to-br from-orange-400 to-red-600',
};

function getWeekStart(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const weekStart = new Date(date);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  weekStart.setDate(date.getDate() + mondayOffset);
  return weekStart;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatWeeklyLabel(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    primary: `${weekStart.getDate()}-${weekEnd.getDate()}`,
    secondary: weekEnd.toLocaleDateString('en-IN', {
      month: 'short',
    }).toUpperCase(),
  };
}

function buildWeeklyGraphData(entries) {
  const weeklyTotals = new Map();

  entries.forEach(([date]) => {
    const weekStart = getWeekStart(date);
    const key = formatDateKey(weekStart);
    weeklyTotals.set(key, (weeklyTotals.get(key) || 0) + 1);
  });

  return Array.from(weeklyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({
      key,
      label: formatWeeklyLabel(new Date(`${key}T00:00:00`)),
      value: total,
    }));
}

function buildMonthlyGraphData(entries) {
  const monthlyTotals = new Map();

  entries.forEach(([date]) => {
    const monthKey = date.slice(0, 7);
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + 1);
  });

  return Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({
      key,
      label: {
        primary: new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', {
          month: 'short',
        }).toUpperCase(),
        secondary: '',
      },
      value: total,
    }));
}

export default function Home() {
  const months = getMonths(2026);
  const [data, setData] = useState({});
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [graphView, setGraphView] = useState('week');
  const pressTimer = useRef(null);

  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!isGraphOpen) return;

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setIsGraphOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGraphOpen]);

  function saveData(updated) {
    fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }

  const graphEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const weeklyGraphData = buildWeeklyGraphData(graphEntries);
  const monthlyGraphData = buildMonthlyGraphData(graphEntries);
  const activeGraphData = graphView === 'week' ? weeklyGraphData : monthlyGraphData;
  const chartValues = activeGraphData.map(item => item.value);
  const maxValue = Math.max(...chartValues, 3);
  const chartWidth = 640;
  const chartHeight = 290;
  const chartPadding = 32;
  const chartBottomPadding = 62;
  const innerWidth = chartWidth - chartPadding * 2;
  const innerHeight = chartHeight - chartPadding - chartBottomPadding;
  const barWidth = activeGraphData.length === 0
    ? 0
    : Math.min(48, Math.max(20, innerWidth / activeGraphData.length - 10));

  const chartBars = activeGraphData.map((item, index) => {
    const step = innerWidth / Math.max(activeGraphData.length, 1);
    const x = chartPadding + index * step + (step - barWidth) / 2;
    const height = (item.value / maxValue) * innerHeight;
    const y = chartHeight - chartBottomPadding - height;

    return {
      ...item,
      x,
      y,
      height,
      labelX: x + barWidth / 2,
    };
  });

  function onDayClick(key) {
    const val = prompt('Intensity (1, 2, 3)');
    if (!['1', '2', '3'].includes(val)) return;

    const updated = { ...data, [key]: Number(val) };
    setData(updated);
    saveData(updated);
  }

  function handleTouchStart(key) {
    pressTimer.current = setTimeout(() => {
      onDayLongPress(key);
    }, 600); // 600ms = long press
  }

  function handleTouchEnd() {
    clearTimeout(pressTimer.current);
  }

  function deleteDay(key) {
    const updated = { ...data };
    delete updated[key];

    setData(updated);
    saveData(updated);
  }

  function onDayLongPress(key) {
    if (!data[key]) return;

    const ok = confirm(`Delete entry for ${key}?`);

    if (ok) {
      deleteDay(key);
    }
  }


  return (
    <main className="p-6 space-y-12 bg-linear-to-b from-green-100 to-white">
      
      <div className='flex justify-between items-center'>

      <p className="text-sm text-gray-500 mb-4">
        Tap to edit • Long press for options
      </p>

      <button
        type="button"
        onClick={() => {
          setGraphView('week');
          setIsGraphOpen(true);
        }}
        className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
      >
        Show Graph
      </button>

      </div>

      {months.map(m => (
        <section key={m.month}>
          <h2 className="text-xl font-bold mb-2">{m.name}</h2>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-sm font-semibold">
                {d}
              </div>
            ))}

            {Array(m.start).fill(null).map((_, i) => (
              <div key={i} />
            ))}

            {Array.from({ length: m.days }, (_, i) => {
              const day = i + 1;
              const key = `2026-${String(m.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              return (
                <button
                  key={key}
                  onClick={() => onDayClick(key)}

                  onTouchStart={() => handleTouchStart(key)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}

                  className={`h-10 border rounded text-sm active:scale-95 ${COLORS[data[key]] || ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {isGraphOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setIsGraphOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Calendar Graph</h2>
                <p className="text-sm text-gray-500">
                  View entries grouped by week or month
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-50 p-1">
                  <button
                    type="button"
                    onClick={() => setGraphView('week')}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition ${graphView === 'week' ? 'bg-emerald-700 text-white' : 'text-emerald-900 hover:bg-emerald-100'}`}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setGraphView('month')}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition ${graphView === 'month' ? 'bg-emerald-700 text-white' : 'text-emerald-900 hover:bg-emerald-100'}`}
                  >
                    Month
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGraphOpen(false)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            {chartBars.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center text-gray-500">
                No data available yet. Add a few calendar entries to see the graph.
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="min-w-[640px]"
                    role="img"
                    aria-label={`Bar chart of calendar entries by ${graphView}`}
                  >
                    {Array.from({ length: maxValue }, (_, index) => index + 1).map(level => {
                      const y = chartHeight - chartPadding - (level / maxValue) * innerHeight;
                      const adjustedY = chartHeight - chartBottomPadding - (level / maxValue) * innerHeight;

                      return (
                        <g key={level}>
                          <line
                            x1={chartPadding}
                            y1={adjustedY}
                            x2={chartWidth - chartPadding}
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
                      x1={chartPadding}
                      y1={chartHeight - chartBottomPadding}
                      x2={chartWidth - chartPadding}
                      y2={chartHeight - chartBottomPadding}
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
                          y={chartHeight - 26}
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
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
