using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Controllers;

[Route("api/orders")]
[ApiController]
public class OrdersController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<OrderDto> GetAll()
    {
        return dataContext.Set<Order>()
            .Select(x => new OrderDto
            {
                Id = x.Id,
                UserId = x.UserId,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<OrderDto> GetById(int id)
    {
        var result = dataContext.Set<Order>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new OrderDto
        {
            Id = result.Id,
            UserId = result.UserId,
        });
    }

    [HttpPost]
    [Authorize]
    public ActionResult<OrderDto> Create(OrderDto dto)
    {
        var order = new Order
        {
            UserId = User.GetCurrentUserId() ?? 0,
        };

        dataContext.Set<Order>().Add(order);
        dataContext.SaveChanges();

        dto.Id = order.Id;
        dto.UserId = order.UserId;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize]
    public ActionResult<OrderDto> Update(int id, OrderDto dto)
    {
        var order = dataContext.Set<Order>()
            .FirstOrDefault(x => x.Id == id);

        if (order == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (order.UserId != currentUserId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        dataContext.SaveChanges();

        return Ok(new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
        });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var order = dataContext.Set<Order>()
            .FirstOrDefault(x => x.Id == id);

        if (order == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (order.UserId != currentUserId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        dataContext.Set<Order>().Remove(order);
        dataContext.SaveChanges();

        return Ok();
    }
}
