# Relatório de testes — NotaPDF Studio 1.4.3

Data: 31/10/2026

| Verificação | Resultado | Limites |
|---|---|---|
| `node --check app.js` | PASSOU | Sintaxe |
| `node --check core.js` | PASSOU | Sintaxe |
| `node tests/popup_geometry.test.mjs` | PASSOU | Scripts Acrobat/Reader simulados; ação bloqueada em PDFium; campo não deixa retângulo sobre a página após fechar |
| `node tests/metadata_stream.test.mjs` | PASSOU | Leitura real de fluxo zlib comprimido com cerca de 3,87 milhões de caracteres (2,91 MB de Base64 de alta entropia após Flate) |
| `node tests/image_metadata.test.mjs` | PASSOU | Compatibilidade v2 e imagem HTML com 2,4 milhões de caracteres, sem `decodeText()` ou truncamento |
| `python tests/browser_popup_selection.py` | PASSOU | Chromium: arraste sobre nota com imagem; hover/clique e fechamento no site; bibliotecas externas simuladas |
| `python tests/browser_export_image.py` | PASSOU | Chromium: exportar e reabrir nota com imagem, aparência JPEG e metadados v3 por simulador; bibliotecas externas simuladas |

## Diagnóstico

- O `file://` visto no console é uma restrição de origem de arquivos do navegador e não confirma falha da imagem dentro do PDF.
- O visualizador PDFium implementa um subconjunto do JavaScript de formulários Acrobat. Tentar mostrar ou reposicionar um widget de imagem nele pode produzir retângulo cinza/área interceptadora. A exportação 1.4.3 desabilita essa operação no PDFium e mantém apenas a funcionalidade no Acrobat/Reader desktop.
- O PNG rasterizado do pop-up era incorporado além da imagem original (Base64) armazenada no HTML da nota; havia ainda ausência de object streams. O novo formato usa JPEG para a aparência, stream Flate para os metadados e object streams do PDF.
- A aparência Form XObject referencia o JPEG; a escrita do PDF final ainda exige validação prática com `pdf-lib` real e Acrobat.

## Limitações de validação

**Não foi possível testar uma exportação completa com a biblioteca real `pdf-lib` carregada do CDN, nem inspecionar o documento específico relatado pelo usuário, nem executar o Adobe Acrobat.** Os resultados acima não comprovam que o PDF baixado exiba a imagem no Acrobat; a capacidade de hover em leitores de navegador permanece intencionalmente desabilitada para preservar a seleção. A redução exata do tamanho dependerá da imagem e do documento original. Recomenda-se validar com cópia antes do uso de produção.
