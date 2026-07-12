package com.transitops.api.controllers;

import com.transitops.api.models.User;
import com.transitops.api.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> requestBody,
                                   HttpServletRequest request,
                                   HttpServletResponse response) {
        String email = requestBody.get("email");
        String password = requestBody.get("password");

        try {
            UsernamePasswordAuthenticationToken authReq = new UsernamePasswordAuthenticationToken(email, password);
            Authentication authentication = authenticationManager.authenticate(authReq);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("email", user.getEmail());
            responseData.put("role", user.getRole());
            responseData.put("message", "Login successful");

            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            Map<String, String> errorData = new HashMap<>();
            errorData.put("error", "Unauthorized");
            errorData.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorData);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> errorData = new HashMap<>();
            errorData.put("error", "Unauthorized");
            errorData.put("message", "Not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorData);
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            Map<String, String> errorData = new HashMap<>();
            errorData.put("error", "Not Found");
            errorData.put("message", "User details not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorData);
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("email", user.getEmail());
        responseData.put("role", user.getRole());

        return ResponseEntity.ok(responseData);
    }
}
