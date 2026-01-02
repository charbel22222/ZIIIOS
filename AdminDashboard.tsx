
import React, { useState } from 'react';
import { User, Role, UserRoleType, Customer, Product, Sale } from '../types';
import UserDashboard from './UserDashboard';
import { AppData, downloadBackup } from '../storage';

interface AdminDashboardProps {
  activeMenu: string;
  activeSubMenu?: string;
  roles: Role[];
  users: User[];
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  onAddRole: (name: string) => void;
  onUpdateRole: (id: string, name: string) => void;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onUpdateAdmin: (username: string, password?: string) => void;
  onAddCustomer: (customer: Partial<Customer>) => void;
  onAddProduct: (product: Partial<Product>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onAddSale: (sale: Partial<Sale>) => void;
  onUpdateSale: (id: string, sale: Partial<Sale>) => void;
  onRestoreData: (data: AppData) => void;
  currentUser: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  activeMenu, activeSubMenu, roles, users, customers, products, sales,
  onAddRole, onUpdateRole, onAddUser, onUpdateUser, onUpdateAdmin,
  onAddCustomer, onAddProduct, onUpdateProduct, onAddSale, onUpdateSale,
  onRestoreData, currentUser
}) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newUser, setNewUser] = useState({ fullName: '', username: '', password: '', roleId: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [adminCreds, setAdminCreds] = useState({ username: currentUser.username, password: '' });

  const [selectedRoleForView, setSelectedRoleForView] = useState<string>('all');

  const handleBackupDownload = () => {
    downloadBackup({ roles, users, customers, products, sales });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.users && json.roles) {
          onRestoreData(json);
          alert("Database successfully restored.");
        } else {
          alert("Invalid backup file format.");
        }
      } catch (e) {
        alert("Error reading file.");
      }
    };
    reader.readAsText(file);
  };

  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Executive Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 p-8 rounded-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Departments</div>
             <div className="text-3xl font-black text-slate-900">{roles.length}</div>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Total Personnel</div>
             <div className="text-3xl font-black text-slate-900">{users.filter(u => u.roleType === UserRoleType.USER).length}</div>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Active Clients</div>
             <div className="text-3xl font-black text-slate-900">{customers.length}</div>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Total Revenue</div>
             <div className="text-3xl font-black text-indigo-600">${sales.reduce((a, s) => a + s.totalPrice, 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    );
  }

  if (activeMenu === 'roles') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="bg-white p-10 border border-slate-200 rounded-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center tracking-tight">
            <i className="fas fa-layer-group text-indigo-600 mr-3"></i>
            Role Specification
          </h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingRole) { onUpdateRole(editingRole.id, newRoleName); setEditingRole(null); }
            else { onAddRole(newRoleName); }
            setNewRoleName('');
          }} className="flex gap-4 max-w-xl">
            <input
              type="text"
              placeholder="Operational Category Name"
              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-indigo-600 focus:outline-none text-sm font-bold"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
            />
            <button type="submit" className="px-8 py-3 bg-[#0f172a] text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">
              {editingRole ? 'Update Entity' : 'Create Entity'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Defined Domain Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">System Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-700">{role.name}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => { setEditingRole(role); setNewRoleName(role.name); }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest"
                    >
                      Modify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeMenu === 'users') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="bg-white p-10 border border-slate-200 rounded-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">{editingUser ? 'Staff Record Modification' : 'Staff Enrollment'}</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingUser) { onUpdateUser(editingUser.id, newUser); setEditingUser(null); }
            else { onAddUser({ ...newUser, roleType: UserRoleType.USER }); }
            setNewUser({ fullName: '', username: '', password: '', roleId: '' });
          }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <input
              placeholder="Personnel Name"
              className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-indigo-600 outline-none text-sm font-bold"
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              required
            />
            <input
              placeholder="Identity Key"
              className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-indigo-600 outline-none text-sm font-bold"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder={editingUser ? "New Authorization Pin" : "Authorization Pin"}
              className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-indigo-600 outline-none text-sm font-bold"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required={!editingUser}
            />
            <select
              className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-indigo-600 outline-none text-sm font-black uppercase tracking-widest"
              value={newUser.roleId}
              onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
              required
            >
              <option value="">Select Domain</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div className="lg:col-span-4 flex justify-end pt-4">
              <button type="submit" className="px-10 py-3 bg-[#0f172a] text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-lg">
                {editingUser ? 'Commit Record Changes' : 'Execute Enrollment'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Domain</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.filter(u => u.roleType === UserRoleType.USER).map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900 uppercase tracking-tight">{user.fullName}</td>
                  <td className="px-8 py-6 text-slate-500 font-bold">{user.username}</td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-sm border border-indigo-100 uppercase tracking-widest">
                      {roles.find(r => r.id === user.roleId)?.name || 'Generic'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        setEditingUser(user);
                        setNewUser({ fullName: user.fullName, username: user.username, password: '', roleId: user.roleId || '' });
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest"
                    >
                      Modify Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeSubMenu === 'backup') {
    return (
      <div className="max-w-xl animate-in fade-in duration-300">
        <div className="bg-white p-10 border border-slate-200 rounded-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center tracking-tight">
            <i className="fas fa-server text-indigo-600 mr-4"></i>
            DATA PORTABILITY
          </h3>
          <p className="text-slate-500 mb-10 text-sm leading-relaxed font-medium italic">
            Export the complete system state for local archiving, or restore information from a valid ZIOS backup file.
          </p>
          
          <div className="space-y-10">
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-sm space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archive Extraction</h4>
               <p className="text-xs text-slate-600">Download all current records (Users, Sales, Products) as a single JSON file.</p>
               <button 
                  onClick={handleBackupDownload}
                  className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center"
               >
                  <i className="fas fa-download mr-3"></i> Download Local Database
               </button>
            </div>

            <div className="p-8 bg-slate-50 border border-slate-200 rounded-sm space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restore Operations</h4>
               <p className="text-xs text-slate-600">Upload a legacy backup file to overwrite the current system state. Warning: All current unsaved changes will be lost.</p>
               <div className="relative group">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full py-4 bg-white border-2 border-dashed border-slate-300 text-slate-500 font-black text-xs uppercase tracking-widest flex items-center justify-center group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                     <i className="fas fa-upload mr-3"></i> Select Backup File
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle Global Data & Global Sales
  if (activeMenu === 'data' || activeMenu === 'sales') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 p-6 rounded-sm flex items-center justify-between">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context Filter:</div>
           <select 
             className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-600"
             value={selectedRoleForView}
             onChange={(e) => setSelectedRoleForView(e.target.value)}
           >
             <option value="all">Enterprise-Wide View</option>
             {roles.map(r => <option key={r.id} value={r.id}>{r.name} Context</option>)}
           </select>
        </div>
        
        <UserDashboard 
          activeMenu={activeSubMenu === 'new-sale' ? 'sales' : activeSubMenu === 'history' ? 'sales' : activeSubMenu || activeMenu}
          customers={customers}
          products={products}
          sales={sales}
          roleId={selectedRoleForView}
          isAdmin={true}
          availableRoles={roles}
          onAddCustomer={onAddCustomer}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          onAddSale={onAddSale}
          onUpdateSale={onUpdateSale}
          isViewingHistoryOnly={activeSubMenu === 'history'}
          isCreatingOnly={activeSubMenu === 'new-sale'}
        />
      </div>
    );
  }

  if (activeSubMenu === 'profile') {
    return (
      <div className="max-w-xl animate-in fade-in duration-300">
        <div className="bg-white p-10 border border-slate-200 rounded-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center tracking-tight">
            <i className="fas fa-user-shield text-indigo-600 mr-4"></i>
            AUTHENTICATION KEY
          </h3>
          <p className="text-slate-500 mb-10 text-sm leading-relaxed font-medium italic">
            Reset administrative access tokens. Changes will immediately terminate existing executive sessions.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); onUpdateAdmin(adminCreds.username, adminCreds.password || undefined); alert("Security keys updated."); }} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Identity</label>
              <input
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-indigo-600 outline-none text-sm font-bold"
                value={adminCreds.username}
                onChange={(e) => setAdminCreds({ ...adminCreds, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">New Authorization Secret</label>
              <input
                type="password"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-indigo-600 outline-none text-sm font-bold"
                value={adminCreds.password}
                onChange={(e) => setAdminCreds({ ...adminCreds, password: e.target.value })}
              />
            </div>
            <button type="submit" className="w-full py-4 bg-[#0f172a] text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
              Execute Security Key Exchange
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminDashboard;
