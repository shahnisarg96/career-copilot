const projects = [
    {
        title: 'Scalable Microservices Architecture',
        description: 'Enterprise-grade microservices template featuring API Gateway, authentication, and Kafka integration for modular, cloud-ready deployments.',
        technology: ['API Gateway', 'Node.js', 'Express', 'Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker', 'Kubernetes'],
        code: 'https://github.com/shahnisarg96/scalable-architecture-template',
        details: [
            'Designed modular services for independent scaling and deployment using Docker and Kubernetes.',
            'Centralized API Gateway for secure routing and JWT authentication.',
            'Integrated Kafka for asynchronous event streaming and distributed logging.'
        ]
    },
    {
        title: 'NXLVL – NextGen Social Network',
        description: 'Scalable social platform for athletes and creators, inspired by LinkedIn and Instagram, with integrated NFT marketplace and real-time engagement.',
        technology: [
            'React', 'Node.js', 'PostgreSQL', 'XMPP', 'Redis', 'Prisma', 'Apollo GraphQL', 'Docker', 'Kubernetes'
        ],
        demo: 'https://nxlvl.app',
        details: [
            'Built microservices with Node.js, Docker, and Kubernetes for scalable, cloud-native deployments.',
            'Developed an integrated NFT marketplace for secure minting, buying, and selling of digital assets.',
            'Implemented real-time chat, notifications, and data access using XMPP, Redis, Apollo GraphQL, PostgreSQL, and Prisma ORM.'
        ]
    },
    {
        title: 'Node.js API Gateway Framework',
        description: 'Customizable API Gateway for Node.js microservices with advanced routing, authentication, and request management.',
        technology: ['Node.js', 'Express', 'API Gateway', 'JWT'],
        code: 'https://github.com/shahnisarg96/api-gateway-template',
        details: [
            'Implemented lightweight, extensible gateway with rate limiting and JWT authentication.',
            'Enabled seamless integration with distributed microservices for scalable architectures.',
            'Enhanced security and request validation for enterprise systems.'
        ]
    },
    {
        title: 'AgileMind – AI-Assisted Planning',
        description: 'AI-powered agile planning platform with automated user story generation, capacity dashboards, and team utilization analytics.',
        technology: ['Node.js', 'Angular', 'Azure DevOps', 'OpenAI API', 'Prisma', 'MySQL'],
        details: [
            'Developed AI-driven user story creation using OpenAI APIs, reducing planning time by 50%.',
            'Implemented capacity planning dashboards with utilization metrics for data-driven sprint planning.',
            'Integrated with Azure DevOps for seamless workflow synchronization and automated reporting.'
        ]
    },
    {
        title: 'KPI – System Monitoring',
        description: 'Real-time dashboard and analytics platform for monitoring critical system metrics and automated enterprise alerting.',
        technology: ['Node.js', 'Spring Boot', 'Angular', 'Kafka', 'ADX', 'Power BI'],
        details: [
            'Developed interactive dashboards with Angular and Power BI for live KPI visualization and analytics.',
            'Integrated with Ki-Holo messaging for automated, real-time alerting on system health and performance.',
            'Leveraged Node.js, Spring Boot, and Kafka for scalable data ingestion and event-driven processing.'
        ]
    },
    {
        title: 'Ki-Holo – Enterprise Messaging & Alerting',
        description: 'Scalable platform for real-time system notifications, alert delivery, and incident response across distributed enterprise environments.',
        technology: ['Node.js', 'Spring Boot', 'Angular', 'Kafka', 'React Native', 'Microservices', 'WebSockets'],
        details: [
            'Engineered high-throughput messaging and alert delivery using Kafka and WebSockets for instant communication.',
            'Developed cross-platform mobile notifications with React Native for on-the-go incident management.',
            'Integrated with KPI Monitoring to provide seamless, automated alerting and enterprise-scale reliability.'
        ]
    },
    {
        title: 'FeatureHub – Enterprise Feature Management',
        description: 'Dynamic UI control platform for a 50M-user superapp, enabling real-time customization, user segmentation, and experimentation.',
        technology: ['Angular', 'Node.js', 'MySQL', 'Spring Boot', 'Microservices', 'Feature Flags'],
        details: [
            'Managed dynamic feature toggling and real-time configuration updates for a 3-in-1 superapp serving 50 million users.',
            'Implemented user segmentation and targeted feature rollout to personalize experiences across web and mobile platforms.',
            'Integrated with microservices architecture for seamless scaling and agile experimentation.'
        ]
    },
    {
        title: 'Zevo Health – Employee Wellbeing Platform',
        description: 'Comprehensive health, fitness, and wellbeing platform built for an Ireland-based company, delivering digital solutions for employee wellness and engagement.',
        technology: ['Laravel', 'Angular', 'MySQL'],
        details: [
            'Developed and maintained two integrated products for physical and mental wellbeing, including activity tracking, nutrition, and mindfulness resources.',
            'Implemented personalized dashboards, wellness challenges, leaderboards, and secure user authentication to boost engagement and healthy habits.',
            'Collaborated with cross-functional teams to deliver scalable, GDPR-compliant solutions for enterprise clients in the health and corporate wellness sector.'
        ],
        demo: 'https://www.zevohealth.com/'
    },
    {
        title: 'SecureInsure – Blockchain Insurance Platform',
        description: 'Enterprise blockchain solution for immutable policy management and secure data workflows in insurance ecosystems.',
        technology: ['Ethereum', 'Solidity', 'Smart Contracts', 'Node.js', 'Angular', 'Spring Boot'],
        details: [
            'Developed smart contract-based policy management and authentication for tamper-proof insurance records.',
            'Ensured immutable data integrity and compliance across 500K+ policies through blockchain validation.',
            'Implemented secure access controls and integrated blockchain with legacy insurance systems for compliance and streamlined verification.'
        ]
    },
    {
        title: 'React Portfolio – Developer Showcase',
        description: 'A modern, interactive portfolio single-page application to showcase professional experience, projects, and skills in a visually engaging way.',
        technology: ['React', 'Vite', 'Tailwind CSS', 'DaisyUI', 'Framer Motion'],
        code: 'https://github.com/shahnisarg96/react-portfolio',
        details: [
            'Built a fully responsive and accessible SPA with animated sections, dark/light theme, and smooth navigation.',
            'Developed modular components for experience, projects, skills, certifications, and education timelines.',
            'Implemented performance optimizations, mobile-first design, and easy customization for rapid deployment.'
        ]
    },
    {
        title: 'DevTinder – Social Platform',
        description: 'Tinder-inspired networking platform for developers to connect, collaborate, and learn together (learning project).',
        technology: ['Node.js', 'React', 'MongoDB', 'Socket.io'],
        code: 'https://github.com/shahnisarg96/devTinder-node',
        details: [
            'Developed core features for real-time matching and chat as a learning project.',
            'Implemented skill-tagged user profiles and basic search functionality.',
            'Created responsive UI for web and mobile, focusing on React and Socket.io integration.'
        ]
    },
    {
        title: 'NetflixGPT – AI Movie Finder',
        description: 'Web application for exploring and searching movies with AI-powered recommendations, inspired by Netflix UI (learning project).',
        technology: ['React', 'Node.js', 'OpenAI API', 'Tailwind CSS'],
        code: 'https://github.com/shahnisarg96/NetflixGPT',
        details: [
            'Built as a learning project to explore React and OpenAI API integration for movie search and recommendations.',
            'Implemented movie listing and basic AI-powered content suggestions.',
            'Focused on UI/UX design and performance optimization using Tailwind CSS.'
        ]
    },
    {
        title: 'BookSwap – Literary Exchange',
        description: 'Community platform for book enthusiasts to exchange and discover new titles (learning project).',
        technology: ['React', 'Node.js', 'MongoDB'],
        code: 'https://github.com/shahnisarg96/book-exchange-backend',
        details: [
            'Developed core features for book listing, search, and exchange requests as a learning exercise.',
            'Implemented basic messaging and user authentication.',
            'Focused on MERN stack fundamentals and responsive design.'
        ]
    },
    {
        title: 'ExpenseWise – Finance Tracker',
        description: 'Cross-platform mobile app for tracking personal expenses and budgets, built with Flutter.',
        technology: ['Flutter', 'Dart', 'Firebase'],
        code: 'https://github.com/shahnisarg96/flutter-expense-tracker',
        details: [
            'Developed with Flutter for native iOS and Android support.',
            'Implemented real-time data sync and secure authentication with Firebase.',
            'Features expense categorization, budget planning, and visual analytics.'
        ]
    },
    {
        title: 'FoodFusion – Restaurant Discovery',
        description: 'End-to-end food delivery platform built with MEAN stack for a Ukrainian client, featuring restaurant listings, order management, and real-time tracking.',
        technology: ['MongoDB', 'Express.js', 'Angular', 'Node.js'],
        details: [
            'Developed dynamic restaurant and menu listings with user reviews using Angular and MongoDB.',
            'Implemented real-time order tracking and notifications for seamless delivery experience.',
            'Ensured secure user authentication and integrated payment processing.'
        ]
    },
    {
        title: 'Kharidi – E-commerce Platform',
        description: 'Full-featured e-commerce platform with product catalog, shopping cart, and secure payments.',
        technology: ['Laravel', 'PHP', 'Stripe', 'MySQL'],
        details: [
            'Developed product catalog with advanced filters and search.',
            'Implemented shopping cart, order management, and Stripe payment integration.',
            'Ensured secure user authentication and responsive UI.'
        ]
    }
];

export default projects;