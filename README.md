# CutQueue

## Integrantes

- Caio Teles Cunha
- Deborah Santos Andrade Guimarães
- Francisco Neves Tinoco Junior
- Ivan Vilaça de Assis

# O sistema CutQueue

É uma RESTful _api_ para o agendamento de serviços em barbearias. A ideia é ser um sistema no qual os clientes buscam e marcam o horário do serviço que desejam. Sendo que os donos de barbearia podem cadastrar seu negócio no sistema e adicionar os seus serviços e horário de funcionamento. 

Existem diversas rotas para atender este funcionamento, como a de cadastro de clientes e barbearia, a de listagem de agendamentos de uma usuário e de uma barbearia. A seguir segue uma documentação dos endpoints existentes no sistema.

# Tecnologias

- Typescript;
- NodeJs;
- Express;
- Prisma studio;
- Jest;

# Para o desenvolvimento

Já tem um teste pronto em src/domains/Service/Service. Deem uma olhada nele pra pegarem a estutura e na hora de criar testes criem na pasta service do domínio que estão testando.

Será necessário seguir os seguintes passos:
- Clonar o repo;
- Instalar o node e npm na sua máquina;
- Rodar npm install na raiz do projeto;
- Criar o arquivo .env na raiz do projeto como na imagem a seguir:
  ```
  PORT=3030
  DATABASE_URL='file:./prisma/dev.db'
  SECRET_KEY='mySecretKey'
  JWT_EXPIRATION='5h'
  NODE_ENV='development'
  SALT_ROUNDS='10'
  ```
  ![image](https://github.com/IvanAssis07/CutQueue/assets/82823589/7dcd4cc7-31ab-41c3-a65f-08fbe39b7aed)

- Executar npm run dev para rodar o projeto;
- Para rodar os testes bastar rodar npm test.

Extras:
- Caso queiram ver o estado do banco rodem npx prisma studio;
- A biblioteca de testes que optei foi [Jest](https://jestjs.io/docs/api) porque ela funciona bem com JS e TS;
- Segue a documentação das rotas do projeto no postman: https://documenter.getpostman.com/view/23267969/2sA3BrWpMz.
