// src/components/Footer.jsx
import React from 'react';

const Footer = () => (
    <footer className="bg-base-200 py-8 mt-16">
        <div className="w-full mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="text-base-content/70 text-sm">
                &copy; {new Date().getFullYear()} Nisarg Shah &middot; All rights reserved.
            </div>
        </div>
    </footer>
);

export default Footer;