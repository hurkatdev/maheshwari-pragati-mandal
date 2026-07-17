/**
 * Maheshwari Pragati Mandal — Goregaon Pre-Order Sheet Logger
 *
 * HOW TO DEPLOY:
 * 1. Go to https://script.google.com → New project (standalone is fine).
 * 2. Delete any existing code and paste ALL of this file.
 * 3. Click Save (Ctrl+S). Name the project anything you like.
 * 4. Click Deploy → New deployment.
 * 5. Select type: Web app.
 * 6. Set:
 *      Execute as  → Me
 *      Who has access → Anyone
 * 7. Click Deploy → Authorize access when prompted.
 * 8. Copy the Web app URL (ends with /exec).
 * 9. Add it as the SHEETS_SCRIPT_URL secret in your GitHub repo settings.
 *
 * The script creates an "Orders" tab automatically on first run.
 * One mobile number = one order (duplicates are rejected).
 */

var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // Paste your Sheet ID here before deploying — do not commit the real value
var SHEET_NAME     = "Orders";

// Column indices (1-based)
var COL_TIMESTAMP        = 1;
var COL_ORDER_ID         = 2;
var COL_COLLECTION_POINT = 3;
var COL_NAME             = 4;
var COL_MOBILE           = 5;
var COL_TOTAL_UNITS      = 6;
var COL_ITEMS_DETAIL     = 7;
var TOTAL_COLS           = 7;

function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
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
      sheet.getRange(1, 1, 1, TOTAL_COLS)
        .setFontWeight("bold")
        .setBackground("#065f46")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // Reject duplicate mobile numbers
    var incomingMobile = (data.mobile || "").trim();
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existingMobiles = sheet.getRange(2, COL_MOBILE, lastRow - 1, 1).getValues();
      for (var i = 0; i < existingMobiles.length; i++) {
        if (existingMobiles[i][0].toString().trim() === incomingMobile) {
          var existingOrderId = sheet.getRange(i + 2, COL_ORDER_ID).getValue();
          return jsonResponse({
            status:          "duplicate",
            existingOrderId: existingOrderId,
            message:         "An order has already been placed for this mobile number.",
          });
        }
      }
    }

    var itemsDetail = (data.items || []).map(function(item) {
      return item.name + " (" + item.unit + ") × " + item.qty;
    }).join("\n");

    sheet.appendRow([
      data.timestamp       || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.orderId         || "",
      data.collectionPoint || "",
      data.name            || "",
      incomingMobile,
      data.totalUnits      || 0,
      itemsDetail,
    ]);

    return jsonResponse({ status: "success", orderId: data.orderId });

  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// doGet — health check: returns last 5 orders
function doGet(e) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return jsonResponse({ orders: [] });

    var rows   = sheet.getDataRange().getValues();
    var orders = [];
    for (var i = 1; i < rows.length; i++) {
      orders.push({
        timestamp:       rows[i][COL_TIMESTAMP - 1],
        orderId:         rows[i][COL_ORDER_ID - 1],
        collectionPoint: rows[i][COL_COLLECTION_POINT - 1],
        name:            rows[i][COL_NAME - 1],
        mobile:          rows[i][COL_MOBILE - 1],
        totalUnits:      rows[i][COL_TOTAL_UNITS - 1],
        items:           rows[i][COL_ITEMS_DETAIL - 1],
      });
    }
    orders.reverse();
    return jsonResponse({ orders: orders.slice(0, 5) });

  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
