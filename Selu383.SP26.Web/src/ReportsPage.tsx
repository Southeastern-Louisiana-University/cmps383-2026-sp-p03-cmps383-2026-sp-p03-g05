type ReportsPageProps = {
  onBack: () => void;
};

export default function ReportsPage({ onBack }: ReportsPageProps) {
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
                <th colSpan={4}>Reports will happen here</th>
              </tr>
              <tr>
                <th>Report Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4}>Placeholder data row</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
