using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Locations;

public class LocationManageDto
{
    [Required]
    [MaxLength(240)]
    public string Address { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int TableCount { get; set; }
}
