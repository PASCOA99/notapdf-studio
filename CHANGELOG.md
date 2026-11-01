# Histórico de alterações — NotaPDF Studio

## 1.4.2 — 31/10/2026

### Exportação com imagens grandes
- Correção da exceção `RangeError: Maximum call stack size exceeded` em `app.js` durante a validação dos metadados `NPSData`.
- Leitura dos metadados PDFString com `asString()` no lugar de `decodeText()` (também na reabertura de PDFs).
- Preservação integral do HTML das notas ao reabrir PDFs: imagens Base64 acima de 1.500.000 caracteres não são mais truncadas.
- Teste de regressão com nota contendo imagem Base64 extensa, simulando a falha anterior.
- Mantidas as correções da versão 1.4.1 para pop-ups fechados e seleção de texto.

## 1.4.1 — 31/10/2026

### Correção da seleção sob pop-ups fechados
- Na exportação, o widget do pop-up (especialmente grande quando há imagens) não fica mais no retângulo da página quando fechado: é criado com `/Rect` fora da página e flag `/F Hidden`.
- O JavaScript Acrobat move o campo para o retângulo de exibição apenas ao abrir a nota e retorna a posição fora da página em todas as formas de fechar (hover, clique e botão do pop-up).
- O HTML não abre prévia de nota por hover se o botão esquerdo já estiver pressionado ou se houver um arraste de seleção ativo. Uma prévia aberta por hover é fechada quando se inicia a seleção de texto.
- A seleção de texto e a gravação de grifos não foram alteradas.

### Testes desta correção
- `tests/popup_geometry.test.mjs`: geometria e scripts Acrobat simulados.
- `tests/browser_popup_selection.py`: seleção por arraste atravessando uma nota com imagem no Chromium (PDF.js/pdf-lib simulados).
- Não houve teste end-to-end no Adobe Acrobat nem exportação com pdf-lib real.

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
