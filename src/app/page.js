'use client';

import { useEffect, useRef, useState } from 'react';
import CalendarMonthSection from '@/components/CalendarMonthSection.jsx';
import CalendarToolbar from '@/components/CalendarToolbar.jsx';
import GraphModal from '@/components/GraphModal.jsx';
import { getMonths } from '@/utils/calendar';
import { buildMonthlyGraphData, buildWeeklyGraphData } from '@/utils/graph';

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
    <main className="space-y-12 bg-linear-to-b from-green-100 to-white p-6">
      <CalendarToolbar
        onShowGraph={() => {
          setGraphView('week');
          setIsGraphOpen(true);
        }}
      />

      {months.map(month => (
        <CalendarMonthSection
          key={month.month}
          month={month}
          data={data}
          onDayClick={onDayClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      ))}

      <GraphModal
        isOpen={isGraphOpen}
        graphView={graphView}
        activeGraphData={activeGraphData}
        onClose={() => setIsGraphOpen(false)}
        onGraphViewChange={setGraphView}
      />
    </main>
  );
}
