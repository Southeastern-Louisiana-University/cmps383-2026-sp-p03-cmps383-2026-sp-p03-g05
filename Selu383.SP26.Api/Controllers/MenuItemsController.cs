using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Items;

namespace Selu383.SP26.Api.Controllers;

[Route("api/menu-items")]
[ApiController]
public class MenuItemsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<MenuItemDto> GetAll()
    {
        return dataContext.Set<MenuItem>()
            .Select(x => new MenuItemDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Price = x.Price,
                ImageUrl = x.ImageUrl,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<MenuItemDto> GetById(int id)
    {
        var result = dataContext.Set<MenuItem>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new MenuItemDto
        {
            Id = result.Id,
            Name = result.Name,
            Description = result.Description,
            Price = result.Price,
            ImageUrl = result.ImageUrl,
        });
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<MenuItemDto> Create(MenuItemDto dto)
    {
        var menuItem = new MenuItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
        };

        dataContext.Set<MenuItem>().Add(menuItem);
        dataContext.SaveChanges();

        dto.Id = menuItem.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<MenuItemDto> Update(int id, MenuItemDto dto)
    {
        var menuItem = dataContext.Set<MenuItem>()
            .FirstOrDefault(x => x.Id == id);

        if (menuItem == null)
        {
            return NotFound();
        }

        menuItem.Name = dto.Name;
        menuItem.Description = dto.Description;
        menuItem.Price = dto.Price;
        menuItem.ImageUrl = dto.ImageUrl;

        dataContext.SaveChanges();

        dto.Id = menuItem.Id;

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult Delete(int id)
    {
        var menuItem = dataContext.Set<MenuItem>()
            .FirstOrDefault(x => x.Id == id);

        if (menuItem == null)
        {
            return NotFound();
        }

        dataContext.Set<MenuItem>().Remove(menuItem);
        dataContext.SaveChanges();

        return Ok();
    }
}
