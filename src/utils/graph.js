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

function normalizePoints(value) {
  const points = Number(value);
  return Number.isFinite(points) ? points : 0;
}

export function buildWeeklyGraphData(entries) {
  const weeklyTotals = new Map();

  entries.forEach(([date, value]) => {
    const weekStart = getWeekStart(date);
    const key = formatDateKey(weekStart);
    weeklyTotals.set(key, (weeklyTotals.get(key) || 0) + normalizePoints(value));
  });

  return Array.from(weeklyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({
      key,
      label: formatWeeklyLabel(new Date(`${key}T00:00:00`)),
      value: total,
    }));
}

export function buildMonthlyGraphData(entries) {
  const monthlyTotals = new Map();

  entries.forEach(([date, value]) => {
    const monthKey = date.slice(0, 7);
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + normalizePoints(value));
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
