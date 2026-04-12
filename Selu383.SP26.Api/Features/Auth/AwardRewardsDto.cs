using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Auth;

public class AwardRewardsDto
{
    [Range(1, int.MaxValue)]
    public int PointsToAdd { get; set; }
}
