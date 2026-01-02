
import React, { useState, useEffect } from 'react';
import { User, Role, Customer, Product, Sale, UserRoleType } from './types';
import { loadData, saveData, AppData } from './storage';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

const App: React.FC = () => {
  const [data, setData] = useState(loadData());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | undefined>();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string | undefined>();

  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleLogin = (username: string, password: string) => {
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setLoginError(undefined);
      setActiveMenu('dashboard');
      setActiveSubMenu(undefined);
    } else {
      setLoginError("Authorization failure.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveMenu('dashboard');
    setActiveSubMenu(undefined);
  };

  const handleMenuChange = (menu: string, subMenu?: string) => {
    setActiveMenu(menu);
    setActiveSubMenu(subMenu);
  };

  const updateData = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Global Actions
  const addRole = (name: string) => updateData('roles', [...data.roles, { id: crypto.randomUUID(), name }]);
  const updateRole = (id: string, name: string) => updateData('roles', data.roles.map(r => r.id === id ? { ...r, name } : r));
  const addUser = (userData: Partial<User>) => updateData('users', [...data.users, { id: crypto.randomUUID(), username: userData.username!, password: userData.password!, fullName: userData.fullName!, roleType: UserRoleType.USER, roleId: userData.roleId! }]);
  const updateUser = (id: string, userData: Partial<User>) => updateData('users', data.users.map(u => u.id === id ? { ...u, ...userData } : u));
  const updateAdmin = (username: string, password?: string) => updateData('users', data.users.map(u => u.roleType === UserRoleType.ADMIN ? { ...u, username, password: password || u.password } : u));
  const addCustomer = (c: Partial<Customer>) => updateData('customers', [...data.customers, { id: crypto.randomUUID(), roleId: c.roleId!, name: c.name!, phone: c.phone!, address: c.address! }]);
  const addProduct = (p: Partial<Product>) => updateData('products', [...data.products, { id: crypto.randomUUID(), roleId: p.roleId!, name: p.name!, costPrice: p.costPrice!, sellingPrice: p.sellingPrice! }]);
  const updateProduct = (id: string, p: Partial<Product>) => updateData('products', data.products.map(item => item.id === id ? { ...item, ...p } : item));
  const addSale = (s: Partial<Sale>) => updateData('sales', [...data.sales, { id: crypto.randomUUID(), roleId: s.roleId!, customerId: s.customerId!, productItems: s.productItems!, date: s.date!, discount: s.discount!, status: s.status!, totalCost: s.totalCost!, totalPrice: s.totalPrice! }]);
  const updateSale = (id: string, s: Partial<Sale>) => updateData('sales', data.sales.map(item => item.id === id ? { ...item, ...s } : item));
  
  const restoreData = (newData: AppData) => {
    setData(newData);
    // If admin username changed in backup, we might want to logout, but for now we keep session
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  const roleName = currentUser.roleId ? data.roles.find(r => r.id === currentUser.roleId)?.name : undefined;

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      activeMenu={activeMenu} 
      activeSubMenu={activeSubMenu}
      onMenuChange={handleMenuChange}
      roleName={roleName}
    >
      {currentUser.roleType === UserRoleType.ADMIN ? (
        <AdminDashboard 
          activeMenu={activeMenu}
          activeSubMenu={activeSubMenu}
          roles={data.roles}
          users={data.users}
          customers={data.customers}
          products={data.products}
          sales={data.sales}
          currentUser={currentUser}
          onAddRole={addRole}
          onUpdateRole={updateRole}
          onAddUser={addUser}
          onUpdateUser={updateUser}
          onUpdateAdmin={updateAdmin}
          onAddCustomer={addCustomer}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onAddSale={addSale}
          onUpdateSale={updateSale}
          onRestoreData={restoreData}
        />
      ) : (
        <UserDashboard 
          activeMenu={activeMenu}
          customers={data.customers}
          products={data.products}
          sales={data.sales}
          roleId={currentUser.roleId!}
          onAddCustomer={addCustomer}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onAddSale={addSale}
          onUpdateSale={updateSale}
          isCreatingOnly={activeSubMenu === 'new-sale'}
          isViewingHistoryOnly={activeSubMenu === 'history'}
        />
      )}
    </Layout>
  );
};

export default App;
