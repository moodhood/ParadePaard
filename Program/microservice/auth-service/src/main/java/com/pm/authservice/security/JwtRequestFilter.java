package com.pm.authservice.security;

import com.pm.authservice.model.Role;
import com.pm.authservice.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        // Normalize path by removing trailing slash
        if (path.endsWith("/") && path.length() > 1) {
            path = path.substring(0, path.length() - 1);
        }

        // These are the paths AFTER the API Gateway strips the /auth prefix
        return path.equals("/register")      // /auth/register becomes /register
                || path.equals("/login")         // /auth/login becomes /login
                || path.equals("/validate")      // /auth/validate becomes /validate
                || path.startsWith("/actuator")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                jwtUtil.validateToken(token);
                String email = jwtUtil.extractEmail(token);
                List<Role> roles = jwtUtil.extractRoles(token);

                List<SimpleGrantedAuthority> authorities =
                        roles == null ? List.of()
                                : roles.stream()
                                .map(Role::getName)
                                .filter(Objects::nonNull)
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .map(name -> name.startsWith("ROLE_") ? name : "ROLE_" + name)
                                .map(SimpleGrantedAuthority::new)
                                .toList();

                var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException ex) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}