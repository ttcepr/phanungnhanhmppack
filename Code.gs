
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('PHẢNỨNG NHANH - MPPACK')
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
    // Added 'password' column
    empSheet.appendRow(['id', 'name', 'password', 'role', 'dept', 'status', 'avatar', 'isAdmin']);
    
    const employees = [
      ['NV001', 'Nguyễn Văn A', '123', 'Trưởng ca In', 'IN', 'Online', 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=0D8ABC&color=fff', false],
      ['NV002', 'Trần Thị B', '123', 'Thủ Kho', 'KHO', 'Offline', 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random', false],
      ['NV003', 'Lê Văn C', '123', 'Vận hành Sóng', 'SÓNG', 'Online', 'https://ui-avatars.com/api/?name=Le+Van+C&background=random', false],
      ['NV004', 'Phạm Thị D', '123', 'KCS Thành phẩm', 'THÀNH PHẨM', 'Busy', 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=random', false],
      ['thai', 'Admin Manager', 'admin', 'Quản lý SX', 'VĂN PHÒNG', 'Online', 'https://ui-avatars.com/api/?name=Admin+Manager&background=random', true]
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
      'specs', 'history', 'errorLog', 'savedRecords', 'draftQueue', 'unreadCount', 'tcktRecords', 'spreadsheetUrl'
    ]);
    
    // Demo Data
    const today = new Date().toISOString().split('T')[0];
    const docs = [
      [
        'HN-001', 'Thùng Tiger Crystal 24 lon', 'HEINEKEN', 'TIGER', 'SKU-TIGER-24', 'LSX-001',
        today, 'Kỹ Thuật', 'NM Tiền Giang', 'NV A', 'Chờ duyệt mẫu', 'Carton',
        JSON.stringify({dim:'40x30x20'}), 
        JSON.stringify([{id:'1', user:'Admin', message:'Lưu ý màu sắc', timestamp:'10:00', isMe:false}]),
        '[]', '[]', '[]', 3, '[]', ''
      ],
      [
        'PEP-001', 'Pepsi Cola 330ml', 'PEPSICO', 'PEPSI', 'SKU-PEP-01', 'LSX-002',
        today, 'Kỹ Thuật', 'NM Đồng Nai', 'NV B', 'Gấp', 'Carton',
        JSON.stringify({dim:'30x20x10'}), '[]', '[]', '[]', '[]', 0, '[]', ''
      ]
    ];
    docSheet.getRange(2, 1, docs.length, docs[0].length).setValues(docs);
  } else {
    // Check if tcktRecords column exists, if not add it (simple migration)
    const headers = docSheet.getRange(1, 1, 1, docSheet.getLastColumn()).getValues()[0];
    if (headers.indexOf('tcktRecords') === -1) {
       docSheet.getRange(1, headers.length + 1).setValue('tcktRecords');
    }
    if (headers.indexOf('spreadsheetUrl') === -1) {
       docSheet.getRange(1, headers.length + 2).setValue('spreadsheetUrl'); // Assuming tckt is len+1
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

// --- GENERATE PDF REPORT (EXECUTIVE SUMMARY) ---
function createExecutiveReport() {
  try {
    const data = getInitialData();
    if(data.error) throw new Error(data.error);
    const docs = data.documents;

    // 1. Calculate Stats
    const total = docs.length;
    const urgent = docs.filter(d => d.status === 'Gấp').length;
    const waiting = docs.filter(d => d.status === 'Chờ duyệt mẫu').length;
    const approved = docs.filter(d => d.status === 'Đã duyệt SX').length;
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const today = new Date().toISOString().split('T')[0];
    const newDocs = docs.filter(d => d.arrivalDate === today).length;

    // 2. Aggregate Errors
    const allErrors = [];
    docs.forEach(d => {
        if(d.errorLog) d.errorLog.forEach(e => allErrors.push({...e, docTitle: d.title, docNumber: d.docNumber}));
    });

    // 3. Create HTML Content
    let html = `
    <html>
    <head>
      <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: 'Roboto', 'Arial', sans-serif; color: #333; line-height: 1.5; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #0060B6; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #0060B6; margin: 0; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0; color: #666; font-size: 14px; }
        .section { margin-bottom: 25px; }
        .section-title { background-color: #f3f4f6; padding: 8px 12px; font-weight: bold; border-left: 4px solid #0060B6; font-size: 14px; margin-bottom: 10px; color: #1f2937; }
        
        /* Stats Grid */
        .stats-grid { display: table; width: 100%; border-spacing: 10px 0; margin-bottom: 10px; }
        .stat-card { display: table-cell; width: 25%; background: #fff; border: 1px solid #e5e7eb; padding: 15px; text-align: center; border-radius: 8px; }
        .stat-val { font-size: 24px; font-weight: bold; color: #0060B6; display: block; margin-bottom: 5px; }
        .stat-label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; }

        /* Tables */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background-color: #0060B6; color: white; text-align: left; padding: 8px; font-weight: bold; }
        td { border-bottom: 1px solid #e5e7eb; padding: 8px; vertical-align: top; }
        tr:nth-child(even) { background-color: #f9fafb; }
        
        /* Status Badges */
        .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; display: inline-block; }
        .bg-red { background-color: #fee2e2; color: #991b1b; }
        .bg-yellow { background-color: #fef3c7; color: #92400e; }
        .bg-green { background-color: #d1fae5; color: #065f46; }
        .bg-blue { background-color: #dbeafe; color: #1e40af; }

        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Báo Cáo Tổng Hợp Sản Xuất</h1>
        <p>Hệ thống Phản Ứng Nhanh - MPPACK</p>
        <p>Ngày báo cáo: ${todayStr}</p>
      </div>

      <div class="section">
        <div class="section-title">1. TỔNG QUAN HIỆU SUẤT</div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-val">${total}</span>
            <span class="stat-label">Tổng Hồ sơ</span>
          </div>
          <div class="stat-card">
            <span class="stat-val" style="color: #ef4444;">${urgent}</span>
            <span class="stat-label">Hồ sơ Gấp</span>
          </div>
          <div class="stat-card">
            <span class="stat-val" style="color: #f59e0b;">${waiting}</span>
            <span class="stat-label">Chờ Duyệt Mẫu</span>
          </div>
          <div class="stat-card">
            <span class="stat-val" style="color: #10b981;">${approved}</span>
            <span class="stat-label">Đã Duyệt SX</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. TIẾN ĐỘ HỒ SƠ CHI TIẾT</div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%">Mã Số</th>
              <th style="width: 30%">Tên Sản Phẩm</th>
              <th style="width: 20%">Khách Hàng</th>
              <th style="width: 15%">Phiếu SX</th>
              <th style="width: 20%">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map(d => {
              let badgeClass = 'bg-blue';
              if(d.status === 'Gấp') badgeClass = 'bg-red';
              else if(d.status === 'Chờ duyệt mẫu') badgeClass = 'bg-yellow';
              else if(d.status === 'Đã duyệt SX') badgeClass = 'bg-green';
              
              return `
              <tr>
                <td style="font-family: monospace;">${d.docNumber}</td>
                <td>${d.title}</td>
                <td>${d.clientName}<br><span style="color:#666; font-size: 10px;">${d.brandName}</span></td>
                <td style="font-weight: bold;">${d.productionOrder || '---'}</td>
                <td><span class="badge ${badgeClass}">${d.status}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">3. NHẬT KÝ LỖI & KHẮC PHỤC</div>
        ${allErrors.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 15%">Ngày</th>
              <th style="width: 25%">Sản phẩm / Phiếu SX</th>
              <th style="width: 10%">Bộ phận</th>
              <th style="width: 25%">Nội dung lỗi</th>
              <th style="width: 25%">Giải pháp</th>
            </tr>
          </thead>
          <tbody>
            ${allErrors.map(e => `
            <tr>
              <td>${e.date}</td>
              <td>${e.docTitle}<br><span style="color:#0060B6; font-weight:bold;">${e.productionOrder || ''}</span></td>
              <td><b>${e.dept}</b></td>
              <td style="color: #b91c1c;">${e.errorContent}</td>
              <td style="color: #047857;">${e.solution}</td>
            </tr>`).join('')}
          </tbody>
        </table>` : '<p style="padding: 10px; font-style: italic; color: #666;">Không có ghi nhận lỗi nào trong hệ thống.</p>'}
      </div>

      <div class="footer">
        Báo cáo được xuất tự động từ hệ thống MPPACK Manager. Dành cho Ban Giám Đốc.
      </div>
    </body>
    </html>
    `;

    // 4. Convert to PDF
    const blob = Utilities.newBlob(html, MimeType.HTML, "temp.html");
    const pdf = blob.getAs(MimeType.PDF);
    const fileName = `BaoCao_TongHop_MPPACK_${todayStr.replace(/\//g,'-')}.pdf`;
    
    // 5. Save to Drive Folder
    const parentFolderName = "MPPACK_REPORTS";
    const folders = DriveApp.getFoldersByName(parentFolderName);
    let folder;
    if (folders.hasNext()) folder = folders.next();
    else folder = DriveApp.createFolder(parentFolderName);
    
    const file = folder.createFile(pdf).setName(fileName);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return { success: true, url: file.getUrl(), name: fileName };

  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// --- NEW FUNCTION: CREATE DEDICATED SPREADSHEET FOR A DOCUMENT ---
function createDocumentSpreadsheet(docData) {
  try {
    const parentFolderName = "MPPACK_EXPORTS";
    let parentFolder;
    const folders = DriveApp.getFoldersByName(parentFolderName);
    if (folders.hasNext()) parentFolder = folders.next();
    else parentFolder = DriveApp.createFolder(parentFolderName);

    // 1. Create Spreadsheet
    const fileName = `HS_${docData.docNumber}_${docData.title}`;
    
    // Check if exists to avoid dupes (simple check by name in folder)
    const existingFiles = parentFolder.getFilesByName(fileName);
    let ss;
    if (existingFiles.hasNext()) {
        const file = existingFiles.next();
        ss = SpreadsheetApp.open(file);
    } else {
        ss = SpreadsheetApp.create(fileName);
        const file = DriveApp.getFileById(ss.getId());
        file.moveTo(parentFolder);
    }

    // Helper to upload image string to drive and get public URL for =IMAGE()
    const processImage = (imgStr) => {
        if (!imgStr) return "";
        if (imgStr.startsWith("http")) return imgStr; // Already a URL
        if (imgStr.startsWith("data:image")) {
            return uploadImageToDrive(imgStr, "IMG_" + Date.now());
        }
        return "";
    };

    // 2. SHEET 1: OVERVIEW (TỔNG QUAN)
    let sheetOverview = ss.getSheetByName("Tổng quan");
    if (!sheetOverview) sheetOverview = ss.insertSheet("Tổng quan");
    sheetOverview.clear();
    
    const overviewData = [
        ["THÔNG TIN HỒ SƠ", ""],
        ["Tên sản phẩm", docData.title],
        ["Mã số (SKU)", docData.docNumber],
        ["Khách hàng", docData.clientName],
        ["Nhãn hiệu", docData.brandName],
        ["Phiếu SX", docData.productionOrder || "Chưa có"],
        ["Ngày tạo", docData.arrivalDate],
        ["Trạng thái", docData.status],
        ["Người phụ trách", docData.handler],
    ];
    sheetOverview.getRange(1, 1, overviewData.length, 2).setValues(overviewData);
    sheetOverview.getRange(1, 1, overviewData.length, 1).setFontWeight("bold");
    sheetOverview.autoResizeColumns(1, 2);

    // 3. SHEET 2: TCKT (TIÊU CHUẨN KỸ THUẬT)
    let sheetTCKT = ss.getSheetByName("TCKT");
    if (!sheetTCKT) sheetTCKT = ss.insertSheet("TCKT");
    sheetTCKT.clear();
    sheetTCKT.appendRow(["Ngày", "Người gửi", "Phiếu SX", "Nội dung", "Hình ảnh (Preview)"]);
    sheetTCKT.getRange("1:1").setFontWeight("bold").setBackground("#cfe2f3");

    const tcktRows = [];
    if (docData.tcktRecords && docData.tcktRecords.length > 0) {
        docData.tcktRecords.forEach(rec => {
            const imgUrl = (rec.images && rec.images.length > 0) ? processImage(rec.images[0]) : "";
            const imgFormula = imgUrl ? `=IMAGE("${imgUrl}")` : "";
            tcktRows.push([
                rec.timestamp,
                rec.user,
                rec.productionOrder,
                rec.content,
                imgFormula
            ]);
        });
        
        if (tcktRows.length > 0) {
            sheetTCKT.getRange(2, 1, tcktRows.length, 5).setValues(tcktRows);
            // Set row height for images
            sheetTCKT.setRowHeights(2, tcktRows.length, 100);
            sheetTCKT.setColumnWidth(5, 150);
        }
    }

    // 4. SHEET 3: CHAT HISTORY (TRAO ĐỔI)
    let sheetChat = ss.getSheetByName("Lịch sử Chat");
    if (!sheetChat) sheetChat = ss.insertSheet("Lịch sử Chat");
    sheetChat.clear();
    sheetChat.appendRow(["Thời gian", "Người gửi", "Nội dung", "Hình ảnh"]);
    sheetChat.getRange("1:1").setFontWeight("bold").setBackground("#ead1dc");

    const chatRows = [];
    if (docData.history && docData.history.length > 0) {
        docData.history.forEach(msg => {
            const imgUrl = msg.image ? processImage(msg.image) : "";
            const imgFormula = imgUrl ? `=IMAGE("${imgUrl}")` : "";
            chatRows.push([
                msg.timestamp,
                msg.user,
                msg.message,
                imgFormula
            ]);
        });

        if (chatRows.length > 0) {
            sheetChat.getRange(2, 1, chatRows.length, 4).setValues(chatRows);
            // Set row height only if there are images
            for(let i=0; i<chatRows.length; i++) {
                if(chatRows[i][3] !== "") sheetChat.setRowHeight(i+2, 100);
            }
            sheetChat.setColumnWidth(4, 150);
        }
    }

    // 5. SHEET 4: REVIEWS (LỖI & KHẮC PHỤC)
    let sheetReview = ss.getSheetByName("Lỗi & Khắc Phục");
    if (!sheetReview) sheetReview = ss.insertSheet("Lỗi & Khắc Phục");
    sheetReview.clear();
    sheetReview.appendRow(["Thời gian", "Bộ phận", "Phiếu SX", "Nội dung Lỗi", "Khắc phục", "Hình ảnh"]);
    sheetReview.getRange("1:1").setFontWeight("bold").setBackground("#fff2cc");

    const reviewRows = [];
    // Process Saved Records
    if (docData.savedRecords) {
        docData.savedRecords.forEach(rec => {
             const imgUrl = (rec.images && rec.images.length > 0) ? processImage(rec.images[0]) : "";
             const imgFormula = imgUrl ? `=IMAGE("${imgUrl}")` : "";
             reviewRows.push([rec.timestamp, rec.dept, rec.productionOrder || "", rec.content, rec.solution || "", imgFormula]);
        });
    }
    // Process Error Logs
    if (docData.errorLog) {
        docData.errorLog.forEach(err => {
             // Avoid dupes if already in savedRecords (simplified logic)
             if (!docData.savedRecords || !docData.savedRecords.find(r => r.content === err.errorContent && r.timestamp.includes(err.date))) {
                 reviewRows.push([err.date, err.dept, err.productionOrder || "", err.errorContent, err.solution || "", ""]);
             }
        });
    }

    if (reviewRows.length > 0) {
        sheetReview.getRange(2, 1, reviewRows.length, 6).setValues(reviewRows);
        for(let i=0; i<reviewRows.length; i++) {
             if(reviewRows[i][5] !== "") sheetReview.setRowHeight(i+2, 100);
        }
    }

    // Cleanup default Sheet1 if exists
    const sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1) ss.deleteSheet(sheet1);

    // Save URL back to main DB
    docData.spreadsheetUrl = ss.getUrl();
    saveDocumentData(docData);

    return { success: true, url: ss.getUrl(), name: fileName };

  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function uploadImageToDrive(base64Data, fileName) {
  try {
    // Check if it's already a URL
    if (base64Data.startsWith('http')) return base64Data;

    const split = base64Data.split('base64,');
    if (split.length < 2) return ""; // Invalid base64

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
    
    // Use the thumbnail link for =IMAGE() formula as it works reliably without redirects
    // or use "https://drive.google.com/uc?export=view&id=" + file.getId()
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
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
