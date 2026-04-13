# Post Stars Feature

## Tasks
- [x] Create DB migration for post_stars table
- [x] Add PostStar type and update PostWithDetails
- [x] Update getPostById query to include stars
- [x] Create star toggle API route
- [x] Create StarButton component
- [x] Wire StarButton into post detail page and PostCard

## Review

### What was added
- **`supabase/migrations/002_post_stars.sql`** — new `post_stars` table with unique constraint (one star per user per post), RLS policies (public read, auth insert/delete own), and indexes.
- **`lib/types.ts`** — added `PostStar` interface; added `stars: PostStar[]` to `PostWithDetails`; added optional `researcher_star_count` / `industry_star_count` to `Post`.
- **`lib/queries.ts`** — `getPostById` now joins `post_stars(*, user:profiles(*))`. `getPosts` fetches minimal star data and computes researcher/industry counts on return.
- **`app/api/posts/[id]/star/route.ts`** — POST endpoint that toggles a star (insert if not exists, delete if exists). Returns `{ starred: boolean }`.
- **`components/posts/StarButton.tsx`** — client component with: toggle button (yellow when starred), separate researcher (blue) / industry (orange) star counts, "See who starred this" expandable list showing name, role badge, relative date, and a mailto contact link.
- **`app/posts/[id]/page.tsx`** — added Stars card in the sidebar above Post Summary.
- **`components/posts/PostCard.tsx`** — added compact researcher + industry star counts in the card footer.

### DB setup required
Run `supabase/migrations/002_post_stars.sql` in the Supabase SQL editor.
