using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Items;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> userManager;

    public UsersController(UserManager<User> userManager)
    {
        this.userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await userManager.Users
            .Include(x => x.FavoriteItems)
            .Select(x => new UserDto
            {
                Id = x.Id,
                UserName = x.UserName ?? string.Empty,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Address = x.Address,
                City = x.City,
                State = x.State,
                ZipCode = x.ZipCode,
                Roles = x.UserRoles.Select(y => y.Role!.Name ?? string.Empty).ToArray(),
                FavoriteItems = x.FavoriteItems.Select(f => new MenuItemDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    Price = f.Price,
                    ImageUrl = f.ImageUrl
                }).ToArray()
            }).ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await userManager.Users
            .Include(x => x.FavoriteItems)
            .Where(x => x.Id == id)
            .Select(x => new UserDto
            {
                Id = x.Id,
                UserName = x.UserName ?? string.Empty,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Address = x.Address,
                City = x.City,
                State = x.State,
                ZipCode = x.ZipCode,
                Roles = x.UserRoles.Select(y => y.Role!.Name ?? string.Empty).ToArray(),
                FavoriteItems = x.FavoriteItems.Select(f => new MenuItemDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    Price = f.Price,
                    ImageUrl = f.ImageUrl
                }).ToArray()
            }).FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
    {
        using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        var newUser = new User
        {
            UserName = dto.UserName,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            ZipCode = dto.ZipCode
        };

        var createResult = await userManager.CreateAsync(newUser, dto.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest();
        }

        try
        {
            var roleResult = await userManager.AddToRolesAsync(newUser, dto.Roles);
            if (!roleResult.Succeeded)
            {
                return BadRequest();
            }
        }
        catch (InvalidOperationException e) when (e.Message.StartsWith("Role") && e.Message.EndsWith("does not exist."))
        {
            return BadRequest();
        }

        transaction.Complete();

        return Ok(new UserDto
        {
            Id = newUser.Id,
            UserName = newUser.UserName,
            FirstName = newUser.FirstName,
            LastName = newUser.LastName,
            Address = newUser.Address,
            City = newUser.City,
            State = newUser.State,
            ZipCode = newUser.ZipCode,
            Roles = dto.Roles
        });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Update(int id, UserDto dto)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return NotFound();
        }

        // Security: Users can only edit themselves, unless they are an Admin
        var currentUserName = User.Identity?.Name;
        if (user.UserName != currentUserName && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Address = dto.Address;
        user.City = dto.City;
        user.State = dto.State;
        user.ZipCode = dto.ZipCode;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest();
        }

        // Reload user with favorites
        user = await userManager.Users
            .Include(x => x.FavoriteItems)
            .FirstOrDefaultAsync(x => x.Id == id);

        return Ok(new UserDto
        {
            Id = user!.Id,
            UserName = user.UserName ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Address = user.Address,
            City = user.City,
            State = user.State,
            ZipCode = user.ZipCode,
            Roles = (await userManager.GetRolesAsync(user)).ToArray(),
            FavoriteItems = user.FavoriteItems.Select(f => new MenuItemDto
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                Price = f.Price,
                ImageUrl = f.ImageUrl
            }).ToArray()
        });
    }

    [HttpPost("{id}/favorites/{menuItemId}")]
    [Authorize]
    public async Task<ActionResult> AddFavorite(int id, int menuItemId)
    {
        var user = await userManager.Users
            .Include(x => x.FavoriteItems)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        // Security: Users can only add favorites for themselves, unless they are an Admin
        var currentUserName = User.Identity?.Name;
        if (user.UserName != currentUserName && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        // Check if already favorited
        if (user.FavoriteItems.Any(x => x.Id == menuItemId))
        {
            return BadRequest("Item is already in favorites");
        }

        // Add to favorites (we don't need to fetch the MenuItem, EF will handle the relationship)
        var menuItem = new MenuItem { Id = menuItemId };
        user.FavoriteItems.Add(menuItem);

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest();
        }

        return Ok();
    }

    [HttpDelete("{id}/favorites/{menuItemId}")]
    [Authorize]
    public async Task<ActionResult> RemoveFavorite(int id, int menuItemId)
    {
        var user = await userManager.Users
            .Include(x => x.FavoriteItems)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        // Security: Users can only remove favorites for themselves, unless they are an Admin
        var currentUserName = User.Identity?.Name;
        if (user.UserName != currentUserName && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        var favorite = user.FavoriteItems.FirstOrDefault(x => x.Id == menuItemId);
        if (favorite == null)
        {
            return NotFound("Item not in favorites");
        }

        user.FavoriteItems.Remove(favorite);

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest();
        }

        return Ok();
    }
}