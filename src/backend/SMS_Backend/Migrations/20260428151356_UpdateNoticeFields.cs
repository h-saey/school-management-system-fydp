using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SMS_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNoticeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Notices",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Notices",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Notices");
        }
    }
}
