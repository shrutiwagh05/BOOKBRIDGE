# Member 3 — Borrow / Lend / Exchange QA

Branch: `rebuild/reliable-final-submission`

## Implementation reviewed
- Backend routes: `server/src/routes/exchangeRoutes.js`
- Backend controller: `server/src/controllers/exchangeController.js`
- Request model: `server/src/models/ExchangeRequest.js`
- Frontend API wrapper: `client/src/services/exchangeService.js`

## Implemented
- Request creation derives the owner from the database listing and ignores browser-supplied owner IDs.
- Validates request type, listing type, IDs, duration (1–365 days), message type/length, and offered-book ownership/availability.
- Prevents requesting one's own book and duplicate active requests.
- Accepting a borrow request marks the book borrowed and sets a due date.
- Accepting an exchange uses a MongoDB transaction to update request state, transfer ownership of both books, and reject competing pending requests together.
- Returning a borrowed book uses a MongoDB transaction to restore book availability and update the request status atomically.
- Completing an exchange updates the request status without undoing the ownership transfer.
- Rejection notes are trimmed and bounded to avoid oversized input.

## Automated validation and deployment
- Backend fix commit: `3999df2969073969ecfc0a507e1ec035a7009208` (`fix: make borrow return lifecycle transactional`).
- CI workflow fix commit: `0531337dfedb40df2834dd4f36951a3388ef188a` (`ci: run backend checks on exchange PR target branch`).
- Latest workflow run passed: https://github.com/shrutiwagh05/BOOKBRIDGE/actions/runs/39664230301
- Backend syntax check and backend unit tests passed.
- Isolated Render test service deployed backend commit `3999df2969073969ecfc0a507e1ec035a7009208` and reported a successful MongoDB connection.
- Vercel preview: https://bookbridge-client-git-rebuild-reliable-final-944dc4-shruti-a3dc.vercel.app/

## Manual verification
- In the preview, user marked an existing exchange request for *Engineering Mathematics II* complete; the completed status persisted after refreshing.
- User created a temporary `Test Book – Borrow Flow` listing on the second account, submitted a borrow request from the first account, accepted it as the owner, and successfully marked the book returned as the borrower.
- These manual checks verify the user-facing exchange completion and borrow request/accept/return flows. They do not independently verify database ownership transfer for exchanges or auto-rejection of competing requests.

## Remaining verification / known caveats
- Exchange ownership transfer for both books and competing-request auto-rejection have not been independently verified in the live UI.
- Keep testing isolated from production accounts and production book records.

## Smoke-test checklist (isolated test data only)
- Own-book and unavailable-book requests are rejected.
- Valid borrow/exchange requests can be created.
- Duplicate pending requests are blocked.
- Only the listing owner can accept/reject; only the requester can cancel.
- Exchange acceptance transfers both books to the correct owners and leaves both available.
- Borrow acceptance marks the book borrowed; return marks it returned and available.
- Only transaction participants can complete/return eligible requests.
- State persists after refresh and both dashboards show consistent statuses.
- Invalid IDs and request types return clear validation errors.

Do not use production accounts or production book records for testing.
