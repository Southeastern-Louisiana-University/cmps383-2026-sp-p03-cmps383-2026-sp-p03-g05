using Selu383.SP26.Api.Features.Items; // Ensure this points to your MenuItem
using System;

namespace Selu383.SP26.Api.Features.Orders
{
    public class OrderItem
    {
        public int Id { get; set; }

        // --- Foreign Keys ---
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        public int MenuItemId { get; set; }
        public virtual MenuItem MenuItem { get; set; } = null!;

        
        public int Quantity { get; set; } = 1;

        // Locks in the price at the time of purchase
        public decimal UnitPrice { get; set; }

        // Perfect for "No whipped cream" or "Extra hot"
        public string SpecialInstructions { get; set; } = string.Empty;
    }
}