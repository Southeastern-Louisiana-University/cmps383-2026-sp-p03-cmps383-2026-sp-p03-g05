using Selu383.SP26.Api.Features.Auth; // Update this using statement to match where your User class lives!
using System;
using System.Collections.Generic;

namespace Selu383.SP26.Api.Features.Orders
{
    public class Order
    {
        public int Id { get; set; }

        // --- The Security Link ---
        // This is the crucial part that ties the receipt to a specific logged-in account
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
        // --- Order Details ---
        public DateTimeOffset DatePlaced { get; set; } = DateTimeOffset.UtcNow;
        
        // e.g., "Pending", "Preparing", "Ready for Pickup", "Completed"
        public string Status { get; set; } = "Pending"; 
        
        public decimal TotalPrice { get; set; }

        // Optional but recommended: A unique code just in case a guest needs to pick it up
        public string PickupCode { get; set; } = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
    }
}