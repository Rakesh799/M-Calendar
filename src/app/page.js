'use client';

import { useEffect, useState } from 'react';
import { getMonths } from '@/lib/calendar';

const COLORS = {
  1: 'bg-gradient-to-br from-lime-400 to-emerald-600',
  2: 'bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500',
  3: 'bg-gradient-to-br from-orange-400 to-red-600',
};

export default function Home() {
  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(setData);
  }, []);

  function saveData(updated) {
    fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }

  const months = getMonths(2026);
  const [data, setData] = useState({});

  function onDayClick(key) {
    const val = prompt('Intensity (1, 2, 3)');
    if (!['1', '2', '3'].includes(val)) return;

    const updated = { ...data, [key]: Number(val) };
    setData(updated);
    saveData(updated);
  }

  let pressTimer;


  function handleTouchStart(key) {
    pressTimer = setTimeout(() => {
      onDayLongPress(key);
    }, 600); // 600ms = long press
  }

  function handleTouchEnd() {
    clearTimeout(pressTimer);
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
      <p className="text-sm text-gray-500 mb-4">
        Tap to edit • Long press for options
      </p>
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
    </main>
  );
}
