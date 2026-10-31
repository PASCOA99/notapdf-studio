# NotaPDF Studio — editor de notas pop-up para PDFs

**Versão 1.3.0 (beta técnica)** · português · aplicativo estático para GitHub Pages

Editor gratuito, executado no navegador, para abrir PDFs, navegar pelas páginas, adicionar notas interativas com texto formatado, tabelas e imagens redimensionáveis, e baixar uma versão modificada do documento.

## Implantar no GitHub Pages — sem instalação

1. Baixe o arquivo ZIP fornecido, **extraia-o** em uma pasta no computador.
2. Acesse https://github.com/new, faça login e crie um repositório público chamado `notapdf-studio` (o nome pode ser outro). Clique em **Create repository**.
3. No repositório, vá em **Add file → Upload files**. Envie o **conteúdo extraído** da pasta: `index.html`, `styles.css`, `app.js`, `core.js`, `.nojekyll`, `README.md` e, se desejar, a pasta `tests`. **Não envie somente o ZIP.**
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

## Como o formato foi implementado

- **Visualização e seleção textual:** PDF.js, versão 4.10.38, usando a classe `TextLayer` da API pública (não a função antiga `renderTextLayer`, que não é exportada pelo build genérico dessa versão).
- **Edição e gravação:** pdf-lib, versão 1.17.1.
- **Captura da aparência visual:** html2canvas, versão 1.4.1.
- **Interatividade em leitores compatíveis com Acrobat JavaScript:** dois campos de botão por nota, um para o ícone e outro para o pop-up, com eventos PDF `/AA` (`/E` para entrar, `/X` para sair, `/D` para clicar). Um campo auxiliar guarda o estado fixado/não fixado.
- **Marcação permanente:** grifos e sublinhados criados no site são gravados como operadores gráficos em um fluxo de conteúdo inserido antes dos fluxos originais de cada página, sem adicionar anotações PDF ou rasterizar a página.
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
- `python tests/browser_smoke.py` — simulação da interface no Chromium: upload, zoom 90%, tema escuro inicial, tela cheia, `TextLayer`, cursor, duplo clique sem pontuação final, seleção por arraste com ajuste por palavra e retorno a caracteres ao recuar, cores antigas azul/amarelo, atalhos, undo/redo, colagem de imagem, tabela, redimensionamento, hover, clique e reedição. Utiliza versões simuladas de PDF.js e pdf-lib; valida a geração e a ordem do fluxo de conteúdo por meio de um adaptador simulado.
- `python tests/pdf_stream_order_test.py` — teste de integração PDF com PyMuPDF e pypdf: cria um PDF real, insere um fluxo de grifo antes do texto original e verifica texto extraível, pixels de texto preto preservados e sublinhado vermelho fino abaixo dos caracteres. Esse teste valida o princípio PDF de ordenação dos fluxos, não substitui a validação do arquivo exportado pela build real de pdf-lib no Acrobat.
- `tests/amostra_teste.pdf` — amostra independente com duas páginas e anotações preexistentes para testar manualmente a ferramenta hospedada.

Para rodar o aplicativo localmente sem GitHub, execute `python -m http.server 8000` na pasta do projeto e visite `http://localhost:8000`. Isso exige que o computador possa acessar os CDNs usados.

## Documentação das bibliotecas

- PDF.js: https://mozilla.github.io/pdf.js/
- pdf-lib: https://pdf-lib.js.org/
- PDFButton.setImage: https://pdf-lib.js.org/docs/api/classes/pdfbutton
- html2canvas: https://html2canvas.hertzen.com/
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Crédito: as dependências de terceiros mantêm suas licenças originais; este pacote entrega apenas o código-fonte do aplicativo, não os arquivos minificados das bibliotecas.
