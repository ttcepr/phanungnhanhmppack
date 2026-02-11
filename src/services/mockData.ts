import { DocumentData, DocStatus, DashboardStats, Employee } from '../types';

export const mockEmployees: Employee[] = [
    { id: 'NV001', name: 'Nguyễn Văn A', role: 'Trưởng ca In', dept: 'IN', status: 'Online', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=0D8ABC&color=fff' },
    { id: 'thai', name: 'Admin Manager', role: 'Quản lý SX', dept: 'VĂN PHÒNG', status: 'Online', avatar: 'https://ui-avatars.com/api/?name=Admin+Manager&background=random', isAdmin: true },
];

export const mockDocuments: DocumentData[] = [
  {
    id: 'HN-001',
    title: 'Thùng Tiger Crystal 24 lon 330ml',
    clientName: 'HEINEKEN VIETNAM',
    brandName: 'TIGER',
    docNumber: 'SKU-TIGER-CRYSTAL-24',
    productionOrder: 'LSX-2023-11-001',
    arrivalDate: '2023-11-20',
    unit: 'Phòng Kỹ Thuật',
    status: DocStatus.WAITING,
    specs: {
        dimensions: '405 x 265 x 125 mm',
        boxType: 'RSC (A1)',
        paperMaterial: 'Duplex 250 - Xeo - Nâu',
        fluteType: 'Sóng B',
        layers: 3,
        printType: 'Offset 4 màu',
        colors: 4
    },
    recipient: 'Nhà máy Tiền Giang',
    handler: 'Nguyễn Kỹ Thuật',
    history: [
      { id: '1', user: 'Client - Anh Nam', avatar: '', message: 'Em kiểm tra lại mã màu Pantone xanh Tiger nhé.', timestamp: '09:00 AM', isMe: false }
    ],
    errorLog: [],
    savedRecords: [],
    draftQueue: [],
    tcktRecords: []
  },
  {
    id: 'PEP-001',
    title: 'Thùng Pepsi Cola 330ml x 24',
    clientName: 'SUNTORY PEPSICO',
    brandName: 'PEPSI',
    docNumber: 'SKU-PEP-STD-24',
    productionOrder: 'LSX-2023-11-012',
    arrivalDate: '2023-11-15',
    unit: 'Phòng Kỹ Thuật',
    status: DocStatus.URGENT,
    specs: {
        dimensions: '380 x 250 x 120 mm',
        boxType: 'RSC (A1)',
        paperMaterial: 'Vàng - Xeo - Vàng',
        fluteType: 'Sóng C',
        layers: 5,
        printType: 'Flexo 3 màu',
        colors: 3
    },
    recipient: 'Nhà máy Đồng Nai',
    handler: 'Phạm Kỹ Thuật',
    history: [],
    errorLog: [],
    savedRecords: [],
    draftQueue: [],
    tcktRecords: []
  }
];

export const dashboardStats: DashboardStats = {
  totalRecords: 1540,
  newRecords: 12,
  pending: 45,
  waiting: 18,
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
  ],
  approvalStats: [
    { name: 'Đã Duyệt SX', value: 70, color: '#10B981' }, 
    { name: 'Chờ Duyệt Mẫu', value: 20, color: '#F59E0B' }, 
    { name: 'Hủy / Sửa', value: 10, color: '#EF4444' }, 
  ]
};