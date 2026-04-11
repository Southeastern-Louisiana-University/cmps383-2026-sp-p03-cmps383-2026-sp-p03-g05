using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Payments;

public class PaymentDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(120)]
    public string CardholderName { get; set; } = string.Empty;

    [Required]
    [MaxLength(4)]
    public string LastFourDigits { get; set; } = string.Empty;

    [Required]
    public string ExpirationDate { get; set; } = string.Empty;
}