'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SessionContextType {
  sessionId: string | null;
}

const SessionContext = createContext<SessionContextType>({ sessionId: null });

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children, moduleId, domain }: { children: React.ReactNode, moduleId: string, domain: string }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, domain }),
        });
        const data = await res.json();
        if (data.sessionId) setSessionId(data.sessionId);
      } catch (err) {
        console.error('Failed to init session', err);
      }
    };
    initSession();
  }, [moduleId, domain]);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};
