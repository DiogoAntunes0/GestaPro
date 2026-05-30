package com.example.CoreCommerce.exception;

public class CpfExistente extends RuntimeException {

    private CpfExistente cpfExistente;

    public CpfExistente() {
        super("Já existe usuario com este CPF, entre em sua conta ou recupere!");
    }
}
