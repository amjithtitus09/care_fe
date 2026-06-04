import { useCallback } from 'react';

export const useAuditLogger = () => {
  const logAudit = useCallback((message: string) => {
    console.log(`[Audit Log]: ${message}`);
  }, []);

  return { logAudit };
};