# Amazon SES SMTP Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every MailerSend-backed email path with Amazon SES SMTP without changing workflow behavior or email content.

**Architecture:** Keep the existing `EmailSender` and `ContractEmailSender` ports, replacing only their provider adapters with `JavaMailSender` implementations. Configure both Spring Boot services through the same `SES_SMTP_*` and `SES_FROM_EMAIL` environment contract, using STARTTLS on the Stockholm SES endpoint.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring Mail, Jakarta Mail, JUnit 5, AssertJ, Mockito, Maven, Docker Compose.

---

### Task 1: Auth Service SES Adapter

**Files:**
- Create: `Program/microservice/auth-service/src/test/java/com/pm/authservice/service/SesEmailSenderTest.java`
- Create: `Program/microservice/auth-service/src/main/java/com/pm/authservice/service/SesEmailSender.java`
- Delete: `Program/microservice/auth-service/src/main/java/com/pm/authservice/service/MailerSendEmailSender.java`

- [ ] **Step 1: Write failing adapter tests**

Create tests using a mocked `JavaMailSender` and a real `MimeMessage`:

```java
JavaMailSender mailSender = mock(JavaMailSender.class);
MimeMessage message = new MimeMessage((Session) null);
when(mailSender.createMimeMessage()).thenReturn(message);

SesEmailSender sender = new SesEmailSender(mailSender, "noreply@lambdamanager.com");
sender.sendPasswordResetEmail("employee@example.com", "https://app/reset?token=abc", Duration.ofMinutes(15));

verify(mailSender).send(message);
assertThat(message.getFrom()[0].toString()).isEqualTo("noreply@lambdamanager.com");
assertThat(message.getAllRecipients()[0].toString()).isEqualTo("employee@example.com");
assertThat(message.getSubject()).isEqualTo("Reset your LambdaManager password");
assertThat(multipartText(message)).contains("https://app/reset?token=abc");
assertThat(multipartHtml(message)).contains("Reset your password");
```

Add equivalent coverage for onboarding and account setup, plus a test where `mailSender.send(...)` throws and the adapter propagates a runtime failure.

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
.\mvnw.cmd -Dtest=SesEmailSenderTest test
```

Working directory: `Program/microservice/auth-service`

Expected: compilation failure because `SesEmailSender` does not exist.

- [ ] **Step 3: Implement the SES adapter**

Implement `SesEmailSender` as the only `@Service` implementing `EmailSender`:

```java
@Service
public class SesEmailSender implements EmailSender {
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public SesEmailSender(
            JavaMailSender mailSender,
            @Value("${email.from-address:noreply@lambdamanager.com}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    private void sendEmail(String toEmail, String subject, String text, String html, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(text, html);
            mailSender.send(message);
        } catch (MessagingException | MailException e) {
            log.error("SES {} email failed (from={}, to={})", purpose, fromEmail, toEmail, e);
            throw new RuntimeException("Failed to send " + purpose + " email", e);
        }
    }
}
```

Preserve all existing subjects, text bodies, HTML bodies, duration handling, and escaping. Delete `MailerSendEmailSender`.

- [ ] **Step 4: Run auth adapter tests and verify GREEN**

Run:

```powershell
.\mvnw.cmd -Dtest=SesEmailSenderTest test
```

Expected: all `SesEmailSenderTest` tests pass.

### Task 2: Contract Service SES Adapter

**Files:**
- Create: `Program/microservice/contract-service/src/test/java/com/pm/contractservice/service/SesContractEmailSenderTest.java`
- Create: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/service/SesContractEmailSender.java`
- Delete: `Program/microservice/contract-service/src/test/java/com/pm/contractservice/service/MailerSendContractEmailSenderTest.java`
- Delete: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/service/MailerSendContractEmailSender.java`
- Modify: `Program/microservice/contract-service/pom.xml`

- [ ] **Step 1: Write failing contract adapter tests**

Use a mocked `JavaMailSender` and real `MimeMessage` to assert:

```java
SesContractEmailSender sender =
        new SesContractEmailSender(mailSender, "noreply@lambdamanager.com");

sender.sendContractReadyEmail(
        "imre@example.com",
        "Imre",
        "http://localhost:5173/contracts/contract-1/sign"
);

verify(mailSender).send(message);
assertThat(message.getSubject()).isEqualTo("Your ParadePaard contract is ready");
assertThat(multipartText(message))
        .contains("Your ParadePaard employment contract is ready to review and sign.")
        .contains("http://localhost:5173/contracts/contract-1/sign");
assertThat(multipartHtml(message)).contains("Review and sign contract");
```

Add a failure test asserting that a `MailSendException` becomes `ContractEmailDeliveryException`.

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
.\mvnw.cmd -Dtest=SesContractEmailSenderTest test
```

Working directory: `Program/microservice/contract-service`

Expected: compilation failure because `SesContractEmailSender` does not exist.

- [ ] **Step 3: Add Spring Mail and implement adapter**

Add to `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

Implement `SesContractEmailSender` with the same MIME construction as the auth adapter, preserve existing copy and escaping, and translate `MessagingException` or `MailException` to `ContractEmailDeliveryException`. Delete the MailerSend adapter and its HTTP-server test.

- [ ] **Step 4: Run contract adapter tests and verify GREEN**

Run:

```powershell
.\mvnw.cmd -Dtest=SesContractEmailSenderTest test
```

Expected: all `SesContractEmailSenderTest` tests pass.

### Task 3: Shared SES SMTP Configuration

**Files:**
- Modify: `Program/microservice/auth-service/src/main/resources/application.properties`
- Modify: `Program/microservice/contract-service/src/main/resources/application.properties`
- Modify: `Program/microservice/docker-compose.yml`
- Modify: `Program/microservice/.env.example`

- [ ] **Step 1: Write failing configuration assertions**

Add source-level tests in each service that load `application.properties` and assert these exact mappings:

```properties
spring.mail.host=${SES_SMTP_HOST:email-smtp.eu-north-1.amazonaws.com}
spring.mail.port=${SES_SMTP_PORT:587}
spring.mail.username=${SES_SMTP_USERNAME:}
spring.mail.password=${SES_SMTP_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
email.from-address=${SES_FROM_EMAIL:noreply@lambdamanager.com}
```

Also assert that `mailersend` is absent.

- [ ] **Step 2: Run configuration tests and verify RED**

Run the new tests in each service. Expected: failures because SES properties are not present and MailerSend properties remain.

- [ ] **Step 3: Replace runtime configuration**

Apply the property block above to both services. In Docker Compose, pass:

```yaml
SES_SMTP_HOST: "${SES_SMTP_HOST:-email-smtp.eu-north-1.amazonaws.com}"
SES_SMTP_PORT: "${SES_SMTP_PORT:-587}"
SES_SMTP_USERNAME: "${SES_SMTP_USERNAME}"
SES_SMTP_PASSWORD: "${SES_SMTP_PASSWORD}"
SES_FROM_EMAIL: "${SES_FROM_EMAIL:-noreply@lambdamanager.com}"
```

Add blank SES credentials and safe defaults to `.env.example`; remove all `MAILERSEND_*` entries. Do not place live credentials in tracked files.

- [ ] **Step 4: Run configuration tests and verify GREEN**

Run the new tests in both services. Expected: all configuration assertions pass.

### Task 4: Regression And Provider Removal Verification

**Files:**
- Verify all files changed in Tasks 1-3.

- [ ] **Step 1: Run auth-service suite**

Run:

```powershell
.\mvnw.cmd test
```

Working directory: `Program/microservice/auth-service`

Expected: build success with zero test failures.

- [ ] **Step 2: Run contract-service suite**

Run:

```powershell
.\mvnw.cmd test
```

Working directory: `Program/microservice/contract-service`

Expected: build success with zero test failures.

- [ ] **Step 3: Verify MailerSend and credentials are absent**

Run:

```powershell
git grep -n -i "mailersend" -- Program/microservice ':!Program/microservice/**/target/**' ':!Program/microservice/**/bin/**'
git grep -n -E "AKIA|TAfj3A7G58htY3GSLF5IZ4rh7ZMrAsdTdJYtW\\+YT" --
git diff --check
```

Expected: both grep commands return no tracked matches; `git diff --check` returns no errors.

- [ ] **Step 4: Review final diff**

Confirm only SES migration files and tests changed, all email content is preserved, and no unrelated user changes were modified.
