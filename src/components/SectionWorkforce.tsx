import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppData } from '../types/budget';
import { GraduationCap } from 'lucide-react';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const grades = ['DIR', 'DA', 'SD', 'FPP', 'FP', 'CS3', 'CS2', 'CS1', 'M3', 'M2', 'M1', 'C9', 'C8', 'C7', 'C6'];

const SectionWorkforce: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const handleCellChange = (levelIndex: number, grade: string, value: string) => {
    const numVal = parseInt(value) || 0;
    const newWorkforce = [...data.workforce];
    newWorkforce[levelIndex] = { ...newWorkforce[levelIndex], [grade]: numVal };
    onChange({ ...data, workforce: newWorkforce });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
      <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-slate-50 border-b-2 border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-gray-700" />
          {t('sec_workforce')}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
            <tr className="border-b-2 border-slate-300">
              <th className="px-3 py-2 border-r border-slate-200 bg-slate-100 text-left font-semibold text-slate-700 min-w-[100px]">{t('Level')}</th>
              {grades.map(g => (
                <th key={g} className="px-2 py-2 border-r border-slate-200 font-semibold text-slate-600 min-w-[50px]">
                  {g}
                </th>
              ))}
              <th className="px-3 py-2 bg-gray-50 font-bold text-gray-800 min-w-[60px]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.workforce.map((row, idx) => {
              const rowTotal = grades.reduce((acc, g) => acc + (row[g] as number || 0), 0);
              return (
                <tr key={row.level} className="border-b border-slate-200 hover:bg-gray-50 transition-all duration-150">
                  <td className="px-3 py-2 border-r border-slate-200 font-bold text-left bg-slate-50 text-slate-700">{t(row.level)}</td>
                  {grades.map(g => (
                    <td key={g} className="p-1 border-r border-slate-200">
                      <input 
                        type="number"
                        min="0"
                        className="w-full text-center p-1.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white text-black hover:border-gray-400 transition-all font-semibold text-xs"
                        value={row[g] || ''}
                        onChange={(e) => handleCellChange(idx, g, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 font-bold bg-gray-50/40 text-sm text-slate-800">{rowTotal}</td>
                </tr>
              );
            })}
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white font-bold border-t-4 border-slate-900">
              <td className="px-3 py-2 border-r border-slate-600 text-left uppercase tracking-wider text-sm">TOTAL</td>
              {grades.map(g => {
                const colTotal = data.workforce.reduce((acc, row) => acc + (row[g] as number || 0), 0);
                return <td key={g} className="px-2 py-2 border-r border-slate-600 font-mono text-sm">{colTotal}</td>;
              })}
              <td className="px-3 py-2 bg-slate-900 font-mono text-base text-white">
                 {data.workforce.reduce((acc, row) => acc + grades.reduce((gAcc, g) => gAcc + (row[g] as number), 0), 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectionWorkforce;
