# NotaPDF Studio — editor de notas pop-up para PDFs

**Versão 1.5.0 (beta técnica)** · português · aplicativo estático para GitHub Pages

Editor gratuito, executado no navegador, para abrir PDFs, navegar pelas páginas, adicionar notas interativas com texto formatado, tabelas e imagens redimensionáveis, e baixar uma versão modificada do documento.

## Implantar no GitHub Pages — sem instalação

1. Baixe o arquivo ZIP fornecido, **extraia-o** em uma pasta no computador.
2. Acesse https://github.com/new, faça login e crie um repositório público chamado `notapdf-studio` (o nome pode ser outro). Clique em **Create repository**.
3. No repositório, vá em **Add file → Upload files**. Envie o **conteúdo extraído** da pasta: `index.html`, `styles.css`, `app.js`, `core.js`, `.nojekyll`, `.gitignore`, `README.md`, `CHANGELOG.md`, `TEST-REPORT.md` e, se desejar, a pasta `tests`. **Não envie somente o ZIP.**
4. Confirme em **Commit changes**.
5. Abra **Settings → Pages**. Em **Build and deployment → Source**, escolha **Deploy from a branch**. Selecione **main** e **/(root)**. Clique **Save**.
6. Após a publicação, abra `https://SEU-USUARIO.github.io/notapdf-studio/`. O endereço exato também aparece em **Settings → Pages**.

> **Importante:** jamais envie PDFs pessoais para o repositório. Apenas arquivos da ferramenta precisam estar publicados. Os PDFs abertos no editor são processados no navegador.

O GitHub Pages serve arquivos estáticos e não requer banco de dados, servidor Python ou `npm`. As bibliotecas são carregadas de um CDN externo — é necessário acesso à internet ao abrir a página. Se a empresa bloquear cdns, elas não serão carregadas.

## Usar a ferramenta

1. Clique em **Abrir PDF** (ou arraste um PDF para a área de visualização).
2. O PDF abre inicialmente com zoom de 90%. Use os controles para mudar de página e ampliar/reduzir o zoom. O modo escuro já é ativado por padrão. O botão ☀ alterna para o modo claro; a página PDF não recebe filtro nem alteração de cor.
3. Clique em **+ Nova nota** e depois no ponto da página onde deseja colocar o ícone amarelo.
4. Na janela de edição, use os controles de fonte, cor, negrito, alinhamento, listas, tabela e imagem. A imagem pode ser adicionada por upload ou colada diretamente da área de transferência (JPG/PNG/WebP/GIF até 8 MB). Depois de adicionar, arraste o quadradinho azul do canto inferior direito da imagem para ajustar seu tamanho. Imagens dentro do pop-up podem ser clicadas para alternar a ampliação.
5. Ajuste título, fundo, borda e largura do pop-up. A altura passa a acompanhar o conteúdo até o limite da página; se necessário, a rolagem ocorre dentro da nota. Clique em **Salvar nota**.
6. Passe o mouse sobre o ícone para mostrar o pop-up. Clique para fixar. Clique em **Editar**, no pop-up, ou na lista lateral para reabrir o editor.
7. Clique em **Salvar PDF**. Aguarde o download do arquivo com o sufixo `_com_notas.pdf`.
8. **Para editar uma nota mais tarde**, abra novamente o PDF exportado neste mesmo aplicativo. O conteúdo estruturado das notas foi embutido no catálogo PDF (`/NPSData`).

#### Novidades da versão 1.5.0 — editor e navegação

- **Entre linhas:** no editor de notas, o seletor **Entre linhas** oferece **Simples · 1,0** (padrão para notas novas), 1,15, 1,5 e Duplo · 2,0. A alteração aparece imediatamente no editor, na nota exibida no visualizador e na aparência exportada para o PDF.
- **Após parágrafo:** o seletor permite **Nenhum** (padrão), **Pequeno · 4 px** ou **Maior · 8 px**. Uma nota antiga sem essas preferências mantém o espaçamento da versão anterior (aproximadamente 1,55 entre linhas e 8 px após parágrafos) até que o usuário o altere; as novas escolhas ficam guardadas nos metadados para reedição posterior.
- **Texto preto no editor:** o fundo do campo de digitação permanece branco e o texto não formatado fica preto, inclusive com o tema escuro da interface. Uma cor aplicada intencionalmente a um trecho permanece preservada.
- **Ir para página:** clicar no campo do número seleciona todos os dígitos automaticamente. Digite a nova página e pressione **Enter**; o campo também aceita a mudança quando perde o foco. Páginas acima do total vão para a última; valores vazios ou inválidos mantêm a página atual.
- **Tela cheia:** os botões laterais **‹** e **›** passam para a página anterior ou seguinte, com desativação automática no início ou no final do PDF. O menu de três pontos e suas funções originais permanecem disponíveis.
- **Atalhos do PDF:** Windows/Linux **Alt+V/B/N**; Mac **Option (⌥)+V/B/N**. O código usa a tecla física `KeyboardEvent.code`, pois a tecla Option pode produzir símbolos em vez das letras esperadas. Os atalhos não interceptam a digitação quando a janela de edição da nota está aberta. Os atalhos precisam de texto selecionado no PDF.

#### Seleção de texto, grifos e sublinhados queimados no PDF

- A ferramenta **I — Selecionar texto** fica ativa por padrão. O cursor muda para a forma de texto ao passar sobre o texto selecionável. PDFs digitalizados como imagem não possuem texto selecionável; nesses casos é necessário OCR externo antes de usar grifos por seleção.
- A seleção visual usa azul-marinho mais forte e texto branco. No duplo clique, apenas a palavra é selecionada, sem espaço ou pontuação posterior. No arraste, a primeira palavra é selecionada caractere a caractere; ao entrar nas palavras seguintes, a palavra é completada; ao recuar dentro da última palavra alcançada, a seleção volta a acompanhar os caracteres.
- Selecione um trecho de texto e use **Alt+V** para o grifo primário (azul `#baf6ff`), **Alt+B** para o grifo secundário (amarelo `#ffeaa7`) ou **Alt+N** para sublinhado (vermelho `#ff0000`). Também existem botões na barra superior e seletores para personalizar as três cores.
- Esses novos grifos e sublinhados são gravados em um fluxo de conteúdo da própria página, inserido no início de `/Contents`. O fluxo é pintado antes dos fluxos originais; por isso, o texto e as imagens originais são renderizados por cima da cor do grifo. As marcações ficam **queimadas no conteúdo da página**, não são comentários nem anotações PDF e não aparecem como uma camada opcional. O texto original continua extraível e selecionável. Tecnicamente, o PDF ganha instruções gráficas no fluxo de conteúdo, mas não uma anotação, camada opcional ou imagem rasterizada da página inteira.
- Ctrl+Z/Ctrl+Y e os botões ↶/↷ desfazem/refazem operações do editor fora do campo de texto; dentro do editor rico, os atalhos continuam sendo os comandos de edição de texto.
- **Cores das marcações antigas:** o visualizador usa a cor RGB informada pela anotação original e os quadriláteros `/QuadPoints`, em vez de colorir todos os grifos como amarelos ou usar um retângulo amplo.

#### Modo de tela cheia

- Clique em **⛶** para entrar no modo de tela cheia. Em navegadores compatíveis, a Fullscreen API oculta também as abas e a barra do navegador. O cabeçalho, a barra de navegação, a lista lateral e a barra de status do aplicativo desaparecem.
- Um botão flutuante de três pontos aparece à direita; passe o mouse sobre ele ou clique para expandir as ferramentas de seleção, notas e marcação. O botão adapta o contraste ao tema. Pressione Esc ou use **Sair da tela cheia** para retornar.

#### Seleção de texto — revisão 1.4.0

- A camada textual continua sendo a `TextLayer` do PDF.js, com texto transparente sobre o canvas original; somente a seleção nativa recebe fundo azul-marinho e texto branco.
- O índice de texto agora reconstrói separadores visuais entre spans: insere espaço quando há intervalo horizontal na mesma linha e quebra de linha quando a linha de base muda. Isso impede que o hit-test escolha a primeira palavra da linha seguinte quando o ponteiro ainda está na linha atual.
- Cada palavra é segmentada com `Intl.Segmenter` (`granularity: "word"`), e seu retângulo visual é medido com `Range.getClientRects()`. A posição do mouse é resolvida primeiro pela linha visual mais próxima e depois pela palavra/caractere mais próximo.
- No arraste para frente, ao entrar na segunda palavra, a âncora passa para o início da primeira palavra e a palavra atual é completada. Assim, a primeira palavra não fica parcialmente selecionada. Ao recuar dentro da palavra ativa, o foco volta ao caractere; ao avançar novamente, a palavra é completada. A seleção termina no limite da palavra, sem incluir pontuação ou espaço posterior.
- O duplo clique usa o mesmo hit-test e seleciona apenas a palavra (`isWordLike`), sem incluir vírgula, ponto ou espaço seguinte.
- A API `Selection` mantém âncora e foco em seleções direcionais. `Intl.Segmenter` tem fallback por expressão Unicode para navegadores sem suporte.

#### Aparência dos grifos — revisão 1.4.0

- A prévia e o PDF exportado usam opacidade de preenchimento de **42%** para grifos, mantendo a cor leve e uniforme. O sublinhado permanece com opacidade de traço integral, pois a cor precisa continuar legível em sua espessura fina.
- O fluxo de grifos é inserido antes do conteúdo original da página. O teste PDF real compara a quantidade de pixels escuros dos caracteres antes e depois; a diferença permitida é de no máximo 2%, confirmando que o texto preto não fica esbranquiçado ou lavado.
- O grifo continua sendo conteúdo vetorial permanente do PDF, sem rasterizar a página inteira e sem criar anotações removíveis.

## Como o formato foi implementado

- **Visualização e seleção textual:** PDF.js, versão 4.10.38, usando a classe `TextLayer` da API pública (não a função antiga `renderTextLayer`, que não é exportada pelo build genérico dessa versão).
- **Edição e gravação:** pdf-lib, versão 1.17.1.
- **Captura da aparência visual:** html2canvas, versão 1.4.1.
- **Interatividade em leitores compatíveis com Acrobat JavaScript:** dois campos de botão por nota, um para o ícone e outro para o pop-up, com eventos PDF `/AA` (`/E` para entrar, `/X` para sair, `/D` para clicar). Um campo auxiliar guarda o estado fixado/não fixado.
- **Marcação permanente:** grifos e sublinhados criados no site são gravados como operadores gráficos em um fluxo de conteúdo inserido antes dos fluxos originais de cada página. O preenchimento do grifo usa `/ca 0.42` e modo de mesclagem `Multiply`; o traço do sublinhado usa `/CA 1`. Não são adicionadas anotações PDF nem é rasterizada a página.
- **Conteúdo enriquecido:** HTML editável no site. Na exportação, o HTML é rasterizado para uma imagem PNG que serve como aparência do campo pop-up. O HTML original, as dimensões, a posição e os dados das imagens são guardados em JSON incorporado ao PDF para reedição no próprio site.
- **Preservação:** o aplicativo carrega o documento original, altera somente os campos `NPS_*` previamente criados por ele, adiciona as novas notas e salva novamente. Faz uma verificação automatizada da contagem de anotações, do inventário por página dos tipos de anotações não-formulário e dos metadados após a gravação.

## Limitações, segurança e compatibilidade

**Esta é uma versão beta técnica, não um substituto validado do Adobe Acrobat Pro.** Os testes desta entrega cobrem a interface no Chromium com PDF.js/pdf-lib simulados e um teste independente de PDF real para validar a semântica de colocar o fluxo de marcação antes do texto. **Ainda não foi possível executar a exportação end-to-end com o pdf-lib real carregado do CDN nem validar o arquivo resultante no Adobe Acrobat.** Faça testes com cópias de documentos antes de usar em arquivos importantes.

- O comportamento de *passar o mouse* e *clicar* no PDF baixado depende de **Acrobat JavaScript habilitado** e do suporte do aplicativo que abre o PDF. Chrome, Firefox, visualizadores móveis e outros aplicativos podem mostrar somente o ícone ou ignorar as ações.
- O HTML de texto, as tabelas e as imagens continuam **editáveis no NotaPDF Studio**, ao reabrir o PDF exportado. No Acrobat, a aparência completa da nota é uma **imagem**, não um editor HTML nativo. A interação não é garantida em outros leitores.
- A preservação é verificada pela **contagem** das anotações no PDF salvo, não por uma comparação exaustiva de cada dicionário ou de todos os recursos especiais. PDFs com formulários XFA, criptografia, estruturas incomuns ou assinaturas podem falhar ou ter recursos incompatíveis. Documentos com `/Perms` ou campos de assinatura são recusados preventivamente.
- A versão atual só exporta notas **novas** em páginas com rotação **0°**. A navegação e a visualização das páginas rotacionadas continuam disponíveis.
- A altura da prévia no site cresce com o conteúdo até o limite da página; acima disso, o corpo da nota rola internamente. Na exportação, a aparência estática do widget é limitada à área disponível na página. A rolagem dinâmica do pop-up rasterizado não é reproduzida como uma área HTML no Acrobat.
- O programa não é um editor geral de anotações antigas: exibe uma prévia das anotações existentes e **tenta preservá-las na exportação**, mas só edita notas geradas pelo NotaPDF Studio.
- Documentos grandes (como 500 páginas) podem consumir muita memória, especialmente com muitas fotografias. O aplicativo não possui autosalvamento; salve o PDF depois de concluir as edições.
- O processamento é local no navegador, sem upload de seus PDFs ao GitHub. Entretanto, bibliotecas são carregadas de um CDN de terceiros, cujo JavaScript é executado na página. **Para documentos confidenciais, recomenda-se hospedar cópias auditadas das bibliotecas localmente** em vez de usar CDNs.

## Testes incluídos

- `node tests/core.test.mjs` — funções puras, codificação Unicode, limites, posições e ações de mouse.
- `python tests/browser_smoke.py` — teste de interface no Chromium com stubs de PDF.js/pdf-lib: upload, zoom 90%, tema escuro inicial, tela cheia, camada de texto, cursor, duplo clique sem pontuação, primeira palavra integral ao avançar para a segunda, recuo para seleção por caracteres, prevenção de salto à linha seguinte antes de o ponteiro alcançá-la, seleção da linha seguinte ao entrar nela, cores RGB antigas, atalhos, undo/redo, imagens, tabelas, redimensionamento, hover, clique e reedição. O teste não valida o exportador real pdf-lib.
- `python tests/pdf_stream_order_test.py` — teste de integração PDF com PyMuPDF e pypdf: cria um PDF real, insere grifo vetorial antes do texto original, verifica texto extraível, compara pixels escuros do texto original com os pixels após o grifo e confirma sublinhado vermelho fino abaixo dos caracteres. Valida a semântica da ordem de desenho do PDF, mas não substitui a validação end-to-end do exportador pdf-lib no Acrobat.
- `tests/amostra_teste.pdf` — amostra independente com duas páginas e anotações preexistentes para testar manualmente a ferramenta hospedada.

**Testes desta entrega 1.5.0:** `node tests/core.test.mjs` e `python tests/browser_regression.py`. O teste do navegador é executado com bibliotecas PDF simuladas e teclas Option do macOS simuladas, não com hardware Mac real. Os arquivos originais `tests/browser_smoke.py`, `tests/pdf_stream_order_test.py` e `tests/amostra_teste.pdf` citados no histórico 1.4.0 não foram fornecidos com os sete arquivos-fonte desta revisão e, portanto, não foram reconstruídos como se fossem os originais. A exportação completa em PDF/Acrobat não foi revalidada nesta revisão.

Para rodar o aplicativo localmente sem GitHub, execute `python -m http.server 8000` na pasta do projeto e visite `http://localhost:8000`. Isso exige que o computador possa acessar os CDNs usados.

## Documentação das bibliotecas

- PDF.js: https://mozilla.github.io/pdf.js/
- Selection API (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Selection
- Selection.modify() (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Selection/modify
- Selection API (W3C): https://www.w3.org/TR/selection-api/
- pdf-lib: https://pdf-lib.js.org/
- PDFButton.setImage: https://pdf-lib.js.org/docs/api/classes/pdfbutton
- html2canvas: https://html2canvas.hertzen.com/
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Crédito: as dependências de terceiros mantêm suas licenças originais; este pacote entrega apenas o código-fonte do aplicativo, não os arquivos minificados das bibliotecas.
