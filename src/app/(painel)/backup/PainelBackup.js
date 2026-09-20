'use client';

import { useRef, useState } from 'react';
import Confirmar from '@/components/Confirmar';
import { useAviso } from '@/components/Avisos';
import { useAtualizar } from '@/components/Progresso';
import { IconeAlerta, IconeArquivo, IconeBaixar, IconeEscudo, IconeSubir } from '@/components/Icones';

export default function PainelBackup({ contagem }) {
  const avisar = useAviso();
  const { atualizar } = useAtualizar();
  const campoArquivo = useRef(null);

  const [baixando, setBaixando] = useState(false);
  const [pendente, setPendente] = useState(null); // backup lido, aguardando confirmação
  const [erro, setErro] = useState('');

  async function baixar() {
    setBaixando(true);
    try {
      // navega para a rota de download; o navegador cuida do arquivo
      window.location.href = '/api/backup';
      setTimeout(() => setBaixando(false), 1500);
    } catch {
      setBaixando(false);
    }
  }

  async function escolherArquivo(evento) {
    setErro('');
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;

    try {
      const texto = await arquivo.text();
      const dados = JSON.parse(texto);
      if (dados?.formato !== 'salao-backup') {
        setErro('Este arquivo não é um backup do salão.');
        return;
      }
      setPendente({
        arquivo: arquivo.name,
        dados,
        clientes: dados.clients?.length ?? 0,
        servicos: dados.services?.length ?? 0,
        tipos: dados.serviceTypes?.length ?? 0,
        usuarios: dados.users?.length ?? 0,
        geradoEm: dados.geradoEm,
      });
    } catch {
      setErro('Não consegui ler o arquivo. Ele precisa ser o JSON baixado por aqui.');
    }
  }

  async function restaurar() {
    const resposta = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendente.dados),
    });
    const resultado = await resposta.json();
    if (!resposta.ok) {
      avisar(resultado.erro || 'Não foi possível restaurar.', 'erro');
      return;
    }
    avisar('Backup restaurado.');
    atualizar();
  }

  const dataBackup = pendente?.geradoEm ? new Date(pendente.geradoEm).toLocaleString('pt-BR') : null;

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <div className="migalhas">
            <span><IconeArquivo size={14} /> Salão</span>
            <span><IconeArquivo size={14} /> Segurança</span>
          </div>
          <h1 className="titulo-pagina">Backup</h1>
        </div>
      </div>

      <div className="pilha">
        <div className="grade grade-3">
          <div className="cartao indicador">
            <span className="indicador-rotulo">Clientes</span>
            <div className="indicador-corpo"><span className="valor-grande">{contagem.clientes}</span></div>
          </div>
          <div className="cartao indicador">
            <span className="indicador-rotulo">Atendimentos</span>
            <div className="indicador-corpo"><span className="valor-grande">{contagem.servicos}</span></div>
          </div>
          <div className="cartao indicador">
            <span className="indicador-rotulo">Serviços na lista</span>
            <div className="indicador-corpo"><span className="valor-grande">{contagem.tipos}</span></div>
          </div>
        </div>

        <div className="grade grade-2">
          <div className="cartao">
            <div className="cartao-topo">
              <div>
                <span className="rotulo-cartao">Salvar uma cópia</span>
                <p className="rotulo-fino" style={{ marginTop: 8 }}>
                  Baixa um arquivo com clientes, atendimentos, lista de serviços e o acesso.
                </p>
              </div>
              <span className="btn-circulo escuro"><IconeEscudo size={17} /></span>
            </div>

            <button type="button" className="btn btn-primario btn-bloco" onClick={baixar} disabled={baixando}>
              {baixando ? <span className="carregando" /> : <><IconeBaixar size={17} /> Baixar backup agora</>}
            </button>

            <p className="ajuda" style={{ marginTop: 14, lineHeight: 1.5 }}>
              Guarde o arquivo fora do servidor — no computador, no celular ou na nuvem.
              Faça isso antes de qualquer atualização do sistema.
            </p>
          </div>

          <div className="cartao">
            <div className="cartao-topo">
              <div>
                <span className="rotulo-cartao">Restaurar</span>
                <p className="rotulo-fino" style={{ marginTop: 8 }}>
                  Recoloca no sistema um arquivo baixado antes.
                </p>
              </div>
              <span className="btn-circulo"><IconeSubir size={17} /></span>
            </div>

            <input
              ref={campoArquivo}
              type="file"
              accept="application/json,.json"
              onChange={escolherArquivo}
              style={{ display: 'none' }}
            />
            <button type="button" className="btn btn-claro btn-bloco" onClick={() => campoArquivo.current?.click()}>
              <IconeSubir size={17} />
              Escolher arquivo de backup
            </button>

            {erro ? <p className="msg-erro" style={{ marginTop: 12 }}>{erro}</p> : null}

            <div className="aviso" style={{ marginTop: 14 }}>
              <IconeAlerta size={17} />
              <span>Restaurar substitui tudo o que está no sistema hoje.</span>
            </div>
          </div>
        </div>

        <div className="cartao">
          <div className="cartao-topo">
            <span className="rotulo-cartao">Onde os dados ficam</span>
          </div>
          <p style={{ color: 'var(--tinta-2)', lineHeight: 1.6, fontSize: '0.92rem' }}>
            Tudo fica em arquivos JSON na pasta <code>data/</code> do servidor. Se o sistema
            roda em container, essa pasta precisa estar num volume persistente — sem isso,
            cada atualização sobe uma instalação vazia. O backup daqui é a sua rede de
            proteção independente disso.
          </p>
        </div>
      </div>

      {pendente ? (
        <Confirmar
          titulo="Restaurar este backup?"
          rotuloConfirmar="Restaurar"
          mensagem={
            `O arquivo "${pendente.arquivo}"${dataBackup ? `, de ${dataBackup},` : ''} tem ` +
            `${pendente.clientes} clientes, ${pendente.servicos} atendimentos, ` +
            `${pendente.tipos} serviços na lista e ${pendente.usuarios} acesso(s). ` +
            'Tudo o que está no sistema agora será substituído por esse conteúdo.'
          }
          onConfirmar={restaurar}
          onFechar={() => setPendente(null)}
        />
      ) : null}
    </>
  );
}
