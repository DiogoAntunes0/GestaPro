# GestaPro — API de Gestão Comercial

O **GestaPro** é uma API REST desenvolvida com Java e Spring Boot para gerenciamento de operações comerciais. O projeto centraliza o cadastro de clientes, o catálogo de produtos e o processamento de pedidos, aplicando regras de negócio, validações e persistência em banco de dados relacional.

O objetivo é consolidar conhecimentos de desenvolvimento backend por meio da construção de uma aplicação organizada em camadas, com autenticação, comunicação por e-mail e funcionalidades voltadas a um fluxo comercial real.

## 🚀 Funcionalidades implementadas

### 👥 Gerenciamento de clientes

- Cadastro, consulta e atualização de clientes.
- Validação dos dados recebidos pela API.
- Persistência das informações no banco de dados.

### 📦 Gerenciamento de produtos

- Cadastro e gerenciamento do catálogo de produtos.
- Controle de preços e informações dos produtos.
- Validações para manter a consistência dos dados.

### 🛒 Processamento de pedidos

- Criação de pedidos vinculados a clientes.
- Associação de produtos aos pedidos.
- Cálculo automatizado dos valores dos pedidos.
- Aplicação de regras de negócio e validações durante o processamento.
- Envio de uma cópia do pedido para o e-mail do cliente.

### 🔐 Autenticação e recuperação de senha

- Implementação de autenticação utilizando Spring Security.
- Geração e retorno de token de autenticação.
- Fluxo de redefinição de senha por e-mail.
- Envio das instruções necessárias para recuperação do acesso.

### 📧 Integração com serviço de e-mail

- Envio de mensagens para recuperação de senha.
- Envio de cópia dos pedidos aos respectivos clientes.

## 🛠️ Tecnologias utilizadas

- **Java 17+** — linguagem de programação.
- **Spring Boot** — estrutura principal da aplicação.
- **Spring Web** — desenvolvimento de endpoints REST.
- **Spring Data JPA** — persistência e acesso aos dados.
- **Hibernate** — implementação ORM.
- **Spring Security** — autenticação e proteção de recursos.
- **PostgreSQL** — banco de dados relacional.
- **Maven** — gerenciamento de dependências e build.
- **Java Records** — representação de DTOs quando aplicável.
- **Git e GitHub** — versionamento do código.
- **GitHub Projects** — organização e acompanhamento das atividades.

## 🏗️ Arquitetura e organização

A aplicação utiliza uma arquitetura em camadas para separar responsabilidades e facilitar a manutenção e a evolução do código.

```text
com.gestapro.api
├── entity/       # Entidades de negócio
├── dto/          # Objetos de transferência de dados
├── repository/   # Acesso e persistência de dados
├── service/      # Regras de negócio
├── controller/   # Endpoints REST
├── config/       # Configurações da aplicação
└── security/     # Componentes de segurança
```

A separação das responsabilidades busca manter os endpoints focados na comunicação HTTP, os serviços responsáveis pelas regras de negócio e os repositórios encarregados do acesso aos dados.

A estrutura apresentada representa a organização lógica da aplicação; os pacotes devem ser conferidos com a versão atual do código-fonte.

## ⚙️ Como executar o projeto

### Pré-requisitos

- Java 17 ou superior.
- PostgreSQL configurado.
- Maven ou utilização do Maven Wrapper incluído no projeto.
- Acesso a um serviço SMTP para testar as funcionalidades de e-mail.

### 1. Clone o repositório

```bash
git clone https://github.com/DiogoAntunes0/GestaPro.git
cd GestaPro
```

### 2. Configure o banco de dados

Crie um banco de dados PostgreSQL para a aplicação e configure as propriedades de conexão no ambiente de execução.

Exemplo de configuração:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Os nomes das variáveis acima são exemplos. Configure-as no ambiente e ajuste as propriedades conforme a configuração utilizada no projeto.

### 3. Configure o serviço de e-mail

Configure as propriedades SMTP necessárias para o envio de mensagens, utilizando variáveis de ambiente para credenciais e informações sensíveis.

Exemplo para um serviço SMTP compatível com Spring Boot:

```properties
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

As propriedades adicionais de autenticação, TLS e remetente devem seguir a configuração do provedor de e-mail e a implementação da aplicação.

**Importante:** não versione senhas, tokens, chaves ou credenciais reais no repositório.

### 4. Execute a aplicação

No Windows, utilizando o Maven Wrapper:

```powershell
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS:

```bash
./mvnw spring-boot:run
```

Alternativamente, caso o Maven esteja instalado:

```bash
mvn spring-boot:run
```

A aplicação utiliza a porta 8080 por padrão, salvo configuração diferente.

## 📋 Organização do desenvolvimento

O desenvolvimento é acompanhado por meio do GitHub Projects, permitindo organizar tarefas, acompanhar o progresso e planejar as próximas melhorias.

🔗 **Repositório:** [https://github.com/DiogoAntunes0/GestaPro](https://github.com/DiogoAntunes0/GestaPro)

## 🎯 Próximos passos — Roadmap

As próximas etapas estão voltadas à evolução da aplicação, à automação do desenvolvimento e à preparação para implantação.

- [ ] **Testes automatizados:** criar testes unitários e de integração para validar regras de negócio, autenticação, processamento de pedidos e persistência.
- [ ] **Docker:** containerizar a aplicação e preparar um ambiente reproduzível para execução com PostgreSQL.
- [ ] **Pipeline CI/CD:** automatizar a compilação e a execução dos testes a cada alteração no repositório.
- [ ] **Relatórios de vendas:** desenvolver consultas e relatórios para consolidar pedidos e facilitar a análise dos resultados comerciais.
- [ ] **Multi-tenancy:** implementar o isolamento de dados entre empresas utilizando schemas no PostgreSQL, com validação das regras de acesso e separação dos dados.
- [ ] **Implantação na AWS:** preparar a publicação da aplicação em ambiente de nuvem, com configuração segura, logs e monitoramento.

## 📚 Objetivo do projeto

O GestaPro é um projeto de estudo e evolução técnica voltado ao desenvolvimento backend com Java e Spring Boot.

Por meio dele, busco aprofundar meus conhecimentos em arquitetura de software, regras de negócio, segurança, persistência de dados e integração entre sistemas, evoluindo gradualmente para práticas de testes, automação e implantação.

---

**Desenvolvido por Diogo Antunes**

[GitHub — DiogoAntunes0](https://github.com/DiogoAntunes0)
