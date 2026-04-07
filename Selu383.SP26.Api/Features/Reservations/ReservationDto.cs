using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.Reservations
{
    public class ReservationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public int OrderId { get; set; }

        public int TableId { get; set; }

        public int LocationId { get; set; }
        [Required, MaxLength(50)]
        public string Time { get; set; }
        [Required, MaxLength(50)]
        public string Date { get; set; }

    }
}
