import { getScoreColorClass } from '../../lib/stats';
import { exportRecordsAsCsv } from '../../lib/csv';
import type { StudentRecord } from '../../types/dashboard';

interface RecordTableProps {
  data: StudentRecord[];
}

export function RecordTable({ data }: RecordTableProps) {
  // Pagination for render performance, same limit as the original prototype.
  const visibleRows = data.slice(0, 50);

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold">Detailed Record Viewer</h3>
        <button
          onClick={() => exportRecordsAsCsv(data)}
          className="text-xs font-bold text-brand uppercase"
        >
          Export Filtered CSV
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 sticky top-0">
            <tr className="text-slate-500 font-bold uppercase text-[10px]">
              <th className="px-6 py-4">Profile</th>
              <th className="px-6 py-4">Soc Media (Hrs)</th>
              <th className="px-6 py-4">Sleep (Hrs)</th>
              <th className="px-6 py-4">Stress</th>
              <th className="px-6 py-4">Anxiety</th>
              <th className="px-6 py-4">Addiction</th>
              <th className="px-6 py-4">Depression</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((d, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold">Age {d.age}</span>
                    <span className="text-[10px] uppercase text-slate-400 font-medium">
                      {d.gender} • {d.platform_usage}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{d.daily_social_media_hours}h</td>
                <td className="px-6 py-4 font-medium">{d.sleep_hours}h</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColorClass(d.stress_level)}`}>
                    {d.stress_level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColorClass(d.anxiety_level)}`}>
                    {d.anxiety_level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColorClass(d.addiction_level)}`}>
                    {d.addiction_level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {d.depression_label === 1 ? (
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-tighter">
                      Detected
                    </span>
                  ) : (
                    <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
