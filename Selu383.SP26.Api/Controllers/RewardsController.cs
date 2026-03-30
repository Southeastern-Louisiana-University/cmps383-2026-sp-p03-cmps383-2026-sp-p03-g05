using Microsoft.AspNetCore.Mvc;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Rewards; // This connects the controller to your Rewards folder

namespace Selu383.SP26.Api.Controllers; // This matches your folder structure

[Route("api/rewards")]
[ApiController]
public class RewardsController : ControllerBase
{
    private readonly DataContext _dataContext;

    public RewardsController(DataContext dataContext)
    {
        _dataContext = dataContext;
    }

    [HttpGet]
    public ActionResult<IEnumerable<RewardDto>> GetAll()
    {
        var rewards = _dataContext.Set<Reward>()
            .Select(x => new RewardDto
            {
                Id = x.Id,
                UserId = x.UserId,
                PointsBalance = x.PointsBalance,
                Tier = x.Tier
            })
            .ToList();

        return Ok(rewards);
    }

    [HttpPost]
    public ActionResult<RewardDto> Create(RewardDto dto)
    {
        var reward = new Reward
        {
            UserId = dto.UserId,
            PointsBalance = dto.PointsBalance,
            Tier = dto.Tier
        };

        _dataContext.Set<Reward>().Add(reward);
        _dataContext.SaveChanges();

        dto.Id = reward.Id;

        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }
}