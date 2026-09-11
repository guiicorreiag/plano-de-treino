# Plano de Treino — versão 3

PWA pessoal para registrar musculação, cardio, recuperação e medidas. Publicação: https://guiicorreiag.github.io/plano-de-treino/

## Uso atual
- Segunda: A, corpo inteiro com ênfase superior.
- Terça: B, complementos leves e core.
- Quarta: C, corpo inteiro com ênfase inferior.
- Quinta: Extra 1, cardio confortável.
- Sexta: Extra 2, cardio e poucos complementos. Extras não substituem os principais.
- Lista completa durante a sessão; registre na ordem disponível e use Fazer depois/Retomar.
- Carga, repetições ou segundos e RPE por série. Sintomas e execução são opcionais e não presumidos.
- O botão OK confirma a série realizada; ✓ permite editar. Copiar última carga não copia repetições/RPE.
- Descanso com pausa, retomada, +30 segundos e encerramento.
- É possível encerrar sessões parciais, preservadas sem avanço da adaptação.

## Adaptação e versionamento
O esforço de referência avança a cada três sessões principais elegíveis: RPE 5–6, 5–6,5, 6–7 e 6–7. Não depende da data. Após 12 sessões principais concluídas, abre uma revisão de recuperação, técnica, lombar e sintomas. Doze é um checkpoint operacional, não liberação clínica automática. Pode prolongar por mais três sessões.

A ficha de consolidação é apresentada antes de ativar: mesmos movimentos conhecidos, duas séries, pequena ampliação da faixa de repetições de força. Não aumenta cargas automaticamente. Alertas neurológicos recentes impedem a ativação. Cada sessão armazena uma cópia completa da ficha e mantém a versão original.

## Persistência e segurança
`tracker_records` guarda cada sessão inteira (ficha, séries, pré/pós e cardio) como um registro atômico. Settings, check-ins e medidas usam registros separados. RLS forçado e políticas por `auth.uid()`; anon não lê nem grava. `save_tracker_record` é SECURITY INVOKER, aplica comparação de revisão e idempotência por mutation_id. Esquema aplicado via Supabase MCP: `atomic_tracker_records`; SQL em `db/tracker.sql`.

IndexedDB guarda a fila separada por usuário. O app salva primeiro no aparelho, sincroniza ao voltar a conexão, no botão Sincronizar e periodicamente enquanto aberto. Conflitos entre aparelhos exigem comparação e escolha explícita. Não limpar dados do navegador com envios pendentes. Backup JSON disponível em Mais.

As tabelas antigas são preservadas e lidas para importar o histórico local. Não há nova semeadura a cada login. Sessões antigas concluídas com séries de força reais contam para adaptação; campos não respondidos pelo sistema antigo permanecem identificados como históricos. Os dois treinos iniciais documentados fora do app não são inventados como sessões digitais.

O app deve ser aberto conectado ao menos uma vez para preparar o cache offline. A identidade local previamente autenticada permite abrir registros offline; a sincronização sempre exige sessão Supabase válida. Nenhuma credencial administrativa é usada.

## Desenvolvimento e publicação
Node.js 24. `npm ci`, `npm test`, `npm run build`. Configure a URL e chave pública do Supabase conforme `.env.example`. Nunca inclua service_role ou chaves secretas.

O workflow de Pages testa e publica a branch main. Os arquivos `seedData` e a tela antiga são preservados como referência histórica; a interface ativa está em `src/tracker`.

## Validação
Testes cobrem ordem livre, persistência e retomada, sessão parcial, idempotência após resposta perdida, edição durante envio, isolamento local, conflitos, contagem sem datas e transição preservando snapshots. SQL de validação executado em transações revertidas confirmou idempotência, recusa de revisão obsoleta e RLS. A checagem de segurança não encontrou alertas nas novas tabelas; a proteção opcional de senhas vazadas do Auth continua desabilitada no projeto.
