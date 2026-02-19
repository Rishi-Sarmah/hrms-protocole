import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppData, BudgetData, BudgetRow } from '../types/budget';
import { Coins, Banknote, Plus, Trash2, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SectionBudgetProps {
  data: AppData;
  onChange: (data: AppData) => void;
}

interface BudgetTableProps {
  title: string;
  rows: BudgetRow[];
  sectionKey: keyof BudgetData;
  
  colorClass: string;
  onBudgetChange: (section: keyof BudgetData, id: string, field: 'forecast' | 'achievement', value: string) => void;
  allowAdd?: boolean;
  onAddRow?: () => void;
  onDeleteRow?: (id: string) => void;
  onLabelChange?: (id: string, newLabel: string) => void;
  showSerial?: boolean;
  insertSubtotalBeforeId?: string;
  subtotalLabel?: string;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ 
  title, 
  rows, 
  sectionKey,
  colorClass,
  onBudgetChange,
  allowAdd,

  onAddRow,
  onDeleteRow,
  onLabelChange,
  showSerial,
  insertSubtotalBeforeId,
  subtotalLabel
}) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleStartEdit = (row: BudgetRow) => {
    if (!onLabelChange) return;
    setEditingId(row.id);
    setEditValue(t(row.label));
  };

  const handleFinishEdit = (id: string) => {
    if (onLabelChange && editValue.trim() !== '') {
      onLabelChange(id, editValue);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleFinishEdit(id);
    }
  };

  const calculateTotal = (rows: BudgetRow[], field: 'forecast' | 'achievement') => {
    return rows.reduce((sum, row) => sum + row[field], 0);
  };

  const calculateRate = (forecast: number, achievement: number) => {
    if (forecast === 0) return "0.00";
    return ((achievement / forecast) * 100).toFixed(2);
  };

  const totalForecast = calculateTotal(rows, 'forecast');
  const totalAchievement = calculateTotal(rows, 'achievement');
  const totalRate = calculateRate(totalForecast, totalAchievement);

  // Calculate Subtotal Logic
  const subtotalIndex = insertSubtotalBeforeId ? rows.findIndex(r => r.id === insertSubtotalBeforeId) : -1;
  let subForecast = 0;
  let subAchievement = 0;
  let subRate = "0.00";

  if (subtotalIndex !== -1) {
    const subRows = rows.slice(0, subtotalIndex);
    subForecast = calculateTotal(subRows, 'forecast');
    subAchievement = calculateTotal(subRows, 'achievement');
    subRate = calculateRate(subForecast, subAchievement);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden mb-8">
      <div className="flex justify-between items-center px-6 py-3 bg-linear-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
        <h2 className={`text-lg font-bold flex items-center gap-2 ${colorClass}`}>
         
          {title}
        </h2>
        {allowAdd && onAddRow && (
          <button 
            onClick={onAddRow}
            className="flex items-center gap-1 text-xs bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus size={14} />
            {t('Add Row')}
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-linear-to-r from-slate-100 to-slate-50">
            <tr className="border-b-2 border-slate-300">
              {showSerial && <th className="px-3 py-2 w-10 text-center font-semibold text-slate-700 border-r border-slate-200">#</th>}
              <th className="px-3 py-2 w-1/2 text-left font-semibold text-slate-700 border-r border-slate-200">{t('Designation')}</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">{t('Forecast')}</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">{t('Achievements')}</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200">{t('RealRate')}</th>
              {allowAdd && <th className="px-3 py-2 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <React.Fragment key={row.id}>
                {insertSubtotalBeforeId === row.id && (
                  <tr className="bg-linear-to-r from-slate-200 to-slate-100 font-bold border-y-2 border-slate-400">
                    {showSerial && <td className="border-r border-slate-300"></td>}
                    <td className="px-3 py-2 text-right uppercase text-slate-800 font-bold tracking-wide border-r border-slate-300 text-xs">{t(subtotalLabel || 'SUBTOTAL')}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-800 border-r border-slate-300">{subForecast.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-800 border-r border-slate-300">{subAchievement.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-800 border-r border-slate-300">{subRate}%</td>
                    {allowAdd && <td></td>}
                  </tr>
                )}
                <tr className="hover:bg-gray-50 transition-all duration-150 group border-b border-slate-200">
                  {showSerial && (
                    <td className="px-3 py-2 text-center text-slate-500 font-semibold text-xs border-r border-slate-200 bg-slate-50">
                      {index + 1}
                    </td>
                  )}
                  <td className="px-3 py-2 font-semibold text-slate-800 border-r border-slate-200">
                    {editingId === row.id ? (
                      <input 
                        ref={inputRef}
                        type="text" 
                        className="w-full p-2 border-2 border-gray-400 rounded-lg outline-none bg-white text-black shadow-md focus:shadow-lg transition-all"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleFinishEdit(row.id)}
                        onKeyDown={(e) => handleKeyDown(e, row.id)}
                      />
                    ) : (
                      <span 
                        onClick={() => allowAdd ? handleStartEdit(row) : undefined}
                        className={allowAdd ? "cursor-pointer hover:text-gray-900 transition-colors" : ""}
                        title={allowAdd ? "Click to edit label" : ""}
                      >
                        {t(row.label)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-200">
                    <input 
                      type="number" 
                      className="w-full text-center p-1.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all bg-white text-black hover:border-slate-400 text-xs font-semibold"
                      value={row.forecast || ''}
                      onChange={(e) => onBudgetChange(sectionKey, row.id, 'forecast', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 border-r border-slate-200">
                    <input 
                      type="number" 
                      className="w-full text-center p-1.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all bg-white text-black hover:border-slate-400 text-xs font-semibold"
                      value={row.achievement || ''}
                      onChange={(e) => onBudgetChange(sectionKey, row.id, 'achievement', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-center font-semibold font-mono text-slate-700 border-r border-slate-200">
                    {calculateRate(row.forecast, row.achievement)}%
                  </td>
                  {allowAdd && (
                     <td className="px-3 py-2 text-center">
                       {onDeleteRow && (
                         <button 
                           onClick={() => onDeleteRow(row.id)}
                           className="text-red-400 hover:text-red-600 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-full hover:bg-red-50"
                           title="Delete Row"
                         >
                           <Trash2 size={18} />
                         </button>
                       )}
                     </td>
                  )}
                </tr>
              </React.Fragment>
            ))}
            <tr className="bg-linear-to-r from-slate-800 to-slate-700 text-white font-bold border-t-4 border-slate-900">
              {showSerial && <td className="border-r border-slate-600"></td>}
              <td className="px-3 py-2 text-right uppercase tracking-wider text-xs border-r border-slate-600">{t('GRAND TOTAL')}</td>
              <td className="px-3 py-2 text-center font-mono text-xs border-r border-slate-600">{totalForecast.toFixed(2)}</td>
              <td className="px-3 py-2 text-center font-mono text-xs border-r border-slate-600">{totalAchievement.toFixed(2)}</td>
              <td className="px-3 py-2 text-center font-mono font-bold text-xs text-gray-100 border-r border-slate-600">{totalRate}%</td>
              {allowAdd && <td></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SectionBudget: React.FC<SectionBudgetProps> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const budget = data.budget;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: 'binary' });

        // Expected sheets: Production, Charges, Treasury Receipts, Treasury Disbursements
        const newBudget: BudgetData = {
          production: [],
          charges: [],
          treasuryReceipts: [],
          treasuryDisbursements: [],
        };

        // Parse Production sheet
        if (workbook.SheetNames.includes('Production')) {
          const sheet = workbook.Sheets['Production'];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
          newBudget.production = jsonData.map((row, index) => ({
            id: String(row.id || `p${index + 1}`),
            label: String(row.Label || row.label || row.Designation || ''),
            forecast: parseFloat(String(row.Forecast || row.forecast || '0')) || 0,
            achievement: parseFloat(String(row.Achievement || row.achievement || row.Achievements || '0')) || 0,
          }));
        }

        // Parse Charges sheet
        if (workbook.SheetNames.includes('Charges')) {
          const sheet = workbook.Sheets['Charges'];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
          newBudget.charges = jsonData.map((row, index) => ({
            id: String(row.id || `bc${index + 1}`),
            label: String(row.Label || row.label || row.Designation || ''),
            forecast: parseFloat(String(row.Forecast || row.forecast || '0')) || 0,
            achievement: parseFloat(String(row.Achievement || row.achievement || row.Achievements || '0')) || 0,
            isCustom: Boolean(row.isCustom) || false,
          }));
        }

        // Parse Treasury Receipts sheet
        if (workbook.SheetNames.includes('Treasury Receipts')) {
          const sheet = workbook.Sheets['Treasury Receipts'];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
          newBudget.treasuryReceipts = jsonData.map((row, index) => ({
            id: String(row.id || `tr${index + 1}`),
            label: String(row.Label || row.label || row.Designation || ''),
            forecast: parseFloat(String(row.Forecast || row.forecast || '0')) || 0,
            achievement: parseFloat(String(row.Achievement || row.achievement || row.Achievements || '0')) || 0,
          }));
        }

        // Parse Treasury Disbursements sheet
        if (workbook.SheetNames.includes('Treasury Disbursements')) {
          const sheet = workbook.Sheets['Treasury Disbursements'];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
          newBudget.treasuryDisbursements = jsonData.map((row, index) => ({
            id: String(row.id || `td${index + 1}`),
            label: String(row.Label || row.label || row.Designation || ''),
            forecast: parseFloat(String(row.Forecast || row.forecast || '0')) || 0,
            achievement: parseFloat(String(row.Achievement || row.achievement || row.Achievements || '0')) || 0,
            isCustom: Boolean(row.isCustom) || false,
          }));
        }

        onChange({
          ...data,
          budget: newBudget,
        });

        alert(t('Budget data uploaded successfully!'));
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert(t('Error parsing Excel file. Please ensure sheets are named: Production, Charges, Treasury Receipts, Treasury Disbursements'));
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (event.target) event.target.value = '';
  };

  const handleBudgetChange = (section: keyof BudgetData, id: string, field: 'forecast' | 'achievement', value: string) => {
    const num = parseFloat(value) || 0;
    const newSectionData = budget[section].map((row) => 
      row.id === id ? { ...row, [field]: num } : row
    );
    onChange({
      ...data,
      budget: { ...budget, [section]: newSectionData }
    });
  };

  // Helper to map Charges ID to Treasury Disbursements ID
  const getLinkedTreasuryId = (chargeId: string) => {
    // Map standard IDs (bc1 -> td1, etc.)
    const standardMapping: Record<string, string> = {
      'bc1': 'td1',
      'bc2': 'td2',
      'bc3': 'td3',
      'bc4': 'td4',
      'bc5': 'td5',
      'bc6': 'td6',
      'bc7': 'td7',
      'bc8': 'td8',
      'bc9': 'td9',
    };

    if (standardMapping[chargeId]) {
      return standardMapping[chargeId];
    }
    // Map custom IDs
    return `td_${chargeId}`;
  };

  // Logic to add a row to Charges and sync with Treasury Disbursements
  const handleAddChargeRow = () => {
    const newId = `custom_${Date.now()}`;
    const newLabel = 'New Charge';

    const newChargeRow: BudgetRow = {
      id: newId,
      label: newLabel,
      forecast: 0,
      achievement: 0,
      isCustom: true
    };

    const newDisbursementRow: BudgetRow = {
      id: `td_${newId}`, // Linked ID
      label: newLabel,
      forecast: 0,
      achievement: 0,
      isCustom: true
    };

    // Add to Charges
    const newCharges = [...budget.charges, newChargeRow];

    // Add to Treasury Disbursements (before the last 3 fixed items)
    const treasury = [...budget.treasuryDisbursements];
    const insertIndex = Math.max(0, treasury.length - 3);
    treasury.splice(insertIndex, 0, newDisbursementRow);

    onChange({
      ...data,
      budget: {
        ...budget,
        charges: newCharges,
        treasuryDisbursements: treasury
      }
    });
  };

  // Logic to delete a row from Charges and sync
  const handleDeleteChargeRow = (id: string) => {
    // Remove from Charges
    const newCharges = budget.charges.filter(row => row.id !== id);

    // Remove from Treasury Disbursements (Using linked ID convention)
    const linkedId = getLinkedTreasuryId(id);
    const newTreasury = budget.treasuryDisbursements.filter(row => row.id !== linkedId);

    onChange({
      ...data,
      budget: {
        ...budget,
        charges: newCharges,
        treasuryDisbursements: newTreasury
      }
    });
  };

  // Logic to update label in Charges and sync
  const handleLabelChange = (id: string, newLabel: string) => {
    // Update Charges
    const newCharges = budget.charges.map(row => 
      row.id === id ? { ...row, label: newLabel } : row
    );

    // Update Treasury Disbursements
    const linkedId = getLinkedTreasuryId(id);
    const newTreasury = budget.treasuryDisbursements.map(row => 
      row.id === linkedId ? { ...row, label: newLabel } : row
    );

    onChange({
      ...data,
      budget: {
        ...budget,
        charges: newCharges,
        treasuryDisbursements: newTreasury
      }
    });
  };

  const calculateTotal = (rows: BudgetRow[], field: 'forecast' | 'achievement') => {
    return rows.reduce((sum, row) => sum + row[field], 0);
  };

  const calculateRate = (forecast: number, achievement: number) => {
    if (forecast === 0) return "0.00";
    return ((achievement / forecast) * 100).toFixed(2);
  };

  // Treasury Summary Calculation
  const receiptsForecast = calculateTotal(budget.treasuryReceipts, 'forecast');
  const receiptsAchievement = calculateTotal(budget.treasuryReceipts, 'achievement');
  
  const disbursementsForecast = calculateTotal(budget.treasuryDisbursements, 'forecast');
  const disbursementsAchievement = calculateTotal(budget.treasuryDisbursements, 'achievement');
  
  const balanceForecast = receiptsForecast - disbursementsForecast;
  const balanceAchievement = receiptsAchievement - disbursementsAchievement;
  const balanceRate = calculateRate(Math.abs(balanceForecast), Math.abs(balanceAchievement));

  return (
    <div className="space-y-4">
      
      {/* Upload Button */}
      <div className="flex justify-end mb-4">
        <input
          ref={fileInputRef}
          type='file'
          accept='.xlsx,.xls'
          onChange={handleExcelUpload}
          className='hidden'
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className='flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-all text-sm font-medium shadow-md hover:shadow-lg'
        >
          <Upload className='w-4 h-4' />
          {t('Upload Budget Excel')}
        </button>
      </div>

      {/* Budget d'Exploitation */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <BudgetTable 
          title={t('Budget - Production')} 
          rows={budget.production} 
          sectionKey="production"
          
          colorClass="text-gray-800"
          onBudgetChange={handleBudgetChange}
        />
        <BudgetTable 
          title={t('Budget - Charges')} 
          rows={budget.charges} 
          sectionKey="charges"
          
          colorClass="text-red-700"
          onBudgetChange={handleBudgetChange}
          allowAdd={true}
          onAddRow={handleAddChargeRow}
          onDeleteRow={handleDeleteChargeRow}
          onLabelChange={handleLabelChange}
          showSerial={true}
        />
      </div>

      <div className="my-8 border-t-2 border-slate-300"></div>

      {/* Budget de Trésorerie */}
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 bg-linear-to-r from-gray-50 to-transparent p-3 rounded-lg border-l-4 border-gray-800">
        <Banknote className="w-5 h-5 text-gray-800" />
        {t('Treasury Budget')}
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <BudgetTable 
          title={t('Treasury - Receipts')} 
          rows={budget.treasuryReceipts} 
          sectionKey="treasuryReceipts"
          
          colorClass="text-gray-800"

          onBudgetChange={handleBudgetChange}
        />
        <BudgetTable 
          title={t('Treasury - Disbursements')} 
          rows={budget.treasuryDisbursements} 
          sectionKey="treasuryDisbursements"
          
          colorClass="text-gray-800"

          onBudgetChange={handleBudgetChange}
          insertSubtotalBeforeId="td10"
          subtotalLabel="Total Operations"
        />
      </div>

      {/* Summary Card for Treasury Balance */}
      <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-2xl mt-6 border-2 border-slate-700">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-600 pb-3">
            <Coins className="text-gray-100 w-5 h-5" />
            {t('BALANCE AT THE END OF PERIOD')}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-linear-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-xs text-slate-300 uppercase mb-2 font-semibold tracking-wide">{t('Forecast')}</div>
                <div className="text-xl font-mono font-bold text-white">{balanceForecast.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-linear-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-xs text-slate-300 uppercase mb-2 font-semibold tracking-wide">{t('Achievements')}</div>
                <div className="text-xl font-mono font-bold text-white">{balanceAchievement.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-linear-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-xs text-slate-300 uppercase mb-2 font-semibold tracking-wide">{t('RealRate')}</div>
                <div className="text-xl font-mono font-bold text-gray-100">{balanceRate}%</div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default SectionBudget;
