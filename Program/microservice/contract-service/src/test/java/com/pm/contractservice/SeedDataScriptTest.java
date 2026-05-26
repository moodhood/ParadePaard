package com.pm.contractservice;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

class SeedDataScriptTest {

    @Test
    void seedDataDoesNotDeletePersistentContractRows() throws Exception {
        String sql = normalizedDataSql();

        assertThat(sql)
                .doesNotContain("delete from contracts")
                .doesNotContain("delete from functions");
    }

    private static String normalizedDataSql() throws Exception {
        ClassPathResource resource = new ClassPathResource("data.sql");
        String sql = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        return sql.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }
}
