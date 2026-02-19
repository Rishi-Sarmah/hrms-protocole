import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession } from "../contexts/SessionContext";
import type { SessionDetails } from "../contexts/SessionContext";
import { Calendar, FileText, ArrowRight, X } from "lucide-react";

interface SessionDetailsFormProps {
  onClose?: () => void;
}

export const SessionDetailsForm: React.FC<SessionDetailsFormProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSessionDetails } = useSession();

  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!sessionName.trim()) {
      newErrors.sessionName =
        t("Session name is required") || "Session name is required";
    }
    if (!startDate) {
      newErrors.startDate =
        t("Start date is required") || "Start date is required";
    }
    if (!endDate) {
      newErrors.endDate = t("End date is required") || "End date is required";
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        newErrors.dateRange =
          t("Start date must be before end date") ||
          "Start date must be before end date";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Set session details and navigate
    const sessionDetails: SessionDetails = {
      sessionName,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    setSessionDetails(sessionDetails);
    navigate("/budget");
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Card */}
        <div className='bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 relative'>
            <button
              onClick={() => (onClose ? onClose() : navigate("/"))}
              className='absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition'
              title={t("Back to Dashboard") || "Back to Dashboard"}
            >
              <X className='w-5 h-5' />
            </button>
            <h1 className='text-2xl font-bold text-white flex items-center gap-3'>
              <FileText className='w-7 h-7' />
              {t("New Session")}
            </h1>
            <p className='text-gray-100 text-sm mt-2'>
              {t("Fill in the details to start a new session")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
            {/* Session Name */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                {t("Session Name")} *
              </label>
              <input
                type='text'
                value={sessionName}
                onChange={(e) => {
                  setSessionName(e.target.value);
                  if (errors.sessionName) {
                    setErrors({ ...errors, sessionName: "" });
                  }
                }}
                placeholder={t("Enter session name") || "e.g., Q1 2026 Report"}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition ${
                  errors.sessionName
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-slate-50"
                }`}
              />
              {errors.sessionName && (
                <p className='text-red-600 text-xs mt-1'>
                  {errors.sessionName}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                {t("Description")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  t("Enter optional description") ||
                  "e.g., Comments or notes about this session"
                }
                rows={3}
                className='w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none resize-none bg-slate-50 transition'
              />
            </div>

            {/* Dates Section */}
            <div className='space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <div className='flex items-center gap-2 text-slate-700'>
                <Calendar className='w-4 h-4 text-gray-700' />
                <label className='text-sm font-semibold'>
                  {t("Reporting Period")}
                </label>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-slate-600 mb-1'>
                    {t("Start Date")} *
                  </label>
                  <input
                    type='date'
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (errors.startDate || errors.dateRange) {
                        setErrors({ ...errors, startDate: "", dateRange: "" });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition text-sm ${
                      errors.startDate
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white"
                    }`}
                  />
                  {errors.startDate && (
                    <p className='text-red-600 text-xs mt-1'>
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-semibold text-slate-600 mb-1'>
                    {t("End Date")} *
                  </label>
                  <input
                    type='date'
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (errors.endDate || errors.dateRange) {
                        setErrors({ ...errors, endDate: "", dateRange: "" });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition text-sm ${
                      errors.endDate
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white"
                    }`}
                  />
                  {errors.endDate && (
                    <p className='text-red-600 text-xs mt-1'>
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {errors.dateRange && (
                <p className='text-red-600 text-xs'>{errors.dateRange}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='w-full py-3 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-lg hover:from-black hover:to-gray-900 transition-all duration-200 flex items-center justify-center gap-2 group'
            >
              {t("Start Session")}
              <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </button>
          </form>

          {/* Footer */}
          <div className='px-6 py-4 bg-slate-50 border-t border-slate-200'>
            <p className='text-xs text-slate-600 text-center'>
              {t("You can edit or save your session data later")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
