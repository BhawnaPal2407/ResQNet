package com.example.ResQNet.Config;

import com.example.ResQNet.Models.Role;
import com.example.ResQNet.Models.User;
import com.example.ResQNet.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = System.getenv().getOrDefault("ADMIN_INITIAL_EMAIL", "admin@resqnet.com");
        String adminPassword = System.getenv().getOrDefault("ADMIN_INITIAL_PASSWORD", "Admin@123");

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("System Admin")
                    .email(adminEmail)
                    .phone("+10000000000")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println(">>> Initialized default admin user: " + adminEmail);
        }
    }
}
