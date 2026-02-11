
export enum DocStatus {
  PENDING = 'Thiết kế mới',
  WAITING = 'Chờ duyệt mẫu',
  APPROVED = 'Đã duyệt SX',
  URGENT = 'Gấp'
}

export type DeptType = 'SÓNG' | 'IN' | 'THÀNH PHẨM' | 'KHO';

export interface Employee {
  id: string; // Mã NV (VD: NV001)
  name: string;
  password?: string; // Mật khẩu đăng nhập
  role: string;
  dept: DeptType | 'VĂN PHÒNG';
  status: 'Online' | 'Offline' | 'Busy';
  avatar?: string;
  isAdmin?: boolean; // New field to determine access level
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string; // ISO String
  deviceInfo: string; // "Chrome on Windows", etc.
  status: 'Success' | 'Failed';
}

export interface ProductionError {
  id: string;
  date: string;
  productionOrder?: string; // Link error to specific PO
  dept: DeptType;
  errorContent: string;
  solution: string;
}

export interface SavedRecord {
  id: string;
  timestamp: string;
  productionOrder?: string; // Link record to specific PO
  source: 'Chat' | 'Manual';
  dept?: DeptType;
  content: string; // The error description
  solution?: string;
  images: string[];
}

// New Interface for Technical Specs (TCKT)
export interface TCKTRecord {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD for grouping
  productionOrder: string;
  user: string;
  content: string;
  images: string[];
}

export interface DraftItem {
  id: string;
  type: 'image' | 'text';
  content: string;
  timestamp: string;
  autoDept?: DeptType; // The department of the employee who sent it
}

export interface PackagingSpecs {
  dimensions: string; // Dài x Rộng x Cao
  boxType: string; // A1, Nắp gài, Âm dương...
  paperMaterial: string; // Vàng, Trắng, Kraft...
  fluteType: string; // Sóng A, B, C, E, BC...
  layers: number; // 3 lớp, 5 lớp, 7 lớp
  printType: string; // Flexo, Offset
  colors: number; // Số màu in
}

export interface DocumentData {
  id: string;
  title: string; // Tên sản phẩm (VD: Thùng Tiger 24 lon)
  clientName: string; // Tên khách hàng (Heineken, Pepsico)
  brandName: string; // Nhãn hàng (Tiger, Larue, Pepsi)
  docNumber: string; // Mã sản phẩm (Fixed)
  productionOrder?: string; // Phiếu sản xuất (Editable)
  arrivalDate: string; // Ngày tạo
  
  // Specs
  specs?: PackagingSpecs;
  
  unit: string; // Đơn vị phụ trách
  recipient: string; 
  handler: string; 
  status: DocStatus;
  attachmentName?: string;
  history?: ChatMessage[];
  unreadCount?: number; // Number of unread messages for this user context
  
  // Logs & Staging
  errorLog?: ProductionError[];
  savedRecords?: SavedRecord[]; 
  tcktRecords?: TCKTRecord[]; // New field for TCKT
  draftQueue?: DraftItem[]; // Persistent temporary storage
  
  // Additional fields
  type?: string;
  pageCount?: number;
  securityLevel?: string;
  spreadsheetUrl?: string; // Link to the specific Google Sheet for this document
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  image?: string; 
  timestamp: string;
  isMe: boolean;
}

export interface ErrorStat {
  name: string;
  errors: number;
  warnings: number;
}

export interface ApprovalStat {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStats {
  totalRecords: number;
  newRecords: number;
  pending: number;
  waiting: number;
  overdue: number;
  urgent: number;
  incoming: number;
  outgoing: number;
  internal: number;
  errorStats: ErrorStat[];
  approvalStats: ApprovalStat[];
}

export interface AppSettings {
    enableLocalBackup: boolean;
    syncIntervalMinutes: number;
    googleDriveFolder: string;
    lastSyncTime: string;
    autoSaveToSheet: boolean;
}
