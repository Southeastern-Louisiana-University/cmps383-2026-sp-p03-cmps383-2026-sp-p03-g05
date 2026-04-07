using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP26.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReservWork2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Locations_LocationId",
                table: "Reservation");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Order_OrderId",
                table: "Reservation");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Table_TableId",
                table: "Reservation");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Locations_LocationId",
                table: "Reservation",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Order_OrderId",
                table: "Reservation",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Table_TableId",
                table: "Reservation",
                column: "TableId",
                principalTable: "Table",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Locations_LocationId",
                table: "Reservation");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Order_OrderId",
                table: "Reservation");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_Table_TableId",
                table: "Reservation");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Locations_LocationId",
                table: "Reservation",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Order_OrderId",
                table: "Reservation",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_Table_TableId",
                table: "Reservation",
                column: "TableId",
                principalTable: "Table",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
