package com.pm.userservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class AuditLogSchemaRepair implements ApplicationRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogSchemaRepair.class);
    private static final String SUMMARY_TYPE_SQL = """
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'audit_log_entries'
              AND column_name = 'summary'
            """;
    private static final String REPAIR_SUMMARY_FROM_BYTEA_SQL =
            "ALTER TABLE audit_log_entries ALTER COLUMN summary TYPE TEXT USING convert_from(summary, 'UTF8')";
    private static final String WIDEN_SUMMARY_VARCHAR_SQL =
            "ALTER TABLE audit_log_entries ALTER COLUMN summary TYPE TEXT";

    private final JdbcTemplate jdbcTemplate;

    public AuditLogSchemaRepair(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        repairSummaryColumnType();
    }

    void repairSummaryColumnType() {
        String summaryType = jdbcTemplate.query(
                SUMMARY_TYPE_SQL,
                resultSet -> resultSet.next() ? resultSet.getString(1) : null
        );

        if (summaryType == null) {
            return;
        }
        if ("bytea".equalsIgnoreCase(summaryType)) {
            LOGGER.warn("Repairing audit_log_entries.summary from BYTEA to TEXT");
            jdbcTemplate.execute(REPAIR_SUMMARY_FROM_BYTEA_SQL);
            return;
        }
        if ("character varying".equalsIgnoreCase(summaryType)) {
            jdbcTemplate.execute(WIDEN_SUMMARY_VARCHAR_SQL);
        }
    }
}
