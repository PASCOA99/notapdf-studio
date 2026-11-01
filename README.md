# NotaPDF Studio 1.5.0 — PDF portátil, sem pop-ups cinza

**Aplicativo estático, em português, para GitHub Pages.** Abra o PDF no site, marque texto, crie notas com texto rico, imagens e tabelas. Tudo é processado localmente pelo navegador (as bibliotecas são carregadas por CDN).

## Mudança de funcionamento na exportação

Foi constatado que o campo de formulário móvel com imagem usado nas versões 1.4.x pode abrir como um **retângulo cinza ou vazio no PDFium/Chrome**, além de interceptar seleção mesmo oculto. Não existe solução interoperável demonstrada para fazer **imagem rica aparecer ao passar o mouse em um PDF independente** no Chrome, Firefox e Acrobat. Por isso, a versão 1.5.0 usa dois comportamentos explícitos:

- **No site NotaPDF Studio:** basta passar o mouse sobre o ícone amarelo para abrir o pop-up rico (texto, foto, tabela); clique para fixá-lo, e feche pelo X. Depois de fechar, a seleção do PDF funciona normalmente. Este comportamento é o que permite hover de imagem na web.
- **No PDF baixado:** para impedir caixas cinzas, não são criados campos flutuantes `/Widget` com JavaScript. Há um ícone amarelo **clicável e removível** (anotação `/Stamp`, não desenho permanente) que leva a uma página de detalhes no final do mesmo PDF, mostrando texto formatado, tabelas e fotografias como conteúdo normal da página. Ao lado fica uma **anotação nativa de comentário** (ícone pequeno) com prévia textual acessível em leitores que exibem comentários. Na página de detalhes, clique em “Voltar para pagina N” para retornar.

Esta mudança é intencional: a imagem completa **não aparece em hover no arquivo PDF aberto no Chrome**. Ela aparece ao clicar no ícone ou quando o mesmo PDF é aberto dentro do site. Não é correto prometer que a imagem em hover funcione no visualizador integrado do Chrome.

## Preservação do PDF original e tamanho

- O texto da página original continua como texto pesquisável/selecionável; não rasterizamos o PDF inteiro.
- O pop-up com **imagem** é capturado uma vez como JPEG (qualidade 79%, escala máxima 1,35); pop-ups **somente de texto** usam PNG com fidelidade lossless. Isso limita a duplicação de bitmaps em comparação com os antigos PNGs de alta escala.
- A fonte editável HTML, incluindo as imagens originais, fica armazenada no fluxo `/NPSData` comprimido com `/FlateDecode`. O JPEG/PNG da página auxiliar é necessário à compatibilidade com leitores de PDF e constitui uma cópia adicional; não há promessa de duplicação zero.
- Ao reabrir um PDF gerado nesta versão e salvá-lo outra vez, as páginas auxiliares e anotações geradas pelo NotaPDF Studio são **substituídas**, não acrescentadas indefinidamente.
- O editor também trata as referências de widget obsoletas da versão 1.4.x, evitando o defeito de `PDFForm.removeField()` da pdf-lib 1.17.1 que pode deixar referências inválidas em `/Annots`.
- PDFs originais assinados ou com permissões especiais não são exportados. Sempre trabalhe com uma cópia.

## Implantar no GitHub Pages

1. Extraia o ZIP.
2. Substitua os arquivos do repositório do site pelos arquivos extraídos: `index.html`, `app.js`, `core.js`, `portable_annotations.js`, `styles.css`, `.nojekyll`, `README.md` e demais arquivos de documentação. Envie **o conteúdo**, não somente o ZIP.
3. O GitHub Pages pode utilizar a raiz do ramo `main`. Depois de publicar, atualize a página usando Ctrl+Shift+R.
4. Não publique PDFs pessoais no repositório; carregue os PDFs apenas pelo botão **Abrir PDF** na página publicada.

As bibliotecas PDF.js 4.10.38, pdf-lib 1.17.1 e html2canvas 1.4.1 são carregadas dos CDNs indicados no HTML. É necessária conexão com a internet no carregamento inicial.

## Reedição e compatibilidade

Ao abrir novamente no site um PDF exportado, o editor reconstrói as notas a partir dos metadados. As páginas de detalhes são auxiliares e não aparecem na navegação de páginas de edição (continuam disponíveis no PDF baixado). Projetos legados com metadados v1–v3 são reconhecidos. O `RangeError: Maximum call stack size exceeded` é evitado lendo os dados Base64 antigos via `asString()`; os novos usam fluxo comprimido.

## Limitações

- A saída portátil altera o paradigma de imagem-em-hover no **PDF externo** para **link clicável e página de detalhes**. Não exige Acrobat JavaScript.
- A posição e a interação de comentários nativos podem variar entre Chrome/PDFium, Firefox/PDF.js e Acrobat; o destino de link e a imagem na página são estruturas PDF padronizadas.
- O editor de notas no site continua sendo a experiência de hover rica e pode ser usado com o PDF exportado.
- Notas cujo conteúdo ultrapassa a altura útil de uma página auxiliar podem ter a prévia visual cortada nessa página; o HTML completo permanece nos metadados editáveis.
- Não houve acesso ao documento exato do usuário nem execução final do exportador **real** pdf-lib com acesso aos CDNs neste ambiente. Os testes automatizados de interface usam stubs para bibliotecas externas; o teste de renderização verifica PDFs reais construídos com ferramentas independentes. O relatório `TEST-REPORT.md` descreve claramente o escopo de cada teste.
