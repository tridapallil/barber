# Salão

Sistema simples de clientes, serviços e histórico para salão de beleza.
Next.js + React, com os dados guardados em arquivos JSON na pasta `data/`.

As telas estão em [`capturas/`](capturas).

## Rodar na sua máquina

```bash
npm ci          # ou: npm run instalar
npm run dev     # http://localhost:3210
```

Para usar no dia a dia (mais rápido):

```bash
npm run producao   # instala, faz o build e sobe
```

Ou, separadamente:

```bash
npm ci
npm run build
npm start
```

O sistema usa a porta **3210**. Para mudar: `PORT=4000 npm run dev`.

## Primeiro acesso

Na primeira vez que o sistema abre não existe nenhum usuário, então ele mostra
a tela **“Vamos começar”** para você criar o seu. Usuário com no mínimo 3
letras, senha com no mínimo 6 caracteres.

Essa tela só aparece uma vez. Depois que o usuário existe, o sistema vai
direto para o login. **Anote a senha — não há recuperação automática.**

Se precisar recomeçar do zero, apague `data/users.json` e abra o sistema de
novo: a tela de criação volta a aparecer. Os clientes e atendimentos não são
afetados.

## Telas

- **Início** — serviços da semana e do mês, gráfico dos últimos 14 dias, total
  de clientes e de atendimentos, e os atendimentos recentes.
- **Clientes** — busca por nome, telefone ou observação. Clicar abre a ficha
  da cliente com o histórico completo de serviços.
- **Serviços** — todos os atendimentos registrados, e a aba *Lista de serviços*
  com os nomes pré-cadastrados.
- **Relatórios** — semanal ou mensal, com navegação entre períodos, comparação
  com o período anterior, serviços mais feitos, formas de pagamento e clientes.

À esquerda há um rail de atalhos (nova cliente, novo atendimento, buscar,
relatórios), com o nome de cada um escrito embaixo do ícone.

## Como os serviços funcionam

Ao registrar um atendimento, o campo *Serviço* sugere os nomes já usados. Se o
nome digitado não existir, ele é salvo junto com o atendimento e passa a
aparecer na lista da próxima vez.

Um serviço da lista que **já foi usado** em algum atendimento não pode ser
editado nem excluído — só os que nunca foram usados.

## Dados

Tudo fica em `data/`:

| Arquivo | Conteúdo |
|---|---|
| `clients.json` | clientes |
| `services.json` | atendimentos |
| `serviceTypes.json` | lista de serviços para sugestão |
| `users.json` | usuário e senha (a senha guardada como hash scrypt) |
| `segredo.txt` | chave que assina o cookie de sessão |

A pasta `data/` **não vai para o Git** — ela tem dados reais. Para fazer
backup, copie a pasta inteira.

```bash
npm run exemplo   # carrega dados de demonstração (apaga os atuais)
npm run limpar    # apaga clientes/atendimentos e redefine a lista de serviços
```

## Variáveis de ambiente

Todas são opcionais numa instalação local.

| Variável | Para quê |
|---|---|
| `PORT` | porta do servidor (padrão `3210`) |
| `SALAO_SEGREDO` | chave que assina o cookie. Sem ela, é gerada e guardada em `data/segredo.txt` |
| `SALAO_COOKIE_SECURE` | `1` quando o site é servido por **HTTPS**. Deixe desligado em acesso por `http://ip-da-rede`, senão o login não funciona |

## Deploy no Coolify

O projeto já vem com `Dockerfile` (Next em modo `standalone`) e o
`next.config.mjs` configurado. No Coolify:

**1. Criar o recurso**
- *+ New* → *Application* → *Public Repository* (ou *Private Repository* via
  GitHub App).
- Repositório: `https://github.com/tridapallil/barber`
- Branch: `main`

**2. Build**
- *Build Pack*: **Dockerfile**
- *Dockerfile Location*: `/Dockerfile`
- *Base Directory*: `/`

**3. Rede**
- *Ports Exposes*: `3210`
- Em *Domains*, coloque o domínio que vai usar. O Coolify cuida do HTTPS.

**4. Volume persistente — o passo mais importante**

Sem isso, **todos os clientes e atendimentos somem a cada deploy**.

- Aba *Storages* → *+ Add* → **Volume Mount**
- *Name*: `salao-dados`
- *Destination Path*: `/app/data`

Use volume nomeado, não *bind mount*. O volume nomeado herda as permissões do
diretório da imagem (que já pertence ao usuário do container). Se preferir um
caminho do host, rode antes no servidor:
`sudo mkdir -p /caminho/escolhido && sudo chown -R 1001:1001 /caminho/escolhido`

**5. Variáveis de ambiente**

Em *Environment Variables*:

```
SALAO_SEGREDO=<cole aqui uma string longa e aleatória>
SALAO_COOKIE_SECURE=1
```

Gere o segredo com:
```bash
openssl rand -hex 48
```

Marque `SALAO_SEGREDO` como *Build Variable? No* — ela é usada em tempo de
execução. Defina `SALAO_COOKIE_SECURE=1` só se o domínio for HTTPS.

**6. Deploy**

Clique em *Deploy*. Quando subir, abra o domínio: a tela de primeiro acesso
aparece para você criar o usuário.

**Backup:** o conteúdo do volume `salao-dados` é o banco inteiro. Copiar esse
volume é o backup completo.

## Visual

O design segue a referência combinada: fundo cinza-claro, navegação em pílulas
no topo (a ativa em preto), rail de atalhos à esquerda, título de página
grande, cards flat de cantos largos e o verde-lima reservado para selos de
destaque e o card principal.

O verde-lima sobre fundo claro tem contraste baixo, então ele nunca é usado
como cor de barra ou de texto pequeno — só em selos com texto preto e em cards
de fundo lima inteiro. No gráfico, o dia de hoje vem hachurado em preto e o
pico ganha um selo lima com o número.

## Observações

- Excluir uma cliente apaga também o histórico de atendimentos dela.
- O valor do atendimento é opcional, mas a tela avisa e pede confirmação antes
  de salvar sem valor.
- A senha é guardada como hash scrypt com salt — nunca em texto puro.
