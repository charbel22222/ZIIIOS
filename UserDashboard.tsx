
import React, { useState } from 'react';
import { Customer, Product, Sale, SaleStatus, User, Role } from '../types';

interface UserDashboardProps {
  activeMenu: string;
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  roleId: string;
  isAdmin?: boolean;
  availableRoles?: Role[];
  onAddCustomer: (customer: Partial<Customer>) => void;
  onAddProduct: (product: Partial<Product>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onAddSale: (sale: Partial<Sale>) => void;
  onUpdateSale: (id: string, sale: Partial<Sale>) => void;
  isViewingHistoryOnly?: boolean;
  isCreatingOnly?: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  activeMenu, customers, products, sales, roleId, isAdmin, availableRoles,
  onAddCustomer, onAddProduct, onUpdateProduct, onAddSale, onUpdateSale,
  isViewingHistoryOnly, isCreatingOnly
}) => {
  const roleCustomers = (isAdmin && roleId === 'all') ? customers : customers.filter(c => c.roleId === roleId);
  const roleProducts = (isAdmin && roleId === 'all') ? products : products.filter(p => p.roleId === roleId);
  const roleSales = (isAdmin && roleId === 'all') ? sales : sales.filter(s => s.roleId === roleId);

  const [saleFilter, setSaleFilter] = useState<'all' | 'unpaid'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Sale | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  
  const [targetRoleId, setTargetRoleId] = useState(isAdmin && roleId !== 'all' ? roleId : '');

  const [newSale, setNewSale] = useState({
    customerId: '',
    productItems: [{ productId: '', quantity: 1 }],
    discount: 0,
    status: SaleStatus.UNPAID,
    date: new Date().toISOString().split('T')[0]
  });

  const calculateSaleTotals = (saleData: typeof newSale) => {
    let subtotalPrice = 0;
    let subtotalCost = 0;
    saleData.productItems.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        subtotalPrice += p.sellingPrice * item.quantity;
        subtotalCost += p.costPrice * item.quantity;
      }
    });
    return { totalPrice: subtotalPrice - saleData.discount, totalCost: subtotalCost };
  };

  const totals = calculateSaleTotals(newSale);

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoleId = isAdmin ? targetRoleId : roleId;
    if (!newSale.customerId || !finalRoleId) {
        alert("Selection incomplete."); return;
    }
    const { totalPrice, totalCost } = calculateSaleTotals(newSale);
    
    const payload = {
      ...newSale,
      roleId: finalRoleId,
      totalPrice,
      totalCost,
      productItems: newSale.productItems.map(item => ({
        ...item,
        priceAtSale: products.find(p => p.id === item.productId)?.sellingPrice || 0
      }))
    };

    if (editingSaleId) {
      onUpdateSale(editingSaleId, payload);
      setEditingSaleId(null);
      alert("Transaction records updated.");
    } else {
      onAddSale(payload);
      alert("New transaction logged.");
    }

    setNewSale({ customerId: '', productItems: [{ productId: '', quantity: 1 }], discount: 0, status: SaleStatus.UNPAID, date: new Date().toISOString().split('T')[0] });
  };

  const startEditingSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setTargetRoleId(sale.roleId);
    setNewSale({
      customerId: sale.customerId,
      productItems: sale.productItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
      discount: sale.discount,
      status: sale.status,
      date: sale.date
    });
  };

  if (activeMenu === 'dashboard') {
    const totalRev = roleSales.reduce((acc, s) => acc + s.totalPrice, 0);
    const totalProf = roleSales.reduce((acc, s) => acc + (s.totalPrice - s.totalCost), 0);
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Operational Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border-t-4 border-t-indigo-600 p-8 border border-slate-200 shadow-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Gross Revenue</div>
             <div className="text-4xl font-black text-slate-900">${totalRev.toLocaleString()}</div>
          </div>
          <div className="bg-white border-t-4 border-t-emerald-600 p-8 border border-slate-200 shadow-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Calculated Profit</div>
             <div className="text-4xl font-black text-emerald-600">${totalProf.toLocaleString()}</div>
          </div>
          <div className="bg-white border-t-4 border-t-slate-950 p-8 border border-slate-200 shadow-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Partner Base</div>
             <div className="text-4xl font-black text-slate-900">{roleCustomers.length}</div>
          </div>
        </div>
      </div>
    );
  }

  if (activeMenu === 'customers') {
    if (selectedCustomerId) {
        const customer = roleCustomers.find(c => c.id === selectedCustomerId);
        const customerSales = roleSales.filter(s => s.customerId === selectedCustomerId);
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <button onClick={() => setSelectedCustomerId(null)} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> RETURN TO LEDGER
            </button>
            <div className="bg-white p-10 border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">{customer?.name}</h2>
                <div className="text-sm text-slate-500 font-bold space-x-4 uppercase tracking-tighter">
                  <span>{customer?.phone}</span>
                  <span className="text-slate-300">|</span>
                  <span>{customer?.address}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Billing</div>
                <div className="text-3xl font-black text-indigo-600">${customerSales.reduce((a, s) => a + s.totalPrice, 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-4">Filing Date</th>
                    <th className="px-8 py-4">Total Amount</th>
                    <th className="px-8 py-4">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerSales.map(s => (
                    <tr key={s.id} className="text-sm">
                      <td className="px-8 py-5 text-slate-600 font-bold">{s.date}</td>
                      <td className="px-8 py-5 font-black text-slate-900">${s.totalPrice.toFixed(2)}</td>
                      <td className="px-8 py-5">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border ${s.status === SaleStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="bg-white p-10 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight uppercase">Business Associate Registration</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.target as HTMLFormElement);
            onAddCustomer({ name: f.get('n') as string, phone: f.get('p') as string, address: f.get('a') as string, roleId: isAdmin ? (f.get('r') as string) : roleId });
            (e.target as HTMLFormElement).reset();
          }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input name="n" placeholder="Corporate/Personal Name" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600" />
            <input name="p" placeholder="Primary Contact Phone" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600" />
            <input name="a" placeholder="Registered Office Address" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600" />
            {isAdmin && (
              <select name="r" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-black uppercase tracking-widest focus:ring-1 focus:ring-indigo-600">
                <option value="">Target Operation Domain</option>
                {availableRoles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            )}
            <button type="submit" className="md:col-span-3 py-4 bg-[#0f172a] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg">Execute Associate Enrollment</button>
          </form>
        </div>
        <div className="bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Corporate Entity</th>
                <th className="px-8 py-5">Communication</th>
                {isAdmin && <th className="px-8 py-5">Domain</th>}
                <th className="px-8 py-5 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roleCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedCustomerId(c.id)}>
                  <td className="px-8 py-6 font-bold text-slate-900 uppercase tracking-tight">{c.name}</td>
                  <td className="px-8 py-6 text-slate-500 font-bold text-sm tracking-tighter">{c.phone}</td>
                  {isAdmin && <td className="px-8 py-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest">{availableRoles?.find(r => r.id === c.roleId)?.name}</td>}
                  <td className="px-8 py-6 text-right font-black text-[10px] text-indigo-600 uppercase tracking-[0.1em]">Analyze Ledger</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeMenu === 'products') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="bg-white p-10 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight uppercase">Inventory Cataloging</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.target as HTMLFormElement);
            onAddProduct({ name: f.get('n') as string, costPrice: parseFloat(f.get('c') as string), sellingPrice: parseFloat(f.get('s') as string), roleId: isAdmin ? (f.get('r') as string) : roleId });
            (e.target as HTMLFormElement).reset();
          }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input name="n" placeholder="Universal Sku / Model" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600" />
            <input name="c" type="number" step="0.01" placeholder="Base Acquisition Cost" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600" />
            <input name="s" type="number" step="0.01" placeholder="Target Market Price" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600" />
            {isAdmin && (
              <select name="r" required className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-black uppercase tracking-widest focus:ring-1 focus:ring-indigo-600">
                <option value="">Domain Allocation</option>
                {availableRoles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            )}
            <button type="submit" className="md:col-span-3 py-4 bg-[#0f172a] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg">Commit Product Entry</button>
          </form>
        </div>
        <div className="bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Description / SKU</th>
                <th className="px-8 py-5">Internal Cost</th>
                <th className="px-8 py-5">Retail Price</th>
                <th className="px-8 py-5 text-right">System Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roleProducts.map(p => (
                <tr key={p.id}>
                  <td className="px-8 py-6 font-bold text-slate-900 uppercase tracking-tight">{p.name}</td>
                  <td className="px-8 py-6 text-slate-500 font-bold tracking-tighter">${p.costPrice.toFixed(2)}</td>
                  <td className="px-8 py-6 font-black text-indigo-700 tracking-tighter">${p.sellingPrice.toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => {
                      const n = prompt("Product Sku Modification", p.name);
                      const s = prompt("New Price Point", p.sellingPrice.toString());
                      if(n && s) onUpdateProduct(p.id, {name: n, sellingPrice: parseFloat(s)});
                    }} className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Update Specs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeMenu === 'sales') {
    if (isCreatingOnly || editingSaleId) {
      return (
        <div className="bg-white p-12 border border-slate-200 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              {editingSaleId ? 'Transaction Modification' : 'Formal Transaction Entry'}
            </h3>
            {editingSaleId && (
              <button 
                onClick={() => {
                  setEditingSaleId(null);
                  setNewSale({ customerId: '', productItems: [{ productId: '', quantity: 1 }], discount: 0, status: SaleStatus.UNPAID, date: new Date().toISOString().split('T')[0] });
                }} 
                className="text-[10px] font-black text-red-500 uppercase tracking-widest"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleSaleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Domain</label>
                  <select 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600"
                    value={targetRoleId}
                    onChange={(e) => setTargetRoleId(e.target.value)}
                    required
                  >
                    <option value="">Select Domain</option>
                    {availableRoles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Associate Client</label>
                <select 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:ring-1 focus:ring-indigo-600"
                  value={newSale.customerId}
                  onChange={(e) => setNewSale({ ...newSale, customerId: e.target.value })}
                  required
                >
                  <option value="">Choose Associate...</option>
                  {(isAdmin ? customers.filter(c => c.roleId === targetRoleId) : roleCustomers).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</label>
                <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold" value={newSale.date} onChange={e => setNewSale({...newSale, date: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Audit Status</label>
                <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-black uppercase tracking-widest" value={newSale.status} onChange={e => setNewSale({...newSale, status: e.target.value as SaleStatus})}>
                   <option value={SaleStatus.PAID}>Audit Cleared</option>
                   <option value={SaleStatus.UNPAID}>Payment Outstanding</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filing Line Items</label>
               {newSale.productItems.map((item, idx) => (
                 <div key={idx} className="flex gap-4 group">
                    <select 
                      className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold"
                      value={item.productId}
                      onChange={e => {
                        const next = [...newSale.productItems];
                        next[idx].productId = e.target.value;
                        setNewSale({...newSale, productItems: next});
                      }}
                      required
                    >
                      <option value="">Filing Sku</option>
                      {(isAdmin ? products.filter(p => p.roleId === targetRoleId) : roleProducts).map(p => <option key={p.id} value={p.id}>{p.name} (${p.sellingPrice})</option>)}
                    </select>
                    <input type="number" min="1" className="w-24 px-5 py-3 bg-slate-50 border border-slate-200 outline-none text-sm font-bold" value={item.quantity} onChange={e => {
                      const next = [...newSale.productItems];
                      next[idx].quantity = parseInt(e.target.value);
                      setNewSale({...newSale, productItems: next});
                    }} />
                    {newSale.productItems.length > 1 && (
                      <button type="button" onClick={() => setNewSale({...newSale, productItems: newSale.productItems.filter((_, i) => i !== idx)})} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                 </div>
               ))}
               <button type="button" onClick={() => setNewSale({...newSale, productItems: [...newSale.productItems, {productId: '', quantity: 1}]})} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">+ APPEND LINE ENTRY</button>
            </div>

            <div className="flex justify-between items-end border-t border-slate-100 pt-10">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manual Adjustment ($)</label>
                  <input type="number" className="px-5 py-3 bg-slate-50 border border-slate-200 outline-none font-bold text-sm" value={newSale.discount} onChange={e => setNewSale({...newSale, discount: parseFloat(e.target.value) || 0})} />
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Ledger Total</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">${totals.totalPrice.toFixed(2)}</div>
               </div>
            </div>
            <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 transform active:scale-[0.99]">
              {editingSaleId ? 'Commit Modification to Ledger' : 'Finalize & Log Executive Transaction'}
            </button>
          </form>
        </div>
      );
    }

    const filteredLedger = roleSales.filter(s => {
      const matchStatus = saleFilter === 'all' || s.status === SaleStatus.UNPAID;
      const matchStart = !dateRange.start || s.date >= dateRange.start;
      const matchEnd = !dateRange.end || s.date <= dateRange.end;
      return matchStatus && matchStart && matchEnd;
    });

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-white p-6 border border-slate-200 shadow-sm">
           <div className="flex gap-4">
              <button onClick={() => setSaleFilter(saleFilter === 'all' ? 'unpaid' : 'all')} className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${saleFilter === 'unpaid' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                {saleFilter === 'unpaid' ? 'Active Collection' : 'Filter Collections'}
              </button>
              <input type="date" className="px-4 py-2 bg-slate-50 border border-slate-200 text-[10px] font-black" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
              <input type="date" className="px-4 py-2 bg-slate-50 border border-slate-200 text-[10px] font-black" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
           </div>
           <div className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Transactional Registry</div>
        </div>
        <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Audit Date</th>
                <th className="px-8 py-5">Associate Partner</th>
                <th className="px-8 py-5 text-right">Net Value</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 text-sm text-slate-500 font-bold tracking-tighter">{s.date}</td>
                  <td className="px-8 py-6 font-bold text-slate-900 uppercase tracking-tight">{customers.find(c => c.id === s.customerId)?.name}</td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 tracking-tighter">${s.totalPrice.toFixed(2)}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${s.status === SaleStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{s.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-4">
                    <button onClick={() => setViewingInvoice(s)} className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Preview</button>
                    <button onClick={() => startEditingSale(s)} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 tracking-widest">Modify</button>
                  </td>
                </tr>
              ))}
              {filteredLedger.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-xs font-black uppercase tracking-widest">No matching ledger records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {viewingInvoice && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
             <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-[#0f172a] text-white">
                   <div className="text-lg font-black uppercase tracking-[0.2em]">Formal Ledger Statement</div>
                   <button onClick={() => setViewingInvoice(null)} className="text-slate-400 hover:text-white transition-colors"><i className="fas fa-times text-xl"></i></button>
                </div>
                <div className="p-12 space-y-10">
                   <div className="flex justify-between">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Billing Recipient</div>
                        <div className="text-2xl font-black text-slate-900 uppercase tracking-tight">{customers.find(c => c.id === viewingInvoice.customerId)?.name}</div>
                        <div className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{customers.find(c => c.id === viewingInvoice.customerId)?.address}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Reference</div>
                        <div className="text-lg font-black text-slate-900 tracking-tighter">ZIOS-{viewingInvoice.id.slice(0,8).toUpperCase()}</div>
                        <div className="text-[10px] font-black text-indigo-600 mt-2 uppercase tracking-[0.2em]">{viewingInvoice.date}</div>
                      </div>
                   </div>
                   <table className="w-full border-t border-slate-100">
                      <thead>
                        <tr className="text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                          <th className="py-5">Description Registry</th>
                          <th className="py-5 text-center">Vol</th>
                          <th className="py-5 text-right">Unit Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewingInvoice.productItems.map((item, i) => (
                          <tr key={i} className="text-sm font-bold">
                            <td className="py-5 text-slate-800 uppercase tracking-tighter">{products.find(p => p.id === item.productId)?.name}</td>
                            <td className="py-5 text-center text-slate-500">{item.quantity}</td>
                            <td className="py-5 text-right text-slate-900 tracking-tighter">${(item.priceAtSale * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   <div className="flex justify-end pt-10 border-t border-slate-100">
                      <div className="w-72 space-y-4">
                         <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest"><span>Gross Subtotal</span><span>${(viewingInvoice.totalPrice + viewingInvoice.discount).toFixed(2)}</span></div>
                         <div className="flex justify-between text-[10px] font-black text-red-500 uppercase tracking-widest"><span>Manual Adjustment</span><span>-${viewingInvoice.discount.toFixed(2)}</span></div>
                         <div className="flex justify-between border-t border-slate-100 pt-5 text-3xl font-black text-slate-900 tracking-tighter"><span>NET TOTAL</span><span>${viewingInvoice.totalPrice.toFixed(2)}</span></div>
                      </div>
                   </div>
                </div>
                <div className="bg-slate-50 p-8 text-center text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">
                   Authorized Document // ZIOS STORE ENTERPRISE
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default UserDashboard;
