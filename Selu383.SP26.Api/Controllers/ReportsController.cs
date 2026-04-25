using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Reports;

namespace Selu383.SP26.Api.Controllers;

[Route("api/reports")]
[ApiController]
[Authorize(Roles = RoleNames.Admin)]
public class ReportsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<ReportListItemDto>> GetReports()
    {
        var now = DateTime.UtcNow;

        var reports = new List<ReportListItemDto>
        {
            new()
            {
                ReportName = "Daily Sales Report",
                Owner = "Manager",
                Status = "Ready",
                LastUpdated = now
            },
            new()
            {
                ReportName = "Weekly Sales Report",
                Owner = "Manager",
                Status = "Ready",
                LastUpdated = now
            },
            new()
            {
                ReportName = "Monthly Sales Report",
                Owner = "Manager",
                Status = "Ready",
                LastUpdated = now
            },
            new()
            {
                ReportName = "Simple Dashboard View",
                Owner = "System",
                Status = "Ready",
                LastUpdated = now
            }
        };

        return Ok(reports);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<SalesSummaryDto>> GetSummary([FromQuery] int? locationId)
    {
        var todayStart = DateTime.UtcNow.Date;
        var tomorrowStart = todayStart.AddDays(1);

        var weekStart = todayStart.AddDays(-6);
        var nextDayAfterToday = tomorrowStart;

        var monthStart = new DateTime(todayStart.Year, todayStart.Month, 1);
        var nextMonthStart = monthStart.AddMonths(1);

        var ordersQuery = dataContext.Set<Order>()
            .AsNoTracking()
            .Include(x => x.OrderMenuItems)
                .ThenInclude(x => x.MenuItem)
            .AsQueryable();

        if (locationId.HasValue)
        {
            var locationExists = await dataContext.Set<Location>()
                .AnyAsync(x => x.Id == locationId.Value);

            if (!locationExists)
            {
                return NotFound("Location not found.");
            }

            ordersQuery = ordersQuery.Where(x => x.LocationId == locationId.Value);
        }

        var projectedOrders = ordersQuery.Select(x => new
        {
            x.Id,
            x.LocationId,
            x.DateOrdered,
            StatusName = x.OrderStatus != null ? x.OrderStatus.Name : string.Empty,
            Total = x.OrderMenuItems.Sum(y => (decimal?)(y.Quantity * y.MenuItem!.Price)) ?? 0m
        });

        var dailyOrders = await projectedOrders
            .Where(x => x.DateOrdered >= todayStart && x.DateOrdered < tomorrowStart)
            .ToListAsync();

        var weeklyOrders = await projectedOrders
            .Where(x => x.DateOrdered >= weekStart && x.DateOrdered < nextDayAfterToday)
            .ToListAsync();

        var monthlyOrders = await projectedOrders
            .Where(x => x.DateOrdered >= monthStart && x.DateOrdered < nextMonthStart)
            .ToListAsync();

        var monthlyRefunds = monthlyOrders
            .Where(x => string.Equals(x.StatusName, "Refunded", StringComparison.OrdinalIgnoreCase))
            .ToList();

        var locationLabel = "All Locations";

        if (locationId.HasValue)
        {
            locationLabel = await dataContext.Set<Location>()
                .Where(x => x.Id == locationId.Value)
                .Select(x => x.Address)
                .FirstAsync();
        }

        var result = new SalesSummaryDto
        {
            LocationId = locationId,
            LocationLabel = locationLabel,

            DailySales = dailyOrders.Sum(x => x.Total),
            DailyOrders = dailyOrders.Count,

            WeeklySales = weeklyOrders.Sum(x => x.Total),
            WeeklyOrders = weeklyOrders.Count,

            MonthlySales = monthlyOrders.Sum(x => x.Total),
            MonthlyOrders = monthlyOrders.Count,

            RefundsCount = monthlyRefunds.Count,
            RefundsTotal = monthlyRefunds.Sum(x => x.Total)
        };

        return Ok(result);
    }
}
