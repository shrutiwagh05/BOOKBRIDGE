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
- Completing an exchange does not undo the ownership transfer.
- Returning a borrowed book marks it returned and restores availability.

## Automated validation
- GitHub Actions backend syntax check and unit tests: passed on commit `027e16d41ab407d2dff10d039363fd25bcc90bf6`.
- Backend unit tests: 9 passed, 0 failed.
- Frontend production build: passed in the CI run for the exchange UI changes.
- Isolated Render backend: latest commit deployed and MongoDB connection succeeded.
- Vercel preview: deployment READY and page responds HTTP 200.

## Remaining verification / known caveats
- A full authenticated end-to-end API/database smoke test has not been independently verified after the latest deployment. Do not claim that it passed.
- Return/borrow lifecycle writes are not yet wrapped in a MongoDB transaction; consider this hardening before production use.
- Rejection reason is currently appended to the original message field.
- Confirm that auto-rejected competing requests display the expected status/message in the UI.

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
