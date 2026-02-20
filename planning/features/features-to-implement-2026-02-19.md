# Features to Implement - Tomorrow (2026-02-19)

## 1. Races UI - Current Season Listing with Admin Controls

- **Description**: Update the Races page to display all races for the current season
- **Requirements**:
  - List races filtered by current season
  - Add a protected "Add Race" button (admin-only)
  - Button should only be visible to authenticated admin users
- **Components to Update**: `Racers.tsx` page and related race components
- **Dependencies**:
  - Need admin role verification
  - Ensure race filtering logic works with current season

---

## 2. Racer Profile Creation & Editing

- **Description**: Allow players to create or edit their racer profile with personal details
- **Requirements**:
  - Fields: name, nationality, age, profile picture
  - Support profile picture upload/streaming
  - Need image storage/saving mechanism
  - Update form validation for new fields
- **Components to Update**: `ProfilePage.tsx` and related forms
- **Dependencies**:
  - Image upload handler needed
  - Backend endpoint for image storage
  - Update racer data model if needed
- **Notes**: Will require infrastructure for image streaming and persistence

---

## 3. Admin-Only Race Updates

- **Description**: Allow admin users to edit/update existing races
- **Requirements**:
  - Update button on each race (admin-only)
  - Edit form for race details
  - Protected API endpoint for updates
  - Validate admin permissions on backend
- **Components to Update**: Race list component, create update form component
- **Dependencies**:
  - Admin role verification
  - Backend update endpoint

---

## 4. Admin Privilege Management System

- **Description**: Implement a system to manage and assign admin privileges to users
- **Requirements**:
  - Determine how admin status is stored/managed (flag in user model?)
  - Create admin assignment mechanism
  - Need authorization checks on protected endpoints
  - Consider UI for admin management (if needed)
- **Components to Create/Update**:
  - User model to include admin flag
  - Authorization middleware/utilities
  - Possibly admin management interface
- **Dependencies**:
  - Coordinate with existing auth system
  - May require database schema update

---

## Implementation Notes

- Prioritize admin privilege management (#4) first as it's a dependency for #1 and #3
- Address image handling infrastructure early for #2
- Ensure all admin-protected features verify permissions on both frontend and backend
