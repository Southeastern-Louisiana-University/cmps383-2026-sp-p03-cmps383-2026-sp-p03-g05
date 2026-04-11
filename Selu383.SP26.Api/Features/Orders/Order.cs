using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Features.Orders;

public class Order
{
    public int Id { get; set; }

    public int LocationId { get; set; }
    public virtual Location? Location { get; set; }

    public int OrderStatusId { get; set; }
    public virtual OrderStatus? OrderStatus { get; set; }

    public int UserId { get; set; }
    public virtual User? User { get; set; }

    public string PickupMethod { get; set; } = "In Store";

    public DateTime DateOrdered { get; set; } = DateTime.UtcNow;

    public virtual ICollection<OrderMenuItem> OrderMenuItems { get; set; } = new List<OrderMenuItem>();
}
