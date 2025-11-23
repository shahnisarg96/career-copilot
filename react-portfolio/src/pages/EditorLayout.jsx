import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import IntroEditor from '../sections/IntroEditor.jsx';
import AboutEditor from '../sections/AboutEditor.jsx';
import ExperienceEditor from '../sections/ExperienceEditor.jsx';
import ProjectsEditor from '../sections/ProjectsEditor.jsx';
import SkillsEditor from '../sections/SkillsEditor.jsx';
import CertificatesEditor from '../sections/CertificatesEditor.jsx';
import EducationEditor from '../sections/EducationEditor.jsx';
import ContactEditor from '../sections/ContactEditor.jsx';

export default function EditorLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-2">
        <h2 className="font-bold mb-2">Edit Sections</h2>
        {[
          ['Intro','intro'],['About','about'],['Experience','experience'],['Projects','projects'],
          ['Skills','skills'],['Certificates','certificates'],['Education','education'],['Contact','contact']
        ].map(([label, path]) => (
          <NavLink key={path} to={path} className={({isActive})=>`block px-3 py-2 rounded ${isActive?'bg-base-200':'hover:bg-base-200'}`}>{label}</NavLink>
        ))}
      </aside>
      <main className="p-4">
        <Routes>
          <Route path="intro" element={<IntroEditor/>} />
          <Route path="about" element={<AboutEditor/>} />
          <Route path="experience" element={<ExperienceEditor/>} />
          <Route path="projects" element={<ProjectsEditor/>} />
          <Route path="skills" element={<SkillsEditor/>} />
          <Route path="certificates" element={<CertificatesEditor/>} />
          <Route path="education" element={<EducationEditor/>} />
          <Route path="contact" element={<ContactEditor/>} />
        </Routes>
      </main>
    </div>
  );
}
