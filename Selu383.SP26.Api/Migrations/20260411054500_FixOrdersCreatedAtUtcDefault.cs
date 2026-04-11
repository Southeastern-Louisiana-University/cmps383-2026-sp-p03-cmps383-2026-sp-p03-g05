using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Selu383.SP26.Api.Data;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20260411054500_FixOrdersCreatedAtUtcDefault")]
    public partial class FixOrdersCreatedAtUtcDefault : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH('Orders', 'CreatedAtUtc') IS NULL
                BEGIN
                    ALTER TABLE [Orders]
                    ADD [CreatedAtUtc] datetime2 NOT NULL
                        CONSTRAINT [DF_Orders_CreatedAtUtc] DEFAULT SYSUTCDATETIME();
                END
                ELSE
                BEGIN
                    DECLARE @DefaultConstraintName nvarchar(128);

                    SELECT @DefaultConstraintName = dc.name
                    FROM sys.default_constraints dc
                    JOIN sys.columns c ON c.default_object_id = dc.object_id
                    JOIN sys.tables t ON t.object_id = c.object_id
                    WHERE t.name = 'Orders' AND c.name = 'CreatedAtUtc';

                    IF @DefaultConstraintName IS NULL
                    BEGIN
                        ALTER TABLE [Orders]
                        ADD CONSTRAINT [DF_Orders_CreatedAtUtc] DEFAULT SYSUTCDATETIME() FOR [CreatedAtUtc];
                    END
                END
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DECLARE @DefaultConstraintName nvarchar(128);

                SELECT @DefaultConstraintName = dc.name
                FROM sys.default_constraints dc
                JOIN sys.columns c ON c.default_object_id = dc.object_id
                JOIN sys.tables t ON t.object_id = c.object_id
                WHERE t.name = 'Orders' AND c.name = 'CreatedAtUtc';

                IF @DefaultConstraintName IS NOT NULL
                BEGIN
                    EXEC('ALTER TABLE [Orders] DROP CONSTRAINT [' + @DefaultConstraintName + ']');
                END
                """);
        }
    }
}
