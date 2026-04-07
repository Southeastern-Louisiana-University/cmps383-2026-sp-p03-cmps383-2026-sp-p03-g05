using Selu383.SP26.Api.Features.Items;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.OrderItems
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public int MenuItemId { get; set; }
        public MenuItem MenuItem { get; set; } = null!;
        public string SpecialInstructions { get; set; } = string.Empty;
    }
}
