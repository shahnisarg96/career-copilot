import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const AboutSection = ({ userId, isPublic = false }) => {
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const token = localStorage.getItem('token');
                const useAdmin = Boolean(!isPublic && token);
                const headers = useAdmin
                    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                    : { 'Content-Type': 'application/json' };

                const query = userId ? `?userId=${userId}` : '';
                const url = useAdmin ? `${API_BASE}/admin/about${query}` : `${API_BASE}/about${query}`;

                const response = await fetch(url, {
                    cache: 'no-cache',
                    headers
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch about data');
                }
                const result = await response.json();
                const unwrapped = unwrapApiResponse(result);
                let nextAbout = Array.isArray(unwrapped) ? unwrapped[0] : unwrapped;

                // If user has no data yet in preview/admin mode, fall back to seeded public content
                if (useAdmin && !nextAbout && !isPublic) {
                    const publicRes = await fetch(`${API_BASE}/about`, { cache: 'no-cache' });
                    if (publicRes.ok) {
                        const publicJson = await publicRes.json();
                        const publicUnwrapped = unwrapApiResponse(publicJson);
                        nextAbout = Array.isArray(publicUnwrapped) ? publicUnwrapped[0] : publicUnwrapped;
                    }
                }

                setAboutData(nextAbout);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching about data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, [userId, isPublic]);

    if (loading) {
        return (
            <section id="about" className="py-16 scroll-mt-20 bg-gradient-to-b from-base-100 to-base-200">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="about" className="py-16 scroll-mt-20 bg-gradient-to-b from-base-100 to-base-200">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="alert alert-error">
                        <span>Error loading about data: {error}</span>
                    </div>
                </div>
            </section>
        );
    }

    // Parse currentFocus - handle both JSON array and legacy newline-separated format
    let focusItems = [];
    if (aboutData?.currentFocus) {
        try {
            const focusData = typeof aboutData.currentFocus === 'string' 
                ? JSON.parse(aboutData.currentFocus) 
                : aboutData.currentFocus;
            focusItems = Array.isArray(focusData) ? focusData : [];
        } catch {
            // Fallback: treat as newline-separated string
            focusItems = aboutData.currentFocus.split('\n').filter(line => line.trim() && !line.trim().startsWith('Current Focus'));
        }
    }

    return (
        <section id="about" className="py-16 scroll-mt-20 bg-gradient-to-b from-base-100 to-base-200">
            <div className="max-w-5xl mx-auto px-4">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    className="space-y-8"
                >
                    <motion.h3
                        className="text-4xl font-bold text-primary mb-12 text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        ABOUT ME
                    </motion.h3>

                    {aboutData?.tagline && (
                        <motion.blockquote
                            className="border-l-4 border-primary pl-6 py-3 bg-base-200 rounded-r-lg shadow-sm"
                            variants={item}
                        >
                            <p className="text-xl font-medium italic">
                                "{aboutData.tagline}"
                            </p>
                        </motion.blockquote>
                    )}

                    {aboutData?.description && (
                        <motion.div 
                            variants={item} 
                            className="space-y-6 text-lg"
                            dangerouslySetInnerHTML={{ __html: aboutData.description }}
                        />
                    )}

                    {focusItems.length > 0 && (
                        <motion.div variants={item} className="mt-10">
                            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border-l-4 border-secondary">
                                <h4 className="text-xl font-semibold text-secondary mb-3">
                                    Current Focus
                                </h4>
                                <ul className="list-disc pl-6 space-y-2">
                                    {focusItems.map((focus, index) => (
                                        <li key={index}>{focus.trim()}</li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default AboutSection;
