using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Controllers;

[Route("api/locations")]
[ApiController]
public class LocationsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<LocationDto> GetAll()
    {
        return dataContext.Set<Location>()
            .Select(x => new LocationDto
            {
                Id = x.Id,
                Name = x.Name,
                Address = x.Address,
                TableCount = x.TableCount,
                ManagerId = x.ManagerId,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<LocationDto> GetById(int id)
    {
        var result = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(ToDto(result));
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<LocationDto> Create(LocationDto dto)
    {
        if (dto.TableCount < 1)
        {
            return BadRequest();
        }

        var location = new Location
        {
            Name = dto.Name,
            Address = dto.Address,
            TableCount = dto.TableCount,
            ManagerId = dto.ManagerId
        };

        dataContext.Set<Location>().Add(location);
        dataContext.SaveChanges();

        dto.Id = location.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize]
    public ActionResult<LocationDto> Update(int id, LocationDto dto)
    {
        if (dto.TableCount < 1)
        {
            return BadRequest();
        }

        var location = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
        {
            return Forbid();
        }

        location.Name = dto.Name;
        location.Address = dto.Address;
        location.TableCount = dto.TableCount;
        location.ManagerId = dto.ManagerId;

        dataContext.SaveChanges();

        dto.Id = location.Id;

        return Ok(dto);
    }

    [HttpPost("manage")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<LocationDto>> CreateForManagement(LocationManageDto dto)
    {
        var normalizedAddress = (dto.Address ?? string.Empty).Trim();
        if (normalizedAddress.Length == 0)
        {
            return BadRequest("Address is required.");
        }

        if (dto.TableCount < 1)
        {
            return BadRequest("Table count must be at least 1.");
        }

        var location = new Location
        {
            Name = await GenerateNextLocationNameAsync(),
            Address = normalizedAddress,
            TableCount = dto.TableCount
        };

        dataContext.Set<Location>().Add(location);
        await dataContext.SaveChangesAsync();

        var result = ToDto(location);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id}/manage")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<LocationDto>> UpdateForManagement(int id, LocationManageDto dto)
    {
        var normalizedAddress = (dto.Address ?? string.Empty).Trim();
        if (normalizedAddress.Length == 0)
        {
            return BadRequest("Address is required.");
        }

        if (dto.TableCount < 1)
        {
            return BadRequest("Table count must be at least 1.");
        }

        var location = await dataContext.Set<Location>()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        location.Address = normalizedAddress;
        location.TableCount = dto.TableCount;
        await dataContext.SaveChangesAsync();

        return Ok(ToDto(location));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var location = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
        {
            return Forbid();
        }

        dataContext.Set<Location>().Remove(location);
        dataContext.SaveChanges();

        return Ok();
    }

    private static LocationDto ToDto(Location x)
    {
        return new LocationDto
        {
            Id = x.Id,
            Name = x.Name,
            Address = x.Address,
            TableCount = x.TableCount,
            ManagerId = x.ManagerId,
        };
    }

    private async Task<string> GenerateNextLocationNameAsync()
    {
        var existingNames = await dataContext.Set<Location>()
            .Select(x => x.Name)
            .ToListAsync();

        var index = 1;
        while (existingNames.Any(name =>
            string.Equals(name, $"Location {index}", StringComparison.OrdinalIgnoreCase)))
        {
            index++;
        }

        return $"Location {index}";
    }
}
