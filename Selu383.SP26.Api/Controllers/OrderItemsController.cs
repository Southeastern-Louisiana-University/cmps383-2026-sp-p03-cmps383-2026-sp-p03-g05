using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.OrderItems;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Controllers;

[Route("api/order-items")]
[ApiController]
public class OrderItemsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<OrderItemDto> GetAll()
    {
        return dataContext.Set<OrderItem>()
            .Select(x => new OrderItemDto
            {
                Id = x.Id,
                OrderId = x.OrderId,
                MenuItemId = x.MenuItemId,
                SpecialInstructions = x.SpecialInstructions,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<OrderItemDto> GetById(int id)
    {
        var result = dataContext.Set<OrderItem>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new OrderItemDto
        {
            Id = result.Id,
            OrderId = result.OrderId,
            MenuItemId = result.MenuItemId,
            SpecialInstructions = result.SpecialInstructions,
        });
    }

    [HttpPost]
    [Authorize]
    public ActionResult<OrderItemDto> Create(OrderItemDto dto)
    {
        // Verify the order belongs to the current user
        var order = dataContext.Set<Order>().FirstOrDefault(x => x.Id == dto.OrderId);
        if (order == null)
        {
            return NotFound("Order not found");
        }

        var currentUserId = User.GetCurrentUserId();
        if (order.UserId != currentUserId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        var orderItem = new OrderItem
        {
            OrderId = dto.OrderId,
            MenuItemId = dto.MenuItemId,
            SpecialInstructions = dto.SpecialInstructions,
        };

        dataContext.Set<OrderItem>().Add(orderItem);
        dataContext.SaveChanges();

        dto.Id = orderItem.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize]
    public ActionResult<OrderItemDto> Update(int id, OrderItemDto dto)
    {
        var orderItem = dataContext.Set<OrderItem>()
            .Include(x => x.Order)
            .FirstOrDefault(x => x.Id == id);

        if (orderItem == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (orderItem.Order.UserId != currentUserId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        orderItem.SpecialInstructions = dto.SpecialInstructions;

        dataContext.SaveChanges();

        return Ok(new OrderItemDto
        {
            Id = orderItem.Id,
            OrderId = orderItem.OrderId,
            MenuItemId = orderItem.MenuItemId,
            SpecialInstructions = orderItem.SpecialInstructions,
        });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var orderItem = dataContext.Set<OrderItem>()
            .Include(x => x.Order)
            .FirstOrDefault(x => x.Id == id);

        if (orderItem == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (orderItem.Order.UserId != currentUserId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        dataContext.Set<OrderItem>().Remove(orderItem);
        dataContext.SaveChanges();

        return Ok();
    }
}
