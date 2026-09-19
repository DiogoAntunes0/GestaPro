package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ItemPedidoResponseDTO;
import com.example.CoreCommerce.entity.Pedido;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailService {

    private final JavaMailSender enviadorEmail;
    private static final String EMAIL_ORIGEM = "diogoantunes892@gmail.com";
    private static final String NOME_ENVIADOR = "GestaPro";

    public EmailService(JavaMailSender enviadorEmail){
        this.enviadorEmail = enviadorEmail;
    }

    @Async
    protected void enviarEmail(String emailUsuario, String assunto,String conteudoIntro, List<ItemPedidoResponseDTO> detalhesPedido, Double valorTotal) {
        MimeMessage message = enviadorEmail.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        String itens = detalhesPedido.stream()
                .map(d -> "<li style='margin-bottom: 8px; color: #333;'>"
                        + "<b>" + d.nomeProduto() + "</b> <br>"
                        + "<span style='font-size: 13px; color: #666;'>Quantidade: " + d.quantidade()
                        + " | Preço Unitário: R$ " + String.format("%.2f", d.precoVenda()) + "</span>"
                        + "</li>")
                .collect(Collectors.joining("", "<ul style='list-style-type: none; padding: 0;'>", "</ul>"));

        String rodapeHtml = "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>"
                + "<h3 style='color: #2c3e50;'>Valor Total: R$ " + String.format("%.2f", valorTotal) + "</h3>"
                + "<br>"
                + "<p style='color: #444;'><b>O que acontece agora?</b><br>"
                + "Assim que o pagamento for confirmado, seu pedido será separado e preparado para o envio. "
                + "Você receberá novas informações sobre o rastreio pelo seu WhatsApp.</p>"
                + "<br>"
                + "<p style='color: #777; font-size: 12px;'>Se tiver alguma dúvida, basta responder a este e-mail ou entrar em contato com o nosso suporte.</p>"
                + "<br>"
                + "<p>Um abraço,<br><b>Equipe de Vendas</b></p>";


        String corpoEmailCompleto = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;'>"
                + conteudoIntro
                + "<br>"
                + itens
                + rodapeHtml
                + "</div>";

        try {
            helper.setFrom(EMAIL_ORIGEM, NOME_ENVIADOR);
            helper.setTo(emailUsuario);
            helper.setSubject(assunto);
            helper.setText(corpoEmailCompleto, true);

        } catch(MessagingException | UnsupportedEncodingException e){
            e.printStackTrace();
            throw new RuntimeException("Erro ao enviar email");
        }
        enviadorEmail.send(message);
    }


    /*public void enviarEmailTeste(String emailDestino) {
        String assunto = "Realização de pedido - GestaPro";
        String conteudo = "<h2>Confirmação de pedido!</h2>"
                + "<p>Pedido na loja DiogoAntunes, agradecemos seu pedido, em torno de dois dias úteis será enviado.</p>"
                + "<p>Se você recebeu isso, a configuração do Spring Mail está funcionando perfeitamente.</p>";

        enviarEmail(emailDestino, assunto, conteudo);
    }

     */
}