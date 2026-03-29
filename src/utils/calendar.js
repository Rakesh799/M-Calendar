export function getMonths(year) {
  return Array.from({ length: 12 }, (_, month) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    return {
      month,
      year,
      days: last.getDate(),
      start: first.getDay(),
      name: first.toLocaleString('default', { month: 'long' }),
    };
  });
}
