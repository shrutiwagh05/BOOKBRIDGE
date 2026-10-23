# BookBridge Reliable Final Submission — Recovery Plan

## Safety rules
- This branch is isolated: `rebuild/reliable-final-submission`.
- Do not merge to production or change the existing Render production service.
- Do not migrate, overwrite, or delete any MongoDB data.
- Keep the current application and deployment as a rollback reference.
- Never commit secrets, environment files, real passwords, tokens, or database URIs.

## Goal
Deliver a reliable final-submission build for the existing BookBridge concept: student registration/login, browse books, list a book, book details, and borrow/lend/exchange. Preserve the existing Paper & Ink visual direction where practical.

## Phase 1 — Establish a reproducible baseline
1. Inspect frontend routes, API base URL, authentication context, registration form, book service, and backend route/controller/model code.
2. Record existing deployments and configuration without printing secret values.
3. Run client build and available checks. Add a documented smoke-test checklist.
4. Confirm the test service's configured database is the intended isolated test database; do not query or alter production data.

## Phase 2 — Fix authentication before adding features
1. Verify registration request shape and server response shape.
2. Verify password hashing and login comparison with an automated test using a disposable local/test database.
3. Add tests for registration success, duplicate email, login success/failure, and current-user token validation.
4. Make error responses actionable without revealing whether a real user's email exists.
5. Deploy only to an isolated preview/test service and verify the full flow.

## Phase 3 — Core book flow
1. Verify GET books response shape and empty-state UI.
2. Verify authenticated create-book request, validation, persistence, and visibility in Browse Books.
3. Test book details and basic search/filter behavior.
4. Use only clearly labeled test records in the isolated test database; do not copy production records.

## Phase 4 — Integration and final QA
1. Run frontend production build and backend tests.
2. Smoke-test register → login → add book → browse/detail → logout/login.
3. Check responsive layout, loading states, empty states, and user-facing errors.
4. Document environment variables by name only, deployment steps, known limitations, and demo steps.
5. Open a review PR from this branch only after the checks pass. Do not merge it without explicit approval.

## Acceptance criteria
- A new test user can register and log in on the isolated preview.
- Wrong credentials are rejected; valid credentials work consistently.
- A test user can create a book and see it in Browse Books after refresh.
- Existing production service and production data remain unchanged.
- Build and smoke-test results are recorded honestly; no feature is marked verified without a successful test.
