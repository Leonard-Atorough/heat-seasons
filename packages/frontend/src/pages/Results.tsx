import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeasons, useRaceResult } from "../hooks/data";
import { AddRaceResultsModal, ResultsHeader, ResultsTable } from "../components/features/Results";
import { useAuth } from "../hooks/useAuth";
import { RaceResult } from "shared";

export default function Results() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedRacerIds, setSelectedRacerIds] = useState<string[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [sortedResults, setSortedResults] = useState<RaceResult[]>([]);
  const [sortAscending, setSortAscending] = useState(true);

  const { data: seasons } = useSeasons();
  const { races, results, racers, isLoading, error } = useRaceResult(
    selectedSeasonId ?? "",
    selectedRaceId ?? "",
  );
  const { user } = useAuth();

  // Q. To make this update sorted view in real-time we'd have to keep local state, right?
  // A.
  const sortBy = (key: keyof RaceResult, ascending: boolean) => {
    console.log(`Sorting by ${key}`);
    const sorted = [...results].sort((a, b) => {
      if (a[key]! < b[key]!) return ascending ? -1 : 1;
      if (a[key]! > b[key]!) return ascending ? 1 : -1;
      return 0;
    });
    setSortedResults(sorted);
  };

  // Build a Map so table rows can resolve racers in O(1) instead of a linear scan per row
  const racersMap = useMemo(
    () => new Map(racers.map((r) => [r.id, { name: r.name, team: r.team }])),
    [racers],
  );

  // Stable callback — only recreated when setSelectedRacerIds identity changes (never)
  const handleRacerSelect = useCallback((racerId: string, prevRacerId?: string) => {
    setSelectedRacerIds((prev) => [...prev.filter((id) => id !== prevRacerId), racerId]);
  }, []);

  useEffect(() => {
    if (seasons && seasons.length > 0) {
      setSelectedSeasonId(seasons[0].id);
    }
  }, [seasons]);

  useEffect(() => {
    if (races && races.length > 0) {
      setSelectedRaceId("");
    }
  }, [races]);

  const selectAllParticipants = useCallback((results: RaceResult[], raceId: string | null) => {
    if (!raceId) return [];
    const participants = results.map((r) => r.racerId);
    return participants;
  }, []);

  const clearSelectedRacers = useCallback(() => {
    setSelectedRacerIds([]);
  }, []);

  return (
    <div className="container">
      <ResultsHeader
        seasons={seasons ?? []}
        races={races}
        selectedRaceId={selectedRaceId}
        onSeasonChange={setSelectedSeasonId}
        onRaceChange={setSelectedRaceId}
        onAddResults={() => setIsModalOpen(true)}
        onUpdateResults={() => {
          setIsUpdateMode(true);
          setIsModalOpen(true);
        }}
      />
      <ResultsTable
        results={sortedResults.length > 0 ? sortedResults : results}
        racersMap={racersMap}
        isLoading={isLoading}
        error={error}
        onSortBy={(key) => {
          const ascending = sortAscending;
          sortBy(key, ascending);
          setSortAscending(!ascending);
        }}
      />
      {isModalOpen && user?.role === "admin" && (
        <AddRaceResultsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsUpdateMode(false);
            clearSelectedRacers();
          }}
          seasonId={selectedSeasonId ?? ""}
          racers={racers}
          selectedRacerIds={
            isUpdateMode ? selectAllParticipants(results, selectedRaceId) : selectedRacerIds
          }
          selectedRaceId={isUpdateMode ? (selectedRaceId ?? undefined) : undefined}
          onSubmit={() => setSelectedRacerIds([])}
          onRacerSelect={handleRacerSelect}
        />
      )}
    </div>
  );
}
