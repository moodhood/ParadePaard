# Shared Admin Inbox Design

Date: 2026-05-18

## Purpose

ParadePaard needs a messaging system where a normal user can send messages to one company/admin account. The user should not choose between individual admins. From the user side, the experience is one ongoing conversation with the company.

Admins need a shared inbox. Multiple admins in the same company can open the same user conversation, read the full thread, and reply. Replies are stored with the actual admin user id for audit purposes, but the user-facing thread shows them as company/admin replies rather than personal admin accounts.

## Current Context

The project already has:

- A `user-service` that owns users, companies, user status, leave requests, public applications, and onboarding data.
- Permission-based Spring security with method-level `@PreAuthorize` checks.
- An API gateway that routes `/api/users/**`, `/api/user/**`, `/api/admin/**`, and `/api/leave-requests/**` to `user-service`.
- A React frontend with active-user route guards, permission-aware management navigation, and shared page shell/navigation components.
- Auth seed data that grants management permissions to admin roles.

The first messaging version should live in `user-service` because the conversation is directly tied to a user and company. This avoids a new microservice, gateway service registration work, duplicated user lookup logic, and extra deployment complexity for a feature that starts as an account-attached support inbox.

## Product Direction

Use one ongoing conversation per user and company.

The system should enforce a unique conversation for each `companyId + userId` pair. If the user opens the Messages page before sending anything, the backend can create or return an empty conversation. If the user sends a first message, the backend creates the conversation and stores the message.

The user should see:

- One thread labeled as a company/admin conversation.
- All messages in chronological order.
- Their own messages as user messages.
- Admin replies as company/admin messages, not as separate named admins.
- A composer to send the next message.

The admin should see:

- A shared inbox list for their company.
- One row per user conversation.
- The user name/email, last message preview, last message time, and unread count if feasible in the first pass.
- A detail thread for the selected conversation.
- A reply composer that sends as the shared company/admin account.

## Backend Design

Add a focused messaging domain inside `user-service`.

Recommended entities:

- `MessageConversation`
  - `conversationId`
  - `companyId`
  - `user`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`
  - `lastMessagePreview`
  - `unreadByAdminCount`
  - `unreadByUserCount`

- `MessageEntry`
  - `messageId`
  - `conversation`
  - `senderType`: `USER` or `ADMIN`
  - `senderUserId`
  - `body`
  - `createdAt`

The `senderUserId` is always stored. For user messages it is the conversation user. For admin replies it is the admin who replied. The frontend can use `senderType` to decide whether to show the message as "You" or "Company".

Recommended endpoints:

- `GET /messages/me`
  - Returns the signed-in user's own conversation with messages.

- `POST /messages/me`
  - Sends a message from the signed-in user to the company.

- `GET /messages/admin/conversations`
  - Returns the admin shared inbox for the signed-in admin's company.

- `GET /messages/admin/conversations/{conversationId}`
  - Returns one conversation with messages.

- `POST /messages/admin/conversations/{conversationId}/messages`
  - Adds an admin reply to the selected conversation.

Access rules:

- Normal users can only access their own conversation.
- Admins with `CAN_MANAGE_MESSAGES` can list and reply to conversations in their own company.
- Admins must not be able to open or reply to a conversation from another company.

## Frontend Design

Add a normal user Messages page at `/messages`.

The page should use the existing page shell and primary navigation. It should show one conversation panel with message history and a textarea composer. Empty state text should tell the user they can send a message to the company. After sending, the page should reload or append the new message.

Add a management Messages page at `/management/messages`.

The admin page should use a practical shared inbox layout:

- Left side or top section: conversation list.
- Detail area: selected thread.
- Reply composer at the bottom of the selected thread.

The page should support loading, empty, error, and sending states. It should not include assignment, separate subjects, or individual admin selection.

Navigation changes:

- Add `Messages` to the primary navigation for active users.
- Add `Messages` to the Management page and management navigation for accounts with `CAN_MANAGE_MESSAGES`.

## Permissions

Add one new permission:

- `CAN_MANAGE_MESSAGES`: view the shared admin inbox and reply to user conversations.

Seed this permission in `auth-service` and grant it to `ADMIN` and `SUPER_ADMIN` roles. Standard users do not need a special permission to use their own `/messages/me` endpoints because active authenticated users can message their own company account.

## First Version Boundary

The first version includes:

- One ongoing conversation per user and company.
- User message page.
- Admin shared inbox page.
- Admin replies visible to the user as company/admin replies.
- Company scoping for admin access.
- Basic unread counters if straightforward with the chosen schema.
- Manual refresh and reload-after-send behavior.
- Rundown documentation updates.

The first version does not include:

- WebSockets or realtime updates.
- Attachments.
- Thread subjects.
- Multiple conversations per user.
- Assignment to a specific admin.
- Archiving or closing conversations.
- Search.
- Email or push notifications.

## Testing

Backend tests should cover:

- A user can send a first message and gets one conversation.
- A second user message reuses the same conversation.
- Admin inbox lists conversations for the admin's company.
- Admin reply is added to the same conversation.
- Admin access is company-scoped.
- Blank messages are rejected.

Frontend tests should cover:

- User page renders one company conversation and a composer.
- User page shows sent user and company messages with the right labels.
- Admin inbox shows conversation rows and selected thread messages.
- Admin reply controls are visible and disabled while sending.
- Management navigation exposes Messages for the message permission.

## Rundown Impact

Update `Project Plan/Rundown/ParadePaardRundown.tex` after implementation with:

- A user Messages Page section.
- A Management Messages Page section.
- Navigation behavior for the new Messages items.
- A change log entry dated `2026 05 18`.

## Self-Review

The design is scoped to one ongoing user-company conversation, which matches the approved requirement. It keeps messaging in `user-service` and avoids a separate microservice. It defines the user and admin pages, backend entities, endpoints, permissions, routing, testing, and rundown updates. It intentionally excludes realtime messaging, attachments, assignments, and multiple subject threads from the first version.
