package com.smartrecipe.service;

import com.smartrecipe.dto.RecaptchaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RecaptchaService {

    private static final Logger log = LoggerFactory.getLogger(RecaptchaService.class);

    @Value("${recaptcha.secret}")
    private String secret;

    @Value("${recaptcha.verify-url:https://www.google.com/recaptcha/api/siteverify}")
    private String verifyUrl;

    @Value("${recaptcha.threshold:0.5}")
    private double threshold;

    @Value("${recaptcha.enabled:true}")
    private boolean enabled;

    private final WebClient webClient = WebClient.create();

    public void verify(String token, String expectedAction, String remoteIp) {
        if (!enabled) {
            log.debug("reCAPTCHA disabled via configuration; skipping verification for action={}", expectedAction);
            return;
        }

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing reCAPTCHA token");
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("secret", secret);
        formData.add("response", token);
        if (remoteIp != null && !remoteIp.isBlank()) {
            formData.add("remoteip", remoteIp);
        }

        RecaptchaResponse response = webClient.post()
            .uri(verifyUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData(formData))
            .retrieve()
            .bodyToMono(RecaptchaResponse.class)
            .block();

        boolean valid = response != null
            && response.isSuccess()
            && response.getScore() >= threshold
            && (expectedAction == null || expectedAction.equals(response.getAction()));

        if (response != null) {
            log.info("reCAPTCHA action={} score={} success={} hostname={} errors={}",
                response.getAction(), response.getScore(), response.isSuccess(),
                response.getHostname(), response.getErrorCodes());
        }

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed human verification");
        }
    }
}
