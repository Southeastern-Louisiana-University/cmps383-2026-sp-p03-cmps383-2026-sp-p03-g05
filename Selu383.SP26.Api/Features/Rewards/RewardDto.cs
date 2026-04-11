using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Rewards;

public class RewardDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Range(0, int.MaxValue)]
    public int PointsBalance { get; set; }

    [Required]
    [MaxLength(50)]
    public string Tier { get; set; } = "Bronze";
}