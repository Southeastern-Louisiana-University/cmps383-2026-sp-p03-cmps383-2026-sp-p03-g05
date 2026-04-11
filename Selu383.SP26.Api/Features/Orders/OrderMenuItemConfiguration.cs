using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Orders;

public class OrderMenuItemConfiguration : IEntityTypeConfiguration<OrderMenuItem>
{
    public void Configure(EntityTypeBuilder<OrderMenuItem> builder)
    {
        builder.HasKey(x => new { x.OrderId, x.MenuItemId });

        builder.Property(x => x.Quantity)
            .HasDefaultValue(1);

        builder.HasOne(x => x.Order)
            .WithMany(x => x.OrderMenuItems)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.MenuItem)
            .WithMany(x => x.OrderMenuItems)
            .HasForeignKey(x => x.MenuItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
