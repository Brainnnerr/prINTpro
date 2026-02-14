
import React, { useState } from 'react';
import { MinusCircle, AlertTriangle, Package, Archive, Plus, CheckSquare, Square, X, Settings, ArrowDownCircle, Layers } from 'lucide-react';
import { InventoryItem } from '../types';
import { Modal } from './Modal';

interface AdminInventoryProps {
  inventory: InventoryItem[];
  onDeductStock: (itemId: string) => void;
  onAddItem: (item: InventoryItem) => void;
  onBulkUpdate: (items: InventoryItem[]) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({ inventory, onDeductStock, onAddItem, onBulkUpdate }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Bulk Action Modals State
  const [bulkAction, setBulkAction] = useState<'threshold' | 'deduct' | null>(null);
  const [bulkValue, setBulkValue] = useState<number>(0);

  // New Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    unit: 'sheets',
    quantity: 0,
    threshold: 10
  });

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.sku) return;

    const inventoryItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name,
      sku: newItem.sku,
      unit: newItem.unit,
      quantity: Number(newItem.quantity),
      threshold: Number(newItem.threshold)
    };

    onAddItem(inventoryItem);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewItem({
      name: '',
      sku: '',
      unit: 'sheets',
      quantity: 0,
      threshold: 10
    });
  };

  // Selection Handlers
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === inventory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inventory.map(item => item.id)));
    }
  };

  // Bulk Action Handlers
  const openBulkAction = (action: 'threshold' | 'deduct') => {
    setBulkAction(action);
    setBulkValue(action === 'deduct' ? 1 : 10); // Default values
  };

  const executeBulkAction = () => {
    const itemsToUpdate = inventory.filter(item => selectedIds.has(item.id));
    
    const updatedItems = itemsToUpdate.map(item => {
        if (bulkAction === 'threshold') {
            return { ...item, threshold: bulkValue };
        } else if (bulkAction === 'deduct') {
            return { ...item, quantity: Math.max(0, item.quantity - bulkValue) };
        }
        return item;
    });

    onBulkUpdate(updatedItems);
    setBulkAction(null);
    setSelectedIds(new Set()); // Clear selection after action
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
           <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium">
            <tr>
              <th className="px-4 py-4 w-12 text-center">
                <button onClick={toggleSelectAll} className="flex items-center justify-center">
                  {selectedIds.size === inventory.length && inventory.length > 0 ? (
                    <CheckSquare size={20} className="text-teal-600" />
                  ) : (
                    <Square size={20} className="text-slate-300 hover:text-slate-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Stock Level</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((item) => {
              const isLow = item.quantity <= item.threshold;
              const isSelected = selectedIds.has(item.id);
              return (
                <tr 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected ? 'bg-teal-50/50' : 
                    isLow ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-4 text-center" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}>
                    <button className="flex items-center justify-center">
                        {isSelected ? (
                            <CheckSquare size={20} className="text-teal-600" />
                        ) : (
                            <Square size={20} className="text-slate-300 group-hover:text-slate-400" />
                        )}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                    <div className={`p-2 rounded transition-colors ${
                        isLow ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                    }`}>
                      <Package size={16} />
                    </div>
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.sku}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isLow ? 'text-red-700 font-bold' : ''}`}>
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4">
                    {isLow ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded w-fit border border-red-200">
                        <AlertTriangle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Logic handled by parent via prop, ensures update and persistence
                        onDeductStock(item.id);
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200"
                      title="Deduct 1 unit"
                    >
                      <MinusCircle size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 pl-6 pr-3 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-6 border border-slate-700">
           <div className="flex items-center gap-2 font-bold text-sm">
             <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {selectedIds.size}
             </span>
             <span>Selected</span>
           </div>
           
           <div className="h-6 w-px bg-slate-700"></div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => openBulkAction('threshold')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
              >
                 <Settings size={14} /> Set Threshold
              </button>
              <button 
                onClick={() => openBulkAction('deduct')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
              >
                 <ArrowDownCircle size={14} /> Deduct Stock
              </button>
           </div>

           <div className="h-6 w-px bg-slate-700"></div>

           <button 
             onClick={() => setSelectedIds(new Set())}
             className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
           >
             <X size={18} />
           </button>
        </div>
      )}

      {/* Bulk Action Modal */}
      <Modal 
        isOpen={!!bulkAction}
        onClose={() => setBulkAction(null)}
        title={bulkAction === 'threshold' ? 'Bulk Update Threshold' : 'Bulk Deduct Stock'}
      >
         <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${bulkAction === 'threshold' ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${bulkAction === 'threshold' ? 'bg-white text-slate-600' : 'bg-white text-red-600'}`}>
                        {bulkAction === 'threshold' ? <Layers size={24} /> : <MinusCircle size={24} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">
                            {bulkAction === 'threshold' ? 'Update Reorder Level' : 'Deduct Inventory'}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                            You are about to apply this change to <span className="font-bold text-slate-900">{selectedIds.size} items</span>.
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    {bulkAction === 'threshold' ? 'New Threshold Value' : 'Quantity to Deduct'}
                </label>
                <input 
                    type="number" 
                    min="1"
                    className="w-full p-4 border border-slate-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-teal-500"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(Math.max(0, parseInt(e.target.value) || 0))}
                />
                <p className="text-xs text-slate-400 mt-2">
                    {bulkAction === 'threshold' 
                        ? "Items with stock below this value will be flagged as Low Stock." 
                        : "This amount will be subtracted from the current stock level of all selected items."}
                </p>
            </div>

            <button 
                onClick={executeBulkAction}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
                Confirm Update
            </button>
         </div>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `Item Details: ${selectedItem.name}` : 'Inventory Item'}
      >
        {selectedItem && (
          <div className="space-y-6">
             {/* Visual Header */}
             <div className={`flex items-center justify-center p-8 rounded-xl border ${
                 selectedItem.quantity <= selectedItem.threshold ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
             }`}>
                <div className="relative">
                  <Package size={64} className={selectedItem.quantity <= selectedItem.threshold ? 'text-red-200' : 'text-teal-200'} />
                  <div className={`absolute -bottom-2 -right-2 text-white p-1 rounded-full ${
                      selectedItem.quantity <= selectedItem.threshold ? 'bg-red-500' : 'bg-teal-600'
                  }`}>
                    <Archive size={16} />
                  </div>
                </div>
             </div>

             {/* Details Grid */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                     <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">SKU Code</p>
                     <p className="font-mono text-slate-800 font-semibold">{selectedItem.sku}</p>
                 </div>
                 <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                     <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Status</p>
                     {selectedItem.quantity <= selectedItem.threshold ? (
                         <span className="text-red-600 font-bold text-sm flex items-center gap-1">
                           <AlertTriangle size={14}/> Low Stock
                         </span>
                     ) : (
                         <span className="text-green-600 font-bold text-sm">In Stock</span>
                     )}
                 </div>
                 <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                     <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Current Quantity</p>
                     <p className="text-2xl font-bold text-slate-800">
                       {selectedItem.quantity} 
                       <span className="text-sm font-normal text-slate-500 ml-1">{selectedItem.unit}</span>
                     </p>
                 </div>
                  <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                     <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Reorder Threshold</p>
                     <p className="text-2xl font-bold text-slate-800">
                       {selectedItem.threshold} 
                       <span className="text-sm font-normal text-slate-500 ml-1">{selectedItem.unit}</span>
                     </p>
                 </div>
             </div>
             
             {/* Inventory Tip */}
             <div className={`p-4 rounded-lg text-sm border ${
               selectedItem.quantity <= selectedItem.threshold 
                 ? 'bg-red-50 text-red-800 border-red-100' 
                 : 'bg-blue-50 text-blue-800 border-blue-100'
             }`}>
                <p className="font-bold mb-1 flex items-center gap-2">
                  {selectedItem.quantity <= selectedItem.threshold ? <AlertTriangle size={16}/> : <Package size={16}/>}
                  Inventory Insight
                </p>
                <p className="opacity-90">
                    {selectedItem.quantity <= selectedItem.threshold 
                     ? `This item has fallen below the reorder threshold of ${selectedItem.threshold} ${selectedItem.unit}. It is recommended to restock immediately.`
                     : "Stock levels are healthy. No immediate reordering is required at this time."}
                </p>
             </div>

             <button 
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
             >
                Close Details
             </button>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Inventory Item"
      >
        <form onSubmit={handleAddItemSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Item Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              placeholder="e.g., A3 Glossy Photo Paper"
              value={newItem.name}
              onChange={e => setNewItem({...newItem, name: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">SKU / Stock Code <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              placeholder="e.g., P-GL-A3"
              value={newItem.sku}
              onChange={e => setNewItem({...newItem, sku: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm placeholder:text-slate-300 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unit Type</label>
              <select 
                value={newItem.unit}
                onChange={e => setNewItem({...newItem, unit: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
              >
                <option value="sheets">Sheets</option>
                <option value="units">Units</option>
                <option value="bottles">Bottles</option>
                <option value="cartridges">Cartridges</option>
                <option value="rolls">Rolls</option>
                <option value="packs">Packs</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Quantity</label>
              <input 
                type="number" 
                min="0"
                value={newItem.quantity}
                onChange={e => setNewItem({...newItem, quantity: Math.max(0, parseInt(e.target.value) || 0)})}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Low Stock Threshold</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min="0"
                value={newItem.threshold}
                onChange={e => setNewItem({...newItem, threshold: Math.max(0, parseInt(e.target.value) || 0)})}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
              <span className="text-xs text-slate-400 max-w-[150px]">
                Alert will trigger when stock drops below this level.
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
