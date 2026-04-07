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
            builder.HasOne(r => r.Order)
                .WithMany()
                .HasForeignKey(static r => r.OrderId)
                .OnDelete(DeleteBehavior.NoAction);
            builder.HasOne(r => r.Location)
                .WithMany()
                .HasForeignKey( r => r.LocationId)
                .OnDelete(DeleteBehavior.NoAction);
            builder.HasOne(r => r.Table)
                .WithMany()
                .HasForeignKey(r => r.TableId)
                .OnDelete(DeleteBehavior.NoAction);



        }
    }
}
