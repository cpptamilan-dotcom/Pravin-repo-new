import React, { useEffect } from 'react';
import { X, Printer, Download, Copy, Check, Terminal, FolderGit2, Globe, Image as ImageIcon } from 'lucide-react';
import { ARTIST_INFO, SKILLS_LIST } from '../data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadResumeHtml = () => {
    const resumeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pravin Kumar - Curriculum Vitae (Sculptor & Fine Artist)</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      color: #202124;
      background: #FFFFFF;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 32px;
      line-height: 1.6;
    }
    header {
      border-bottom: 1px solid #202124;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    h1 {
      font-size: 34px;
      letter-spacing: 0.04em;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      font-weight: 600;
    }
    .subtitle {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #B69A68;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .contact-bar {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #444;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    section {
      margin-bottom: 28px;
    }
    h2 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #7C9185;
      border-bottom: 1px solid #E5E5E5;
      padding-bottom: 6px;
      margin-bottom: 14px;
    }
    .edu-item {
      margin-bottom: 12px;
    }
    .edu-title {
      font-size: 18px;
      font-weight: 600;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    }
    @media print {
      body { margin: 0; padding: 24px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${ARTIST_INFO.name}</h1>
    <div class="subtitle">${ARTIST_INFO.professionalTitle}</div>
    <div class="contact-bar">
      <span>Location: ${ARTIST_INFO.contact.locationFull}</span>
      <span>·</span>
      <span>Phone: +91 ${ARTIST_INFO.contact.phone}</span>
      <span>·</span>
      <span>Email: ${ARTIST_INFO.contact.email}</span>
    </div>
  </header>

  <section>
    <h2>Artist Profile</h2>
    <p>${ARTIST_INFO.aboutBio}</p>
  </section>

  <section>
    <h2>Education</h2>
    <div class="edu-item">
      <div class="edu-title">${ARTIST_INFO.education.degree} — Specialization in ${ARTIST_INFO.education.specialization} (${ARTIST_INFO.education.graduationYear})</div>
      <div><strong>College:</strong> ${ARTIST_INFO.education.collegeTamil} (${ARTIST_INFO.education.collegeEnglish})</div>
      <div><strong>University:</strong> ${ARTIST_INFO.education.university}</div>
    </div>
  </section>

  <section>
    <h2>Core Artistic & Digital Skills</h2>
    <div class="skills-grid">
      <div><strong>Artistic Disciplines:</strong> Sculpture, Drawing, Sketching, Painting, Creative Composition</div>
      <div><strong>Digital Sculpting:</strong> ZBrush, 3D Digital Sculpting, High-Resolution Form & Ornamental Detailing</div>
    </div>
  </section>

  <section>
    <h2>Selected Portfolio Focus</h2>
    <ul>
      <li><strong>Traditional & Iconographic Sculpture:</strong> Classical South Indian sculptural forms, clay modelling, and ornamental relief studies.</li>
      <li><strong>3D Digital Sculpting (ZBrush):</strong> Multi-armed deity sculptures, standing figurative contrapposto studies, Prabhavali torana arches, and lotus pedestals rendered in studio clay and metallic MatCap shaders.</li>
      <li><strong>Fine Arts Foundation:</strong> Observational drawing, anatomical sketching, painting, and spatial composition.</li>
    </ul>
  </section>
</body>
</html>`;

    const blob = new Blob([resumeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Pravin_Kumar_Curriculum_Vitae.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#202124]/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-[#202124] shadow-2xl border border-[#202124]/10 p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#202124]/10 no-print">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B69A68] font-medium block">
              Artist Curriculum Vitae
            </span>
            <h2 id="resume-modal-title" className="font-display text-2xl font-semibold">
              Pravin Kumar — Official Resume
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F7F3] hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-[#B69A68]" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadResumeHtml}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202124] hover:bg-[#202124]/90 text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV File</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close resume modal"
              className="p-2 rounded-xl text-[#202124]/60 hover:text-[#202124] hover:bg-[#F1F2F2] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable CV Sheet */}
        <div className="space-y-8">
          <div className="border-b border-[#202124]/15 pb-6">
            <h3 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#202124]">
              {ARTIST_INFO.name}
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#B69A68] font-semibold mt-1.5">
              {ARTIST_INFO.professionalTitle}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#202124]/75">
              <span>{ARTIST_INFO.contact.locationFull}</span>
              <span aria-hidden="true">·</span>
              <a href={ARTIST_INFO.contact.phoneHref} className="hover:text-[#B69A68]">
                +91 {ARTIST_INFO.contact.phone}
              </a>
              <span aria-hidden="true">·</span>
              <a href={ARTIST_INFO.contact.emailHref} className="hover:text-[#B69A68]">
                {ARTIST_INFO.contact.email}
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#7C9185] font-semibold mb-2">
              Artist Statement
            </h4>
            <p className="text-sm text-[#202124]/85 leading-relaxed">{ARTIST_INFO.aboutBio}</p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#7C9185] font-semibold mb-3">
              Education
            </h4>
            <div className="p-5 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h5 className="font-display text-xl font-semibold text-[#202124]">
                  {ARTIST_INFO.education.degree} — {ARTIST_INFO.education.specialization}
                </h5>
                <span className="font-mono-tabular text-xs font-medium text-[#B69A68]">
                  Graduation: {ARTIST_INFO.education.graduationYear}
                </span>
              </div>
              <p className="text-sm font-medium text-[#202124] mt-1">
                {ARTIST_INFO.education.collegeTamil}
              </p>
              <p className="text-xs text-[#202124]/70 mt-0.5">
                {ARTIST_INFO.education.university}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#7C9185] font-semibold mb-3">
              Disciplines &amp; Technical Capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#202124]/8">
                <span className="text-xs uppercase tracking-wider text-[#202124]/60 block mb-2">
                  Fine &amp; Traditional Arts
                </span>
                <p className="text-sm font-medium text-[#202124]">
                  {SKILLS_LIST.filter((s) => s.category === 'Artistic Skills')
                    .map((s) => s.name)
                    .join(' · ')}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#202124]/8">
                <span className="text-xs uppercase tracking-wider text-[#202124]/60 block mb-2">
                  3D &amp; Digital Sculpting
                </span>
                <p className="text-sm font-medium text-[#202124]">
                  {SKILLS_LIST.filter((s) => s.category === 'Digital Skills')
                    .map((s) => s.name)
                    .join(' · ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GitHubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const gitCommands = `git init
git add .
git commit -m "Deploy Pravin Kumar Sculpture & Digital Art Portfolio"
git branch -M main
git remote add origin https://github.com/cpptamilan-dotcom/Pravin-repo.git
git push -u origin main`;

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#202124]/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-[#202124] shadow-2xl border border-[#202124]/10 p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-[#202124]/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B69A68] font-medium block">
              Documentation &amp; Publishing
            </span>
            <h2 id="github-modal-title" className="font-display text-2xl sm:text-3xl font-semibold">
              GitHub Pages Deployment &amp; Image Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close GitHub deployment guide"
            className="p-2 rounded-xl text-[#202124]/60 hover:text-[#202124] hover:bg-[#F1F2F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* 1. Project Structure */}
          <div className="p-5 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8">
            <div className="flex items-center gap-2 font-semibold text-[#202124] mb-2">
              <FolderGit2 className="w-4 h-4 text-[#B69A68]" />
              <span>1. Included Repository Structure (pravin-kumar-art-portfolio)</span>
            </div>
            <p className="text-xs text-[#202124]/75 mb-3">
              Both the full Vite application and a zero-dependency Vanilla HTML5/CSS3/JS static bundle (<code>css/style.css</code>, <code>js/main.js</code>, <code>README.md</code>) are included in this workspace so you can deploy directly to GitHub Pages.
            </p>
            <pre className="p-4 rounded-xl bg-[#202124] text-[#F8F7F3] font-mono-tabular text-xs overflow-x-auto">
{`pravin-kumar-art-portfolio/
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── images/
│   └── icons/
└── .gitignore`}
            </pre>
          </div>

          {/* 2. Git Commit & Push Commands */}
          <div className="p-5 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 font-semibold text-[#202124]">
                <Terminal className="w-4 h-4 text-[#B69A68]" />
                <span>2. Git Commit &amp; Push Commands</span>
              </div>
              <button
                type="button"
                onClick={() => copyText(gitCommands, 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-xs font-medium border border-[#202124]/15 hover:border-[#B69A68] cursor-pointer"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-[#7C9185]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <p className="text-xs text-[#202124]/75 mb-3">
              Create a new repository named <code>pravin-kumar-art-portfolio</code> on GitHub, then run:
            </p>
            <pre className="p-4 rounded-xl bg-[#202124] text-[#F8F7F3] font-mono-tabular text-xs overflow-x-auto">
              {gitCommands}
            </pre>
          </div>

          {/* 3. GitHub Pages & Custom Domain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8">
              <div className="flex items-center gap-2 font-semibold text-[#202124] mb-2">
                <Globe className="w-4 h-4 text-[#7C9185]" />
                <span>3. GitHub Pages Activation</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#202124]/80">
                <li>Open your repository on GitHub and click <strong>Settings</strong>.</li>
                <li>Select <strong>Pages</strong> from the left sidebar menu.</li>
                <li>Under <strong>Build and deployment &rarr; Source</strong>, select <strong>Deploy from a branch</strong> (or GitHub Actions for Vite build).</li>
                <li>Choose branch <code>main</code> and folder <code>/ (root)</code>, then click <strong>Save</strong>.</li>
                <li>Your live portfolio will publish within 1–2 minutes.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8">
              <div className="flex items-center gap-2 font-semibold text-[#202124] mb-2">
                <ImageIcon className="w-4 h-4 text-[#B69A68]" />
                <span>4. Replacing &amp; Adding Artwork Images</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#202124]/80">
                <li>Place your new high-resolution `.jpg` or `.webp` photos inside <code>assets/images/</code>.</li>
                <li>To test immediately in the browser, click <strong>"Preview Your Photo"</strong> on any placeholder card or click <strong>"+ Add Artwork Preview"</strong> in the gallery header.</li>
                <li>For permanent code updates, edit <code>INITIAL_ARTWORKS</code> in <code>src/data/portfolioData.ts</code> (or <code>js/main.js</code>) and set <code>isPlaceholder: false</code>.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
