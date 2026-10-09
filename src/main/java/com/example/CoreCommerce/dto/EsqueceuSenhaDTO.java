package com.example.CoreCommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EsqueceuSenhaDTO(@NotBlank @Email String email) {
}
