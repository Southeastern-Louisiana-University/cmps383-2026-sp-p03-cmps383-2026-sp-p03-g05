using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;

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
            .Select(x => new UserDto
            {
                Id = x.Id,
                UserName = x.UserName ?? string.Empty,
                PridePoints = x.RewardsTotal,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Address = x.Address,
                City = x.City,
                State = x.State,
                ZipCode = x.ZipCode,
                Roles = x.UserRoles.Select(y => y.Role!.Name ?? string.Empty).ToArray()
            }).ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await userManager.Users
            .Where(x => x.Id == id)
            .Select(x => new UserDto
            {
                Id = x.Id,
                UserName = x.UserName ?? string.Empty,
                PridePoints = x.RewardsTotal,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Address = x.Address,
                City = x.City,
                State = x.State,
                ZipCode = x.ZipCode,
                Roles = x.UserRoles.Select(y => y.Role!.Name ?? string.Empty).ToArray()
            }).FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
    {
        if (!dto.HasAgreedToPolicies)
        {
            return BadRequest("Terms of Service and Privacy Policy must be accepted.");
        }

        using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        var assignedRoles = User.IsInRole(RoleNames.Admin) ? dto.Roles : [RoleNames.User];

        var newUser = new User
        {
            UserName = dto.UserName,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            ZipCode = dto.ZipCode,
            RewardsTotal = dto.PridePoints
        };

        var createResult = await userManager.CreateAsync(newUser, dto.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest();
        }

        try
        {
            var roleResult = await userManager.AddToRolesAsync(newUser, assignedRoles);
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
            PridePoints = newUser.RewardsTotal,
            FirstName = newUser.FirstName,
            LastName = newUser.LastName,
            Address = newUser.Address,
            City = newUser.City,
            State = newUser.State,
            ZipCode = newUser.ZipCode,
            Roles = assignedRoles
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
        user.RewardsTotal = dto.PridePoints;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest();
        }

        return Ok(new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            PridePoints = user.RewardsTotal,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Address = user.Address,
            City = user.City,
            State = user.State,
            ZipCode = user.ZipCode,
            Roles = (await userManager.GetRolesAsync(user)).ToArray()
        });
    }

    [HttpPost("{id}/rewards")]
    [Authorize]
    public async Task<ActionResult<AwardRewardsResultDto>> AwardRewards(int id, AwardRewardsDto dto)
    {
        if (dto.PointsToAdd < 1)
        {
            return BadRequest("PointsToAdd must be greater than zero.");
        }

        var user = await userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized();
        }

        if (currentUserId != id && !User.IsInRole(RoleNames.Admin))
        {
            return Forbid();
        }

        try
        {
            checked
            {
                user.RewardsTotal += dto.PointsToAdd;
            }
        }
        catch (OverflowException)
        {
            return BadRequest("Rewards total overflow.");
        }

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return BadRequest();
        }

        return Ok(new AwardRewardsResultDto
        {
            UserId = user.Id,
            PointsAwarded = dto.PointsToAdd,
            PridePoints = user.RewardsTotal
        });
    }
}
