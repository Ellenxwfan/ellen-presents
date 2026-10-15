/**
 * Ellen Presents — enquiry endpoint
 *
 * Receives a submission from the form on ellenpresents.com, appends it as a
 * row to the bound spreadsheet, and emails a notification.
 *
 * Setup
 *   1. Create a Google Sheet. Name the first tab "Enquiries".
 *   2. Extensions -> Apps Script. Delete the stub, paste this file, save.
 *   3. Set NOTIFY_TO below to the address that should hear about enquiries.
 *   4. Deploy -> New deployment -> type "Web app".
 *        Execute as:        Me
 *        Who has access:    Anyone        <- required; the site is anonymous
 *   5. Copy the /exec URL it gives you into ENQUIRY_ENDPOINT in
 *      assets/js/site.js, and bump the ?v= number on both pages.
 *
 * Re-deploy ("Manage deployments" -> edit -> new version) after any edit
 * here, or the old code keeps serving.
 */

var NOTIFY_TO = 'hello@ellenpresents.com';
var SHEET_NAME = 'Enquiries';

var FIELDS = [
  'name', 'company', 'email', 'eventType',
  'location', 'date', 'guests', 'scope', 'message', 'locale'
];

function doPost(e) {
  try {
    // The page sends JSON as text/plain, which avoids a CORS preflight that
    // Apps Script cannot answer. Either way the body is JSON.
    var data = JSON.parse(e.postData.contents);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
             || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Received'].concat(FIELDS));
      sheet.setFrozenRows(1);
    }

    var row = [new Date()];
    FIELDS.forEach(function (f) { row.push(data[f] || ''); });
    sheet.appendRow(row);

    notify(data);
    return json({ ok: true });
  } catch (err) {
    // Logged to the Apps Script execution log, not shown to the visitor.
    console.error(err);
    return json({ ok: false, error: String(err) });
  }
}

function notify(data) {
  if (!NOTIFY_TO) return;
  var lines = FIELDS.map(function (f) {
    return f + ': ' + (data[f] || '-');
  }).join('\n');

  MailApp.sendEmail({
    to: NOTIFY_TO,
    subject: 'Event enquiry - ' + (data.name || 'no name'),
    body: lines + '\n\nReply to: ' + (data.email || 'no address given'),
    replyTo: data.email || undefined
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Lets a GET on the URL confirm the deployment is live. */
function doGet() {
  return json({ ok: true, service: 'ellenpresents enquiries' });
}
