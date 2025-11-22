import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiEye, FiCheck, FiX, FiSearch, FiEdit, FiLayout } from 'react-icons/fi';
import { API_BASE } from '../utils/util.js';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('users');
  const [users, setUsers] = useState([]);
  const [portfolioStatuses, setPortfolioStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Auth users response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Auth users response data:', data);
        // API returns array directly, not { users: [...] }
        const usersList = Array.isArray(data) ? data : (data.users || []);
        console.log('Fetched users:', usersList.length);
        setUsers(usersList);

        // Fetch portfolio status for each user
        const statuses = {};
        for (const user of usersList) {
          try {
            const statusResponse = await fetch(`${API_BASE}/admin/portfolio/status/${user.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              statuses[user.id] = statusData;
            }
          } catch (err) {
            console.error(`Failed to fetch status for user ${user.id}`);
          }
        }
        console.log('Portfolio statuses:', statuses);
        console.log('Published count:', Object.values(statuses).filter(s => s?.isPublished).length);
        console.log('Unpublished count:', Object.values(statuses).filter(s => s && !s.isPublished).length);
        setPortfolioStatuses(statuses);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-info', 'bg-success', 'bg-warning'];
    const hash = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || u.role === filterRole;

    const matchesPublished = filterPublished === 'all' ||
      (filterPublished === 'published' && portfolioStatuses[u.id]?.isPublished === true) ||
      (filterPublished === 'unpublished' && portfolioStatuses[u.id] && portfolioStatuses[u.id].isPublished === false);

    return matchesSearch && matchesRole && matchesPublished;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <button className="btn btn-ghost text-xl" onClick={() => navigate('/')}>
            <FiLayout className="mr-2" /> Admin Dashboard
          </button>
        </div>
        <div className="flex-none gap-2">
          <button
            className="btn btn-ghost gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <FiEdit /> My Portfolio
          </button>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-base-100 text-primary flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-base-content">
              <li className="menu-title">
                <span>{user?.name}</span>
                <span className="text-xs">{user?.email}</span>
                <span className="badge badge-primary badge-sm">ADMIN</span>
              </li>
              <li><button onClick={() => navigate('/portfolio/preview')}>Preview My Portfolio</button></li>
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-4">
          <div className="tabs tabs-boxed bg-transparent py-2">
            <button
              className={`tab gap-2 ${activeView === 'users' ? 'tab-active' : ''}`}
              onClick={() => setActiveView('users')}
            >
              <FiUsers /> Users Management
            </button>
            <button
              className={`tab gap-2 ${activeView === 'dashboard' ? 'tab-active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <FiEdit /> My Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {activeView === 'users' ? (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat bg-base-100 rounded-box shadow">
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">{users.length}</div>
              </div>
              <div className="stat bg-base-100 rounded-box shadow">
                <div className="stat-title">Published</div>
                <div className="stat-value text-success">
                  {Object.values(portfolioStatuses).filter(s => s?.isPublished).length}
                </div>
              </div>
              <div className="stat bg-base-100 rounded-box shadow">
                <div className="stat-title">Unpublished</div>
                <div className="stat-value text-warning">
                  {Object.values(portfolioStatuses).filter(s => !s?.isPublished).length}
                </div>
              </div>
              <div className="stat bg-base-100 rounded-box shadow">
                <div className="stat-title">Admin Users</div>
                <div className="stat-value text-secondary">
                  {users.filter(u => u.role === 'ADMIN').length}
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="form-control flex-1">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="input input-bordered w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <select
                    className="select select-bordered w-full md:w-48"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">Users Only</option>
                    <option value="ADMIN">Admins Only</option>
                  </select>
                  <select
                    className="select select-bordered w-full md:w-48"
                    value={filterPublished}
                    onChange={(e) => setFilterPublished(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Users ({filteredUsers.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Portfolio Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className={`${getAvatarColor(u.name)} text-neutral-content rounded-full w-12 flex items-center justify-center`}>
                                  <span className="text-xl">{u.name?.charAt(0).toUpperCase()}</span>
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{u.name}</div>
                                <div className="text-sm opacity-50">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-ghost'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {portfolioStatuses[u.id]?.isPublished ? (
                              <div className="flex items-center gap-2">
                                <FiCheck className="text-success" />
                                <span className="text-success font-semibold">Published</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <FiX className="text-warning" />
                                <span className="text-warning">Not Published</span>
                              </div>
                            )}
                            {portfolioStatuses[u.id]?.publicSlug && (
                              <a
                                href={portfolioStatuses[u.id].publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary mt-1 truncate max-w-xs hover:underline flex items-center gap-1"
                              >
                                /p/{portfolioStatuses[u.id].publicSlug}
                              </a>
                            )}
                          </td>
                          <td>
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td>
                            {portfolioStatuses[u.id]?.publicUrl && (
                              <a
                                href={portfolioStatuses[u.id].publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-ghost gap-1"
                                onClick={() => console.log('Opening public URL:', portfolioStatuses[u.id].publicUrl)}
                              >
                                <FiEye /> View
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-base-content/60">
                      No users found matching your filters
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Admin's Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat bg-base-100 rounded-box shadow">
                <div className="stat-title">My Portfolio Status</div>
                <div className="stat-value text-sm">
                  {portfolioStatuses[user?.id]?.isPublished ? (
                    <span className="text-success">Published</span>
                  ) : (
                    <span className="text-warning">Not Published</span>
                  )}
                </div>
                {portfolioStatuses[user?.id]?.publicUrl && (
                  <div className="stat-desc text-primary truncate">
                    {portfolioStatuses[user?.id].publicUrl}
                  </div>
                )}
              </div>
              <div className="stat bg-base-100 rounded-box shadow">
                <div className="stat-title">Quick Actions</div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate('/portfolio/preview')}
                  >
                    <FiEye /> Preview
                  </button>
                </div>
              </div>
            </div>

            {/* My Portfolio Management */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">
                  My Portfolio Dashboard
                </h2>
                <p className="text-base-content/70 mb-6">
                  Manage your portfolio content, preview changes, and publish to the world.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-lg">Edit Content</h3>
                      <p className="text-sm mb-4">Update your intro, projects, skills, and more</p>
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => navigate('/dashboard')}
                      >
                        <FiEdit className="mr-2" /> Go to Dashboard
                      </button>
                    </div>
                  </div>
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-lg">Preview & Publish</h3>
                      <p className="text-sm mb-4">See how your portfolio looks before publishing</p>
                      <button
                        className="btn btn-secondary btn-block"
                        onClick={() => navigate('/portfolio/preview')}
                      >
                        <FiEye className="mr-2" /> Preview Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
