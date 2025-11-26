import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE, unwrapApiResponse } from '../utils/util.js';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const MAX_VISIBLE_HIGHLIGHTS = 3;

const ExperienceSection = ({ userId, isPublic = false }) => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const token = localStorage.getItem('token');
                const useAdmin = Boolean(!isPublic && token);
                const headers = useAdmin ? { 'Authorization': `Bearer ${token}` } : {};
                const query = userId ? `?userId=${userId}` : '';
                const url = useAdmin ? `${API_BASE}/admin/experience${query}` : `${API_BASE}/experience${query}`;

                const response = await fetch(url, {
                    cache: 'no-cache',
                    headers
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                let data = unwrapApiResponse(result);
                if (!Array.isArray(data)) data = [];

                // If user has no data yet in preview/admin mode, fall back to seeded public content
                if (useAdmin && data.length === 0 && !isPublic) {
                    const publicRes = await fetch(`${API_BASE}/experience`, { cache: 'no-cache' });
                    if (publicRes.ok) {
                        const publicJson = await publicRes.json();
                        const publicData = unwrapApiResponse(publicJson);
                        if (Array.isArray(publicData)) data = publicData;
                    }
                }

                const mappedExperiences = data.map(exp => {
                    // Parse skills - handle both JSON array and comma-separated string
                    let stackArray = [];
                    if (exp.skills) {
                        try {
                            stackArray = JSON.parse(exp.skills);
                        } catch {
                            // Fallback: split comma-separated string
                            stackArray = exp.skills.split(',').map(s => s.trim()).filter(s => s);
                        }
                    }
                    
                    return {
                        company: exp.companyName,
                        logo: exp.companyLogo || './img/experience/default.svg',
                        url: exp.companyWebsite || '#',
                        role: exp.role,
                        period: `${exp.startDate}${exp.endDate ? ' – ' + exp.endDate : ' – Present'} | ${exp.location}`,
                        description: exp.tagline,
                        highlights: exp.description ? parseDescription(exp.description) : [],
                        stack: stackArray
                    };
                });

                setExperiences(mappedExperiences);
                setError(null);
            } catch (err) {
                console.error('Error fetching experiences:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchExperiences();
    }, [userId, isPublic]);

    const parseDescription = (htmlString) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const listItems = tempDiv.querySelectorAll('li');
        return Array.from(listItems).map(li => li.textContent);
    };

    if (loading) {
        return (
            <section id="experience" className="py-16 mt-6 scroll-mt-20 bg-gradient-to-b from-base-100 to-base-200">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h3 className="text-4xl font-bold text-primary mb-12">PROFESSIONAL JOURNEY</h3>
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="experience" className="py-16 mt-6 scroll-mt-20 bg-gradient-to-b from-base-100 to-base-200">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h3 className="text-4xl font-bold text-primary mb-12">PROFESSIONAL JOURNEY</h3>
                    <div className="alert alert-error">
                        <span>Error loading experiences: {error}</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
    <section id="experience" className="py-16 mt-6 scroll-mt-20 bg-gradient-to-b from-base-100 to-base-200">
        <div className="max-w-5xl mx-auto px-4">
            <motion.h3
                className="text-4xl font-bold text-primary mb-12 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                PROFESSIONAL JOURNEY
            </motion.h3>

            <motion.div
                className="relative"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
            >
                {/* Vertical timeline */}
                <div className="absolute left-5 xs:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 to-secondary/20 rounded-full z-0" />

                <div className="space-y-12">
                    {experiences.map((exp, idx) => (
                        <ExperienceCard key={idx} exp={exp} />
                    ))}
                </div>
            </motion.div>
        </div>
    </section>
    );
};

const ExperienceCard = ({ exp }) => {
    const [showAll, setShowAll] = useState(false);

    const visibleHighlights = showAll ? exp.highlights : exp.highlights.slice(0, MAX_VISIBLE_HIGHLIGHTS);

    return (
        <motion.div
            className="relative pl-12 xs:pl-16"
            variants={item}
        >
            {/* Timeline dot */}
            <div className="absolute left-0 top-7 xs:top-5 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary z-10 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-base-100" />
            </div>

            {/* Experience card */}
            <div className="bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 rounded-xl p-4 sm:p-6 shadow-lg border border-base-300 hover:shadow-xl transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                    {/* Company Logo */}
                    <a
                        href={exp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0"
                    >
                        <div className="bg-base-100 p-2 sm:p-3 rounded-lg border border-base-300 shadow-sm group-hover:shadow-md transition w-16 h-16 flex items-center justify-center">
                            <img
                                src={exp.logo}
                                alt={`${exp.company} logo`}
                                className="w-12 h-12 object-contain"
                                loading="lazy"
                                width={56}
                                height={56}
                            />
                        </div>
                    </a>

                    {/* Experience Details */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                                <h4 className="text-lg sm:text-xl font-bold">
                                    <a
                                        href={exp.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {exp.company}
                                    </a>
                                </h4>
                                <div className="text-base-content font-semibold text-sm sm:text-base">{exp.role}</div>
                            </div>
                            <span className="text-xs sm:text-sm text-secondary font-medium bg-base-200 px-3 py-1 rounded-full mt-1 sm:mt-0 whitespace-nowrap">
                                {exp.period}
                            </span>
                        </div>

                        <p className="text-base-content/80 mb-3 italic text-sm sm:text-base">{exp.description}</p>

                        {/* Stack badges */}
                        {exp.stack && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {exp.stack.map((tech, i) => (
                                    <span
                                        key={i}
                                        className="badge badge-outline badge-secondary text-xs font-medium"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Highlights */}
                        <ul className="space-y-2">
                            {visibleHighlights.map((h, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="text-primary mr-2">▹</span>
                                    <span className="text-base-content/90 text-sm sm:text-base">{h}</span>
                                </li>
                            ))}
                        </ul>
                        {exp.highlights.length > MAX_VISIBLE_HIGHLIGHTS && (
                            <button
                                onClick={() => setShowAll((prev) => !prev)}
                                className="mt-2 text-primary underline text-sm font-medium focus:outline-none"
                            >
                                {showAll ? 'Show Less' : `Show ${exp.highlights.length - MAX_VISIBLE_HIGHLIGHTS} More`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ExperienceSection;
