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

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class StaffOrderDto
{
    public int OrderNumber { get; set; }
    public DateTime OrderedAt { get; set; }
    public int ItemCount { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string PickupMethod { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
}

public class StaffOrderDetailItemDto
{
    public int MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class StaffOrderDetailDto
{
    public int OrderNumber { get; set; }
    public DateTime OrderedAt { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string PickupMethod { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public List<StaffOrderDetailItemDto> Items { get; set; } = [];
}

public class CurrentOrderCountsDto
{
    public int InStoreCount { get; set; }
    public int DriveThroughCount { get; set; }
}
