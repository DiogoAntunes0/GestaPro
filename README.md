GestaPro — API de Gestão Comercial
O GestaPro é uma API REST desenvolvida com Java e Spring Boot para centralizar operações comerciais, reunindo o gerenciamento de clientes, produtos e pedidos em uma aplicação backend.

O projeto foi criado para aplicar conceitos de desenvolvimento de software em um cenário próximo ao ambiente empresarial, com foco em regras de negócio, segurança, persistência de dados e organização do código.
🎯 Problema que resolve
O controle de clientes, produtos e pedidos em ferramentas separadas ou processos manuais pode gerar informações inconsistentes, retrabalho e dificuldade no acompanhamento das operações.

O GestaPro propõe centralizar essas informações e automatizar etapas do fluxo comercial, como a associação de produtos aos pedidos, o cálculo de valores e a comunicação por e-mail com os clientes.
🚀 Funcionalidades implementadas
👥 Clientes
- Cadastro, consulta e atualização de clientes.
- Validação dos dados recebidos pela API.
- Persistência das informações no banco de dados.
📦 Produtos
- Cadastro e gerenciamento do catálogo de produtos.
- Controle de preços e informações dos produtos.
- Validações para preservar a consistência dos dados.
🛒 Pedidos
- Criação de pedidos vinculados a clientes.
- Associação de produtos aos pedidos.
- Cálculo automático dos valores dos pedidos.
- Aplicação de validações e regras de negócio durante o processamento.
- Envio de uma cópia do pedido ao e-mail do cliente.
🔐 Autenticação e recuperação de senha
- Autenticação e proteção de recursos com Spring Security.
- Geração e retorno de token de autenticação.
- Recuperação de acesso por meio de redefinição de senha enviada por e-mail.
📧 Comunicação por e-mail
- Envio de mensagens para redefinição de senha.
- Envio de cópia dos pedidos aos clientes.
🛠️ Tecnologias utilizadas
Tecnologia	Aplicação no projeto
Java 17+	Desenvolvimento da aplicação e das regras de negócio
Spring Boot / Spring Web	Estrutura da aplicação e endpoints REST
Spring Data JPA / Hibernate	Mapeamento e persistência de dados
PostgreSQL	Banco de dados relacional
Spring Security	Autenticação e proteção de recursos
Maven	Gerenciamento de dependências e build
Java Records	Representação de DTOs, quando aplicável
Git / GitHub	Versionamento do código
GitHub Projects	Planejamento e acompanhamento das atividades


🏗️ Arquitetura
A API segue uma arquitetura em camadas, com responsabilidades separadas para facilitar a manutenção e a evolução do sistema:
- Controller: recebe as requisições HTTP e retorna as respostas da API.
- Service: concentra as regras de negócio e as validações do fluxo comercial.
- Repository: realiza o acesso e a persistência dos dados.
- Entity: representa as entidades de domínio persistidas.
- DTO: define os dados utilizados na comunicação entre a API e seus consumidores.
- Security / Config: reúne componentes de segurança e configurações da aplicação.
Essa organização permite evoluir as funcionalidades sem concentrar toda a lógica nos endpoints.

📚 Documentação técnica
A documentação detalhada está em preparação e será disponibilizada separadamente, incluindo instruções de configuração e execução, endpoints, exemplos de requisições e respostas e fluxos de autenticação.
Assim que estiver publicada, o link para a documentação será adicionado nesta seção.

🗺️ Roadmap
As próximas melhorias planejadas são:
- [ ] Testes automatizados: testes unitários e de integração para regras de negócio e persistência.
- [ ] Docker: containerização da API e preparação do ambiente com PostgreSQL.
- [ ] CI/CD: automação do build e da execução de testes.
- [ ] Relatórios de vendas: consultas e consolidação dos resultados comerciais.
- [ ] Multi-tenancy: isolamento de dados por empresa, com estudo de separação por schemas no PostgreSQL.
- [ ] Deploy em nuvem: preparação da aplicação para implantação na AWS.
💡 Aprendizados e objetivos
O GestaPro é um projeto de desenvolvimento backend voltado à aplicação prática de conceitos de orientação a objetos, APIs REST, arquitetura em camadas, regras de negócio, segurança, banco de dados relacional e integração por e-mail.

Além das funcionalidades comerciais, o projeto serve como base para aprofundar conhecimentos em testes, automação e implantação de aplicações Java.
