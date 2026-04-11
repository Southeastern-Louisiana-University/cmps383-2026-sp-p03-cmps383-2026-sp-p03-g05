using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Items;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.Property(x => x.ItemName)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Price)
            .HasPrecision(10, 2);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.Nutrition)
            .IsRequired()
            .HasMaxLength(1000);

        builder.ToTable(t =>
            t.HasCheckConstraint("CK_MenuItems_Type", "[Type] IN ('Drink', 'Food')"));
    }
}
