# Member 3 — Borrow / Lend / Exchange QA

Branch: `rebuild/reliable-final-submission`

## Existing implementation reviewed
- Backend routes: `server/src/routes/exchangeRoutes.js`
- Backend controller: `server/src/controllers/exchangeController.js`
- Request model: `server/src/models/ExchangeRequest.js`
- Frontend API wrapper: `client/src/services/exchangeService.js`

## Risks to address before calling this module complete
1. Request creation accepts `ownerId` from the request body and uses it instead of always deriving the owner from the selected book. The server should derive owner from `book.owner` to prevent inconsistent ownership.
2. Request type should be explicitly validated as `borrow` or `exchange` (and `purchase` only if purchase is intentionally supported end-to-end).
3. Borrow duration should be validated as a sensible positive integer with a defined maximum.
4. Exchange requests should require an offered book if the product requirements say a direct exchange must include one.
5. Accepting a request updates the request and book in separate writes; concurrent accept attempts can race. At minimum, re-check current status and book availability before changing state; ideally use a MongoDB transaction if the deployment supports it.
6. Returning an exchange currently restores both books to available; confirm whether this is the intended exchange lifecycle. For a permanent exchange, return semantics may be incorrect.
7. Rejecting a request writes the rejection reason into the original message field. Prefer a separate rejectionReason field if the UI needs it.
8. The controller's auto-rejection uses `updateMany` for conflicting requests; verify its status and messaging behavior with the UI.

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
