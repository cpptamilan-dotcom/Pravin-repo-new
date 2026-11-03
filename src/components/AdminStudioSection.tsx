import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Upload,
  Cloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  ArtworkCategory,
  ArtworkItem,
  GALLERY_CATEGORIES,
} from '../data/portfolioData';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  compressImageForCloud,
} from '../firebase';

interface AdminStudioSectionProps {
  artworks: ArtworkItem[];
  firebaseUser: User | null;
  onSaveArtworkToCloud: (artwork: ArtworkItem) => Promise<void>;
  onDeleteArtworkFromCloud: (artworkId: string) => Promise<void>;
  onSaveSiteMediaToCloud: (field: 'heroImageUrl' | 'artistPortraitUrl' | 'sculptureStudioUrl', dataUrl: string) => Promise<void>;
  heroImageUrl: string;
  artistPortraitUrl: string;
  sculptureStudioUrl: string;
}

export const AdminStudioSection: React.FC<AdminStudioSectionProps> = ({
  artworks,
  firebaseUser,
  onSaveArtworkToCloud,
  onDeleteArtworkFromCloud,
  onSaveSiteMediaToCloud,
  heroImageUrl,
  artistPortraitUrl,
  sculptureStudioUrl,
}) => {
  // Credential login state (persisted in sessionStorage for smooth admin usage)
  const [isCredentialUnlocked, setIsCredentialUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('pk_admin_unlocked') === 'true';
  });

  // Custom admin credentials (can be updated by admin in browser)
  const [savedAdminId, setSavedAdminId] = useState<string>(() => {
    return localStorage.getItem('pk_admin_id') || 'pravin';
  });
  const [savedAdminPass, setSavedAdminPass] = useState<string>(() => {
    return localStorage.getItem('pk_admin_pass') || 'pravin2026';
  });

  const [inputAdminId, setInputAdminId] = useState('');
  const [inputAdminPass, setInputAdminPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Credential update state
  const [showChangeCreds, setShowChangeCreds] = useState(false);
  const [newAdminId, setNewAdminId] = useState(savedAdminId);
  const [newAdminPass, setNewAdminPass] = useState('');

  // Cloud Upload Form State
  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ArtworkCategory, 'All'>>('Sculpture');
  const [medium, setMedium] = useState('');
  const [year, setYear] = useState('2026');
  const [aspectRatio, setAspectRatio] = useState<'portrait' | 'square' | 'landscape'>('portrait');
  const [description, setDescription] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [companionFile, setCompanionFile] = useState<File | null>(null);

  // Status feedback
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isAdminAuthenticated =
    isCredentialUnlocked ||
    (firebaseUser?.emailVerified &&
      (firebaseUser.email === 'vigneshsl.career@gmail.com' ||
        firebaseUser.email === 'bpppravin934589@gmail.com'));

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const trimmedId = inputAdminId.trim().toLowerCase();
    const trimmedPass = inputAdminPass.trim();

    if (
      (trimmedId === savedAdminId.toLowerCase() ||
        trimmedId === 'bpppravin934589@gmail.com' ||
        trimmedId === 'vigneshsl.career@gmail.com') &&
      trimmedPass === savedAdminPass
    ) {
      sessionStorage.setItem('pk_admin_unlocked', 'true');
      setIsCredentialUnlocked(true);
      setInputAdminPass('');
    } else {
      setAuthError('Invalid admin username/email or password. Please verify your credentials.');
    }
  };

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      sessionStorage.setItem('pk_admin_unlocked', 'true');
      setIsCredentialUnlocked(true);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Google Sign-In failed. Use the Admin Credential form instead.'
      );
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('pk_admin_unlocked');
    setIsCredentialUnlocked(false);
    if (firebaseUser) {
      await signOut(auth);
    }
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminId.trim() || newAdminPass.trim().length < 4) {
      setStatusMessage({
        type: 'error',
        text: 'Admin ID is required and password must be at least 4 characters.',
      });
      return;
    }
    localStorage.setItem('pk_admin_id', newAdminId.trim());
    localStorage.setItem('pk_admin_pass', newAdminPass.trim());
    setSavedAdminId(newAdminId.trim());
    setSavedAdminPass(newAdminPass.trim());
    setNewAdminPass('');
    setShowChangeCreds(false);
    setStatusMessage({
      type: 'success',
      text: `Admin credentials updated for user "${newAdminId.trim()}".`,
    });
  };

  const handleUploadNewArtworkToCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !primaryFile) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide an artwork title and select an image file to upload to the cloud.',
      });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const compressedPrimary = await compressImageForCloud(primaryFile);
      const compressedCompanion = companionFile
        ? await compressImageForCloud(companionFile)
        : undefined;

      const cleanId = `cloud-art-${Date.now()}`;
      const newArtwork: ArtworkItem = {
        id: cleanId,
        catalogueNumber: `CAT. ${String(artworks.length + 1).padStart(2, '0')}`,
        title: title.trim().slice(0, 200),
        tamilTitle: tamilTitle.trim() ? tamilTitle.trim().slice(0, 200) : undefined,
        categories: [category],
        medium: (medium.trim() || `${category} · Studio Work`).slice(0, 200),
        year: (year.trim() || '2026').slice(0, 16),
        description: (
          description.trim() || `Original ${category.toLowerCase()} artwork by Pravin Kumar.`
        ).slice(0, 2000),
        technicalNotes: (
          technicalNotes.trim() || 'Uploaded & persisted in Firebase Cloud Storage.'
        ).slice(0, 2000),
        imageUrl: compressedPrimary,
        companionImageUrl: compressedCompanion,
        companionLabel: compressedCompanion ? 'Switch Angle View' : undefined,
        aspectRatio,
        isPlaceholder: false,
        replacementPathHint: `assets/images/${cleanId}.webp`,
      };

      await onSaveArtworkToCloud(newArtwork);

      setTitle('');
      setTamilTitle('');
      setMedium('');
      setDescription('');
      setTechnicalNotes('');
      setPrimaryFile(null);
      setCompanionFile(null);

      setStatusMessage({
        type: 'success',
        text: `"${newArtwork.title}" has been compressed and saved to the Cloud Database.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload artwork to cloud.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceExistingSlotInCloud = async (artwork: ArtworkItem, file: File) => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const compressedDataUrl = await compressImageForCloud(file);
      const updatedArtwork: ArtworkItem = {
        ...artwork,
        imageUrl: compressedDataUrl,
        isPlaceholder: false,
      };
      await onSaveArtworkToCloud(updatedArtwork);
      setStatusMessage({
        type: 'success',
        text: `Updated cloud image for "${artwork.title}".`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update slot in cloud.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSiteMediaUpload = async (
    field: 'heroImageUrl' | 'artistPortraitUrl' | 'sculptureStudioUrl',
    label: string,
    file: File
  ) => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const compressed = await compressImageForCloud(file);
      await onSaveSiteMediaToCloud(field, compressed);
      setStatusMessage({
        type: 'success',
        text: `${label} uploaded and synced to the Cloud Database.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : `Failed to upload ${label}.`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section id="admin" className="py-20 sm:py-28 bg-white border-t border-[#202124]/10">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#B69A68] font-semibold block mb-2">
              08. Cloud Studio Management &amp; GitHub Sync
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-normal text-[#202124] tracking-tight">
              ADMIN STUDIO PORTAL
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/cpptamilan-dotcom/Pravin-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F7F3] hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/12 transition-colors whitespace-nowrap"
            >
              <span>GitHub: cpptamilan-dotcom/Pravin-repo</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B69A68]" />
            </a>

            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202124] text-white text-xs font-medium hover:bg-[#202124]/90 cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Admin Session</span>
              </button>
            )}
          </div>
        </div>

        {!isAdminAuthenticated ? (
          /* ADMIN CREDENTIAL LOGIN CARD */
          <div className="max-w-xl mx-auto rounded-3xl bg-[#F8F7F3] border border-[#202124]/10 p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#202124] text-[#B69A68]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#202124]">
                  Admin Access Authentication
                </h3>
                <p className="text-xs text-[#202124]/65">
                  Sign in with your Admin Credentials or Google Admin account to upload &amp; manage cloud images.
                </p>
              </div>
            </div>

            {authError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                  Admin Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={inputAdminId}
                  onChange={(e) => setInputAdminId(e.target.value)}
                  placeholder="pravin or bpppravin934589@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#202124]/15 text-sm text-[#202124] focus:outline-none focus:border-[#B69A68]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                  Admin Password / Passcode
                </label>
                <input
                  type="password"
                  required
                  value={inputAdminPass}
                  onChange={(e) => setInputAdminPass(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#202124]/15 text-sm text-[#202124] focus:outline-none focus:border-[#B69A68]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 border border-[#202124]/8 text-xs text-[#202124]/70 flex items-center justify-between">
                <span>
                  Default Admin ID: <strong className="font-mono-tabular">{savedAdminId}</strong> · Passcode:{' '}
                  <strong className="font-mono-tabular">pravin2026</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setInputAdminId(savedAdminId);
                    setInputAdminPass(savedAdminPass);
                  }}
                  className="text-[#B69A68] font-semibold hover:underline cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#202124] hover:bg-[#202124]/90 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Unlock Admin Cloud Studio
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-[#202124]/45">
              <div className="flex-1 h-px bg-[#202124]/10" />
              <span>OR</span>
              <div className="flex-1 h-px bg-[#202124]/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              className="w-full py-3 px-6 rounded-xl bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 transition-colors cursor-pointer"
            >
              Sign in with Google Admin Account
            </button>
          </div>
        ) : (
          /* UNLOCKED ADMIN CLOUD STUDIO DASHBOARD */
          <div className="space-y-10">
            {/* Status Banner */}
            {statusMessage && (
              <div
                role="status"
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  statusMessage.type === 'success'
                    ? 'bg-[#F8F7F3] border-[#7C9185] text-[#202124]'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#7C9185] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span className="font-medium">{statusMessage.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="text-xs underline opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Top Admin Controls Strip */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#F8F7F3] border border-[#202124]/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#7C9185]/15 text-[#7C9185]">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#202124]">
                    Cloud Storage Connected · Firebase Firestore Live
                  </h3>
                  <p className="text-xs text-[#202124]/65">
                    Every photo uploaded here is automatically compressed, persisted in the cloud, and rendered live across the portfolio.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowChangeCreds((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 cursor-pointer whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#B69A68]" />
                <span>{showChangeCreds ? 'Close Credential Settings' : 'Change Admin Credentials'}</span>
              </button>
            </div>

            {/* GitHub Repository Connection Status Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#202124]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono-tabular uppercase tracking-widest text-[#B69A68] block mb-1">
                  GitHub Repository Configured
                </span>
                <h4 className="font-display text-xl font-semibold text-[#202124]">
                  https://github.com/cpptamilan-dotcom/Pravin-repo
                </h4>
                <p className="text-xs text-[#202124]/70 mt-1">
                  Local Git repository is initialized and committed on branch <code>main</code> with remote <code>origin</code> set to <code>cpptamilan-dotcom/Pravin-repo</code>. Note: Fine-grained PATs require <strong>Repository permissions &rarr; Contents: Read and write</strong> enabled in GitHub Developer Settings to push commits.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href="https://github.com/cpptamilan-dotcom/Pravin-repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#202124] text-white text-xs font-medium hover:bg-[#202124]/90 whitespace-nowrap"
                >
                  <span>Open Pravin-repo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Optional Change Credentials Panel */}
            {showChangeCreds && (
              <form
                onSubmit={handleUpdateCredentials}
                className="p-6 rounded-3xl bg-[#F8F7F3] border border-[#B69A68]/40 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                    New Admin Username / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#202124] text-white text-xs font-medium hover:bg-[#202124]/90 cursor-pointer"
                >
                  Save New Credentials
                </button>
              </form>
            )}

            {/* 1. Global Site Portrait & Hero Cloud Uploaders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  field: 'artistPortraitUrl' as const,
                  title: 'Artist Profile Photograph',
                  subtitle: 'Displayed in "About the Artist"',
                  currentUrl: artistPortraitUrl,
                },
                {
                  field: 'heroImageUrl' as const,
                  title: 'Custom Hero Sculpture Photo',
                  subtitle: 'Displayed in top Hero showcase',
                  currentUrl: heroImageUrl,
                },
                {
                  field: 'sculptureStudioUrl' as const,
                  title: 'Traditional Studio Clay Photo',
                  subtitle: 'Displayed in Sculpture Showcase',
                  currentUrl: sculptureStudioUrl,
                },
              ].map((slot) => (
                <div
                  key={slot.field}
                  className="p-5 rounded-2xl bg-[#F8F7F3] border border-[#202124]/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#B69A68] font-mono-tabular mb-2">
                      <span>CLOUD SITE ASSET</span>
                      <span>{slot.currentUrl ? 'Uploaded' : 'Default'}</span>
                    </div>
                    <h4 className="font-display text-xl font-semibold text-[#202124]">
                      {slot.title}
                    </h4>
                    <p className="text-xs text-[#202124]/65 mt-0.5 mb-4">{slot.subtitle}</p>
                  </div>

                  <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 cursor-pointer transition-colors">
                    <Cloud className="w-3.5 h-3.5 text-[#B69A68]" />
                    <span>{isUploading ? 'Uploading to Cloud...' : 'Upload to Cloud'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleSiteMediaUpload(slot.field, slot.title, file);
                        }
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>

            {/* 2. Upload New Artwork to Cloud Gallery */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F7F3] border border-[#202124]/10">
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-[#202124]/10">
                <Upload className="w-5 h-5 text-[#B69A68]" />
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#202124]">
                    Upload New Artwork to Cloud Gallery
                  </h3>
                  <p className="text-xs text-[#202124]/65">
                    Add a new sculpture, drawing, painting, or ZBrush render directly to Firebase Cloud Firestore.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUploadNewArtworkToCloud} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Artwork Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Traditional Clay Portrait Study"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Tamil Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={tamilTitle}
                      onChange={(e) => setTamilTitle(e.target.value)}
                      placeholder="e.g., களிமண் சிற்ப ஆய்வு"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as Exclude<ArtworkCategory, 'All'>)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    >
                      {GALLERY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Medium &amp; Technique
                    </label>
                    <input
                      type="text"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      placeholder="e.g., Wet Clay on Armature / ZBrush"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Year
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Aspect Ratio Framing
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) =>
                        setAspectRatio(e.target.value as 'portrait' | 'square' | 'landscape')
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    >
                      <option value="portrait">Portrait (4:5)</option>
                      <option value="square">Square (1:1)</option>
                      <option value="landscape">Landscape (4:3)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Curatorial Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the form, inspiration, and sculptural approach..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124]/80 mb-1.5">
                      Technical Notes
                    </label>
                    <textarea
                      rows={2}
                      value={technicalNotes}
                      onChange={(e) => setTechnicalNotes(e.target.value)}
                      placeholder="Optional notes on surface detailing, lighting, or clay tooling..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202124]/15 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-[#202124]/12">
                    <label className="block text-xs font-semibold text-[#202124] mb-1">
                      Primary Artwork Image *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setPrimaryFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-[#202124]/70 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#202124] file:text-white"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#202124]/12">
                    <label className="block text-xs font-semibold text-[#202124] mb-1">
                      Secondary / Rear Angle Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCompanionFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-[#202124]/70 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#F8F7F3] file:text-[#202124]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#202124] hover:bg-[#202124]/90 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Compressing &amp; Saving to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 text-[#B69A68]" />
                        <span>Upload &amp; Publish to Cloud Gallery</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Manage Existing Gallery Artworks & Replace Placeholders in Cloud */}
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#202124] mb-4">
                Manage Gallery Slots ({artworks.length} Items)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {artworks.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#F8F7F3] border border-[#202124]/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] rounded-xl bg-[#202124] overflow-hidden mb-3 flex items-center justify-center">
                        {item.imageUrl && !item.isPlaceholder ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-3 text-white/70 text-xs">
                            <ImageIcon className="w-5 h-5 mx-auto mb-1 text-[#B69A68]" />
                            <span>Placeholder Slot</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-mono-tabular text-[#B69A68]">
                        {item.catalogueNumber} · {item.categories.join(', ')}
                      </span>
                      <h4 className="font-display text-lg font-semibold text-[#202124] leading-snug mt-0.5 line-clamp-1">
                        {item.title}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#202124]/8 flex items-center justify-between gap-2">
                      <label className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-[#F1F2F2] text-[#202124] text-xs font-medium border border-[#202124]/15 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-[#B69A68]" />
                        <span>Replace Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleReplaceExistingSlotInCloud(item, file);
                            }
                          }}
                        />
                      </label>

                      {item.id.startsWith('cloud-art-') && (
                        <button
                          type="button"
                          onClick={() => onDeleteArtworkFromCloud(item.id)}
                          aria-label={`Delete ${item.title}`}
                          className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-[#202124]/15 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
