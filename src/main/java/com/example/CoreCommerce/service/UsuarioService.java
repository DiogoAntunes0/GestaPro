package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.UsuarioDTO;
import com.example.CoreCommerce.exception.CpfExistente;
import com.example.CoreCommerce.exception.EmailExistente;
import com.example.CoreCommerce.model.Usuario;
import com.example.CoreCommerce.repository.UsuarioRepository;
import jakarta.validation.constraints.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UsuarioService {

    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    @Autowired
    private UsuarioRepository usuarioRepository;

    //post via front-end
    public UsuarioDTO cadastrar(UsuarioDTO usuarioDTO){
        Usuario usuario = new Usuario();

        if (usuarioRepository.existsByEmail(usuarioDTO.email())) {
            throw new EmailExistente();
        }

        if (usuarioRepository.existsByCpf(usuarioDTO.cpf())) {
            throw new CpfExistente();
        }

        usuario.setNome(usuarioDTO.nome());
        usuario.setEmail(usuarioDTO.email());
        usuario.setCpf(usuarioDTO.cpf());
        usuario.setSenha(usuarioDTO.senha());

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return new UsuarioDTO(usuarioSalvo.getNome(),
                usuarioSalvo.getEmail(),
                usuarioSalvo.getCpf(),
                usuarioSalvo.getSenha());
    }

    public UsuarioDTO logar(UsuarioDTO usuarioDTO){
        Usuario usuario = usuarioRepository.findByEmail(usuarioDTO.email());

        if (!usuarioRepository.existsByEmail(usuarioDTO.email())) {
          throw new NullPointerException("E-mail inexsistente, cadastre-se ou tente novamente!");
        }

        if(!usuarioDTO.senha().equalsIgnoreCase(usuario.getSenha())){
            throw new RuntimeException("Senha incorreta, tente novamente!");
        }

        return new UsuarioDTO(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpf(),
                usuario.getSenha()
        );
    }
}
