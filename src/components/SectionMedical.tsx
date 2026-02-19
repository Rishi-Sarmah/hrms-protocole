import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppData, MedicalTransfer } from '../types/budget';
import { HeartPulse, Plane, Plus } from 'lucide-react';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const SectionMedical: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  // Use a ref to maintain a counter across renders for ID generation
  const idCounterRef = useRef(0);
  
  // Handlers for simple nested objects
  const handleMissionChange = (type: 'performed' | 'received', field: 'count' | 'cost', value: string) => {
    const num = parseFloat(value) || 0;
    onChange({
      ...data,
      serviceMissions: {
        ...data.serviceMissions,
        [type]: { ...data.serviceMissions[type], [field]: num }
      }
    });
  };

  const handleMedicalCareChange = (index: number, field: 'usd' | 'cdf', value: string) => {
    const num = parseFloat(value) || 0;
    const newCare = [...data.medicalCare];
    newCare[index] = { ...newCare[index], [field]: num };
    onChange({ ...data, medicalCare: newCare });
  };

  const handleTransferChange = (
    listType: 'transfersKinshasa' | 'transfersAbroad',
    id: string, 
    field: keyof MedicalTransfer, 
    value: string
  ) => {
    const newList = data[listType].map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          [field]: (field === 'entity' || field === 'observation') ? value : (parseFloat(value) || 0) 
        };
      }
      return item;
    });
    onChange({ ...data, [listType]: newList });
  };

  const addTransferRow = useCallback((listType: 'transfersKinshasa' | 'transfersAbroad') => {
    idCounterRef.current += 1;
    const newId = `transfer-${idCounterRef.current}`;
    const newRow: MedicalTransfer = { id: newId, entity: '', agents: 0, retirees: 0, wives: 0, children: 0, totalUsd: 0, observation: '' };
    onChange({ ...data, [listType]: [...data[listType], newRow] });
  }, [data, onChange]);

  const handleCostChange = (section: 'missionCosts' | 'divers', key: string, currency: 'usd' | 'cdf', value: string) => {
    const num = parseFloat(value) || 0;
    if (section === 'missionCosts') {
        // key is inside or abroad
        onChange({
            ...data,
            missionCosts: {
                ...data.missionCosts,
                [key]: { ...data.missionCosts[key as 'inside' | 'abroad'], [currency]: num }
            }
        });
    } else {
        // key is category name match
        const newDivers = data.divers.map(d => d.category === key ? { ...d, [currency]: num } : d);
        onChange({ ...data, divers: newDivers });
    }
  };

  return (
    <div className="space-y-6">
        
      {/* Service Missions */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{t('Missions')}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200">
                  <h4 className="font-bold mb-3 text-sm text-gray-800 uppercase tracking-wide">{t('Performed')}</h4>
                  <div className="flex gap-2">
                      <input type="number" placeholder="Count" className="border-2 border-gray-300 p-2 rounded-lg w-1/3 bg-white text-black focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 text-xs font-semibold" value={data.serviceMissions.performed.count || ''} onChange={e => handleMissionChange('performed', 'count', e.target.value)} />
                      <input type="number" placeholder="Cost" className="border-2 border-gray-300 p-2 rounded-lg w-2/3 bg-white text-black focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 text-xs font-semibold" value={data.serviceMissions.performed.cost || ''} onChange={e => handleMissionChange('performed', 'cost', e.target.value)} />
                  </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200">
                  <h4 className="font-bold mb-3 text-sm text-gray-800 uppercase tracking-wide">{t('Received')}</h4>
                  <div className="flex gap-2">
                      <input type="number" placeholder="Count" className="border-2 border-gray-300 p-2 rounded-lg w-1/3 bg-white text-black focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 text-xs font-semibold" value={data.serviceMissions.received.count || ''} onChange={e => handleMissionChange('received', 'count', e.target.value)} />
                      <input type="number" placeholder="Cost" className="border-2 border-gray-300 p-2 rounded-lg w-2/3 bg-white text-black focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 text-xs font-semibold" value={data.serviceMissions.received.cost || ''} onChange={e => handleMissionChange('received', 'cost', e.target.value)} />
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Medical Care */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-3 bg-gradient-to-r from-red-50 to-slate-50 border-b-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 flex gap-2 items-center">
            <HeartPulse className="text-red-500 w-5 h-5" /> 
            {t('Medical Care')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                  <tr className="border-b-2 border-slate-300">
                      <th className="px-3 py-2 text-left font-semibold text-slate-700 border-r border-slate-200">Category</th>
                      <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">Montant (USD)</th>
                      <th className="px-3 py-2 text-center font-semibold text-slate-700">Montant (CDF)</th>
                  </tr>
              </thead>
              <tbody>
                  {data.medicalCare.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-gray-50 transition-all duration-150">
                          <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">{t(item.category)}</td>
                          <td className="px-3 py-2 border-r border-slate-200">
<input type="number" className="border-2 border-slate-300 rounded-lg p-1.5 w-full bg-white text-black focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 text-xs font-semibold text-center" value={item.usd || ''} onChange={e => handleMedicalCareChange(idx, 'usd', e.target.value)} /></td>
                          <td className="px-3 py-2"><input type="number" className="border-2 border-slate-300 rounded-lg p-1.5 w-full bg-white text-black focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 text-xs font-semibold text-center" value={item.cdf || ''} onChange={e => handleMedicalCareChange(idx, 'cdf', e.target.value)} /></td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      </div>

      {/* Transfers */}
      {['transfersKinshasa', 'transfersAbroad'].map((key) => (
          <div key={key} className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-slate-50 to-white border-b-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-gray-600" />
                    {t(key === 'transfersKinshasa' ? 'Transfers Kinshasa' : 'Transfers Abroad')}
                </h3>
                <button onClick={() => addTransferRow(key as 'transfersKinshasa' | 'transfersAbroad')} className="text-sm bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-all shadow-md hover:shadow-lg font-medium">
                    <Plus size={14} /> Add Row
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse min-w-200">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                        <tr className="border-b-2 border-slate-300">
                            <th className="px-3 py-2 text-left font-semibold text-slate-700 border-r border-slate-200">{t('Entity')}</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">{t('Agents')}</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">{t('Retirees')}</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">{t('Wives')}</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">{t('Children')}</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">Total USD</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">{t('Observation')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data[key as keyof AppData] as MedicalTransfer[]).map((row) => (
                            <tr key={row.id} className="border-b border-slate-200 hover:bg-slate-50 transition-all duration-150">
                                <td className="p-1 border-r border-slate-200"><input className="border-2 border-slate-300 w-full p-1.5 bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-slate-400 text-xs" value={row.entity} onChange={e => handleTransferChange(key as 'transfersKinshasa' | 'transfersAbroad', row.id, 'entity', e.target.value)} /></td>
                                <td className="p-1 border-r border-slate-200"><input type="number" className="border-2 border-slate-300 w-16 p-1.5 text-center bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-slate-400 text-xs font-semibold" value={row.agents || ''} onChange={e => handleTransferChange(key as 'transfersKinshasa' | 'transfersAbroad', row.id, 'agents', e.target.value)} /></td>
                                <td className="p-1 border-r border-slate-200"><input type="number" className="border-2 border-slate-300 w-16 p-1.5 text-center bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-slate-400 text-xs font-semibold" value={row.retirees || ''} onChange={e => handleTransferChange(key as 'transfersKinshasa' | 'transfersAbroad', row.id, 'retirees', e.target.value)} /></td>
                                <td className="p-1 border-r border-slate-200"><input type="number" className="border-2 border-slate-300 w-16 p-1.5 text-center bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-slate-400 text-xs font-semibold" value={row.wives || ''} onChange={e => handleTransferChange(key as 'transfersKinshasa' | 'transfersAbroad', row.id, 'wives', e.target.value)} /></td>
                                <td className="p-1 border-r border-slate-200"><input type="number" className="border-2 border-slate-300 w-16 p-1.5 text-center bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-slate-400 text-xs font-semibold" value={row.children || ''} onChange={e => handleTransferChange(key as 'transfersKinshasa' | 'transfersAbroad', row.id, 'children', e.target.value)} /></td>
                                <td className="p-1 border-r border-slate-200"><input type="number" className="border-2 border-slate-300 w-24 p-1.5 text-right bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-slate-400 text-xs font-semibold" value={row.totalUsd || ''} onChange={e => handleTransferChange(key as 'transfersKinshasa' | 'transfersAbroad', row.id, 'totalUsd', e.target.value)} /></td>
                                <td className="p-1"><input className="border-2 border-slate-300 w-full p-1.5 bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-slate-400 text-xs" value={row.observation} onChange={e => handleTransferChange(key as 'transfersKinshasa' | 'transfersAbroad', row.id, 'observation', e.target.value)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      ))}

      {/* Divers & Mission Costs */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-slate-50 border-b-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{t('Divers')}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Missions Costs */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border-2 border-gray-200">
                  <h4 className="font-bold text-sm text-gray-800 mb-3 pb-2 border-b-2 border-gray-300 uppercase tracking-wide">Missions Cost</h4>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-700">{t('Inside')}</span>
                          <div className="flex gap-2">
                              <input type="number" placeholder="USD" className="border-2 border-gray-300 p-1.5 w-20 text-xs bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 font-semibold text-center" value={data.missionCosts.inside.usd || ''} onChange={e => handleCostChange('missionCosts', 'inside', 'usd', e.target.value)} />
                              <input type="number" placeholder="CDF" className="border-2 border-gray-300 p-1.5 w-20 text-xs bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 font-semibold text-center" value={data.missionCosts.inside.cdf || ''} onChange={e => handleCostChange('missionCosts', 'inside', 'cdf', e.target.value)} />
                          </div>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-700">{t('Abroad')}</span>
                          <div className="flex gap-2">
                              <input type="number" placeholder="USD" className="border-2 border-gray-300 p-1.5 w-20 text-xs bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 font-semibold text-center" value={data.missionCosts.abroad.usd || ''} onChange={e => handleCostChange('missionCosts', 'abroad', 'usd', e.target.value)} />
                              <input type="number" placeholder="CDF" className="border-2 border-gray-300 p-1.5 w-20 text-xs bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 font-semibold text-center" value={data.missionCosts.abroad.cdf || ''} onChange={e => handleCostChange('missionCosts', 'abroad', 'cdf', e.target.value)} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Other Divers */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border-2 border-gray-200">
                  <h4 className="font-bold text-sm text-gray-800 mb-3 pb-2 border-b-2 border-gray-300 uppercase tracking-wide">Others</h4>
                  <div className="space-y-3">
                      {data.divers.map(d => (
                          <div key={d.category} className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-slate-700 truncate mr-2" title={t(d.category)}>{t(d.category)}</span>
                              <div className="flex gap-2">
                                  <input type="number" placeholder="USD" className="border-2 border-gray-300 p-1.5 w-20 text-xs bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 font-semibold text-center" value={d.usd || ''} onChange={e => handleCostChange('divers', d.category, 'usd', e.target.value)} />
                                  <input type="number" placeholder="CDF" className="border-2 border-gray-300 p-1.5 w-20 text-xs bg-white text-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all hover:border-gray-400 font-semibold text-center" value={d.cdf || ''} onChange={e => handleCostChange('divers', d.category, 'cdf', e.target.value)} />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SectionMedical;
