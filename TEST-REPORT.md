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
