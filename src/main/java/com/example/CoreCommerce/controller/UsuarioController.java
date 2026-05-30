package com.example.CoreCommerce.controller;
import com.example.CoreCommerce.dto.UsuarioDTO;
import com.example.CoreCommerce.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    @Autowired
    UsuarioService usuarioService;

    @PostMapping("/auth/register")
    public UsuarioDTO cadastrar(@RequestBody UsuarioDTO usuarioDTO){
        return usuarioService.cadastrar(usuarioDTO);
    }

    @PostMapping("/auth/login")
    public UsuarioDTO login(@RequestBody UsuarioDTO usuarioDTO){
        return usuarioService.logar(usuarioDTO);
  }

}
