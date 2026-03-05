# UI Design v1.0

## Overview

Web and mobile web interface for Heat Seasons leaderboard application. Designed for small user group (5-10 participants) with focus on quick race entry and clear leaderboard visualization.

**Target Devices:** Desktop, tablet, mobile browsers
**Design Philosophy:** Clean, functional, racing-inspired aesthetic

---

## Color Palette

### Default Theme (Dark Mode)

#### Primary Colors

- **Racing Red**: `#E63946` - Primary actions, winners, CTAs
- **Track Black**: `#0A0E27` - Primary background, headers
- **Dark Surface**: `#1A1F3A` - Secondary surfaces, cards
- **Asphalt Gray**: `#457B9D` - Secondary elements, borders
- **Light Text**: `#E8EAF6` - Primary text on dark backgrounds

#### Accent Colors

- **Podium Gold**: `#F1C40F` - First place highlights
- **Silver**: `#95A5A6` - Second place
- **Bronze**: `#CD7F32` - Third place
- **Success Green**: `#06D6A0` - Confirmations
- **Warning Orange**: `#FF9F1C` - Alerts
- **Error Red**: `#EF476F` - Errors

#### Semantic Colors

- **Primary Background**: `#0A0E27` - Page background
- **Secondary Background**: `#1A1F3A` - Cards, containers
- **Tertiary Background**: `#2A2F4A` - Hover states, secondary elements
- **Text Primary**: `#E8EAF6` - Main text
- **Text Secondary**: `#B0BEC5` - Secondary text, metadata
- **Border**: `#455A64` - Dividers and borders

### Light Mode Theme (Alternative)

For future light mode implementation:

#### Primary Colors

- **Racing Red**: `#E63946` - Primary actions, winners, CTAs (unchanged)
- **Track Black**: `#1D3557` - Headers, text, navigation
- **Asphalt Gray**: `#457B9D` - Secondary elements, borders
- **Podium Gold**: `#F1C40F` - First place highlights
- **Silver**: `#95A5A6` - Second place
- **Bronze**: `#CD7F32` - Third place

#### Supporting Colors

- **Background**: `#F8F9FA` - Page background
- **Card White**: `#FFFFFF` - Content cards
- **Success Green**: `#06D6A0` - Confirmations
- **Warning Orange**: `#FF9F1C` - Alerts
- **Error Red**: `#EF476F` - Errors

---

## Typography

### Font Stack

- **Headings**: System font stack or racing-inspired (e.g., Titillium Web, Rajdhani)
- **Body**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Monospace**: 'Courier New', monospace (for race times/numbers)

### Scale

- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headers
- **H3**: 1.5rem (24px) - Card titles
- **Body**: 1rem (16px) - Standard text
- **Small**: 0.875rem (14px) - Metadata, captions

---

## Layout Structure

### Navigation

- **Desktop**: Horizontal navbar with logo left, nav items right
- **Mobile**: Hamburger menu, collapsible drawer

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## Page Designs

## 1. Dashboard (Home)

### Layout

```
┌─────────────────────────────────────────┐
│ NAVBAR                                  │
├─────────────────────────────────────────┤
│ CURRENT SEASON HERO                     │
│ ┌─────────────────────────────────────┐ │
│ │ Winter 2025                         │ │
│ │ Race 5 of 4+ • 8 Racers             │ │
│ │ [View Full Leaderboard]             │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ QUICK STATS (3 cards)                   │
│ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │Current │ │Recent  │ │Next    │       │
│ │Leader  │ │Race    │ │Race    │       │
│ └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────┤
│ TOP 3 LEADERBOARD PREVIEW               │
│ 🥇 John Doe - 95 pts                    │
│ 🥈 Jane Smith - 88 pts                  │
│ 🥉 Bob Wilson - 82 pts                  │
│                                         │
│ [Record New Race] (Admin only)          │
└─────────────────────────────────────────┘
```

### Components

- Hero card with season name, race count, status
- Three stat cards showing key metrics
- Podium preview (top 3 with medal icons)
- Primary CTA button for admins

---

## 2. Leaderboard Page

### Layout

```
┌─────────────────────────────────────────┐
│ NAVBAR                                  │
├─────────────────────────────────────────┤
│ SEASON SELECTOR                         │
│ [Winter 2025 ▾] [All Time Stats]       │
├─────────────────────────────────────────┤
│ LEADERBOARD TABLE                       │
│ ┌───┬──────────┬────┬───────┬─────┐    │
│ │ # │ Racer    │Pts │ Races │ Avg │    │
│ ├───┼──────────┼────┼───────┼─────┤    │
│ │ 1 │ John Doe │ 95 │   5   │ 2.4 │    │
│ │ 2 │ Jane S.  │ 88 │   5   │ 3.1 │    │
│ │ 3 │ Bob W.   │ 82 │   4   │ 3.5 │    │
│ └───┴──────────┴────┴───────┴─────┘    │
└─────────────────────────────────────────┘
```

### Features

- Dropdown to switch between seasons or all-time
- Sortable columns (position, points, races, avg)
- Row click expands racer details
- Highlight current user's row
- Medal icons for top 3
- Color-coded position backgrounds (gradient fade)

### Mobile Adaptation

- Card-based layout instead of table
- Swipe to reveal more stats
- Collapsible details

---

## 3. Race Results Page

### Layout

```
┌─────────────────────────────────────────┐
│ NAVBAR                                  │
├─────────────────────────────────────────┤
│ RACE HISTORY                            │
│ Season: [Winter 2025 ▾]                 │
├─────────────────────────────────────────┤
│ RACE CARDS (chronological, newest top) │
│ ┌─────────────────────────────────────┐ │
│ │ Race 5 • Dec 14, 2025               │ │
│ │ 1st: John Doe (25 pts)              │ │
│ │ 2nd: Jane Smith (18 pts)            │ │
│ │ 3rd: Bob Wilson (15 pts)            │ │
│ │ [View Details] [Edit] [Delete]      │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Race 4 • Dec 7, 2025                │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Add New Race] (Admin only)           │
└─────────────────────────────────────────┘
```

### Features

- Filterable by season
- Expandable cards showing full results
- Admin actions (edit, delete) visible to admins only
- Floating action button for quick race entry

---

## 4. Record Race Form

### Layout

```
┌─────────────────────────────────────────┐
│ Record New Race                    [X]  │
├─────────────────────────────────────────┤
│ Season: Winter 2025                     │
│ Race Number: 6 (auto)                   │
│                                         │
│ Date: [Dec 14, 2025 ▾]                  │
│                                         │
│ RACE RESULTS                            │
│ ┌─────────────────────────────────────┐ │
│ │ 1st Place                           │ │
│ │ [Select Racer ▾]            25 pts  │ │
│ ├─────────────────────────────────────┤ │
│ │ 2nd Place                           │ │
│ │ [Select Racer ▾]            18 pts  │ │
│ ├─────────────────────────────────────┤ │
│ │ 3rd Place                           │ │
│ │ [Select Racer ▾]            15 pts  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Add Another Racer] (up to 9)         │
│                                         │
│ [Cancel]              [Save Race]       │
└─────────────────────────────────────────┘
```

### Features

- Modal or full-page form
- Date picker (defaults to today)
- Drag-and-drop reordering of positions
- Dropdown for racer selection (searchable)
- Points auto-calculated and displayed
- Validation: 2-9 racers required, no duplicates
- Preview mode before final save

### Mobile Adaptation

- Full-screen modal
- Larger touch targets
- Simplified drag handles

---

## 5. Racer Management Page (Admin)

### Layout

```
┌─────────────────────────────────────────┐
│ NAVBAR                                  │
├─────────────────────────────────────────┤
│ Racer Management                        │
│ [Search racers...] [+ Add Racer]        │
├─────────────────────────────────────────┤
│ RACER LIST                              │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 John Doe                         │ │
│ │    john@example.com • Active        │ │
│ │    12 races • 3 wins • 156 pts      │ │
│ │    [Edit] [View Stats] [Deactivate] │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Jane Smith                       │ │
│ │    ...                              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Features

- Search/filter racers
- Status badge (active/inactive)
- Quick stats display
- Inline edit capabilities
- Confirmation dialogs for destructive actions

---

## 6. Season Management Page (Admin)

### Layout

```
┌─────────────────────────────────────────┐
│ NAVBAR                                  │
├─────────────────────────────────────────┤
│ Season Management                       │
│ [+ Create New Season]                   │
├─────────────────────────────────────────┤
│ ACTIVE SEASON                           │
│ ┌─────────────────────────────────────┐ │
│ │ 🏁 Winter 2025               ACTIVE │ │
│ │    Started: Nov 1, 2025             │ │
│ │    5 races • 8 participants         │ │
│ │    [View] [Edit] [Complete]         │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PAST SEASONS                            │
│ ┌─────────────────────────────────────┐ │
│ │ Fall 2025                 COMPLETED │ │
│ │ Aug 1 - Oct 31 • 6 races            │ │
│ │ Winner: John Doe (124 pts)          │ │
│ │ [View Archive]                      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Features

- Clear status indicators
- Season statistics summary
- Quick actions based on season status
- Archive view for historical seasons

---

## 7. User Profile Page

### Layout

```
┌─────────────────────────────────────────┐
│ NAVBAR                                  │
├─────────────────────────────────────────┤
│ PROFILE HEADER                          │
│ 👤 John Doe                             │
│    john@example.com • Role: User        │
├─────────────────────────────────────────┤
│ YOUR STATISTICS                         │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │Total │ │Total │ │Total │ │ Avg  │    │
│ │Races │ │Wins  │ │Points│ │ Pos  │    │
│ │  12  │ │  3   │ │ 156  │ │ 3.2  │    │
│ └──────┘ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────────────┤
│ RACE HISTORY                            │
│ Season-by-season breakdown...           │
├─────────────────────────────────────────┤
│ SETTINGS                                │
│ • Email notifications                   │
│ • Change password                       │
│ • Logout                                │
└─────────────────────────────────────────┘
```

---

## Component Library

### Buttons

- **Primary**: Red background, white text, rounded corners
- **Secondary**: Gray outline, transparent background
- **Danger**: Red outline for destructive actions
- **Sizes**: Small (32px), Medium (40px), Large (48px)

### Cards

- White background, subtle shadow
- 8px border radius
- 16px padding
- Hover state: slight elevation increase

### Forms

- Input fields: 40px height, gray border, focus state blue
- Dropdowns: Searchable, keyboard navigable
- Date pickers: Calendar popup
- Validation: Inline error messages in red

### Tables

- Striped rows (alternating background)
- Hover state on rows
- Sortable column headers (arrow indicators)
- Responsive: collapse to cards on mobile

### Navigation

- Fixed top navbar (60px height)
- Logo left, nav items right
- Active page indicator (underline or background)
- User menu dropdown (avatar + name)

### Modals

- Overlay with backdrop blur
- Centered, max-width 600px
- Close button top-right
- Action buttons bottom-right

### Search Bar

- **Default State**: 40px height, gray border (#E0E0E0), rounded corners (8px)
- **Placeholder**: Light gray text (#9E9E9E), "Search..." or context-specific
- **Icon**: Magnifying glass icon on the left (16px), gray color
- **Focus State**: Blue border (#457B9D), no outline
- **Clear Button**: X icon appears on right when text entered
- **Width**: Full width on mobile, 300-400px on desktop
- **Transitions**: Border color 150ms ease

**Variants:**

- **With Filters**: Additional filter icon/button on right
- **With Results**: Dropdown showing live search results below input
- **Disabled**: Gray background, cursor not-allowed

**Usage:**

- Racer management page
- Season selector
- Race history filtering
- Dropdown searches (racer selection in race form)

**Behavior:**

- Debounced search (300ms delay)
- Clear button appears when text entered
- Escape key clears search
- Enter key triggers search/selection

---

## Interactions & Animations

### Micro-interactions

- Button hover: scale(1.02), shadow increase
- Card hover: translate(0, -2px), shadow increase
- Row selection: background color change
- Loading states: skeleton screens
- Toast notifications: slide in from top-right

### Transitions

- Page transitions: 200ms ease
- Modal open/close: 300ms ease
- Dropdown expand: 150ms ease
- Button press: 100ms ease

### Loading States

- Skeleton screens for data loading
- Spinner for actions (save, delete)
- Progress bar for multi-step processes

---

## Accessibility

### ARIA Labels

- Proper role attributes
- Screen reader announcements for dynamic content
- Focus management in modals

### Keyboard Navigation

- Tab order follows visual order
- Enter/Space for button activation
- Escape closes modals
- Arrow keys for table/list navigation

### Color Contrast

- WCAG AA compliant (4.5:1 minimum)
- Focus indicators visible
- Error states not color-only

### Responsive Text

- Minimum 16px font size
- Line height 1.5 for body text
- Max line length 75 characters

---

## Mobile-Specific Considerations

### Touch Targets

- Minimum 44x44px for all interactive elements
- Adequate spacing between buttons
- Swipe gestures for navigation

### Mobile Navigation

- Bottom tab bar (alternative to top navbar)
- Thumb-friendly zone prioritization
- Pull-to-refresh on lists

### Mobile Forms

- Single-column layout
- Native input types (date, number, email)
- Reduced field count per screen
- "Next" button on keyboard for field advancement

---

## Future Enhancements

### Version 1.1+

- Dark mode toggle
- Custom theme builder (per user or league)
- Race photo galleries
- Live race tracking mode
- Animated podium celebrations
- Achievement badges/trophies
- Social sharing (race results, standings)
- PWA features (offline mode, install prompt)
- Real-time updates (WebSocket integration)
- Custom racer avatars/profile pictures
