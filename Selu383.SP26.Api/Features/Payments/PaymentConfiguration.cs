using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Features.Payments
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.Property(x => x.CardholderName)
                .IsRequired()
                .HasMaxLength(120);

            builder.Property(x => x.LastFourDigits)
                .IsRequired()
                .HasMaxLength(4);

            builder.Property(x => x.ExpirationDate)
                .IsRequired();

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}