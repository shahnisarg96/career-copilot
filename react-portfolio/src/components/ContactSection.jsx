import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone } from 'react-icons/fa';
import { BsMicrosoftTeams } from "react-icons/bs";
import { API_BASE, unwrapApiResponse } from '../utils/util.js';

// Animation variants (consistent with AboutSection)
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

const ContactSection = ({ userId, isPublic = false }) => {
    const [contactDetails, setContactDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                const token = localStorage.getItem('token');
                const useAdmin = Boolean(!isPublic && token);
                const headers = useAdmin ? { 'Authorization': `Bearer ${token}` } : {};
                const query = userId ? `?userId=${userId}` : '';
                const url = useAdmin ? `${API_BASE}/admin/contact${query}` : `${API_BASE}/contact${query}`;

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
                    const publicRes = await fetch(`${API_BASE}/contact`, { cache: 'no-cache' });
                    if (publicRes.ok) {
                        const publicJson = await publicRes.json();
                        const publicData = unwrapApiResponse(publicJson);
                        if (Array.isArray(publicData)) data = publicData;
                    }
                }

                setContactDetails(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching contacts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContactData();
    }, [userId, isPublic]);

    if (loading) {
        return (
            <section id="contact" className="py-16 mt-6 rounded-xl bg-gradient-to-r from-primary/30 via-base-200 to-secondary/30 shadow-lg flex flex-col items-center">
                <div className="max-w-3xl mx-auto px-4 w-full text-center">
                    <h3 className="text-4xl font-bold text-primary mb-12">LET'S CONNECT</h3>
                    <div className="flex justify-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="contact" className="py-16 mt-6 rounded-xl bg-gradient-to-r from-primary/30 via-base-200 to-secondary/30 shadow-lg flex flex-col items-center">
                <div className="max-w-3xl mx-auto px-4 w-full text-center">
                    <h3 className="text-4xl font-bold text-primary mb-12">LET'S CONNECT</h3>
                    <div className="alert alert-error">
                        <span>Error loading contacts: {error}</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="contact" className="py-16 mt-6 rounded-xl bg-gradient-to-r from-primary/30 via-base-200 to-secondary/30 shadow-lg flex flex-col items-center">
        <div className="max-w-3xl mx-auto px-4 w-full">
            <motion.h3
                className="text-4xl font-bold text-primary mb-12 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                LET'S CONNECT
            </motion.h3>
            <motion.p
                className="text-base-content/80 text-lg text-center mb-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                Whether you want to discuss a project, share an idea, or just say hi—my inbox and DMs are always open!
            </motion.p>
            <motion.div
                className="grid grid-cols-3 gap-x-12 gap-y-8 justify-items-center"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
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
                            className="flex flex-col items-center group"
                            title={c?.title}
                            variants={item}
                            whileHover={{ y: -8, scale: 1.12, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.10)" }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary text-2xl mb-2 transition group-hover:bg-primary group-hover:text-secondary shadow">
                                {iconMap[c?.icon] || c?.icon}
                            </span>
                            <span className="text-sm text-base-content/80 group-hover:text-primary text-center break-all transition-colors font-medium">
                                {c?.label}
                            </span>
                        </motion.a>
                    );
                })}
            </motion.div>
        </div>
    </section>
    );
};

export default ContactSection;
