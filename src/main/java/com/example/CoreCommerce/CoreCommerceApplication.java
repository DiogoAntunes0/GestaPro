package com.example.CoreCommerce;

import com.example.CoreCommerce.service.EmailService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CoreCommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoreCommerceApplication.class, args);
	}
	@Bean
	public CommandLineRunner testeEmail(EmailService emailService) {
		return args -> {
			System.out.println("Enviando e-mail de teste...");
			// Coloque o seu e-mail pessoal aqui para verificar se chega na caixa de entrada
			emailService.enviarEmailTeste("diogoantunes892@gmail.com");
			System.out.println("E-mail enviado para a fila do JavaMailSender!");
		};
	}
}
