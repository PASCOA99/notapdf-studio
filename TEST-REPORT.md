# Relatório de testes — NotaPDF Studio 1.9.2

Data: 03/11/2026. Base: pacote ZIP original 1.9.1, sem alterações nas funções de notas, grifos sólidos/opacidade, navegação, exportação ou no CSS.

| Teste | Resultado | Cobertura |
|---|---|---|
| `node --check app.js; node --check core.js` | PASSOU | Sintaxe dos dois módulos |
| `node tests/core.test.mjs` | PASSOU | Normalização e dados existentes das notas |
| `node tests/justified_geometry.test.mjs` | PASSOU | `TJ`, espaçamento de palavras, matrizes, `BT/Tm/Td` por caractere, lacunas inseridas e fallback |
| `python tests/justified_geometry_browser.py` | PASSOU | Chromium: fonte substituta com largura deliberadamente diferente, posição da seleção `serviço comum`, cursor, Alt+V e criação de nota |
| `python tests/browser_regression.py` | PASSOU | Seleção e funções 1.6–1.9.1, tela cheia, navegação, notas e atalhos |
| `python tests/browser_integrated_ui.py` | PASSOU | Testes integrados da interface com bibliotecas PDF simuladas, incluindo destaque sólido, opacidade, histórico e checkbox V/B |
| `python tests/pdf_colored_background_regression.py <PDF>` | PASSOU | Composição dos grifos sobre o fundo cinza do PDF de licitações, preservação de texto e anotações (ensaio independente) |
| `python tests/pdf_opacity_render_regression.py <PDF>` | PASSOU | Opacidades 10%, 42% e 90% distintas no PDF real (ensaio independente) |
| `python tests/pdf_solid_real_regression.py <PDF>` | PASSOU | Destaques sólidos amarelos/magenta e preservação de texto/anotações (ensaio independente) |

**Achado do teste justificado:** o trecho `comum` deveria começar na coordenada PDF **x=168,6 pt**, devido a um ajuste `TJ` de 9,6 pt. Com uma fonte substituta deslocada, a versão corrigida retornou `x1=168,6 pt` e `x2=208,6 pt`; Alt+V gerou exatamente o mesmo intervalo. O teste verifica também um exemplo em que o texto é desenhado com operações `BT/Tm/Td` independentes (sem depender do cálculo proporcional do navegador).

**Limitações:** os testes do Chromium executam o `app.js` real, mas substituem as bibliotecas PDF.js, pdf-lib e html2canvas. Os testes de PDF real independentes mantêm o escopo gráfico de versões anteriores, sem comprovar a exportação ponta a ponta. A sessão não validou este ajuste usando o PDF.js real do CDN, nem executou em MacBook, Safari ou Acrobat. A altura da seleção ainda acompanha a camada de texto do PDF.js; a correção desta versão é voltada à **posição horizontal de caracteres e espaços justificados**. PDFs rotacionados, com escrita vertical ou caracteres compostos podem seguir o fallback quando a verificação geométrica não é segura. A melhoria deve ser conferida visualmente em uma cópia do PDF original antes da publicação definitiva.

---

# Relatório de testes — NotaPDF Studio 1.9.1

**Data:** 03/11/2026  
**Base:** versão 1.9.0. Alterações restritas ao roteamento de grifos V/B, checkbox, apresentação e documentação; `core.js` e os algoritmos de desenho/exportação não foram modificados.

| Teste executado | Resultado | Cobertura |
|---|---|---|
| `node --check app.js && node --check core.js` | PASSOU | Integridade sintática |
| `node tests/core.test.mjs` | PASSOU | 12 verificações de notas/preferências |
| `python tests/browser_regression.py` | PASSOU | Seleção, fontes, Alt/Option V/B/N, navegação, notas, editor e tela cheia |
| `python tests/browser_integrated_ui.py` | PASSOU | Fluxo real de interface Chromium e nova checkbox; cores por atalho, modo sólido e comum, mudança imediata de volta, atalhos teclado, botões principais e em tela cheia, Option+B simulado, isolamento de opacidade, sublinhado e ausência de erros de console |
| `python tests/pdf_colored_background_regression.py '01 1883 + 380 - Licitações.pdf'` | PASSOU | Grifo comum legível sobre cinza |
| `python tests/pdf_opacity_render_regression.py '01 1883 + 380 - Licitações.pdf'` | PASSOU | Intensidades 10%, 42%, 90% do grifo comum |
| `python tests/pdf_solid_real_regression.py '01 1883 + 380 - Licitações.pdf'` | PASSOU | Cor sólida amarela/magenta sobre PDF real e preservação de texto/anotações |

**Resultados específicos:** ao iniciar, ambas as checkboxes estão desmarcadas. Com a checkbox ativada, Alt+V produz um recorte sólido na cor primária e Option+B simulado produz outro na cor secundária; o controle de opacidade pode mudar de 23% para 91% sem modificar o destaque sólido. Em tela cheia, o botão principal de grifo e o atalho fazem destaque sólido com o mesmo estado; desativar a checkbox no menu muda simultaneamente a barra principal e os próximos Alt+B voltam a respeitar a opacidade do grifo comum. Alt+N continua sendo sublinhado.

**Limites de teste:** `browser_integrated_ui.py` executa o aplicativo em Chromium com PDF.js/pdf-lib/html2canvas substituídos por stubs; os testes gráficos independentes usam o PDF real e PyMuPDF/pypdf. Ainda não houve exportação ponta a ponta com o `pdf-lib` real carregado pelo CDN, nem validação física em MacBook, Safari ou Adobe Acrobat. Os resultados não demonstram compatibilidade total com todos os PDFs; o recurso sólido mantém limitações para texto claro e fundos complexos.

---

# Relatório de testes — NotaPDF Studio 1.9.0

**Data:** 03/11/2026  
**Base:** versão 1.8.0 corrigida, construída sobre 1.6.0 funcional.

| Comando | Resultado | Cobertura |
|---|---|---|
| `node --check app.js` e `node --check core.js` | PASSOU | Sintaxe JS |
| `node tests/core.test.mjs` | PASSOU | Funções puras e notas |
| `python tests/browser_regression.py` | PASSOU | Seleção, notas, navegação, fontes e atalhos |
| `python tests/browser_integrated_ui.py` | PASSOU | Eventos de interface, botão **Sólido**, seleção/cor/undo, conversão de pixels, estrutura da imagem para exportação, funções 1.8.0 |
| `python tests/pdf_solid_real_regression.py /caminho/do/pdf` | PASSOU | Aplicou a função JavaScript original a uma renderização real do PDF de fundo cinza; montou PDF temporário com PyMuPDF; cores amarelo `#ffff00` e magenta `#ff00ff`, texto extraível e anotações preservadas |
| `python tests/pdf_colored_background_regression.py /caminho/do/pdf` | PASSOU | Grifo tradicional sobre fundo cinza |
| `python tests/pdf_opacity_render_regression.py /caminho/do/pdf` | PASSOU | Grifo tradicional com 10%, 42% e 90% |

**Resultado principal do modo sólido:** recorte sintético com fundo cinza RGB(189,189,189) ficou exatamente RGB(255,255,0) fora dos glifos; letras pretas RGB(0,0,0) continuaram pretas. A renderização do PDF real continha milhares de pixels de cores saturadas nos dois recortes de teste, com texto extraível inalterado e mesma contagem de anotações.

**Distinção importante:** no teste com PDF real, a rotina JavaScript de recomposição visual foi executada em Chromium, mas a colocação da imagem em PDF foi feita com PyMuPDF, não pelo `pdf-lib` carregado da rede. O teste de interface simula bibliotecas PDF; portanto **não houve exportação ponta a ponta do aplicativo com o pdf-lib real**. Não foram executados testes em MacBook físico, Safari ou Acrobat. Recomendamos validar em cópia de documento antes da publicação definitiva.

---

# Relatório de testes — NotaPDF Studio 1.8.0

**Data:** 03/11/2026  
**Base do código:** versão 1.6.0 enviada pelo usuário (não o código 1.7.0).  
**Conclusão:** verificações abaixo executadas com sucesso; a exportação PDF JavaScript completa continua sem validação ponta a ponta.

| Verificação | Resultado | Cobertura |
|---|---|---|
| `node --check app.js` e `node --check core.js` | PASSOU | Sintaxe JavaScript |
| IDs do HTML versus seletores JS | PASSOU | Nenhuma referência a ID estático ausente; nenhuma duplicidade de ID |
| `node tests/core.test.mjs` | PASSOU | 12 verificações: dados, normalização, preferências de espaçamento, helpers |
| `python tests/browser_regression.py` | PASSOU | Compatibilidade funcional 1.6.0 com biblioteca PDF simulada: páginas, seleção de texto/fontes, notas, atalhos macOS, fullscreen |
| `python tests/browser_integrated_ui.py` | PASSOU | Inicialização ESM com import real do core via `blob:`, clique real em + Nova nota, colocação, edição, salvar/reabrir, cores, espaçamento, navegação por setas, tela cheia, undo/redo, cancelamento com Esc, ausência de exceções |
| Teste de imagem no Chromium | PASSOU | Grifos 42% e 90% sobre fundo cinza produziram pixels diferentes: `(188,213,217)` e `(187,241,249)` |
| Teste da serialização de estados gráficos | PASSOU | O código de exportação de grifos gerou `/ExtGState` distintos (`/ca 0.42`, `0.9` e `1`) com operações de preenchimento e sublinhado |
| `python tests/pdf_colored_background_regression.py /caminho/do/PDF` | PASSOU | PDF real com fundo cinza, preservação de texto e anotações, grifo visível sobre o fundo; 100% dos pixels escuros preservados na região de teste |
| `python tests/pdf_opacity_render_regression.py /caminho/do/PDF` | PASSOU | PDF real, três faixas de teste com opacidades 10%, 42% e 90%, intensidades diferentes renderizadas pelo PyMuPDF |

## Casos de uso verificados na interface

- **Nova nota:** upload via campo arquivo → PDF renderizado → botão habilitado → clique em **+ Nova nota** → banner de posicionamento → clique sobre a página → diálogo aberto → título preenchido → **Salvar nota** → ícone aparece → clique para ver prévia → **Editar** reabre o conteúdo.
- **Navegação:** ← e → alteram página, respeitam limites e funcionam em tela cheia; campos de entrada permanecem livres para mover o cursor do texto.
- **Opacidade:** 42% inicial, 90% após interação real com o slider, duas marcações com intensidades independentes; sincronização com o slider de tela cheia; mudanças constatadas em captura de tela e em operadores PDF produzidos pelo código.
- **Cores:** seta abre paleta não recortada, escolha de vermelho altera seleção, botão principal repete vermelho sem reabrir a paleta; a paleta de marca-texto funciona independentemente.
- **Entrelinhas:** texto HTML com `line-height:2` e `margin-bottom:22px` herdados de colagem muda visualmente de 1,0 / 0px para 2,0 / 8px e permanece assim após salvar/reabrir a nota.
- **Regressão 1.6:** seleção em textos com fontes substitutas, cliques em tela cheia, numeração por Enter, atalhos `Option+V/B/N` simulados e visual de texto na nota não sofreram regressões detectadas.

## Limites e riscos restantes

- As bibliotecas **PDF.js, pdf-lib e html2canvas foram simuladas nos testes de navegador**; os arquivos CDN reais não estavam acessíveis no ambiente. O módulo principal foi executado como ES module via `blob:` (com `loadPDFJs()` substituído para usar stub). Essa estratégia testa eventos, estado, visualização de marcações e diálogos, mas não comprova o download nem a reabertura de um PDF exportado com `pdf-lib` real.
- A serialização de `/ExtGState` é exercitada com o código efetivo do aplicativo, porém por um contexto PDF simulado. O teste de desenho no PDF real é independente do exportador do navegador.
- Não há teste direto em **MacBook**, **Safari** nem **Adobe Acrobat**. A interação dos pop-ups exportados continua dependendo de Acrobat JavaScript.
- O PDF de exemplo é usado localmente nos testes e **não está distribuído no ZIP**.
- Recomendação: antes de substituir o aplicativo em produção, publicar o pacote em um ambiente de teste e abrir/salvar/reabrir cópias de um PDF com fundo colorido e de outro com anotações preexistentes.

---

# Relatório de testes — NotaPDF Studio 1.6.0

Data: 02/11/2026

## Testes realizados nesta revisão

| Teste | Resultado | Cobertura |
|---|---|---|
| `node --check app.js` e `node --check core.js` | PASSOU | Sintaxe JavaScript |
| `node tests/core.test.mjs` | PASSOU | 12 verificações da biblioteca de dados de notas |
| `python tests/browser_regression.py` | PASSOU | Chromium com PDF.js/pdf-lib simulados: cinco ajustes anteriores, associação automática de `TextContent` a spans, seleção sem sobreimpressão de fonte e coordenadas ancoradas no item PDF |
| `python tests/pdf_colored_background_regression.py /caminho/do/PDF` | PASSOU | PDF real fornecido pelo usuário, 10 páginas, Palatino e fundo cinza: mistura `Multiply` após o conteúdo, extração de texto, anotações, pixels de texto escuro |

**Achado reproduzido no arquivo fornecido:** as páginas iniciam com um retângulo cinza opaco. Com o método anterior de acrescentar grifos antes do conteúdo, a diferença média de pixels na região de teste foi **0,00**, ou seja, o grifo desapareceu. Com `Multiply` após o conteúdo, a diferença média foi **7,97** níveis RGB por canal na área selecionada. Foram retidos **100%** dos pixels anteriormente identificados como texto escuro nessa região. A extração de texto e a contagem de anotações existentes também permaneceram estáveis.

**Limites:** o teste do navegador emprega substitutos de PDF.js/pdf-lib e um documento sintético para a geometria da seleção. O teste independente do PDF real usa pypdf e PyMuPDF para validar a técnica de desenho, não o código de exportação do pdf-lib no navegador. O PDF não acompanha este pacote. Não houve execução em MacBook físico nem teste ponta a ponta com as dependências do CDN e o Adobe Acrobat. PDFs com letras combinadas, kerning complexo, texto inclinado ou fontes com codificação excepcional devem ser inspecionados manualmente antes de uso definitivo.

---

# Relatório de testes — NotaPDF Studio 1.5.0

Data: 01/11/2026

## Resultado desta revisão

| Teste | Resultado | Escopo |
|---|---|---|
| `node --check app.js` | PASSOU | Sintaxe JavaScript do aplicativo |
| `node --check core.js` | PASSOU | Sintaxe dos helpers |
| `node tests/core.test.mjs` | PASSOU | 12 verificações: normalização de notas, espaçamento legado e novo, utilitários |
| `python tests/browser_regression.py` | PASSOU | Chromium: seleção automática de página, Enter, setas de tela cheia, estilo do editor e persistência de opções, texto com cor explícita e atalhos macOS simulados |

**Detalhamento:** o teste Chromium simulou um PDF de três páginas com um substituto de PDF.js e um substituto de pdf-lib para validar a interface, não a exportação real. Simulou `Option+V`, `Option+B` e `Option+N` produzindo `key=√`, `key=∫` e `key=Dead`, respectivamente, e `code=KeyV/KeyB/KeyN`; os três acionaram a marcação correspondente. Não foi executado teste em hardware MacBook físico.

**Limitações:** a exportação PDF ponta a ponta com pdf-lib, a preservação de recursos particulares em PDFs externos e a execução no Adobe Acrobat continuam sem nova validação nesta versão. A pasta de testes anterior não foi fornecida no conjunto de entrada; os resultados de 1.4.0 abaixo são históricos e não devem ser confundidos com testes reexecutados.

---

# Relatório de testes — NotaPDF Studio 1.4.0

Data: 31/10/2026

## Resultado

| Teste | Resultado | Escopo |
|---|---|---|
| `node --check app.js` | PASSOU | Sintaxe JavaScript |
| `node tests/core.test.mjs` | PASSOU | 8 verificações de funções puras |
| `python tests/browser_smoke.py` | PASSOU | Interface Chromium com stubs de PDF.js/pdf-lib |
| `python tests/pdf_stream_order_test.py` | PASSOU | PDF real gerado com PyMuPDF/pypdf |

## Casos de seleção cobertos no Chromium

- Duplo clique seleciona somente a palavra, sem vírgula ou espaço seguinte.
- Ao iniciar no meio da primeira palavra e avançar para a segunda, a primeira passa a ficar integralmente selecionada.
- Ao recuar dentro da palavra ativa, a seleção retorna ao nível de caracteres.
- Ao arrastar horizontalmente até o fim da primeira linha, a primeira palavra da linha seguinte não é selecionada.
- Ao mover o ponteiro para a linha seguinte, a seleção alcança as palavras daquela linha sem incluir a pontuação posterior.

## Aparência dos grifos

- Prévia CSS usa opacidade 0,42 e `mix-blend-mode: multiply`.
- Exportador gera preenchimento vetorial com `/ca 0.42` antes do conteúdo original e mantém `/CA 1` para o traço do sublinhado.
- O teste PDF compara pixels escuros do texto antes/depois; a quantidade de pixels escuros permanece dentro de 2% do original.
- Texto permanece extraível após a inserção do fluxo vetorial.

## Limitações da validação

O teste de navegador substitui PDF.js e pdf-lib por stubs para isolar e testar a lógica de interface, seleção e geometria. O teste PDF real valida a ordem de desenho e a aparência vetorial por meio de PyMuPDF/pypdf, mas não executa o exportador completo da biblioteca pdf-lib nem abre o arquivo final no Adobe Acrobat. A versão continua classificada como beta técnica.
