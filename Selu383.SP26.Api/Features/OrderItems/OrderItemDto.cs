using Selu383.SP26.Api.Features.Items;
using Selu383.SP26.Api.Features.Orders;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP26.Api.Features.OrderItems
{
    public class OrderItemDto
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public int MenuItemId { get; set; }

        [MaxLength(500)]
        public string SpecialInstructions { get; set; } = string.Empty;
    }
}
