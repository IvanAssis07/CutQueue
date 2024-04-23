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

Criar o arquivo .env na raiz do projeto como na imagem a seguir:
```
PORT=3030
DATABASE_URL='file:./prisma/dev.db'
SECRET_KEY='mySecretKey'
JWT_EXPIRATION='5h'
NODE_ENV='development'
SALT_ROUNDS='10'
```
![image](https://github.com/IvanAssis07/CutQueue/assets/82823589/7dcd4cc7-31ab-41c3-a65f-08fbe39b7aed)
