import bcrypt from 'bcryptjs';

async function getPrismaClientCtor() {
    try {
        // Prefer the client generated into this workspace (works inside db-sync image)
        const generated = await import('../node_modules/.prisma/client/index.js');
        return generated.PrismaClient;
    } catch {
        // Fallback for local/dev environments where Prisma client is generated at root
        const pkg = await import('@prisma/client');
        return pkg.PrismaClient;
    }
}

const PrismaClient = await getPrismaClientCtor();
const prisma = new PrismaClient();

function getExperienceYears() {
    // Start of professional experience: Jul 2018
    const start = new Date(Date.UTC(2018, 6, 1));
    const now = new Date();

    let years = now.getUTCFullYear() - start.getUTCFullYear();
    const hasHadAnniversaryThisYear =
        now.getUTCMonth() > start.getUTCMonth() ||
        (now.getUTCMonth() === start.getUTCMonth() && now.getUTCDate() >= start.getUTCDate());
    if (!hasHadAnniversaryThisYear) years -= 1;
    return Math.max(0, years);
}

async function hashPassword(password) {
    const rounds = Number(process.env.BCRYPT_ROUNDS || process.env.BCRYPT_SALT_ROUNDS || 12);
    return bcrypt.hash(password, rounds);
}

async function seedUsers() {
    const defaults = [
        { email: 'admin@example.com', password: 'Admin123!', name: 'Admin', role: 'ADMIN' },
        { email: 'user@example.com', password: 'User123!', name: 'User', role: 'USER' },
    ];

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    if (adminEmail && adminPassword) {
        defaults.unshift({ email: adminEmail, password: adminPassword, name: 'Admin', role: 'ADMIN' });
    }

    for (const u of defaults) {
        const email = u.email.trim().toLowerCase();
        const passwordHash = await hashPassword(u.password);

        await prisma.user.upsert({
            where: { email },
            create: {
                email,
                name: u.name,
                role: u.role,
                passwordHash,
            },
            update: {},
        });
    }
}

async function seedIntro() {
    await prisma.intro.deleteMany({ where: { userId: null } });
    await prisma.intro.create({
        data: {
            userId: null,
            name: 'Nisarg Shah',
            description:
                'I create digital solutions that solve real problems with clean, efficient code and intuitive interfaces.',
            image: './img/nisarg.jpg',
            titles: JSON.stringify([
                'a Software Engineer',
                'a Full Stack Developer',
                'a MEAN Stack Developer',
                'a MERN Stack Developer',
                'a Cloud Native Engineer',
                'a Tech Lead',
                'an Aspiring Solution Architect',
                'an AI Explorer',
            ]),
        },
    });
}

async function seedAbout() {
    await prisma.about.deleteMany({ where: { userId: null } });
    await prisma.about.create({
        data: {
            userId: null,
            tagline: 'Keep it simple. Keep it scalable.',
            description: `
                <p className="text-base-content/90">
                    I’m a <span className="font-bold text-primary">tech-agnostic Full-Stack Engineer</span> with <span className="font-bold">${getExperienceYears()}+ years</span> of experience architecting and building robust, scalable systems—across frontend, backend, databases, and the cloud.
                </p>
                <p className="text-base-content/90">
                    My toolkit is ever-evolving and includes <span className="font-semibold text-secondary">Node.js, React, Angular, Java, SpringBoot, NestJS, Fastify, React Native, Flutter</span> and more on the app side, as well as <span className="font-semibold text-secondary">MySQL, PostgreSQL, MongoDB, CosmosDB, Neo4j</span> and various NoSQL/graph databases. I'm truly cloud-native, deploying to <span className="font-semibold text-secondary">Azure, AWS, GCP, DigitalOcean</span> using <span className="font-semibold text-secondary">Docker, Kubernetes, and CI/CD</span> best practices.
                </p>
                <p className="text-base-content/90">
                    I thrive on integrating APIs, experimenting with <span className="font-semibold text-secondary">AI/LLMs</span> (Azure OpenAI, DeepSeek, Ollama), and exploring <span className="font-semibold text-secondary">Web3 and blockchain</span> possibilities. I'm also hands-on with messaging, streaming, and caching systems like <span className="font-semibold text-secondary">Kafka, RabbitMQ, and Redis.</span>
                </p>
                <p className="text-base-content/90">
                    Whether it's building SPAs, designing APIs, or optimizing cloud deployments, I'm passionate about learning, collaborating, and delivering real value. My approach: <span className="italic font-bold text-primary">"Code what matters, deploy what scales, and always keep learning."</span>
                </p>
                `,
            currentFocus: JSON.stringify([
                'Cloud-native architectures and microservices',
                'AI-driven automation and intelligent systems',
                'Enterprise-scale, resilient system design',
                'Tech leadership and leading cross-functional teams',
            ]),
        },
    });
}

async function seedExperience() {
    await prisma.experience.deleteMany({ where: { userId: null } });

    const experiences = [
        {
            companyName: 'Bajaj Finance Limited',
            companyLogo: './img/experience/bajaj.jpg',
            companyWebsite: 'https://www.bajajfinserv.in/',
            role: 'Lead Full-Stack Engineer',
            startDate: 'Oct 2023',
            endDate: 'Present',
            location: 'Pune, India',
            tagline:
                'Driving the design, development, and deployment of scalable, cloud-native financial platforms and digital solutions in a high-impact environment.',
            skills: JSON.stringify([
                'Node.js',
                'React',
                'Angular',
                'Azure',
                'API Gateway',
                'Kafka',
                'NestJS',
                'AWS',
                'Kubernetes',
                'CI/CD',
                'Microservices',
                'OpenAI',
                'Blockchain',
                'React Native',
                'Flutter',
            ]),
            description: [
                '<ul>',
                '<li>Led cross-functional teams to develop and maintain a microservices ecosystem with 500+ services, integrating API Gateway and Kafka for resource-efficient, scalable solutions.</li>',
                '<li>Managed Azure Kubernetes Service (AKS) clusters, implementing node scaling, pod scheduling, ingress, and load balancer configurations; streamlined CI/CD pipelines in Azure DevOps with automated testing, static code analysis, and deployment automation.</li>',
                '<li>Designed and implemented scalable KPI and alerting systems using Azure Data Explorer (ADX) and Power BI, delivering 25,000+ daily alerts to 10,000+ employees and reducing incident response time by 30% through chat application integration.</li>',
                '<li>Developed high-performance web portals using MEAN and MERN stacks, focusing on user experience and reliability for large-scale deployments.</li>',
                '<li>Integrated OpenAI APIs and DeepSeek models to automate story creation in Azure Boards and summarize system alerts, enhancing agile planning, requirements management, and incident analysis.</li>',
                '<li>Contributed to the development of Angular Progressive Web Apps (PWA) for a high-traffic application serving approximately 50 million users.</li>',
                '<li>Collaborated on blockchain integration with third-party Spydra, supporting secure insurance and banking data management, with a primary focus on frontend development and exposure to backend technologies.</li>',
                '</ul>',
            ].join(''),
        },
        {
            companyName: 'Cygnet.One',
            companyLogo: './img/experience/cygnet.jpg',
            companyWebsite: 'https://www.cygnet.one/',
            role: 'Full-Stack Software Developer',
            startDate: 'Jul 2018',
            endDate: 'Sep 2023',
            location: 'Ahmedabad, India',
            tagline:
                'Delivered robust, scalable web and cloud solutions for diverse international clients, leveraging modern technologies and best practices.',
            skills: JSON.stringify([
                'Node.js',
                'GraphQL',
                'Apollo',
                'Prisma',
                'RabbitMQ',
                'Express.js',
                'Fastify',
                'Angular',
                'ELK Stack',
                'Azure Insights',
                'Redis',
                'LEMP Stack',
            ]),
            description: [
                '<ul>',
                '<li>Led the end-to-end development of web and mobile applications for clients in social media, health and fitness, employee engagement, and on-demand delivery sectors.</li>',
                '<li>Designed and implemented microservices architectures using Node.js, Java (Spring Boot), and PHP (Laravel), with expertise in GraphQL, REST APIs, and RabbitMQ for event-driven communication.</li>',
                '<li>Developed responsive front-end applications with Angular and React, optimizing user experience and accessibility.</li>',
                '<li>Architected and maintained relational and NoSQL databases, including MySQL, PostgreSQL, MongoDB, and Neo4j, ensuring data integrity, high availability, and performance.</li>',
                '<li>Managed cloud infrastructure on Azure, AWS, and DigitalOcean, utilizing containerization, managed services, and automation for efficient deployments.</li>',
                '<li>Established CI/CD pipelines with Azure DevOps and GitHub Actions, incorporating automated testing, static code analysis, and deployment automation.</li>',
                '<li>Implemented advanced logging and monitoring solutions using ELK stack, Azure Insights, and Redis, improving system observability and reducing incident response times.</li>',
                '</ul>',
            ].join(''),
        },
    ];

    await prisma.experience.createMany({
        data: experiences.map((e) => ({ ...e, userId: null })),
    });
}

async function seedProjects() {
    await prisma.project.deleteMany({ where: { userId: null } });

    const projects = [
        {
            title: 'Scalable Microservices Architecture',
            description:
                'Enterprise-grade microservices template featuring API Gateway, authentication, and Kafka integration for modular, cloud-ready deployments.',
            technology: JSON.stringify([
                'API Gateway',
                'Node.js',
                'Express',
                'Java',
                'Spring Boot',
                'Kafka',
                'PostgreSQL',
                'Docker',
                'Kubernetes',
            ]),
            code: 'https://github.com/shahnisarg96/scalable-architecture-template',
            demo: null,
            details: JSON.stringify([
                'Designed modular services for independent scaling and deployment using Docker and Kubernetes.',
                'Centralized API Gateway for secure routing and JWT authentication.',
                'Integrated Kafka for asynchronous event streaming and distributed logging.',
            ]),
        },
        {
            title: 'NXLVL – NextGen Social Network',
            description:
                'Scalable social platform for athletes and creators, inspired by LinkedIn and Instagram, with integrated NFT marketplace and real-time engagement.',
            technology: JSON.stringify([
                'React',
                'Node.js',
                'PostgreSQL',
                'XMPP',
                'Redis',
                'Prisma',
                'Apollo GraphQL',
                'Docker',
                'Kubernetes',
            ]),
            code: null,
            demo: 'https://nxlvl.app',
            details: JSON.stringify([
                'Built microservices with Node.js, Docker, and Kubernetes for scalable, cloud-native deployments.',
                'Developed an integrated NFT marketplace for secure minting, buying, and selling of digital assets.',
                'Implemented real-time chat, notifications, and data access using XMPP, Redis, Apollo GraphQL, PostgreSQL, and Prisma ORM.',
            ]),
        },
        {
            title: 'Node.js API Gateway Framework',
            description:
                'Customizable API Gateway for Node.js microservices with advanced routing, authentication, and request management.',
            technology: JSON.stringify(['Node.js', 'Express', 'API Gateway', 'JWT']),
            code: 'https://github.com/shahnisarg96/api-gateway-template',
            demo: null,
            details: JSON.stringify([
                'Implemented lightweight, extensible gateway with rate limiting and JWT authentication.',
                'Enabled seamless integration with distributed microservices for scalable architectures.',
                'Enhanced security and request validation for enterprise systems.',
            ]),
        },
        {
            title: 'AgileMind – AI-Assisted Planning',
            description:
                'AI-powered agile planning platform with automated user story generation, capacity dashboards, and team utilization analytics.',
            technology: JSON.stringify(['Node.js', 'Angular', 'Azure DevOps', 'OpenAI API', 'Prisma', 'MySQL']),
            code: null,
            demo: null,
            details: JSON.stringify([
                'Developed AI-driven user story creation using OpenAI APIs, reducing planning time by 50%.',
                'Implemented capacity planning dashboards with utilization metrics for data-driven sprint planning.',
                'Integrated with Azure DevOps for seamless workflow synchronization and automated reporting.',
            ]),
        },
        {
            title: 'KPI – System Monitoring',
            description:
                'Real-time dashboard and analytics platform for monitoring critical system metrics and automated enterprise alerting.',
            technology: JSON.stringify(['Node.js', 'Spring Boot', 'Angular', 'Kafka', 'ADX', 'Power BI']),
            code: null,
            demo: null,
            details: JSON.stringify([
                'Developed interactive dashboards with Angular and Power BI for live KPI visualization and analytics.',
                'Integrated with Ki-Holo messaging for automated, real-time alerting on system health and performance.',
                'Leveraged Node.js, Spring Boot, and Kafka for scalable data ingestion and event-driven processing.',
            ]),
        },
        {
            title: 'Ki-Holo – Enterprise Messaging & Alerting',
            description:
                'Scalable platform for real-time system notifications, alert delivery, and incident response across distributed enterprise environments.',
            technology: JSON.stringify([
                'Node.js',
                'Spring Boot',
                'Angular',
                'Kafka',
                'React Native',
                'Microservices',
                'WebSockets',
            ]),
            code: null,
            demo: null,
            details: JSON.stringify([
                'Engineered high-throughput messaging and alert delivery using Kafka and WebSockets for instant communication.',
                'Developed cross-platform mobile notifications with React Native for on-the-go incident management.',
                'Integrated with KPI Monitoring to provide seamless, automated alerting and enterprise-scale reliability.',
            ]),
        },
        {
            title: 'FeatureHub – Enterprise Feature Management',
            description:
                'Dynamic UI control platform for a 50M-user superapp, enabling real-time customization, user segmentation, and experimentation.',
            technology: JSON.stringify(['Angular', 'Node.js', 'MySQL', 'Spring Boot', 'Microservices', 'Feature Flags']),
            code: null,
            demo: null,
            details: JSON.stringify([
                'Managed dynamic feature toggling and real-time configuration updates for a 3-in-1 superapp serving 50 million users.',
                'Implemented user segmentation and targeted feature rollout to personalize experiences across web and mobile platforms.',
                'Integrated with microservices architecture for seamless scaling and agile experimentation.',
            ]),
        },
        {
            title: 'Zevo Health – Employee Wellbeing Platform',
            description:
                'Comprehensive health, fitness, and wellbeing platform built for an Ireland-based company, delivering digital solutions for employee wellness and engagement.',
            technology: JSON.stringify(['Laravel', 'Angular', 'MySQL']),
            code: null,
            demo: 'https://www.zevohealth.com/',
            details: JSON.stringify([
                'Developed and maintained two integrated products for physical and mental wellbeing, including activity tracking, nutrition, and mindfulness resources.',
                'Implemented personalized dashboards, wellness challenges, leaderboards, and secure user authentication to boost engagement and healthy habits.',
                'Collaborated with cross-functional teams to deliver scalable, GDPR-compliant solutions for enterprise clients in the health and corporate wellness sector.',
            ]),
        },
        {
            title: 'SecureInsure – Blockchain Insurance Platform',
            description:
                'Enterprise blockchain solution for immutable policy management and secure data workflows in insurance ecosystems.',
            technology: JSON.stringify(['Ethereum', 'Solidity', 'Smart Contracts', 'Node.js', 'Angular', 'Spring Boot']),
            code: null,
            demo: null,
            details: JSON.stringify([
                'Developed smart contract-based policy management and authentication for tamper-proof insurance records.',
                'Ensured immutable data integrity and compliance across 500K+ policies through blockchain validation.',
                'Implemented secure access controls and integrated blockchain with legacy insurance systems for compliance and streamlined verification.',
            ]),
        },
        {
            title: 'React Portfolio – Developer Showcase',
            description:
                'A modern, interactive portfolio single-page application to showcase professional experience, projects, and skills in a visually engaging way.',
            technology: JSON.stringify(['React', 'Vite', 'Tailwind CSS', 'DaisyUI', 'Framer Motion']),
            code: 'https://github.com/shahnisarg96/react-portfolio',
            demo: null,
            details: JSON.stringify([
                'Built a fully responsive and accessible SPA with animated sections, dark/light theme, and smooth navigation.',
                'Developed modular components for experience, projects, skills, certifications, and education timelines.',
                'Implemented performance optimizations, mobile-first design, and easy customization for rapid deployment.',
            ]),
        },
        {
            title: 'DevTinder – Social Platform',
            description:
                'Tinder-inspired networking platform for developers to connect, collaborate, and learn together (learning project).',
            technology: JSON.stringify(['Node.js', 'React', 'MongoDB', 'Socket.io']),
            code: 'https://github.com/shahnisarg96/devTinder-node',
            demo: null,
            details: JSON.stringify([
                'Developed core features for real-time matching and chat as a learning project.',
                'Implemented skill-tagged user profiles and basic search functionality.',
                'Created responsive UI for web and mobile, focusing on React and Socket.io integration.',
            ]),
        },
        {
            title: 'NetflixGPT – AI Movie Finder',
            description:
                'Web application for exploring and searching movies with AI-powered recommendations, inspired by Netflix UI (learning project).',
            technology: JSON.stringify(['React', 'Node.js', 'OpenAI API', 'Tailwind CSS']),
            code: 'https://github.com/shahnisarg96/NetflixGPT',
            demo: null,
            details: JSON.stringify([
                'Built as a learning project to explore React and OpenAI API integration for movie search and recommendations.',
                'Implemented movie listing and basic AI-powered content suggestions.',
                'Focused on UI/UX design and performance optimization using Tailwind CSS.',
            ]),
        },
        {
            title: 'BookSwap – Literary Exchange',
            description:
                'Community platform for book enthusiasts to exchange and discover new titles (learning project).',
            technology: JSON.stringify(['React', 'Node.js', 'MongoDB']),
            code: 'https://github.com/shahnisarg96/book-exchange-backend',
            demo: null,
            details: JSON.stringify([
                'Developed core features for book listing, search, and exchange requests as a learning exercise.',
                'Implemented basic messaging and user authentication.',
                'Focused on MERN stack fundamentals and responsive design.',
            ]),
        },
        {
            title: 'ExpenseWise – Finance Tracker',
            description: 'Cross-platform mobile app for tracking personal expenses and budgets, built with Flutter.',
            technology: JSON.stringify(['Flutter', 'Dart', 'Firebase']),
            code: 'https://github.com/shahnisarg96/flutter-expense-tracker',
            demo: null,
            details: JSON.stringify([
                'Developed with Flutter for native iOS and Android support.',
                'Implemented real-time data sync and secure authentication with Firebase.',
                'Features expense categorization, budget planning, and visual analytics.',
            ]),
        },
        {
            title: 'FoodFusion – Restaurant Discovery',
            description:
                'End-to-end food delivery platform built with MEAN stack for a Ukrainian client, featuring restaurant listings, order management, and real-time tracking.',
            technology: JSON.stringify(['MongoDB', 'Express.js', 'Angular', 'Node.js']),
            code: null,
            demo: null,
            details: JSON.stringify([
                'Developed dynamic restaurant and menu listings with user reviews using Angular and MongoDB.',
                'Implemented real-time order tracking and notifications for seamless delivery experience.',
                'Ensured secure user authentication and integrated payment processing.',
            ]),
        },
        {
            title: 'Kharidi – E-commerce Platform',
            description: 'Full-featured e-commerce platform with product catalog, shopping cart, and secure payments.',
            technology: JSON.stringify(['Laravel', 'PHP', 'Stripe', 'MySQL']),
            code: null,
            demo: null,
            details: JSON.stringify([
                'Developed product catalog with advanced filters and search.',
                'Implemented shopping cart, order management, and Stripe payment integration.',
                'Ensured secure user authentication and responsive UI.',
            ]),
        },
    ];

    await prisma.project.createMany({
        data: projects.map((p) => ({ ...p, userId: null })),
    });
}

async function seedSkills() {
    await prisma.skill.deleteMany({ where: { userId: null } });

    const skills = [
        { title: 'JavaScript', icon: 'IoLogoJavascript', color: '#F7DF1E', category: 'Top Skills' },
        { title: 'Node.js', icon: 'SiNodedotjs', color: '#339933', category: 'Top Skills' },
        { title: 'React', icon: 'FaReact', color: '#61DAFB', category: 'Top Skills' },
        { title: 'Angular', icon: 'FaAngular', color: '#DD0031', category: 'Top Skills' },
        { title: 'MySQL', icon: 'SiMysql', color: '#4479A1', category: 'Top Skills' },
        { title: 'MongoDB', icon: 'SiMongodb', color: '#47A248', category: 'Top Skills' },
        { title: 'Azure', icon: 'VscAzureDevops', color: '#0089D6', category: 'Top Skills' },
        { title: 'AWS', icon: 'FaAws', color: '#FF9900', category: 'Top Skills' },
        { title: 'GraphQL', icon: 'SiGraphql', color: '#E10098', category: 'Top Skills' },
        { title: 'Docker', icon: 'SiDocker', color: '#2496ED', category: 'Top Skills' },
        { title: 'Git', icon: 'SiGit', color: '#F05032', category: 'Top Skills' },
        { title: 'OpenAI', icon: 'SiOpenai', color: '#412991', category: 'Top Skills' },

        { title: 'Node.js', icon: 'SiNodedotjs', color: '#339933', category: 'Backend & APIs' },
        { title: 'Express.js', icon: 'SiExpress', color: null, category: 'Backend & APIs' },
        { title: 'Fastify', icon: 'SiFastify', color: null, category: 'Backend & APIs' },
        { title: 'NestJS', icon: 'SiNestjs', color: '#E0234E', category: 'Backend & APIs' },
        { title: 'Java', icon: 'FaJava', color: '#00A3E0', category: 'Backend & APIs' },
        { title: 'Spring Boot', icon: 'SiSpring', color: '#6DB33F', category: 'Backend & APIs' },
        { title: 'PHP', icon: 'SiPhp', color: '#777BB4', category: 'Backend & APIs' },
        { title: 'Laravel', icon: 'SiLaravel', color: '#FF2D20', category: 'Backend & APIs' },
        { title: 'GraphQL', icon: 'SiGraphql', color: '#E10098', category: 'Backend & APIs' },
        { title: 'WebSockets', icon: 'SiSocketdotio', color: '#010101', category: 'Backend & APIs' },
        { title: 'REST APIs', icon: 'FaCloud', color: null, category: 'Backend & APIs' },
        { title: 'Serverless', icon: 'SiServerless', color: '#FD5750', category: 'Backend & APIs' },

        { title: 'JavaScript', icon: 'IoLogoJavascript', color: '#F7DF1E', category: 'Frontend' },
        { title: 'React', icon: 'FaReact', color: '#61DAFB', category: 'Frontend' },
        { title: 'Angular', icon: 'FaAngular', color: '#DD0031', category: 'Frontend' },
        { title: 'TypeScript', icon: 'SiTypescript', color: '#3178C6', category: 'Frontend' },
        { title: 'Redux', icon: 'SiRedux', color: '#764ABC', category: 'Frontend' },
        { title: 'Next.js', icon: 'SiNextdotjs', color: null, category: 'Frontend' },
        { title: 'Bootstrap', icon: 'SiBootstrap', color: '#7952B3', category: 'Frontend' },
        { title: 'Tailwind CSS', icon: 'SiTailwindcss', color: '#06B6D4', category: 'Frontend' },
        { title: 'Material UI', icon: 'SiMaterialdesignicons', color: '#0081CB', category: 'Frontend' },
        { title: 'HTML5', icon: 'SiHtml5', color: '#E34F26', category: 'Frontend' },
        { title: 'CSS3', icon: 'SiCss3', color: '#1572B6', category: 'Frontend' },

        { title: 'MySQL', icon: 'SiMysql', color: '#4479A1', category: 'Databases & Streaming' },
        { title: 'PostgreSQL', icon: 'SiPostgresql', color: '#336791', category: 'Databases & Streaming' },
        { title: 'MongoDB', icon: 'SiMongodb', color: '#47A248', category: 'Databases & Streaming' },
        { title: 'CosmosDB', icon: 'FaDatabase', color: '#4F4F4F', category: 'Databases & Streaming' },
        { title: 'Neo4j', icon: 'SiNeo4J', color: '#008CC1', category: 'Databases & Streaming' },
        { title: 'Redis', icon: 'SiRedis', color: '#DC382D', category: 'Databases & Streaming' },
        { title: 'Kafka', icon: 'SiApachekafka', color: null, category: 'Databases & Streaming' },
        { title: 'RabbitMQ', icon: 'SiRabbitmq', color: '#FF6600', category: 'Databases & Streaming' },
        { title: 'ElasticSearch', icon: 'SiElasticsearch', color: '#005571', category: 'Databases & Streaming' },
        { title: 'Kibana', icon: 'SiKibana', color: '#E8478B', category: 'Databases & Streaming' },
        { title: 'Prisma ORM', icon: 'SiPrisma', color: null, category: 'Databases & Streaming' },

        { title: 'Azure', icon: 'VscAzureDevops', color: '#0089D6', category: 'Cloud & DevOps' },
        { title: 'AWS', icon: 'FaAws', color: '#FF9900', category: 'Cloud & DevOps' },
        { title: 'GCP', icon: 'SiGooglecloud', color: '#4285F4', category: 'Cloud & DevOps' },
        { title: 'DigitalOcean', icon: 'SiDigitalocean', color: '#0080FF', category: 'Cloud & DevOps' },
        { title: 'Docker', icon: 'SiDocker', color: '#2496ED', category: 'Cloud & DevOps' },
        { title: 'Kubernetes', icon: 'SiKubernetes', color: '#326CE5', category: 'Cloud & DevOps' },
        { title: 'Jenkins', icon: 'SiJenkins', color: '#D24939', category: 'Cloud & DevOps' },
        { title: 'GitHub Actions', icon: 'SiGithubactions', color: '#2088FF', category: 'Cloud & DevOps' },
        { title: 'SonarQube', icon: 'SiSonarqube', color: '#4E9BCD', category: 'Cloud & DevOps' },

        { title: 'Jest', icon: 'SiJest', color: '#C21325', category: 'Testing & Monitoring' },
        { title: 'Mocha', icon: 'SiMocha', color: '#8D6748', category: 'Testing & Monitoring' },
        { title: 'JMeter', icon: 'SiApachejmeter', color: '#D22128', category: 'Testing & Monitoring' },
        { title: 'Postman', icon: 'SiPostman', color: '#FF6C37', category: 'Testing & Monitoring' },
        { title: 'Swagger', icon: 'SiSwagger', color: '#85EA2D', category: 'Testing & Monitoring' },

        { title: 'Twilio', icon: 'SiTwilio', color: '#F22F46', category: 'Messaging, Integration & Auth' },
        { title: 'SendGrid', icon: 'SiSendgrid', color: '#0081C9', category: 'Messaging, Integration & Auth' },
        { title: 'Stripe', icon: 'SiStripe', color: '#635BFF', category: 'Messaging, Integration & Auth' },
        { title: 'Razorpay', icon: 'SiRazorpay', color: '#02042B', category: 'Messaging, Integration & Auth' },
        { title: 'OAuth', icon: 'TbBrandOauth', color: '#3C5A99', category: 'Messaging, Integration & Auth' },
        { title: 'JWT', icon: 'SiJsonwebtokens', color: '#000000', category: 'Messaging, Integration & Auth' },
        { title: 'Firebase Auth', icon: 'SiFirebase', color: '#FFCA28', category: 'Messaging, Integration & Auth' },

        { title: 'OpenAI', icon: 'SiOpenai', color: '#412991', category: 'AI, LLM & Web3' },
        { title: 'Solidity', icon: 'SiSolidity', color: '#363636', category: 'AI, LLM & Web3' },
        { title: 'Ethereum', icon: 'SiEthereum', color: '#3C3C3D', category: 'AI, LLM & Web3' },
        { title: 'Web3.js', icon: 'SiWeb3Dotjs', color: '#F16822', category: 'AI, LLM & Web3' },

        { title: 'Git', icon: 'SiGit', color: '#F05032', category: 'Tools & Collaboration' },
        { title: 'GitHub', icon: 'SiGithub', color: null, category: 'Tools & Collaboration' },
        { title: 'GitLab', icon: 'SiGitlab', color: '#FC6D26', category: 'Tools & Collaboration' },
        { title: 'Bitbucket', icon: 'SiBitbucket', color: '#0052CC', category: 'Tools & Collaboration' },
        { title: 'SVN', icon: 'SiSubversion', color: '#809CC9', category: 'Tools & Collaboration' },
        { title: 'Jira', icon: 'SiJira', color: '#0052CC', category: 'Tools & Collaboration' },
        { title: 'Trello', icon: 'SiTrello', color: '#0079BF', category: 'Tools & Collaboration' },
        { title: 'Azure Boards', icon: 'VscAzureDevops', color: '#0078D7', category: 'Tools & Collaboration' },
        { title: 'Back4App', icon: 'SiBackstage', color: '#FFB300', category: 'Tools & Collaboration' },
        { title: 'Firebase', icon: 'TbBrandFirebase', color: '#FFCA28', category: 'Tools & Collaboration' },
    ];

    await prisma.skill.createMany({
        data: skills.map((s) => ({ ...s, userId: null })),
    });
}

async function seedCertificates() {
    await prisma.certificate.deleteMany({ where: { userId: null } });

    const certificates = [
        { title: 'BFL Appreciation', imgSrc: './img/certificates/bfl_appreciation.jpg' },
        { title: 'AZ-204 Microsoft Certified', imgSrc: './img/certificates/AZ_204.png' },
        { title: 'Namaste NodeJS', imgSrc: './img/certificates/namaste_node.png' },
        { title: 'Namaste React', imgSrc: './img/certificates/namaste_react.png' },
        { title: 'Namaste Javascript', imgSrc: './img/certificates/namaste_js.png' },
        { title: 'Cygnet Appreciation', imgSrc: './img/certificates/cygnet_appreciation.png' },
        { title: 'HackerRank', imgSrc: './img/certificates/hackerrank.png' },
        { title: 'Javascript Algorithms and DS', imgSrc: './img/certificates/javascript.png' },
        { title: 'Makerfest', imgSrc: './img/certificates/makerfest.png' },
        { title: 'Girlscript India Summit Volunteer', imgSrc: './img/certificates/girlscript.png' },
        { title: 'Way To Web Internship', imgSrc: './img/certificates/waytoweb.png' },
        { title: 'Invent-o-fest', imgSrc: './img/certificates/invent-o-fest.png' },
    ];

    await prisma.certificate.createMany({
        data: certificates.map((c) => ({ ...c, userId: null })),
    });
}

async function seedEducation() {
    await prisma.education.deleteMany({ where: { userId: null } });

    const education = [
        {
            school: 'BITS PILANI (WILP)',
            url: 'https://bits-pilani-wilp.ac.in/',
            location: 'Pilani, Rajasthan, India',
            degree: 'M.Tech in Software Engineering',
            grade: '8.11 CGPA',
            period: '2023 - 2025',
        },
        {
            school: 'Alpha College of Engineering & Technology (GTU)',
            url: 'https://www.alpha-cet.in/',
            location: 'Ahmedabad, Gujarat, India',
            degree: 'B.E. in Computer Science',
            grade: '8.28 CPI',
            period: '2014 - 2018',
        },
        {
            school: 'H.B.Kapadia New High School (GSEB)',
            url: 'https://hbkapadia.com/',
            location: 'Ahmedabad, Gujarat, India',
            degree: 'HSC - 2014, SSC - 2012',
            grade: null,
            period: '2003 - 2014',
        },
    ];

    await prisma.education.createMany({
        data: education.map((e) => ({ ...e, userId: null })),
    });
}

async function seedContacts() {
    await prisma.contact.deleteMany({ where: { userId: null } });

    const contacts = [
        {
            icon: 'FaLinkedin',
            label: 'LinkedIn',
            href: 'https://linkedin.com/in/shahnisarg96',
            title: 'LinkedIn',
        },
        {
            icon: 'FaGithub',
            label: 'GitHub',
            href: 'https://github.com/shahnisarg96',
            title: 'GitHub',
        },
        {
            icon: 'FaEnvelope',
            label: 'shahnisarg96@gmail.com',
            href: 'mailto:shahnisarg96@gmail.com',
            title: 'Email',
        },
        {
            icon: 'FaPhone',
            label: '+91-8401998755',
            href: 'tel:+918401998755',
            title: 'Call',
        },
        {
            icon: 'FaTwitter',
            label: 'Twitter',
            href: 'https://twitter.com/shahnisarg96',
            title: 'Twitter',
        },
        {
            icon: 'BsMicrosoftTeams',
            label: 'Teams',
            href: 'https://teams.microsoft.com/l/chat/0/0?users=shahnisarg96@outlook.com',
            title: 'Teams',
        },
    ];

    await prisma.contact.createMany({
        data: contacts.map((c) => ({ ...c, userId: null })),
    });
}

async function main() {
    await seedUsers();
    await seedIntro();
    await seedAbout();
    await seedExperience();
    await seedProjects();
    await seedSkills();
    await seedCertificates();
    await seedEducation();
    await seedContacts();
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
