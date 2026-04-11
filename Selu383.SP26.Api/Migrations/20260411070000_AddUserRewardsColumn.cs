using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Selu383.SP26.Api.Data;

namespace Selu383.SP26.Api.Migrations;

[DbContext(typeof(DataContext))]
[Migration("20260411070000_AddUserRewardsColumn")]
public partial class AddUserRewardsColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "Rewards",
            table: "AspNetUsers",
            type: "int",
            nullable: false,
            defaultValue: 0);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Rewards",
            table: "AspNetUsers");
    }
}
