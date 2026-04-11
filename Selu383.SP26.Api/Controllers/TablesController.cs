using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Controllers;

[Route("api/tables")]
[ApiController]
public class TablesController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TableDto>>> GetAll()
    {
        var result = await dataContext.Set<Table>()
            .AsNoTracking()
            .OrderBy(x => x.LocationId)
            .ThenBy(x => x.Number)
            .Select(x => new TableDto
            {
                Id = x.Id,
                Number = x.Number,
                LocationId = x.LocationId,
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TableDto>> GetById(int id)
    {
        var table = await dataContext.Set<Table>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (table == null)
        {
            return NotFound();
        }

        return Ok(new TableDto
        {
            Id = table.Id,
            Number = table.Number,
            LocationId = table.LocationId,
        });
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<TableDto>> Create(TableDto dto)
    {
        var validationError = await ValidateTablePayload(dto, null);
        if (validationError != null)
        {
            return BadRequest(validationError);
        }

        var table = new Table
        {
            Number = dto.Number,
            LocationId = dto.LocationId,
        };

        dataContext.Set<Table>().Add(table);
        await dataContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = table.Id }, new TableDto
        {
            Id = table.Id,
            Number = table.Number,
            LocationId = table.LocationId,
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<TableDto>> Update(int id, TableDto dto)
    {
        var table = await dataContext.Set<Table>()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (table == null)
        {
            return NotFound();
        }

        var validationError = await ValidateTablePayload(dto, id);
        if (validationError != null)
        {
            return BadRequest(validationError);
        }

        table.Number = dto.Number;
        table.LocationId = dto.LocationId;

        await dataContext.SaveChangesAsync();

        return Ok(new TableDto
        {
            Id = table.Id,
            Number = table.Number,
            LocationId = table.LocationId,
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult> Delete(int id)
    {
        var table = await dataContext.Set<Table>()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (table == null)
        {
            return NotFound();
        }

        dataContext.Set<Table>().Remove(table);
        await dataContext.SaveChangesAsync();

        return Ok();
    }

    private async Task<string?> ValidateTablePayload(TableDto dto, int? existingTableId)
    {
        if (dto.Number <= 0)
        {
            return "Table number must be greater than zero.";
        }

        if (dto.LocationId <= 0)
        {
            return "LocationId must be greater than zero.";
        }

        var locationExists = await dataContext.Set<Location>()
            .AsNoTracking()
            .AnyAsync(x => x.Id == dto.LocationId);
        if (!locationExists)
        {
            return $"Location {dto.LocationId} was not found.";
        }

        var duplicateExists = await dataContext.Set<Table>()
            .AsNoTracking()
            .AnyAsync(x =>
                x.LocationId == dto.LocationId &&
                x.Number == dto.Number &&
                (!existingTableId.HasValue || x.Id != existingTableId.Value));
        if (duplicateExists)
        {
            return "A table with this number already exists at this location.";
        }

        return null;
    }
}
