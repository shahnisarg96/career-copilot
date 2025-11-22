import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiEdit2, FiPlus, FiTrash2, FiSave, FiX, FiExternalLink, FiTag, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { predefinedSkills } from '../data/predefinedSkills';
import { predefinedContacts } from '../data/predefinedContacts';
import AIWizard from '../components/AIWizard';
import { API_BASE } from '../utils/util';

const UserDashboard = () => {
  const { user, getAuthHeaders, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('intro');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // State for all portfolio sections
  const [intro, setIntro] = useState([]);
  const [about, setAbout] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [education, setEducation] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // Pre-populate form for single entry sections and close multi-entry forms when switching tabs
    if (isSingleEntrySection()) {
      const data = getCurrentData();
      if (data.length > 0) {
        const item = data[0];
        // Handle tags for intro and about sections - parse if JSON string, leave as-is otherwise
        if (activeTab === 'intro' && item.titles) {
          try {
            const titlesData = typeof item.titles === 'string' ? JSON.parse(item.titles) : item.titles;
            const titlesArray = Array.isArray(titlesData) ? titlesData : [];
            setFormData({ ...item, titles: titlesArray });
            setTags(titlesArray); // Initialize tags state for displaying in the form
          } catch {
            setFormData(item);
            setTags([]);
          }
        } else if (activeTab === 'about' && item.currentFocus) {
          try {
            const focusData = typeof item.currentFocus === 'string' ? JSON.parse(item.currentFocus) : item.currentFocus;
            const focusArray = Array.isArray(focusData) ? focusData : [];
            setFormData({ ...item, currentFocus: focusArray });
            setTags(focusArray); // Initialize tags state for displaying in the form
          } catch {
            setFormData(item);
            setTags([]);
          }
        } else {
          setFormData(item);
          setTags([]);
        }
        setEditingItem(item);
      } else {
        setFormData(getEmptyFormData(activeTab));
        setEditingItem(null);
        setTags([]);
      }
    } else {
      // Close form when switching to multi-entry sections
      setIsFormOpen(false);
    }
  }, [activeTab, intro, about, experiences, projects, skills, certificates, education, contacts]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      const [introRes, aboutRes, expRes, projRes, skillRes, certRes, eduRes, contactRes] = await Promise.all([
        fetch(`${API_BASE}/admin/intro`, { headers }),
        fetch(`${API_BASE}/admin/about`, { headers }),
        fetch(`${API_BASE}/admin/experience`, { headers }),
        fetch(`${API_BASE}/admin/projects`, { headers }),
        fetch(`${API_BASE}/admin/skills`, { headers }),
        fetch(`${API_BASE}/admin/certificates`, { headers }),
        fetch(`${API_BASE}/admin/education`, { headers }),
        fetch(`${API_BASE}/admin/contact`, { headers }),
      ]);

      const introData = await introRes.json();
      const aboutData = await aboutRes.json();
      const expData = await expRes.json();
      const projData = await projRes.json();
      const skillData = await skillRes.json();
      const certData = await certRes.json();
      const eduData = await eduRes.json();
      const contactData = await contactRes.json();

      console.log('Fetched data:', {
        intro: introData,
        about: aboutData,
        experience: expData,
        projects: projData,
        skills: skillData,
        certificates: certData,
        education: eduData,
        contacts: contactData
      });

      setIntro(Array.isArray(introData) ? introData : []);
      setAbout(Array.isArray(aboutData) ? aboutData : []);
      setExperiences(Array.isArray(expData) ? expData : []);
      setProjects(Array.isArray(projData) ? projData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
      setCertificates(Array.isArray(certData) ? certData : []);
      setEducation(Array.isArray(eduData) ? eduData : []);
      setContacts(Array.isArray(contactData) ? contactData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const openForm = (section, item = null) => {
    setEditingItem(item);
    const data = item || getEmptyFormData(section);
    setFormData(data);

    // Initialize tags for sections that use them
    if (section === 'experience' && data.skills) {
      setTags(typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()).filter(s => s) : []);
    } else if (section === 'projects' && data.technology) {
      // Handle technology as comma-separated string
      setTags(typeof data.technology === 'string' ? data.technology.split(',').map(s => s.trim()).filter(s => s) : []);
    } else if (section === 'intro' && data.titles) {
      // Handle titles as JSON array string or fallback to comma-separated
      try {
        const titlesData = typeof data.titles === 'string' ? JSON.parse(data.titles) : data.titles;
        setTags(Array.isArray(titlesData) ? titlesData : []);
      } catch {
        // Fallback: treat as comma-separated string if JSON parse fails
        setTags(typeof data.titles === 'string' ? data.titles.split(',').map(s => s.trim()).filter(s => s) : []);
      }
    } else if (section === 'about' && data.currentFocus) {
      // Handle currentFocus as JSON array string or fallback to comma-separated
      try {
        const focusData = typeof data.currentFocus === 'string' ? JSON.parse(data.currentFocus) : data.currentFocus;
        setTags(Array.isArray(focusData) ? focusData : []);
      } catch {
        // Fallback: treat as comma-separated string if JSON parse fails
        setTags(typeof data.currentFocus === 'string' ? data.currentFocus.split(',').map(s => s.trim()).filter(s => s) : []);
      }
    } else {
      setTags([]);
    }

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData({});
    setTags([]);
    setTagInput('');
    setSelectedContact(null);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getEmptyFormData = (section) => {
    const defaults = {
      intro: { name: '', titles: '', description: '', image: '' },
      about: { tagline: '', description: '', currentFocus: '' },
      experience: { companyName: '', companyLogo: '', companyWebsite: '', role: '', startDate: '', endDate: '', location: '', tagline: '', skills: '', description: '' },
      projects: { title: '', description: '', technology: '', code: '', demo: '', details: '' },
      skills: { title: '', icon: '', color: '', category: '' },
      certificates: { title: '', imgSrc: '' },
      education: { school: '', url: '', location: '', degree: '', grade: '', period: '' },
      contacts: { icon: '', label: '', href: '', title: '' },
    };
    return defaults[section] || {};
  };

  const handleSave = async () => {
    // Validate required tags fields
    if (activeTab === 'projects' && tags.length === 0) {
      showMessage('Technologies field is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      // Handle contacts -> contact route name conversion
      const routeName = activeTab === 'contacts' ? 'contact' : activeTab;
      const endpoint = `${API_BASE}/admin/${routeName}`;
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;

      // Process formData based on section
      let processedData = { ...formData };

      // Handle tags for different sections
      if (activeTab === 'intro') {
        // Titles need to be JSON stringified array for consistency with seed data
        processedData.titles = JSON.stringify(tags);
      } else if (activeTab === 'about') {
        // Current focus as JSON stringified array
        processedData.currentFocus = JSON.stringify(tags);
      } else if (activeTab === 'experience') {
        // Skills as comma-separated string
        processedData.skills = tags.join(', ');
      } else if (activeTab === 'projects') {
        // Technology as comma-separated string
        processedData.technology = tags.join(', '); // Note: schema uses 'technology' not 'technologies'
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        showMessage(editingItem ? 'Updated successfully!' : 'Created successfully!');
        fetchAllData();
        closeForm();
      } else {
        const error = await response.json();
        showMessage(error.message || error.error || 'Failed to save', 'error');
      }
    } catch (error) {
      showMessage('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      // Handle contacts -> contact route name conversion
      const routeName = activeTab === 'contacts' ? 'contact' : activeTab;
      const response = await fetch(`${API_BASE}/admin/${routeName}/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        showMessage('Deleted successfully!');
        fetchAllData();
      } else {
        showMessage('Failed to delete', 'error');
      }
    } catch (error) {
      showMessage('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    const dataMap = {
      intro, about, experience: experiences, projects,
      skills, certificates, education, contacts
    };
    return dataMap[activeTab] || [];
  };

  const isSingleEntrySection = () => {
    return activeTab === 'intro' || activeTab === 'about';
  };

  const renderTagField = (label, fieldName, required = false) => {
    return (
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">{label} {required && <span className="text-error">*</span>}</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <div key={index} className="badge badge-primary gap-2 py-3 px-3">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="btn btn-xs btn-circle btn-ghost"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
        <div className="join w-full">
          <input
            type="text"
            className="input input-bordered join-item flex-1"
            placeholder={`Add ${label.toLowerCase()}...`}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag(e);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary join-item"
            onClick={handleAddTag}
          >
            <FiPlus /> Add
          </button>
        </div>
      </div>
    );
  };

  const renderFormFields = () => {
    const fields = {
      intro: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'titles', label: 'Titles', type: 'tags', tagLabel: 'Titles' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Image URL', type: 'url', placeholder: 'https://...' }
      ],
      about: [
        { name: 'tagline', label: 'Tagline', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'currentFocus', label: 'Current Focus', type: 'tags', tagLabel: 'Focus Areas' }
      ],
      experience: [
        { name: 'companyName', label: 'Company Name', type: 'text', required: true },
        { name: 'companyLogo', label: 'Company Logo URL', type: 'url', placeholder: 'https://...' },
        { name: 'companyWebsite', label: 'Company Website', type: 'url', placeholder: 'https://...' },
        { name: 'role', label: 'Role', type: 'text', required: true },
        { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'Jan 2023', required: true },
        { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'Present' },
        { name: 'location', label: 'Location', type: 'text', required: true },
        { name: 'tagline', label: 'Tagline', type: 'text', required: true },
        { name: 'skills', label: 'Skills', type: 'tags', tagLabel: 'Skills' },
        { name: 'description', label: 'Description', type: 'textarea', required: true }
      ],
      projects: [
        { name: 'title', label: 'Project Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'technology', label: 'Technologies', type: 'tags', tagLabel: 'Technologies', required: true },
        { name: 'details', label: 'Details', type: 'textarea', required: true },
        { name: 'code', label: 'Code URL', type: 'url', placeholder: 'https://github.com/...' },
        { name: 'demo', label: 'Demo URL', type: 'url', placeholder: 'https://...' }
      ],
      skills: [
        { name: 'title', label: 'Skill Name', type: 'skillSelect', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Frontend', 'Backend', 'Mobile', 'Database', 'DevOps', 'Cloud', 'Tools'], required: true }
      ],
      certificates: [
        { name: 'title', label: 'Certificate Title', type: 'text', required: true },
        { name: 'imgSrc', label: 'Certificate Image URL', type: 'url', required: true, placeholder: 'https://...' }
      ],
      education: [
        { name: 'school', label: 'School/University', type: 'text', required: true },
        { name: 'url', label: 'Website URL', type: 'url', required: true, placeholder: 'https://...' },
        { name: 'location', label: 'Location', type: 'text', required: true },
        { name: 'degree', label: 'Degree', type: 'text', required: true },
        { name: 'grade', label: 'Grade/CGPA', type: 'text', placeholder: '3.8 GPA' },
        { name: 'period', label: 'Period', type: 'text', required: true, placeholder: '2020 - 2024' }
      ],
      contacts: [
        { name: 'label', label: 'Contact Type', type: 'contactSelect', required: true },
        { name: 'href', label: 'Contact Value', type: 'text', required: true, placeholder: 'Will be auto-populated based on type' }
      ]
    };

    return (fields[activeTab] || []).map(field => {
      if (field.type === 'tags') {
        return <div key={field.name}>{renderTagField(field.tagLabel || field.label, field.name, field.required)}</div>;
      }

      if (field.type === 'skillSelect') {
        return (
          <div key={field.name} className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{field.label} {field.required && <span className="text-error">*</span>}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData[field.name] || ''}
              onChange={(e) => {
                const selectedSkill = predefinedSkills.find(s => s.title === e.target.value);
                if (selectedSkill) {
                  setFormData({
                    ...formData,
                    title: selectedSkill.title,
                    icon: selectedSkill.icon,
                    color: selectedSkill.color,
                    category: selectedSkill.category
                  });
                } else {
                  setFormData({ ...formData, [field.name]: e.target.value });
                }
              }}
              required={field.required}
            >
              <option value="">Select a skill...</option>
              {predefinedSkills.map(skill => (
                <option key={skill.title} value={skill.title}>
                  {skill.title} ({skill.category})
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt text-info">Icon and color will be set automatically</span>
            </label>
          </div>
        );
      }

      if (field.type === 'contactSelect') {
        return (
          <div key={field.name} className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{field.label} {field.required && <span className="text-error">*</span>}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData[field.name] || ''}
              onChange={(e) => {
                const selected = predefinedContacts.find(c => c.label === e.target.value);
                if (selected) {
                  setSelectedContact(selected);
                  setFormData({
                    ...formData,
                    label: selected.label,
                    icon: selected.icon,
                    title: selected.title,
                    href: formData.href || '' // Keep existing value or empty
                  });
                } else {
                  setFormData({ ...formData, [field.name]: e.target.value });
                }
              }}
              required={field.required}
            >
              <option value="">Select contact type...</option>
              {predefinedContacts.map(contact => (
                <option key={contact.label} value={contact.label}>
                  {contact.label}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt text-info">Icon and tooltip will be set automatically</span>
            </label>
          </div>
        );
      }

      if (field.type === 'select') {
        return (
          <div key={field.name} className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{field.label} {field.required && <span className="text-error">*</span>}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      }

      // Special handling for href field when contact type is selected
      if (field.name === 'href' && activeTab === 'contacts' && selectedContact) {
        return (
          <div key={field.name} className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{field.label} {field.required && <span className="text-error">*</span>}</span>
            </label>
            <div className="join w-full">
              {selectedContact.hrefPrefix && (
                <span className="join-item btn btn-disabled bg-base-200 no-animation">{selectedContact.hrefPrefix}</span>
              )}
              <input
                type="text"
                className={`input input-bordered ${selectedContact.hrefPrefix ? 'join-item' : ''} flex-1`}
                value={formData[field.name]?.replace(selectedContact.hrefPrefix, '') || ''}
                onChange={(e) => {
                  const value = selectedContact.hrefPrefix + e.target.value;
                  setFormData({ ...formData, [field.name]: value });
                }}
                placeholder={selectedContact.placeholder}
                required={field.required}
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-info">Full link: {formData[field.name] || selectedContact.hrefPrefix + selectedContact.placeholder}</span>
            </label>
          </div>
        );
      }

      return (
        <div key={field.name} className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">{field.label} {field.required && <span className="text-error">*</span>}</span>
          </label>
          {field.type === 'textarea' ? (
            <textarea
              className="textarea textarea-bordered h-32 w-full"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              placeholder={field.placeholder}
              required={field.required}
            />
          ) : field.type === 'color' ? (
            <div className="flex gap-2">
              <input
                type="color"
                className="h-12 w-16 rounded cursor-pointer"
                value={formData[field.name] || '#000000'}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              />
              <input
                type="text"
                className="input input-bordered flex-1"
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                placeholder={field.placeholder}
              />
            </div>
          ) : (
            <input
              type={field.type === 'url' ? 'url' : field.type}
              className="input input-bordered w-full"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
        </div>
      );
    });
  };

  const renderDataCard = (item) => {
    const renderContent = () => {
      switch (activeTab) {
        case 'intro':
          return (
            <>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm opacity-70">{Array.isArray(item.titles) ? item.titles.join(', ') : item.titles}</p>
            </>
          );
        case 'about':
          return (
            <>
              <h3 className="font-bold text-lg">{item.tagline}</h3>
              <p className="text-sm">{item.description}</p>
              {item.currentFocus && <p className="text-xs opacity-70 mt-2">Focus: {item.currentFocus}</p>}
            </>
          );
        case 'experience':
          return (
            <>
              <h3 className="font-bold text-lg">{item.role}</h3>
              <p className="text-sm opacity-70">{item.companyName} • {item.location}</p>
              <p className="text-xs opacity-50">{item.startDate} - {item.endDate}</p>
              {item.tagline && <p className="text-sm mt-2">{item.tagline}</p>}
            </>
          );
        case 'projects':
          return (
            <>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
              {item.technology && <p className="text-xs opacity-70 mt-2">{item.technology}</p>}
              <div className="flex gap-2 mt-2">
                {item.code && <a href={item.code} target="_blank" className="link link-primary text-xs">Code</a>}
                {item.demo && <a href={item.demo} target="_blank" className="link link-primary text-xs">Demo</a>}
              </div>
            </>
          );
        case 'skills':
          return (
            <>
              <div className="flex items-center gap-2">
                {item.color && <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>}
                <h3 className="font-bold text-lg">{item.title}</h3>
              </div>
              {item.category && <p className="text-sm opacity-70">{item.category}</p>}
              {item.icon && <p className="text-xs opacity-50">{item.icon}</p>}
            </>
          );
        case 'certificates':
          return (
            <>
              <h3 className="font-bold text-lg">{item.title}</h3>
              {item.imgSrc && (
                <img src={item.imgSrc} alt={item.title} className="w-full h-32 object-cover rounded mt-2" onError={(e) => e.target.style.display = 'none'} />
              )}
            </>
          );
        case 'education':
          return (
            <>
              <h3 className="font-bold text-lg">{item.degree}</h3>
              <p className="text-sm opacity-70">{item.school}</p>
              <p className="text-xs opacity-50">{item.location} • {item.period}</p>
              {item.grade && <p className="text-xs opacity-70 mt-1">Grade: {item.grade}</p>}
              {item.url && <a href={item.url} target="_blank" className="link link-primary text-xs">Website</a>}
            </>
          );
        case 'contacts':
          return (
            <>
              <h3 className="font-bold text-lg">{item.label}</h3>
              <p className="text-sm opacity-70">{item.title}</p>
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="link link-primary text-xs mt-2 block">{item.href}</a>
              {item.icon && <p className="text-xs opacity-50 mt-1">Icon: {item.icon}</p>}
            </>
          );
        default:
          return null;
      }
    };

    return (
      <div key={item.id} className="card bg-base-200 shadow">
        <div className="card-body">
          {renderContent()}
          <div className="card-actions justify-end mt-4">
            <button className="btn btn-sm btn-ghost" onClick={() => openForm(activeTab, item)}>
              <FiEdit2 /> Edit
            </button>
            {!isSingleEntrySection() && (
              <button className="btn btn-sm btn-error btn-ghost" onClick={() => handleDelete(item.id)}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'intro', label: 'Intro', count: intro.length },
    { id: 'about', label: 'About', count: about.length },
    { id: 'experience', label: 'Experience', count: experiences.length },
    { id: 'projects', label: 'Projects', count: projects.length },
    { id: 'skills', label: 'Skills', count: skills.length },
    { id: 'certificates', label: 'Certificates', count: certificates.length },
    { id: 'education', label: 'Education', count: education.length },
    { id: 'contacts', label: 'Contact', count: contacts.length },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">
            <FiUser /> My Portfolio
          </a>
        </div>
        <div className="flex-none gap-2">
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-ghost btn-sm gap-2 mr-2">
              ← Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => setShowAIWizard(true)}
            className="btn btn-secondary btn-sm gap-2 animate-pulse mr-2"
          >
            <FiZap /> AI Wizard
          </button>
          <Link to="/portfolio/preview" className="btn btn-primary btn-sm gap-2 mr-2">
            <FiExternalLink /> Preview
          </Link>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-lg font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>{user?.name}</span>
                <span className="text-xs">{user?.email}</span>
                {user?.role === 'ADMIN' && <span className="badge badge-primary badge-sm">ADMIN</span>}
              </li>
              {user?.role === 'ADMIN' && (
                <li><Link to="/admin">Admin Dashboard</Link></li>
              )}
              <li><a onClick={logout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="toast toast-top toast-center z-50"
          >
            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Card for Empty Portfolio */}
      {intro.length === 0 && about.length === 0 && experiences.length === 0 && projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl mb-6 border-2 border-primary/20"
        >
          <div className="card-body text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="card-title text-3xl justify-center mb-2">Welcome to Your Career Co-pilot!</h2>
            <p className="text-lg mb-6">
              Get started in seconds with our AI-powered wizard, or build manually section by section.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="text-4xl mb-2">🤖</div>
                  <h3 className="card-title text-lg">AI Wizard</h3>
                  <p className="text-sm text-base-content/70">
                    Answer a few questions and let AI generate your complete portfolio in minutes
                  </p>
                  <button
                    onClick={() => setShowAIWizard(true)}
                    className="btn btn-primary btn-block mt-4 gap-2"
                  >
                    <FiZap /> Start AI Wizard
                  </button>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="text-4xl mb-2">✍️</div>
                  <h3 className="card-title text-lg">Manual Entry</h3>
                  <p className="text-sm text-base-content/70">
                    Take full control and add each section yourself with our easy forms
                  </p>
                  <button
                    onClick={() => {
                      setShowManualEntry(true);
                      setActiveTab('intro');
                    }}
                    className="btn btn-outline btn-block mt-4 gap-2"
                  >
                    <FiEdit2 /> Start Building
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Only show tabs and content if user has started building or has existing data */}
      {(showManualEntry || intro.length > 0 || about.length > 0 || experiences.length > 0 || projects.length > 0) && (
        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-100 p-2 shadow-lg mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="badge badge-sm">{tab.count}</span>
              </a>
            ))}
          </div>

          {/* Content Area */}
          <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {isSingleEntrySection() ? (
              // Intro and About sections - Inline form
              <div>
                <h2 className="card-title mb-6">{tabs.find(t => t.id === activeTab)?.label}</h2>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {renderFormFields()}
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <span className="loading loading-spinner"></span> : <FiSave />}
                        {getCurrentData().length > 0 ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              // Other sections - Multiple entries with modal
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">{tabs.find(t => t.id === activeTab)?.label}</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => openForm(activeTab)}>
                    <FiPlus /> Add New
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : getCurrentData().length === 0 ? (
                  <div className="text-center py-12 text-base-content/70">
                    <p className="mb-4">No items yet. Click "Add New" to create your first entry.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getCurrentData().map(item => renderDataCard(item))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Form Modal - Only for non-single entry sections */}
      {isFormOpen && !isSingleEntrySection() && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-6">
              {editingItem ? 'Edit' : 'Add New'} {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {renderFormFields()}
              </div>
              <div className="modal-action pt-4">
                <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={loading}>
                  <FiX /> Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : <FiSave />}
                  Save
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeForm}></div>
        </div>
      )}

      {/* AI Wizard Modal */}
      {showAIWizard && (
        <AIWizard
          onClose={() => setShowAIWizard(false)}
          onComplete={() => {
            setShowAIWizard(false);
            setShowManualEntry(true); // Show manual entry sections after AI generation
            fetchAllData(); // Refresh all data after AI generation
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
