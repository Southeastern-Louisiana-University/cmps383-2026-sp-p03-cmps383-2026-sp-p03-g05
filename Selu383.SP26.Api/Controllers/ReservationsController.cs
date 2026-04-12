using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Reservations;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Controllers;

[Route("api/reservations")]
[ApiController]
[Authorize]
public class ReservationsController(DataContext dataContext) : ControllerBase
{
    private const int OpeningHour = 6;
    private const int ClosingHour = 21;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetAll()
    {
        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var query = dataContext.Set<Reservation>().AsNoTracking();
        if (!User.IsInRole(RoleNames.Admin))
        {
            query = query.Where(x => x.UserId == currentUserId.Value);
        }

        var result = await query
            .OrderByDescending(x => x.Date)
            .ThenBy(x => x.Time)
            .Select(x => new ReservationDto
            {
                Id = x.Id,
                UserId = x.UserId,
                OrderId = x.OrderId,
                TableId = x.TableId,
                LocationId = x.LocationId,
                Time = x.Time,
                Date = x.Date,
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("availability")]
    public async Task<ActionResult<ReservationAvailabilityDto>> GetAvailability([FromQuery] int locationId, [FromQuery] DateOnly date)
    {
        if (locationId <= 0)
        {
            return BadRequest("LocationId must be greater than zero.");
        }

        if (date == default)
        {
            return BadRequest("Date is required.");
        }

        var location = await dataContext.Set<Location>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == locationId);
        if (location == null)
        {
            return NotFound($"Location {locationId} was not found.");
        }

        var tableIds = await EnsureTablesForLocationAsync(location.Id, location.TableCount);
        if (tableIds.Count == 0)
        {
            return Ok(new ReservationAvailabilityDto
            {
                LocationId = location.Id,
                Date = date,
                TotalTables = 0,
                TimeSlots = BuildTimeSlots(0, new Dictionary<TimeOnly, int>()),
            });
        }

        var bookedByTime = await dataContext.Set<Reservation>()
            .AsNoTracking()
            .Where(x => x.LocationId == location.Id && x.Date == date)
            .GroupBy(x => x.Time)
            .Select(x => new { Time = x.Key, Count = x.Count() })
            .ToListAsync();

        var bookedLookup = bookedByTime.ToDictionary(x => x.Time, x => x.Count);

        return Ok(new ReservationAvailabilityDto
        {
            LocationId = location.Id,
            Date = date,
            TotalTables = tableIds.Count,
            TimeSlots = BuildTimeSlots(tableIds.Count, bookedLookup),
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationDto>> GetById(int id)
    {
        var reservation = await dataContext.Set<Reservation>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (reservation == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        if (!User.IsInRole(RoleNames.Admin) && reservation.UserId != currentUserId.Value)
        {
            return Forbid();
        }

        return Ok(ToDto(reservation));
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(CreateReservationDto dto)
    {
        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var validationMessage = ValidateCreateRequest(dto);
        if (validationMessage != null)
        {
            return BadRequest(validationMessage);
        }

        var location = await dataContext.Set<Location>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dto.LocationId);
        if (location == null)
        {
            return NotFound($"Location {dto.LocationId} was not found.");
        }

        if (dto.OrderId.HasValue)
        {
            var order = await dataContext.Set<Order>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == dto.OrderId.Value);
            if (order == null)
            {
                return BadRequest($"Order {dto.OrderId.Value} was not found.");
            }

            if (order.LocationId != dto.LocationId)
            {
                return BadRequest("Order location must match reservation location.");
            }

            if (!User.IsInRole(RoleNames.Admin) && order.UserId != currentUserId.Value)
            {
                return Forbid();
            }
        }

        await using var transaction = await dataContext.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var tableIds = await EnsureTablesForLocationAsync(location.Id, location.TableCount);
        if (tableIds.Count == 0)
        {
            return BadRequest("No tables are configured for this location.");
        }

        var bookedTableIds = await dataContext.Set<Reservation>()
            .AsNoTracking()
            .Where(x => x.LocationId == dto.LocationId && x.Date == dto.Date && x.Time == dto.Time)
            .Select(x => x.TableId)
            .ToListAsync();

        var bookedSet = bookedTableIds.ToHashSet();
        var selectedTableId = tableIds.FirstOrDefault(x => !bookedSet.Contains(x));
        if (selectedTableId == 0)
        {
            return Conflict("Selected time slot is fully booked.");
        }

        var reservation = new Reservation
        {
            UserId = currentUserId.Value,
            OrderId = dto.OrderId,
            TableId = selectedTableId,
            LocationId = dto.LocationId,
            Time = dto.Time,
            Date = dto.Date,
        };

        dataContext.Set<Reservation>().Add(reservation);
        await dataContext.SaveChangesAsync();
        await transaction.CommitAsync();

        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, ToDto(reservation));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ReservationDto>> Update(int id, CreateReservationDto dto)
    {
        var reservation = await dataContext.Set<Reservation>()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (reservation == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        if (!User.IsInRole(RoleNames.Admin) && reservation.UserId != currentUserId.Value)
        {
            return Forbid();
        }

        var validationMessage = ValidateCreateRequest(dto);
        if (validationMessage != null)
        {
            return BadRequest(validationMessage);
        }

        var location = await dataContext.Set<Location>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dto.LocationId);
        if (location == null)
        {
            return NotFound($"Location {dto.LocationId} was not found.");
        }

        if (dto.OrderId.HasValue)
        {
            var order = await dataContext.Set<Order>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == dto.OrderId.Value);
            if (order == null)
            {
                return BadRequest($"Order {dto.OrderId.Value} was not found.");
            }

            if (order.LocationId != dto.LocationId)
            {
                return BadRequest("Order location must match reservation location.");
            }

            if (!User.IsInRole(RoleNames.Admin) && order.UserId != reservation.UserId)
            {
                return Forbid();
            }
        }

        await using var transaction = await dataContext.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var tableIds = await EnsureTablesForLocationAsync(location.Id, location.TableCount);
        if (tableIds.Count == 0)
        {
            return BadRequest("No tables are configured for this location.");
        }

        var bookedTableIds = await dataContext.Set<Reservation>()
            .AsNoTracking()
            .Where(x =>
                x.Id != reservation.Id &&
                x.LocationId == dto.LocationId &&
                x.Date == dto.Date &&
                x.Time == dto.Time)
            .Select(x => x.TableId)
            .ToListAsync();

        var bookedSet = bookedTableIds.ToHashSet();
        var selectedTableId = tableIds.FirstOrDefault(x => !bookedSet.Contains(x));
        if (selectedTableId == 0)
        {
            return Conflict("Selected time slot is fully booked.");
        }

        reservation.OrderId = dto.OrderId;
        reservation.LocationId = dto.LocationId;
        reservation.Time = dto.Time;
        reservation.Date = dto.Date;
        reservation.TableId = selectedTableId;

        await dataContext.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(ToDto(reservation));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var reservation = await dataContext.Set<Reservation>()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (reservation == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        if (!User.IsInRole(RoleNames.Admin) && reservation.UserId != currentUserId.Value)
        {
            return Forbid();
        }

        dataContext.Set<Reservation>().Remove(reservation);
        await dataContext.SaveChangesAsync();

        return Ok();
    }

    private static List<ReservationTimeSlotDto> BuildTimeSlots(int totalTables, IReadOnlyDictionary<TimeOnly, int> bookedLookup)
    {
        var slots = new List<ReservationTimeSlotDto>();
        for (int hour = OpeningHour; hour <= ClosingHour; hour++)
        {
            var time = new TimeOnly(hour, 0);
            var bookedCount = bookedLookup.TryGetValue(time, out var value) ? value : 0;
            var availableCount = Math.Max(0, totalTables - bookedCount);
            slots.Add(new ReservationTimeSlotDto
            {
                Time = time,
                AvailableTables = availableCount,
                IsAvailable = availableCount > 0,
            });
        }

        return slots;
    }

    private async Task<List<int>> EnsureTablesForLocationAsync(int locationId, int locationTableCount)
    {
        var tables = await dataContext.Set<Table>()
            .Where(x => x.LocationId == locationId)
            .OrderBy(x => x.Number)
            .ToListAsync();

        var desiredCount = Math.Max(locationTableCount, tables.Count);
        if (desiredCount < 1)
        {
            return [];
        }

        if (tables.Count < desiredCount)
        {
            var existingNumbers = tables.Select(x => x.Number).ToHashSet();
            for (int number = 1; number <= desiredCount; number++)
            {
                if (!existingNumbers.Contains(number))
                {
                    dataContext.Set<Table>().Add(new Table
                    {
                        Number = number,
                        LocationId = locationId,
                    });
                }
            }

            await dataContext.SaveChangesAsync();

            tables = await dataContext.Set<Table>()
                .Where(x => x.LocationId == locationId)
                .OrderBy(x => x.Number)
                .ToListAsync();
        }

        return tables.Select(x => x.Id).ToList();
    }

    private static string? ValidateCreateRequest(CreateReservationDto dto)
    {
        if (dto.LocationId <= 0)
        {
            return "LocationId must be greater than zero.";
        }

        if (dto.Date == default)
        {
            return "Date is required.";
        }

        if (dto.Time == default)
        {
            return "Time is required.";
        }

        if (dto.Time.Minute != 0 || dto.Time.Second != 0)
        {
            return "Reservation time must be on 1-hour intervals.";
        }

        if (dto.Time.Hour < OpeningHour || dto.Time.Hour > ClosingHour)
        {
            return "Reservation time must be between 6:00 AM and 9:00 PM.";
        }

        return null;
    }

    private static ReservationDto ToDto(Reservation reservation)
    {
        return new ReservationDto
        {
            Id = reservation.Id,
            UserId = reservation.UserId,
            OrderId = reservation.OrderId,
            TableId = reservation.TableId,
            LocationId = reservation.LocationId,
            Time = reservation.Time,
            Date = reservation.Date,
        };
    }
}
