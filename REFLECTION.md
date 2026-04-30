# Semester Reflection

## What Went Well

Building the humor flavor app end-to-end gave me a much stronger understanding of full-stack development with Next.js and Supabase. The prompt chain tool in particular — CRUD for flavors and ordered steps with reordering — forced me to think carefully about data modeling and how position-based ordering works with unique constraints. Getting RLS policies right so that only admins could access the humor tables was also a satisfying challenge. By the end, the app had real authentication, role-based access control, a working API integration, and a statistics dashboard, which felt like a complete product rather than a homework assignment.

## What I Enjoyed

I enjoyed the iterative feedback loop the most. Sharing the app with real users and hearing their reactions (both positive and critical) made the work feel purposeful. Seeing someone use the duplicate feature and say "the copy name pre-fill was smart" was a small but genuine moment of satisfaction. I also enjoyed the testing phase — writing out the full test plan and systematically going through every branch uncovered real bugs (like the open redirect vulnerability) that I would have missed otherwise. Finding and fixing those issues made the app meaningfully better.

## What I Did Not Enjoy

The most frustrating parts were debugging Supabase RLS policies and dealing with auth token refresh timing. RLS errors often returned empty arrays instead of explicit error messages, making it hard to tell whether a query was wrong or just unauthorized. I spent significant time on trial and error before I understood the pattern. Environment variable management across local, preview, and production deployments was also tedious — a missing `NEXT_PUBLIC_` prefix caused silent failures twice.

## Suggestion for Course Improvement

I would suggest adding a short module or workshop on **testing strategies for full-stack apps** early in the semester. Most of us learned testing by doing it at the end, but if we had been introduced to structured test plans (happy paths, edge cases, error states) in Week 3 or 4, we could have applied that thinking throughout the entire project instead of retroactively. Even a one-hour session showing how to write a test plan for a simple CRUD app would set the right habits early. It would also make the final testing deliverable less intimidating since students would already have a template to work from.
