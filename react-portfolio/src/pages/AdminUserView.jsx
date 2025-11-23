import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiEye, FiCheck, FiX, FiExternalLink, FiUser } from 'react-icons/fi';
import { API_BASE } from '../utils/util';

const AdminUserView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const [portfolioStatus, setPortfolioStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [portfolio, setPortfolio] = useState({
    intro: [],
    about: [],
    experiences: [],
    projects: [],
    skills: [],
    certificates: [],
    education: [],
    contacts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPortfolio();
  }, [userId]);

  const fetchUserPortfolio = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      // Fetch user info
      const usersResponse = await fetch(`${API_BASE}/auth/users`, { headers });
      const users = await usersResponse.json();
      const user = users.find(u => u.id === userId);
      setUserData(user);

      // Fetch all portfolio sections with userId filter
      const [introRes, aboutRes, expRes, projRes, skillRes, certRes, eduRes, contactRes] = await Promise.all([
        fetch(`${API_BASE}/admin/intro?userId=${userId}`, { headers }),
        fetch(`${API_BASE}/admin/about?userId=${userId}`, { headers }),
        fetch(`${API_BASE}/admin/experience?userId=${userId}`, { headers }),
        fetch(`${API_BASE}/admin/projects?userId=${userId}`, { headers }),
        fetch(`${API_BASE}/admin/skills?userId=${userId}`, { headers }),
        fetch(`${API_BASE}/admin/certificates?userId=${userId}`, { headers }),
        fetch(`${API_BASE}/admin/education?userId=${userId}`, { headers }),
        fetch(`${API_BASE}/admin/contacts?userId=${userId}`, { headers }),
      ]);

      setPortfolio({
        intro: await introRes.json(),
        about: await aboutRes.json(),
        experiences: await expRes.json(),
        projects: await projRes.json(),
        skills: await skillRes.json(),
        certificates: await certRes.json(),
        education: await eduRes.json(),
        contacts: await contactRes.json(),
      });
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <Link to="/admin" className="btn btn-ghost">
            <FiArrowLeft /> Back to Admin
          </Link>
        </div>
        <div className="flex-none">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12">
                <span className="text-xl">{userData?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
            </div>
            <div>
              <div className="font-bold">{userData?.name}</div>
              <div className="text-xs text-base-content/60">{userData?.email}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Intro Items</div>
              <div className="stat-value text-primary">{portfolio.intro.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">About Sections</div>
              <div className="stat-value text-secondary">{portfolio.about.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Projects</div>
              <div className="stat-value text-accent">{portfolio.projects.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Skills</div>
              <div className="stat-value text-info">{portfolio.skills.length}</div>
            </div>
          </div>
        </div>

        {/* Portfolio Sections */}
        <div className="space-y-6">
          {/* Intro */}
          {portfolio.intro.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">Intro</h2>
                <div className="space-y-4">
                  {portfolio.intro.map((item) => (
                    <div key={item.id} className="p-4 bg-base-200 rounded-lg">
                      <h3 className="font-bold text-xl">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.titles?.map((title, idx) => (
                          <span key={idx} className="badge badge-primary">{title}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* About */}
          {portfolio.about.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">About</h2>
                <div className="space-y-4">
                  {portfolio.about.map((item) => (
                    <div key={item.id} className="p-4 bg-base-200 rounded-lg">
                      <h3 className="font-bold text-lg">{item.tagline}</h3>
                      <p className="mt-2">{item.description}</p>
                      {item.currentFocus && (
                        <p className="mt-2 text-primary">
                          <strong>Current Focus:</strong> {item.currentFocus}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {portfolio.intro.length === 0 &&
           portfolio.about.length === 0 &&
           portfolio.experiences.length === 0 &&
           portfolio.projects.length === 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center py-12">
                <FiUser className="text-6xl mx-auto text-base-content/30 mb-4" />
                <h3 className="text-xl font-bold">No Portfolio Data</h3>
                <p className="text-base-content/60">This user hasn't added any portfolio content yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserView;
