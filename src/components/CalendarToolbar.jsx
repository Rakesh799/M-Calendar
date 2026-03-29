export default function CalendarToolbar({ onShowGraph }) {
  return (
    <div className="flex items-center justify-between">
      <p className="mb-4 text-sm text-gray-500">
        Tap to edit • Long press for options
      </p>

      <button
        type="button"
        onClick={onShowGraph}
        className="cursor-pointer rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
      >
        Show Graph
      </button>
    </div>
  );
}
