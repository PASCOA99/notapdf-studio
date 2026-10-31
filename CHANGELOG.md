# Histórico de versões

## 1.1.0 — melhorias solicitadas

- Zoom inicial do PDF definido em 90%.
- Modo escuro aplicado somente à interface e ao entorno do visualizador; a página PDF permanece sem filtro.
- Notas no visualizador ajustam a altura ao conteúdo, limitadas à página, com rolagem interna quando necessário.
- Removido o controle manual de altura da nota; a largura continua configurável.
- Tamanhos de fonte 7, 8 e 9 adicionados ao editor rico.
- Imagens de clipboard podem ser coladas diretamente na nota; as imagens recebem alça de redimensionamento e podem ser ampliadas/reduzidas por clique na prévia.
- Camada de texto PDF.js habilitada para seleção de texto no documento.
- Grifo azul `#baf6ff` (Alt+1), grifo amarelo `#ffeaa7` (Alt+3) e sublinhado vermelho `#ff0000` (Alt+2), com seletores de cor.
- Grifos e sublinhados do editor são desenhados no conteúdo da página na exportação; não são anotações PDF e não podem ser removidos no arquivo exportado.
- Botões e atalhos Ctrl+Z/Ctrl+Y para desfazer/refazer as alterações do editor fora do campo de texto.
- Testes de interface ampliados para cobrir as funcionalidades acima.

## Limitações conhecidas

- Os testes automatizados de navegador usam mocks de PDF.js e pdf-lib; não comprovam a integridade da exportação end-to-end nem o comportamento final no Adobe Acrobat.
- A prévia web do pop-up permite rolagem interna. No PDF exportado, a aparência enriquecida do pop-up é uma imagem estática limitada à página; a rolagem HTML não é reproduzida no Acrobat.
- Alt+3 é reservado ao grifo amarelo. Para evitar colisão de atalhos, o sublinhado usa Alt+2.
