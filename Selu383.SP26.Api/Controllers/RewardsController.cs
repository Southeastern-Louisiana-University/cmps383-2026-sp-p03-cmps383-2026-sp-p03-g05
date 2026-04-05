using Microsoft.AspNetCore.Mvc;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Rewards;

namespace Selu383.SP26.Api.Controllers;

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
        return Ok(_dataContext.Set<Reward>().Select(x => new RewardDto
        {
            Id = x.Id,
            UserId = x.UserId,
            PointsBalance = x.PointsBalance,
            Tier = x.Tier
        }).ToList());
    }

    [HttpGet("{id}")]
    public ActionResult<RewardDto> GetById(int id)
    {
        var reward = _dataContext.Set<Reward>().FirstOrDefault(x => x.Id == id);
        if (reward == null) return NotFound();

        return Ok(new RewardDto
        {
            Id = reward.Id,
            UserId = reward.UserId,
            PointsBalance = reward.PointsBalance,
            Tier = reward.Tier
        });
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
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    public ActionResult<RewardDto> Update(int id, RewardDto dto)
    {
        var reward = _dataContext.Set<Reward>().FirstOrDefault(x => x.Id == id);
        if (reward == null) return NotFound();

        reward.PointsBalance = dto.PointsBalance;
        reward.Tier = dto.Tier;
        reward.UserId = dto.UserId;

        _dataContext.SaveChanges();
        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        var reward = _dataContext.Set<Reward>().FirstOrDefault(x => x.Id == id);
        if (reward == null) return NotFound();

        _dataContext.Set<Reward>().Remove(reward);
        _dataContext.SaveChanges();
        return Ok();
    }
}