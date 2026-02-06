# Fix Authentication Issues and Enhance Caution Banner Feature

## Requirements

Fix all sign-in/sign-out authentication errors in the Cesclair website while keeping the Neon PostgreSQL database. Also enhance the caution banner feature to allow admins to add warning/info banners to specific users and designers.

## Current State Analysis

### Authentication Setup
- **Auth Library**: better-auth with Drizzle adapter
- **Database**: Neon PostgreSQL (keep using this)
- **Password Hashing**: bcryptjs for hashing and verification
- **Session Management**: Cookie-based sessions with 7-day expiry

### Sign-Out Issue Identified
From the test-auth.js file and code review, sign-out calls `/api/auth/sign-out` via POST. The current implementation in account-menu.tsx, cesworld dashboard, and other pages uses:
```javascript
await authClient.signOut();
```
This appears to be failing silently (errors are swallowed). The root cause needs investigation:
1. Better-auth's signOut method might return an error response that's not valid JSON
2. The POST to `/api/auth/sign-out` might be timing out or returning unexpected response

### Sign-In Flow
- Sign-in calls `authClient.signIn.email()` 
- Password verification uses bcryptjs.compare
- After login, session is refreshed and user is redirected based on role
- Error handling exists but could be improved

### Caution Banner Feature
- **Database Table**: `caution_banners` already exists with proper schema:
  - `id`, `message`, `type` (warning/info/danger/success)
  - `targetRole` (all/member/designer/specific)
  - `targetUserId` (for specific user targeting)
  - `active`, `createdBy`, `createdAt`, `updatedAt`
- **API Route**: `/api/caution-banners/route.ts` exists with:
  - GET: Fetches banners (all for admin, filtered for regular users)
  - POST: Creates new banner (admin only)
- **Missing**: Update/Delete endpoints, Admin UI integration, User-facing banner display

## Implementation Phases

### Phase 1: Fix Sign-Out Authentication Issues
1. Debug sign-out endpoint response in `/api/auth/[...all]/route.ts`
2. Improve error handling in authClient.signOut() calls
3. Add proper response parsing for sign-out
4. Ensure session cookies are properly cleared
5. Handle edge cases (already logged out, expired session)

### Phase 2: Fix Sign-In Authentication Issues  
1. Verify password hash format consistency in database
2. Add better error messages for common auth failures
3. Ensure session creation works correctly
4. Fix any role retrieval issues after login
5. Handle database connection errors gracefully

### Phase 3: Enhance Caution Banner API
1. Add PUT endpoint to update existing banners (toggle active, edit message)
2. Add DELETE endpoint to remove banners
3. Add GET endpoint for specific banner by ID
4. Add filtering by user/designer in GET
5. Add support for targeting both users and designers

### Phase 4: Build Admin UI for Caution Banners
1. Add "Caution Banners" tab to admin panel
2. Create banner list view with search/filter
3. Create banner creation form with:
   - Message textarea
   - Type selector (warning/info/danger/success)
   - Target selector (all/members/designers/specific user)
   - User/designer search for specific targeting
4. Add edit/delete functionality
5. Add toggle active/inactive

### Phase 5: Display Caution Banners to Users
1. Create CautionBanner component with different styles per type
2. Add banner display to Cesworld dashboard header
3. Add banner display to Designer dashboard header
4. Add banner display to Account page
5. Fetch banners on page load and display if active
6. Add dismiss functionality (remember dismissed state)

## Technical Details

### Files to Modify

#### Authentication Fixes
- `src/lib/auth-client.ts` - Improve signOut handling
- `src/app/api/auth/[...all]/route.ts` - Debug sign-out response
- `src/components/sections/account-menu.tsx` - Better error handling
- `src/app/cesworld/dashboard/page.tsx` - Better sign-out handling
- `src/app/designers/dashboard/page.tsx` - Better sign-out handling

#### Caution Banner API
- `src/app/api/caution-banners/route.ts` - Add PUT/DELETE
- `src/app/api/caution-banners/[id]/route.ts` - New file for specific banner operations

#### Admin Panel
- `src/app/admin/page.tsx` - Add caution banners tab

#### User-Facing Display
- `src/components/caution-banner.tsx` - New component
- `src/app/cesworld/dashboard/page.tsx` - Add banner display
- `src/app/designers/dashboard/page.tsx` - Add banner display

### Database Schema (Already Exists)
```sql
-- caution_banners table
CREATE TABLE caution_banners (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'warning', -- 'warning', 'info', 'danger', 'success'
  target_role TEXT NOT NULL DEFAULT 'all', -- 'all', 'member', 'designer', 'specific'
  target_user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT REFERENCES "user"(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Dependencies

- Neon PostgreSQL database (existing - keep as is)
- better-auth library
- bcryptjs for password hashing
- Drizzle ORM

## Testing Strategy

1. Test sign-in with correct credentials
2. Test sign-in with incorrect credentials  
3. Test sign-out when logged in
4. Test sign-out when already logged out
5. Test banner creation by admin
6. Test banner visibility for targeted users
7. Test banner visibility for role-based targeting
8. Test banner dismiss/hide functionality

## Success Criteria

1. Sign-in works reliably with proper error messages
2. Sign-out works without errors and properly clears session
3. Admin can create/edit/delete caution banners
4. Banners appear correctly for targeted users/designers
5. Banners are dismissible and remember dismissed state
6. All authentication keeps using Neon database
