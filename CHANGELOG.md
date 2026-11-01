# Histórico de alterações — NotaPDF Studio

## 1.5.0 — 01/11/2026

- Substituição dos pop-ups PDF externos com widget móvel/Acrobat-JS por **anotação PDF nativa `/Text`**, link PDF `/Link` `/GoTo` e página auxiliar de nota com texto/imagem. Sem campo grande invisível ou zona cinza sobre o conteúdo original.
- Pop-ups completos no editor web mantidos: hover, clique/fixação, fechamento, texto formatado e imagens.
- Imagens no PDF externo renderizadas como **conteúdo normal de uma página**, sem depender de `/AP` móvel; exportação JPEG compactado quando há imagens e PNG lossless para notas de texto.
- Metadados editáveis compactados v4; compatibilidade de leitura com v1–v3; sem `decodeText()` em strings gigantes.
- Reexportação: remoção das páginas auxiliares e dos `/Text`/`/Link` criados na versão anterior, para evitar crescimento cumulativo.
- Tratamento de referências obsoletas de widgets NPS da pdf-lib 1.17.1, inclusive objetos de aparência.
- Arquivo de testes da interface Chromium com exportação/reimportação simuladas, teste de seleção e teste de PDF real renderizado por três bibliotecas.
- **Limite explícito:** Chrome não recebe imagem em hover diretamente no PDF baixado; a experiência rica existe no site. O ícone do PDF baixado abre uma página com o conteúdo.

## 1.4.4 — 01/11/2026

- Reabilitou ações JavaScript para PDFium, mas não solucionou a renderização cinza do campo flutuante em Chrome.

## 1.4.3 — 31/10/2026

- Imagem de aparência JPEG, metadados Flate, fluxo XObject personalizado e restrições de viewer, com regressão de hover no Chrome.

## 1.4.2 — 31/10/2026

- Corrigiu estouro de pilha em `PDFString.decodeText` com `asString()`, preservando HTML longo.

## 1.4.1 — 31/10/2026

- Tentativa de estacionar widget pop-up fora da página e proteger arraste de seleção.

## 1.4.0 — 31/10/2026

- Melhorias da seleção em PDF.js e marcações vetoriais.
