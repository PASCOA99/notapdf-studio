# Histórico de alterações — NotaPDF Studio

## 1.4.0 — 31/10/2026

### Seleção textual
- Reconstrução de separadores visuais entre spans da TextLayer, com espaço na mesma linha e quebra de linha quando muda a linha de base.
- Segmentação de palavras por `Intl.Segmenter` e medição de retângulos com `Range.getClientRects()`.
- Hit-test prioriza a linha visual mais próxima; impede selecionar a primeira palavra da linha inferior enquanto o ponteiro ainda está na linha superior.
- Ao cruzar da primeira para a segunda palavra, a âncora passa ao início da primeira palavra, mantendo-a integralmente selecionada.
- Ao recuar dentro da palavra ativa, retorna à seleção por caracteres; ao avançar, a palavra volta a ser completada.
- Duplo clique seleciona somente a palavra, sem pontuação ou espaço posterior.

### Grifos
- Prévia visual ajustada para 42% de opacidade e modo Multiply.
- Exportação PDF usa preenchimento `/ca 0.42` e traço `/CA 1`.
- Teste de PDF real compara pixels escuros dos caracteres antes/depois do grifo, além de verificar extração de texto e posição do sublinhado.

### Testes
- Testes Node de funções de dados.
- Testes de interface Chromium com PDF.js/pdf-lib simulados.
- Teste independente de fluxo PDF real com PyMuPDF e pypdf.

### Limitações
- O teste de interface usa stubs das bibliotecas externas; não valida o exportador pdf-lib real.
- O teste de fluxo PDF comprova a ordem de desenho vetorial e preservação de pixels do texto, mas não substitui validação no Adobe Acrobat.
- Continua sendo uma versão beta técnica.

## 1.3.0
- Grifos vetoriais inseridos antes dos fluxos originais.
- Ajustes de seleção textual, cursor e sublinhado.

## 1.2.0
- Correção da camada TextLayer, modo escuro inicial, atalhos e menu de tela cheia.

## 1.1.0
- Rolagem interna de notas, fontes menores, imagens coladas, grifos e sublinhados permanentes.
