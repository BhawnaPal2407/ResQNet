package com.example.ResQNet.Config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.h2.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String jdbcUrl = rawUrl;
        String dbUser = username;
        String dbPass = password;

        if (rawUrl != null && (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://"))) {
            try {
                String cleanUrl = rawUrl.replaceFirst("^(postgresql|postgres)://", "http://");
                URI uri = new URI(cleanUrl);

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    if (userInfo.length > 0 && !userInfo[0].isEmpty()) {
                        dbUser = userInfo[0];
                    }
                    if (userInfo.length > 1 && !userInfo[1].isEmpty()) {
                        dbPass = userInfo[1];
                    }
                }
            } catch (Exception e) {
                if (!rawUrl.startsWith("jdbc:")) {
                    jdbcUrl = "jdbc:" + rawUrl;
                }
            }
        } else if (rawUrl != null && !rawUrl.startsWith("jdbc:")) {
            jdbcUrl = "jdbc:" + rawUrl;
        }

        config.setJdbcUrl(jdbcUrl);

        if (dbUser != null && !dbUser.isEmpty()) {
            config.setUsername(dbUser);
        }
        if (dbPass != null && !dbPass.isEmpty()) {
            config.setPassword(dbPass);
        }

        if (jdbcUrl != null && jdbcUrl.startsWith("jdbc:postgresql:")) {
            config.setDriverClassName("org.postgresql.Driver");
        } else if (driverClassName != null && !driverClassName.isEmpty()) {
            config.setDriverClassName(driverClassName);
        }

        return new HikariDataSource(config);
    }
}
