package com.example.CoreCommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NovaSenhaDTO(@NotBlank String token,
                           @NotBlank @Size(min = 6) String novaSenha) {
}
