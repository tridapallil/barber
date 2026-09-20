import { requireSession } from '@/lib/auth';
import { ProvedorAvisos } from '@/components/Avisos';
import { ProvedorProgresso } from '@/components/Progresso';
import { BarraMobile, Rail, Topo } from '@/components/Navegacao';

export const dynamic = 'force-dynamic';

export default async function LayoutPainel({ children }) {
  const sessao = await requireSession();

  return (
    <ProvedorAvisos>
      <ProvedorProgresso>
        <div className="app">
          <Topo usuario={sessao.user} />
          <Rail />
          <main className="conteudo">{children}</main>
          <BarraMobile />
        </div>
      </ProvedorProgresso>
    </ProvedorAvisos>
  );
}
