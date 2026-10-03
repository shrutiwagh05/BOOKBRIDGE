import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalUsers: 5, totalBooks: 12, totalExchanges: 4 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.data) setStats(res.data);
      } catch (err) {
        // Fallback to placeholder stats during foundation
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
            <Badge variant="terracotta">Module 5 • Admin & Platform Governance</Badge>
            <h2 style={{ marginTop: '0.5rem' }}>Campus Library Overseer</h2>
            <p className="text-muted">
              Assigned to <strong>Developer 5</strong>. Platform moderation, user analytics, and system notifications.
            </p>
          </div>
          <Link to="/admin/notifications">
            <Button variant="outline">Notifications Feed</Button>
          </Link>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="paper-card">
          <h4>Total Registered Students</h4>
          <h2 className="text-terracotta">{stats.totalUsers}</h2>
          <p className="text-muted text-small">Verified college accounts</p>
        </div>

        <div className="paper-card">
          <h4>Total Listed Volumes</h4>
          <h2 className="text-deep-brown">{stats.totalBooks}</h2>
          <p className="text-muted text-small">Across all categories</p>
        </div>

        <div className="paper-card">
          <h4>Active Exchanges / Borrows</h4>
          <h2 style={{ color: 'var(--color-success)' }}>{stats.totalExchanges}</h2>
          <p className="text-muted text-small">Completed and in-progress</p>
        </div>
      </div>

      <div className="paper-card">
        <h3>Administrative Controls</h3>
        <p className="text-small text-muted">
          Developer 5 can implement student management tables, inappropriate listing flagging,
          category management, and broadcast alerts in this workspace.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
