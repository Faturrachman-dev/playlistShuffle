import { useState, useMemo, useEffect } from 'react';

export default function useDocumentVisibility(): boolean {
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    !document.hidden,
  );

  const handleVisibilityChange = () => {
    setIsDocumentVisible(!document.hidden);
  };

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return useMemo(() => isDocumentVisible, [isDocumentVisible]);
}
