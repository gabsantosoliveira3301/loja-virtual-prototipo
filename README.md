# Loja protótipo

Protótipo portátil: todas as funcionalidades (usuários e produtos) usam `localStorage` do navegador — não é necessário instalar nada.

Como usar:

- Abra `produtos.html`, `login.html` ou `cadastro.html` no navegador diretamente.
- Cadastre um usuário em `cadastro.html` (será pedido para confirmar senha).
- Ao logar, seu nome aparece no canto superior direito e a sessão é mantida no `localStorage`.
- Produtos adicionados pelo formulário em `produtos.html` são salvos no `localStorage` e permanecem entre sessões no mesmo navegador.

Observações:
- Este é um protótipo local — senhas são armazenadas em texto no `localStorage` (não use em produção).
- Remoção do servidor: a versão atual não exige Node/npm.
