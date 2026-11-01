# Histórico — NotaPDF Studio

## 1.6.1 — correção da falha de exportação em recursos opcionais

- Corrigidas consultas tipadas a recursos opcionais inexistentes (`/Properties`, `/XObject`, `/OCProperties`, `/D`, `/OCGs`, `/OFF`, `/Order`, `/ON`).
- Preservados os objetos indiretos originais de `/Contents`, tanto para streams individuais quanto arrays indiretos.
- Testes de regressão estritos: primeira exportação, recursos herdados, OCGs estrangeiros, reexportação sem acumular camadas e proteção das imagens originais.
- Textos de interface atualizados para remover referências ultrapassadas a páginas vinculadas da versão 1.5.0.
- Continuam sem páginas auxiliares e com a estrutura de sobreposição em OCG.

## 1.6.0 — pop-ups sobre a página

- Retiradas a criação de páginas extras, os links de navegação e a nota textual duplicada introduzidos na 1.5.0.
- Conteúdo visual de cada nota criado como XObject JPEG/PNG dentro de um OCG de PDF, inicialmente desligado por `/OCProperties /D /OFF`.
- Ícone de campo botão com área de interação pequena (~23 pt); ações Acrobat JS `E`, `X`, `U` alternam o OCG por nome; nenhum widget amplo/interativo encobre o texto fechado.
- Ao reexportar, eliminam-se os streams `/NPSOverlay`, entradas `/NPSIMG_*`, `/NPSOC_*` e referências aos OCGs anteriormente gerados.
- Compatibilidade de leitura com metadados v1–v5; migração de arquivos 1.5 com remoção das páginas anexas.
- JPEG qualidade 80% para notas com imagens, PNG para texto puro, armazenamento editável em fluxo Flate.
- Testes: geometria/ações/remoção OCG em Node, hover e seleção em Chromium, fluxo de exportação com stubs em Chromium e PDF real de referência com PyMuPDF/Poppler.

**Nota:** navegadores com visualizadores nativos de PDF não garantem Acrobat JavaScript. Interação garantida no web editor; resultado final Adobe ainda sem teste real neste ambiente.
