package com.example.CoreCommerce.service;

import com.example.CoreCommerce.entity.ResetarSenhaToken;
import com.example.CoreCommerce.entity.Usuario;
import com.example.CoreCommerce.repository.ResetarSenhaTokenRepository;
import com.example.CoreCommerce.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class ResetarSenhaService {

        private static final Duration TOKEN_TTL = Duration.ofMinutes(10);
        private static final SecureRandom RANDOM = new SecureRandom();

        @Autowired
        private  UsuarioRepository usuarioRepository;

        @Autowired
            private  ResetarSenhaTokenRepository tokenRepository;

        @Autowired
            private  PasswordEncoder passwordEncoder;

        @Autowired
        private  EmailService emailService;


        @Transactional
        public void requestSenha(String email) {
           Usuario usuario =  usuarioRepository.findByEmail(email);

           if(usuario.getEmail() == null) {
               return;
           }

                String rawToken = generateToken();

                ResetarSenhaToken token = new ResetarSenhaToken();
                token.setUsuario(usuario);
                token.setTokenHash(sha256(rawToken));
                token.setExpiresAt(Instant.now().plus(TOKEN_TTL));
                tokenRepository.save(token);

                String link = "http://127.0.0.1:5500/src/main/resources/templates/FrontEnd/" + "?token=" + rawToken;
                emailService.ResetarSenhaPorEmail(usuario.getEmail(), link);
            };


        @Transactional
        public void resetarSenha(String rawToken, String novaSenha) {
            ResetarSenhaToken token = tokenRepository.findByTokenHash(sha256(rawToken))
                    .orElseThrow(() -> new RuntimeException("Link inválido ou expirado. Solicite um novo."));

            if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
                throw new RuntimeException("Link inválido ou expirado. Solicite um novo.");
            }

            Usuario usuario = token.getUsuario();
            usuario.setNovaSenha(passwordEncoder.encode(novaSenha));
            token.setUsed(true);
        }

        private String generateToken() {
            byte[] bytes = new byte[32];
            RANDOM.nextBytes(bytes);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        }

        private String sha256(String value) {
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
                return HexFormat.of().formatHex(hash);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException(e);
            }
        }
}