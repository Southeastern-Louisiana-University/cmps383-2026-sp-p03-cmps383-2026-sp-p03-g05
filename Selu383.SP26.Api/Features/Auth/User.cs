using Microsoft.AspNetCore.Identity;
using Selu383.SP26.Api.Features.Rewards;
using Selu383.SP26.Api.Features.Payments;
using Selu383.SP26.Api.Features.Items;

namespace Selu383.SP26.Api.Features.Auth;

public class User : IdentityUser<int>
{
    // Added for "Name updates"
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // Added for "Address updates"
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    // Navigation properties: This "links" the User to their Rewards and Payments
    public virtual ICollection<Reward> Rewards { get; set; } = new List<Reward>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<MenuItem> FavoriteItems { get; set; } = new List<MenuItem>();
}