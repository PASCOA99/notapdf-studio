# Relatório de testes — NotaPDF Studio 1.6.0

## Executados

- `node --check app.js` — PASSOU (sintaxe)
- `node --check overlay_pdf.js` — PASSOU (sintaxe)
- `node tests/overlay.test.mjs` — PASSOU: imagem em OCG desligado por padrão, parâmetros de posição, scripts E/X/U, fixar/desafixar, recursos de página preservados, limpeza/recriação sem acumulação.
- `python tests/browser_popup_selection.py` — PASSOU: nota com imagem não bloqueia arraste; hover funciona no visualizador web; fechar devolve hit-test à camada de texto.
- `python tests/browser_overlay_export.py` — PASSOU: fluxo da interface de exportação com adaptadores simulados de pdf-lib/pdf.js, duas notas (imagem + texto), JPEG/PNG respectivamente, **uma única página**, duas camadas opcionais e apenas dois campos de ícone de 23 pt, metadados de imagem intactos.
- `python tests/ocg_real_pdf.py` — PASSOU: PDF real de referência com OCG desligado, texto selecionável e renderização intacta; acionar camada exibe imagem sobre a mesma página, sem páginas adicionais; renderização de PDF por Poppler.

## O que falta validar

- Ainda **não** foi executada a exportação end-to-end com **pdf-lib 1.17.1 real**, carregada da CDN. Os testes de exportação usam stubs para isolamento do JavaScript, não verificam a serialização produzida pela biblioteca de terceiros.
- Ainda **não** foi aberta a exportação real no Adobe Acrobat/Reader com os eventos de mouse habilitados. A documentação oficial suporta o mecanismo OCG e o JavaScript utilizado, mas isso não comprova o comportamento de um arquivo concreto nesse leitor.
- Chrome/Firefox/Edge não executam necessariamente os gatilhos Acrobat JS quando exibem PDF baixado. A compatibilidade é distinta da interface web.
- O benchmark de compressão varia de acordo com o conteúdo; não há garantia de redução em todos os casos.

**Uso recomendado:** testar primeiramente uma cópia de PDF pequena e confirmar conteúdo, seleção e interface no leitor de destino antes de substituir documentos importantes.
