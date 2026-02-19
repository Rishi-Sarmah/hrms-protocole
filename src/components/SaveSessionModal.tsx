import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface SaveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    sessionName: string,
    description: string,
    startDate: Date,
    endDate: Date,
  ) => void;
  isLoading?: boolean;
  error?: string | null;
  initialSessionName?: string;
  initialDescription?: string;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export const SaveSessionModal: React.FC<SaveSessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  error = null,
  initialSessionName = "",
  initialDescription = "",
  initialStartDate,
  initialEndDate,
}) => {
  const { t } = useTranslation();
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Initialize form with provided values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSessionName(initialSessionName);
      setDescription(initialDescription);
      setStartDate(
        initialStartDate
          ? new Date(initialStartDate).toISOString().split("T")[0]
          : "",
      );
      setEndDate(
        initialEndDate
          ? new Date(initialEndDate).toISOString().split("T")[0]
          : "",
      );
    }
  }, [
    isOpen,
    initialSessionName,
    initialDescription,
    initialStartDate,
    initialEndDate,
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionName.trim()) {
      alert(t("Session name is required"));
      return;
    }

    if (!startDate || !endDate) {
      alert(t("Start date and end date are required"));
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert(t("Start date must be before end date"));
      return;
    }

    onSave(sessionName, description, start, end);

    // Reset form
    setSessionName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
          <h2 className='text-lg font-bold text-slate-800'>
            {t("Save Session")}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='text-slate-400 hover:text-slate-600 disabled:opacity-50'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className='p-6 space-y-4'>
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
              {error}
            </div>
          )}

          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t("Session Name")} *
            </label>
            <input
              type='text'
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={t("Enter session name") || ""}
              disabled={isLoading}
              className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t("Description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Enter optional description") || ""}
              disabled={isLoading}
              rows={3}
              className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none disabled:bg-slate-100 disabled:cursor-not-allowed'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                {t("Start Date")} *
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed'
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                {t("End Date")} *
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
                className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed'
              />
            </div>
          </div>

          {/* Footer */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {t("Cancel")}
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {isLoading ? (
                <>
                  <span className='animate-spin'>⏳</span>
                  {t("Saving...")}
                </>
              ) : (
                t("Save Session")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
