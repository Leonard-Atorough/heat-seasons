# Data Model

## Entities

### Season

- id: unique identifier
- name: string
- startDate: date
- endDate: date (optional)
- status: active | completed | archived
- races: Race[]

### Race

- id: unique identifier
- seasonId: foreign key
- raceNumber: integer
- raceName: string
- date: date
- results: RaceResult[]

### Racer

- id: unique identifier
- name: string
- joinDate: date
- active: boolean

### RaceResult

- id: unique identifier
- raceId: foreign key
- racerId: foreign key
- position: integer (1-9)
- points: integer

## Relationships

- Season has many Races (1:N)
- Race has many RaceResults (1:N)
- Racer has many RaceResults (1:N)

## Possible Queries

- Get a race by ID and get its results. Use these to get all racers and their positions/points.
- Get all races for a season
- Get the leaderboard for a season by aggregating points from RaceResults
- Get all active racers

## Constraints

- A season must have at least 4 races
- A race must have between 2 and 9 racers
- Points must be assigned based on finishing position according to the defined scoring system

## Indexes

- Index on Season.status for quick retrieval of active seasons
- Index on Race.seasonId for efficient race lookups
- Index on RaceResult.raceId and RaceResult.racerId for fast result retrieval
