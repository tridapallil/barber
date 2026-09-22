import { requireSession } from '@/lib/auth';
import { verificarConexao } from '@/lib/mongo';
import BancoIndisponivel from '@/components/BancoIndisponivel';
import { ProvedorAvisos } from '@/components/Avisos';
import { ProvedorProgresso } from '@/components/Progresso';
import { BarraMobile, Rail, Topo } from '@/components/Navegacao';

export const dynamic = 'force-dynamic';

export default async function LayoutPainel({ children }) {
  const banco = await verificarConexao();
  if (!banco.ok) return <BancoIndisponivel motivo={banco.motivo} detalhe={banco.detalhe} />;

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
