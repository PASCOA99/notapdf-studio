# Relatório de testes — NotaPDF Studio 1.7.0

Data: 02/11/2026

## Execução desta revisão

| Teste | Resultado | Cobertura |
|---|---|---|
| `node --check app.js` e `node --check core.js` | PASSOU | Sintaxe JavaScript |
| `node tests/core.test.mjs` | PASSOU | 12 verificações de dados e preferências anteriores |
| `python tests/browser_regression.py` | PASSOU | Chromium: paleta do editor, repetição de cores, controles de espaçamento do mouse, espaçamento em HTML com atributos inline, atalhos de navegação ←/→, Opacity 42/70%, sincronização tela cheia, simulação de estados gráficos de PDF, e regressões anteriores |
| `python tests/pdf_colored_background_regression.py /caminho/da/amostra.pdf` | PASSOU | PDF real de 10 páginas fornecido pelo usuário: fundo cinza, grifos a 42% e 70%, caracteres escuros, texto extraível e anotações |

**Opacidade:** no PDF de teste, o grifo a 42% produziu uma diferença média de pixels de **7,97**, e a 70% de **13,42**, em relação à página original. A retenção dos pixels escuros do texto na região testada foi de **100%** nos dois níveis. O teste usa PyMuPDF/pypdf para simular a mesma estratégia de composição usada no aplicativo.

**Compatibilidade:** todos os casos de regressão da versão 1.6.0 no Chromium continuaram passando. As preferências antigas de espaçamento das notas e os marcadores antigos de 42% continuam reconhecidos. Não houve exclusão de recursos existentes.

**Limitações:** o teste de navegador emprega substitutos locais de PDF.js e pdf-lib; os estados gráficos de múltipla opacidade foram inspecionados em uma simulação controlada da camada do exportador, não em um PDF exportado de ponta a ponta com pdf-lib real no navegador. O PDF real valida as operações vetoriais com pypdf/PyMuPDF, não substitui a verificação manual no Acrobat, e o teste do macOS é simulado, não feito em hardware Apple. O arquivo PDF fornecido não acompanha a entrega.

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
