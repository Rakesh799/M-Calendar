const COLORS = {
  1: 'bg-gradient-to-br from-lime-400 to-emerald-600',
  2: 'bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500',
  3: 'bg-gradient-to-br from-orange-400 to-red-600',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarMonthSection({
  month,
  data,
  onDayClick,
  onTouchStart,
  onTouchEnd,
}) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-bold">{month.name}</h2>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-sm font-semibold">
            {day}
          </div>
        ))}

        {Array(month.start).fill(null).map((_, index) => (
          <div key={index} />
        ))}

        {Array.from({ length: month.days }, (_, index) => {
          const day = index + 1;
          const key = `2026-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          return (
            <button
              key={key}
              onClick={() => onDayClick(key)}
              onTouchStart={() => onTouchStart(key)}
              onTouchEnd={onTouchEnd}
              onTouchMove={onTouchEnd}
              className={`h-10 rounded border text-sm active:scale-95 ${COLORS[data[key]] || ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}
