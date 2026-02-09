
import { DocumentData, DocStatus, DashboardStats, Employee } from '../types';

export const mockEmployees: Employee[] = [
    { id: 'NV001', name: 'Nguyễn Văn A', role: 'Trưởng ca In', dept: 'IN', status: 'Online', avatar: 'https://picsum.photos/40/40?random=1' },
    { id: 'NV002', name: 'Trần Thị B', role: 'Thủ Kho', dept: 'KHO', status: 'Offline', avatar: 'https://picsum.photos/40/40?random=2' },
    { id: 'NV003', name: 'Lê Văn C', role: 'Vận hành Sóng', dept: 'SÓNG', status: 'Online', avatar: 'https://picsum.photos/40/40?random=3' },
    { id: 'NV004', name: 'Phạm Thị D', role: 'KCS Thành phẩm', dept: 'THÀNH PHẨM', status: 'Busy', avatar: 'https://picsum.photos/40/40?random=4' },
    { id: 'thai', name: 'Admin Manager', role: 'Quản lý SX', dept: 'VĂN PHÒNG', status: 'Online', avatar: 'https://picsum.photos/40/40?random=5', isAdmin: true },
];

export const mockDocuments: DocumentData[] = [
  // HEINEKEN GROUP
  {
    id: 'HN-001',
    title: 'Thùng Tiger Crystal 24 lon 330ml',
    clientName: 'HEINEKEN VIETNAM',
    brandName: 'TIGER',
    docNumber: 'SKU-TIGER-CRYSTAL-24',
    productionOrder: 'LSX-2023-11-001',
    arrivalDate: '2023-11-20',
    unit: 'Phòng Kỹ Thuật',
    type: 'Thùng Carton',
    specs: {
        dimensions: '405 x 265 x 125 mm',
        boxType: 'RSC (A1)',
        paperMaterial: 'Duplex 250 - Xeo - Nâu',
        fluteType: 'Sóng B',
        layers: 3,
        printType: 'Offset 4 màu',
        colors: 4
    },
    pageCount: 1,
    securityLevel: 'Bình thường',
    recipient: 'Nhà máy Tiền Giang',
    handler: 'Nguyễn Kỹ Thuật',
    status: DocStatus.WAITING,
    attachmentName: 'TigerCrystal_Layout_v3.pdf',
    unreadCount: 3, // Mock Unread
    history: [
      { id: '1', user: 'Client - Anh Nam', avatar: 'https://picsum.photos/40/40?random=11', message: 'Em kiểm tra lại mã màu Pantone xanh Tiger nhé, hơi đậm.', timestamp: '09:00 AM', isMe: false },
      { id: '2', user: 'Bạn', avatar: 'https://picsum.photos/40/40?random=12', message: 'Dạ em đang cho test lại bản in mẫu.', timestamp: '09:15 AM', isMe: true },
      { id: '3', user: 'Quản lý', avatar: 'https://picsum.photos/40/40?random=13', message: '@NV001 Chú ý kiểm tra kỹ phần chồng màu nhé.', timestamp: '09:30 AM', isMe: false }
    ],
    errorLog: [
      { id: 'err-1', date: '01/01/2026', productionOrder: 'LSX-2023-11-001', dept: 'SÓNG', errorContent: 'Hở Nắp', solution: 'Điều chỉnh nhiệt độ lô sấy' },
      { id: 'err-2', date: '01/01/2026', productionOrder: 'LSX-2023-11-001', dept: 'IN', errorContent: 'Màu nhạt', solution: 'Thêm mực, tăng áp lực in' },
      { id: 'err-3', date: '02/01/2026', productionOrder: 'LSX-2023-11-001', dept: 'THÀNH PHẨM', errorContent: 'Bế lệch biên', solution: 'Cân chỉnh lại khuôn bế' }
    ],
    savedRecords: [],
    draftQueue: []
  },
  {
    id: 'HN-002',
    title: 'Thùng Larue Biere Xuất Khẩu',
    clientName: 'HEINEKEN VIETNAM',
    brandName: 'LARUE',
    docNumber: 'SKU-LARUE-EX-12',
    productionOrder: 'LSX-2023-11-005',
    arrivalDate: '2023-11-18',
    unit: 'Phòng Thiết Kế',
    type: 'Thùng Carton',
    specs: {
        dimensions: '300 x 200 x 150 mm',
        boxType: 'Die-cut (Bế)',
        paperMaterial: 'Kraft trắng',
        fluteType: 'Sóng E',
        layers: 3,
        printType: 'Flexo',
        colors: 2
    },
    pageCount: 1,
    securityLevel: 'Mật',
    recipient: 'Nhà máy Đà Nẵng',
    handler: 'Trần Thiết Kế',
    status: DocStatus.APPROVED,
    attachmentName: 'Larue_Diecut.dxf',
    unreadCount: 0,
    history: [],
    errorLog: [],
    savedRecords: [
         { id: 'REC-01', timestamp: '2023-11-19 14:00', productionOrder: 'LSX-2023-11-005', source: 'Manual', dept: 'THÀNH PHẨM', content: 'Duyệt mẫu thiết kế khuôn bế', images: ['https://picsum.photos/300/200?random=50'] }
    ],
    draftQueue: []
  },
  {
    id: 'HN-003',
    title: 'Thùng Heineken Silver 24 lon cao',
    clientName: 'HEINEKEN VIETNAM',
    brandName: 'HEINEKEN',
    docNumber: 'SKU-KEN-SILVER-24',
    productionOrder: 'LSX-2023-11-008',
    arrivalDate: '2023-11-21',
    unit: 'Phòng Kinh Doanh',
    type: 'Thùng Carton',
    specs: {
        dimensions: '410 x 270 x 160 mm',
        boxType: 'RSC (A1)',
        paperMaterial: 'Giấy tráng phủ cao cấp',
        fluteType: 'Sóng B',
        layers: 3,
        printType: 'Offset 6 màu + Varnish',
        colors: 6
    },
    pageCount: 2,
    securityLevel: 'Bình thường',
    recipient: 'Nhà máy Quận 12',
    handler: 'Lê Sale',
    status: DocStatus.PENDING,
    attachmentName: 'KenSilver_Spec.pdf',
    unreadCount: 5,
    history: [
         { id: '1', user: 'Kho', avatar: 'https://picsum.photos/40/40?random=55', message: 'Hàng này gấp lắm, khi nào có bản in?', timestamp: '08:00 AM', isMe: false }
    ],
    errorLog: [],
    savedRecords: [],
    draftQueue: []
  },

  // PEPSICO GROUP
  {
    id: 'PEP-001',
    title: 'Thùng Pepsi Cola 330ml x 24',
    clientName: 'SUNTORY PEPSICO',
    brandName: 'PEPSI',
    docNumber: 'SKU-PEP-STD-24',
    productionOrder: 'LSX-2023-11-012',
    arrivalDate: '2023-11-15',
    unit: 'Phòng Kỹ Thuật',
    type: 'Thùng Carton',
    specs: {
        dimensions: '380 x 250 x 120 mm',
        boxType: 'RSC (A1)',
        paperMaterial: 'Vàng - Xeo - Vàng',
        fluteType: 'Sóng C',
        layers: 5,
        printType: 'Flexo 3 màu',
        colors: 3
    },
    pageCount: 1,
    securityLevel: 'Bình thường',
    recipient: 'Nhà máy Đồng Nai',
    handler: 'Phạm Kỹ Thuật',
    status: DocStatus.URGENT,
    attachmentName: 'Pepsi_Blue.pdf',
    history: [],
    errorLog: [],
    savedRecords: [],
    draftQueue: []
  },
  {
    id: 'PEP-002',
    title: 'Hộp quà Tết 7UP - Lốc 6',
    clientName: 'SUNTORY PEPSICO',
    brandName: '7UP',
    docNumber: 'SKU-7UP-TET-06',
    productionOrder: 'LSX-2023-10-099',
    arrivalDate: '2023-10-25',
    unit: 'Phòng Marketing',
    type: 'Hộp Quà',
    specs: {
        dimensions: '200 x 140 x 200 mm',
        boxType: 'Nắp gài đáy khóa',
        paperMaterial: 'Ivory 350gsm bồi sóng E',
        fluteType: 'Sóng E',
        layers: 3,
        printType: 'Offset Metalize',
        colors: 5
    },
    pageCount: 1,
    securityLevel: 'Cao',
    recipient: 'Kho Marketing',
    handler: 'Võ Marketing',
    status: DocStatus.PENDING,
    attachmentName: '7Up_Tet2024.ai',
    history: [],
    errorLog: [],
    savedRecords: [],
    draftQueue: []
  },
  
  // UNILEVER
   {
    id: 'UNI-001',
    title: 'Thùng OMO Matic 3kg',
    clientName: 'UNILEVER VIETNAM',
    brandName: 'OMO',
    docNumber: 'SKU-OMO-3KG',
    productionOrder: 'LSX-2023-11-020',
    arrivalDate: '2023-11-22',
    unit: 'Phòng Kỹ Thuật',
    type: 'Thùng Carton',
    specs: {
        dimensions: '400 x 300 x 300 mm',
        boxType: 'RSC (A1)',
        paperMaterial: 'Nâu - Xeo - Nâu',
        fluteType: 'Sóng BC',
        layers: 5,
        printType: 'Flexo 2 màu',
        colors: 2
    },
    pageCount: 1,
    securityLevel: 'Bình thường',
    recipient: 'Nhà máy Củ Chi',
    handler: 'Hoàng Kỹ Thuật',
    status: DocStatus.APPROVED,
    attachmentName: 'OMO_Matic.pdf',
    history: [],
    errorLog: [],
    savedRecords: [],
    draftQueue: []
  }
];

export const dashboardStats: DashboardStats = {
  totalRecords: 1540,
  newRecords: 12, // New specs requests today
  pending: 45, // Design waiting
  waiting: 18, // Waiting for client approval
  overdue: 5,
  urgent: 8,
  incoming: 25,
  outgoing: 30,
  internal: 15,
  errorStats: [
    { name: 'T2', errors: 1, warnings: 2 },
    { name: 'T3', errors: 0, warnings: 4 },
    { name: 'T4', errors: 2, warnings: 1 },
    { name: 'T5', errors: 0, warnings: 3 },
    { name: 'T6', errors: 1, warnings: 5 },
    { name: 'T7', errors: 0, warnings: 0 },
    { name: 'CN', errors: 0, warnings: 0 },
  ],
  approvalStats: [
    { name: 'Đã Duyệt SX', value: 70, color: '#10B981' }, 
    { name: 'Chờ Duyệt Mẫu', value: 20, color: '#F59E0B' }, 
    { name: 'Hủy / Sửa', value: 10, color: '#EF4444' }, 
  ]
};
