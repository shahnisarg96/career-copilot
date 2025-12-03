import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone } from 'react-icons/fa';
import { BsMicrosoftTeams } from "react-icons/bs";

const contactDetails = [
    {
        icon: <FaLinkedin />,
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/shahnisarg96',
        title: 'LinkedIn',
    },
    {
        icon: <FaGithub />,
        label: 'GitHub',
        href: 'https://github.com/shahnisarg96',
        title: 'GitHub',
    },
    {
        icon: <FaEnvelope />,
        label: 'shahnisarg96@gmail.com',
        href: 'mailto:shahnisarg96@gmail.com',
        title: 'Email',
    },
    {
        icon: <FaPhone />,
        label: '+91-8401998755',
        href: 'tel:+918401998755',
        title: 'Call',
    },
    {
        icon: <FaTwitter />,
        label: 'Twitter',
        href: 'https://twitter.com/shahnisarg96',
        title: 'Twitter',
    },
    {
        icon: <BsMicrosoftTeams />,
        label: 'Teams',
        href: 'https://teams.microsoft.com/l/chat/0/0?users=shahnisarg96@outlook.com',
        title: 'Teams',
    },
];

export default contactDetails;