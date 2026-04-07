using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Items;

public class MenuItemDto
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    [Required]
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}