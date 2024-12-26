import React, { useState } from "react";
import { MapContainer, TileLayer, Circle, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import realisticData from "./realisticData";

// Get color based on density
const getColorByDensity = (density) => {
  if (density > 80) return "red";
  if (density > 50) return "orange";
  return "green";
};

// Convert direction to an angle (in degrees)
const directionToAngle = (direction) => {
  switch (direction) {
    case "N":
      return 0;
    case "E":
      return 90;
    case "S":
      return 180;
    case "W":
      return 270;
    default:
      return 0;
  }
};

// Helper function to create arrowhead
const createArrowIcon = (angle) => {
  return L.divIcon({
    className: "arrow-icon",
    html: `<div style="transform: rotate(${angle}deg); font-size: 20px; color: blue;">&#x25BA;</div>`,
  });
};

// Generate alerts based on data conditions
const generateAlerts = (data) => {
  const alerts = [];
  data.forEach((zone) => {
    const zoneName = zone.name || `Zone ${zone.id}`;
    if (zone.density > 90) {
      alerts.push({
        id: zone.id,
        message: `Critical: "${zoneName}" has extremely high density.`,
        type: "critical",
      });
    }
    if (zone.flow.speed < 1 && zone.density > 70) {
      alerts.push({
        id: zone.id,
        message: `Warning: "${zoneName}" is experiencing stagnation.`,
        type: "warning",
      });
    }
    if (zone.density > 70 && zone.flow.speed > 3) {
      alerts.push({
        id: zone.id,
        message: `Warning: High-speed movement in a dense area at "${zoneName}".`,
        type: "warning",
      });
    }
  });
  return alerts;
};

const MapView = () => {
  const [selectedZone, setSelectedZone] = useState(null);
  const alerts = generateAlerts(realisticData);

  // Metrics calculations
  const totalZones = realisticData.length;
  const averageDensity =
    realisticData.reduce((sum, zone) => sum + zone.density, 0) / totalZones;
  const criticalZones = realisticData.filter(
    (zone) => zone.density > 90
  ).length;

  return (
    <div style={styles.container}>
      {/* Top Bar: Key Metrics */}
      <div style={styles.topBar}>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Total Zones</h4>
          <p style={styles.metricValue}>{totalZones}</p>
        </div>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Average Density</h4>
          <p style={styles.metricValue}>{averageDensity.toFixed(1)}%</p>
        </div>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Critical Zones</h4>
          <p style={styles.metricValue}>{criticalZones}</p>
        </div>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Active Alerts</h4>
          <p style={styles.metricValue}>{alerts.length}</p>
        </div>
      </div>

      <div style={styles.dashboard}>
        {/* Left Sidebar: Zone Information */}
        <div style={styles.sidebar}>
          <h3 style={styles.header}>Zone Information</h3>
          {realisticData.map((zone) => (
            <div
              key={zone.id}
              style={{
                ...styles.card,
                border:
                  selectedZone === zone.id
                    ? "2px solid blue"
                    : "1px solid #e0e0e0",
              }}
              onClick={() => setSelectedZone(zone.id)}
            >
              <h4 style={styles.cardTitle}>{zone.name}</h4>
              <p style={styles.cardText}>
                <b>Density:</b> {zone.density}%
              </p>
              <p style={styles.cardText}>
                <b>Flow Direction:</b> {zone.flow.direction}
              </p>
              <p style={styles.cardText}>
                <b>Speed:</b> {zone.flow.speed} m/s
              </p>
            </div>
          ))}
        </div>

        {/* Map Area */}
        <div style={styles.map}>
          <MapContainer
            center={[21.3891, 39.8579]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Render circles for density zones */}
            {realisticData.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                color={selectedZone === zone.id ? "blue" : "black"}
                fillColor={getColorByDensity(zone.density)}
                fillOpacity={0.4}
              >
                <Popup>
                  <b>{zone.name}</b> <br />
                  <b>Density:</b> {zone.density}% <br />
                  <b>Flow:</b> {zone.flow.direction} at {zone.flow.speed} m/s
                </Popup>
              </Circle>
            ))}

            {/* Render flow arrows */}
            {realisticData.map((zone) => {
              const angle = directionToAngle(zone.flow.direction);
              const arrowLength = zone.flow.speed * 10;
              const endpoint = [
                zone.center[0] +
                  (arrowLength / 111320) * Math.cos((angle * Math.PI) / 180),
                zone.center[1] +
                  (arrowLength / 111320) * Math.sin((angle * Math.PI) / 180),
              ];

              const arrowIcon = createArrowIcon(angle);

              return (
                <>
                  <Marker
                    key={`arrow-${zone.id}`}
                    position={endpoint}
                    icon={arrowIcon}
                  />
                </>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Sidebar: Alerts */}
        <div style={styles.sidebar}>
          <h3 style={styles.header}>Alerts</h3>
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  ...styles.card,
                  backgroundColor:
                    alert.type === "critical" ? "#ffcccc" : "#fff4cc",
                  borderColor:
                    alert.type === "critical" ? "#ff0000" : "#ffcc00",
                }}
              >
                <p style={styles.alertText}>{alert.message}</p>
              </div>
            ))
          ) : (
            <p style={styles.noAlerts}>No alerts at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #ddd",
  },
  metricCard: {
    textAlign: "center",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  metricTitle: {
    fontSize: "1rem",
    color: "#555",
  },
  metricValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  dashboard: {
    display: "flex",
    flex: 1,
  },
  sidebar: {
    width: "20%",
    padding: "20px",
    borderRight: "1px solid #ddd",
    backgroundColor: "#f8f9fa",
    overflowY: "auto",
  },
  header: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
    textAlign: "center",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "10px",
  },
  cardText: {
    fontSize: "0.9rem",
    color: "#666",
  },
  alertText: {
    fontSize: "0.9rem",
    color: "#333",
    fontWeight: "bold",
  },
  noAlerts: {
    fontSize: "0.9rem",
    color: "#666",
    textAlign: "center",
    marginTop: "20px",
  },
  map: {
    flex: 1,
    borderRadius: "10px",
    overflow: "hidden",
    margin: "10px",
  },
};

export default MapView;
