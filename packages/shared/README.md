# Shared

Common code shared between frontend and backend packages.

## Contents

### Constants

- User roles (admin, user)
- Season status (active, completed, archived)
- Race constraints (min/max racers, min races per season)
- Default points system

### Utilities

- Race result validation
- Points calculation
- Leaderboard calculation

## Usage

### In Backend

```javascript
const { USER_ROLES, validateRaceResults, calculateLeaderboard } = require("shared");

// Validate race results
const { valid, errors } = validateRaceResults(results);

// Calculate leaderboard
const standings = calculateLeaderboard(races, pointsSystem);
```

### In Frontend

```javascript
import { RACE_CONSTRAINTS, DEFAULT_POINTS } from "shared";

// Use constants
const maxRacers = RACE_CONSTRAINTS.MAX_RACERS;
```

## Structure

```
shared/
├── index.js          # Main export
├── constants.js      # Application constants
├── utils.js          # Shared utility functions
└── package.json
```
