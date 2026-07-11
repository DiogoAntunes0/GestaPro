package com.example.CoreCommerce.controller;
import com.example.CoreCommerce.Security.JwtService;
import com.example.CoreCommerce.dto.TokenResponseDTO;
import com.example.CoreCommerce.dto.UsuarioDTO;
import com.example.CoreCommerce.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    @Autowired
    UsuarioService usuarioService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/auth/register")
    public UsuarioDTO cadastrar(@RequestBody UsuarioDTO usuarioDTO){
        return usuarioService.cadastrar(usuarioDTO);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody UsuarioDTO usuarioDTO){

        var usernamePassword = new UsernamePasswordAuthenticationToken(usuarioDTO.email(), usuarioDTO.senha());
        authenticationManager.authenticate(usernamePassword);

        UsuarioDTO usuario = usuarioService.logar(usuarioDTO);

        String tokenJwt = jwtService.gerarToken(usuario.email());

        return ResponseEntity.ok(new TokenResponseDTO(tokenJwt));

  }

}
