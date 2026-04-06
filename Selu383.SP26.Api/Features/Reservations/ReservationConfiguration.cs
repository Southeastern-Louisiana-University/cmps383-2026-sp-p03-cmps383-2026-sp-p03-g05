using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Reservations
{
    public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            builder.Property(r => r.Time)
                .IsRequired()
                .HasMaxLength(5);
            builder.Property(r => r.Date)
                .IsRequired()
                .HasMaxLength(10);


        }
    }
}
