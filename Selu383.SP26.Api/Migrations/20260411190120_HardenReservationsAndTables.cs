using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class HardenReservationsAndTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tables_LocationId",
                table: "Tables");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date_Typed",
                table: "Reservations",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "Time_Typed",
                table: "Reservations",
                type: "time",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [Reservations]
                SET [Date_Typed] = TRY_CONVERT(date, [Date]),
                    [Time_Typed] = TRY_CONVERT(time(7), [Time]);
                """);

            migrationBuilder.Sql(
                """
                IF EXISTS (
                    SELECT 1
                    FROM [Reservations]
                    WHERE ([Date] IS NOT NULL AND TRY_CONVERT(date, [Date]) IS NULL)
                       OR ([Time] IS NOT NULL AND TRY_CONVERT(time(7), [Time]) IS NULL)
                )
                BEGIN
                    THROW 51000, 'Unable to convert existing reservation Date/Time values to typed columns.', 1;
                END
                """);

            migrationBuilder.DropColumn(
                name: "Time",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "Date_Typed",
                table: "Reservations",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "Time_Typed",
                table: "Reservations",
                newName: "Time");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "Date",
                table: "Reservations",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "Time",
                table: "Reservations",
                type: "time",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tables_LocationId_Number",
                table: "Tables",
                columns: new[] { "LocationId", "Number" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tables_LocationId_Number",
                table: "Tables");

            migrationBuilder.AddColumn<string>(
                name: "Date_Text",
                table: "Reservations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Time_Text",
                table: "Reservations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [Reservations]
                SET [Date_Text] = CONVERT(varchar(10), [Date], 23),
                    [Time_Text] = CONVERT(varchar(8), [Time], 108);
                """);

            migrationBuilder.DropColumn(
                name: "Time",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "Date_Text",
                table: "Reservations",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "Time_Text",
                table: "Reservations",
                newName: "Time");

            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "Reservations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Time",
                table: "Reservations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tables_LocationId",
                table: "Tables",
                column: "LocationId");
        }
    }
}
