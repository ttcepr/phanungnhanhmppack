
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('PHẢN ỨNG NHANH - MPPACK')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Hàm này dùng để nhúng các file HTML con vào Index.html
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// --- 1. SETUP DATABASE (CHẠY HÀM NÀY LẦN ĐẦU) ---
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1.1 Setup Employees
  let empSheet = ss.getSheetByName('Employees');
  if (!empSheet) {
    empSheet = ss.insertSheet('Employees');
    empSheet.appendRow(['id', 'name', 'password', 'role', 'dept', 'status', 'avatar', 'isAdmin']);
    const employees = [
      ['NV001', 'Nguyễn Văn A', '123', 'Trưởng ca In', 'IN', 'Online', 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=0D8ABC&color=fff', false],
      ['NV002', 'Trần Thị B', '123', 'Thủ Kho', 'KHO', 'Offline', 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random', false],
      ['thai', 'Admin Manager', 'admin', 'Quản lý SX', 'VĂN PHÒNG', 'Online', 'https://ui-avatars.com/api/?name=Admin+Manager&background=random', true]
    ];
    empSheet.getRange(2, 1, employees.length, employees[0].length).setValues(employees);
  }

  // 1.2 Setup Documents
  let docSheet = ss.getSheetByName('Documents');
  if (!docSheet) {
    docSheet = ss.insertSheet('Documents');
    docSheet.appendRow([
      'id', 'title', 'clientName', 'brandName', 'docNumber', 'productionOrder', 
      'arrivalDate', 'unit', 'recipient', 'handler', 'status', 'type', 
      'specs', 'history', 'errorLog', 'savedRecords', 'draftQueue', 'unreadCount', 'tcktRecords', 'spreadsheetUrl'
    ]);
  }
}

// --- 2. API FUNCTIONS ---

function getInitialData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const empSheet = ss.getSheetByName('Employees');
    const docSheet = ss.getSheetByName('Documents');
    
    if(!empSheet || !docSheet) return { useMock: true };

    const employees = sheetToJSON(empSheet);
    const rawDocs = sheetToJSON(docSheet);
    
    const documents = rawDocs.map(doc => {
      try {
        return {
          ...doc,
          arrivalDate: doc.arrivalDate ? new Date(doc.arrivalDate).toISOString().split('T')[0] : '',
          specs: parseJSONSafe(doc.specs, {}),
          history: parseJSONSafe(doc.history, []),
          errorLog: parseJSONSafe(doc.errorLog, []),
          savedRecords: parseJSONSafe(doc.savedRecords, []),
          draftQueue: parseJSONSafe(doc.draftQueue, []),
          tcktRecords: parseJSONSafe(doc.tcktRecords, [])
        };
      } catch (e) { return doc; }
    });

    return { useMock: false, employees, documents };
  } catch (e) {
    return { useMock: true, error: e.toString() };
  }
}

function parseJSONSafe(str, fallback) {
  try { return str ? JSON.parse(str) : fallback; } catch (e) { return fallback; }
}

function saveDocumentData(docData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Documents');
  if(!sheet) return { success: false, error: "Sheet not found" };

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for(let i=1; i<data.length; i++) {
    if(data[i][0] == docData.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const headers = data[0];
  const rowData = headers.map(h => {
    if(['history', 'errorLog', 'savedRecords', 'draftQueue', 'specs', 'tcktRecords'].indexOf(h) > -1) {
      return JSON.stringify(docData[h] || []);
    }
    return docData[h] || '';
  });

  if(rowIndex > -1) sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  else sheet.appendRow(rowData);
  
  return { success: true };
}

// --- 3. EXPORT FUNCTIONS ---
function createExecutiveReport() {
  // Demo PDF Export
  return { success: true, url: "https://www.google.com", name: "Report_Demo.pdf" };
}

function createDocumentSpreadsheet(docData) {
  try {
    const fileName = `HS_${docData.docNumber}_${docData.title}`;
    const ss = SpreadsheetApp.create(fileName);
    const sheet = ss.getSheets()[0];
    sheet.appendRow(["THÔNG TIN", "GIÁ TRỊ"]);
    sheet.appendRow(["Sản phẩm", docData.title]);
    sheet.appendRow(["Mã", docData.docNumber]);
    
    // Lưu lại link sheet vào document
    docData.spreadsheetUrl = ss.getUrl();
    saveDocumentData(docData);

    return { success: true, url: ss.getUrl(), name: fileName };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
