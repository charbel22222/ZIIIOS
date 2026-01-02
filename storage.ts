
import { User, Role, Customer, Product, Sale, UserRoleType } from './types';

const STORAGE_KEY = 'zios_store_data';

export interface AppData {
  users: User[];
  roles: Role[];
  customers: Customer[];
  products: Product[];
  sales: Sale[];
}

const DEFAULT_DATA: AppData = {
  users: [
    {
      id: 'admin-id',
      username: 'admin',
      password: 'admin',
      fullName: 'System Administrator',
      roleType: UserRoleType.ADMIN,
      roleId: null
    }
  ],
  roles: [],
  customers: [],
  products: [],
  sales: []
};

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_DATA;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const downloadBackup = (data: AppData) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `zios_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
