# Relatório de testes — NotaPDF Studio 1.4.1

Data: 31/10/2026

## Verificações executadas nesta versão

| Verificação | Resultado | Alcance |
|---|---|---|
| `node --check app.js` | PASSOU | Sintaxe JavaScript da aplicação |
| `node --check core.js` | PASSOU | Sintaxe JavaScript da lógica dos pop-ups |
| `node tests/popup_geometry.test.mjs` | PASSOU | Coordenadas do widget escondido e transições de abertura/fixação/fechamento simuladas |
| `python tests/browser_popup_selection.py` | PASSOU | Seleção longa sobre uma região de nota com imagem; prévia fechada sem sobreposição; abertura e fechamento no Chromium |

## Diagnóstico do defeito corrigido

Na versão anterior, a exportação criava o botão da imagem/pop-up ocupando **todo o espaço futuro do pop-up** e aplicava somente o flag `/F Hidden`. Alguns visualizadores podem continuar considerando esse retângulo para interações de ponteiro ou seleção, apesar de a imagem estar invisível. Quanto maior a imagem, maior a área potencialmente afetada.

Na versão 1.4.1, as coordenadas da anotação no PDF exportado permanecem fora da página quando a nota está fechada. Quando um leitor com Acrobat JavaScript abre a nota, `Field.rect` coloca o retângulo na posição correta; quando fecha, o retira. No editor web, o evento de hover também é suprimido durante o arraste da seleção.

## Limitações

O teste de navegador usa PDF.js/pdf-lib simulados; o teste unitário em Node simula as ações JavaScript do Acrobat e não executa o Acrobat. **Não foi validada uma exportação end-to-end com a biblioteca pdf-lib real nem o comportamento do PDF exportado no Adobe Acrobat.** O documento é uma versão beta técnica e deve ser testado sobre cópias de PDFs antes de uso crítico.

Os resultados apresentados em relatórios anteriores pertencem à versão anterior e não foram reexecutados nesta entrega, pois os arquivos originais desses testes não foram disponibilizados.
