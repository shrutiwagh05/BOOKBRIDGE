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
- Latest workflow run passed: https://github.com/shrutiwagh05/BOOKBRIDGE/actions/runs/39662363790
- Backend syntax check and backend unit tests passed.
- Isolated Render test service deployed backend commit `3999df2969073969ecfc0a507e1ec035a7009208` and reported a successful MongoDB connection.
- Vercel preview: https://bookbridge-client-git-rebuild-reliable-final-944dc4-shruti-a3dc.vercel.app/

## Manual verification
- User signed in to the preview and opened an existing outgoing exchange request for *Engineering Mathematics II*.
- User clicked **Mark Exchange Complete** and confirmed the status remained completed after refreshing the page.
- This verifies the exchange-completion UI/status persistence path in the preview.
- Borrow/return was not tested: the available existing listing on the second account was an Exchange Offer, and no Borrow listing was available. Do not claim borrow/return is end-to-end verified.

## Remaining verification / known caveats
- Borrow acceptance and return still need an existing Borrow listing to test in the isolated preview.
- Ownership transfer of both exchange books and competing-request auto-rejection should be checked if time permits; the manual completion check alone does not prove these database behaviors.
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
