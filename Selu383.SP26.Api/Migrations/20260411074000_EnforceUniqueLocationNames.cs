using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Selu383.SP26.Api.Data;

namespace Selu383.SP26.Api.Migrations;

[DbContext(typeof(DataContext))]
[Migration("20260411074000_EnforceUniqueLocationNames")]
public partial class EnforceUniqueLocationNames : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Keep the lowest Id per location name, repoint any orders, and remove duplicates.
        migrationBuilder.Sql("""
            ;WITH ranked AS (
                SELECT
                    [Id],
                    [Name],
                    ROW_NUMBER() OVER (PARTITION BY [Name] ORDER BY [Id]) AS [rn],
                    MIN([Id]) OVER (PARTITION BY [Name]) AS [keepId]
                FROM [Locations]
            )
            UPDATE o
            SET o.[LocationId] = r.[keepId]
            FROM [Orders] o
            INNER JOIN ranked r ON o.[LocationId] = r.[Id]
            WHERE r.[rn] > 1;

            ;WITH ranked AS (
                SELECT
                    [Id],
                    [Name],
                    ROW_NUMBER() OVER (PARTITION BY [Name] ORDER BY [Id]) AS [rn]
                FROM [Locations]
            )
            DELETE l
            FROM [Locations] l
            INNER JOIN ranked r ON l.[Id] = r.[Id]
            WHERE r.[rn] > 1;
            """);

        migrationBuilder.CreateIndex(
            name: "IX_Locations_Name",
            table: "Locations",
            column: "Name",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Locations_Name",
            table: "Locations");
    }
}
