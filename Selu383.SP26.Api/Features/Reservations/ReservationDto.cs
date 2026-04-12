using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Reservations;

public class ReservationDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? OrderId { get; set; }

    public int TableId { get; set; }

    public int LocationId { get; set; }

    [Required]
    public TimeOnly Time { get; set; }

    [Required]
    public DateOnly Date { get; set; }
}
