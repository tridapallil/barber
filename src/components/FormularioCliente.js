'use client';

import { useState } from 'react';
import Modal from './Modal';
import { useAviso } from './Avisos';
import { formatarTelefone, somenteDigitos } from '@/lib/format';

export default function FormularioCliente({ cliente, onFechar, onSalvo }) {
  const avisar = useAviso();
  const editando = Boolean(cliente);

  const [nome, setNome] = useState(cliente?.nome || '');
  const [telefone, setTelefone] = useState(formatarTelefone(cliente?.telefone || ''));
  const [descricao, setDescricao] = useState(cliente?.descricao || '');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function digitarTelefone(texto) {
    const d = somenteDigitos(texto).slice(0, 11);
    setTelefone(d.length > 6 ? formatarTelefone(d) : d);
  }

  async function salvar(e) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('O nome é obrigatório.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      const resposta = await fetch(editando ? `/api/clientes/${cliente.id}` : '/api/clientes', {
        method: editando ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), telefone, descricao }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || 'Não foi possível salvar.');
        setEnviando(false);
        return;
      }
      avisar(editando ? 'Cliente atualizado.' : 'Cliente cadastrado.');
      onSalvo?.(dados);
      onFechar();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <Modal
      titulo={editando ? 'Editar cliente' : 'Novo cliente'}
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" className="btn btn-claro" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="form-cliente" className="btn btn-primario" disabled={enviando}>
            {enviando ? <span className="carregando" /> : 'Salvar'}
          </button>
        </>
      }
    >
      <form id="form-cliente" className="modal-corpo" onSubmit={salvar}>
        <div className="campo">
          <label className="campo-rotulo" htmlFor="cliente-nome">
            Nome <span className="obrigatorio">*</span>
          </label>
          <input
            id="cliente-nome"
            className={`entrada ${erro && !nome.trim() ? 'erro' : ''}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da cliente"
            autoFocus
            required
          />
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="cliente-telefone">
            Telefone <span className="opcional">(opcional)</span>
          </label>
          <input
            id="cliente-telefone"
            className="entrada"
            value={telefone}
            onChange={(e) => digitarTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            inputMode="tel"
          />
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="cliente-descricao">
            Observações <span className="opcional">(opcional)</span>
          </label>
          <textarea
            id="cliente-descricao"
            className="area"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Preferências, alergias, tipo de cabelo…"
          />
        </div>

        {erro ? <p className="msg-erro">{erro}</p> : null}
      </form>
    </Modal>
  );
}
