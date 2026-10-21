# Member 3 — Borrow / Lend / Exchange QA

Branch: `rebuild/reliable-final-submission`

## Existing implementation reviewed
- Backend routes: `server/src/routes/exchangeRoutes.js`
- Backend controller: `server/src/controllers/exchangeController.js`
- Request model: `server/src/models/ExchangeRequest.js`
- Frontend API wrapper: `client/src/services/exchangeService.js`

## Changes made on this branch
- Request creation now ignores client-supplied `ownerId` and derives the owner from the selected book.
- Only `borrow` and `exchange` request types are accepted by this flow.
- Borrow duration is validated as a whole number from 1 to 365 days; messages must be text and at most 500 characters.
- Direct exchanges require an offered book that belongs to the requester, is available, and is not the same book being requested.
- Accepting an exchange re-checks the offered book and transfers ownership of both books; marking an exchange complete no longer makes the transferred books available again.
- Returning a borrowed book marks it returned and restores the requested book to available.

## Remaining risks before calling this module complete
1. Accepting a request updates the request and books in separate writes; concurrent accept attempts or a mid-operation database failure can leave inconsistent state. Use a MongoDB transaction where supported, or another atomic strategy, before production.
2. Rejecting a request writes the rejection reason into the original message field. Prefer a separate `rejectionReason` field if the UI needs it.
3. The controller auto-rejects other pending requests with `updateMany`; verify its status and messaging behavior with the UI.
4. The exchange lifecycle and ownership transfer need a full frontend-to-backend smoke test with two isolated test users and books. No runtime/integration tests have been run by this change yet.

## Required manual smoke tests (isolated test database only)
- User A cannot request their own book.
- User A can request an available book owned by User B.
- User A cannot request a book that is unavailable.
- Duplicate pending request from User A is blocked.
- User B can accept/reject User A's pending request; User A and User C cannot accept it.
- User A can cancel their own pending request; other users cannot.
- Only participants can mark an eligible request returned.
- Book and request statuses persist after refresh and are consistent in both users' dashboards.
- Exchange flow verifies the offered book belongs to the requester and is available.
- API returns clear validation errors for missing/invalid IDs and invalid request types.

## Acceptance criteria
Do not mark the module complete until each relevant test is run against an isolated test database and the outcome is recorded. Do not use production accounts or production book records.
