using Selu383.SP26.Api.Features.Locations;

namespace Selu383.SP26.Api.Features.Tables
{
    public class Table
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public int LocationId { get; set; }
        public Location Location { get; set; } = null!;
    }
}
