# Test-Analyst Spec — Admin Panel & Supporting Infrastructure

**Audience:** Test analyst agent tasked with implementing test coverage for the admin panel feature and the common component improvements introduced in this session.

**Project:** Heat Seasons (TypeScript monorepo)  
**Test runners:** Jest 30 + Supertest (backend) · Vitest 4 + Testing Library + userEvent (frontend)  
**Date:** March 2026

---

## 0. How to read this document

Each section describes *one unit of work*, its observable contract, and the **exact test cases that must be written**. For every test case the following is specified:

- **What** is being tested  
- **Arrange** — test data / mock setup  
- **Act** — what to call  
- **Assert** — what the assertion must check  

Stub tests already exist in the repository with `expect(true).toBe(true)` bodies. The analyst must **replace those bodies** with real implementations and add any additional tests listed here that do not yet have a stub.

---

## 1. Backend — `AdminController` (`packages/backend/__tests__/unit/api/admin/admin.controller.test.ts`)

### Context

```
src/api/admin/admin.controller.ts
```

The controller is instantiated directly (no HTTP layer). `mockAuthService` and `mockRacerService` are already wired in `beforeEach`. The `request` fixture has `user: { id: "admin-1" }` simulating a decoded JWT.

### 1.1 `listUsers`

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 1 | returns 200 with array of users | `mockAuthService.getAllUsers.mockResolvedValue([userA, userB])` | `await adminController.listUsers(req, res, next)` | `res.status` called with `200`; `res.json` called with `{ success: true, data: [userA, userB], status: 200 }` |
| 2 | calls `next` with error when service throws | `mockAuthService.getAllUsers.mockRejectedValue(new Error("DB error"))` | same | `next` called with the error instance; `res.json` NOT called |

### 1.2 `promoteUser`

The method promotes a `user` → `contributor` by calling `authService.updateUserRole(userId, "contributor")`.

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 3 | returns 200 with updated user on success | `request.body = { userId: "user-2" }`, `mockAuthService.updateUserRole.mockResolvedValue(updatedUser)` | `await adminController.promoteUser(req, res, next)` | `res.status(200)`, `res.json` body has `success: true` and `data === updatedUser`; `updateUserRole` called with `("user-2", "contributor")` |
| 4 | returns 400 when `userId` is missing *(stub exists — implement it)* | `request.body = {}` | same | `res.status(400)`, `res.json` body has `success: false` and `message: "userId is required"` |
| 5 | returns 400 when admin promotes themselves *(stub exists — implement it)* | `request.body = { userId: "admin-1" }` (matches `req.user.id`) | same | `res.status(400)`, message `"Cannot promote yourself"` |
| 6 | calls `next` with error when service throws | `request.body = { userId: "user-2" }`, `mockAuthService.updateUserRole.mockRejectedValue(new Error("not found"))` | same | `next` called with error; `res.json` NOT called |

### 1.3 `demoteUser`

The method demotes `contributor` → `user` by calling `authService.updateUserRole(userId, "user")`.

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 7 | returns 200 with updated user on success | `request.body = { userId: "contrib-1" }`, resolved value | same call pattern | `res.status(200)`, `updateUserRole` called with `("contrib-1", "user")` |
| 8 | returns 400 when `userId` is missing | `request.body = {}` | same | `res.status(400)`, `message: "userId is required"` |
| 9 | returns 400 when admin demotes themselves | `request.body = { userId: "admin-1" }` | same | `res.status(400)`, `message: "Cannot demote yourself"` |
| 10 | calls `next` with error when service throws | resolved → rejected | same | `next` called with error |

### 1.4 `createRacer`

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 11 | returns 201 with created racer when all required fields present | `request.body = { name: "Lewis Hamilton", team: "Mercedes", teamColor: "#00D2BE", nationality: "British", age: 39 }`, `mockRacerService.create.mockResolvedValue(createdRacer)` | `await adminController.createRacer(req, res, next)` | `res.status(201)`, `res.json` body `{ success: true, data: createdRacer }`; `create` called with object containing all provided fields + `active: true` + `userId: null` |
| 12 | passes optional `userId` to `racerService.create` | same body + `userId: "user-5"` | same | `create` called with `userId: "user-5"` |
| 13 | passes `active: false` when explicitly provided | same body + `active: false` | same | `create` called with `active: false` |
| 14 | returns 400 when required field `name` is missing | `request.body = { team: "Mercedes", teamColor: "#00D2BE", nationality: "British", age: 39 }` | same | `res.status(400)`, message contains required fields list; `racerService.create` NOT called |
| 15 | returns 400 when required field `age` is missing | omit `age` | same | `res.status(400)` |
| 16 | calls `next` with error when service throws | complete body, `mockRacerService.create.mockRejectedValue(new Error("DB error"))` | same | `next` called with error |

---

## 2. Backend — `AuthService.upsertUser` (`packages/backend`)

### Context

```
src/api/auth/auth.service.ts
```

No unit test stub exists yet. Create a new file at `__tests__/unit/api/auth/auth.service.test.ts`.

The service calls `authRepository.findByGoogleId`, then either `authRepository.create` (new user) or `authRepository.update` (existing). All repository methods should be mocked.

### 2.1 Login tracking

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 1 | sets `lastLoginAt` on a **new** user | `findByGoogleId` resolves `null`; `create` returns a fabricated entity | `await authService.upsertUser(profile)` | `create` was called with an entity whose `lastLoginAt` is a `Date`; `loginCount` is `1` |
| 2 | sets `lastLoginAt` on a **returning** user | `findByGoogleId` resolves existing entity with `loginCount: 3`; `update` returns updated entity | same | `update` called with entity whose `loginCount` is `4` and `lastLoginAt` is a recent `Date` |
| 3 | preserves the existing `role` for a returning user | existing entity has `role: "contributor"` | same | `update` called with `role: "contributor"` |
| 4 | defaults `role` to `"user"` when existing entity `role` is falsy | existing entity has `role: undefined` | same | `update` called with `role: "user"` |

---

## 3. Frontend — `Button` component (`packages/frontend/__tests__/unit/components/common/Button.test.tsx`)

The existing tests must still pass. **Add** the following to the existing `describe` block:

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 8 | renders with `variant="none"` and applies no built-in class | `<Button type="button" variant="none">X</Button>` | render | button element has no class containing `btn__`; previous `className` from other variant tests should NOT appear |
| 9 | passes through arbitrary HTML attributes (`aria-selected`, `data-testid`) | `<Button type="button" aria-selected={true} data-testid="my-btn">X</Button>` | render | `screen.getByTestId("my-btn")` has `aria-selected="true"` |
| 10 | does NOT have a hard-coded `role="button"` attribute | render default button | render | element returned by `screen.getByRole("button")` does **not** have an explicit `role` attribute (i.e. `getAttribute("role")` returns `null`) |

---

## 4. Frontend — `FormGroup` component (`packages/frontend/__tests__/unit/components/common/FormGroup.test.tsx`)

The existing tests must still pass. **Add** the following to the existing `describe` block:

### 4.1 `required` prop

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 9 | renders asterisk next to label when `required={true}` | `element="input"`, `required={true}` | render | element with `aria-hidden="true"` containing `*` is present alongside label text |
| 10 | passes `required` attribute to the underlying `<input>` | same | render | `screen.getByRole("textbox")` has attribute `required` |
| 11 | passes `aria-required="true"` to the input | same | render | input has `aria-required="true"` |
| 12 | does NOT render asterisk when `required` is omitted | `element="input"`, no `required` | render | no element with `*` text present |

### 4.2 `error` prop

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 13 | renders error message below input | `element="input"`, `error="This field is required"`, `id="fname"` | render | `screen.getByText("This field is required")` in the DOM |
| 14 | sets `aria-invalid="true"` on the input when `error` is provided | same | render | `screen.getByRole("textbox")` has `aria-invalid="true"` |
| 15 | does NOT set `aria-invalid` when no `error` | `element="input"`, no `error` | render | input does NOT have `aria-invalid` attribute |
| 16 | links input to error via `aria-describedby` | `id="fname"`, `error="…"` | render | input `aria-describedby` attribute includes `"fname-error"`; error span has `id="fname-error"` |
| 17 | error span has `role="alert"` | same | render | error element has `role="alert"` |

### 4.3 `hint` prop

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 18 | renders hint text below the label | `hint="Must be at least 2 characters"` | render | hint text present |
| 19 | links input to hint via `aria-describedby` | `id="fname"`, `hint="…"` | render | input `aria-describedby` includes `"fname-hint"` |
| 20 | when both `error` and `hint` are present, `aria-describedby` contains both IDs | `id="fname"`, `hint="…"`, `error="…"` | render | input `aria-describedby` equals `"fname-hint fname-error"` |

### 4.4 `name` prop

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 21 | uses `name` prop as the input `name` attribute when provided | `id="racer-name"`, `name="name"` | render | input has `name="name"` (NOT `name="racer-name"`) |
| 22 | falls back to `id` for `name` when `name` prop is omitted | `id="racer-name"`, no `name` | render | input has `name="racer-name"` |

### 4.5 `min` / `max` props

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 23 | forwards `min` and `max` to number input | `type="number"`, `min={16}`, `max={80}` | render | `screen.getByRole("spinbutton")` has `min="16"` and `max="80"` |

### 4.6 `textarea` case

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 24 | `textarea` element receives `aria-invalid` when `error` is provided | `element="textarea"`, `error="…"` | render | `screen.getByRole("textbox")` has `aria-invalid="true"` |

---

## 5. Frontend — `Tabs` component (`packages/frontend/__tests__/unit/components/common/Tabs.test.tsx`)

All 5 existing stubs must pass (they test labels, aria-selected, onTabChange, and tablist role). The following **additional** tests are required:

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 6 | each tab button is rendered as a `<button>` element (not `<div>`) | 3-tab fixture | render | all `getByRole("tab")` queries return elements with `tagName === "BUTTON"` |
| 7 | active tab has correct `aria-controls` pointing to panel | `activeTab="b"`, tab id `"b"` | render | active tab button `aria-controls === "tabpanel-b"` |
| 8 | active tab has correct `id` for panel `aria-labelledby` | same | render | active tab button `id === "tab-b"` |
| 9 | inactive tab `aria-selected` is the string `"false"` not a missing attribute | `activeTab="a"` | render | Tab B button `getAttribute("aria-selected") === "false"` (attribute is present and equals `"false"`, not absent) |
| 10 | does not call `onTabChange` when the already-active tab is clicked | `activeTab="a"`, `onTabChange` mock | click Tab A | `onTabChange` still fires (no suppression — this is a deliberate absence test, verify current behaviour) |

---

## 6. Frontend — `UserManagementTab` (`packages/frontend/__tests__/unit/components/features/admin/UserManagementTab.test.tsx`)

All existing stubs. Mock setup: `vi.mock("src/services/api/admin")` is already in place.

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 1 | renders loading skeleton while users are fetching | `mockAdminApi.adminListUsers.mockReturnValue(new Promise(() => {}))` (never resolves) | render | `screen.getByTestId("user-mgmt-loading")` present |
| 2 | renders user rows once API resolves | `adminListUsers` resolves with `[{ id:"1", name:"Alice", email:"a@b.com", role:"user", loginCount:0 }]` | render + `waitFor` | cell with text `"Alice"` and `"a@b.com"` present |
| 3 | shows Promote button only for `role="user"` users | two users: one `role:"user"`, one `role:"contributor"` | render + wait | exactly one "Promote" button in the row for the `user`-role entry |
| 4 | shows Demote button only for `role="contributor"` users | same fixture | render + wait | exactly one "Demote" button in the row for the `contributor`-role entry |
| 5 | shows "Admin" badge text (no action buttons) for `role="admin"` users | one user with `role:"admin"` | render + wait | no Promote or Demote button for that row; text "Admin" present |
| 6 | calls `adminPromoteUser` with the correct userId when Promote is clicked | `adminPromoteUser` mocked to resolve updated user | click the Promote button | `adminPromoteUser` called with `"1"` |
| 7 | calls `adminDemoteUser` with the correct userId when Demote is clicked | `adminDemoteUser` mocked to resolve updated user | click the Demote button | `adminDemoteUser` called with contributor user id |
| 8 | re-fetches users when Refresh button is clicked | `adminListUsers` already resolved; click Refresh | click "Refresh" button | `adminListUsers` called a second time |
| 9 | shows error message when `adminListUsers` rejects | `adminListUsers.mockRejectedValue(new Error("Network error"))` | render + wait | text `"Failed to load users."` present |
| 10 | update buttons are disabled while an update is in-flight | `adminPromoteUser` returns a pending promise | click Promote; before it resolves | the Promote button is `disabled` |

---

## 7. Frontend — `RacerManagementTab` (`packages/frontend/__tests__/unit/components/features/admin/RacerManagementTab.test.tsx`)

### 7.1 Rendering

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 1 | renders heading, subtitle, and form fields | `adminListUsers` resolves `[]` | render | heading "Create Racer", all six `FormGroup` labels visible (Name, Nationality, Team, Team Colour, Age, Badge URL) |
| 2 | renders the Create Racer submit button and Reset ghost button | same | render | two buttons: one `type="submit"` with text "Create Racer", one `type="button"` with text "Reset" |

### 7.2 Validation — no submission, error toast appears

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 3 | shows validation error toast when form is submitted empty | `adminCreateRacer` mock present | click "Create Racer" without filling fields | toast with `title="Please fix the following errors"` is visible; `adminCreateRacer` is NOT called |
| 4 | shows per-field error below Name input when Name is blank | submit empty | inspect DOM | element associated with the Name input via `aria-describedby` contains "Racer name is required." |
| 5 | clears per-field error for Name when user types into it | submit empty → type into Name | check after typing | name error element is removed from DOM |
| 6 | shows age error for value outside 16–80 | fill all other required fields; set age to `10` | submit | error containing "Age must be between 16 and 80" is present |
| 7 | shows badge URL error for invalid URL | fill all required fields; set badge URL to `"not-a-url"` | submit | badge URL per-field error present; `adminCreateRacer` NOT called |
| 8 | accepts a valid badge URL without error | fill required fields + `badgeUrl="https://cdn.example.com/img.png"` | submit | `adminCreateRacer` called; no badge URL error |

### 7.3 Successful submission

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 9 | calls `adminCreateRacer` with trimmed values | fill all required fields including leading/trailing whitespace in name | submit | `adminCreateRacer` called (whitespace is in payload — trimming happens on optional fields like badgeUrl/userId) |
| 10 | shows success toast after successful submission | `adminCreateRacer` resolves `{ name: "Lewis Hamilton", ... }` | fill + submit | toast with `title="Racer created"` and message containing `"Lewis Hamilton"` |
| 11 | resets all fields after successful submission | same | after success toast appears | Name input value is `""` (empty string — back to EMPTY_FORM) |

### 7.4 Submit-level error

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 12 | shows error toast with API error message when `adminCreateRacer` rejects | fill valid form; `adminCreateRacer.mockRejectedValue(new Error("Conflict"))` | submit | toast with `title="Failed to create racer"` and message `"Conflict"` |

### 7.5 Reset button

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 13 | resets all inputs and clears field errors | fill name; submit blank form (errors appear); click Reset | check | Name input is `""`; error elements not present |

---

## 8. Frontend — `AnalyticsTab` (`packages/frontend/__tests__/unit/components/features/admin/AnalyticsTab.test.tsx`)

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 1 | renders loading skeleton while fetching | `adminListUsers` never resolves | render | `screen.getByTestId("analytics-loading")` present |
| 2 | renders all five stat-label texts after load | `adminListUsers` resolves `[userA, userB]` | render + wait | labels "Total Players", "Total Logins", "Active Today", "Active (7 days)", "Never Logged In" present |
| 3 | `Total Players` stat equals the number of users returned | 3 users | render + wait | stat value `3` adjacent to label "Total Players" |
| 4 | `Total Logins` is the sum of all users' `loginCount` | users with loginCount 4, 2, 1 | render + wait | stat value `7` adjacent to "Total Logins" |
| 5 | `Never Logged In` counts users where `lastLoginAt` is absent | 2 users without `lastLoginAt`, 1 with | render + wait | stat value `2` adjacent to "Never Logged In" |
| 6 | renders role breakdown: one card per distinct role | users: 2 admins, 1 user | render + wait | "admin" card with count `2`; "user" card with count `1` |
| 7 | lists top-5 users by `loginCount` in descending order | 6 users with varied loginCounts | render + wait | users appear in correct order; 6th user not present |
| 8 | shows "Failed to load analytics data." when API rejects | `adminListUsers.mockRejectedValue(…)` | render + wait | error text visible |

---

## 9. Frontend — `AdminPage` integration (`packages/frontend/__tests__/integration/pages/AdminPage.test.tsx`)

Render setup: wrap in `<MemoryRouter initialEntries={["/admin"]}>`. Mock `useAuth` via existing `createMockAuthContext`. Mock the entire `src/services/api/admin` module.

| # | Test name | Arrange | Act | Assert |
|---|-----------|---------|-----|--------|
| 1 | renders admin panel heading for admin user | `useAuth` returns `{ user: adminUser, isLoading: false }` | render | heading "Admin Panel" present |
| 2 | redirects non-admin users | `useAuth` returns `{ user: regularUser, isLoading: false }` | render | "Admin Panel" NOT in document |
| 3 | renders three tabs (User Management, Racer Management, Analytics) | admin user | render | all three tab labels present with `role="tab"` |
| 4 | defaults to the User Management tab on load | admin user | render | "User Management" tab `aria-selected="true"`; Racer Management and Analytics `aria-selected="false"` |
| 5 | switches to Racer Management when that tab is clicked | admin user | click "Racer Management" tab | "Create Racer" heading becomes visible (confirming tab content rendered); "Racer Management" `aria-selected="true"` |
| 6 | switches to Analytics when that tab is clicked | admin user | click "Analytics" tab | "Login Analytics" heading visible |
| 7 | "Back to Profile" button navigates to `/profile` | admin user | click button | router `location.pathname` is `/profile` (use `MemoryRouter` + capture navigate) |

---

## 10. Frontend — `Toast` additional tests (`packages/frontend/__tests__/unit/components/common/Toast.test.tsx`)

The existing 8 tests cover close button and type classes. **Add:**

| # | Test name | Assert |
|---|-----------|--------|
| 9 | close button is a `<button>` element | `getByRole("button", { name: /close/i })` returns element with `tagName === "BUTTON"` |
| 10 | close button does NOT carry the `role="button"` explicit attribute | same element `getAttribute("role")` is `null` |

---

## 11. Frontend — `Modal` additional tests (`packages/frontend/__tests__/unit/components/common/Modal.test.tsx`)

Existing 5 tests cover open/close/overlay. **Add:**

| # | Test name | Assert |
|---|-----------|--------|
| 6 | close button has `aria-label="Close"` | `getByRole("button", { name: /close/i })` present (confirms accessible name comes from `aria-label`) |
| 7 | close button is a `<button>` element | same element `tagName === "BUTTON"` |

---

## Appendix A — Fixture helpers

All test files should import from the shared fixture factory at `__tests__/utils/fixtures/` where user and racer fixtures already exist. For these tests, extend the factory or use inline objects:

```ts
// Minimal AdminUser fixture
const makeAdminUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  role: "user",
  loginCount: 0,
  lastLoginAt: undefined,
  googleId: "google-1",
  profilePicture: null,
  racerId: null,
  ...overrides,
});
```

---

## Appendix B — File locations

| Subject | Test file path |
|---------|---------------|
| AdminController | `packages/backend/__tests__/unit/api/admin/admin.controller.test.ts` |
| AuthService (new) | `packages/backend/__tests__/unit/api/auth/auth.service.test.ts` |
| Button | `packages/frontend/__tests__/unit/components/common/Button.test.tsx` |
| FormGroup | `packages/frontend/__tests__/unit/components/common/FormGroup.test.tsx` |
| Tabs | `packages/frontend/__tests__/unit/components/common/Tabs.test.tsx` |
| UserManagementTab | `packages/frontend/__tests__/unit/components/features/admin/UserManagementTab.test.tsx` |
| RacerManagementTab | `packages/frontend/__tests__/unit/components/features/admin/RacerManagementTab.test.tsx` |
| AnalyticsTab | `packages/frontend/__tests__/unit/components/features/admin/AnalyticsTab.test.tsx` |
| AdminPage (integration) | `packages/frontend/__tests__/integration/pages/AdminPage.test.tsx` |
| Toast | `packages/frontend/__tests__/unit/components/common/Toast.test.tsx` |
| Modal | `packages/frontend/__tests__/unit/components/common/Modal.test.tsx` |

---

## Appendix C — Key contracts (for mock precision)

### `IAuthService` methods used by `AdminController`
```ts
getAllUsers(): Promise<UserResponse[]>
updateUserRole(userId: string, role: UserRole): Promise<UserResponse>
```

### `IRacerService` methods used by `AdminController`
```ts
create(input: { name: string; team: string; teamColor: string; nationality: string; age: number; active: boolean; userId: string | null; badgeUrl?: string }): Promise<Racer>
```

### Admin API service (frontend) — `src/services/api/admin.ts`
```ts
adminListUsers(): Promise<AdminUser[]>
adminPromoteUser(userId: string): Promise<AdminUser>
adminDemoteUser(userId: string): Promise<AdminUser>
adminCreateRacer(data: AdminCreateRacerInput): Promise<Racer>
```

### `AdminCreateRacerInput`
```ts
{
  name: string;        // required, min 2 chars
  team: string;        // required, min 2 chars
  teamColor: string;   // required, hex colour string
  nationality: string; // required, min 2 chars
  age: number;         // required, 16–80 inclusive
  active?: boolean;    // default true
  badgeUrl?: string;   // optional, must be valid URL when provided
  userId?: string;     // optional, assigns racer to a player account
}
```

### Validation rules (client-side, in `RacerManagementTab`)
| Field | Rule | Error message |
|-------|------|---------------|
| name | non-empty, length ≥ 2 | "Racer name is required." / "Name must be at least 2 characters." |
| nationality | non-empty, length ≥ 2 | "Nationality is required." / "Nationality must be at least 2 characters." |
| team | non-empty, length ≥ 2 | "Team name is required." / "Team must be at least 2 characters." |
| age | number, 16 ≤ age ≤ 80 | "Age must be between 16 and 80." |
| badgeUrl | valid URL (via `new URL()`), only checked if non-empty | "Badge URL must be a valid URL (e.g. https://...)." |
