namespace Selu383.SP26.Api.Features.Reports;

public class SalesSummaryDto
{
    public int? LocationId { get; set; }
    public string LocationLabel { get; set; } = "All Locations";

    public decimal DailySales { get; set; }
    public int DailyOrders { get; set; }

    public decimal WeeklySales { get; set; }
    public int WeeklyOrders { get; set; }

    public decimal MonthlySales { get; set; }
    public int MonthlyOrders { get; set; }
}

public class ReportListItemDto
{
    public string ReportName { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
}