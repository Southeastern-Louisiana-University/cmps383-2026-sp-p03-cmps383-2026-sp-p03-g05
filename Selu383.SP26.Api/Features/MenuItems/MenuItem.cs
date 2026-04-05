namespace Selu383.SP26.Api.Features.Items
{
    public class MenuItem
    {
        public int Id { get; set; }
        
        // The name of the coffee or food (e.g., "Caramel Macchiato")
        public string Name { get; set; } = string.Empty;
        
        // To entice the customer, like the client asked
        public string Description { get; set; } = string.Empty;
        
        // For the Point of Sale system the client mentioned
        public decimal Price { get; set; }
        
        // The URL link to the picture of the item!
        public string ImageUrl { get; set; } = string.Empty; 
    }
}