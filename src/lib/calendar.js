export function getMonths(year) {
  return Array.from({ length: 12 }, (_, m) => {
    const first = new Date(year, m, 1);
    const last = new Date(year, m + 1, 0);

    return {
      month: m,
      year,
      days: last.getDate(),
      start: first.getDay(),
      name: first.toLocaleString('default', { month: 'long' }),
    };
  });
}
