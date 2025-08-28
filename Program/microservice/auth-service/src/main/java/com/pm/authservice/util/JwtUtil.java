package com.pm.authservice.util;

import com.pm.authservice.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JwtUtil {
    private final SecretKey secretKey;
    private static final long ACCESS_TOKEN_VALIDITY = 1 * 30 * 1000; // 5 min
    private static final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    
    public JwtUtil(@Value("${jwt.secret}") String secret) {
        byte[] keyBytes = Base64.getDecoder().decode(secret.getBytes(StandardCharsets.UTF_8));
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // preferred call, includes userId claim
    public String generateAccessToken(String email, String userId, List<Role> roles) {
        List<String> roleNames = roles.stream().map(Role::getName).toList();
        var builder = Jwts.builder()
                .subject(email)
                .claim("roles", roleNames)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(secretKey, Jwts.SIG.HS256);
        builder.claim("userId", userId);
        builder.claim("role", roleNames.get(0));
        return builder.compact();
    }

    public String generateRefreshToken(String email, String userId, List<Role> roles) {
        List<String> roleNames = roles.stream().map(Role::getName).toList();
        var builder = Jwts.builder()
                .subject(email)
                .claim("roles", roleNames)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY))
                .signWith(secretKey, Jwts.SIG.HS256);
        builder.claim("userId", userId);
        builder.claim("role", roleNames.get(0));
        return builder.compact();
    }

    public void validateToken(String token) throws JwtException {parse(token);}

    public Claims extractClaims(String token) {return parse(token).getPayload();}

    public String extractEmail(String token) {return extractClaims(token).getSubject();}

    public List<Role> extractRoles(String token) {
        Object raw = extractClaims(token).get("roles");
        if (raw == null) return Collections.emptyList();

        if (raw instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof String) {
            return ((List<String>) list).stream().map(name -> {
                        Role role = new Role();
                        role.setName(name);
                        return role;
                    })
                    .toList();
        }
        return Collections.emptyList();
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
    }
}
