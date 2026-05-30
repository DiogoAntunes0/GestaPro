# GestaPro - Sistema de Gestão Comercial

[![Java Version](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)

O **GestaPro** é um sistema empresarial focado na centralização, controle e otimização do fluxo comercial. A aplicação funciona como o motor operacional de uma empresa, permitindo o gerenciamento eficiente de clientes, a manutenção de um catálogo completo de produtos e a realização de pedidos de forma ágil e integrada.

---

## 🚀 Funcionalidades Principais

* **Gestão de Clientes:** Cadastro completo, atualização e listagem de clientes (Pessoa Física e Jurídica).
* **Catálogo de Produtos:** Controle de estoque, preços e especificações de produtos.
* **Fluxo de Pedidos:** Criação de ordens de venda vinculando múltiplos produtos a um cliente específico, com cálculo automatizado de totais e validação de regras de negócio.

## 🛠️ Tecnologias e Ferramentas

O projeto foi desenvolvido seguindo os padrões de mercado, boas práticas de Clean Code e a arquitetura MVC (Model-View-Controller):

* **Linguagem:** Java 17+
* **Framework:** Spring Boot 3
* **Gerenciamento de Dependências:** Maven
* **Persistência de Dados:** Spring Data JPA / Hibernate
* **Banco de Dados:** PostgreSQL (ou H2 para ambiente de desenvolvimento)
* **Manipulação de Dados:** Uso de Java Records para DTOs (Data Transfer Objects), garantindo imutabilidade e separação de responsabilidades.

---

## 📁 Estrutura de Pacotes

A arquitetura do projeto foi desenhada prezando pelo **Princípio da Responsabilidade Única (SRP)** e pela herança e modularidade adequadas:

```text
com.gestapro.api
│
├── domain/          # Entidades de negócio (Client, Product, Order) e heranças comuns
├── dto/             # Records para validação e transporte de dados (Request/Response)
├── repository/      # Interfaces de comunicação com o banco de dados (Spring Data)
├── service/         # Camada de regras de negócio e lógica do sistema
└── controller/      # Endpoints da API (REST Controllers)
```

---

## 🔧 Como Executar o Projeto

### Pré-requisitos
* Java 17 instalado
* Maven instalado
* PostgreSQL configurado (ou ajuste o `application.properties` para H2)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/gestapro-sistema-comercial.git
   cd gestapro-sistema-comercial
   ```

2. **Configurar o banco de dados:**
   Abra o arquivo `src/main/resources/application.properties` e ajuste as credenciais do seu banco:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/gestapro_db
   spring.datasource.username=seu_usuario
   spring.datasource.password=sua_senha
   ```

3. **Compilar e rodar a aplicação:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

O servidor iniciará por padrão na porta `8080` (http://localhost:8080).

---

## 📈 Próximos Passos (Roadmap)

- [ ] Implementação de autenticação e controle de acesso (Spring Security).
- [ ] Módulo de faturamento básico e geração de relatórios de vendas.
- [ ] Integração com APIs externas para consulta de CEP no cadastro de clientes.

---
Desenvolvido com ☕ e dedicação por Diogo.
