using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Selu383.SP26.Api.Features.Payments;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        
        builder.ToTable("Payments");

        // Set the primary key
        builder.HasKey(x => x.Id);

        
        builder.Property(x => x.CardholderName)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(x => x.LastFourDigits)
               .IsRequired()
               .HasMaxLength(4);

        builder.Property(x => x.ExpirationDate)
               .IsRequired()
               .HasMaxLength(5); // Format: MM/YY
    }
}