using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Selu383.SP26.Api.Data;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20260410220000_AddFeaturedToMenuItems")]
    public partial class AddFeaturedToMenuItems : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Featured",
                table: "MenuItems",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Featured",
                table: "MenuItems");
        }
    }
}
