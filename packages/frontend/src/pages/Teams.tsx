import { Racer } from "@shared/models";


interface TeamsProps {
  drivers?: Racer[];
}

export function Teams({ drivers }: TeamsProps) {
  return (
    <div>
      <h1>Teams Page</h1>
      {/* Render teams and drivers information here */}
      {drivers && drivers.length > 0 ? (
        <ul>
          {drivers.map((driver) => (
            <li key={driver.id}>{driver.name}</li>
          ))}
        </ul>
      ) : (
        <p>No drivers available.</p>
      )}
    </div>
  );
}