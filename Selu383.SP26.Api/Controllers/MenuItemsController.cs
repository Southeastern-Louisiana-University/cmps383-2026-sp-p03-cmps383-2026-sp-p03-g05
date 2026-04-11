using Microsoft.AspNetCore.Mvc;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Items;

namespace Selu383.SP26.Api.Controllers;

[Route("api/menuitems")]
[ApiController]
public class MenuItemsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<MenuItemDto> GetAll()
    {
        return dataContext.Set<MenuItem>()
            .OrderBy(x => x.Id)
            .Select(x => new MenuItemDto
            {
                Id = x.Id,
                ItemName = x.ItemName,
                Type = x.Type,
                Featured = x.Featured,
                Price = x.Price,
                Description = x.Description,
                Nutrition = x.Nutrition,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<MenuItemDto> GetById(int id)
    {
        var result = dataContext.Set<MenuItem>()
            .Where(x => x.Id == id)
            .Select(x => new MenuItemDto
            {
                Id = x.Id,
                ItemName = x.ItemName,
                Type = x.Type,
                Featured = x.Featured,
                Price = x.Price,
                Description = x.Description,
                Nutrition = x.Nutrition,
            })
            .FirstOrDefault();

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }
}
