using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Categories;

public class CategoryDto
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;
}
