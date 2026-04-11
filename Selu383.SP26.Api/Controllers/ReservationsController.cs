using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Reservations;

namespace Selu383.SP26.Api.Controllers;

[Route("api/reservations")]
[ApiController]
public class ReservationsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<ReservationDto> GetAll()
    {
        return dataContext.Set<Reservation>()
            .Select(x => new ReservationDto
            {
                Id = x.Id,
                UserId = x.UserId,
                OrderId = x.OrderId,
                TableId = x.TableId,
                LocationId = x.LocationId,
                Time = x.Time,
                Date = x.Date,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<ReservationDto> GetById(int id)
    {
        var result = dataContext.Set<Reservation>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new ReservationDto
        {
            Id = result.Id,
            UserId = result.UserId,
            OrderId = result.OrderId,
            TableId = result.TableId,
            LocationId = result.LocationId,
            Time = result.Time,
            Date = result.Date,
        });
    }

    [HttpPost]
    [Authorize]
    public ActionResult<ReservationDto> Create(ReservationDto dto)
    {
        var reservation = new Reservation
        {
            UserId = User.GetCurrentUserId() ?? 0,
            OrderId = dto.OrderId,
            TableId = dto.TableId,
            LocationId = dto.LocationId,
            Time = dto.Time,
            Date = dto.Date,
        };

        dataContext.Set<Reservation>().Add(reservation);
        dataContext.SaveChanges();

        dto.Id = reservation.Id;
        dto.UserId = reservation.UserId;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize]
    public ActionResult<ReservationDto> Update(int id, ReservationDto dto)
    {
        var reservation = dataContext.Set<Reservation>()
            .FirstOrDefault(x => x.Id == id);

        if (reservation == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (reservation.UserId != currentUserId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        reservation.OrderId = dto.OrderId;
        reservation.TableId = dto.TableId;
        reservation.LocationId = dto.LocationId;
        reservation.Time = dto.Time;
        reservation.Date = dto.Date;

        dataContext.SaveChanges();

        return Ok(new ReservationDto
        {
            Id = reservation.Id,
            UserId = reservation.UserId,
            OrderId = reservation.OrderId,
            TableId = reservation.TableId,
            LocationId = reservation.LocationId,
            Time = reservation.Time,
            Date = reservation.Date,
        });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var reservation = dataContext.Set<Reservation>()
            .FirstOrDefault(x => x.Id == id);

        if (reservation == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (reservation.UserId != currentUserId && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        dataContext.Set<Reservation>().Remove(reservation);
        dataContext.SaveChanges();

        return Ok();
    }
}
