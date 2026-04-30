# Test Plan — Humor Prompt Chain Tool

This application is a single Next.js 16 app with three logical "project" areas:

1. **Project 1 — Caption Creation & Rating App**: Generate captions via AlmostCrackd API, review results, view success/error statistics
2. **Project 2 — Admin Area App**: Authentication, role-based access (superadmin/matrix admin), protected routes
3. **Project 3 — Prompt Chain Tool App**: CRUD for humor flavors and ordered prompt steps

---

## Project 1: Caption Creation & Rating (AlmostCrackd Integration)

### Branch 1.1 — Run Caption Test (Happy Path)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to a flavor detail page (`/flavors/[id]`) | Page loads with "Test with image set" panel |
| 2 | Select a test image from the dropdown | Image preview updates below the dropdown |
| 3 | Click "Generate captions" | Button shows "Calling API…", disables during request |
| 4 | Wait for API response (success) | Green success message: "Caption run completed. Scroll to caption runs." |
| 5 | Scroll to "Caption runs for this flavor" section | New run appears at top with timestamp, image link, and caption text |

### Branch 1.2 — Run Caption Test (API Error)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Configure `ALMOSTCRACKD_GENERATE_CAPTIONS_URL` to an invalid/down endpoint | — |
| 2 | Click "Generate captions" | Red error message appears with API error details |
| 3 | Check "Caption runs" section | Error run logged with red error text |

### Branch 1.3 — Run Caption Test (Missing Env Var)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Remove `ALMOSTCRACKD_GENERATE_CAPTIONS_URL` from env | — |
| 2 | Click "Generate captions" | Error message: "Set ALMOSTCRACKD_GENERATE_CAPTIONS_URL…" |

### Branch 1.4 — Statistics Page
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/flavors/stats` | Page loads with aggregate metrics |
| 2 | Verify summary cards | Total runs, Successful, Errors, Success rate displayed |
| 3 | Verify time-based cards | Runs (last 24h), Runs (last 7d), Unique images tested |
| 4 | Verify bar chart | "Runs per flavor" chart shows horizontal stacked bars (green = success, red = error) with legend |
| 5 | Verify bar proportions | Flavor with most runs has full-width bar; others proportional |
| 6 | Verify per-flavor table | "Detailed breakdown" table with columns: Flavor, Total, Success, Errors, Rate |
| 7 | Verify recent runs list | Last 20 runs with status badges (Success/Error) |
| 8 | Click a flavor name in chart or table | Navigates to that flavor's detail page |

### Branch 1.5 — Statistics Empty State
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | View stats with no caption runs | All cards show 0, "No runs yet" messages |

### Branch 1.6 — Test Image Selection
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open test panel on any flavor | Default image is "Mountain lake" |
| 2 | Switch between all 5 images | Preview updates for each (Mountain lake, City street, Coffee still life, Dog portrait, Workspace) |

---

## Project 2: Admin Area (Authentication & Authorization)

### Branch 2.1 — Email/Password Login (Happy Path)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/login` | Login form renders with email, password fields |
| 2 | Enter valid admin credentials | — |
| 3 | Click "Sign in" | Button shows "Signing in…", redirects to `/flavors` |

### Branch 2.2 — Email/Password Login (Invalid Credentials)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter invalid email/password | — |
| 2 | Click "Sign in" | Red error message: "Invalid login credentials" |
| 3 | Verify form stays on login page | Email/password fields remain, can retry |

### Branch 2.3 — Google OAuth Login
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Sign in with Google" | Button disables, redirects to Google OAuth |
| 2 | Complete Google auth | Redirects to `/auth/callback`, then to `/flavors` |

### Branch 2.4 — OAuth Callback Error
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/auth/callback` without a code | Redirects to `/login?error=auth` |
| 2 | Check login page | Error message displayed |

### Branch 2.5 — Protected Route (Unauthenticated)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear cookies / sign out | — |
| 2 | Navigate to `/flavors` | 307 redirect to `/login?next=%2Fflavors` |
| 3 | Navigate to `/flavors/stats` | 307 redirect to `/login?next=%2Fflavors%2Fstats` |
| 4 | Navigate to `/flavors/[valid-id]` | 307 redirect to `/login` |

### Branch 2.6 — Protected Route (Non-Admin User)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Sign in as user without `is_superadmin` or `is_matrix_admin` | — |
| 2 | Navigate to `/flavors` | Redirects to `/unauthorized` |
| 3 | Check unauthorized page | Shows "Access denied" with explanation about profiles flags |
| 4 | Click "Return to sign in" | Navigates to `/login` |

### Branch 2.7 — Sign Out
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | While authenticated, click "Sign out" in header | Button shows "Signing out…" |
| 2 | Verify redirect | Redirects to `/login` |
| 3 | Try navigating to `/flavors` | Redirects to `/login` (session cleared) |

### Branch 2.8 — Missing Env Vars
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Remove `NEXT_PUBLIC_SUPABASE_URL` from env | — |
| 2 | Navigate to `/login` | Warning: "Copy .env.example to .env.local and add your Supabase keys" |
| 3 | Try signing in | Error: "Supabase environment variables are not configured" |

### Branch 2.9 — Open Redirect Prevention
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/login?next=https://evil.com` | Login page loads normally |
| 2 | Sign in | Redirects to `/flavors` (not to evil.com) |
| 3 | Navigate to `/login?next=//evil.com` | Login page loads normally |
| 4 | Sign in | Redirects to `/flavors` (not to evil.com) |

---

## Project 3: Prompt Chain Tool (Humor Flavors & Steps CRUD)

### Branch 3.0 — Flavor List Run Statistics
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/flavors` with flavors that have caption runs | Each flavor card shows "X runs · Y% success" |
| 2 | Check a flavor with no runs | Shows "No runs yet" in muted text |
| 3 | Check color coding: flavor with ≥80% success | Rate text is green |
| 4 | Check color coding: flavor with 50–79% success | Rate text is amber |
| 5 | Check color coding: flavor with <50% success | Rate text is red |
| 6 | Generate a new caption run, return to `/flavors` | Run count and rate update to reflect new data |

### Branch 3.1 — Create Flavor (Happy Path)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/flavors` | "New humor flavor" form visible |
| 2 | Enter name "Test Flavor" and optional description | — |
| 3 | Click "Create and open" | Button shows "Creating…", redirects to new flavor detail |
| 4 | Verify new flavor appears in "All flavors" list | Name and description shown |

### Branch 3.2 — Create Flavor (Validation Error)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Leave name empty, click "Create and open" | Browser native validation prevents submit (required field) |
| 2 | Submit empty name via developer tools | Server returns "Name is required." inline error |

### Branch 3.3 — Edit Flavor
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open flavor detail page | "Edit flavor" form pre-filled with current name/description |
| 2 | Change name and description | — |
| 3 | Click "Save flavor" | Button shows "Saving…", then "Flavor saved." success message |
| 4 | Verify changes in "All flavors" list | Updated name shown |

### Branch 3.4 — Edit Flavor (Error Handling)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear name field and submit | Red error message displayed inline |
| 2 | Form stays editable, user can fix and retry | — |

### Branch 3.5 — Delete Flavor
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Delete" on a flavor | Confirmation dialog: "Delete this humor flavor and all of its steps?" |
| 2 | Click "Cancel" | Nothing happens |
| 3 | Click "OK" | Button shows "Deleting…", redirects to `/flavors`, flavor removed from list |

### Branch 3.6 — Duplicate Flavor
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Duplicate" on a flavor detail page | Modal opens with pre-filled name "[Name] (copy)" |
| 2 | Change name and click "Duplicate" | Shows "Duplicating…", redirects to new flavor with copied steps |
| 3 | Click outside modal or press Escape | Modal closes |
| 4 | Try duplicate with existing name | Error: 'A flavor named "[name]" already exists' |

### Branch 3.7 — Add Step (Happy Path)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On flavor detail, fill "Add step" form with title and prompt | — |
| 2 | Click "Add step" | Button shows "Adding…", new step appears in ordered list |
| 3 | Form resets after successful add | Title and prompt fields cleared |

### Branch 3.8 — Add Step (Validation)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Leave prompt empty, submit | Browser validation prevents (required field) |
| 2 | Submit empty prompt via dev tools | Red error: "Step prompt is required." |

### Branch 3.9 — Edit Step
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Edit" on a step | Inline form opens with title and prompt fields |
| 2 | Modify prompt, click "Save step" | Form closes, step updated in list |
| 3 | Click "Close" without saving | Form closes, no changes made |

### Branch 3.10 — Delete Step
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Delete" on a step | Confirmation dialog |
| 2 | Confirm | Step removed, remaining steps reordered |

### Branch 3.11 — Reorder Steps (Move Up/Down)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With 3+ steps, click "Down" on Step 1 | Step 1 and Step 2 swap positions |
| 2 | Click "Up" on the last step | Last and second-to-last swap |
| 3 | Click "Up" on Step 1 | Button disabled (already first) |
| 4 | Click "Down" on last step | Button disabled (already last) |

### Branch 3.12 — Flavor Not Found
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to `/flavors/nonexistent-uuid` | "Flavor not found" page with "Back to all flavors" link |

### Branch 3.13 — Flavors List Empty State
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Delete all flavors | "No flavors yet. Create one above." message |

### Branch 3.14 — Steps Empty State
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | View flavor with no steps | "No steps yet. Add the first one below." message |

---

## Cross-Cutting Concerns

### Branch C.1 — Theme Toggle
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Use theme dropdown on any page | Options: System, Light, Dark |
| 2 | Switch to Dark | Background changes to dark, text to light |
| 3 | Switch to Light | Background changes to light, text to dark |
| 4 | Refresh page | Theme persists (stored in localStorage) |

### Branch C.2 — Navigation
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | From `/flavors`, click "Statistics" in header | Navigate to `/flavors/stats` |
| 2 | From `/flavors/stats`, click "← All flavors" | Navigate to `/flavors` |
| 3 | From flavor detail, click "← All flavors" | Navigate to `/flavors` |
| 4 | From `/flavors`, click "Home" in header | Navigate to `/` |

### Branch C.3 — Responsive Design
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | View all pages at mobile width (375px) | Layout adapts, no horizontal scroll |
| 2 | View all pages at tablet width (768px) | Grid columns adjust appropriately |
| 3 | View all pages at desktop width (1280px) | Content centered, max-width applied |

### Branch C.4 — RLS (Row Level Security)
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Admin user can CRUD flavors, steps, runs | All operations succeed |
| 2 | Non-admin user cannot read humor tables | Supabase returns empty or error |
| 3 | Unauthenticated requests cannot access humor tables | Supabase returns empty or error |

---

## Post-Testing Write-Up

### What We Tested (3 rounds of full workflow testing)

1. **All page renders and HTTP status codes**: Verified `/` (200), `/login` (200), `/unauthorized` (200), `/flavors` (307 redirect when unauthenticated), `/flavors/stats` (307 redirect), `/auth/callback` (307 redirect to login with error=auth when no code provided). All pages render the correct HTML content with expected headings, form fields, and links.

2. **Authentication redirects and admin gating**: Confirmed the proxy middleware and `requireAdmin()` in the flavors layout correctly redirect unauthenticated users to `/login?next=<path>` and non-admin users to `/unauthorized`. Verified the auth callback route properly handles missing OAuth codes by redirecting to `/login?error=auth`.

3. **Full production build verification**: Ran `next build` successfully with zero TypeScript errors and all 9 routes (7 pages + 1 API route + 1 not-found) generated correctly. Verified both static (/, /login, /unauthorized) and dynamic (/flavors, /flavors/[id], /flavors/stats) routes compile.

4. **ESLint source code audit**: Ran ESLint on `src/` with zero errors or warnings. All source files are clean.

5. **Deep code review of all server actions**: Audited `createFlavor`, `updateFlavor`, `deleteFlavor`, `createStep`, `updateStep`, `deleteStep`, `moveStep`, `duplicateFlavor`, and `runCaptionTest` for error handling, validation, race conditions, and redirect behavior.

6. **Client component review**: Audited all 8 client components for loading states, error handling, form reset behavior, accessibility, and state management.

7. **Statistics dashboard visualization**: Verified the bar chart renders correctly with proportional bars, success/error color split, legend, and clickable flavor names. Confirmed empty state ("No data yet") renders when no runs exist.

8. **Per-flavor list metrics**: Verified the flavor list page displays run count and color-coded success rate for each flavor. Confirmed "No runs yet" appears for untested flavors, and that color thresholds (green ≥80%, amber ≥50%, red <50%) apply correctly.

### Issues Found and Fixed

1. **Edit flavor and Add step forms had no client-side error handling** — Server actions that threw errors would crash the page with an unhandled error boundary instead of showing inline error messages. Fixed by extracting these into new `EditFlavorForm` and `AddStepForm` client components with `useTransition` and try/catch error handling. The edit form now shows inline success ("Flavor saved.") and error messages, and the add step form resets after successful submission.

2. **Delete flavor button had no pending/disabled state** — Users could double-click the delete button, potentially triggering multiple delete requests. Fixed by adding `useTransition` to the `DeleteFlavorButton` component with a disabled state showing "Deleting…" during the operation.

3. **Open redirect vulnerability on the login page** — The `next` query parameter from the URL was used directly in `router.replace(next)` without validation, allowing crafted URLs like `?next=https://evil.com` to redirect users to external sites after login. Fixed by sanitizing the `next` parameter to only allow paths starting with `/` (and rejecting `//` protocol-relative URLs).

4. **Google OAuth button had no disabled state** — Users could double-click the Google sign-in button, potentially triggering multiple OAuth flows. Fixed by adding a `googlePending` state that disables the button after the first click.

5. **Flavor detail page treated all DB query errors as 404** — Both genuine "not found" cases and transient database errors (network issues, RLS failures) resulted in the same "Flavor not found" page, making it impossible to distinguish between the two during debugging. Fixed by separating the error handling: DB errors now show an inline red error message with the error details, while only a null result (genuine not-found) triggers the 404 page.

6. **RunTestPanel success detection was brittle** — Success/error styling was determined by checking `message.includes("completed")`, which would break if the success message wording changed. Fixed by introducing a separate `isSuccess` boolean state variable to track the result status independently of the message text.

7. **Duplicate flavor modal lacked accessibility attributes** — The modal overlay had no `role="dialog"`, `aria-modal`, or `aria-labelledby` attributes, and couldn't be dismissed by clicking outside or pressing Escape. Fixed by adding proper ARIA attributes, click-outside-to-close, and Escape key handling.

### Improvements from User Feedback (see FEEDBACK_SUMMARY.md)

8. **Statistics page had no visual chart** — Feedback from testers indicated the stats page was hard to scan as a "wall of numbers." Added a horizontal stacked bar chart to `/flavors/stats` showing relative run volume per flavor with success/error color coding.

9. **Flavor list showed no testing status** — Testers couldn't tell which flavors had been tested without clicking into each one. Added per-flavor run count and success rate to the `/flavors` list view.

10. **No visual warning for error-prone flavors** — Tester feedback requested health indicators. Added color-coded success rate text (green/amber/red) to the flavor list so admins can spot broken prompt chains immediately.

### Improvement from Database Data (see FEEDBACK_SUMMARY.md)

11. **Success rate variance across flavors was hidden** — Querying `humor_caption_runs` grouped by `flavor_id` revealed some flavors had >90% success while others were below 40%, but this was only visible on the stats page. Surfaced per-flavor metrics on the primary `/flavors` list and added the bar chart visualization for side-by-side comparison.
