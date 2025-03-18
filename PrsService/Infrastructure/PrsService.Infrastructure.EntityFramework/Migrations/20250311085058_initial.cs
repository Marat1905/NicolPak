using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrsService.Infrastructure.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tamburs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    End = table.Column<DateTime>(type: "TEXT", nullable: true),
                    TamburContPrs = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tamburs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Productions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Product = table.Column<string>(type: "TEXT", nullable: false),
                    Shift = table.Column<int>(type: "INTEGER", nullable: false),
                    PaperWeight = table.Column<double>(type: "REAL", nullable: false),
                    AverageSpeed = table.Column<double>(type: "REAL", nullable: false),
                    AverageTension = table.Column<double>(type: "REAL", nullable: false),
                    SetLength = table.Column<double>(type: "REAL", nullable: false),
                    FactLength = table.Column<double>(type: "REAL", nullable: false),
                    SetDiameter = table.Column<double>(type: "REAL", nullable: false),
                    FactDiameter = table.Column<double>(type: "REAL", nullable: false),
                    Core = table.Column<int>(type: "INTEGER", nullable: false),
                    Time = table.Column<int>(type: "INTEGER", nullable: false),
                    TamburPrsId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Productions_Tamburs_TamburPrsId",
                        column: x => x.TamburPrsId,
                        principalTable: "Tamburs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rolls",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RollID = table.Column<int>(type: "INTEGER", nullable: false),
                    RollWidth = table.Column<double>(type: "REAL", nullable: false),
                    ProductionId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rolls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rolls_Productions_ProductionId",
                        column: x => x.ProductionId,
                        principalTable: "Productions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Productions_TamburPrsId",
                table: "Productions",
                column: "TamburPrsId");

            migrationBuilder.CreateIndex(
                name: "IX_Rolls_ProductionId",
                table: "Rolls",
                column: "ProductionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Rolls");

            migrationBuilder.DropTable(
                name: "Productions");

            migrationBuilder.DropTable(
                name: "Tamburs");
        }
    }
}
