import React, { useEffect, useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import IntroSection from './components/IntroSection';
import AboutSection from './components/AboutSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import CertificatesSection from './components/CertificatesSection';
import EducationSection from './components/EducationSection';
import Footer from './components/Footer';
import ContactSection from './components/ContactSection';
import { API_BASE } from './utils/util.js';

const App = () => {
  useEffect(() => {
    const fetchIntroForTitle = async () => {
      try {
        const response = await fetch(`${API_BASE}/intro`, { cache: 'no-cache' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const intro = data[0];
            document.title = intro.name ? `${intro.name} - Portfolio` : 'Portfolio';
          }
        }
      } catch (error) {
        console.error('Error fetching intro for title:', error);
      }
    };
    fetchIntroForTitle();
  }, []);

  return (
  <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-base-100 to-base-200">
    <Navigation />

    <main className="flex-1 pt-20 lg:pt-0 lg:ml-64 w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <IntroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <CertificatesSection />
        <EducationSection />
        <ContactSection />
      </div>
      <Footer />
    </main>

  </div>
  );
};

export default App;





