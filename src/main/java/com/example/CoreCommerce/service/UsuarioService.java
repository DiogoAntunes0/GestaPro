package com.example.CoreCommerce.service;

import com.example.CoreCommerce.Security.JwtService;
import com.example.CoreCommerce.dto.UsuarioDTO;
import com.example.CoreCommerce.exception.CpfExistente;
import com.example.CoreCommerce.exception.EmailExistente;
import com.example.CoreCommerce.exception.EmailNaoEncontrado;
import com.example.CoreCommerce.exception.SenhaNaoEncontrada;
import com.example.CoreCommerce.entity.Usuario;
import com.example.CoreCommerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class UsuarioService implements UserDetailsService {

    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioDTO cadastrar(UsuarioDTO usuarioDTO){
        Usuario usuario = new Usuario();
        String senhaCriptografada = passwordEncoder.encode(usuarioDTO.senha());

        if (usuarioRepository.existsByEmail(usuarioDTO.email())) {
            throw new EmailExistente();
        }

        if (usuarioRepository.existsByCpf(usuarioDTO.cpf())) {
            throw new CpfExistente();
        }

        usuario.setNome(usuarioDTO.nome());
        usuario.setEmail(usuarioDTO.email());
        usuario.setCpf(usuarioDTO.cpf());
        usuario.setSenha(senhaCriptografada);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return new UsuarioDTO(usuarioSalvo.getNome(),
                usuarioSalvo.getEmail(),
                usuarioSalvo.getCpf(),
                null
        );
    }

    public UsuarioDTO logar(UsuarioDTO usuarioDTO){

        if (!usuarioRepository.existsByEmail(usuarioDTO.email())) {
            throw new EmailNaoEncontrado();
        }

        Usuario usuario = usuarioRepository.findByEmail(usuarioDTO.email());

        if(!passwordEncoder.matches(usuarioDTO.senha(), usuario.getSenha())){
          throw new SenhaNaoEncontrada();
      }

          return new UsuarioDTO(
                  usuario.getNome(),
                  usuario.getEmail(),
                  usuario.getCpf(),
                  null
          );
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
}
