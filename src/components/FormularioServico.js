'use client';

import { useState } from 'react';
import Modal from './Modal';
import ComboServico from './ComboServico';
import { useAviso } from './Avisos';
import { IconeAlerta } from './Icones';
import { FORMAS_PAGAMENTO, compararNome, hojeISO } from '@/lib/format';

function valorInicial(v) {
  if (v === null || v === undefined || v === '') return '';
  return String(v).replace('.', ',');
}

export default function FormularioServico({ servico, clientes, tipos, clienteFixo, onFechar, onSalvo }) {
  const avisar = useAviso();
  const editando = Boolean(servico);

  const [clienteId, setClienteId] = useState(servico?.clienteId || clienteFixo?.id || '');
  const [nome, setNome] = useState(servico?.nome || '');
  const [data, setData] = useState(servico?.data || hojeISO());
  const [valor, setValor] = useState(valorInicial(servico?.valor));
  const [pagamento, setPagamento] = useState(servico?.pagamento || '');
  const [descricao, setDescricao] = useState(servico?.descricao || '');
  const [erro, setErro] = useState('');
  const [confirmarSemValor, setConfirmarSemValor] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const semValor = valor.trim() === '';

  async function salvar(e) {
    e.preventDefault();

    if (!clienteId) return setErro('Selecione o cliente.');
    if (!nome.trim()) return setErro('Informe o serviço.');
    if (!data) return setErro('Informe a data.');

    // Valor em branco é permitido, mas só depois de um aviso explícito.
    if (semValor && !confirmarSemValor) {
      setConfirmarSemValor(true);
      setErro('');
      return;
    }

    setErro('');
    setEnviando(true);
    try {
      const resposta = await fetch(editando ? `/api/servicos/${servico.id}` : '/api/servicos', {
        method: editando ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, nome: nome.trim(), data, valor, pagamento, descricao }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || 'Não foi possível salvar.');
        setEnviando(false);
        return;
      }
      avisar(editando ? 'Atendimento atualizado.' : 'Atendimento registrado.');
      onSalvo?.(dados);
      onFechar();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEnviando(false);
    }
  }

  const rotuloBotao = enviando
    ? null
    : semValor && confirmarSemValor
      ? 'Salvar sem valor'
      : 'Salvar';

  return (
    <Modal
      titulo={editando ? 'Editar atendimento' : 'Novo atendimento'}
      onFechar={onFechar}
      largura={560}
      rodape={
        <>
          <button type="button" className="btn btn-claro" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="form-servico" className="btn btn-primario" disabled={enviando}>
            {enviando ? <span className="carregando" /> : rotuloBotao}
          </button>
        </>
      }
    >
      <form id="form-servico" className="modal-corpo" onSubmit={salvar}>
        {clienteFixo ? (
          <div className="campo">
            <span className="campo-rotulo">Cliente</span>
            <div className="etiqueta etiqueta-preta" style={{ alignSelf: 'flex-start', padding: '9px 16px', fontSize: '0.9rem' }}>
              {clienteFixo.nome}
            </div>
          </div>
        ) : (
          <div className="campo">
            <label className="campo-rotulo" htmlFor="servico-cliente">
              Cliente <span className="obrigatorio">*</span>
            </label>
            <select
              id="servico-cliente"
              className="selecao"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              <option value="">Selecione…</option>
              {[...clientes]
                .sort(compararNome)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
            </select>
          </div>
        )}

        <div className="campo">
          <label className="campo-rotulo" htmlFor="servico-nome">
            Serviço <span className="obrigatorio">*</span>
          </label>
          <ComboServico valor={nome} aoMudar={setNome} tipos={tipos} />
          <span className="ajuda">Escolha um da lista ou digite um novo — ele fica salvo para a próxima vez.</span>
        </div>

        <div className="colunas">
          <div className="campo">
            <label className="campo-rotulo" htmlFor="servico-data">
              Data <span className="obrigatorio">*</span>
            </label>
            <input
              id="servico-data"
              type="date"
              className="entrada"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label className="campo-rotulo" htmlFor="servico-valor">
              Valor <span className="opcional">(opcional)</span>
            </label>
            <input
              id="servico-valor"
              className="entrada"
              value={valor}
              onChange={(e) => {
                setValor(e.target.value.replace(/[^\d.,]/g, ''));
                setConfirmarSemValor(false);
              }}
              placeholder="R$ 0,00"
              inputMode="decimal"
            />
          </div>
        </div>

        {semValor ? (
          <div className="aviso">
            <IconeAlerta size={17} />
            <span>
              {confirmarSemValor
                ? 'Sem valor informado. Toque em “Salvar sem valor” para confirmar.'
                : 'Sem valor, este atendimento não entra nos totais de faturamento.'}
            </span>
          </div>
        ) : null}

        <div className="campo">
          <label className="campo-rotulo" htmlFor="servico-pagamento">
            Forma de pagamento <span className="opcional">(opcional)</span>
          </label>
          <select
            id="servico-pagamento"
            className="selecao"
            value={pagamento}
            onChange={(e) => setPagamento(e.target.value)}
          >
            <option value="">Não informado</option>
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="servico-descricao">
            Descrição <span className="opcional">(opcional)</span>
          </label>
          <textarea
            id="servico-descricao"
            className="area"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Cor usada, observações do atendimento…"
          />
        </div>

        {erro ? <p className="msg-erro">{erro}</p> : null}
      </form>
    </Modal>
  );
}
