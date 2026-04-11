namespace Selu383.SP26.Api.Features.Rewards;

public class Reward
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int PointsBalance { get; set; }
    public string Tier { get; set; } = "Bronze";
}