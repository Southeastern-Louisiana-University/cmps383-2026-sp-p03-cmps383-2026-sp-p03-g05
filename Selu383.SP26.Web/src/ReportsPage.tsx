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

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then(setLocations)
      .catch(console.error);
  }, []);

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
          <div className="reports-header-copy">
            <p className="reports-eyebrow">Business Insights</p>
            <h1>Reports Dashboard</h1>
            <p className="reports-subtitle">
              View sales and order totals by location with a cleaner snapshot of
              daily, weekly, and monthly activity.
            </p>
          </div>

          <button
            type="button"
            className="reports-back-btn"
            onClick={onBack}
          >
            Return to Dashboard
          </button>
        </div>

        <div className="reports-toolbar">
          <div className="reports-filter-group">
            <label htmlFor="reports-location-select">Select Location</label>
            <select
              id="reports-location-select"
              className="reports-select"
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
        </div>

        {summary && (
          <>
            <div className="reports-highlight-card">
              <div>
                <p className="reports-highlight-label">Total Revenue</p>
                <h2>${summary.monthlySales.toFixed(2)}</h2>
                <p className="reports-highlight-location">
                  {summary.locationLabel}
                </p>
              </div>

              <div className="reports-highlight-badge">
                <span>Monthly Snapshot</span>
              </div>
            </div>

            <div className="reports-stats-grid">
              <article className="reports-stat-card">
                <p className="reports-stat-label">Daily Sales</p>
                <h3>${summary.dailySales.toFixed(2)}</h3>
              </article>

              <article className="reports-stat-card">
                <p className="reports-stat-label">Daily Orders</p>
                <h3>{summary.dailyOrders}</h3>
              </article>

              <article className="reports-stat-card">
                <p className="reports-stat-label">Weekly Sales</p>
                <h3>${summary.weeklySales.toFixed(2)}</h3>
              </article>

              <article className="reports-stat-card">
                <p className="reports-stat-label">Weekly Orders</p>
                <h3>{summary.weeklyOrders}</h3>
              </article>

              <article className="reports-stat-card reports-stat-card-featured">
                <p className="reports-stat-label">Monthly Sales</p>
                <h3>${summary.monthlySales.toFixed(2)}</h3>
              </article>

              <article className="reports-stat-card reports-stat-card-featured">
                <p className="reports-stat-label">Monthly Orders</p>
                <h3>{summary.monthlyOrders}</h3>
              </article>
            </div>

            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th colSpan={2}>Dashboard Summary — {summary.locationLabel}</th>
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
            </div>
          </>
        )}
      </section>
    </main>
  );
}