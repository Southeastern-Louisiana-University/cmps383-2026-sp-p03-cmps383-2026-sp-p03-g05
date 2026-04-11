using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Orders;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(x => x.PickupMethod)
            .HasMaxLength(20)
            .HasDefaultValue("In Store");

        builder.Property(x => x.DateOrdered)
            .HasColumnType("datetime2");

        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OrderStatus)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.OrderStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.User)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.LocationId);
        builder.HasIndex(x => x.OrderStatusId);
        builder.HasIndex(x => x.UserId);

        builder.ToTable("Orders", t =>
        {
            t.HasCheckConstraint(
                "CK_Orders_PickupMethod",
                "[PickupMethod] IN ('Drive Through', 'In Store')");
        });
    }
}
