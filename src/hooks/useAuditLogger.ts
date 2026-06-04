import { useCallback } from 'react';

export const useAuditLogger = () => {
  const logAudit = useCallback((message: string) => {
    console.log(`[AUDIT LOG]: ${message}`);
    // Additional logging logic can be added here, e.g., sending logs to a server.
  }, []);

  return logAudit;
};
