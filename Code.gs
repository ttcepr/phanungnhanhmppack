
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('PHẢN ỨNG NHANH - MPPACK')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- SETUP DATABASE (CHẠY HÀM NÀY LẦN ĐẦU TIÊN) ---
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Employees Sheet
  let empSheet = ss.getSheetByName('Employees');
  if (!empSheet) {
    empSheet = ss.insertSheet('Employees');
    empSheet.appendRow(['id', 'name', 'role', 'dept', 'status', 'avatar', 'isAdmin']);
    
    const employees = [
      ['NV001', 'Nguyễn Văn A', 'Trưởng ca In', 'IN', 'Online', 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=0D8ABC&color=fff', false],
      ['NV002', 'Trần Thị B', 'Thủ Kho', 'KHO', 'Offline', 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random', false],
      ['NV003', 'Lê Văn C', 'Vận hành Sóng', 'SÓNG', 'Online', 'https://ui-avatars.com/api/?name=Le+Van+C&background=random', false],
      ['NV004', 'Phạm Thị D', 'KCS Thành phẩm', 'THÀNH PHẨM', 'Busy', 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=random', false],
      ['thai', 'Admin Manager', 'Quản lý SX', 'VĂN PHÒNG', 'Online', 'https://ui-avatars.com/api/?name=Admin+Manager&background=random', true]
    ];
    empSheet.getRange(2, 1, employees.length, employees[0].length).setValues(employees);
  }

  // 2. Setup Documents Sheet
  let docSheet = ss.getSheetByName('Documents');
  if (!docSheet) {
    docSheet = ss.insertSheet('Documents');
    docSheet.appendRow([
      'id', 'title', 'clientName', 'brandName', 'docNumber', 'productionOrder', 
      'arrivalDate', 'unit', 'recipient', 'handler', 'status', 'type', 
      'specs', 'history', 'errorLog', 'savedRecords', 'draftQueue', 'unreadCount', 'tcktRecords'
    ]);
    
    // Demo Data
    const today = new Date().toISOString().split('T')[0];
    const docs = [
      [
        'HN-001', 'Thùng Tiger Crystal 24 lon', 'HEINEKEN', 'TIGER', 'SKU-TIGER-24', 'LSX-001',
        today, 'Kỹ Thuật', 'NM Tiền Giang', 'NV A', 'Chờ duyệt mẫu', 'Carton',
        JSON.stringify({dim:'40x30x20'}), 
        JSON.stringify([{id:'1', user:'Admin', message:'Lưu ý màu sắc', timestamp:'10:00', isMe:false}]),
        '[]', '[]', '[]', 3, '[]'
      ],
      [
        'PEP-001', 'Pepsi Cola 330ml', 'PEPSICO', 'PEPSI', 'SKU-PEP-01', 'LSX-002',
        today, 'Kỹ Thuật', 'NM Đồng Nai', 'NV B', 'Gấp', 'Carton',
        JSON.stringify({dim:'30x20x10'}), '[]', '[]', '[]', '[]', 0, '[]'
      ]
    ];
    docSheet.getRange(2, 1, docs.length, docs[0].length).setValues(docs);
  } else {
    // Check if tcktRecords column exists, if not add it (simple migration)
    const headers = docSheet.getRange(1, 1, 1, docSheet.getLastColumn()).getValues()[0];
    if (headers.indexOf('tcktRecords') === -1) {
       docSheet.getRange(1, headers.length + 1).setValue('tcktRecords');
    }
  }
}

// --- API FUNCTIONS ---

function getInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const empSheet = ss.getSheetByName('Employees');
  const docSheet = ss.getSheetByName('Documents');
  
  if(!empSheet || !docSheet) return { error: "Chưa cài đặt Database. Vui lòng chạy hàm setupDatabase()" };

  const employees = sheetToJSON(empSheet);
  const rawDocs = sheetToJSON(docSheet);
  
  // Parse JSON fields safely
  const documents = rawDocs.map(doc => {
    try {
      return {
        ...doc,
        // Convert Date object to YYYY-MM-DD string
        arrivalDate: new Date(doc.arrivalDate).toISOString().split('T')[0],
        specs: JSON.parse(doc.specs || '{}'),
        history: JSON.parse(doc.history || '[]'),
        errorLog: JSON.parse(doc.errorLog || '[]'),
        savedRecords: JSON.parse(doc.savedRecords || '[]'),
        draftQueue: JSON.parse(doc.draftQueue || '[]'),
        tcktRecords: JSON.parse(doc.tcktRecords || '[]')
      };
    } catch (e) {
      return doc;
    }
  });

  return { employees, documents };
}

function saveDocumentData(docData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Documents');
  const data = sheet.getDataRange().getValues();
  
  // Find Row Index based on ID
  let rowIndex = -1;
  for(let i=1; i<data.length; i++) {
    if(data[i][0] == docData.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  // Map data to headers
  const headers = data[0];
  const rowData = headers.map(h => {
    if(['history', 'errorLog', 'savedRecords', 'draftQueue', 'specs', 'tcktRecords'].indexOf(h) > -1) {
      return JSON.stringify(docData[h] || []);
    }
    return docData[h] || '';
  });

  if(rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function uploadImageToDrive(base64Data, fileName) {
  try {
    const split = base64Data.split('base64,');
    const type = split[0].split(':')[1].split(';')[0];
    const bytes = Utilities.base64Decode(split[1]);
    const blob = Utilities.newBlob(bytes, type, fileName);
    
    // Create Folder if not exists
    const folderName = "CoDX_App_Images";
    const folders = DriveApp.getFoldersByName(folderName);
    let folder;
    if (folders.hasNext()) folder = folders.next();
    else folder = DriveApp.createFolder(folderName);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return a direct link for <img> tag (using Google's thumbnail API for speed)
    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (e) {
    return "ERROR: " + e.toString();
  }
}

// Helper: Convert Sheet Data to JSON
function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
