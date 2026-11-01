# Relatório de testes — NotaPDF Studio 1.4.4

Data: 31/10/2026

| Verificação | Resultado | Limites |
|---|---|---|
| `node --check app.js` | PASSOU | Sintaxe |
| `node --check core.js` | PASSOU | Sintaxe |
| `node tests/popup_geometry.test.mjs` | PASSOU | Scripts simulados Acrobat/PDFium; 40 ciclos de abrir/fechar, coordenadas arredondadas; fallback para leitores sem reposicionamento |
| `node tests/metadata_stream.test.mjs` | PASSOU | Leitura real de fluxo zlib comprimido com cerca de 3,87 milhões de caracteres (2,91 MB de Base64 de alta entropia após Flate) |
| `node tests/image_metadata.test.mjs` | PASSOU | Compatibilidade v2 e imagem HTML com 2,4 milhões de caracteres, sem `decodeText()` ou truncamento |
| `python tests/browser_popup_selection.py` | PASSOU | Chromium: arraste sobre nota com imagem; hover/clique e fechamento no site; bibliotecas externas simuladas |
| `python tests/browser_export_image.py` | PASSOU | Chromium: exportar e reabrir nota com imagem, aparência JPEG e metadados v3 por simulador; bibliotecas externas simuladas |

## Diagnóstico

- O `file://` visto no console é uma restrição de origem de arquivos do navegador e não confirma falha da imagem dentro do PDF.
- O visualizador PDFium implementa `Field.rect` e `Field.display`, mas a compatibilidade e a renderização da imagem continuam dependentes do navegador. O filtro de `app.viewerType` da versão 1.4.3 impedia sempre a abertura no Chrome; a 1.4.4 remove o filtro, só exibe quando o campo confirma o movimento e o estaciona fora da página ao fechar.
- O PNG rasterizado do pop-up era incorporado além da imagem original (Base64) armazenada no HTML da nota; havia ainda ausência de object streams. O novo formato usa JPEG para a aparência, stream Flate para os metadados e object streams do PDF.
- A aparência Form XObject referencia o JPEG; a escrita do PDF final ainda exige validação prática com `pdf-lib` real, Chrome/PDFium e Acrobat.

## Limitações de validação

**Não foi possível testar uma exportação completa com a biblioteca real `pdf-lib` carregada do CDN, nem inspecionar o documento específico relatado pelo usuário, nem executar o Adobe Acrobat.** Os resultados acima não comprovam que o PDF baixado exiba a imagem no Acrobat; a capacidade de hover em leitores de navegador permanece intencionalmente desabilitada para preservar a seleção. A redução exata do tamanho dependerá da imagem e do documento original. Recomenda-se validar com cópia antes do uso de produção.

## Validação adicional 1.4.4

- `node tests/popup_geometry.test.mjs`: passou, incluindo simulação PDFium e tentativa de abrir em leitor que não consegue mover `rect`.
- `python tests/browser_popup_selection.py`: passou, seleção no editor web atravessando uma nota com imagem.
- `python tests/browser_export_image.py`: passou, imagem preservada no arquivo exportado/reaberto em teste com bibliotecas simuladas.
- Tentativa de abrir PDF local no Chromium/PDFium real via HTTP local e `file://`: **bloqueada pelo ambiente** (`ERR_BLOCKED_BY_ADMINISTRATOR`). Por isso não é correto afirmar que o pop-up já renderiza a imagem corretamente no leitor nativo do Chrome.
