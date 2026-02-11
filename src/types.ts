
export enum DocStatus {
  PENDING = 'Thiết kế mới',
  WAITING = 'Chờ duyệt mẫu',
  APPROVED = 'Đã duyệt SX',
  URGENT = 'Gấp'
}

export type DeptType = 'SÓNG' | 'IN' | 'THÀNH PHẨM' | 'KHO';

export interface Employee {
  id: string;
  name: string;
  password?: string;
  role: string;
  dept: DeptType | 'VĂN PHÒNG';
  status: 'Online' | 'Offline' | 'Busy';
  avatar?: string;
  isAdmin?: boolean;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  deviceInfo: string;
  status: 'Success' | 'Failed';
}

export interface ProductionError {
  id: string;
  date: string;
  productionOrder?: