'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { IconeAlerta, IconeCheck } from './Icones';

const ContextoAviso = createContext(() => {});

export function useAviso() {
  return useContext(ContextoAviso);
}

export function ProvedorAvisos({ children }) {
  const [avisos, setAvisos] = useState([]);

  const avisar = useCallback((texto, tipo = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setAvisos((atual) => [...atual, { id, texto, tipo }]);
    setTimeout(() => setAvisos((atual) => atual.filter((a) => a.id !== id)), 3600);
  }, []);

  const valor = useMemo(() => avisar, [avisar]);

  return (
    <ContextoAviso.Provider value={valor}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`toast ${a.tipo}`}>
            {a.tipo === 'erro' ? <IconeAlerta size={17} /> : <IconeCheck size={17} />}
            <span>{a.texto}</span>
          </div>
        ))}
      </div>
    </ContextoAviso.Provider>
  );
}
