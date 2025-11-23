import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { API_BASE } from '../utils/util.js';

const PublicPortfolio = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await fetch(`${API_BASE}/portfolio/slug/${slug}`, { cache: 'no-cache' });
                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.userId);

                    // Update document title
                    const introResponse = await fetch(`${API_BASE}/intro?userId=${data.userId}`, { cache: 'no-cache' });
                    if (introResponse.ok) {
                        const introData = await introResponse.json();
                        if (introData && introData.length > 0) {
                            document.title = introData[0].name ? `${introData[0].name} - Portfolio` : 'Portfolio';
                        }
                    }
                } else if (response.status === 404) {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Error fetching portfolio:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPortfolio();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/60">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-base-content/20 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-base-content mb-2">Portfolio Not Found</h2>
                    <p className="text-base-content/60 mb-6">
                        This portfolio is either not published or doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-base-100 to-base-200">
            <Navigation />

            <main className="flex-1 pt-20 lg:pt-0 lg:ml-64 w-full">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <IntroSection userId={userId} isPublic={true} />
                    <AboutSection userId={userId} isPublic={true} />
                    <ExperienceSection userId={userId} isPublic={true} />
                    <ProjectsSection userId={userId} isPublic={true} />
                    <SkillsSection userId={userId} isPublic={true} />
                    <CertificatesSection userId={userId} isPublic={true} />
                    <EducationSection userId={userId} isPublic={true} />
                    <ContactSection userId={userId} isPublic={true} />
                </div>
                <Footer />
            </main>
        </div>
    );
};

export default PublicPortfolio;
