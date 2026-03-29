import GraphChart from '@/components/GraphChart.jsx';

export default function GraphModal({
  isOpen,
  graphView,
  activeGraphData,
  onClose,
  onGraphViewChange,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendar Graph</h2>
            <p className="text-sm text-gray-500">
              View total points grouped by week or month
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-50 p-1">
              <button
                type="button"
                onClick={() => onGraphViewChange('week')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${graphView === 'week' ? 'bg-emerald-700 text-white' : 'text-emerald-900 hover:bg-emerald-100'}`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => onGraphViewChange('month')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${graphView === 'month' ? 'bg-emerald-700 text-white' : 'text-emerald-900 hover:bg-emerald-100'}`}
              >
                Month
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>

        <GraphChart data={activeGraphData} graphView={graphView} />
      </div>
    </div>
  );
}
