using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Categories;
using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Controllers;

[Route("api/categories")]
[ApiController]
public class CategoriesController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<CategoryDto> GetAll()
    {
        return dataContext.Set<Category>()
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                Name = x.Name,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<CategoryDto> GetById(int id)
    {
        var result = dataContext.Set<Category>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new CategoryDto
        {
            Id = result.Id,
            Name = result.Name,
        });
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<CategoryDto> Create(CategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name
        };

        dataContext.Set<Category>().Add(category);
        dataContext.SaveChanges();

        dto.Id = category.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize]
    public ActionResult<CategoryDto> Update(int id, CategoryDto dto)
    {
        var category = dataContext.Set<Category>()
            .FirstOrDefault(x => x.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        category.Name = dto.Name;

        dataContext.SaveChanges();

        dto.Id = category.Id;

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var category = dataContext.Set<Category>()
            .FirstOrDefault(x => x.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        dataContext.Set<Category>().Remove(category);
        dataContext.SaveChanges();

        return Ok();
    }
}
