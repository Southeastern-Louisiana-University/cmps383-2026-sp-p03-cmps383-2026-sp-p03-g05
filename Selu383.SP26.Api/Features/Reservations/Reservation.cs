using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;
using Selu383.SP26.Api.Features.Tables;

namespace Selu383.SP26.Api.Features.Reservations;

public class Reservation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int? OrderId { get; set; }
    public Order? Order { get; set; }
    public int TableId { get; set; }
    public Table Table { get; set; } = null!;
    public int LocationId { get; set; }
    public Location Location { get; set; } = null!;
    public TimeOnly Time { get; set; }
    public DateOnly Date { get; set; }
}
