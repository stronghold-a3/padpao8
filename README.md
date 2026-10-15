# PADPAO Eastern Visayas — website & member portal

Mobile-first, installable (PWA) site for PADPAO Eastern Visayas, Inc. (Region 8), with sign-up, login,
password reset, Google and Facebook sign-in, and a members-only area.

## Pages

| File | What it is | Access |
|---|---|---|
| `index.html` | Public site: about, advocacy, officers, membership, contact | Everyone |
| `auth.html` | Log in · Sign up (3 steps) · Forgot password · Reset password | Everyone |
| `members.html` | Dashboard: meetings, agendas, resolutions, action items, profile | Signed-in members; meeting records need **approved** status |
| `offline.html` | Shown when the app is offline | Everyone |

"Become a Member" opens `auth.html?view=signup`. Any members-only link sends visitors to log in first and
returns them to where they were going.

## Two modes

**Preview mode (default).** `assets/js/config.js` has no Supabase keys. Accounts are saved only in the
visitor's browser, Google/Facebook sign-in is simulated, and the reset "email" is shown on screen.
Good for reviewing the design. **It does not protect anything**: the sample meeting data is a public file.

**Live mode.** Real accounts and real protection. Member content is stored in Supabase and the database
only returns it to approved members (Row Level Security), so it never sits in the public website files.

## Going live (about 20 minutes)

1. Create a project at supabase.com.
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Authentication → URL Configuration
   - Site URL: `https://stronghold-a3.github.io/padpao8/`
   - Redirect URLs: add `https://stronghold-a3.github.io/padpao8/**`
4. Authentication → Providers
   - **Google**: create an OAuth client in Google Cloud Console (Web application). Authorized redirect URI:
     `https://<project-ref>.supabase.co/auth/v1/callback`. Paste the client ID and secret into Supabase.
   - **Facebook**: create an app at developers.facebook.com, add Facebook Login, set the same callback URL
     as the Valid OAuth Redirect URI, and paste the App ID and secret into Supabase.
5. Project Settings → API: copy the **Project URL** and **anon public key** into `assets/js/config.js`.
6. Delete `assets/js/demo-meetings.js` (no longer used) and push.
7. After you sign up, make yourself an officer in the SQL Editor:
   `update public.profiles set role = 'officer', status = 'approved' where email = 'you@example.com';`

New sign-ups start as **pending**. Approve them with
`update public.profiles set status = 'approved' where email = '…';`
Members cannot change their own status (a database trigger blocks it).

Also fill in `org.email`, `org.phone` and `org.facebook` in `config.js` to complete the contact section.

## Publishing on GitHub Pages

Copy everything in this folder to the root of the `padpao8` repository and push. All paths are relative,
so it works under `/padpao8/`. When you change files later, bump `VERSION` in `sw.js` so installed apps update.
