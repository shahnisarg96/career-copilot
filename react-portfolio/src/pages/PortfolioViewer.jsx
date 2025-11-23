import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import IntroSection from '../components/IntroSection';
import AboutSection from '../components/AboutSection';
import ExperienceSection from '../components/ExperienceSection';
import ProjectsSection from '../components/ProjectsSection';
import SkillsSection from '../components/SkillsSection';
import CertificatesSection from '../components/CertificatesSection';
import EducationSection from '../components/EducationSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { API_BASE } from '../utils/util.js';

const PortfolioViewer = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const [isPublished, setIsPublished] = useState(false);
  const [publicUrl, setPublicUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  useEffect(() => {
    // Check if viewing own portfolio or someone else's
    const vuid = userId || user?.id || null;
    setViewingUserId(vuid);
    setIsPreview(!userId); // Preview mode if no userId in URL
    
    // Update document title dynamically
    const fetchIntroForTitle = async () => {
      try {
        const introUrl = vuid ? `${API_BASE}/admin/intro?userId=${vuid}` : `${API_BASE}/intro`;
        const headers = vuid ? getAuthHeaders() : {};
        const response = await fetch(introUrl, { cache: 'no-cache', headers });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const intro = data[0];
            document.title = intro.name ? `${intro.name} - Portfolio Preview` : 'Portfolio Preview';
          }
        }
      } catch (error) {
        console.error('Error fetching intro for title:', error);
      }
    };
    
    if (vuid) {
      checkPublishStatus(vuid);
      fetchIntroForTitle();
    } else {
      setLoading(false);
      fetchIntroForTitle();
    }
  }, [userId, user]);

  const checkPublishStatus = async (viewingUserId) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/admin/portfolio/status/${viewingUserId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setIsPublished(data.isPublished || false);
        setPublicUrl(data.publicUrl || null);
      }
    } catch (error) {
      console.error('Failed to check publish status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/admin/portfolio/publish`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isPublished: !isPublished }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsPublished(data.isPublished);
        setPublicUrl(data.publicUrl || null);
        alert('Portfolio ' + (data.isPublished ? 'published' : 'unpublished') + ' successfully!');
      } else {
        alert('Failed to update publish status');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const copyPublicUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-100 to-base-200">
      {/* Preview/Edit Bar */}
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-content shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="btn btn-ghost btn-sm gap-2"
                >
                  <FiArrowLeft /> Back to Dashboard
                </button>
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={() => navigate('/admin')} 
                    className="btn btn-ghost btn-sm gap-2"
                  >
                    <FiArrowLeft /> Admin Dashboard
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <span className="text-sm font-medium">
                  {isPublished ? 'Portfolio is Published' : 'Portfolio is Private'}
                </span>
                <button 
                  onClick={handlePublishToggle}
                  className={`btn btn-sm ${isPublished ? 'btn-error' : 'btn-success'} gap-2`}
                >
                  {isPublished ? <><FiEyeOff /> Unpublish</> : <><FiEye /> Publish</>}
                </button>
              </div>
            </div>
            {isPublished && publicUrl && (
              <div className="mt-2 flex items-center gap-2 bg-base-100 text-base-content rounded-lg px-3 py-2">
                <span className="text-sm font-medium">Public URL:</span>
                <a 
                  href={publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex-1 truncate"
                >
                  {publicUrl}
                </a>
                <button 
                  onClick={copyPublicUrl}
                  className="btn btn-xs btn-ghost"
                >
                  {showCopyNotification ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row ${isPreview ? 'pt-16' : ''}`}>
        <Navigation />

        <main className="flex-1 pt-20 lg:pt-0 lg:ml-64 w-full">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <IntroSection userId={viewingUserId} />
            <AboutSection userId={viewingUserId} />
            <ExperienceSection userId={viewingUserId} />
            <ProjectsSection userId={viewingUserId} />
            <SkillsSection userId={viewingUserId} />
            <CertificatesSection userId={viewingUserId} />
            <EducationSection userId={viewingUserId} />
            <ContactSection userId={viewingUserId} />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default PortfolioViewer;
