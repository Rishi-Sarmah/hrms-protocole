import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  
  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(e.target.value);
  };

  return (
    <div>
      <label className="sr-only">Language</label>
      <select
        value={i18n.language}
        onChange={change}
        className="text-sm border rounded px-2 py-1"
        aria-label="Select language"
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </div>
  );
}
