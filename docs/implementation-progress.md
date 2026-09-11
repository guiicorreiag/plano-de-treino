# Implementação em andamento

Esta branch é um rascunho e não deve ser publicada antes de concluir os itens abaixo.

## Preparado
- Lista de todos os exercícios com edição de séries em qualquer ordem.
- Adiar e retomar exercício quando o equipamento estiver ocupado.
- Carga, repetições ou segundos e RPE no registro principal.
- Detalhes de sintomas, técnica e amplitude recolhidos e sem respostas presumidas.
- Resposta lombar informada em relação ao habitual, sem classificação pela dor absoluta.
- Temporizador com pausa, retomada e acréscimo de 30 segundos.
- Correção da apresentação de durações menores que um minuto.
- Funções de contagem da adaptação, excluindo extras e sessões não elegíveis.
- Referência operacional de 12 treinos principais, com revisão de prontidão; não é liberação clínica automática.

## Necessário antes de publicar
- Confirmar a migração session_prescription_snapshot_and_completion no Supabase. A chamada não retornou; não assumir falha nem sucesso.
- Integrar a contagem à interface e revisar elegibilidade das sessões históricas com séries reais.
- Versionar fichas e copiar a prescrição para cada sessão; impedir nova semeadura a cada login.
- Substituir a divisão antiga por três principais segunda/terça/quarta e dois extras quinta/sexta.
- Implementar revisão de recuperação e sintomas e ativação de nova ficha após adaptação; permitir prolongamento.
- Implementar fila IndexedDB por conta, retomada offline, repetição idempotente e indicação de sincronização.
- Corrigir conclusão da sessão para verificar todos os registros filhos e impedir perda de alterações não enviadas.
- Preservar campos não respondidos no pré e pós-treino, sem transformar ausência em zero ou não.
- Adicionar cópia de última carga e histórico detalhado.
- Atualizar painel e check-in para três principais e extras separados.
- Executar testes de interação, persistência, isolamento por usuário, migração e build.
- Validar no celular e publicar só depois das verificações.

O ambiente local de execução e o Supabase ficaram sem responder durante esta implementação. Os testes adicionados ainda não foram executados. O site de produção permanece na versão anterior.
