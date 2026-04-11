using Selu383.SP26.Api.Features.Items;

namespace Selu383.SP26.Api.Features.Orders;

public class OrderMenuItem
{
    public int OrderId { get; set; }
    public virtual Order? Order { get; set; }

    public int MenuItemId { get; set; }
    public virtual MenuItem? MenuItem { get; set; }

    public int Quantity { get; set; } = 1;
}
