import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LANGUAGES } from './constants';
import { Github, Linkedin, Download, Mail, Phone, MapPin, Sun, Moon, Terminal, Briefcase, Code, User, Cpu, ArrowRight, Award, FileText, Send, MessageCircle, ExternalLink, Languages, Star, Lock, Globe } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { LanguageKey } from './constants';
import reposData from './repos.json';

const API_KEY = process.env.GEMINI_API_KEY;

export default function App() {
  const [language, setLanguage] = useState<LanguageKey>('en');
  const lang = LANGUAGES[language];
  
  // Force dark mode by default for the premium tech look
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });
  const [promptInput, setPromptInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomedCertificateImage, setZoomedCertificateImage] = useState<string | null>(null);
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleLanguage = () => {
    const keys: LanguageKey[] = ['en', 'mm', 'zh'];
    const currentIndex = keys.indexOf(language);
    const nextIndex = (currentIndex + 1) % keys.length;
    setLanguage(keys[nextIndex]);
  };

  // Scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'experience', 'projects', 'githubRepos', 'skills', 'ai'];
      const scrollPosition = window.scrollY + 200; // Offset

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const handlePromptSubmit = async () => {
    if (!promptInput.trim()) return;
    setIsLoading(true);
    setAiResponse('');
    try {
      if (!API_KEY) throw new Error('GEMINI_API_KEY is not set.');
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the following resume profile:
        Name: ${lang.profile.name}
        Tagline: ${lang.profile.tagline}
        Description: ${lang.profile.description.join(' ')}
        Contact: ${JSON.stringify(lang.profile.contact)}
        
        Answer the following question in English:
        ${promptInput}`,
      });
      setAiResponse(response.text || 'No response from AI.');
    } catch (error) {
      console.error('Error generating AI response:', error);
      setAiResponse('Error: Could not get a response from AI. Please try again later.');
    } finally {
      setIsLoading(false);
      setPromptInput('');
    }
  };

  return (
    <div className={`min-h-screen font-sans ${theme} bg-[var(--bg)] text-[var(--fg)] selection:bg-[var(--accent)] selection:text-white`}>
      
      {/* Profile Image Zoom Modal */}
      {isImageZoomed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsImageZoomed(false)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-4xl w-full h-full flex items-center justify-center"
          >
            <img 
              src={lang.profile.profileImage} 
              alt={lang.profile.name} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/executive/800/1200';
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Certificate Image Zoom Modal */}
      {zoomedCertificateImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setZoomedCertificateImage(null)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
          >
            <img 
              src={zoomedCertificateImage} 
              alt="Certificate" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/certificate/1200/800';
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* WeChat QR Modal */}
      {isWeChatModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          onClick={() => setIsWeChatModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative max-w-sm w-full bg-[var(--card)] p-1 rounded-[2.5rem] border border-[var(--card-border)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-b from-[var(--accent)]/20 to-transparent p-8">
              <button 
                onClick={() => setIsWeChatModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10"
              >
                <ArrowRight className="rotate-180" size={20} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--accent)]/20">
                  <MessageCircle size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--fg)]">WeChat Connect</h3>
                <p className="text-[var(--muted)] text-sm mt-1">Scan the code to add me</p>
              </div>

              <div className="relative aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-inner bg-white p-4 group">
                <img 
                  src={lang.profile.contact.wechatQr} 
                  alt="WeChat QR Code" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/wechat/400/400';
                  }}
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>

              <div className="mt-8 flex flex-col items-center">
                <div className="px-4 py-2 rounded-full bg-[var(--bg)] border border-[var(--card-border)] flex items-center space-x-2">
                  <span className="text-[var(--muted)] text-xs font-mono">ID:</span>
                  <span className="text-[var(--fg)] font-bold font-mono">{lang.profile.contact.wechat}</span>
                </div>
                <p className="mt-4 text-[var(--muted)] text-[10px] uppercase tracking-widest font-bold">霆 | ting</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Floating Glass Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-6 py-3 flex items-center space-x-6 shadow-2xl">
        {[
          { id: 'about', icon: User, label: 'About' },
          { id: 'experience', icon: Briefcase, label: 'Experience' },
          { id: 'projects', icon: Code, label: 'Projects' },
          { id: 'githubRepos', icon: Github, label: 'Repos' },
          { id: 'skills', icon: Cpu, label: 'Skills' },
          { id: 'ai', icon: Terminal, label: 'AI Chat' }
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${activeSection === item.id ? 'text-[var(--accent)] scale-110' : 'text-[var(--muted)] hover:text-[var(--fg)]'}`}
            title={item.label}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1 font-medium hidden md:block">{item.label}</span>
          </a>
        ))}
        <div className="w-px h-6 bg-[var(--card-border)] mx-2"></div>
        <button onClick={toggleLanguage} className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-1">
          <Languages size={18} />
          <span className="text-[10px] font-bold uppercase">{language}</span>
        </button>
        <div className="w-px h-6 bg-[var(--card-border)] mx-2"></div>
        <button onClick={toggleTheme} className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-32">
        
        {/* HERO SECTION */}
        <section id="about" className="min-h-[90vh] flex flex-col justify-center pt-20 relative">
          {/* Subtle grid background */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-[var(--bg)] bg-[radial-gradient(var(--card-border)_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            <div className="lg:col-span-8">
              <div className="inline-block px-3 py-1 rounded-full border border-[var(--accent)] text-[var(--accent)] text-xs font-bold tracking-wider uppercase mb-6 bg-[var(--accent)]/10">
                {lang.profile.title}
              </div>
              
              <motion.h1 
                whileHover={{ scale: 1.02, x: 10 }}
                className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-4 text-gradient leading-tight cursor-default"
              >
                <span className="block">{lang.profile.name}</span>
                <span className="block text-3xl md:text-5xl mt-2">{lang.profile.nickname}</span>
              </motion.h1>
              
              <h2 className="text-2xl md:text-3xl text-[var(--muted)] font-display mb-8">
                {lang.profile.tagline}
              </h2>

              <div className="space-y-4 text-lg text-[var(--muted)] leading-relaxed mb-10">
                {lang.profile.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <a href="#experience" className="px-6 py-3 bg-[var(--fg)] text-[var(--bg)] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center">
                  View Experience <ArrowRight size={16} className="ml-2" />
                </a>
                <a href={lang.resume.file} download className="px-6 py-3 border border-[var(--card-border)] rounded-lg font-medium hover:bg-[var(--card)] transition-colors flex items-center">
                  <Download size={16} className="mr-2" /> {lang.resume.download}
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsImageZoomed(true)}
                className="relative group cursor-zoom-in"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-64 h-80 md:w-72 md:h-96 rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
                  <img 
                    src={lang.profile.profileImage} 
                    alt={lang.profile.name} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/executive/400/600';
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Contact Strip */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5, duration: 0.8 }} 
            className="mt-20 border-y border-[var(--card-border)] py-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Direct Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
                    <Phone size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span>{lang.profile.contact.phone}</span>
                  </div>
                  {lang.profile.contact.emails.map((email: string, idx: number) => (
                    <a key={idx} href={`mailto:${email}`} className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--accent)] transition-colors">
                      <Mail size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                      <span>{email}</span>
                    </a>
                  ))}
                  <div className="flex items-center text-[var(--muted)] text-sm">
                    <MapPin size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span>{lang.profile.contact.address}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Social & Chat</h4>
                <div className="space-y-3">
                  <a href={lang.profile.contact.whatsapp} target="_blank" rel="noreferrer" className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
                    <MessageCircle size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span>WhatsApp: Message Me</span>
                  </a>
                  <a href={lang.profile.contact.telegram} target="_blank" rel="noreferrer" className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
                    <Send size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span>Telegram: {lang.profile.contact.telegramUser}</span>
                  </a>
                  <button 
                    onClick={() => setIsWeChatModalOpen(true)}
                    className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--accent)] transition-colors w-full text-left group"
                  >
                    <MessageCircle size={16} className="mr-3 text-[var(--accent)] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>WeChat: {lang.profile.contact.wechat}</span>
                    <div className="ml-2 px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-tighter">QR</div>
                  </button>
                  <a href={lang.profile.contact.teamsChat} target="_blank" rel="noreferrer" className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
                    <Briefcase size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span>MS Teams: {lang.profile.contact.teams}</span>
                  </a>
                  <a href={lang.profile.contact.github} target="_blank" rel="noreferrer" className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
                    <Github size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span className="truncate">GitHub: {lang.profile.contact.github.split('/').pop()}</span>
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Gaming & Community</h4>
                <div className="space-y-3">
                  <a href={lang.profile.contact.discordLink} target="_blank" rel="noreferrer" className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
                    <Terminal size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span>Discord: {lang.profile.contact.discord}</span>
                  </a>
                  <a href={lang.profile.contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
                    <Linkedin size={16} className="mr-3 text-[var(--accent)] shrink-0" />
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experience" className="py-24 border-t border-[var(--card-border)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl font-bold font-display mb-12 text-gradient">{lang.experience.title}</h2>
            
            <div className="relative border-l border-[var(--card-border)] ml-4 md:ml-6 space-y-12 pb-4">
              {lang.experience.items.map((item, index) => (
                <div key={index} className="relative pl-8 md:pl-12 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                    <h3 className="text-xl font-bold font-display text-[var(--fg)]">
                      {item.role}
                    </h3>
                    <span className="text-sm font-mono text-[var(--accent)] mt-1 md:mt-0 bg-[var(--accent)]/10 px-2 py-1 rounded">
                      {item.duration}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 mb-4">
                    <h4 className="text-lg font-medium text-[var(--fg)]">
                      {item.company}
                    </h4>
                    {item.department && (
                      <>
                        <span className="text-[var(--muted)]">•</span>
                        <span className="text-sm text-[var(--muted)] italic">{item.department}</span>
                      </>
                    )}
                  </div>
                  
                  <ul className="space-y-3 text-[var(--muted)] text-sm leading-relaxed">
                    {item.description.map((desc: string, descIndex: number) => (
                      <li key={descIndex} className="flex items-start">
                        <span className="text-[var(--accent)] mr-2 mt-1">▹</span>
                        <div className="flex-1">{desc}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* PROJECTS SECTION (Bento Grid) */}
        <section id="projects" className="py-24 border-t border-[var(--card-border)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl font-bold font-display mb-12 text-gradient">{lang.projects.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lang.projects.items.map((project, index) => (
                <div key={index} className={`bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-8 relative group hover:border-[var(--accent)]/50 transition-colors ${index === 0 ? 'md:col-span-2' : ''}`}>
                  <div className="w-12 h-12 bg-[var(--bg)] rounded-xl flex items-center justify-center mb-6 border border-[var(--card-border)] text-[var(--accent)]">
                    <Code size={24} />
                  </div>
                  <h3 className="text-2xl font-bold font-display mb-3 text-[var(--fg)]">
                    {project.name}
                  </h3>
                  <p className="text-[var(--muted)] leading-relaxed text-sm">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* GITHUB REPOS SECTION */}
        <section id="githubRepos" className="py-24 border-t border-[var(--card-border)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4 mb-12">
              <Github className="text-[var(--accent)]" size={40} />
              <h2 className="text-4xl font-bold font-display text-gradient">{lang.githubRepos.title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reposData.slice(0, 9).map((repo, index) => (
                <motion.a 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  key={repo.id}
                  whileHover={{ y: -5 }}
                  className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 flex flex-col h-full hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/10 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-[var(--fg)] font-bold text-lg group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                      <Code size={18} className="text-[var(--muted)]" />
                      <span className="truncate">{repo.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 bg-[var(--bg)] border border-[var(--card-border)] rounded-md text-[var(--muted)] shrink-0">
                      {repo.private ? <Lock size={12} className="text-red-400" /> : <Globe size={12} className="text-green-400" />}
                      <span>{repo.private ? lang.githubRepos.privateBadge : lang.githubRepos.publicBadge}</span>
                    </div>
                  </div>
                  
                  <p className="text-[var(--muted)] text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                    {repo.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--card-border)]">
                    <div className="flex items-center gap-4 text-xs font-medium text-[var(--muted)]">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></span>
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SKILLS & CERTIFICATIONS SECTION */}
        <section id="skills" className="py-24 border-t border-[var(--card-border)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl font-bold font-display mb-12 text-gradient">{lang.skills.title}</h2>
            
            <div className="mb-16">
              <h3 className="text-xl font-display text-[var(--fg)] mb-6 flex items-center">
                <Cpu className="mr-2 text-[var(--accent)]" size={20} /> Core Competencies
              </h3>
              <div className="flex flex-wrap gap-3">
                {lang.skills.items.map((skill, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--card-border)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--fg)] hover:border-[var(--accent)]/50 transition-colors">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Badges */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display text-[var(--fg)] flex items-center">
                  <Award className="mr-2 text-[var(--accent)]" size={20} /> Digital Badges (Credly)
                </h3>
                <a 
                  href="https://www.credly.com/users/htetaunghlaing" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center"
                >
                  View All on Credly <ArrowRight size={12} className="ml-1" />
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {lang.skills.badges.map((badge: any, index: number) => (
                  <motion.div 
                    key={index}
                    whileHover={{ y: -5 }}
                    className="relative group flex flex-col items-center"
                  >
                    <a href={badge.verifyUrl} target="_blank" rel="noreferrer" className="block w-full aspect-square rounded-2xl overflow-hidden border border-[var(--card-border)] hover:border-[var(--accent)] transition-all bg-[var(--card)] p-4 shadow-sm group-hover:shadow-xl group-hover:shadow-[var(--accent)]/10">
                      <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-contain" />
                    </a>
                    <span className="mt-3 text-[10px] text-[var(--muted)] text-center font-bold leading-tight uppercase tracking-tighter h-8 overflow-hidden line-clamp-2">
                      {badge.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-display text-[var(--fg)] mb-6 flex items-center">
                <Briefcase className="mr-2 text-[var(--accent)]" size={20} /> Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lang.skills.certificates.map((cert: any, index: number) => (
                  <motion.div 
                    key={index} 
                    className="group relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[var(--accent)]/5 hover:border-[var(--accent)]/30 transition-all duration-500 flex flex-col"
                  >
                    {/* Top Image Section - Full width, framed */}
                    {cert.image && (
                      <div 
                        className="relative w-full aspect-[1.4/1] bg-[var(--bg)] overflow-hidden p-4 sm:p-6 flex items-center justify-center cursor-zoom-in group/image"
                        onClick={() => setZoomedCertificateImage(cert.image)}
                      >
                        <img 
                          src={cert.image} 
                          alt={cert.name}
                          className="w-full h-full object-contain rounded shadow-sm group-hover/image:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Bottom Info Section */}
                    <div className="p-5 border-t border-[var(--card-border)] bg-[var(--card)] relative z-20 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--accent)] shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-[var(--fg)] text-sm group-hover:text-[var(--accent)] transition-colors">
                              {cert.name}
                            </h4>
                            <p className="text-xs text-[var(--muted)] mt-0.5">
                              {cert.issuer} • {cert.date || cert.year}
                            </p>
                          </div>
                        </div>
                        {cert.link && cert.link !== '#' && (
                          <a 
                            href={cert.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white rounded-lg font-medium text-xs flex items-center transition-all shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Verify <ExternalLink size={14} className="ml-1.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* AI INSIGHTS SECTION (Terminal Style) */}
        <section id="ai" className="py-24 border-t border-[var(--card-border)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden shadow-2xl font-mono">
              <div className="bg-[#111] border-b border-[#222] px-4 py-3 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto text-xs text-gray-500 font-medium">{lang.prompts.title}</div>
              </div>
              <div className="p-6 text-sm min-h-[300px] flex flex-col">
                <div className="text-gray-400 mb-4">
                  <span className="text-green-400">guest@portfolio</span>:<span className="text-blue-400">~</span>$ {lang.prompts.terminal}
                  <br/>
                  <span className="text-gray-500">{lang.prompts.ready}</span>
                </div>
                
                <div className="flex-grow overflow-y-auto mb-6">
                  {aiResponse && (
                    <div className="text-gray-300 leading-relaxed border-l-2 border-green-500 pl-4 py-1">
                      {aiResponse}
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-auto pt-4 border-t border-[#222]">
                  <span className="text-green-400 mr-2">❯</span>
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                    placeholder={lang.prompts.placeholder}
                    className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-600"
                    disabled={isLoading}
                  />
                  <button 
                    onClick={handlePromptSubmit}
                    disabled={isLoading || !promptInput.trim()}
                    className="ml-2 text-gray-500 hover:text-green-400 transition-colors disabled:opacity-30"
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
