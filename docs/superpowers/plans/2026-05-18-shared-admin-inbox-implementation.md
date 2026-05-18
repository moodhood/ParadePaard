# Shared Admin Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one ongoing user-to-company messaging thread and a shared admin inbox.

**Architecture:** Implement messaging as a focused domain inside `user-service` because conversations are company- and user-owned. Add React user/admin pages that call gateway-routed `/api/messages/**` endpoints. Add one `CAN_MANAGE_MESSAGES` permission for the admin inbox.

**Tech Stack:** Spring Boot 3.5, Java 21, Spring Data JPA, Spring Security JWT, PostgreSQL-compatible seed SQL, React 19, React Router, Axios, TypeScript, Vitest.

---

## File Structure

- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/model/MessageSenderType.java`
  - Enum for `USER` and `ADMIN`.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/model/MessageConversation.java`
  - Conversation entity with one row per user/company thread.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/model/MessageEntry.java`
  - Message entity for chronological thread entries.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/MessageConversationRepository.java`
  - Conversation lookup and company inbox queries.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/MessageEntryRepository.java`
  - Message lookup by conversation.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/MessageSendRequestDTO.java`
  - Request body for user/admin messages.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/MessageEntryDTO.java`
  - Message response DTO.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/MessageConversationDTO.java`
  - Conversation summary/detail response DTO.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/mapper/MessageMapper.java`
  - Entity-to-DTO mapping and user display names.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/service/MessageService.java`
  - Business rules for one conversation per user, admin company scoping, unread counters, and message creation.
- Create `Program/microservice/user-service/src/main/java/com/pm/userservice/controller/MessageController.java`
  - `/messages/me` and `/messages/admin/**` endpoints.
- Modify `Program/microservice/user-service/src/main/resources/data.sql`
  - Add message tables and constraints.
- Modify `Program/microservice/auth-service/src/main/resources/data.sql`
  - Seed and grant `CAN_MANAGE_MESSAGES`.
- Modify `Program/microservice/api-gateway/src/main/resources/application.yml`
  - Route `/api/messages/**` to `user-service`.
- Create `Program/frontend/src/services/user-service/Messages.ts`
  - Axios wrappers and DTO types for messaging.
- Modify `Program/frontend/src/services/user-service/UserServices.ts`
  - Export messaging service methods/types.
- Modify `Program/frontend/src/utils/permissionPolicy.ts`
  - Add message management permission and nav item.
- Modify `Program/frontend/src/utils/managementSections.ts`
  - Place Messages under People.
- Modify `Program/frontend/src/components/PrimaryNav.tsx`
  - Add user Messages navigation.
- Modify `Program/frontend/src/App.tsx`
  - Add `/messages` and `/management/messages` routes.
- Create `Program/frontend/src/pages/Messages.tsx`
  - User-facing one-thread messaging page.
- Create `Program/frontend/src/pages/AdminMessages.tsx`
  - Shared admin inbox page.
- Create `Program/frontend/src/stylesheets/Messages.css`
  - Shared messaging layout styles.
- Add tests:
  - `Program/microservice/user-service/src/test/java/com/pm/userservice/MessageServiceTest.java`
  - `Program/frontend/src/pages/Messages.test.tsx`
  - `Program/frontend/src/pages/AdminMessages.test.tsx`
- Modify `Project Plan/Rundown/ParadePaardRundown.tex`
  - Describe new user/admin messaging pages and add the change log entry.

## Tasks

### Task 1: Backend Messaging Domain

- [ ] Write a failing `MessageServiceTest` for first user message creation and conversation reuse.
- [ ] Run `cd Program/microservice/user-service; .\mvnw.cmd -Dtest=MessageServiceTest test` and confirm it fails because messaging classes do not exist.
- [ ] Add the message enum, entities, repositories, DTOs, mapper, and service.
- [ ] Add `message_conversations` and `message_entries` table setup to `user-service` `data.sql`.
- [ ] Run the targeted backend test and confirm it passes.

### Task 2: Backend Messaging Endpoints And Permissions

- [ ] Extend `MessageServiceTest` for admin company scoping and admin replies.
- [ ] Add `MessageController` with user and admin endpoints.
- [ ] Add `CAN_MANAGE_MESSAGES` to auth seed data and admin role grants.
- [ ] Add `/api/messages/**` route to the API gateway.
- [ ] Run targeted user-service tests.

### Task 3: Frontend Messaging Services And Navigation

- [ ] Add `Messages.ts` service wrappers and export them through `UserServices.ts`.
- [ ] Add message permission constants and management nav item.
- [ ] Add Messages to primary nav and management sections.
- [ ] Add `/messages` and `/management/messages` routes.
- [ ] Run TypeScript build after page implementation.

### Task 4: User Messages Page

- [ ] Write a failing `Messages.test.tsx` that renders the user thread and composer.
- [ ] Add `Messages.tsx` user page with loading, empty, error, message list, and send states.
- [ ] Add shared `Messages.css`.
- [ ] Run the user page test and confirm it passes.

### Task 5: Admin Shared Inbox Page

- [ ] Write a failing `AdminMessages.test.tsx` for inbox rows, selected thread, and reply controls.
- [ ] Add `AdminMessages.tsx` with inbox list, selected thread, and admin reply composer.
- [ ] Reuse shared message styles with admin-specific grid classes.
- [ ] Run the admin page test and confirm it passes.

### Task 6: Rundown, Verification, Commit, Push

- [ ] Update `Project Plan/Rundown/ParadePaardRundown.tex` with user/admin messaging descriptions and a `2026 05 18` change log entry.
- [ ] Run `cd Program/frontend; npm test -- src/pages/Messages.test.tsx src/pages/AdminMessages.test.tsx`.
- [ ] Run `cd Program/frontend; npm run build`.
- [ ] Run `cd Program/microservice/user-service; .\mvnw.cmd -Dtest=MessageServiceTest test`.
- [ ] Run `git status`, stage intended files, commit with `Add shared admin messaging inbox`, and push.

## Self-Review

Spec coverage is complete for one ongoing conversation, user page, shared admin inbox, admin-as-company replies, `user-service` implementation, permissions, routing, tests, and rundown updates. The plan intentionally excludes realtime updates, attachments, subjects, assignment, archiving, search, and notifications as specified.
