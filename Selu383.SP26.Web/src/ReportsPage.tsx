import { useEffect, useState } from "react";
import RoundedSelect from "./components/RoundedSelect";

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
  refundsCount: number;
  refundsTotal: number;
};

export default function ReportsPage({ onBack }: ReportsPageProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");

  const now = new Date();
  const formatDate = (value: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(value);
  const todayLabel = formatDate(now);

  const sevenDayStart = new Date(now);
  sevenDayStart.setDate(now.getDate() - 6);
  const sevenDayRangeLabel = `${formatDate(sevenDayStart)} - ${todayLabel}`;

  const currentMonthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now);

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

  const reportLocationOptions = [
    { value: "all", label: "All Locations" },
    ...locations.map((location) => ({
      value: String(location.id),
      label: location.address,
    })),
  ];

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
            <label>Select Location</label>
            <RoundedSelect
              className="reports-select"
              value={selectedLocationId}
              onChange={setSelectedLocationId}
              options={reportLocationOptions}
              ariaLabel="Select Location"
            />
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

            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th colSpan={2}>Dashboard Summary - {summary.locationLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Today's Orders ({todayLabel})</td>
                    <td>{summary.dailyOrders}</td>
                  </tr>
                  <tr>
                    <td>Today's Sales ({todayLabel})</td>
                    <td>${summary.dailySales.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Last 7 Day's Orders ({sevenDayRangeLabel})</td>
                    <td>{summary.weeklyOrders}</td>
                  </tr>
                  <tr>
                    <td>Last 7 Day's Sales ({sevenDayRangeLabel})</td>
                    <td>${summary.weeklySales.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Current Month's Orders ({currentMonthLabel})</td>
                    <td>{summary.monthlyOrders}</td>
                  </tr>
                  <tr>
                    <td>Current Month's Sales ({currentMonthLabel})</td>
                    <td>${summary.monthlySales.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Refund Count This Month ({currentMonthLabel})</td>
                    <td>{summary.refundsCount}</td>
                  </tr>
                  <tr>
                    <td>Refund Total This Month ({currentMonthLabel})</td>
                    <td>${summary.refundsTotal.toFixed(2)}</td>
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
