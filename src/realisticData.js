const realisticData = [
  {
    id: 1,
    name: "Entrance Area",
    center: [21.3891, 39.852],
    density: 85, // High density
    flow: { direction: "N", speed: 2.5 }, // Moderate flow
    radius: 200, // Represents the coverage area in meters
  },
  {
    id: 2,
    name: "Main Road",
    center: [21.3885, 39.856],
    density: 40, // Moderate density
    flow: { direction: "E", speed: 1.5 }, // Slow-moving crowd
    radius: 150,
  },
  {
    id: 3,
    name: "Prayer Hall",
    center: [21.3902, 39.863],
    density: 95, // Very high density
    flow: { direction: "E", speed: 0.5 }, // Near standstill
    radius: 250,
  },
  {
    id: 4,
    name: "Exit Area",
    center: [21.392, 39.858],
    density: 60, // Medium density
    flow: { direction: "E", speed: 3.0 }, // Fast-moving crowd
    radius: 180,
  },
];

export default realisticData;
