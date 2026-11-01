# Relatório de testes — NotaPDF Studio 1.5.0

## Testes executados

| Teste | Resultado | Tipo de evidência |
|---|---|---|
| `node --check app.js` e módulos | PASSOU | Sintaxe JavaScript |
| `node tests/image_metadata.test.mjs` | PASSOU | Leitura de imagem Base64 longa (2,4 milhões de caracteres) sem `decodeText()` nem truncamento |
| `node tests/metadata_stream.test.mjs` | PASSOU | Fluxo zlib com cerca de 3,9 milhões de caracteres + compatibilidade do formato antigo |
| `python tests/browser_popup_selection.py` | PASSOU | Chromium: arraste atravessa a nota com imagem; pop-up web abre/fecha, sem interceptar a seleção; PDF.js simulado |
| `python tests/browser_portable_export.py` | PASSOU | Chromium: exporta foto e texto, gera `/Stamp`, `/Link` e `/Text`, reabre projeto, reexporta sem acumular páginas ou anotações, exclui uma nota e elimina seu ícone; pdf-lib/PDF.js simulados |
| `python tests/photo_size_quality.py` | PASSOU | PDF real com foto sintética: JPEG qualidade 79% = 69.115 bytes contra 843.616 bytes de PNG, redução de 91,8% nessa amostra; PSNR 25,5 dB |
| `python tests/native_pdf_portability.py` | PASSOU | PDF real: conteúdo de imagem/texto visível em PyMuPDF, PDFium e Poppler, texto original extraível, `/Stamp`, `/Link` e `/Text` válidos e nenhuma anotação `/Widget` |

## Evidência e limitações

Os testes da interface usam bibliotecas simuladas para isolar erros da aplicação e verificar fluxos de usuário. O teste de PDF real cria uma amostra independente com os mesmos tipos de anotações (link, comentário, imagem na página), inspeciona sua estrutura e renderiza o resultado em **três mecanismos independentes**. Não executa a versão JavaScript real da `pdf-lib` nem comprova que o Chrome exibirá pop-up nativo em hover ou que a exportação funciona com o PDF particular do usuário.

Em PDF externo, a **imagem é exibida na página auxiliar via link**, não num hover no Chrome. Isto é o resultado de uma alteração deliberada de design para evitar widgets móveis que ficam cinza e bloqueiam a seleção.

A contagem de páginas e o número de anotações foram verificados em duas exportações consecutivas com simulador. O aumento real de MB depende da compressão dos dados de imagem e do PDF original; o teste sintético isolado confirma que uma foto sintética inserida em uma página PDF ocupou 91,8% menos espaço com JPEG qualidade 79% do que com PNG, sem efeito sobre o texto da página. Essa diferença não é projeção do tamanho do PDF específico do usuário.

## Pesquisa consultada

- Documentação oficial `pdf-lib`, `PDFButton.setImage` e `PDFForm.removeField`: https://pdf-lib.js.org/docs/api/classes/pdfbutton e https://github.com/Hopding/pdf-lib/blob/master/src/api/form/PDFForm.ts
- Defeito da remoção de widgets em 1.17.1: https://github.com/Hopding/pdf-lib/issues/1784
- Biblioteca de anotações com popup de texto nativo: https://github.com/Team-Poseidon/annotpdf
- Anotações `/Text` e `/Popup` PDFium: https://pdfium.patagames.com/help/html/WorkingSDK_Annots.htm
- Ações PDF `/GoTo`: https://developer.adobe.com/acrobat-pdfl-sdk/guides/pdfmark/pdfmark-actions
- Diferença entre visualizadores e suporte de anotações PDF.js: https://github.com/mozilla/pdf.js/issues/11362
