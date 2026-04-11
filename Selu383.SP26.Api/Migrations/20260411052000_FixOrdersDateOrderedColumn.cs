using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Selu383.SP26.Api.Data;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20260411052000_FixOrdersDateOrderedColumn")]
    public partial class FixOrdersDateOrderedColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH('Orders', 'DateOrdered') IS NULL
                BEGIN
                    IF COL_LENGTH('Orders', 'OrderedAt') IS NOT NULL
                    BEGIN
                        EXEC sp_rename 'Orders.OrderedAt', 'DateOrdered', 'COLUMN';
                    END
                    ELSE
                    BEGIN
                        ALTER TABLE [Orders]
                        ADD [DateOrdered] datetime2 NOT NULL DEFAULT SYSUTCDATETIME();
                    END
                END
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH('Orders', 'DateOrdered') IS NOT NULL
                   AND COL_LENGTH('Orders', 'OrderedAt') IS NULL
                BEGIN
                    EXEC sp_rename 'Orders.DateOrdered', 'OrderedAt', 'COLUMN';
                END
                """);
        }
    }
}
