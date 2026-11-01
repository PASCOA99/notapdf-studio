# NotaPDF Studio — editor de notas pop-up para PDFs

**Versão 1.4.3 (beta técnica)** · português · aplicativo estático para GitHub Pages

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
7. Clique em **Salvar PDF**. Aguarde o download do arquivo com o sufixo `_com_notas.pdf`. Para corrigir um PDF que já foi exportado por uma versão antiga, abra esse PDF na versão 1.4.1 e salve-o novamente.
8. **Para editar uma nota mais tarde**, abra novamente o PDF exportado neste mesmo aplicativo. O conteúdo estruturado das notas foi embutido no catálogo PDF (`/NPSData`).

**Correção 1.4.1 — seleção sob pop-ups de imagem:** o campo PDF que guarda a imagem fica estacionado fora da página enquanto o pop-up está fechado. Ao abri-lo no Acrobat compatível, o JavaScript desloca o campo à posição real; ao fechar, oculta-o e desloca-o novamente para fora da página. Assim, o pop-up fechado deixa de ter uma área invisível extensa sobre o texto selecionável. Na interface web, um arraste de seleção impede que a prévia apareça pelo hover no ícone. O próprio ícone da nota permanece clicável.

**Correção 1.4.3 — imagem cinza, bloqueio após fechar e tamanho:** o PDF exportado usa agora uma aparência vetorial de formulário com imagem JPEG para evitar o fundo cinza do botão, e o campo fechado permanece inteiramente fora da página. O script que movimenta esse campo só roda no Adobe Acrobat/Reader; o Chrome/PDFium não oferece a compatibilidade necessária para garantir exibição e remoção dos campos. No site, as notas continuam abrindo normalmente. Os metadados passam a ser gravados em fluxo PDF comprimido (`/NPSData`), sem duplicação de Base64 pela camada de metadados, e o PDF salva usando object streams. Isso reduz a sobrecarga, mas **não elimina os bytes das imagens originais nem garante um tamanho final fixo**. Se não for possível decodificar uma imagem, a exportação apresenta erro em vez de salvar uma aparência vazia.

**Aviso de compatibilidade:** pop-up que aparece ao passar o mouse **não é uma função universal do PDF**. Para hover e clique no **arquivo exportado**, use o Adobe Acrobat/Reader para desktop com JavaScript habilitado. Para hover e clique no **navegador**, abra o PDF no NotaPDF Studio. No Chrome/Firefox, o PDF baixado prioriza preservar seleção de texto e não apresenta pop-ups de imagem via JavaScript. As mensagens de console `file://` são relacionadas às regras de origem de arquivos locais do navegador e não indicam, por si só, corrupção do PDF.

**Correção 1.4.2 — salvamento de notas com imagem:** a leitura dos metadados `NPSData` passou a usar `PDFString.asString()` no lugar de `decodeText()` tanto na abertura quanto na validação do PDF salvo. Isso elimina o estouro de pilha na decodificação de conteúdos Base64 extensos. Também foi removido o truncamento silencioso do HTML de notas em 1.500.000 caracteres, que podia danificar imagens grandes ao reabrir o documento.

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
- **Interatividade em leitores compatíveis com Acrobat JavaScript:** dois campos de botão por nota, um para o ícone e outro para o pop-up, com eventos PDF `/AA` (`/E` para entrar, `/X` para sair, `/D` para clicar). Um campo auxiliar guarda o estado fixado/não fixado. Na versão 1.4.1, o widget de pop-up tem `/Rect` **fora dos limites da página quando fechado**; o JavaScript do Acrobat altera `Field.rect` para exibir/ocultar a área. Isso não depende só de `display.hidden`.
- **Marcação permanente:** grifos e sublinhados criados no site são gravados como operadores gráficos em um fluxo de conteúdo inserido antes dos fluxos originais de cada página. O preenchimento do grifo usa `/ca 0.42` e modo de mesclagem `Multiply`; o traço do sublinhado usa `/CA 1`. Não são adicionadas anotações PDF nem é rasterizada a página.
- **Conteúdo enriquecido:** HTML editável no site. Na exportação, o HTML é rasterizado para uma imagem JPEG opaca e compactada que serve como aparência do campo pop-up. O HTML original, as dimensões, a posição e os dados das imagens são guardados em JSON dentro de um fluxo PDF comprimido (`/NPSData`, versão 3) para reedição no próprio site. Os PDFs v1/v2 ainda podem ser abertos.
- **Preservação:** o aplicativo carrega o documento original, altera somente os campos `NPS_*` previamente criados por ele, adiciona as novas notas e salva novamente. Faz uma verificação automatizada da contagem de anotações, do inventário por página dos tipos de anotações não-formulário e dos metadados após a gravação.

## Limitações, segurança e compatibilidade

**Esta é uma versão beta técnica, não um substituto validado do Adobe Acrobat Pro.** Os testes desta entrega cobrem a interface no Chromium com PDF.js/pdf-lib simulados, ações JavaScript do pop-up com contexto simulado e o ciclo de compressão/descompressão de metadados reais no Node. **Ainda não foi possível executar a exportação end-to-end com o pdf-lib real carregado do CDN nem validar o arquivo resultante no Adobe Acrobat.** Faça testes com cópias de documentos antes de usar em arquivos importantes.

- O comportamento de *passar o mouse* e *clicar* no PDF baixado depende de **Acrobat JavaScript habilitado** e do suporte do aplicativo que abre o PDF. Nos arquivos exportados pela versão 1.4.3, a abertura flutuante por JavaScript fica **deliberadamente restrita ao Adobe Acrobat/Reader para desktop**. No Chrome/PDFium ou Firefox/PDF.js o ícone pode ficar sem ação, em vez de abrir um retângulo cinza e bloquear a seleção. Abra o PDF no próprio NotaPDF Studio para ver as imagens com hover/click no navegador.
- O HTML de texto, as tabelas e as imagens continuam **editáveis no NotaPDF Studio**, ao reabrir o PDF exportado. No Acrobat, a aparência completa da nota é uma **imagem**, não um editor HTML nativo. A interação não é garantida em outros leitores.
- A preservação é verificada pela **contagem** das anotações no PDF salvo, não por uma comparação exaustiva de cada dicionário ou de todos os recursos especiais. PDFs com formulários XFA, criptografia, estruturas incomuns ou assinaturas podem falhar ou ter recursos incompatíveis. Documentos com `/Perms` ou campos de assinatura são recusados preventivamente.
- A versão atual só exporta notas **novas** em páginas com rotação **0°**. A navegação e a visualização das páginas rotacionadas continuam disponíveis.
- A altura da prévia no site cresce com o conteúdo até o limite da página; acima disso, o corpo da nota rola internamente. Na exportação, a aparência estática do widget é limitada à área disponível na página. A rolagem dinâmica do pop-up rasterizado não é reproduzida como uma área HTML no Acrobat.
- O programa não é um editor geral de anotações antigas: exibe uma prévia das anotações existentes e **tenta preservá-las na exportação**, mas só edita notas geradas pelo NotaPDF Studio.
- Documentos grandes (como 500 páginas) podem consumir muita memória, especialmente com muitas fotografias. O aplicativo não possui autosalvamento; salve o PDF depois de concluir as edições.
- O processamento é local no navegador, sem upload de seus PDFs ao GitHub. Entretanto, bibliotecas são carregadas de um CDN de terceiros, cujo JavaScript é executado na página. **Para documentos confidenciais, recomenda-se hospedar cópias auditadas das bibliotecas localmente** em vez de usar CDNs.

## Testes incluídos nesta entrega (1.4.3)

- `node --check app.js` e `node --check core.js` — sintaxe JavaScript.
- `node tests/popup_geometry.test.mjs` — confirma geometricamente que o widget fechado fica totalmente fora da página; simula scripts do Acrobat para abrir por hover, fixar, soltar e fechar, verificando que o retângulo não permanece sobre o texto.
- `node tests/metadata_stream.test.mjs` — verifica descompactação de quase 4 MB de Base64 de alta entropia, sem erro de pilha, e compatibilidade com v2.
- `node tests/image_metadata.test.mjs` — confirma que a imagem antiga de 2,4 milhões de caracteres não sofre truncamento.
- `python tests/browser_export_image.py` — faz exportação e reabertura com bibliotecas simuladas, garantindo que o JPEG foi chamado e a imagem HTML permaneceu intacta.
- `python tests/browser_popup_selection.py` — teste de regressão no Chromium com PDF.js/pdf-lib simulados. A página tem uma nota com imagem e texto que passa por baixo da região da nota; confirma que um arraste atravessa essa região, que o pop-up não abre durante o arraste e que o hover/clique/fechamento continuam funcionando.

**Limite dos testes:** não foi possível validar nesta entrega uma exportação integral com `pdf-lib` real seguida de abertura do arquivo no Adobe Acrobat. `Field.rect` é documentado pela Adobe, mas o funcionamento depende do leitor de PDF e da execução de Acrobat JavaScript. **Teste em uma cópia do PDF original** e, para remover o retângulo das notas exportadas pela versão anterior, reabra o arquivo na versão corrigida e exporte novamente.

Para usar localmente, hospede a pasta em um servidor HTTP estático (por exemplo, `python -m http.server 8000`), ou publique no GitHub Pages. As bibliotecas do site são obtidas do CDN informado no HTML.

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
