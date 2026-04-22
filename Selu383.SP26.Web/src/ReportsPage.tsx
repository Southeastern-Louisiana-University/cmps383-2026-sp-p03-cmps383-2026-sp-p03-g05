type ReportsPageProps = {
  onBack: () => void;
};

type ReportRow = {
  id: number;
  reportName: string;
  owner: string;
  status: "Ready" | "Pending" | "Draft";
  lastUpdated: string;
};

export default function ReportsPage({ onBack }: ReportsPageProps) {
  const reports: ReportRow[] = [
    {
      id: 1,
      reportName: "Daily Sales Report",
      owner: "Manager",
      status: "Ready",
      lastUpdated: "2026-04-22 9:00 AM",
    },
    {
      id: 2,
      reportName: "Weekly Sales Report",
      owner: "Manager",
      status: "Ready",
      lastUpdated: "2026-04-21 6:00 PM",
    },
    {
      id: 3,
      reportName: "Monthly Sales Report",
      owner: "Admin",
      status: "Pending",
      lastUpdated: "2026-04-20 4:30 PM",
    },
    {
      id: 4,
      reportName: "Simple Dashboard View",
      owner: "System",
      status: "Ready",
      lastUpdated: "2026-04-22 8:45 AM",
    },
  ];

  const dashboardSummary = {
    totalSalesToday: 1245.5,
    totalOrdersToday: 38,
    totalSalesThisWeek: 7120.25,
    totalSalesThisMonth: 28440.9,
  };

  return (
    <main className="reports-page">
      <section className="reports-card">
        <div className="reports-header">
          <h1>Reports</h1>
          <button type="button" className="reports-back-btn" onClick={onBack}>
            Return to Dashboard
          </button>
        </div>

        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th colSpan={4}>Available Reports</th>
              </tr>
              <tr>
                <th>Report Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.reportName}</td>
                    <td>{report.owner}</td>
                    <td>{report.status}</td>
                    <td>{report.lastUpdated}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No reports available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="reports-table-wrap" style={{ marginTop: "1.5rem" }}>
          <table className="reports-table">
            <thead>
              <tr>
                <th colSpan={2}>Simple Dashboard View</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Sales Today</td>
                <td>${dashboardSummary.totalSalesToday.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Orders Today</td>
                <td>{dashboardSummary.totalOrdersToday}</td>
              </tr>
              <tr>
                <td>Total Sales This Week</td>
                <td>${dashboardSummary.totalSalesThisWeek.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Sales This Month</td>
                <td>${dashboardSummary.totalSalesThisMonth.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}