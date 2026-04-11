using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Controllers;

[Route("api/tables")]
[ApiController]
public class TablesController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<TableDto> GetAll()
    {
        return dataContext.Set<Table>()
            .Select(x => new TableDto
            {
                Id = x.Id,
                Number = x.Number,
                LocationId = x.LocationId,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<TableDto> GetById(int id)
    {
        var result = dataContext.Set<Table>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new TableDto
        {
            Id = result.Id,
            Number = result.Number,
            LocationId = result.LocationId,
        });
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<TableDto> Create(TableDto dto)
    {
        var table = new Table
        {
            Number = dto.Number,
            LocationId = dto.LocationId,
        };

        dataContext.Set<Table>().Add(table);
        dataContext.SaveChanges();

        dto.Id = table.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<TableDto> Update(int id, TableDto dto)
    {
        var table = dataContext.Set<Table>()
            .FirstOrDefault(x => x.Id == id);

        if (table == null)
        {
            return NotFound();
        }

        table.Number = dto.Number;
        table.LocationId = dto.LocationId;

        dataContext.SaveChanges();

        dto.Id = table.Id;

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult Delete(int id)
    {
        var table = dataContext.Set<Table>()
            .FirstOrDefault(x => x.Id == id);

        if (table == null)
        {
            return NotFound();
        }

        dataContext.Set<Table>().Remove(table);
        dataContext.SaveChanges();

        return Ok();
    }
}
