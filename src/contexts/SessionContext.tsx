import React, { createContext, useContext, useState } from "react";

export interface SessionDetails {
  sessionName: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

interface SessionContextType {
  sessionDetails: SessionDetails | null;
  setSessionDetails: (details: SessionDetails) => void;
  clearSessionDetails: () => void;
  isSessionActive: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(
    null,
  );

  const handleSetSessionDetails = (details: SessionDetails) => {
    setSessionDetails(details);
  };

  const handleClearSessionDetails = () => {
    setSessionDetails(null);
  };

  const value: SessionContextType = {
    sessionDetails,
    setSessionDetails: handleSetSessionDetails,
    clearSessionDetails: handleClearSessionDetails,
    isSessionActive: sessionDetails !== null,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
