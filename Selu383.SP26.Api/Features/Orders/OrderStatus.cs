namespace Selu383.SP26.Api.Features.Orders;

public class OrderStatus
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
