package com.example.CoreCommerce.controller;

import com.example.CoreCommerce.dto.EsqueceuSenhaDTO;
import com.example.CoreCommerce.dto.NovaSenhaDTO;
import com.example.CoreCommerce.service.ResetarSenhaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class ResetarSenhaController {

        @Autowired
        private ResetarSenhaService service;

        @PostMapping("/forgot-password")
        public ResponseEntity<Void> forgotPassword(@Valid @RequestBody EsqueceuSenhaDTO esqueceuSenhaDTO) {
            service.requestSenha(esqueceuSenhaDTO.email());
            return ResponseEntity.ok().build();
        }

        @PostMapping("/reset-password")
        public ResponseEntity<Void> resetPassword(@Valid @RequestBody NovaSenhaDTO novaSenhaDTO) {
            service.resetarSenha(novaSenhaDTO.token(), novaSenhaDTO.novaSenha());
            return ResponseEntity.noContent().build();
        }
    }


