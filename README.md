# Salão

Sistema simples de clientes, serviços e histórico para salão de beleza.
Next.js + React, com os dados no **MongoDB**.

As telas estão em [`capturas/`](capturas).

## Rodar na sua máquina

Você precisa de um MongoDB acessível. O jeito mais rápido:

```bash
docker run -d --name salao-mongo -p 27017:27017 mongo:7
```

Depois:

```bash
cp .env.example .env.local   # e ajuste MONGODB_URI se precisar
npm ci                       # ou: npm run instalar
npm run dev                  # http://localhost:3210
```

Para subir o sistema e o banco juntos, sem instalar nada:

```bash
docker compose up -d         # http://localhost:3210
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

Se precisar recomeçar do zero, apague a coleção `usuarios` e abra o sistema de
novo — a tela de criação volta a aparecer, sem mexer em clientes e
atendimentos:

```bash
mongosh "<sua-uri>" --eval 'db.getSiblingDB("salao").usuarios.deleteMany({})'
```

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

## Backup — leia antes de fazer deploy

O sistema tem uma tela de **Backup** (ícone de escudo no topo, ou o atalho no
rail à esquerda). Ali você:

- **baixa um arquivo** com tudo: clientes, atendimentos, lista de serviços e o
  acesso (usuário e senha);
- **restaura** esse arquivo depois, se precisar.

Guarde o arquivo **fora do servidor**. Com os dados no MongoDB, um deploy já
não apaga nada — mas o backup continua sendo a cópia que não depende do banco
estar de pé nem de ninguém ter apagado algo por engano.

## Dados

Tudo fica no MongoDB, nestas coleções:

| Coleção | Conteúdo |
|---|---|
| `clientes` | clientes |
| `atendimentos` | serviços feitos, com data, valor e pagamento |
| `tiposServico` | lista de serviços usada nas sugestões |
| `usuarios` | acesso (senha guardada como hash scrypt com salt) |
| `config` | chave de assinatura da sessão e marcações internas |

Os índices — inclusive os únicos que impedem cliente ou serviço repetido — são
criados sozinhos na primeira conexão.

```bash
npm run exemplo   # carrega dados de demonstração (apaga clientes e atendimentos)
npm run limpar    # apaga clientes/atendimentos e redefine a lista de serviços
```

`limpar` **não apaga o usuário** — isso deixaria o sistema trancado.

### Vindo da versão em arquivos JSON

Se você já usava a versão anterior, os dados estão em `data/*.json`. Para
levá-los ao MongoDB:

```bash
MONGODB_URI="mongodb://localhost:27017" npm run migrar
```

Pode rodar quantas vezes quiser: registros já migrados são reconhecidos pelo
`id` e apenas atualizados, nunca duplicados. Clientes, atendimentos, lista de
serviços e o usuário vão todos juntos.

Para migrar os dados que estão dentro de um container:

```bash
docker cp <container>:/app/data ./data-antigo
MONGODB_URI="<sua-uri>" node scripts/migrar-mongo.js ./data-antigo
```

## Variáveis de ambiente

Todas são opcionais numa instalação local.

| Variável | Para quê |
|---|---|
| `MONGODB_URI` | **obrigatória** — conexão com o banco |
| `MONGODB_DB` | nome do banco (padrão `salao`) |
| `PORT` | porta do servidor (padrão `3210`) |
| `SALAO_SEGREDO` | chave que assina o cookie. Sem ela, é gerada e guardada na coleção `config` |
| `SALAO_COOKIE_SECURE` | `1` quando o site é servido por **HTTPS**. Deixe desligado em acesso por `http://ip-da-rede`, senão o login não funciona |

## Deploy no Coolify

Agora são **dois recursos**: o banco e a aplicação. Os dados ficam no banco, então
atualizar a aplicação não encosta neles.

### 1. Criar o MongoDB

- *+ New* → *Database* → **MongoDB**
- Anote usuário, senha e o host interno que o Coolify mostrar
- Deixe o volume de dados que o Coolify cria por padrão — é ele que guarda tudo

### 2. Criar a aplicação

- *+ New* → *Application* → *Public Repository*
- Repositório: `https://github.com/tridapallil/barber`, branch `main`
- *Build Pack*: **Dockerfile**, location `/Dockerfile`
- *Ports Exposes*: `3210`
- Em *Domains*, o domínio que vai usar (o Coolify cuida do HTTPS)

O *Build Pack* precisa ser **Dockerfile**. O padrão do Coolify é *Nixpacks*,
que ignora o `Dockerfile` do projeto, monta a imagem por conta própria e roda
tudo como root. O Dockerfile daqui é o que foi testado: usuário sem privilégio,
build `standalone` e `node server.js` como comando.

Deixe o campo *Start Command* **vazio** — o Dockerfile já traz o comando certo.

### 3. Variáveis de ambiente

Na aplicação, em *Environment Variables*:

```
MONGODB_URI=mongodb://<usuario>:<senha>@<host-interno-do-mongo>:27017/?authSource=admin
MONGODB_DB=salao
SALAO_SEGREDO=<openssl rand -hex 48>
SALAO_COOKIE_SECURE=1
```

O `<host-interno-do-mongo>` é o nome de serviço que o Coolify dá ao banco — use
o endereço **interno**, não o público. `SALAO_COOKIE_SECURE=1` só se o domínio
for HTTPS.

Nenhuma delas é *Build Variable*: todas são lidas em tempo de execução.

### 4. Deploy

Clique em *Deploy* e abra o domínio: a tela de primeiro acesso aparece para
criar o usuário.

**A aplicação não precisa de volume nenhum.** Se você tinha um volume em
`/app/data` da versão anterior, migre os dados antes de removê-lo (veja
*Vindo da versão em arquivos JSON*).

### Deploy falhando com `Missing script: "prod"`

Sintoma nos logs, repetindo sem parar:

```
npm error Missing script: "prod"
```

Isso quer dizer que a aplicação **não está usando o Dockerfile**: algum
*Start Command* está mandando rodar `npm run prod`. Dois sinais confirmam —
os logs aparecem em `/root/.npm` (o Dockerfile roda como usuário sem
privilégio, nunca root) e o build pack registrado não é o Dockerfile.

Para resolver, na aplicação:

1. *Build Pack* → **Dockerfile**, *Dockerfile Location* → `/Dockerfile`
2. *Start Command* → deixe **vazio**
3. Redeploy

O script `prod` existe no projeto como alias de `start`, então o deploy também
sobe do jeito que está. Mas prefira o Dockerfile: é a configuração testada.

### Se algo estiver errado, o sistema diz o quê

Quando a `MONGODB_URI` está faltando ou o banco não responde, o sistema mostra
uma tela explicando o que configurar — com a resposta do banco e **sem expor a
senha da conexão**. Não é mais um erro 500 em branco.

### Conferindo que está tudo certo

Depois do primeiro deploy, faça um redeploy de propósito e confirme que o
usuário e os clientes continuam lá. Se sumirem, a `MONGODB_URI` está apontando
para um banco efêmero.

### Backup do banco

Além da tela de Backup do sistema, dá para copiar o banco inteiro:

```bash
docker exec <container-do-mongo> mongodump --archive --gzip \
  --db salao -u <usuario> -p <senha> --authenticationDatabase admin > salao.gz

# restaurar
docker exec -i <container-do-mongo> mongorestore --archive --gzip --drop \
  -u <usuario> -p <senha> --authenticationDatabase admin < salao.gz
```

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
- Cliente repetido e serviço repetido são barrados por índice único no banco,
  não por uma checagem no código: duas gravações ao mesmo tempo não conseguem
  criar o mesmo registro duas vezes.
