using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Items;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Controllers;

[Route("api/orders")]
[ApiController]
[Authorize]
public class OrdersController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = RoleNames.Admin + "," + RoleNames.Employee)]
    public async Task<ActionResult<List<StaffOrderDto>>> GetOrders()
    {
        var result = await dataContext.Set<Order>()
            .AsNoTracking()
            .OrderByDescending(x => x.DateOrdered)
            .ThenByDescending(x => x.Id)
            .Select(x => new StaffOrderDto
            {
                OrderedAt = x.DateOrdered,
                ItemCount = x.OrderMenuItems.Sum(y => (int?)y.Quantity) ?? 0,
                LastName = x.User != null ? x.User.LastName : string.Empty,
                FirstName = x.User != null ? x.User.FirstName : string.Empty,
                Phone = x.User != null ? x.User.PhoneNumber ?? string.Empty : string.Empty,
                Location = x.Location != null ? x.Location.Address : string.Empty,
                PickupMethod = x.PickupMethod,
                OrderStatus = x.OrderStatus != null ? x.OrderStatus.Name : string.Empty,
                OrderNumber = x.Id
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RoleNames.Admin + "," + RoleNames.Employee)]
    public async Task<ActionResult<StaffOrderDetailDto>> GetOrderDetails(int id)
    {
        var result = await dataContext.Set<Order>()
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new StaffOrderDetailDto
            {
                OrderNumber = x.Id,
                OrderedAt = x.DateOrdered,
                LastName = x.User != null ? x.User.LastName : string.Empty,
                FirstName = x.User != null ? x.User.FirstName : string.Empty,
                Phone = x.User != null ? x.User.PhoneNumber ?? string.Empty : string.Empty,
                Location = x.Location != null ? x.Location.Address : string.Empty,
                PickupMethod = x.PickupMethod,
                OrderStatus = x.OrderStatus != null ? x.OrderStatus.Name : string.Empty,
                Total = x.OrderMenuItems.Sum(y => (decimal?)(y.Quantity * y.MenuItem!.Price)) ?? 0m,
                Items = x.OrderMenuItems
                    .OrderBy(y => y.MenuItem!.ItemName)
                    .Select(y => new StaffOrderDetailItemDto
                    {
                        MenuItemId = y.MenuItemId,
                        Name = y.MenuItem != null ? y.MenuItem.ItemName : string.Empty,
                        Quantity = y.Quantity,
                        UnitPrice = y.MenuItem != null ? y.MenuItem.Price : 0m,
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync();

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpGet("current-summary")]
    [Authorize(Roles = RoleNames.Admin + "," + RoleNames.Employee)]
    public async Task<ActionResult<CurrentOrderCountsDto>> GetCurrentOrderCounts()
    {
        try
        {
            var orderSnapshots = await dataContext.Set<Order>()
                .AsNoTracking()
                .Select(x => new
                {
                    x.PickupMethod,
                    StatusName = x.OrderStatus != null ? x.OrderStatus.Name : string.Empty
                })
                .ToListAsync();

            var activeOrders = orderSnapshots
                .Where(x =>
                    !string.Equals(x.StatusName, "Cancelled", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(x.StatusName, "Completed", StringComparison.OrdinalIgnoreCase))
                .ToList();

            var inStoreCount = activeOrders
                .Count(x => string.Equals(x.PickupMethod, "In Store", StringComparison.OrdinalIgnoreCase));

            var driveThroughCount = activeOrders
                .Count(x => string.Equals(x.PickupMethod, "Drive Through", StringComparison.OrdinalIgnoreCase));

            return Ok(new CurrentOrderCountsDto
            {
                InStoreCount = inStoreCount,
                DriveThroughCount = driveThroughCount
            });
        }
        catch (Exception exception)
        {
            Console.WriteLine($"Current summary fallback: {exception.Message}");
            return Ok(new CurrentOrderCountsDto
            {
                InStoreCount = 0,
                DriveThroughCount = 0
            });
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = RoleNames.Admin + "," + RoleNames.Employee)]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto? dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
        {
            return BadRequest("Status is required.");
        }

        var order = await dataContext.Set<Order>()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
        {
            return NotFound();
        }

        var trimmedStatus = dto.Status.Trim();

        var statusEntity = await dataContext.Set<OrderStatus>()
            .FirstOrDefaultAsync(x => x.Name == trimmedStatus);

        if (statusEntity == null)
        {
            return BadRequest($"Invalid status: {trimmedStatus}");
        }

        order.OrderStatusId = statusEntity.Id;

        await dataContext.SaveChangesAsync();

        return Ok(new
        {
            orderId = order.Id,
            status = trimmedStatus
        });
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<OrderHistoryDto>>> History()
    {
        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var result = await dataContext.Set<Order>()
            .AsNoTracking()
            .Where(x => x.UserId == currentUserId.Value)
            .OrderByDescending(x => x.DateOrdered)
            .ThenByDescending(x => x.Id)
            .Take(10)
            .Select(x => new OrderHistoryDto
            {
                Id = x.Id,
                OrderedAt = x.DateOrdered,
                Total = x.OrderMenuItems.Sum(y => (decimal?)(y.Quantity * y.MenuItem!.Price)) ?? 0m,
                PickupMethod = x.PickupMethod,
                Status = x.OrderStatus != null ? x.OrderStatus.Name : string.Empty,
                LocationId = x.LocationId,
                LocationAddress = x.Location != null ? x.Location.Address : string.Empty,
                Items = x.OrderMenuItems
                    .OrderBy(y => y.MenuItem!.ItemName)
                    .Select(y => new OrderItemDto
                    {
                        MenuItemId = y.MenuItemId,
                        Name = y.MenuItem != null ? y.MenuItem.ItemName : string.Empty,
                        Quantity = y.Quantity,
                        UnitPrice = y.MenuItem != null ? y.MenuItem.Price : 0m,
                        ImageUrl = null,
                    })
                    .ToList(),
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateOrderDto dto)
    {
        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        if (dto.LocationId <= 0)
        {
            return BadRequest("Location is required.");
        }

        if (!await dataContext.Set<Location>().AnyAsync(x => x.Id == dto.LocationId))
        {
            return BadRequest("Selected location was not found.");
        }

        var pickupMethod = NormalizePickupType(dto.PickupType);
        if (pickupMethod == null)
        {
            return BadRequest("Pickup must be 'In Store' or 'Drive Through'.");
        }

        if (dto.Items == null || dto.Items.Count == 0)
        {
            return BadRequest("Order requires at least one item.");
        }

        var receivedStatusId = await dataContext.Set<OrderStatus>()
            .Where(x => x.Name == "Received")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (receivedStatusId == 0)
        {
            return Problem("Order status 'Received' is missing.");
        }

        var knownMenuItems = await dataContext.Set<MenuItem>()
            .AsNoTracking()
            .Select(x => new { x.Id, x.ItemName })
            .ToListAsync();

        var menuItemById = knownMenuItems.ToDictionary(x => x.Id);
        var menuItemByName = knownMenuItems.ToDictionary(x => x.ItemName, StringComparer.OrdinalIgnoreCase);

        var orderItems = new List<(int MenuItemId, int Quantity)>();
        foreach (var item in dto.Items)
        {
            if (item.Quantity < 1)
            {
                return BadRequest("Each order item must have a quantity of at least 1.");
            }

            int menuItemId;
            if (item.MenuItemId.HasValue)
            {
                if (!menuItemById.TryGetValue(item.MenuItemId.Value, out _))
                {
                    return BadRequest($"Menu item id {item.MenuItemId.Value} was not found.");
                }

                menuItemId = item.MenuItemId.Value;
            }
            else
            {
                var itemName = item.Name?.Trim() ?? string.Empty;
                if (itemName.Length == 0)
                {
                    return BadRequest("Menu item name is required when menuItemId is not provided.");
                }

                if (!menuItemByName.TryGetValue(itemName, out var foundMenuItem))
                {
                    return BadRequest($"Menu item '{itemName}' was not found.");
                }

                menuItemId = foundMenuItem.Id;
            }

            orderItems.Add((menuItemId, item.Quantity));
        }

        var condensedItems = orderItems
            .GroupBy(x => x.MenuItemId)
            .Select(x => new { MenuItemId = x.Key, Quantity = x.Sum(y => y.Quantity) })
            .ToList();

        var order = new Order
        {
            UserId = currentUserId.Value,
            LocationId = dto.LocationId,
            OrderStatusId = receivedStatusId,
            PickupMethod = pickupMethod,
            DateOrdered = DateTime.UtcNow,
            OrderMenuItems = condensedItems
                .Select(x => new OrderMenuItem
                {
                    MenuItemId = x.MenuItemId,
                    Quantity = x.Quantity,
                })
                .ToList(),
        };

        dataContext.Set<Order>().Add(order);
        await dataContext.SaveChangesAsync();

        return Ok();
    }

    private static string? NormalizePickupType(string? value)
    {
        if (value == null)
        {
            return null;
        }

        var normalized = value.Trim();
        if (normalized.Equals("In Store", StringComparison.OrdinalIgnoreCase))
        {
            return "In Store";
        }

        if (normalized.Equals("Drive Through", StringComparison.OrdinalIgnoreCase))
        {
            return "Drive Through";
        }

        return null;
    }
}
