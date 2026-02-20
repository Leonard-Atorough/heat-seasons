export interface PointsConfig {
  pointsSystem: Record<number, number>;
  lastModified: Date;
}

export interface PointsConfigUpdateInput {
  pointsSystem: Record<number, number>;
}
