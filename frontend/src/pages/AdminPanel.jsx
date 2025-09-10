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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
            Admin Dashboard
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            A comprehensive admin panel for managing users, data, analytics, security, and system logs. 
            Built with modern design and powerful functionality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-elegant transition-shadow">
              <Users className="w-8 h-8 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground">Monitor user activities, login statistics, and manage user roles</p>
            </div>
            
            <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-elegant transition-shadow">
              <Database className="w-8 h-8 text-accent mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Data Management</h3>
              <p className="text-sm text-muted-foreground">Manage products, orders, categories, and all system entities</p>
            </div>
            
            <div className="p-6 rounded-xl bg-card shadow-card hover:shadow-elegant transition-shadow">
              <Shield className="w-8 h-8 text-success mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Security & Analytics</h3>
              <p className="text-sm text-muted-foreground">Security diagnostics, analytics dashboard, and comprehensive logging</p>
            </div>
          </div>

          <Link to="/admin">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6">
              <BarChart3 className="w-5 h-5 mr-2" />
              Access Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;