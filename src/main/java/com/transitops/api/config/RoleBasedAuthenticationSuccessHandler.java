package com.transitops.api.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class RoleBasedAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        Authentication authentication) throws IOException, ServletException {
        
        String requestedRole = request.getParameter("role");
        if (requestedRole == null) {
            request.getSession().invalidate();
            response.sendRedirect("/login.html?error");
            return;
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        
        boolean hasRole = false;
        for (GrantedAuthority authority : authorities) {
            String actualRole = authority.getAuthority();
            if (actualRole.equals(requestedRole)) {
                hasRole = true;
                break;
            }
            // Allow drivers to use the dispatcher login option
            if (requestedRole.equals("ROLE_DISPATCHER") && actualRole.equals("ROLE_DRIVER")) {
                hasRole = true;
                break;
            }
        }

        if (!hasRole) {
            request.getSession().invalidate();
            response.sendRedirect("/login.html?error");
            return;
        }
        
        if (requestedRole.equals("ROLE_FLEET_MANAGER")) {
            response.sendRedirect("/fleet.html");
            return;
        } else if (requestedRole.equals("ROLE_FINANCIAL_ANALYST")) {
            response.sendRedirect("/financial.html");
            return;
        } else if (requestedRole.equals("ROLE_DISPATCHER") || requestedRole.equals("ROLE_DRIVER")) {
            response.sendRedirect("/dispatcher.html");
            return;
        }
        
        // Fallback for unknown roles
        response.sendRedirect("/login.html?error");
    }
}
