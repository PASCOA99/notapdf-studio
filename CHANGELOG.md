# Histórico — NotaPDF Studio

## 1.6.0 — pop-ups sobre a página

- Retiradas a criação de páginas extras, os links de navegação e a nota textual duplicada introduzidos na 1.5.0.
- Conteúdo visual de cada nota criado como XObject JPEG/PNG dentro de um OCG de PDF, inicialmente desligado por `/OCProperties /D /OFF`.
- Ícone de campo botão com área de interação pequena (~23 pt); ações Acrobat JS `E`, `X`, `U` alternam o OCG por nome; nenhum widget amplo/interativo encobre o texto fechado.
- Ao reexportar, eliminam-se os streams `/NPSOverlay`, entradas `/NPSIMG_*`, `/NPSOC_*` e referências aos OCGs anteriormente gerados.
- Compatibilidade de leitura com metadados v1–v5; migração de arquivos 1.5 com remoção das páginas anexas.
- JPEG qualidade 80% para notas com imagens, PNG para texto puro, armazenamento editável em fluxo Flate.
- Testes: geometria/ações/remoção OCG em Node, hover e seleção em Chromium, fluxo de exportação com stubs em Chromium e PDF real de referência com PyMuPDF/Poppler.

**Nota:** navegadores com visualizadores nativos de PDF não garantem Acrobat JavaScript. Interação garantida no web editor; resultado final Adobe ainda sem teste real neste ambiente.
