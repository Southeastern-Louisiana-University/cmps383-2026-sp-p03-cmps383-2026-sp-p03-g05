using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.OrderItems;

namespace Selu383.SP26.Api.Features.Orders
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    }
}
