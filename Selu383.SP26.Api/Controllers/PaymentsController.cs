using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Features.Payments;

namespace Selu383.SP26.Api.Controllers;

[Route("api/payments")]
[ApiController]
public class PaymentsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<PaymentDto> GetAll()
    {
        return dataContext.Set<Payment>()
            .Select(x => new PaymentDto
            {
                Id = x.Id,
                UserId = x.UserId,
                CardholderName = x.CardholderName,
                LastFourDigits = x.LastFourDigits,
                ExpirationDate = x.ExpirationDate
            });
    }

    [HttpGet("{id}")]
    public ActionResult<PaymentDto> GetById(int id)
    {
        var result = dataContext.Set<Payment>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new PaymentDto
        {
            Id = result.Id,
            UserId = result.UserId,
            CardholderName = result.CardholderName,
            LastFourDigits = result.LastFourDigits,
            ExpirationDate = result.ExpirationDate
        });
    }

    [HttpPost]
    [Authorize] // Requires a user to be logged in to add a payment
    public ActionResult<PaymentDto> Create(PaymentDto dto)
    {
        var payment = new Payment
        {
            UserId = dto.UserId,
            CardholderName = dto.CardholderName,
            LastFourDigits = dto.LastFourDigits,
            ExpirationDate = dto.ExpirationDate
        };

        dataContext.Set<Payment>().Add(payment);
        dataContext.SaveChanges();

        dto.Id = payment.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var payment = dataContext.Set<Payment>()
            .FirstOrDefault(x => x.Id == id);

        if (payment == null)
        {
            return NotFound();
        }

        dataContext.Set<Payment>().Remove(payment);
        dataContext.SaveChanges();

        return Ok();
    }
}