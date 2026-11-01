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
