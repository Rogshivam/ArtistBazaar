import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
const AdminPanel = () => {
  const [searchSellers, setSearchSellers] = useState('');
  const [searchCustomers, setSearchCustomers] = useState('');

  const [overview, setOverview] = useState({ totalSellers: 0, totalServices: 0, totalProducts: 0, anomaliesDetected: 0 });
  const [sellers, setSellers] = useState([]);
  const [Customers, setCustomers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const API_URL = import.meta.env.VITE_URL;
        const token = localStorage.getItem('auth-token') || '';
        const [ovRes, sellersRes, customersRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/overview`, { headers: { 'auth-token': token } }),
          fetch(`${API_URL}/api/admin/sellers`, { headers: { 'auth-token': token } }),
          fetch(`${API_URL}/api/admin/customers`, { headers: { 'auth-token': token } })
        ]);
        const [ov, s, c] = await Promise.all([ovRes.json(), sellersRes.json(), customersRes.json()]);
        if (ovRes.ok) setOverview(ov);
        if (sellersRes.ok) setSellers(s.sellers || []);
        if (customersRes.ok) setCustomers(c.customers || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const filterTable = (data, searchTerm) =>
    data.filter((item) =>
      Object.values(item).some((val) =>
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    // <div>
    //   <Navbar />
      
      <div className="min-h-screen bg-gray-100 p-6" >
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel: Monitor Sellers & Customers</h1>

      {/* Overview */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Overview</h2>
        <p className="text-gray-600">
          Total Sellers: {overview.totalSellers} | Total Services: {overview.totalServices} | Total Products: {overview.totalProducts}
        </p>
      </div>

      {/* Anomaly Alerts */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Anomaly Alerts</h2>
        <ul className="space-y-2">
          <li className="text-red-600 font-semibold">
            Seller ID 123: Unusual high sales volume (possible bot activity).
          </li>
          <li className="text-red-600 font-semibold">
            Customer ID 456: Multiple failed logins from different IPs.
          </li>
          <li>Customer ID 789: Purchase patterns mismatch (anomaly score: 85%).</li>
        </ul>
      </div>

      {/* Sellers Table */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Sellers Monitoring</h2>
        <input
          type="text"
          placeholder="Search Sellers..."
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchSellers}
          onChange={(e) => setSearchSellers(e.target.value)}
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Products Listed</th>
              <th className="border p-2 text-left">Anomaly Score</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterTable(sellers, searchSellers).map((seller) => (
              <tr key={seller.id}>
                <td className="border p-2">{seller.id}</td>
                <td className="border p-2">{seller.name}</td>
                <td className="border p-2">{seller.productsListed}</td>
                <td className={`border p-2 ${seller.anomalyScore.includes('High') ? 'text-red-600' : ''}`}>
                  {seller.anomalyScore}
                </td>
                <td className="border p-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    {seller.anomalyScore.includes('High') ? 'Investigate' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Customers Monitoring</h2>
        <input
          type="text"
          placeholder="Search Customers..."
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchCustomers}
          onChange={(e) => setSearchCustomers(e.target.value)}
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Purchases</th>
              <th className="border p-2 text-left">Anomaly Score</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterTable(Customers, searchCustomers).map((Customer) => (
              <tr key={Customer.id}>
                <td className="border p-2">{Customer.id}</td>
                <td className="border p-2">{Customer.name}</td>
                <td className="border p-2">{Customer.purchases}</td>
                <td className={`border p-2 ${Customer.anomalyScore.includes('Medium') ? 'text-red-600' : ''}`}>
                  {Customer.anomalyScore}
                </td>
                <td className="border p-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    {Customer.anomalyScore.includes('Medium') ? 'Investigate' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
// </div>    
  );
};

export default AdminPanel;