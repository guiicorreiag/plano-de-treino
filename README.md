# Plano de Treino

PWA mobile-first para acompanhamento pessoal de musculação, condicionamento, composição corporal e evolução da dor lombar.

## Estado atual

- autenticação Supabase por e-mail e senha;
- sessão persistente no navegador;
- criação idempotente do perfil e dos treinos A/B/C/D/E no primeiro acesso;
- shell mobile-first em tema escuro;
- manifest e service worker para instalação como PWA;
- build e deploy preparados para GitHub Pages;
- RLS no Supabase: cada usuário acessa apenas os próprios dados.

O registro completo de séries, cronômetro, histórico, IndexedDB e sincronização offline serão implementados nas próximas etapas.

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

1. Crie um repositório chamado `plano-de-treino`.
2. Envie estes arquivos para a branch `main`.
3. Em **Settings → Secrets and variables → Actions**, crie:
   - `VITE_SUPABASE_URL`;
   - `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Em **Settings → Pages**, selecione **GitHub Actions** como fonte.
5. Envie um commit para `main` ou execute manualmente o workflow **Deploy GitHub Pages**.

A publishable key pode existir no bundle público; a segurança dos dados é garantida pelas políticas RLS. O workflow usa secrets para evitar gravá-la diretamente no repositório.

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
