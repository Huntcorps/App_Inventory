import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterGrouping, setFilterGrouping] = useState('');
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem('inventoryData');
    if (savedData) {
      setInventoryData(JSON.parse(savedData));
    } else {
      const initialData = [
        {
          materialCode: "9.04.009449",
          materialName: "EZC250H3200 MCCB 3P 200A36kA Schneider",
          specification: "EZC250H3200 MCCB 3P 200A36kA Schneider",
          warehouseName: "Pulp Tray (Consumable Material)",
          lotNo: "",
          stockUnit: "unit",
          inventoryQty: 1,
          inventoryStatus: "Available",
          inventoryOrg: "PT GAOYI PACKAGING INDONESIA",
          typeOfOwner: "Business Org",
          ownerName: "PT GAOYI PACKAGING INDONESIA",
          customerPN: "",
          brand: "",
          gram: "",
          materialGrouping: "Electrical appliances",
          customerEndPN: "",
          masterDataProperty: "",
          history: [],
          image: null
        },
        {
          materialCode: "9.07.011003",
          materialName: "Airtac Solenoid Valve 4V21008A AC220V",
          specification: "Airtac Solenoid Valve 4V21008A AC220V",
          warehouseName: "Pulp Tray (Consumable Material)",
          lotNo: "",
          stockUnit: "Pcs",
          inventoryQty: 3,
          inventoryStatus: "Available",
          inventoryOrg: "PT GAOYI PACKAGING INDONESIA",
          typeOfOwner: "Business Org",
          ownerName: "PT GAOYI PACKAGING INDONESIA",
          customerPN: "",
          brand: "",
          gram: "",
          materialGrouping: "Accessories",
          customerEndPN: "",
          masterDataProperty: "",
          history: [],
          image: null
        },
        {
          materialCode: "1465.Z.0021",
          materialName: "INNER CARTON FILLER MATERIAL",
          specification: "320±3mm(L)*180±2mm(W)*32±2mm(H); 86g±10%",
          warehouseName: "Pulp Tray (Finished Product)",
          lotNo: "",
          stockUnit: "Pcs",
          inventoryQty: 3000,
          inventoryStatus: "Available",
          inventoryOrg: "PT GAOYI PACKAGING INDONESIA",
          typeOfOwner: "Business Org",
          ownerName: "PT GAOYI PACKAGING INDONESIA",
          customerPN: "SLPRT-100292700",
          brand: "",
          gram: "",
          materialGrouping: "Pulp",
          customerEndPN: "H23-361 A04 R04",
          masterDataProperty: "",
          history: [],
          image: null
        }
      ].map(item => ({ ...item, initialQty: item.inventoryQty }));
      setInventoryData(initialData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
  }, [inventoryData]);

  const warehouseOptions = [...new Set(inventoryData.map(item => item.warehouseName))];
  const groupingOptions = [...new Set(inventoryData.map(item => item.materialGrouping))];

  const totalItems = inventoryData.length;
  const totalStock = inventoryData.reduce((sum, item) => sum + item.inventoryQty, 0);
  const lowStockCount = inventoryData.filter(item => item.inventoryQty < item.initialQty * 0.1).length;

  const filteredData = inventoryData.filter(item => {
    const matchesSearch =
      item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materialCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = filterWarehouse === '' || item.warehouseName === filterWarehouse;
    const matchesGrouping = filterGrouping === '' || item.materialGrouping === filterGrouping;
    return matchesSearch && matchesWarehouse && matchesGrouping;
  });

  const handleStockIn = (index) => {
    const qty = parseInt(prompt(`Masukkan jumlah stok masuk:`, 0));
    if (!qty || qty <= 0) return alert("Masukkan jumlah valid!");
    const updatedData = [...inventoryData];
    updatedData[index].inventoryQty += qty;
    updatedData[index].history.push({ type: 'IN', qty, date: new Date().toLocaleString() });
    setInventoryData(updatedData);
  };

  const handleStockOut = (index) => {
    const qty = parseInt(prompt(`Masukkan jumlah stok keluar:`, 0));
    if (!qty || qty <= 0) return alert("Masukkan jumlah valid!");
    if (qty > inventoryData[index].inventoryQty) return alert("Stok tidak cukup!");
    const updatedData = [...inventoryData];
    updatedData[index].inventoryQty -= qty;
    updatedData[index].history.push({ type: 'OUT', qty, date: new Date().toLocaleString() });
    setInventoryData(updatedData);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      inventoryData.map(item => ({
        'Material Code': item.materialCode,
        'Material Name': item.materialName,
        'Specification': item.specification,
        'Warehouse': item.warehouseName,
        'Lot No.': item.lotNo,
        'Stock Unit': item.stockUnit,
        'Inventory Qty': item.inventoryQty,
        'Initial Qty': item.initialQty,
        'Safety Stock (10%)': Math.ceil(item.initialQty * 0.1),
        'Inventory Status': item.inventoryStatus,
        'Inventory Org.': item.inventoryOrg,
        'Type of Owner': item.typeOfOwner,
        'Owner Name': item.ownerName,
        'Customer P/N': item.customerPN,
        'Brand': item.brand,
        'Gram': item.gram,
        'Material Grouping': item.materialGrouping,
        'Customer End PN': item.customerEndPN,
        'Master Data Property': item.masterDataProperty
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaris');
    XLSX.writeFile(wb, 'inventaris_export.xlsx');
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedData = [...inventoryData];
      updatedData[index].image = event.target.result;
      setInventoryData(updatedData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="font-sans text-gray-800 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Aplikasi Inventaris</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <p className="text-lg font-semibold">Jumlah Item</p>
          <p className="text-2xl font-bold text-blue-800">{totalItems}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <p className="text-lg font-semibold">Total Stok</p>
          <p className="text-2xl font-bold text-green-800">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow text-center">
          <p className="text-lg font-semibold">Stok &lt; 10%</p>
          <p className="text-2xl font-bold text-red-800">{lowStockCount}</p>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Cari kode atau nama..."
          className="p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded"
          value={filterWarehouse}
          onChange={(e) => setFilterWarehouse(e.target.value)}
        >
          <option value="">Semua Gudang</option>
          {warehouseOptions.map((wh, idx) => <option key={idx}>{wh}</option>)}
        </select>
        <select
          className="p-2 border border-gray-300 rounded"
          value={filterGrouping}
          onChange={(e) => setFilterGrouping(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {groupingOptions.map((grp, idx) => <option key={idx}>{grp}</option>)}
        </select>
      </div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export ke Excel
        </button>
      </div>
    </div>
  );
}
