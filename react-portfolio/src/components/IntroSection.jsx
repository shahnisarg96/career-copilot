import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import { FaReact, FaNodeJs, FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone } from 'react-icons/fa';
import { BsMicrosoftTeams } from "react-icons/bs";
import { API_BASE, unwrapApiResponse } from '../utils/util.js';

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.15
        }
    }
};
const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const iconMap = {
    FaLinkedin: <FaLinkedin />,
    FaGithub: <FaGithub />,
    FaEnvelope: <FaEnvelope />,
    FaPhone: <FaPhone />,
    FaTwitter: <FaTwitter />,
    BsMicrosoftTeams: <BsMicrosoftTeams />
};

const IntroSection = ({ userId, isPublic = false }) => {
    const [introData, setIntroData] = useState(null);
    const [contactDetails, setContactDetails] = useState([]);
    const [titles, setTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const useAdmin = Boolean(!isPublic && token);
                const headers = useAdmin ? { 'Authorization': `Bearer ${token}` } : {};
                const query = userId ? `?userId=${userId}` : '';
                const introUrl = useAdmin ? `${API_BASE}/admin/intro${query}` : `${API_BASE}/intro${query}`;
                const contactUrl = useAdmin ? `${API_BASE}/admin/contact${query}` : `${API_BASE}/contact${query}`;

                const [introResponse, contactResponse] = await Promise.all([
                    fetch(introUrl, { cache: 'no-cache', headers }),
                    fetch(contactUrl, { cache: 'no-cache', headers })
                ]);

                if (!introResponse.ok || !contactResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const introResult = await introResponse.json();
                const contactResult = await contactResponse.json();

                let introList = unwrapApiResponse(introResult);
                let contacts = unwrapApiResponse(contactResult);

                if (!Array.isArray(introList)) introList = [];
                if (!Array.isArray(contacts)) contacts = [];

                // If user has no data yet in preview/admin mode, fall back to seeded public content
                if (useAdmin && introList.length === 0 && !isPublic) {
                    const [publicIntroRes, publicContactRes] = await Promise.all([
                        fetch(`${API_BASE}/intro`, { cache: 'no-cache' }),
                        fetch(`${API_BASE}/contact`, { cache: 'no-cache' })
                    ]);
                    if (publicIntroRes.ok) {
                        const publicIntroJson = await publicIntroRes.json();
                        const publicIntroList = unwrapApiResponse(publicIntroJson);
                        if (Array.isArray(publicIntroList)) introList = publicIntroList;
                    }
                    if (publicContactRes.ok) {
                        const publicContactJson = await publicContactRes.json();
                        const publicContacts = unwrapApiResponse(publicContactJson);
                        if (Array.isArray(publicContacts)) contacts = publicContacts;
                    }
                }

                const intro = introList[0];

                setIntroData(intro);
                setContactDetails(contacts);
                
                // Parse titles - handle both string and array
                if (intro) {
                    try {
                        const titlesData = typeof intro.titles === 'string' 
                            ? JSON.parse(intro.titles) 
                            : intro.titles;
                        setTitles(Array.isArray(titlesData) ? titlesData : []);
                    } catch (e) {
                        console.error('Error parsing titles:', e, 'Raw titles:', intro.titles);
                        setTitles(['a Software Engineer']); // Fallback
                    }
                } else {
                    setTitles(['a Software Engineer']); // Fallback when no intro data
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching intro data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, isPublic]);

    if (loading) {
        return (
            <section id="intro" className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </section>
        );
    }

    if (error || !introData) {
        return (
            <section id="intro" className="min-h-screen flex items-center justify-center">
                <div className="alert alert-error max-w-md">
                    <span>Error loading intro: {error || 'No data found'}</span>
                </div>
            </section>
        );
    }

    return (
    <section
        id="intro"
        className="min-h-screen flex items-center justify-center relative overflow-hidden scroll-mt-16"
    >
        {/* Animated Gradient Background */}
        <motion.div
            className="absolute inset-0 bg-gradient-to-br from-base-100 to-base-200 z-0"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
        />

        {/* Decorative Pulsing Circles */}
        <motion.div
            className="absolute -top-10 left-1/4 w-64 h-64 rounded-full bg-primary/30 blur-3xl z-0"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute -bottom-10 right-1/4 w-64 h-64 rounded-full bg-secondary/30 blur-3xl z-0"
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />

        {/* Main Content */}
        <motion.div
            className="container mx-auto px-4 relative z-10"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-16">
                {/* Text content */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                    {/* Name as subheading */}
                    <motion.h1
                        className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-base-content"
                        variants={item}
                    >
                        {introData.name}
                    </motion.h1>
                    {/* Typewriter Title */}
                    <motion.h2
                        className="text-2xl xs:text-2xl sm:text-2xl md:text-4xl lg:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                        variants={item}
                    >I'm&nbsp;
                        <Typewriter
                            words={titles}
                            loop={0}
                            cursor
                            cursorStyle="_"
                            typeSpeed={70}
                            deleteSpeed={40}
                            delaySpeed={1300}
                        />
                    </motion.h2>
                    <motion.p className="text-base xs:text-lg mb-8 text-base-content/80 max-w-xl" variants={item}>
                        {introData.description}
                    </motion.p>

                    {/* Social & Contact Links */}
                    <motion.div
                        className="flex flex-wrap gap-4 justify-center md:justify-start mt-4"
                        variants={item}
                    >
                        {contactDetails.map((c, i) => {
                            const href = typeof c?.href === 'string' ? c.href : '';
                            if (!href) return null;
                            const isExternal = href.startsWith('http');

                            return (
                                <motion.a
                                    key={i}
                                    href={href}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                    className="btn btn-ghost btn-circle text-xl transition-transform"
                                    title={c?.title}
                                    whileHover={{ scale: 1.2, rotate: -8 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {iconMap[c?.icon] || c?.icon}
                                </motion.a>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Profile image and decoration */}
                <motion.div
                    className="relative mb-8 md:mb-0 w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0"
                    variants={item}
                >
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-base-content/10 shadow-xl">
                        <img
                            src={introData.image}
                            alt={introData.name}
                            className="w-full h-full object-cover scale-110 sm:scale-125 md:scale-150 transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                    <motion.div
                        className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-primary/20 animate-pulse"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-secondary/20 animate-pulse"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    />
                    <div className="absolute -left-6 top-1/4 bg-base-100 rounded-full p-2 shadow-lg border border-base-content/10">
                        <div className="rounded-xl w-16 h-16">
                            <FaReact className="w-full h-full text-[#61DAFB]" />
                        </div>
                    </div>
                    <div className="absolute -right-6 bottom-1/4 bg-base-100 rounded-full p-2 shadow-lg border border-base-content/10">
                        <div className="rounded-xl w-16 h-16">
                            <FaNodeJs className="w-full h-full text-[#5FA04E]" />
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Animated Scroll Indicator */}
            <motion.div
                className="mt-10 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    y: [0, 10, 0],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                }}
            >
                <span className="text-sm mb-2">Scroll to explore</span>
                <div className="w-8 h-12 rounded-full border-2 border-base-content flex justify-center p-1">
                    <motion.div
                        className="w-2 h-2 bg-base-content rounded-full"
                        animate={{ y: [0, 8, 0] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    </section>
    );
};

export default IntroSection;
