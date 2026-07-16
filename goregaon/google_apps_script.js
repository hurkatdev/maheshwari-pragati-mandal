/**
 * Maheshwari Pragati Mandal — Goregaon Pre-Order Sheet Logger
 *
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet (create a new one if needed).
 * 2. Click Extensions → Apps Script.
 * 3. Delete any existing code and paste ALL of this file.
 * 4. Click Save (Ctrl+S). Name the project anything you like.
 * 5. Click Deploy → New deployment.
 * 6. Select type: Web app.
 * 7. Set:
 *      Execute as  → Me
 *      Who has access → Anyone
 * 8. Click Deploy → Authorize access when prompted.
 * 9. Copy the Web app URL (ends with /exec).
 * 10. Open goregaon/app.js and paste it as the value of SHEETS_SCRIPT_URL.
 * 11. Commit and push.
 *
 * The script creates a header row automatically on first run.
 * Each order is appended as one row.
 */

var SHEET_NAME = "Orders"; // Change if your sheet tab has a different name

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet + header row if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp (IST)",
        "Order ID",
        "Collection Point",
        "Name",
        "Mobile",
        "Total Units",
        "Items Detail",
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#065f46").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // Build items detail string: "Chana Satu (per kg) × 2, Kesar (1 gm/packet) × 1"
    var itemsDetail = (data.items || []).map(function(item) {
      return item.name + " (" + item.unit + ") × " + item.qty;
    }).join("\n");

    sheet.appendRow([
      data.timestamp    || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.orderId      || "",
      data.collectionPoint || "",
      data.name         || "",
      data.mobile       || "",
      data.totalUnits   || 0,
      itemsDetail,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doGet — health check, returns last 5 orders (useful for testing)
function doGet(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ orders: [] })).setMimeType(ContentService.MimeType.JSON);

    var rows   = sheet.getDataRange().getValues();
    var orders = [];
    for (var i = 1; i < rows.length; i++) {
      orders.push({
        timestamp:       rows[i][0],
        orderId:         rows[i][1],
        collectionPoint: rows[i][2],
        name:            rows[i][3],
        mobile:          rows[i][4],
        totalUnits:      rows[i][5],
        items:           rows[i][6],
      });
    }
    orders.reverse();

    return ContentService
      .createTextOutput(JSON.stringify({ orders: orders.slice(0, 5) }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
