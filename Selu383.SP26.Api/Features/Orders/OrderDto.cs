namespace Selu383.SP26.Api.Features.Orders;

public class CreateOrderDto
{
    public int LocationId { get; set; }
    public string PickupType { get; set; } = "In Store";
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public List<CreateOrderItemDto> Items { get; set; } = [];
}

public class CreateOrderItemDto
{
    public int? MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
}

public class OrderHistoryDto
{
    public int Id { get; set; }
    public DateTime OrderedAt { get; set; }
    public decimal Total { get; set; }
    public string PickupMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int LocationId { get; set; }
    public string LocationAddress { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = [];
}

public class OrderItemDto
{
    public int MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
