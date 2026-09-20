'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useTransition } from 'react';

const ContextoProgresso = createContext({ atualizar: () => {}, pendente: false });

export function useAtualizar() {
  return useContext(ContextoProgresso);
}

export function BarraProgresso() {
  return (
    <div className="barra-progresso" role="progressbar" aria-label="Carregando">
      <span />
    </div>
  );
}

/**
 * Recarrega os dados do servidor dentro de uma transição, para a tela mostrar
 * que algo está acontecendo em vez de congelar até a resposta chegar.
 */
export function ProvedorProgresso({ children }) {
  const router = useRouter();
  const [pendente, iniciarTransicao] = useTransition();

  const atualizar = useCallback(() => {
    iniciarTransicao(() => router.refresh());
  }, [router]);

  const valor = useMemo(() => ({ atualizar, pendente }), [atualizar, pendente]);

  return (
    <ContextoProgresso.Provider value={valor}>
      {pendente ? <BarraProgresso /> : null}
      {children}
    </ContextoProgresso.Provider>
  );
}
