using Selu383.SP26.Api.Features.Items;

namespace Selu383.SP26.Api.Features.Auth;

public class UserDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int PridePoints { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }

    public string[] Roles { get; set; } = Array.Empty<string>();
    public MenuItemDto[] FavoriteItems { get; set; } = Array.Empty<MenuItemDto>();
}
