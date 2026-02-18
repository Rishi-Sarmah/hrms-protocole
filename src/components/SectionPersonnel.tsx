import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppData } from '../types/budget';
import { Users, DollarSign } from 'lucide-react';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const SectionPersonnel: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const handleRowChange = (id: string, field: 'male' | 'female', value: string) => {
    const numValue = parseInt(value) || 0;
    const newPersonnel = data.personnel.map(row => 
      row.id === id ? { ...row, [field]: numValue } : row
    );

    // Auto-calculate management count (Sum of r_p_cat_dir)
    const newManagementCount = newPersonnel
      .filter(row => row.category === 'r_p_cat_dir')
      .reduce((sum, row) => sum + row.male + row.female, 0);

    onChange({ 
      ...data, 
      personnel: newPersonnel,
      managementCount: newManagementCount
    });
  };

  const handleStatChange = (field: 'salaryMassCDF', value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...data, [field]: numValue });
  };

  // Calculate Subtotals for display
  const totalMale = data.personnel.reduce((acc, row) => acc + row.male, 0);
  const totalFemale = data.personnel.reduce((acc, row) => acc + row.female, 0);
  
  // Calculated management count for display
  const calculatedManagementCount = data.personnel
    .filter(row => row.category === 'r_p_cat_dir')
    .reduce((sum, row) => sum + row.male + row.female, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-slate-50 border-b-2 border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            {t('sec_personnel')}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
              <tr className="border-b-2 border-slate-300">
                <th className="px-3 py-2 text-left font-semibold text-slate-700 border-r border-slate-200">{t('col_category')}</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 border-r border-slate-200">{t('col_grade')}</th>
                <th className="px-3 py-2 text-center font-semibold text-blue-700 bg-blue-50 border-r border-slate-200">{t('col_male')}</th>
                <th className="px-3 py-2 text-center font-semibold text-pink-700 bg-pink-50 border-r border-slate-200">{t('col_female')}</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">{t('col_total')}</th>
              </tr>
            </thead>
            <tbody>
              {data.personnel.map((row) => (
                <tr key={row.id} className="border-b border-slate-200 hover:bg-blue-50/30 transition-all duration-150">
                  <td className="px-3 py-2 font-medium text-slate-900 border-r border-slate-200 text-xs">{t(row.category)}</td>
                  <td className="px-3 py-2 font-mono text-slate-600 border-r border-slate-200 text-xs">{t(row.grade)}</td>
                  <td className="px-3 py-2 text-center bg-blue-50/40 border-r border-slate-200">
                    <input 
                      type="number" 
                      min="0"
                      className="w-20 text-center p-1.5 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white text-black hover:border-blue-400 transition-all font-semibold text-xs"
                      value={row.male || ''}
                      onChange={(e) => handleRowChange(row.id, 'male', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-center bg-pink-50/40 border-r border-slate-200">
                    <input 
                      type="number" 
                      min="0"
                      className="w-20 text-center p-1.5 border-2 border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none bg-white text-black hover:border-pink-400 transition-all font-semibold text-xs"
                      value={row.female || ''}
                      onChange={(e) => handleRowChange(row.id, 'female', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-sm text-slate-800">
                    {row.male + row.female}
                  </td>
                </tr>
              ))}
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white font-bold border-t-4 border-slate-900">
                <td colSpan={2} className="px-3 py-2 text-right uppercase tracking-wider text-sm border-r border-slate-600">TOTAL</td>
                <td className="px-3 py-2 text-center text-sm font-mono border-r border-slate-600">{totalMale}</td>
                <td className="px-3 py-2 text-center text-sm font-mono border-r border-slate-600">{totalFemale}</td>
                <td className="px-3 py-2 text-center text-base font-mono text-yellow-300">{totalMale + totalFemale}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl shadow-lg border-2 border-slate-200 hover:shadow-xl transition-shadow">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('lbl_management_count')}</label>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <input 
              type="number" 
              readOnly
              className="flex-1 p-2 border-2 border-slate-300 rounded-lg outline-none bg-slate-100 text-slate-800 cursor-not-allowed font-bold text-sm shadow-inner"
              value={calculatedManagementCount}
              title="Calculated automatically from Management Staff category"
            />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('lbl_salary_mass')}</label>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-200 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-700" />
            </div>
            <input 
              type="number" 
              className="flex-1 p-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none bg-white text-black hover:border-green-400 transition-all font-bold text-sm"
              value={data.salaryMassCDF || ''}
              onChange={(e) => handleStatChange('salaryMassCDF', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPersonnel;
