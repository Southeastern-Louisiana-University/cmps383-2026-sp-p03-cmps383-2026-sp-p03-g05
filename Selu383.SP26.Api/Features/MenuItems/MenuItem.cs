using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.Items;

public class MenuItem
{
    public int Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Drink or Food
    public bool Featured { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Nutrition { get; set; } = string.Empty;

    public virtual ICollection<OrderMenuItem> OrderMenuItems { get; set; } = new List<OrderMenuItem>();
}
