package com.example.CoreCommerce.dto;

public record TokenResponseDTO(String token, String refreshToken, String email) {
}