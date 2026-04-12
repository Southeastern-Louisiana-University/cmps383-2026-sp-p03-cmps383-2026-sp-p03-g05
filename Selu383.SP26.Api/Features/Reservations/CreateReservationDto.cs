using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Reservations;

public class CreateReservationDto
{
    public int LocationId { get; set; }

    public int? OrderId { get; set; }

    [Required]
    public DateOnly Date { get; set; }

    [Required]
    public TimeOnly Time { get; set; }

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }
}
