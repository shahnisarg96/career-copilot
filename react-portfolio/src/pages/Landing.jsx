import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Landing() {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/admin');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
            {/* Hero */}
            <section className="container mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-black mb-4">Your Developer Brand, Done Right</h1>
                        <p className="text-lg text-base-content/80 max-w-3xl mb-8">
                            Craft a polished portfolio and resume from modular sections. Edit, preview, and publish — all in one place.
                        </p>
                        <div className="flex items-center lg:justify-start justify-center gap-4">
                            <Link to="/register" className="btn btn-primary btn-lg shadow-md hover:shadow-lg transition-shadow">Get Started</Link>
                            <Link to="/login" className="btn btn-outline btn-lg">Login</Link>
                        </div>
                    </div>
                    <div className="relative hidden lg:block">
                        <div className="mockup-window border bg-base-300">
                            <div className="bg-base-200 p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-primary">John Doe</h3>
                                    <p className="text-sm text-base-content/70">Full Stack Developer</p>
                                </div>
                                <div className="divider my-2"></div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="badge badge-primary badge-sm">Skills</div>
                                        <span className="text-xs">React • Node • TypeScript</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="badge badge-secondary badge-sm">Experience</div>
                                        <span className="text-xs">Senior Engineer @ Tech Co.</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="badge badge-accent badge-sm">Projects</div>
                                        <span className="text-xs">Portfolio App • API Gateway</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 badge badge-primary badge-lg shadow">
                            <Link to="/portfolio" >Live Preview</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
                {[
                    ['Modular Sections', 'Intro, About, Experience, Projects, Skills, Certificates, Education, Contact'],
                    ['Secure Publishing', 'JWT-protected editing, instant publish to a public link'],
                    ['Beautiful UI', 'Thoughtful colors, spacing, and motion for a product-grade feel']
                ].map(([title, desc]) => (
                    <div key={title} className="card bg-base-100 shadow-md hover:shadow-lg transition border border-base-300">
                        <div className="card-body">
                            <h3 className="card-title text-primary">{title}</h3>
                            <p className="text-sm text-base-content/70">{desc}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Sections Showcase */}
            <section className="container mx-auto px-6 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Build Your Portfolio, Section by Section</h2>
                    <p className="text-base-content/70 max-w-2xl mx-auto">
                        Each section is independently editable. Update what you need, when you need it.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: '👋', title: 'Intro', desc: 'Hero & tagline' },
                        { icon: '📝', title: 'About', desc: 'Your story' },
                        { icon: '💼', title: 'Experience', desc: 'Work history' },
                        { icon: '🚀', title: 'Projects', desc: 'Portfolio pieces' },
                        { icon: '⚡', title: 'Skills', desc: 'Tech stack' },
                        { icon: '🎓', title: 'Certificates', desc: 'Credentials' },
                        { icon: '🏫', title: 'Education', desc: 'Academic background' },
                        { icon: '📧', title: 'Contact', desc: 'Get in touch' }
                    ].map(({ icon, title, desc }) => (
                        <div key={title} className="card bg-base-100 border border-base-300 shadow hover:shadow-md transition">
                            <div className="card-body items-center text-center p-6">
                                <div className="text-4xl mb-2">{icon}</div>
                                <h3 className="font-bold">{title}</h3>
                                <p className="text-xs text-base-content/60">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
