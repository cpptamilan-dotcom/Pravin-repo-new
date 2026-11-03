import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowUp,
  Download,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  Plus,
  Layers,
  Eye,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FolderGit2,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  ARTIST_INFO,
  GALLERY_CATEGORIES,
  INITIAL_ARTWORKS,
  SCULPTURE_PILLARS,
  ZBRUSH_PILLARS,
  SKILLS_LIST,
  ArtworkCategory,
  ArtworkItem,
} from './data/portfolioData';
import { StudioPlaceholderVisual } from './components/StudioPlaceholderVisual';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { ResumeModal, GitHubGuideModal } from './components/PortfolioModals';
import { AdminStudioSection } from './components/AdminStudioSection';
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  compressImageForCloud,
} from './firebase';

export default function App() {
  // Navigation & Scroll State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Firebase Auth User State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Hero Visual Switcher State
  const [heroShowcaseIndex, setHeroShowcaseIndex] = useState<number>(1);
  const [customHeroImage, setCustomHeroImage] = useState<string>('');

  // About Artist Portrait & Sculpture Studio Cloud State
  const [artistPortraitUrl, setArtistPortraitUrl] = useState<string>('');
  const [sculptureStudioImage, setSculptureStudioImage] = useState<string>('');
  const [cloudArtworkIds, setCloudArtworkIds] = useState<string[]>([]);

  // Artworks Gallery State (Seeded with INITIAL_ARTWORKS + synced with Cloud Firestore via GET)
  const [artworks, setArtworks] = useState<ArtworkItem[]>(INITIAL_ARTWORKS);
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategory>('All');
  const [lightboxArtworkId, setLightboxArtworkId] = useState<string | null>(null);
  const [showAddArtworkForm, setShowAddArtworkForm] = useState(false);
  const [newArtworkTitle, setNewArtworkTitle] = useState('');
  const [newArtworkCategory, setNewArtworkCategory] =
    useState<Exclude<ArtworkCategory, 'All'>>('Sculpture');
  const [newArtworkMedium, setNewArtworkMedium] = useState('');
  const [newArtworkDescription, setNewArtworkDescription] = useState('');
  const [newArtworkImageFile, setNewArtworkImageFile] = useState<File | null>(null);

  // Sculpture Showcase Interactive State
  const [selectedSculpturePillar, setSelectedSculpturePillar] = useState<number>(0);

  // ZBrush Turnaround Comparison State
  const [activeZBrushStudy, setActiveZBrushStudy] = useState<'murugan' | 'rama' | 'ganesha'>('murugan');
  const [zbrushViewAngle, setZbrushViewAngle] = useState<'front' | 'rear'>('front');

  // Modals State
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Subtle Desktop Cursor Ring
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Track Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Deterministic GET fetch for all known + indexed Cloud Artworks
  const loadCloudArtworksByIds = async (indexedIds: string[]) => {
    const allCandidateIds = Array.from(
      new Set([...indexedIds, ...INITIAL_ARTWORKS.map((a) => a.id)])
    );

    const cloudMap = new Map<string, ArtworkItem>();

    await Promise.all(
      allCandidateIds.map(async (artId) => {
        const docPath = `artworks/${artId}`;
        try {
          const docSnap = await getDoc(doc(db, 'artworks', artId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            cloudMap.set(docSnap.id, {
              id: docSnap.id,
              catalogueNumber: data.catalogueNumber || 'CAT. 00',
              title: data.title || 'Untitled Artwork',
              tamilTitle: data.tamilTitle || undefined,
              categories: Array.isArray(data.categories) ? data.categories : ['Sculpture'],
              medium: data.medium || 'Sculpture',
              year: data.year || '2026',
              description: data.description || '',
              technicalNotes: data.technicalNotes || '',
              imageUrl: data.imageUrl || undefined,
              companionImageUrl: data.companionImageUrl || undefined,
              companionLabel: data.companionLabel || undefined,
              aspectRatio: data.aspectRatio || 'portrait',
              isPlaceholder: Boolean(data.isPlaceholder),
              replacementPathHint: data.replacementPathHint || 'assets/images/cloud.webp',
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, docPath);
        }
      })
    );

    const mergedBase = INITIAL_ARTWORKS.map((initialItem) => {
      if (cloudMap.has(initialItem.id)) {
        const override = cloudMap.get(initialItem.id)!;
        cloudMap.delete(initialItem.id);
        return override;
      }
      return initialItem;
    });

    const additionalCloudItems = Array.from(cloudMap.values());
    setArtworks([...additionalCloudItems, ...mergedBase]);
  };

  // Subscribe to Cloud Site Settings (Deterministic GET on settings/siteConfig)
  useEffect(() => {
    const settingsPath = 'settings/siteConfig';
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'siteConfig'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.heroImageUrl === 'string') setCustomHeroImage(data.heroImageUrl);
          if (typeof data.artistPortraitUrl === 'string') setArtistPortraitUrl(data.artistPortraitUrl);
          if (typeof data.sculptureStudioUrl === 'string') setSculptureStudioImage(data.sculptureStudioUrl);
          const ids = Array.isArray(data.artworkIds)
            ? data.artworkIds.filter((x: unknown): x is string => typeof x === 'string')
            : [];
          setCloudArtworkIds(ids);
          loadCloudArtworksByIds(ids);
        } else {
          loadCloudArtworksByIds([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      }
    );

    return () => {
      unsubSettings();
    };
  }, []);

  // Save or update an artwork in Firebase Cloud Firestore & update settings/siteConfig index
  const saveArtworkToCloud = async (item: ArtworkItem) => {
    const path = `artworks/${item.id}`;
    try {
      const existingSnap = await getDoc(doc(db, 'artworks', item.id));
      const existingCreatedAt = existingSnap.exists()
        ? existingSnap.data().createdAt
        : serverTimestamp();

      const payload: Record<string, unknown> = {
        id: item.id.slice(0, 128),
        catalogueNumber: item.catalogueNumber.slice(0, 32),
        title: item.title.slice(0, 200),
        categories: item.categories.slice(0, 7),
        medium: item.medium.slice(0, 200),
        year: item.year.slice(0, 16),
        description: item.description.slice(0, 2000),
        technicalNotes: (item.technicalNotes || 'Cloud-stored portfolio entry.').slice(0, 2000),
        imageUrl: (item.imageUrl || '').slice(0, 900000),
        aspectRatio: item.aspectRatio,
        isPlaceholder: Boolean(item.isPlaceholder),
        replacementPathHint: item.replacementPathHint.slice(0, 250),
        createdAt: existingCreatedAt,
        updatedAt: serverTimestamp(),
      };
      if (item.tamilTitle) payload.tamilTitle = item.tamilTitle.slice(0, 200);
      if (item.companionImageUrl) payload.companionImageUrl = item.companionImageUrl.slice(0, 900000);
      if (item.companionLabel) payload.companionLabel = item.companionLabel.slice(0, 120);

      await setDoc(doc(db, 'artworks', item.id), payload);

      const nextIds = Array.from(new Set([item.id, ...cloudArtworkIds])).slice(0, 50);
      await setDoc(doc(db, 'settings', 'siteConfig'), {
        heroImageUrl: customHeroImage.slice(0, 900000),
        artistPortraitUrl: artistPortraitUrl.slice(0, 900000),
        sculptureStudioUrl: sculptureStudioImage.slice(0, 900000),
        artworkIds: nextIds,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteArtworkFromCloud = async (artworkId: string) => {
    const path = `artworks/${artworkId}`;
    try {
      await deleteDoc(doc(db, 'artworks', artworkId));
      const nextIds = cloudArtworkIds.filter((id) => id !== artworkId).slice(0, 50);
      await setDoc(doc(db, 'settings', 'siteConfig'), {
        heroImageUrl: customHeroImage.slice(0, 900000),
        artistPortraitUrl: artistPortraitUrl.slice(0, 900000),
        sculptureStudioUrl: sculptureStudioImage.slice(0, 900000),
        artworkIds: nextIds,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveSiteMediaToCloud = async (
    field: 'heroImageUrl' | 'artistPortraitUrl' | 'sculptureStudioUrl',
    dataUrl: string
  ) => {
    const path = 'settings/siteConfig';
    try {
      const nextHero = field === 'heroImageUrl' ? dataUrl : customHeroImage;
      const nextPortrait = field === 'artistPortraitUrl' ? dataUrl : artistPortraitUrl;
      const nextSculpture = field === 'sculptureStudioUrl' ? dataUrl : sculptureStudioImage;

      await setDoc(doc(db, 'settings', 'siteConfig'), {
        heroImageUrl: nextHero.slice(0, 900000),
        artistPortraitUrl: nextPortrait.slice(0, 900000),
        sculptureStudioUrl: nextSculpture.slice(0, 900000),
        artworkIds: cloudArtworkIds.slice(0, 50),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 520);

      const sectionIds = [
        'home',
        'about',
        'artworks',
        'sculpture',
        'digital-art',
        'skills',
        'contact',
        'admin',
      ];
      const scrollPosition = window.scrollY + 180;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const heroShowcases = [
    {
      id: 'gallery-reference',
      label: 'Gallery Installation Concept',
      subtitle: 'Contemporary Sculpture Gallery Reference (Replaceable)',
      medium: 'Architectural Gallery Concept · Replaceable Hero Slot',
      imageUrl: 'assets/aistudio/image_50b3f2f5.png',
      isOriginal: false,
    },
    {
      id: 'murugan-clay',
      label: 'Seated Deity (Clay Render)',
      subtitle: 'Original ZBrush Sculpture by Pravin Kumar',
      medium: 'ZBrush Digital Sculpture · Clay MatCap',
      imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM_fe1d4107.jpeg',
      isOriginal: true,
    },
    {
      id: 'ganesha-gold',
      label: 'Venugopala Ganapati',
      subtitle: 'Original ZBrush Sculpture by Pravin Kumar',
      medium: 'ZBrush Digital Sculpture · Gold MatCap',
      imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.22_AM_574544c0.jpeg',
      isOriginal: true,
    },
    {
      id: 'rama-gold',
      label: 'Standing Kodanda Rama',
      subtitle: 'Original ZBrush Sculpture by Pravin Kumar',
      medium: 'ZBrush Digital Sculpture · Bronze-Gold Shader',
      imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM__1__5afcf882.jpeg',
      isOriginal: true,
    },
  ];

  const currentHeroVisual = heroShowcases[heroShowcaseIndex];

  const filteredArtworks =
    selectedCategory === 'All'
      ? artworks
      : artworks.filter((item) => item.categories.includes(selectedCategory));

  const currentLightboxArtwork = artworks.find((a) => a.id === lightboxArtworkId) || null;

  const handlePrevLightbox = () => {
    if (!currentLightboxArtwork) return;
    const idx = filteredArtworks.findIndex((a) => a.id === currentLightboxArtwork.id);
    const prevIdx = (idx - 1 + filteredArtworks.length) % filteredArtworks.length;
    setLightboxArtworkId(filteredArtworks[prevIdx].id);
  };

  const handleNextLightbox = () => {
    if (!currentLightboxArtwork) return;
    const idx = filteredArtworks.findIndex((a) => a.id === currentLightboxArtwork.id);
    const nextIdx = (idx + 1) % filteredArtworks.length;
    setLightboxArtworkId(filteredArtworks[nextIdx].id);
  };

  const handleUpdateArtworkImage = async (id: string, dataUrl: string) => {
    const target = artworks.find((a) => a.id === id);
    if (!target) return;
    await saveArtworkToCloud({
      ...target,
      imageUrl: dataUrl,
      isPlaceholder: false,
    });
  };

  const handleAddCustomArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtworkTitle.trim()) return;

    const compressedUrl = newArtworkImageFile
      ? await compressImageForCloud(newArtworkImageFile)
      : '';

    const cleanId = `cloud-art-${Date.now()}`;
    const newItem: ArtworkItem = {
      id: cleanId,
      catalogueNumber: `CAT. ${String(artworks.length + 1).padStart(2, '0')}`,
      title: newArtworkTitle.trim(),
      categories: [newArtworkCategory],
      medium: newArtworkMedium.trim() || `${newArtworkCategory} Study`,
      year: '2026',
      description:
        newArtworkDescription.trim() ||
        `Original ${newArtworkCategory.toLowerCase()} study by Pravin Kumar.`,
      technicalNotes: 'Uploaded and persisted to Firebase Cloud Storage.',
      imageUrl: compressedUrl || undefined,
      aspectRatio: 'portrait',
      isPlaceholder: !compressedUrl,
      placeholderType: 'clay-sculpture',
      replacementPathHint: `assets/images/${cleanId}.webp`,
    };

    await saveArtworkToCloud(newItem);
    setNewArtworkTitle('');
    setNewArtworkMedium('');
    setNewArtworkDescription('');
    setNewArtworkImageFile(null);
    setShowAddArtworkForm(false);
  };

  const handleDisciplineShortcut = (category: ArtworkCategory) => {
    setSelectedCategory(category);
    const el = document.getElementById('artworks');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const trimmedMessage = contactMessage.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Please provide a valid email address so Pravin Kumar can reply.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      setFormError('Please enter a message of at least 10 characters.');
      return;
    }

    setFormSubmitted(true);
  };

  const triggerMailtoFromForm = () => {
    const subject = encodeURIComponent(
      contactSubject.trim() || `Portfolio Inquiry from ${contactName.trim()}`
    );
    const body = encodeURIComponent(
      `Name: ${contactName.trim()}\nEmail: ${contactEmail.trim()}\n\nMessage:\n${contactMessage.trim()}`
    );
    window.location.href = `mailto:${ARTIST_INFO.contact.email}?subject=${subject}&body=${body}`;
  };

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Artworks', href: '#artworks', id: 'artworks' },
    { label: 'Sculpture', href: '#sculpture', id: 'sculpture' },
    { label: 'Digital Art', href: '#digital-art', id: 'digital-art' },
    { label: 'Skills', href: '#skills', id: 'skills' },
    { label: 'Contact', href: '#contact', id: 'contact' },
    { label: 'Admin', href: '#admin', id: 'admin' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202124] relative selection:bg-[#B69A68]/20">
      {/* Subtle Desktop Cursor Ring */}
      {cursorPos && (
        <div
          className="hidden lg:block fixed pointer-events-none z-40 w-7 h-7 rounded-full border border-[#B69A68]/45 transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${cursorPos.x - 14}px, ${cursorPos.y - 14}px, 0)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* A. PREMIUM STICKY NAVIGATION BAR (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#F8F7F3]/85 border-b border-[#202124]/8 transition-colors">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#home"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202124] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B69A68]"
          >
            {ARTIST_INFO.monogram}
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#202124]/75"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-[#202124] ${
                    isActive
                      ? 'text-[#202124] font-semibold after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[1.5px] after:bg-[#B69A68]'
                      : ''
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#202124] hover:bg-[#202124]/90 text-white text-xs font-medium transition-transform active:scale-98 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Download Resume</span>
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden p-2.5 rounded-xl bg-white text-[#202124] border border-[#202124]/10 hover:border-[#B69A68] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="lg:hidden bg-white border-b border-[#202124]/10 px-6 py-5 space-y-2 shadow-lg"
          >
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 text-base font-medium border-b border-[#202124]/5 last:border-0 ${
                  activeSection === link.id ? 'text-[#B69A68] font-semibold' : 'text-[#202124]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        {/* B. HERO SECTION */}
        <section
          id="home"
          className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden border-b border-[#202124]/8"
        >
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Left Column: Editorial Typographic Hierarchy (6 cols) */}
              <div className="lg:col-span-6 flex flex-col justify-center py-4 lg:py-10">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xs sm:text-sm tracking-[0.22em] uppercase font-semibold text-[#202124]">
                    {ARTIST_INFO.name}
                  </span>
                  <span className="w-12 h-[1.5px] bg-[#B69A68]" aria-hidden="true" />
                </div>

                <p className="text-xs sm:text-sm tracking-[0.18em] uppercase text-[#202124]/65 font-medium mb-6">
                  {ARTIST_INFO.heroLabel}
                </p>

                <h1
                  className="font-display text-4xl sm:text-6xl lg:text-[64px] font-normal tracking-tight text-[#202124] leading-[1.06] mb-6"
                  style={{ textWrap: 'balance' }}
                >
                  {ARTIST_INFO.heroHeading}
                </h1>

                <p className="text-base sm:text-lg text-[#202124]/75 max-w-xl leading-relaxed mb-9">
                  {ARTIST_INFO.heroSubtitle}
                </p>

                {/* Primary Hero Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#artworks"
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#202124] hover:bg-[#202124]/90 text-white text-sm font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Explore My Artworks</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#about"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#202124] text-sm font-medium border border-[#202124]/15 hover:border-[#202124]/35 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>About the Artist</span>
                  </a>
                </div>

                {/* Curatorial Provenance Note */}
                <div className="mt-10 pt-6 border-t border-[#202124]/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#202124]/60">
                  <span>BFA in Sculpture (2026)</span>
                  <span aria-hidden="true">·</span>
                  <span>கவின் கலைக் கல்லூரி, கும்பகோணம்</span>
                  <span aria-hidden="true">·</span>
                  <span>Tamil Nadu</span>
                </div>
              </div>

              {/* Right Column: Hero Sculpture Visual Container (6 cols) */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div className="relative rounded-3xl bg-white p-3 sm:p-4 shadow-sm border border-[#202124]/8 h-full flex flex-col justify-between">
                  <div className="relative rounded-2xl overflow-hidden bg-[#202124] aspect-[4/4.3] w-full flex items-center justify-center">
                    <img
                      src={customHeroImage || currentHeroVisual.imageUrl}
                      alt={currentHeroVisual.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transition-opacity duration-200"
                    />

                    {/* Honest Attribution Scrim Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 sm:p-6 flex flex-wrap items-end justify-between gap-3 text-white">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#B69A68] font-medium">
                          <span>
                            {customHeroImage
                              ? 'Cloud-Hosted Hero Sculpture'
                              : currentHeroVisual.isOriginal
                              ? 'Original Work by Pravin Kumar'
                              : 'Replaceable Gallery Concept'}
                          </span>
                        </div>
                        <p className="font-display text-xl sm:text-2xl font-medium text-white mt-0.5">
                          {customHeroImage ? 'Featured Studio Sculpture' : currentHeroVisual.label}
                        </p>
                        <p className="text-xs text-white/75">{currentHeroVisual.medium}</p>
                      </div>

                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-medium border border-white/20 cursor-pointer transition-colors whitespace-nowrap">
                        <span>Upload Hero to Cloud</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const compressed = await compressImageForCloud(file);
                            await saveSiteMediaToCloud('heroImageUrl', compressed);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Hero Sculpture Selector Bar */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
                    <span className="text-xs text-[#202124]/60 font-medium">
                      Featured Hero View:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {heroShowcases.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setCustomHeroImage('');
                            setHeroShowcaseIndex(idx);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            heroShowcaseIndex === idx && !customHeroImage
                              ? 'bg-[#202124] text-white'
                              : 'bg-[#F8F7F3] text-[#202124]/70 hover:text-[#202124]'
                          }`}
                        >
                          {item.isOriginal ? item.label : 'Gallery Concept'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width 5-Discipline Strip Below Hero Split */}
            <div className="mt-10 sm:mt-14 rounded-3xl bg-white/95 backdrop-blur-md shadow-xs border border-[#202124]/8 px-4 py-6 sm:px-8 sm:py-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#202124]/10">
                {[
                  {
                    title: 'Sculpture',
                    category: 'Sculpture' as ArtworkCategory,
                    svg: (
                      <svg viewBox="0 0 36 36" className="w-7 h-7 stroke-[#B69A68]" fill="none" strokeWidth="1.6">
                        <path d="M18 6c-3.5 0-6 2.8-6 6.2 0 2.4 1.2 4.5 3 5.5v2.3l-5 3v4h16v-4l-5-3v-2.3c1.8-1 3-3.1 3-5.5C24 8.8 21.5 6 18 6z" />
                        <path d="M10 30h16" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Drawing',
                    category: 'Drawing & Sketching' as ArtworkCategory,
                    svg: (
                      <svg viewBox="0 0 36 36" className="w-7 h-7 stroke-[#B69A68]" fill="none" strokeWidth="1.6">
                        <path d="M24.5 6.5l5 5L13 28H8v-5L24.5 6.5z" />
                        <path d="M21 10l5 5" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Painting',
                    category: 'Painting' as ArtworkCategory,
                    svg: (
                      <svg viewBox="0 0 36 36" className="w-7 h-7 stroke-[#B69A68]" fill="none" strokeWidth="1.6">
                        <path d="M18 6C11.4 6 6 10.9 6 17c0 6.1 5.4 11 12 11 2 0 3.5-1.5 3.5-3.3 0-.9-.3-1.7-.9-2.3-.5-.6-.8-1.3-.8-2.1 0-1.8 1.5-3.3 3.3-3.3H25c2.8 0 5-2.2 5-5 0-3.3-5.4-6-12-6z" />
                        <circle cx="12.5" cy="14.5" r="1.2" fill="#B69A68" />
                        <circle cx="17.5" cy="11.5" r="1.2" fill="#B69A68" />
                        <circle cx="22.5" cy="13.5" r="1.2" fill="#B69A68" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Digital Sculpting',
                    category: 'Digital Sculpting' as ArtworkCategory,
                    svg: (
                      <svg viewBox="0 0 36 36" className="w-7 h-7 stroke-[#B69A68]" fill="none" strokeWidth="1.6">
                        <path d="M18 6L7 12v12l11 6 11-6V12L18 6z" />
                        <path d="M7 12l11 6 11-6M18 18v12" />
                      </svg>
                    ),
                  },
                  {
                    title: '3D Art',
                    category: '3D Art' as ArtworkCategory,
                    svg: (
                      <svg viewBox="0 0 36 36" className="w-7 h-7 stroke-[#B69A68]" fill="none" strokeWidth="1.6">
                        <path d="M18 7L6 13l12 6 12-6-12-6z" />
                        <path d="M6 18l12 6 12-6" />
                        <path d="M6 23l12 6 12-6" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleDisciplineShortcut(item.category)}
                    className="flex flex-col items-center justify-center pt-3 sm:pt-0 px-3 text-center group cursor-pointer"
                  >
                    <div className="mb-2.5 transition-transform duration-150 group-hover:-translate-y-0.5">
                      {item.svg}
                    </div>
                    <span className="text-sm font-medium text-[#202124] group-hover:text-[#B69A68] transition-colors whitespace-nowrap">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* C. ABOUT THE ARTIST */}
        <section id="about" className="py-20 sm:py-28 bg-white border-b border-[#202124]/8">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
              {/* Left Column: Artist Portrait Placeholder / Cloud Upload Slot (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="rounded-3xl overflow-hidden border border-[#202124]/10 bg-[#F8F7F3] p-3 h-full flex flex-col">
                  {artistPortraitUrl ? (
                    <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[420px] bg-[#202124]">
                      <img
                        src={artistPortraitUrl}
                        alt="Pravin Kumar Portrait"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => saveSiteMediaToCloud('artistPortraitUrl', '')}
                        className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/90 text-[#202124] text-xs font-medium shadow-sm cursor-pointer"
                      >
                        Reset Portrait
                      </button>
                    </div>
                  ) : (
                    <StudioPlaceholderVisual
                      type="artist-portrait"
                      title="Pravin Kumar — Artist Portrait"
                      replacementPathHint="assets/images/pravin-kumar-portrait.jpg"
                      onImageUpload={(dataUrl) => saveSiteMediaToCloud('artistPortraitUrl', dataUrl)}
                      className="rounded-2xl flex-1 min-h-[420px]"
                    />
                  )}
                </div>
              </div>

              {/* Right Column: Curatorial Biography, Philosophy & Education Summary (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#B69A68] font-semibold mb-3">
                  <span>01. Curatorial Profile</span>
                </div>

                <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#202124] tracking-tight mb-6">
                  {ARTIST_INFO.aboutHeading}
                </h2>

                <p className="text-base sm:text-lg text-[#202124]/85 leading-relaxed mb-8 max-w-2xl">
                  {ARTIST_INFO.aboutBio}
                </p>

                {/* Artistic Philosophy Pull Quote */}
                <blockquote className="my-4 py-6 border-y border-[#202124]/12">
                  <p className="font-display italic text-xl sm:text-2xl text-[#202124] leading-snug">
                    “{ARTIST_INFO.philosophyQuote}”
                  </p>
                  <footer className="mt-2 text-xs uppercase tracking-widest text-[#7C9185] font-medium">
                    Artistic Philosophy · Traditional Clay &amp; Digital Form
                  </footer>
                </blockquote>

                {/* Structured Details Grid */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8">
                    <span className="text-xs uppercase tracking-widest text-[#7C9185] font-semibold block mb-2">
                      Academic Training
                    </span>
                    <h3 className="font-display text-xl font-semibold text-[#202124]">
                      {ARTIST_INFO.education.degree} — {ARTIST_INFO.education.specialization}
                    </h3>
                    <p className="text-sm font-medium text-[#202124]/85 mt-1">
                      {ARTIST_INFO.education.collegeTamil}
                    </p>
                    <p className="text-xs text-[#202124]/65 mt-1">
                      {ARTIST_INFO.education.university} · Class of {ARTIST_INFO.education.graduationYear}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8">
                    <span className="text-xs uppercase tracking-widest text-[#B69A68] font-semibold block mb-2">
                      Studio Practice &amp; Base
                    </span>
                    <h3 className="font-display text-xl font-semibold text-[#202124]">
                      Traditional &amp; 3D Digital Sculpting
                    </h3>
                    <p className="text-sm text-[#202124]/80 mt-1">
                      Bridging classical South Indian sculptural form with ZBrush high-resolution digital modelling.
                    </p>
                    <p className="text-xs text-[#202124]/65 mt-2">
                      Based in {ARTIST_INFO.contact.locationShort}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* D. SELECTED ARTWORKS GALLERY */}
        <section id="artworks" className="py-20 sm:py-28 bg-[#F8F7F3] border-b border-[#202124]/8">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#B69A68] font-semibold block mb-2">
                  02. Portfolio Archive (Cloud Synced)
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#202124] tracking-tight">
                  SELECTED ARTWORKS
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#admin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#202124] hover:bg-[#202124]/90 text-white text-xs font-medium transition-colors whitespace-nowrap"
                >
                  <span>Open Admin Cloud Studio</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowAddArtworkForm((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B69A68]" />
                  <span>{showAddArtworkForm ? 'Close Quick Upload' : 'Quick Cloud Upload'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Quick Cloud Upload Form */}
            {showAddArtworkForm && (
              <form
                onSubmit={handleAddCustomArtwork}
                className="mb-10 p-6 sm:p-8 rounded-3xl bg-white border border-[#202124]/12 shadow-sm"
              >
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#202124]/10">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-[#202124]">
                      Upload Artwork Directly to Cloud Gallery
                    </h3>
                    <p className="text-xs text-[#202124]/65">
                      Uploaded images are compressed and saved in Firebase Cloud Firestore so they remain permanently available.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Artwork Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newArtworkTitle}
                      onChange={(e) => setNewArtworkTitle(e.target.value)}
                      placeholder="e.g., Chola Bronze Torso Study"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm focus:outline-none focus:border-[#B69A68]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={newArtworkCategory}
                      onChange={(e) =>
                        setNewArtworkCategory(e.target.value as Exclude<ArtworkCategory, 'All'>)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm focus:outline-none focus:border-[#B69A68]"
                    >
                      {GALLERY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Medium &amp; Year
                    </label>
                    <input
                      type="text"
                      value={newArtworkMedium}
                      onChange={(e) => setNewArtworkMedium(e.target.value)}
                      placeholder="e.g., Clay Modelling · 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm focus:outline-none focus:border-[#B69A68]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newArtworkDescription}
                      onChange={(e) => setNewArtworkDescription(e.target.value)}
                      placeholder="Brief notes on form, proportion, and technique..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm focus:outline-none focus:border-[#B69A68]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Upload Artwork Image *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setNewArtworkImageFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-[#202124]/70 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#202124] file:text-white hover:file:bg-[#202124]/90"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddArtworkForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#202124]/70 hover:bg-[#F1F2F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#202124] text-white text-xs font-medium hover:bg-[#202124]/90 cursor-pointer"
                  >
                    Upload &amp; Save to Cloud
                  </button>
                </div>
              </form>
            )}

            {/* Interactive Category Filter Bar */}
            <div
              role="tablist"
              aria-label="Filter artworks by category"
              className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-[#202124]/8 overflow-x-auto mb-10"
            >
              {GALLERY_CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#202124] text-white shadow-xs'
                        : 'text-[#202124]/70 hover:text-[#202124] hover:bg-[#F8F7F3]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Masonry-Style Curatorial Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredArtworks.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setLightboxArtworkId(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightboxArtworkId(item.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Inspect ${item.title} in full resolution`}
                  className="group rounded-3xl bg-white border border-[#202124]/8 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B69A68]"
                >
                  {/* Visual Media Container */}
                  <div className="relative aspect-[4/4.5] w-full bg-[#202124] overflow-hidden">
                    {item.imageUrl && !item.isPlaceholder ? (
                      <>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-5 text-white">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                            <Eye className="w-4 h-4 text-[#B69A68]" />
                            <span>Open Lightbox Study</span>
                          </span>
                          {item.companionImageUrl && (
                            <span className="text-[11px] font-mono-tabular text-white/85">
                              + Rear Angle Included
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <StudioPlaceholderVisual
                        type={item.placeholderType}
                        title={item.title}
                        replacementPathHint={item.replacementPathHint}
                        onImageUpload={(dataUrl) => handleUpdateArtworkImage(item.id, dataUrl)}
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  {/* Card Caption Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#202124]/55 font-mono-tabular mb-2">
                        <span>{item.catalogueNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.categories.join(' / ')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.year}</span>
                      </div>

                      <h3 className="font-display text-2xl font-semibold text-[#202124] group-hover:text-[#B69A68] transition-colors leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#202124]/70 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#202124]/8 flex items-center justify-between text-xs text-[#202124]/65">
                      <span className="truncate">{item.medium}</span>
                      <span className="font-medium text-[#202124] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                        Inspect &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* E. SCULPTURE SHOWCASE SECTION */}
        <section id="sculpture" className="py-20 sm:py-28 bg-white border-b border-[#202124]/8">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs uppercase tracking-[0.2em] text-[#B69A68] font-semibold block mb-2">
                03. Primary Discipline
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#202124] tracking-tight mb-4">
                SCULPTURE &amp; MATERIAL FORM
              </h2>
              <p className="text-base text-[#202124]/75 leading-relaxed">
                Trained in the classical sculptural environment of Kumbakonam, Pravin Kumar approaches three-dimensional form through traditional clay modelling, structural armature balance, and tactile surface study.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              {/* Left 5 Pillars Interactive List (6 cols) */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                {SCULPTURE_PILLARS.map((pillar, idx) => {
                  const isSelected = selectedSculpturePillar === idx;
                  return (
                    <button
                      key={pillar.index}
                      type="button"
                      onClick={() => setSelectedSculpturePillar(idx)}
                      className={`w-full text-left p-5 sm:p-6 rounded-2xl transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#F8F7F3] border-[#B69A68] shadow-xs'
                          : 'bg-white border-[#202124]/10 hover:bg-[#F8F7F3]/60'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-4 mb-1.5">
                        <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#202124]">
                          {pillar.index}. {pillar.title}
                        </h3>
                        <span className="text-xs text-[#B69A68] font-medium shrink-0">
                          {pillar.subtitle}
                        </span>
                      </div>
                      <p className="text-sm text-[#202124]/75 leading-relaxed mb-3">
                        {pillar.description}
                      </p>
                      <div className="text-xs text-[#202124]/55 font-mono-tabular">
                        {pillar.materials}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Visual Presentation Card (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="rounded-3xl bg-[#F8F7F3] border border-[#202124]/10 p-4 sm:p-6 h-full flex flex-col justify-between">
                  <div className="relative rounded-2xl overflow-hidden bg-[#202124] flex-1 min-h-[420px] flex items-center justify-center">
                    {sculptureStudioImage ? (
                      <img
                        src={sculptureStudioImage}
                        alt="Traditional Sculpture Studio Study"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM_fe1d4107.jpeg"
                        alt="Seated Four-Armed Deity Clay Form Study by Pravin Kumar"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-4"
                      />
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#B69A68] font-semibold block">
                        Active Focus: {SCULPTURE_PILLARS[selectedSculpturePillar].title}
                      </span>
                      <p className="text-xs text-[#202124]/70 mt-0.5">
                        Showing Pravin Kumar’s Clay Form &amp; Relief Study. Upload a studio clay photo to cloud:
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 cursor-pointer transition-colors whitespace-nowrap">
                      <span>Upload Studio Photo to Cloud</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const compressed = await compressImageForCloud(file);
                          await saveSiteMediaToCloud('sculptureStudioUrl', compressed);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* F. DIGITAL ART – ZBRUSH SECTION */}
        <section id="digital-art" className="py-20 sm:py-28 bg-[#F8F7F3] border-b border-[#202124]/8">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#7C9185] font-semibold block mb-2">
                  04. ZBrush Digital Sculpting
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#202124] tracking-tight">
                  FROM IMAGINATION TO DIGITAL FORM
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#202124]/75 max-w-xl leading-relaxed">
                Combining traditional sculptural anatomy with ZBrush digital clay—developing intricate multi-armed deities, ceremonial arches, and high-resolution surface reliefs from 360-degree perspectives.
              </p>
            </div>

            {/* Interactive ZBrush Turnaround & Render Showcase */}
            <div className="rounded-3xl bg-white border border-[#202124]/10 p-5 sm:p-8 shadow-xs mb-12">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#202124]/10">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveZBrushStudy('murugan');
                      setZbrushViewAngle('front');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activeZBrushStudy === 'murugan'
                        ? 'bg-[#202124] text-white'
                        : 'bg-[#F8F7F3] text-[#202124]/75 hover:text-[#202124]'
                    }`}
                  >
                    Study 01 · Seated Deity with Vel (Front &amp; Rear)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveZBrushStudy('rama');
                      setZbrushViewAngle('front');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activeZBrushStudy === 'rama'
                        ? 'bg-[#202124] text-white'
                        : 'bg-[#F8F7F3] text-[#202124]/75 hover:text-[#202124]'
                    }`}
                  >
                    Study 02 · Standing Kodanda Rama (Front &amp; Rear)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveZBrushStudy('ganesha');
                      setZbrushViewAngle('front');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activeZBrushStudy === 'ganesha'
                        ? 'bg-[#202124] text-white'
                        : 'bg-[#F8F7F3] text-[#202124]/75 hover:text-[#202124]'
                    }`}
                  >
                    Study 03 · Venugopala Ganapati with Peacock
                  </button>
                </div>

                {activeZBrushStudy !== 'ganesha' && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8F7F3] border border-[#202124]/10">
                    <button
                      type="button"
                      onClick={() => setZbrushViewAngle('front')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        zbrushViewAngle === 'front'
                          ? 'bg-white text-[#202124] shadow-2xs'
                          : 'text-[#202124]/65 hover:text-[#202124]'
                      }`}
                    >
                      Front Render View
                    </button>
                    <button
                      type="button"
                      onClick={() => setZbrushViewAngle('rear')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        zbrushViewAngle === 'rear'
                          ? 'bg-white text-[#202124] shadow-2xs'
                          : 'text-[#202124]/65 hover:text-[#202124]'
                      }`}
                    >
                      Rear ZBrush Viewport
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 rounded-2xl bg-[#202124] overflow-hidden min-h-[420px] sm:min-h-[520px] flex items-center justify-center p-4 relative">
                  {activeZBrushStudy === 'murugan' && (
                    <img
                      src={
                        zbrushViewAngle === 'front'
                          ? 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM_fe1d4107.jpeg'
                          : 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.20_AM_23864509.jpeg'
                      }
                      alt="ZBrush Seated Deity Sculpture by Pravin Kumar"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="max-h-[500px] w-auto object-contain rounded-lg"
                    />
                  )}

                  {activeZBrushStudy === 'rama' && (
                    <img
                      src={
                        zbrushViewAngle === 'front'
                          ? 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM__1__5afcf882.jpeg'
                          : 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.20_AM__1__464a7b1e.jpeg'
                      }
                      alt="ZBrush Standing Kodanda Rama Sculpture by Pravin Kumar"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="max-h-[500px] w-auto object-contain rounded-lg"
                    />
                  )}

                  {activeZBrushStudy === 'ganesha' && (
                    <img
                      src="assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.22_AM_574544c0.jpeg"
                      alt="ZBrush Venugopala Ganapati Sculpture by Pravin Kumar"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="max-h-[500px] w-auto object-contain rounded-lg"
                    />
                  )}

                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-md text-white text-xs font-mono-tabular border border-white/10">
                    ZBrush Original Work · Pravin Kumar
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <span className="text-xs font-mono-tabular uppercase tracking-widest text-[#B69A68] block mb-1">
                      {activeZBrushStudy === 'murugan'
                        ? 'Digital Clay & Relief Study · 01'
                        : activeZBrushStudy === 'rama'
                        ? 'Contrapposto & Drapery Study · 02'
                        : 'Ornate Arch & Lotus Base Study · 03'}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#202124]">
                      {activeZBrushStudy === 'murugan'
                        ? 'Four-Armed Seated Deity on Carved Throne'
                        : activeZBrushStudy === 'rama'
                        ? 'Standing Kodanda Rama on Lotus Pitham'
                        : 'Flute-Playing Ganesha with Peacock & Prabhavali'}
                    </h3>
                    <p className="text-sm text-[#202124]/75 leading-relaxed mt-3">
                      {activeZBrushStudy === 'murugan'
                        ? 'Sculpted in ZBrush using ZAdd, Polish, and custom ornamental strokes. Features symmetrical upper arms holding conch and vajra, lower hand in Abhaya Mudra with the sacred Vel, and deep scrollwork relief along the pedestal.'
                        : activeZBrushStudy === 'rama'
                        ? 'Examines classical standing poise, subtle torso torsion, layered necklaces (Haras), Simhamukha waist clasp, and rear dhoti pleat geometry.'
                        : 'Demonstrates multi-subtool composition combining the central deity, finely textured peacock feathers, mushika (mouse) with modaka at the feet, and an overarching Kirtimukha Prabhavali frame.'}
                    </p>
                  </div>

                  {activeZBrushStudy !== 'ganesha' && (
                    <div className="p-4 rounded-2xl bg-[#F8F7F3] border border-[#202124]/10 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-[#202124]">
                          360° Front &amp; Rear Verification
                        </p>
                        <p className="text-xs text-[#202124]/65 mt-0.5">
                          Toggle between the studio render and the rear ZBrush sculpting viewport.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setZbrushViewAngle((prev) => (prev === 'front' ? 'rear' : 'front'))
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#202124] text-white text-xs font-medium cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#B69A68]" />
                        <span>Flip to {zbrushViewAngle === 'front' ? 'Rear' : 'Front'}</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 pt-2 border-t border-[#202124]/10">
                    {ZBRUSH_PILLARS.map((pillar) => (
                      <div key={pillar.index} className="flex items-start justify-between gap-4 text-xs">
                        <div>
                          <span className="font-mono-tabular text-[#B69A68] font-medium mr-2">
                            {pillar.index}.
                          </span>
                          <span className="font-semibold text-[#202124]">{pillar.title}: </span>
                          <span className="text-[#202124]/70">{pillar.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* G. SKILLS & H. EDUCATION SECTION */}
        <section id="skills" className="py-20 sm:py-28 bg-white border-b border-[#202124]/8">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs uppercase tracking-[0.2em] text-[#B69A68] font-semibold block mb-2">
                05. Capabilities &amp; Academic Lineage
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#202124] tracking-tight mb-4">
                ARTISTIC &amp; DIGITAL SKILLS
              </h2>
              <p className="text-base text-[#202124]/75 leading-relaxed">
                A balanced foundation in classical studio fine arts and contemporary 3D digital sculpting—presented through medium focus rather than arbitrary percentage bars.
              </p>
            </div>

            {/* Artistic Skills Group */}
            <div className="mb-12">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#202124]/10">
                <h3 className="font-display text-2xl font-semibold text-[#202124]">
                  Artistic &amp; Traditional Studio Skills
                </h3>
                <span className="text-xs text-[#202124]/60 font-mono-tabular">
                  5 Core Disciplines
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SKILLS_LIST.filter((s) => s.category === 'Artistic Skills').map((skill, idx) => (
                  <div
                    key={skill.name}
                    className="p-6 sm:p-7 rounded-2xl bg-[#F8F7F3] border border-[#202124]/8 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#B69A68] font-mono-tabular mb-3">
                        <span>0{idx + 1}</span>
                        <span>{skill.focus}</span>
                      </div>
                      <h4 className="font-display text-2xl font-semibold text-[#202124] mb-2">
                        {skill.name}
                      </h4>
                      <p className="text-sm text-[#202124]/75 leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#202124]/8 text-xs text-[#202124]/60">
                      {skill.mediumsOrTools}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Skills Group */}
            <div className="mb-20">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#202124]/10">
                <h3 className="font-display text-2xl font-semibold text-[#202124]">
                  Digital Sculpting &amp; 3D Craft
                </h3>
                <span className="text-xs text-[#7C9185] font-mono-tabular">
                  ZBrush &amp; 3D Pipeline
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SKILLS_LIST.filter((s) => s.category === 'Digital Skills').map((skill, idx) => (
                  <div
                    key={skill.name}
                    className="p-6 sm:p-8 rounded-2xl bg-[#202124] text-[#F8F7F3] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#B69A68] font-mono-tabular mb-3">
                        <span>0{idx + 1} · DIGITAL FORM</span>
                        <span>{skill.focus}</span>
                      </div>
                      <h4 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-2">
                        {skill.name}
                      </h4>
                      <p className="text-sm text-[#F8F7F3]/80 leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10 text-xs text-[#B69A68] font-mono-tabular">
                      {skill.mediumsOrTools}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* H. EDUCATION TIMELINE */}
            <div id="education" className="pt-8 border-t border-[#202124]/10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#7C9185] font-semibold block mb-2">
                    06. Academic Credentials
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl font-normal text-[#202124]">
                    EDUCATION
                  </h3>
                  <p className="text-sm text-[#202124]/70 mt-2 leading-relaxed">
                    Formal four-year fine arts training in one of South India’s historic centers of sculpture and temple craft.
                  </p>
                </div>

                <div className="lg:col-span-8">
                  <div className="relative pl-6 sm:pl-8 border-l border-[#B69A68]">
                    <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F7F3] border border-[#202124]/8">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="font-mono-tabular text-xs font-semibold uppercase tracking-widest text-[#B69A68]">
                          Graduation · {ARTIST_INFO.education.graduationYear}
                        </span>
                        <span className="text-xs text-[#202124]/60">
                          Specialization: {ARTIST_INFO.education.specialization}
                        </span>
                      </div>

                      <h4 className="font-display text-2xl sm:text-3xl font-semibold text-[#202124]">
                        {ARTIST_INFO.education.degree}, {ARTIST_INFO.education.specialization}
                      </h4>

                      <div className="mt-4 space-y-1.5 text-sm">
                        <p className="font-semibold text-[#202124]">
                          College: <span className="font-normal">{ARTIST_INFO.education.collegeTamil}</span>
                        </p>
                        <p className="text-[#202124]/75 text-xs">
                          ({ARTIST_INFO.education.collegeEnglish})
                        </p>
                        <p className="font-semibold text-[#202124] pt-1">
                          University:{' '}
                          <span className="font-normal">{ARTIST_INFO.education.university}</span>
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#202124]/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#202124]/65">
                        <BookOpen className="w-3.5 h-3.5 text-[#B69A68]" />
                        <span>Sculpture Studio Practice</span>
                        <span aria-hidden="true">·</span>
                        <span>Traditional Iconography &amp; Relief</span>
                        <span aria-hidden="true">·</span>
                        <span>Life Study &amp; Drawing</span>
                        <span aria-hidden="true">·</span>
                        <span>3D Digital Sculpting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* I. CONTACT SECTION */}
        <section id="contact" className="py-20 sm:py-28 bg-[#F8F7F3]">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#B69A68] font-semibold block mb-2">
                    07. Commissions &amp; Collaborations
                  </span>
                  <h2
                    className="font-display text-3xl sm:text-5xl font-normal text-[#202124] tracking-tight leading-tight mb-4"
                    style={{ textWrap: 'balance' }}
                  >
                    LET&apos;S CREATE SOMETHING MEANINGFUL.
                  </h2>
                  <p className="text-base text-[#202124]/75 leading-relaxed mb-8 max-w-lg">
                    Available for traditional sculpture commissions, 3D digital sculpting projects in ZBrush, character/deity modelling, and gallery collaborations.
                  </p>

                  <div className="space-y-5 p-6 sm:p-8 rounded-3xl bg-white border border-[#202124]/8 mb-8">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-[#202124]/50 block">
                        Artist
                      </span>
                      <p className="font-display text-2xl font-semibold text-[#202124]">
                        {ARTIST_INFO.name}
                      </p>
                      <p className="text-xs text-[#B69A68] font-medium">
                        {ARTIST_INFO.professionalTitle}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#202124]/8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <a
                        href={ARTIST_INFO.contact.phoneHref}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8F7F3] transition-colors"
                      >
                        <Phone className="w-4 h-4 text-[#B69A68] mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-[#202124]/50 block">
                            Phone
                          </span>
                          <span className="text-sm font-medium text-[#202124] group-hover:text-[#B69A68] transition-colors font-mono-tabular">
                            {ARTIST_INFO.contact.phone}
                          </span>
                        </div>
                      </a>

                      <a
                        href={ARTIST_INFO.contact.emailHref}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8F7F3] transition-colors"
                      >
                        <Mail className="w-4 h-4 text-[#B69A68] mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[11px] uppercase tracking-wider text-[#202124]/50 block">
                            Email
                          </span>
                          <span className="text-sm font-medium text-[#202124] group-hover:text-[#B69A68] transition-colors break-all">
                            {ARTIST_INFO.contact.email}
                          </span>
                        </div>
                      </a>
                    </div>

                    <div className="pt-4 border-t border-[#202124]/8 flex items-start gap-3 px-3">
                      <MapPin className="w-4 h-4 text-[#7C9185] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#202124]/50 block">
                          Location
                        </span>
                        <p className="text-sm text-[#202124]/85">
                          {ARTIST_INFO.contact.locationFull}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={ARTIST_INFO.contact.emailHref}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#202124] hover:bg-[#202124]/90 text-white text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact via Email</span>
                  </a>
                  <a
                    href={ARTIST_INFO.contact.phoneHref}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#B69A68]" />
                    <span>Call Now</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setResumeModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7C9185]" />
                    <span>Download Resume</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#202124]/8 shadow-xs">
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#202124] mb-1">
                    Send an Inquiry
                  </h3>
                  <p className="text-xs text-[#202124]/65 mb-6">
                    Fill out your details below. Validating your message prepares a direct email in your mail client.
                  </p>

                  {formError && (
                    <div
                      role="alert"
                      className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSubmitted ? (
                    <div className="p-6 rounded-2xl bg-[#F8F7F3] border border-[#7C9185]/40 space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#7C9185] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-[#202124]">
                            Inquiry Validated &amp; Ready to Send
                          </h4>
                          <p className="text-xs text-[#202124]/75 mt-1 leading-relaxed">
                            Click below to launch your email client pre-addressed to{' '}
                            <strong>{ARTIST_INFO.contact.email}</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={triggerMailtoFromForm}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202124] text-white text-xs font-medium hover:bg-[#202124]/90 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Open in Email App to Send</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormSubmitted(false);
                            setContactName('');
                            setContactEmail('');
                            setContactSubject('');
                            setContactMessage('');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white text-[#202124] text-xs font-medium border border-[#202124]/15 hover:bg-[#F1F2F2] cursor-pointer"
                        >
                          Write Another Message
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-medium text-[#202124]/80 mb-1.5"
                        >
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm text-[#202124] focus:outline-none focus:border-[#B69A68]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-medium text-[#202124]/80 mb-1.5"
                        >
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm text-[#202124] focus:outline-none focus:border-[#B69A68]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-subject"
                          className="block text-xs font-medium text-[#202124]/80 mb-1.5"
                        >
                          Subject / Inquiry Type
                        </label>
                        <input
                          id="contact-subject"
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="Sculpture Commission, ZBrush 3D Modelling, Exhibition..."
                          className="w-full px-4 py-3 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm text-[#202124] focus:outline-none focus:border-[#B69A68]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-message"
                          className="block text-xs font-medium text-[#202124]/80 mb-1.5"
                        >
                          Message *
                        </label>
                        <textarea
                          id="contact-message"
                          rows={4}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Describe your project, timeline, or sculptural inquiry..."
                          className="w-full px-4 py-3 rounded-xl bg-[#F8F7F3] border border-[#202124]/15 text-sm text-[#202124] focus:outline-none focus:border-[#B69A68] resize-y"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-6 rounded-xl bg-[#202124] hover:bg-[#202124]/90 text-white text-sm font-medium transition-colors cursor-pointer"
                      >
                        Validate &amp; Prepare Email
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ADMIN STUDIO TAB SECTION (Credential Login + Cloud Image Storage) */}
        <AdminStudioSection
          artworks={artworks}
          firebaseUser={firebaseUser}
          onSaveArtworkToCloud={saveArtworkToCloud}
          onDeleteArtworkFromCloud={deleteArtworkFromCloud}
          onSaveSiteMediaToCloud={saveSiteMediaToCloud}
          heroImageUrl={customHeroImage}
          artistPortraitUrl={artistPortraitUrl}
          sculptureStudioUrl={sculptureStudioImage}
        />
      </main>

      {/* J. FOOTER */}
      <footer className="bg-white border-t border-[#202124]/10 py-14 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#202124]/8">
            <div>
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202124] block">
                PRAVIN KUMAR
              </span>
              <p className="text-xs uppercase tracking-widest text-[#B69A68] font-medium mt-1">
                Sculptor | Fine Artist | Digital Artist
              </p>
              <p className="font-display italic text-lg text-[#202124]/75 mt-2">
                “{ARTIST_INFO.footerQuote}”
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setGithubModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F7F3] hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/12 transition-colors cursor-pointer whitespace-nowrap"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-[#B69A68]" />
                <span>GitHub Pages &amp; Image Guide</span>
              </button>
              <button
                type="button"
                onClick={() => setResumeModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F7F3] hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/12 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#7C9185]" />
                <span>Curriculum Vitae</span>
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#202124]/60">
            <p>
              &copy; {new Date().getFullYear()} Pravin Kumar. All rights reserved. BFA Sculpture · கவின் கலைக் கல்லூரி, கும்பகோணம்.
            </p>
            <div className="flex items-center gap-5">
              <a href="#home" className="hover:text-[#202124] transition-colors">
                Home
              </a>
              <a href="#artworks" className="hover:text-[#202124] transition-colors">
                Artworks
              </a>
              <a href="#digital-art" className="hover:text-[#202124] transition-colors">
                ZBrush
              </a>
              <a href="#admin" className="hover:text-[#202124] transition-colors">
                Admin Studio
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Floating Control */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-[#202124] hover:bg-[#B69A68] text-white shadow-lg transition-colors cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Lightbox Modal */}
      <ArtworkLightbox
        artwork={currentLightboxArtwork}
        onClose={() => setLightboxArtworkId(null)}
        onPrev={handlePrevLightbox}
        onNext={handleNextLightbox}
        onUpdateArtworkImage={handleUpdateArtworkImage}
      />

      {/* Printable / Downloadable Resume Modal */}
      <ResumeModal isOpen={resumeModalOpen} onClose={() => setResumeModalOpen(false)} />

      {/* GitHub Pages & Image Replacement Guide Modal */}
      <GitHubGuideModal isOpen={githubModalOpen} onClose={() => setGithubModalOpen(false)} />
    </div>
  );
}
