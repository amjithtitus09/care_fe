import { useCallback } from 'react';

export const useAuditLogger = () => {
  const log = useCallback((message: string, details: Record<string, any>) => {
    console.log(`[Audit Log] ${message}`, details);
  }, []);

  return { log };
};