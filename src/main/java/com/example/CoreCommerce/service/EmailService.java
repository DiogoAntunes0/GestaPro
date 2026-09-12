package com.example.CoreCommerce.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private final JavaMailSender enviadorEmail;
    private static final String EMAIL_ORIGEM = "diogoantunes892@gmail.com";
    private static final String NOME_ENVIADOR = "GestaPro";

    public EmailService(JavaMailSender enviadorEmail){
        this.enviadorEmail = enviadorEmail;
    }


    @Async
    protected void enviarEmail(String emailUsuario, String assunto, String conteudo) {
        MimeMessage message = enviadorEmail.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        try {
            helper.setFrom(EMAIL_ORIGEM, NOME_ENVIADOR);
            helper.setTo(emailUsuario);
            helper.setSubject(assunto);
            helper.setText(conteudo, true); // O "true" indica que aceita tags HTML
        } catch(MessagingException | UnsupportedEncodingException e){
            e.printStackTrace();
            throw new RuntimeException("Erro ao enviar email");
        }

        enviadorEmail.send(message);
    }

    // --- MÉTODO DE TESTE ADICIONADO ---
    public void enviarEmailTeste(String emailDestino) {
        String assunto = "Realização de pedido - GestaPro";
        String conteudo = "<h2>Confirmação de pedido!</h2>"
                + "<p>Pedido na loja DiogoAntunes, agradecemos seu pedido, em torno de dois dias úteis será enviado.</p>"
                + "<p>Se você recebeu isso, a configuração do Spring Mail está funcionando perfeitamente.</p>";

        enviarEmail(emailDestino, assunto, conteudo);
    }
}