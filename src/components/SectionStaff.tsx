import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { AppData } from "../types/budget";
import { Users, Banknote, Upload } from "lucide-react";
import * as XLSX from 'xlsx';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const SectionStaff: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        // Map Excel data to StaffRow format
        // Expected columns: Category, Grade, Male, Female
        const newStaff = jsonData.map((row, index) => ({
          id: `p${index + 1}`,
          category: String(row.Category || row.category || ''),
          grade: String(row.Grade || row.grade || ''),
          male: parseInt(String(row.Male || row.male || '0')) || 0,
          female: parseInt(String(row.Female || row.female || '0')) || 0,
        }));

        // Calculate management count
        const managementCount = newStaff
          .filter((row) => row.category === "MANAGEMENT STAFF")
          .reduce((sum, row) => sum + row.male + row.female, 0);

        onChange(Object.assign({}, data, {
          staff: newStaff,
          managementCount,
        }));

        alert(t('Data uploaded successfully!'));
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert(t('Error parsing Excel file. Please check the format.'));
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (event.target) event.target.value = '';
  };

  const handleRowChange = (
    id: string,
    field: "male" | "female",
    value: string,
  ) => {
    const numValue = parseInt(value) || 0;
    const newStaff = data.staff.map((row) =>
      row.id === id ? { ...row, [field]: numValue } : row,
    );

    // Auto-calculate management count (Sum of MANAGEMENT STAFF)
    const newManagementCount = newStaff
      .filter((row) => row.category === "MANAGEMENT STAFF")
      .reduce((sum, row) => sum + row.male + row.female, 0);

    onChange({
      ...data,
      staff: newStaff,
      managementCount: newManagementCount,
    });
  };

  const handleStatChange = (field: "salaryMassCDF", value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...data, [field]: numValue });
  };

  // Calculate Subtotals for display
  const totalMale = data.staff.reduce((acc, row) => acc + row.male, 0);
  const totalFemale = data.staff.reduce((acc, row) => acc + row.female, 0);

  // Calculated management count for display
  const calculatedManagementCount = data.staff
    .filter((row) => row.category === "MANAGEMENT STAFF")
    .reduce((sum, row) => sum + row.male + row.female, 0);

  return (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden'>
        <div className='px-6 py-3 bg-linear-to-r from-blue-50 to-slate-50 border-b-2 border-slate-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
              <Users className='w-5 h-5 text-gray-700' />
              {t("Staff")}
            </h2>
            <div>
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
                {t('Upload Excel')}
              </button>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-xs border-collapse'>
            <thead className='bg-linear-to-r from-slate-100 to-slate-50'>
              <tr className='border-b-2 border-slate-300'>
                <th className='px-3 py-2 text-left font-semibold text-slate-700 border-r border-slate-200'>
                  {t("Category")}
                </th>
                <th className='px-3 py-2 text-left font-semibold text-slate-700 border-r border-slate-200'>
                  {t("Grade")}
                </th>
                <th className='px-3 py-2 text-center font-semibold text-gray-800 bg-gray-50 border-r border-slate-200'>
                  {t("Male")}
                </th>
                <th className='px-3 py-2 text-center font-semibold text-gray-800 bg-gray-50 border-r border-slate-200'>
                  {t("Female")}
                </th>
                <th className='px-3 py-2 text-center font-semibold text-slate-700'>
                  {t("Total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.staff.map((row) => (
                <tr
                  key={row.id}
                  className='border-b border-slate-200 hover:bg-gray-50 transition-all duration-150'
                >
                  <td className='px-3 py-2 font-medium text-slate-900 border-r border-slate-200 text-xs'>
                    {t(row.category)}
                  </td>
                  <td className='px-3 py-2 font-mono text-slate-600 border-r border-slate-200 text-xs'>
                    {t(row.grade)}
                  </td>
                  <td className='px-3 py-2 text-center bg-gray-50/40 border-r border-slate-200'>
                    <input
                      type='number'
                      min='0'
                      className='w-20 text-center p-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white text-black hover:border-gray-400 transition-all font-semibold text-xs'
                      value={row.male || ""}
                      onChange={(e) =>
                        handleRowChange(row.id, "male", e.target.value)
                      }
                    />
                  </td>
                  <td className='px-3 py-2 text-center bg-gray-50/40 border-r border-slate-200'>
                    <input
                      type='number'
                      min='0'
                      className='w-20 text-center p-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white text-black hover:border-gray-400 transition-all font-semibold text-xs'
                      value={row.female || ""}
                      onChange={(e) =>
                        handleRowChange(row.id, "female", e.target.value)
                      }
                    />
                  </td>
                  <td className='px-3 py-2 text-center font-bold text-sm text-slate-800'>
                    {row.male + row.female}
                  </td>
                </tr>
              ))}
              <tr className='bg-linear-to-r from-slate-800 to-slate-700 text-white font-bold border-t-4 border-slate-900'>
                <td
                  colSpan={2}
                  className='px-3 py-2 text-right uppercase tracking-wider text-sm border-r border-slate-600'
                >
                  {t('TOTAL')}
                </td>
                <td className='px-3 py-2 text-center text-sm font-mono border-r border-slate-600'>
                  {totalMale}
                </td>
                <td className='px-3 py-2 text-center text-sm font-mono border-r border-slate-600'>
                  {totalFemale}
                </td>
                <td className='px-3 py-2 text-center text-base font-mono text-white'>
                  {totalMale + totalFemale}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-linear-to-br from-slate-50 to-white p-4 rounded-xl shadow-lg border-2 border-slate-200 hover:shadow-xl transition-shadow'>
          <label className='block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide'>
            {t("Management Staff Count")}
          </label>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-slate-200 rounded-lg'>
              <Users className='w-5 h-5 text-slate-600' />
            </div>
            <input
              type='number'
              readOnly
              className='flex-1 p-2 border-2 border-slate-300 rounded-lg outline-none bg-slate-100 text-slate-800 cursor-not-allowed font-bold text-sm shadow-inner'
              value={calculatedManagementCount}
              title='Calculated automatically from Management Staff category'
            />
          </div>
        </div>
        <div className='bg-linear-to-br from-gray-50 to-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow'>
          <label className='block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide'>
            {t("Mass Salary in CDF")}
          </label>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gray-200 rounded-lg'>
              <Banknote className='w-5 h-5 text-gray-700' />
              
            </div>
            <input
              type='number'
              className='flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white text-black hover:border-gray-400 transition-all font-bold text-sm'
              value={data.salaryMassCDF || ""}
              onChange={(e) =>
                handleStatChange("salaryMassCDF", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionStaff;
