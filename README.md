# Plano de Treino

PWA mobile-first para acompanhamento pessoal de musculação, condicionamento, composição corporal e evolução da dor lombar.

## Estado atual — operacional

- autenticação Supabase por e-mail e senha;
- sessão persistente no navegador;
- criação idempotente do perfil e dos treinos A/B/C/D/E no primeiro acesso;
- ficha de readaptação de setembro/2026 (A/B/C/D + E opcional);
- registro por série de carga, repetições/duração, RPE, dor, técnica e amplitude;
- cronômetro de descanso, check-in pré e pós-treino e registro de cardio;
- histórico de sessões, medidas corporais e check-in semanal;
- retomada local de treino interrompido e PWA instalável;
- shell mobile-first em tema escuro;
- manifest e service worker para instalação como PWA;
- build e deploy preparados para GitHub Pages;
- RLS no Supabase: cada usuário acessa apenas os próprios dados.

O service worker mantém o aplicativo disponível após o primeiro carregamento. Um treino já iniciado preserva o rascunho no dispositivo e pode ser retomado; a sincronização definitiva com o banco exige conexão.

## Requisitos

- Node.js 24;
- npm 11;
- projeto Supabase configurado com as tabelas e políticas deste projeto.

## Configuração local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha o `.env.local` com a URL do projeto e a **publishable key** do Supabase. Nunca use `service_role`, `sb_secret_...` ou qualquer chave secreta no frontend.

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_BASE_PATH=/plano-de-treino/
```

## Autenticação

O login por e-mail e senha vem habilitado por padrão no Supabase. Em **Authentication → URL Configuration**, configure:

- Site URL: a URL final do GitHub Pages;
- Redirect URLs: a mesma URL do GitHub Pages e `http://localhost:5173/**` para desenvolvimento.

O projeto hospedado exige confirmação de e-mail por padrão. Após criar a conta, confirme o endereço recebido antes de entrar.

## Testes e build

```bash
npm test
npm run build
npm run preview
```

## Publicação no GitHub Pages

O repositório é publicado automaticamente no GitHub Pages a cada commit na branch `main` pelo workflow **Deploy GitHub Pages**.

A URL e a publishable key usadas pelo frontend são públicas por definição e estão no workflow. A segurança dos dados é garantida pelas políticas RLS. Nunca adicione uma `service_role`, `sb_secret_...` ou outra chave secreta ao repositório.

## Estratégia de inicialização

Após o primeiro login, o aplicativo:

1. cria ou atualiza o perfil;
2. faz `upsert` dos exercícios por `(user_id, name)`;
3. faz `upsert` dos treinos por `(user_id, code)`;
4. faz `upsert` da ordem dos exercícios por `(user_id, workout_template_id, sort_order)`.

O processo pode ser repetido com segurança caso a conexão seja interrompida, sem criar duplicidades.

## Segurança

- nenhuma chave secreta deve ser adicionada ao frontend;
- `.env` e `.env.local` estão ignorados pelo Git;
- todas as tabelas públicas têm RLS habilitado e forçado;
- `anon` não possui acesso às tabelas do domínio;
- usuários autenticados só podem operar linhas cujo `user_id` seja igual a `auth.uid()`;
- progressão de carga fica bloqueada quando há sintomas neurológicos registrados.

O aplicativo organiza e acompanha treinos. Ele não realiza diagnóstico médico nem substitui avaliação profissional.
