package com.example.CoreCommerce.service;

import com.example.CoreCommerce.controller.RefreshToken;
import com.example.CoreCommerce.entity.Usuario;
import com.example.CoreCommerce.repository.RefreshTokenRepository;
import com.example.CoreCommerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public RefreshToken criarRefreshToken(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if(usuario.getEmail() == null){
            new RuntimeException("Usuario não encontrado");
        }


        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUsuario(usuario);
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken.setDataExpiracao(Instant.now().plusMillis(1209600000L));

        return refreshTokenRepository.save(refreshToken);
    }
}
