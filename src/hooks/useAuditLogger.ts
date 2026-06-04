import { useCallback } from 'react';

export const useAuditLogger = () => {
  const logAudit = useCallback((message: string, data: any) => {
    console.log(`[Audit Log] ${message}`, data);
  }, []);

  return { logAudit };
};