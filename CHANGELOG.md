# Histórico de alterações — NotaPDF Studio

## 1.4.4 — 01/11/2026

### Regressão da abertura de pop-ups corrigida
- Removida a restrição de `viewerType` introduzida na versão 1.4.3: ela desabilitava todas as ações do ícone no Chrome/PDFium.
- O JavaScript passa a usar detecção de capacidade do campo: reposiciona `Field.rect`, confere as quatro coordenadas com tolerância ao arredondamento do PDFium e só então exibe o pop-up. Se falhar, oculta e volta a estacionar fora da página.
- O widget inicia com `/F Hidden` (2), sem o bit `/F Invisible` (1), reduzindo risco de impedir que o campo seja ativado pelo leitor.
- Ao sair do ícone, fechar o pop-up ou desfixar, a ação esconde o campo e devolve seu retângulo para fora da página, evitando uma área invisível interceptadora.
- Nenhuma mudança no sistema de seleção de texto, captura JPEG, metadados comprimidos e modo de edição.

### Testes e compatibilidade
- Ações JS simuladas em Acrobat, PDFium (com leitura de coordenadas arredondadas), leitor sem suporte e 40 ciclos abrir/fechar; testes de seleção no Chromium, exportação simulada e metadados grandes.
- Limite: o navegador desta execução bloqueou a abertura de PDFs locais; não foi possível testar a aparência da imagem no visualizador PDFium real, nem exportar com pdf-lib real ou abrir o PDF no Acrobat. Recursos interativos não são universalmente portáveis entre leitores PDF.

## 1.4.3 — 31/10/2026

### Visualização e segurança da seleção
- Abertura de imagem no PDF exportado restringida ao Acrobat/Reader desktop. O PDFium/Chrome não executa mais o `display.visible` que produzia pop-up cinza e podia deixar a região interceptando a seleção.
- `Field.rect` continua estacionado fora da página ao fechar; abertura Acrobat só prossegue depois de verificar o retângulo. Testes de hover, fixar, fechar e selecionar feitos em contexto JavaScript simulado.
- Aparência do pop-up desenhada com `/AP` Form XObject JPEG sem botão cinza automático; a captura exige imagem decodificada corretamente.
- Captura HTML invisível no DOM original e visível somente no clone do `html2canvas`, evitando piscadas ao exportar.

### Arquivo e metadados
- Capturas de notas em JPEG (qualidade 0,84, escala máxima 1,5x) em vez de PNG RGBA grande; `useObjectStreams:true`.
- `NPSData` v3 como fluxo Flate comprimido, preservando leitura de v1/v2 PDFString com `asString()`.
- Validação compara id, página e HTML de cada nota após reabrir o arquivo em memória.
- Erro explícito em caso de falha ao ler notas existentes, evitando reedição com dados apagados silenciosamente.

### Limitações
- Acrobat completo e ciclo de exportação com a biblioteca real `pdf-lib` não foram executados no ambiente. Os testes do navegador usam stubs e os de compressão usam `DecompressionStream` real do Node. Não é possível prometer pop-ups interativos em todos os leitores PDF.

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
