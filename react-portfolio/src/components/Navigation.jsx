// src/components/MobileNavigation.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle'; // Assuming you have a ThemeToggle component
import {
    FaUser,
    FaChartLine,
    FaLaptopCode,
    FaChartBar,
    FaMedal,
    FaGraduationCap,
    FaEnvelope,
    FaFilePdf
} from 'react-icons/fa';

const Navigation = () => {
    const navItems = [
        { id: 'about', title: 'About', icon: <FaUser className="text-primary" /> },
        { id: 'experience', title: 'Experience', icon: <FaChartLine className="text-secondary" /> },
        { id: 'projects', title: 'Projects', icon: <FaLaptopCode className="text-accent" /> },
        { id: 'skills', title: 'Skills', icon: <FaChartBar className="text-info" /> },
        { id: 'certifications', title: 'Certifications', icon: <FaMedal className="text-success" /> },
        { id: 'education', title: 'Education', icon: <FaGraduationCap className="text-warning" /> },
        { id: 'contact', title: 'Contact', icon: <FaEnvelope className="text-error" /> }
    ];


    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-base-200 z-40 shadow">
                <div className="p-6 border-b border-base-300 flex w-full justify-between items-center">
                    <a href="#intro" className="text-xl font-bold text-primary">Nisarg Shah</a>
                    <ThemeToggle />
                </div>
                <ul className="menu p-2">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a
                                href={item.href || `#${item.id}`}
                                target={item.target || '_self'}
                                className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-base-300"
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-base-content">{item.title}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[55] bg-base-100 shadow-md">
                <div className="flex items-center justify-between p-4">
                    <a href="#intro" className="text-lg font-bold text-primary">
                        Nisarg Shah
                    </a>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={toggleMenu}
                            className="btn btn-ghost btn-sm"
                            aria-label="Toggle navigation"
                        >
                            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleMenu}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed top-16 left-0 right-0 bg-base-200 z-50 lg:hidden"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <nav className="p-4">
                            <ul className="space-y-2">
                                {navItems.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={item.href || `#${item.id}`}
                                            target={item.target || '_self'}
                                            className="block p-3 rounded-lg hover:bg-base-300 transition-colors"
                                            onClick={toggleMenu}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{item.icon}</span>
                                                <span>{item.title}</span>
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;