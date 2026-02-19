import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppData } from '../types/budget';
import { LayoutDashboard, Calculator } from 'lucide-react';

interface Props {
  data: AppData;
}

const SectionDashboard: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const metrics = useMemo(() => {
    // 1. Production (Sum of all production achievements)
    const production = data.budget.production.reduce((sum, row) => sum + row.achievement, 0);

    // 2. Charges Groups (Based on IDs in constants.ts)
    // bc1=60, bc2=61, bc3=62, bc4=63, bc5=64, bc6=65, bc7=66, bc8=67, bc9=83
    const getCharge = (id: string) => data.budget.charges.find(c => c.id === id)?.achievement || 0;
    
    // Sum of 60 to 65 (bc1 to bc6)
    const charges60to65 = ['bc1', 'bc2', 'bc3', 'bc4', 'bc5', 'bc6'].reduce((sum, id) => sum + getCharge(id), 0);
    
    // Total Charges
    const totalCharges = data.budget.charges.reduce((sum, row) => sum + row.achievement, 0);

    // 3. V.A. = Production - (60 to 65)
    const va = production - charges60to65;

    // 4. Coefficient d'Exploitation = Production / Charges
    const coeffExploitation = totalCharges !== 0 ? (production / totalCharges) : 0;

    // 5. EBE = V.A. - 66 (bc7)
    const charge66 = getCharge('bc7');
    const ebe = va - charge66;

    // 6. R.E. = EBE - (64 to 67... assuming this means remaining financial charges 67)
    // Standard logic suggests removing financial charges (67) from EBE to get closer to RE if it's "Resultat Courant"
    const charge67 = getCharge('bc8');
    const re = ebe - charge67; 

    // 7. Encours Clients = Production - Recettes nettes
    // Recettes nettes = Treasury Receipt "Facturation ou recettes" (tr2)
    const receipts = data.budget.treasuryReceipts.find(r => r.id === 'tr2')?.achievement || 0;
    const encoursClients = production - receipts;

    // 8. Taux de Recouvrement = (Recettes / Production) * 100
    const recoveryRate = production !== 0 ? (receipts / production) * 100 : 0;

    // 9. Workforce Stats
    const totalWorkforce = data.staff.reduce((sum, p) => sum + p.male + p.female, 0);
    
    // 10. Productivité = Production / Effectif
    const productivity = totalWorkforce !== 0 ? production / totalWorkforce : 0;

    // 11. Cout Moyen = Charge 66 / Effectif
    const avgCost = totalWorkforce !== 0 ? charge66 / totalWorkforce : 0;

    // 12. Ratio Encadrement = Effectif / Effectif Dirigeant
    const managementCount = data.managementCount;
    const supervisionRatio = managementCount !== 0 ? totalWorkforce / managementCount : 0;

    // 13. Salaire Moyen = Masse salariale / Effectif
    const avgSalary = totalWorkforce !== 0 ? data.salaryMassCDF / totalWorkforce : 0;

    return [
      { label: t('dashboard_lbl_total_workforce'), formula: t('dashboard_fml_total_workforce'), value: totalWorkforce, format: 'number' },
      { label: t('dashboard_lbl_va'), formula: t('dashboard_fml_va'), value: va, format: 'number' },
      { label: t('dashboard_lbl_coeff'), formula: t('dashboard_fml_coeff'), value: coeffExploitation, format: 'decimal' },
      { label: t('dashboard_lbl_ebe'), formula: t('dashboard_fml_ebe'), value: ebe, format: 'number' },
      { label: t('dashboard_lbl_re'), formula: t('dashboard_fml_re'), value: re, format: 'number' },
      { label: t('dashboard_lbl_encours'), formula: t('dashboard_fml_encours'), value: encoursClients, format: 'number' },
      { label: t('dashboard_lbl_recovery'), formula: t('dashboard_fml_recovery'), value: recoveryRate, format: 'percent' },
      { label: t('dashboard_lbl_productivity'), formula: t('dashboard_fml_productivity'), value: productivity, format: 'number' },
      { label: t('dashboard_lbl_avg_cost'), formula: t('dashboard_fml_avg_cost'), value: avgCost, format: 'number' },
      { label: t('dashboard_lbl_supervision'), formula: t('dashboard_fml_supervision'), value: supervisionRatio, format: 'decimal' },
      { label: t('dashboard_lbl_avg_salary'), formula: t('dashboard_fml_avg_salary'), value: avgSalary, format: 'currency_cdf' },
    ];
  }, [data, t]);

  const formatValue = (val: number, type: string) => {
    if (!isFinite(val) || isNaN(val)) return '-';
    switch (type) {
        case 'percent': return val.toFixed(2) + '%';
        case 'decimal': return val.toFixed(2);
        case 'currency_cdf': return val.toLocaleString('fr-FR', { style: 'currency', currency: 'CDF' });
        default: return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
      <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-slate-50 border-b-2 border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-gray-700" />
          {t('sec_dashboard')}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                <tr className="border-b-2 border-slate-300">
                    <th className="px-3 py-2 font-semibold text-slate-700 w-1/3 border-r border-slate-200">{t('Dashboard_Indicator')}</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 w-1/3 border-r border-slate-200">{t('Dashboard_Formula')}</th>
                    <th className="px-3 py-2 font-bold text-slate-800 text-right w-1/3">{t('Dashboard_Value')}</th>
                </tr>
            </thead>
            <tbody>
                {metrics.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-gray-50 transition-all duration-150">
                        <td className="px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200">{m.label}</td>
                        <td className="px-3 py-2.5 text-slate-600 border-r border-slate-200">
                            <div className="flex items-center gap-2">
                              <Calculator size={12} className="text-slate-400" />
                              <span>{m.formula}</span>
                            </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-900">
                            {formatValue(m.value, m.format)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      <div className="m-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 text-slate-700 text-xs rounded-lg border-2 border-gray-300 shadow-sm">
        <strong className="text-gray-800">{t('Dashboard_Note')}</strong> {t('Dashboard_Note_Text')}
        {' '}{t('Dashboard_Note_Instruction')}
      </div>
    </div>
  );
};

export default SectionDashboard;
