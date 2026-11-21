package com.example.CoreCommerce.exception;

public class SenhaNaoEncontrada extends RuntimeException {

    private SenhaNaoEncontrada cpfNaoEncontrado;

    public SenhaNaoEncontrada() {
        super("Senha não incorreta, tente novamente!");
    }
}
