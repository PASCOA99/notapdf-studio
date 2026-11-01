# NotaPDF Studio 1.6.0 — pop-ups na própria página

**Sem páginas extras.** Esta versão substitui o mecanismo de páginas adicionais da 1.5.0 por notas sobrepostas à página original. O ícone da nota tem aproximadamente 23 pt e o conteúdo da nota (texto, tabela ou foto) é desenhado como imagem em uma camada opcional de PDF (*Optional Content Group*, OCG), inicialmente desligada. Não existe um campo de formulário invisível do tamanho do pop-up.

## Como abrir

Publique `index.html`, `app.js`, `core.js`, `overlay_pdf.js`, `portable_annotations.js`, `styles.css` e os arquivos `.nojekyll` no mesmo diretório (Github Pages, por exemplo). O `portable_annotations.js` continua no pacote **apenas para migrar e remover as páginas extras criadas pela versão 1.5.0**. O programa não cria novas páginas auxiliares.

Abra um PDF no NotaPDF Studio, crie uma nota clicando em **Nova nota**, insira texto/imagem e salve. No editor web, passe o mouse sobre o ícone para ver a nota sobre a página, clique para fixar e use o X para fechar. Selecione texto mesmo nas áreas onde haveria um pop-up quando fechado.

## Compatibilidade do PDF exportado

- **No próprio NotaPDF Studio, no navegador:** texto, imagens e tabelas são exibidos em pop-ups HTML sobre a mesma página, com hover, clique e fechamento. Reabrir um PDF exportado nesse editor recupera o HTML editável.
- **Adobe Acrobat ou Adobe Reader para computador, com JavaScript de PDF habilitado:** o ícone possui ações do Acrobat para ligar e desligar a camada opcional correspondente no evento de mouse. A nota aparece **sobre a página atual**, sem navegação ou página extra. **Ainda não foi possível testar este caminho com o aplicativo Adobe real neste ambiente.**
- **Chrome/Edge/Firefox exibindo um PDF baixado em seu visualizador nativo:** os leitores não oferecem suporte uniforme às ações de JavaScript de PDF. A nota rica pode permanecer oculta, embora o PDF original e seu texto fiquem visíveis e selecionáveis. **Não é possível garantir hover/click do PDF exportado nesses leitores sem controlar o visualizador.** Para interação rica no navegador, abra o arquivo no NotaPDF Studio.

Essa distinção é uma limitação dos leitores, não um motivo para acrescentar páginas extras.

## Tamanho e integridade

Notas com imagem são capturadas como JPEG de qualidade 80%; notas só de texto usam PNG para preservar nitidez. O HTML editável das notas, incluindo imagens originais, é guardado em um fluxo de metadados PDF comprimido com Flate. Esta escolha permite reabrir e editar, mas os dados originais embutidos também ocupam espaço. **Não há promessa de tamanho fixo ou de redução para todas as imagens.** A versão preserva a validação contra truncamento de Base64 e a leitura de projetos antigos.

A reexportação elimina os recursos OCG de versões 1.6 anteriores e os ícones anteriores, impedindo o acúmulo de camadas/imagens. PDFs feitos na versão 1.5.0 podem ser reabertos para gerar um PDF sem as páginas de notas anexadas. Faça isso com uma cópia de segurança.

## Testes e limitações

Veja `TEST-REPORT.md`. Os testes de interface no Chromium usam bibliotecas externas simuladas; testes independentes com PDF real cobrem a semântica das camadas OCG e seleção de texto. **A rotina de exportação completa do aplicativo ainda precisa ser testada com a `pdf-lib` real carregada de CDN e com o Adobe Acrobat.**

## Fontes técnicas

- Adobe, JavaScript e Optional Content Groups: https://developer.adobe.com/acrobat-pdfl-sdk/guides/jsdevguide/js-dev-modifyuserinterface
- Adobe Acrobat JavaScript API: https://developer.adobe.com/acrobat-pdfl-sdk/guides/jsapiref/js-api-acrojs
- PDF 32000-1, conteúdo opcional: https://pdf-lib.js.org/assets/with_large_page_count.pdf
- PDF.js: https://mozilla.github.io/pdf.js/
- pdf-lib: https://pdf-lib.js.org/

Os PDFs abertos no editor são processados no navegador. O código de bibliotecas externas é carregado da Internet pelos CDNs do `index.html` e `app.js`.
