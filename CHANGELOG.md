# Histórico de alterações — NotaPDF Studio

## 1.7.0 — 02/11/2026

### Grifos e navegação
- Controle de opacidade de 10% a 100% na barra principal e em tela cheia; mantém padrão 42%, e a alteração se aplica somente aos grifos novos.
- Prévia CSS e exportação PDF adotam opacidades independentes para cada grifo; o exportador cria recursos `ExtGState` distintos por nível e mantém as cores e o modo de mistura `Multiply` existentes. Sublinhados continuam com traço opaco.
- Setas físicas ←/→ navegam pelas páginas nas duas visualizações, respeitando limites e sem interceptar atalhos modificados ou campos editáveis.
- O menu de tela cheia foi reposicionado acima do botão para não sobrepor a navegação lateral.

### Editor de notas
- Controle dividido, semelhante ao Word, para texto e marca-texto: botão principal aplica a última cor, seta abre uma paleta de 20 cores comuns com opção personalizada.
- A seleção do editor é preservada ao interagir com a paleta, inclusive para aplicar a mesma cor em vários trechos.
- Correção de `mousedown` que impedia a interação normal com os menus de espaçamento; blocos de texto agora respeitam o espaçamento da nota mesmo com margens e alturas de linha explícitas trazidas de outros editores.
- Não houve alteração no modelo de dados das notas (`NPSData`) nem nas funções existentes de PDFs.

### Validação
- Testes de navegador no Chromium com bibliotecas PDF simuladas para todos os novos controles e regressões das versões anteriores.
- Teste gráfico no PDF cinza fornecido: diferença média de cor de 7,97 por canal a 42% e 13,42 a 70%, preservando o texto escuro.
- Mantida a classificação beta: exportação ponta a ponta no Acrobat e teste em MacBook físico não foram executados.

## 1.6.0 — 02/11/2026

### Seleção de texto em fontes como Palatino Linotype
- A seleção deixa de pintar uma segunda cópia dos caracteres usando uma fonte do navegador. O texto real do PDF segue visível no canvas; apenas uma faixa azul-clara independente indica a seleção.
- Coordenadas das palavras, da faixa e dos novos grifos ficam ancoradas no início e na largura reais dos itens `TextContent` do PDF.js quando disponíveis; trechos parciais são proporcionais dentro de cada item. Fontes indisponíveis e textos rotacionados conservam um fallback.
- Aguarda `document.fonts.ready` antes de reconstruir a geometria, reduzindo erros por carregamento tardio das fontes incorporadas.

### Marcação sobre fundos cinza e coloridos
- O grifo permanente passa a ser acrescentado ao fim da lista `/Contents`, usando `/BM /Multiply` e `/ca 0.42` sobre o conteúdo original, em vez de ser desenhado antes dele. Assim, o fundo opaco da página não apaga a marcação.
- Os fluxos de conteúdo originais são protegidos com `q`/`Q`, e o texto original permanece selecionável. O sublinhado também fica acima do fundo.
- Teste gráfico independente com o PDF de 10 páginas fornecido: ordem antiga resultou em cor invisível; ordem nova produziu alteração visível de cor sem clarear os pixels escuros do texto.
- Funcionalidades das versões anteriores preservadas; versão permanece beta e exportação ponta a ponta com pdf-lib/Acrobat ainda não foi comprovada.

## 1.5.0 — 01/11/2026

### Edição de notas
- Novos controles de espaçamento entre linhas (1,0 / 1,15 / 1,5 / 2,0) e após parágrafos (0 / 4 / 8 px).
- Notas novas iniciam com espaçamento simples e sem espaço após parágrafos; notas antigas preservam o espaçamento anterior, caso ainda não possuam preferências próprias.
- Preferências de espaçamento persistem em `NPSData` e são usadas no editor, na prévia e no raster da exportação PDF.
- Texto não formatado em preto sobre fundo branco no editor, inclusive com tema escuro; cores intencionais no HTML permanecem preservadas.

### Navegação e atalhos
- Campo de página passa a selecionar seus dígitos ao clicar/receber foco e aceita Enter para navegar diretamente.
- Botões laterais de página anterior/seguinte no modo tela cheia, com limites refletidos no estado desativado.
- Atalhos Alt/Option+V/B/N passam a verificar `KeyboardEvent.code` para reconhecer teclados macOS com símbolos ou teclas mortas.
- Atalhos do PDF não interferem na digitação do editor de notas.

### Testes e limites
- Novas verificações Node e teste Chromium de interface com bibliotecas PDF simuladas e eventos Option simulados.
- Os sete arquivos enviados foram preservados como base. Os arquivos antigos da pasta de testes não foram fornecidos nesta revisão; exportação PDF real e Adobe Acrobat continuam sem validação end-to-end.

## 1.4.0 — 31/10/2026

### Seleção textual
- Reconstrução de separadores visuais entre spans da TextLayer, com espaço na mesma linha e quebra de linha quando muda a linha de base.
- Segmentação de palavras por `Intl.Segmenter` e medição de retângulos com `Range.getClientRects()`.
- Hit-test prioriza a linha visual mais próxima; impede selecionar a primeira palavra da linha inferior enquanto o ponteiro ainda está na linha superior.
- Ao cruzar da primeira para a segunda palavra, a âncora passa ao início da primeira palavra, mantendo-a integralmente selecionada.
- Ao recuar dentro da palavra ativa, retorna à seleção por caracteres; ao avançar, a palavra volta a ser completada.
- Duplo clique seleciona somente a palavra, sem pontuação ou espaço posterior.

### Grifos
- Prévia visual ajustada para 42% de opacidade e modo Multiply.
- Exportação PDF usa preenchimento `/ca 0.42` e traço `/CA 1`.
- Teste de PDF real compara pixels escuros dos caracteres antes/depois do grifo, além de verificar extração de texto e posição do sublinhado.

### Testes
- Testes Node de funções de dados.
- Testes de interface Chromium com PDF.js/pdf-lib simulados.
- Teste independente de fluxo PDF real com PyMuPDF e pypdf.

### Limitações
- O teste de interface usa stubs das bibliotecas externas; não valida o exportador pdf-lib real.
- O teste de fluxo PDF comprova a ordem de desenho vetorial e preservação de pixels do texto, mas não substitui validação no Adobe Acrobat.
- Continua sendo uma versão beta técnica.

## 1.3.0
- Grifos vetoriais inseridos antes dos fluxos originais.
- Ajustes de seleção textual, cursor e sublinhado.

## 1.2.0
- Correção da camada TextLayer, modo escuro inicial, atalhos e menu de tela cheia.

## 1.1.0
- Rolagem interna de notas, fontes menores, imagens coladas, grifos e sublinhados permanentes.
