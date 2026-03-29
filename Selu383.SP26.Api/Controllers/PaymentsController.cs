using Microsoft.AspNetCore.Mvc;
using Selu383.SP26.Api.Features.Payments;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    // 1. The GET Endpoint: Returns a list of saved cards to the frontend
    [HttpGet]
    public ActionResult<List<PaymentDto>> GetAllSavedPayments()
    {
        
        var mockPayments = new List<PaymentDto>
        {
            new PaymentDto 
            { 
                Id = 1, 
                UserId = 1, 
                CardholderName = "Test User", 
                LastFourDigits = "1234", 
                ExpirationDate = "12/28" 
            }
        };

        return Ok(mockPayments);
    }

    // 2. The POST Endpoint: Receives a new card from the frontend to save
    [HttpPost]
    public ActionResult<PaymentDto> CreatePayment(PaymentDto newPayment)
    {
        newPayment.Id = 99; 
        
        
        return Ok(newPayment);
    }
}