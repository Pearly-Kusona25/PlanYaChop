package com.smartrecipe.dto;

public record OpenAIRequest(
    String model,
    Message[] messages,
    double temperature,
    int max_tokens
) {
    public record Message(
        String role,
        String content
    ) {}
}
