# Feedback Summary — Humor Flavor App

## User Feedback (3 Testers)

### Tester 1 — Alex R.
- **How they tested**: Used the caption ranking app on a laptop (Chrome) to rate captions across two different humor flavors.
- **Feedback**: "The stats page is kind of overwhelming — it's a wall of numbers. I wish there was a chart or something so I could compare flavors at a glance instead of reading every row in the table."
- **Additional note**: Also mentioned that the dark mode toggle was a nice touch.

### Tester 2 — Maria L.
- **How they tested**: Opened the flavor list on her phone (Safari) and tried creating a flavor, adding steps, and generating captions.
- **Feedback**: "On the main flavors list I can't tell which ones have already been tested and which ones haven't. I ended up clicking into every single flavor just to see if it had runs. Would be great if the list showed that info."
- **Additional note**: Found the duplicate feature intuitive — "the copy name pre-fill was smart."

### Tester 3 — James K.
- **How they tested**: Tested the admin login flow, created a duplicate flavor, and ran captions on three different test images.
- **Feedback**: "When a flavor keeps erroring, there's no visual warning on the list page. I had to go into the flavor detail or stats page to realize one of my flavors was broken. Some kind of health indicator on the list would help."
- **Additional note**: Appreciated the confirmation dialogs on delete — "I almost deleted the wrong one but the confirm dialog saved me."

---

## App Improvements from User Feedback

### 1. Added bar chart visualization to statistics dashboard
**Driven by**: Tester 1's feedback about the stats page being a "wall of numbers."
**Change**: Added a horizontal stacked bar chart to `/flavors/stats` that visually compares run volume and success/error ratio across flavors. Each bar is proportional to total runs and color-split into green (success) and red (error) segments, with a legend below.
**Visible at**: `/flavors/stats` → "Runs per flavor" section.

### 2. Added per-flavor run stats to the flavor list
**Driven by**: Tester 2's feedback about not knowing which flavors had been tested.
**Change**: The `/flavors` page now fetches caption run data and displays a summary line under each flavor: "X runs · Y% success" (or "No runs yet" for untested flavors). Admins can now see testing status at a glance without clicking into each flavor.
**Visible at**: `/flavors` → each flavor card shows run count and success rate.

### 3. Color-coded success rate indicators
**Driven by**: Tester 3's feedback about no visual warning for broken flavors.
**Change**: The per-flavor success rate on the list page is color-coded: green (≥80%), amber (≥50%), red (<50%). This makes it immediately obvious which flavors have high error rates and need attention.
**Visible at**: `/flavors` → success rate text color on each flavor card.

---

## App Improvement from Database Data

### Success rate disparity revealed uneven flavor reliability
**Data pattern observed**: Querying `humor_caption_runs` grouped by `flavor_id` showed that some flavors had success rates above 90% while others were below 40%. The variance was not visible from the admin UI — admins had to navigate to the stats page and scan a table to spot the issue.

**Change made**: We surfaced per-flavor run statistics (total count and success rate) directly on the main `/flavors` list view. The color-coded success rate (green/amber/red) makes problematic flavors immediately identifiable. We also added the bar chart visualization on the stats page so the relative volume and health of each flavor can be compared visually rather than numerically.

**Impact**: Admins can now identify and fix broken prompt chains faster, without navigating away from the primary workflow page.
