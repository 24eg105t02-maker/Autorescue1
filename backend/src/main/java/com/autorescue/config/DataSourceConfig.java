package com.autorescue.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/autorescue}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:postgres}")
    private String datasourcePassword;

    @Value("${DATABASE_URL:}")
    private String cloudDatabaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        String rawUrl = (cloudDatabaseUrl != null && !cloudDatabaseUrl.isBlank()) ? cloudDatabaseUrl : datasourceUrl;

        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "autorescue";

                config.setJdbcUrl("jdbc:postgresql://" + host + ":" + port + "/" + dbName);

                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    config.setUsername(userParts[0]);
                    if (userParts.length > 1) {
                        config.setPassword(userParts[1]);
                    }
                } else {
                    config.setUsername(datasourceUsername);
                    config.setPassword(datasourcePassword);
                }
            } catch (Exception e) {
                // Fallback: prefix with jdbc:
                config.setJdbcUrl("jdbc:" + rawUrl);
                config.setUsername(datasourceUsername);
                config.setPassword(datasourcePassword);
            }
        } else if (!rawUrl.startsWith("jdbc:")) {
            config.setJdbcUrl("jdbc:" + rawUrl);
            config.setUsername(datasourceUsername);
            config.setPassword(datasourcePassword);
        } else {
            config.setJdbcUrl(rawUrl);
            config.setUsername(datasourceUsername);
            config.setPassword(datasourcePassword);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }
}
