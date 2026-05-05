/**
 * Generates public/template/products-import-template.xlsx for bulk product import.
 * Run from repo root: node scripts/generate-products-import-template.cjs
 */
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.addRow([
    "Name",
    "SKU",
    "Description",
    "Quantity on hand",
    "Cost price",
    "Selling price",
    "Low stock threshold",
  ]);

  sheet.addRow([
    "Sample notebook",
    "NB-001",
    "Spiral bound A5",
    100,
    2.5,
    4.99,
    10,
  ]);

  sheet.addRow([
    "Office chair",
    "CHAIR-02",
    "Ergonomic mesh",
    12,
    89,
    149.99,
    "",
  ]);

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };

  sheet.columns = [
    { width: 22 },
    { width: 14 },
    { width: 28 },
    { width: 18 },
    { width: 12 },
    { width: 14 },
    { width: 20 },
  ];

  const outDir = path.join(__dirname, "..", "public", "template");
  const outFile = path.join(outDir, "products-import-template.xlsx");
  fs.mkdirSync(outDir, { recursive: true });
  await workbook.xlsx.writeFile(outFile);
  console.log("Wrote", outFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
