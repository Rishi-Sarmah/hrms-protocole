import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppData, MovementRow } from '../types/budget';
import { ArrowLeftRight, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const SectionMovement: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleMoveChange = (id: string, field: 'type' | 'count' | 'observation', value: string) => {
    const newMovements = data.movements.map(m => {
      if (m.id === id) {
        return { 
          ...m, 
          [field]: field === 'count' ? (parseInt(value) || 0) : value 
        };
      }
      return m;
    });
    onChange({ ...data, movements: newMovements });
  };

  const handleAddRow = () => {
    const newId = `custom_${Date.now()}`;
    const newRow: MovementRow = {
      id: newId,
      type: 'New Movement',
      count: 0,
      observation: '',
      isCustom: true
    };
    onChange({ ...data, movements: [...data.movements, newRow] });
    setEditingId(newId);
  };

  const handleDeleteRow = (id: string) => {
    const newMovements = data.movements.filter(m => m.id !== id);
    onChange({ ...data, movements: newMovements });
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const toggleEdit = (id: string) => {
    if (editingId === id) {
      setEditingId(null); // Save (Exit edit mode)
    } else {
      setEditingId(id); // Edit
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-orange-50 to-slate-50 border-b-2 border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-orange-600" />
          {t('sec_movement')}
        </h2>
        <button 
          onClick={handleAddRow}
          className="flex items-center gap-1 text-sm bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Plus size={16} />
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
            <tr className="border-b-2 border-slate-300">
              <th className="px-3 py-2 w-16 text-center font-semibold text-slate-700 border-r border-slate-200">No.</th>
              <th className="px-3 py-2 w-1/3 text-left font-semibold text-slate-700 border-r border-slate-200">{t('Movement')}</th>
              <th className="px-3 py-2 text-center w-24 font-semibold text-slate-700 border-r border-slate-200">{t('Effectif')}</th>
              <th className="px-3 py-2 w-1/3 text-left font-semibold text-slate-700 border-r border-slate-200">{t('Observation')}</th>
              <th className="px-3 py-2 w-24 text-center font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.movements.map((item, index) => {
              const isEditing = editingId === item.id;
              
              return (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-orange-50/30 transition-all duration-150 group">
                  <td className="px-3 py-2 text-center text-slate-500 font-semibold border-r border-slate-200 bg-slate-50">
                    {index + 1}
                  </td>
                  
                  {/* Movement Name */}
                  <td className="px-3 py-2 font-medium border-r border-slate-200">
                     {isEditing && item.isCustom ? (
                        <input 
                          type="text"
                          className="w-full p-1.5 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white text-slate-800 hover:border-orange-400 transition-all"
                          value={item.type}
                          onChange={(e) => handleMoveChange(item.id, 'type', e.target.value)}
                        />
                     ) : (
                        <span className={item.isCustom ? "text-slate-800 font-medium" : "text-slate-700"}>
                          {t(item.type)}
                        </span>
                     )}
                  </td>

                  {/* Count / Effectif */}
                  <td className="px-3 py-2 text-center border-r border-slate-200 bg-orange-50/40">
                    {isEditing ? (
                      <input 
                        type="number"
                        className="w-full text-center p-1.5 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white text-black hover:border-orange-400 transition-all font-semibold"
                        value={item.count}
                        onChange={(e) => handleMoveChange(item.id, 'count', e.target.value)}
                      />
                    ) : (
                      <span className="font-bold text-sm text-slate-800">{item.count}</span>
                    )}
                  </td>

                  {/* Observation */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    {isEditing ? (
                      <input 
                        type="text"
                        className="w-full p-1.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white text-black hover:border-slate-400 transition-all"
                        value={item.observation}
                        onChange={(e) => handleMoveChange(item.id, 'observation', e.target.value)}
                      />
                    ) : (
                      <span className="text-slate-600 italic min-h-5 block">
                        {item.observation}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => toggleEdit(item.id)}
                        className={`${isEditing ? 'text-green-600 hover:text-green-800 hover:scale-110' : 'text-blue-500 hover:text-blue-700 hover:scale-110'} transition-all p-1 rounded-full hover:bg-slate-100`}
                        title={isEditing ? "Save" : "Edit"}
                      >
                        {isEditing ? <Check size={18} /> : <Edit2 size={16} />}
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteRow(item.id)}
                        className="text-slate-400 hover:text-red-600 hover:scale-110 transition-all p-1 rounded-full hover:bg-red-50"
                        title="Delete Row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectionMovement;
