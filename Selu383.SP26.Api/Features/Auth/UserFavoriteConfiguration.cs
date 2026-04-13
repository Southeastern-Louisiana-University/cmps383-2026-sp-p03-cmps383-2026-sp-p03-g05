using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Selu383.SP26.Api.Features.Items;

namespace Selu383.SP26.Api.Features.Auth
{
    public class UserFavoriteConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasMany(x => x.FavoriteItems)
                .WithMany(x => x.FavoriteByUsers)
                .UsingEntity(j => j.ToTable("UserFavorites"));
        }
    }
}
