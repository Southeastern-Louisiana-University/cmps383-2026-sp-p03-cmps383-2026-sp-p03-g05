namespace Selu383.SP26.Api.Features.Payments;

public class Payment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardholderName { get; set; } = string.Empty;
    public string LastFourDigits { get; set; } = string.Empty;
    public string ExpirationDate { get; set; } = string.Empty;
}
// foricng git to update