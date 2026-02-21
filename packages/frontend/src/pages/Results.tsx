import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeasons } from "../hooks/data/useSeason";
import { useRaceResult } from "../hooks/data/useRaceResult";
import { AddRaceResultsModal, ResultsHeader, ResultsTable } from "../components/features/Results";

export default function Results() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRacerIds, setSelectedRacerIds] = useState<string[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);

  const { data: seasons } = useSeasons();
  const { races, results, racers, isLoading, error } = useRaceResult(
    selectedSeasonId ?? "",
    selectedRaceId ?? "",
  );

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

  return (
    <div className="container">
      <ResultsHeader
        seasons={seasons ?? []}
        races={races}
        selectedRaceId={selectedRaceId}
        onSeasonChange={setSelectedSeasonId}
        onRaceChange={setSelectedRaceId}
        onAddResults={() => setIsModalOpen(true)}
      />
      <ResultsTable
        results={results}
        racersMap={racersMap}
        isLoading={isLoading}
        error={error}
      />
      {isModalOpen && (
        <AddRaceResultsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          racers={racers}
          selectedRacerIds={selectedRacerIds}
          onRacerSelect={handleRacerSelect}
        />
      )}
    </div>
  );
}
