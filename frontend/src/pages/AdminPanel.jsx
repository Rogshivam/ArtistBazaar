import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
const AdminPanel = () => {
  const [searchSellers, setSearchSellers] = useState('');
  const [searchBuyers, setSearchBuyers] = useState('');

  // Sample data (replace with API calls in a real app)
  const sellers = [
    { id: 123, name: 'John Doe', productsListed: 45, anomalyScore: 'High (90%)' },
    { id: 124, name: 'Jane Smith', productsListed: 30, anomalyScore: 'Low (10%)' },
  ];
  const buyers = [
    { id: 456, name: 'Alice Johnson', purchases: 20, anomalyScore: 'Medium (60%)' },
    { id: 457, name: 'Bob Brown', purchases: 15, anomalyScore: 'Low (5%)' },
  ];

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel: Monitor Sellers & Buyers</h1>

      {/* Overview */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Overview</h2>
        <p className="text-gray-600">
          Total Sellers: 150 | Total Buyers: 500 | Anomalies Detected: 12
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
            Buyer ID 456: Multiple failed logins from different IPs.
          </li>
          <li>Buyer ID 789: Purchase patterns mismatch (anomaly score: 85%).</li>
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

      {/* Buyers Table */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Buyers Monitoring</h2>
        <input
          type="text"
          placeholder="Search Buyers..."
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchBuyers}
          onChange={(e) => setSearchBuyers(e.target.value)}
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
            {filterTable(buyers, searchBuyers).map((buyer) => (
              <tr key={buyer.id}>
                <td className="border p-2">{buyer.id}</td>
                <td className="border p-2">{buyer.name}</td>
                <td className="border p-2">{buyer.purchases}</td>
                <td className={`border p-2 ${buyer.anomalyScore.includes('Medium') ? 'text-red-600' : ''}`}>
                  {buyer.anomalyScore}
                </td>
                <td className="border p-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    {buyer.anomalyScore.includes('Medium') ? 'Investigate' : 'View'}
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