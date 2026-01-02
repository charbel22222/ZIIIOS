
import React, { ReactNode, useState } from 'react';
import { User, UserRoleType } from '../types';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  children?: { id: string; label: string }[];
}

interface LayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
  activeMenu: string;
  activeSubMenu?: string;
  onMenuChange: (menu: string, subMenu?: string) => void;
  roleName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeMenu, activeSubMenu, onMenuChange, roleName }) => {
  const isAdmin = user.roleType === UserRoleType.ADMIN;
  const [openMenus, setOpenMenus] = useState<string[]>(['sales', 'data', 'system']);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const adminMenu: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'roles', label: 'Role Architecture', icon: 'fa-shield-halved' },
    { id: 'users', label: 'User Directory', icon: 'fa-user-group' },
    { 
      id: 'data', 
      label: 'Global Data', 
      icon: 'fa-database',
      children: [
        { id: 'customers', label: 'All Customers' },
        { id: 'products', label: 'All Products' },
      ]
    },
    { 
      id: 'sales', 
      label: 'Global Sales', 
      icon: 'fa-file-invoice-dollar',
      children: [
        { id: 'new-sale', label: 'Insert Sale' },
        { id: 'history', label: 'Sales Ledger' },
      ]
    },
    { 
      id: 'system', 
      label: 'Management', 
      icon: 'fa-sliders',
      children: [
        { id: 'profile', label: 'Security Keys' },
        { id: 'backup', label: 'Data Backup' },
      ]
    },
  ];

  const userMenu: MenuItem[] = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-house' },
    { id: 'customers', label: 'Customer Relations', icon: 'fa-address-book' },
    { id: 'products', label: 'Product Catalog', icon: 'fa-boxes-stacked' },
    { 
      id: 'sales', 
      label: 'Sales Center', 
      icon: 'fa-file-invoice-dollar',
      children: [
        { id: 'new-sale', label: 'New Transaction' },
        { id: 'history', label: 'Sales Ledger' },
      ]
    },
  ];

  const currentMenu = isAdmin ? adminMenu : userMenu;

  return (
    <div className="flex h-screen bg-[#fcfcfd] overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800">
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <i className="fas fa-store text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">ZIOS <span className="text-indigo-400">STORE</span></span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {currentMenu.map((item) => (
            <div key={item.id} className="space-y-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-colors font-medium text-sm ${
                      activeMenu === item.id ? 'text-white' : 'hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className={`fas ${item.icon} w-5 mr-3 text-slate-500`}></i>
                      {item.label}
                    </div>
                    <i className={`fas fa-chevron-down text-[10px] transition-transform ${openMenus.includes(item.id) ? 'rotate-180' : ''}`}></i>
                  </button>
                  {openMenus.includes(item.id) && (
                    <div className="ml-9 space-y-1 border-l border-slate-800">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => onMenuChange(item.id, child.id)}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${
                            (activeMenu === item.id && activeSubMenu === child.id) || (activeMenu === child.id) 
                              ? 'text-indigo-400 font-bold' 
                              : 'text-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => onMenuChange(item.id)}
                  className={`w-full flex items-center px-4 py-2.5 rounded-md transition-colors font-medium text-sm ${
                    activeMenu === item.id 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 mr-3 ${activeMenu === item.id ? 'text-white' : 'text-slate-500'}`}></i>
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-slate-500 hover:text-red-400 text-sm font-bold transition-colors"
          >
            <i className="fas fa-power-off mr-3"></i>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10">
          <div className="flex items-center space-x-3 text-sm font-medium text-slate-400">
            <span>Management</span>
            <i className="fas fa-chevron-right text-[10px]"></i>
            <span className="text-slate-900 font-bold capitalize">{activeMenu.replace('-', ' ')}</span>
            {activeSubMenu && (
              <>
                <i className="fas fa-chevron-right text-[10px]"></i>
                <span className="text-indigo-600 font-bold capitalize">{activeSubMenu.replace('-', ' ')}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">{user.fullName}</div>
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                {isAdmin ? 'System Admin' : roleName}
              </div>
            </div>
            <div className="h-10 w-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400">
               <i className="fas fa-user-tie"></i>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
