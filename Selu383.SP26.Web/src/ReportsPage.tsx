import { useEffect, useState } from "react";

type ReportsPageProps = {
  onBack: () => void;
};

type Location = {
  id: number;
  address: string;
};

type Summary = {
  locationId: number | null;
  locationLabel: string;
  dailySales: number;
  dailyOrders: number;
  weeklySales: number;
  weeklyOrders: number;
  monthlySales: number;
  monthlyOrders: number;
};

export default function ReportsPage({ onBack }: ReportsPageProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");

  // 🔹 Load locations
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then(setLocations)
      .catch(console.error);
  }, []);

  // 🔹 Load summary (runs when location changes)
  useEffect(() => {
    const url =
      selectedLocationId === "all"
        ? "/api/reports/summary"
        : `/api/reports/summary?locationId=${selectedLocationId}`;

    fetch(url)
      .then((res) => res.json())
      .then(setSummary)
      .catch(console.error);
  }, [selectedLocationId]);

  return (
    <main className="reports-page">
      <section className="reports-card">
        <div className="reports-header">
          <h1>Reports</h1>
          <button type="button" onClick={onBack}>
            Return to Dashboard
          </button>
        </div>

        {/* 🔹 Location Filter */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Select Location: </label>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.address}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Optional KPI (nice touch) */}
        {summary && (
          <div style={{ marginBottom: "1rem", fontWeight: "bold" }}>
            Total Revenue ({summary.locationLabel}): $
            {summary.monthlySales.toFixed(2)}
          </div>
        )}

        {/* 🔹 Main Dashboard (KEEP THIS) */}
        {summary && (
          <table>
            <thead>
              <tr>
                <th colSpan={2}>
                  Dashboard - {summary.locationLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Daily Sales</td>
                <td>${summary.dailySales.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Daily Orders</td>
                <td>{summary.dailyOrders}</td>
              </tr>
              <tr>
                <td>Weekly Sales</td>
                <td>${summary.weeklySales.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Weekly Orders</td>
                <td>{summary.weeklyOrders}</td>
              </tr>
              <tr>
                <td>Monthly Sales</td>
                <td>${summary.monthlySales.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Monthly Orders</td>
                <td>{summary.monthlyOrders}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}