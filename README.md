# NotaPDF Studio — editor de notas pop-up para PDFs

**Versão 1.1.0 (beta técnica)** · português · aplicativo estático para GitHub Pages

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
2. O PDF abre inicialmente com zoom de 90%. Use os controles para mudar de página e ampliar/reduzir o zoom. O botão ☾ ativa o modo escuro da interface, sem inverter ou alterar as páginas do documento.
3. Clique em **+ Nova nota** e depois no ponto da página onde deseja colocar o ícone amarelo.
4. Na janela de edição, use os controles de fonte, cor, negrito, alinhamento, listas, tabela e imagem. A imagem pode ser adicionada por upload ou colada diretamente da área de transferência (JPG/PNG/WebP/GIF até 8 MB). Depois de adicionar, arraste o quadradinho azul do canto inferior direito da imagem para ajustar seu tamanho. Imagens dentro do pop-up podem ser clicadas para alternar a ampliação.
5. Ajuste título, fundo, borda e largura do pop-up. A altura passa a acompanhar o conteúdo até o limite da página; se necessário, a rolagem ocorre dentro da nota. Clique em **Salvar nota**.
6. Passe o mouse sobre o ícone para mostrar o pop-up. Clique para fixar. Clique em **Editar**, no pop-up, ou na lista lateral para reabrir o editor.
7. Clique em **Salvar PDF**. Aguarde o download do arquivo com o sufixo `_com_notas.pdf`.
8. **Para editar uma nota mais tarde**, abra novamente o PDF exportado neste mesmo aplicativo. O conteúdo estruturado das notas foi embutido no catálogo PDF (`/NPSData`).

#### Grifos e sublinhados queimados no PDF

- Selecione um trecho de texto na camada de texto do PDF e use **Alt+1** para o grifo primário (azul `#baf6ff`), **Alt+3** para o grifo secundário (amarelo `#ffeaa7`) ou **Alt+2** para sublinhado (vermelho `#ff0000`). Também existem botões na barra superior e seletores para personalizar as três cores.
- Esses novos grifos e sublinhados são desenhados no conteúdo da página durante a exportação (`drawRectangle`/`drawLine` do pdf-lib). Portanto, ficam **queimados** no PDF e não são objetos de anotação removíveis.
- Ctrl+Z/Ctrl+Y e os botões ↶/↷ desfazem/refazem operações do editor fora do campo de texto; dentro do editor rico, os atalhos continuam sendo os comandos de edição de texto.
- **Conflito de atalho resolvido:** Alt+3 já está reservado ao grifo amarelo secundário; por isso, o sublinhado usa Alt+2. O vermelho é a cor inicial do sublinhado.

## Como o formato foi implementado

- **Visualização e seleção textual:** PDF.js, versão 4.10.38, com camada de texto selecionável.
- **Edição e gravação:** pdf-lib, versão 1.17.1.
- **Captura da aparência visual:** html2canvas, versão 1.4.1.
- **Interatividade em leitores compatíveis com Acrobat JavaScript:** dois campos de botão por nota, um para o ícone e outro para o pop-up, com eventos PDF `/AA` (`/E` para entrar, `/X` para sair, `/D` para clicar). Um campo auxiliar guarda o estado fixado/não fixado.
- **Marcação permanente:** grifos e sublinhados criados no site são gravados como operadores gráficos no conteúdo da página, sem adicionar anotações PDF.
- **Conteúdo enriquecido:** HTML editável no site. Na exportação, o HTML é rasterizado para uma imagem PNG que serve como aparência do campo pop-up. O HTML original, as dimensões, a posição e os dados das imagens são guardados em JSON incorporado ao PDF para reedição no próprio site.
- **Preservação:** o aplicativo carrega o documento original, altera somente os campos `NPS_*` previamente criados por ele, adiciona as novas notas e salva novamente. Faz uma verificação automatizada da contagem de anotações, do inventário por página dos tipos de anotações não-formulário e dos metadados após a gravação.

## Limitações, segurança e compatibilidade

**Este é um protótipo técnico e não um substituto validado do Adobe Acrobat Pro.** Os testes feitos nesta entrega cobrem lógica JavaScript e a interface com bibliotecas simuladas; **a exportação end-to-end usando os pacotes CDN e os eventos dentro do Acrobat não foi validada no ambiente desta entrega**. Os testes de grifo usam uma camada de texto simulada e verificam a criação das marcações no estado do editor; a aparência final e a persistência no conteúdo PDF ainda exigem validação com pdf-lib real e Acrobat. Faça testes com uma cópia dos PDFs antes de usar com documentos importantes.

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
- `python tests/browser_smoke.py` — simulação da interface no Chromium: upload, zoom 90%, modo escuro sem filtro na página, seleção textual simulada, grifo, undo/redo, colagem de imagem, tabela, redimensionamento, hover, clique e reedição. Utiliza versões simuladas de PDF.js e pdf-lib; **não testa a integridade de um PDF exportado**.
- `tests/amostra_teste.pdf` — amostra independente com duas páginas e anotações preexistentes para testar manualmente a ferramenta hospedada.

Para rodar o aplicativo localmente sem GitHub, execute `python -m http.server 8000` na pasta do projeto e visite `http://localhost:8000`. Isso exige que o computador possa acessar os CDNs usados.

## Documentação das bibliotecas

- PDF.js: https://mozilla.github.io/pdf.js/
- pdf-lib: https://pdf-lib.js.org/
- PDFButton.setImage: https://pdf-lib.js.org/docs/api/classes/pdfbutton
- html2canvas: https://html2canvas.hertzen.com/
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Crédito: as dependências de terceiros mantêm suas licenças originais; este pacote entrega apenas o código-fonte do aplicativo, não os arquivos minificados das bibliotecas.
