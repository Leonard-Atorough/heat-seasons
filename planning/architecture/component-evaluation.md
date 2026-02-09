# Component/Page Structure Evaluation

## Current Structure Overview

### Components Directory

```
components/
├── common/
│   ├── Button.tsx/css
│   ├── Card.tsx/css
│   ├── FormGroup.tsx/css
│   └── SearchBar.tsx/css
├── layout/
│   └── Header.tsx/css
└── RacerCard.tsx/css
```

### Pages Directory

```
pages/
├── Dashboard.tsx/css
├── Racers.tsx/css
├── Leaderboard.tsx/css
└── LoginRegister.tsx/css
```

---

## Component Inventory & Analysis

### ✅ Well-Organized

- **common/** - Excellent grouping of reusable, primitives (Button, Card, FormGroup, SearchBar)
- **layout/** - Proper separation of layout components (Header)
- **common/Card** - Versatile base component supporting variants
- **common/FormGroup** - Flexible form input wrapper

### 🟡 Needs Reorganization

#### Issue #1: RacerCard at Root Level

**Current**: `components/RacerCard.tsx`
**Problem**:

- Mixing domain-specific (RacerCard) with general-purpose components
- Should be in a domain folder since it's specific to the racer domain

**Solution**: Move to `components/features/RacerCard/`

---

## Extraction Opportunities

### 1. **LeaderboardRow Component** (HIGH PRIORITY)

**Location**: Currently duplicated in Dashboard.tsx & Leaderboard.tsx
**Current**: Inline Card with multiple spans
**Extraction**: Extract into reusable LeaderboardRow component

**Benefits**:

- Single source of truth for leaderboard item styling
- Easy to maintain and modify layout
- Reusable across pages

**Files Affected**:

- Dashboard.tsx (lines 40-72)
- Leaderboard.tsx (lines 25-36)

**New Component**:

```
components/features/Leaderboard/
├── LeaderboardRow.tsx
└── LeaderboardRow.module.css
```

---

### 2. **PageHeader Component** (MEDIUM PRIORITY)

**Current Location**: Duplicated across pages
**Pattern Found**:

- Dashboard: `.dashboard__hero` section
- Leaderboard: `.leaderboard__header` section
- LoginRegister: `.loginRegister__title`

**Extraction**: Create reusable PageHeader component with variants

**New Component**:

```
components/common/PageHeader.tsx
components/common/PageHeader.module.css
```

**Variants**:

- `hero` - Large hero section with background image (Dashboard)
- `default` - Standard page header with title/subtitle (Leaderboard)
- `minimal` - Title only (LoginRegister)

---

### 3. **StatCard Component** (MEDIUM PRIORITY)

**Current Location**: Dashboard.tsx lines 28-30
**Pattern**: Three hardcoded "stat" cards with placeholder content

**Extraction**: Dedicated StatCard component

**New Component**:

```
components/features/Dashboard/
├── StatCard.tsx
└── StatCard.module.css
```

**Props**:

```typescript
interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: ReactNode;
  onClick?: () => void;
}
```

---

### 4. **LeaderboardHeader Component** (MEDIUM PRIORITY)

**Current Location**: Duplicated header rows
**Pattern Found**: In both Dashboard.tsx (lines 41-48) and Leaderboard.tsx (lines 19-26)

**Extraction**: Dedicated header component for leaderboard tables

**New Component**:

```
components/features/Leaderboard/
├── LeaderboardHeader.tsx
└── LeaderboardHeader.module.css
```

---

### 5. **AuthForm Component** (MEDIUM PRIORITY)

**Current Location**: LoginRegister.tsx (mixed logic)
**Problem**: Login/Register toggle logic mixed with form rendering

**Extraction**: Separate form logic into reusable AuthForm component

**New Component**:

```
components/features/Auth/
├── AuthForm.tsx
└── AuthForm.module.css
```

**Benefits**:

- Cleaner LoginRegister page (orchestration only)
- Reusable form across auth flows
- Easier testing and maintenance

---

### 6. **HeroSection Component** (LOW PRIORITY - Enhancement)

**Current Location**: Dashboard.tsx lines 15-25
**Extraction**: Reusable hero banner component

**New Component**:

```
components/common/HeroSection.tsx
components/common/HeroSection.module.css
```

**Props**:

```typescript
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  action?: ReactNode;
  height?: string;
}
```

---

## Proposed Reorganized Structure

```
components/
├── common/
│   ├── Button.tsx/css
│   ├── Card.tsx/css
│   ├── FormGroup.tsx/css
│   ├── SearchBar.tsx/css
│   ├── PageHeader.tsx/css          [NEW]
│   └── HeroSection.tsx/css         [NEW - Optional]
├── layout/
│   └── Header.tsx/css
└── features/
    ├── Auth/
    │   ├── AuthForm.tsx/css        [NEW]
    │   └── index.ts
    ├── Dashboard/
    │   ├── StatCard.tsx/css        [NEW]
    │   └── index.ts
    ├── Leaderboard/
    │   ├── LeaderboardRow.tsx/css   [NEW]
    │   ├── LeaderboardHeader.tsx/css [NEW]
    │   └── index.ts
    ├── Racer/
    │   ├── RacerCard.tsx/css        [MOVED]
    │   └── index.ts
    └── index.ts
```

---

## Page Cleanup Plan

### Dashboard.tsx

**Current Size**: 77 lines
**After Extraction**: ~40 lines (48% reduction)

**Changes**:

- Extract LeaderboardRow usage → use component in map
- Extract StatCard → replace Card wrappers
- Extract PageHeader → replace hero section
- Keep page-level logic and state

### Leaderboard.tsx

**Current Size**: 48 lines
**After Extraction**: ~25 lines (48% reduction)

**Changes**:

- Extract LeaderboardHeader → reuse from Dashboard/Leaderboard folder
- Extract LeaderboardRow → reuse from Dashboard/Leaderboard folder
- Keep page layout and data management

### LoginRegister.tsx

**Current Size**: 65 lines
**After Extraction**: ~20 lines (69% reduction)

**Changes**:

- Extract AuthForm → move form logic and rendering
- LoginRegister becomes orchestrator only
- Cleaner separation of concerns

---

## Implementation Priority

### Phase 1 (High Impact, Easy)

1. ✅ Extract LeaderboardRow → used in 2 places
2. ✅ Extract LeaderboardHeader → used in 2 places
3. ✅ Reorganize RacerCard to features/Racer/

### Phase 2 (Medium Impact)

4. ✅ Extract StatCard → Dashboard improvement
5. ✅ Extract PageHeader → standardize headers across app
6. ✅ Extract AuthForm → LoginRegister cleanup

### Phase 3 (Polish)

7. ✅ Extract HeroSection → reusable banner component
8. ✅ Create feature index.ts files for clean imports
9. ✅ Update all import statements

---

## Import Path Standards

### After Reorganization

```typescript
// ❌ Avoid
import LeaderboardRow from "../../../components/features/Leaderboard/LeaderboardRow";

// ✅ Prefer (with index.ts exports)
import { LeaderboardRow } from "@/components/features/Leaderboard";
```

Create `@/` alias in Vite config:

```javascript
// vite.config.ts
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

---

## Benefits of Reorganization

| Benefit                  | Impact                                               |
| ------------------------ | ---------------------------------------------------- |
| **Code Reusability**     | Eliminate duplication across Dashboard & Leaderboard |
| **Maintainability**      | Single source of truth for each component            |
| **Scalability**          | Clear structure for growing feature set              |
| **Testing**              | Isolated, testable components                        |
| **Performance**          | Better code splitting with feature folders           |
| **Developer Experience** | Intuitive folder structure                           |
| **Page Simplicity**      | 40-70% code reduction per page                       |

---

## Summary

**High Priority Extractions**: 5

- LeaderboardRow, LeaderboardHeader, StatCard, AuthForm, PageHeader

**Medium Priority Moves**: 1

- RacerCard to features/Racer/

**Optional Enhancements**: 1

- HeroSection generic component

**Estimated Code Reduction**: 35-45% across all pages while improving maintainability
