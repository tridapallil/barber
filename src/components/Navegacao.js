'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  IconeBusca,
  IconeClienteMais,
  IconeClientes,
  IconeEscudo,
  IconePainel,
  IconeRelatorio,
  IconeSair,
  IconeServicoMais,
  IconeTesoura,
} from './Icones';
import { iniciais } from '@/lib/format';

const ITENS = [
  { href: '/', rotulo: 'Início', Icone: IconePainel },
  { href: '/clientes', rotulo: 'Clientes', Icone: IconeClientes },
  { href: '/servicos', rotulo: 'Serviços', Icone: IconeTesoura },
  { href: '/relatorios', rotulo: 'Relatórios', Icone: IconeRelatorio },
];

const ATALHOS = [
  { href: '/clientes?novo=1', rotulo: 'Nova cliente', descricao: 'Cadastrar cliente', Icone: IconeClienteMais },
  { href: '/servicos?novo=1', rotulo: 'Novo atendimento', descricao: 'Registrar atendimento', Icone: IconeServicoMais },
  { href: '/clientes', rotulo: 'Buscar', descricao: 'Buscar cliente', Icone: IconeBusca },
];

function estaAtivo(pathname, href) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]);
}

function IndicadorLink() {
  const { pending } = useLinkStatus();
  return pending ? <span className="pendente" aria-label="Carregando" /> : null;
}

function useSair() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  return {
    saindo,
    async sair() {
      setSaindo(true);
      await fetch('/api/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    },
  };
}

export function Topo({ usuario }) {
  const pathname = usePathname();
  const { sair, saindo } = useSair();

  return (
    <header className="topo">
      <Link href="/" className="logo" aria-label="Início">
        <IconeTesoura size={19} />
      </Link>

      <nav className="topo-pilulas">
        {ITENS.map(({ href, rotulo, Icone }) => (
          <Link key={href} href={href} className={`pilula ${estaAtivo(pathname, href) ? 'ativa' : ''}`}>
            <Icone size={17} />
            {rotulo}
            <IndicadorLink />
          </Link>
        ))}
      </nav>

      <div className="topo-fim">
        <Link
          href="/backup"
          className={`btn-circulo ${pathname.startsWith('/backup') ? 'escuro' : ''}`}
          aria-label="Backup dos dados"
          title="Backup dos dados"
        >
          <IconeEscudo size={17} />
        </Link>
        <div className="usuario-chip">
          <span className="nome">{usuario}</span>
          <span className="usuario-bolha">{iniciais(usuario)}</span>
        </div>
        <button type="button" className="btn-circulo" onClick={sair} disabled={saindo} aria-label="Sair">
          {saindo ? <span className="carregando" /> : <IconeSair size={17} />}
        </button>
      </div>
    </header>
  );
}

export function Rail() {
  const pathname = usePathname();

  return (
    <nav className="rail" aria-label="Atalhos">
      <span className="rail-titulo">Atalhos</span>

      {ATALHOS.map(({ href, rotulo, descricao, Icone }) => (
        <Link key={rotulo} href={href} className="rail-btn" aria-label={descricao}>
          <span className="bolha"><Icone size={19} /></span>
          <span className="rotulo">{rotulo}</span>
        </Link>
      ))}

      <Link
        href="/relatorios"
        className={`rail-btn ${pathname.startsWith('/relatorios') ? 'ativo' : ''}`}
        aria-label="Ver relatórios"
      >
        <span className="bolha"><IconeRelatorio size={19} /></span>
        <span className="rotulo">Relatórios</span>
      </Link>

      <Link
        href="/backup"
        className={`rail-btn ${pathname.startsWith('/backup') ? 'ativo' : ''}`}
        aria-label="Backup dos dados"
      >
        <span className="bolha"><IconeEscudo size={19} /></span>
        <span className="rotulo">Backup</span>
      </Link>
    </nav>
  );
}

export function BarraMobile() {
  const pathname = usePathname();
  return (
    <nav className="barra-mobile">
      {ITENS.map(({ href, rotulo, Icone }) => (
        <Link key={href} href={href} className={`barra-item ${estaAtivo(pathname, href) ? 'ativo' : ''}`}>
          <Icone size={20} />
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}
