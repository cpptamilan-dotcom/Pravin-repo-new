export type ArtworkCategory =
  | 'All'
  | 'Sculpture'
  | 'Traditional Art'
  | 'Drawing & Sketching'
  | 'Painting'
  | 'Digital Sculpting'
  | '3D Art';

export interface ArtworkItem {
  id: string;
  catalogueNumber: string;
  title: string;
  tamilTitle?: string;
  categories: Exclude<ArtworkCategory, 'All'>[];
  medium: string;
  year: string;
  description: string;
  technicalNotes: string;
  imageUrl?: string;
  companionImageUrl?: string;
  companionLabel?: string;
  aspectRatio: 'portrait' | 'square' | 'landscape';
  featuredSpan?: boolean;
  isPlaceholder: boolean;
  placeholderType?: 'clay-sculpture' | 'traditional-relief' | 'charcoal-drawing' | 'fine-painting';
  replacementPathHint: string;
}

export const ARTIST_INFO = {
  name: 'Pravin Kumar',
  monogram: 'PK.',
  professionalTitle: 'Sculptor | Fine Artist | 3D Digital Artist',
  heroLabel: 'SCULPTOR & FINE ARTIST',
  heroHeading: 'ART IS THE EXPRESSION OF FORM.',
  heroSubtitle: 'Exploring creativity through sculpture, drawing, painting and digital art.',
  aboutHeading: 'ABOUT THE ARTIST',
  aboutBio:
    'Pravin Kumar is a Bachelor of Fine Arts graduate specializing in Sculpture. His artistic interests include traditional sculpture, drawing, painting and digital sculpting using ZBrush. He is passionate about exploring artistic forms, creative concepts and visual expression.',
  philosophyQuote:
    'Every volume holds an inner rhythm—whether shaped by hand in wet clay or refined with digital brushes in three-dimensional space.',
  education: {
    degree: 'Bachelor of Fine Arts (BFA)',
    specialization: 'Sculpture',
    graduationYear: '2026',
    collegeTamil: 'கவின் கலைக் கல்லூரி, கும்பகோணம்',
    collegeEnglish: 'Government College of Fine Arts, Kumbakonam',
    university: 'Tamil Nadu Dr. J. Jayalalithaa Music and Fine Arts University',
  },
  contact: {
    locationFull: 'Pakripalayam, Chengam, Tiruvannamalai, Tamil Nadu – 606709',
    locationShort: 'Chengam, Tamil Nadu',
    phone: '9345890373',
    phoneFormatted: '+91 93458 90373',
    phoneHref: 'tel:+919345890373',
    email: 'bpppravin934589@gmail.com',
    emailHref: 'mailto:bpppravin934589@gmail.com',
  },
  footerQuote: 'Creativity has no boundaries.',
};

export const GALLERY_CATEGORIES: ArtworkCategory[] = [
  'All',
  'Sculpture',
  'Traditional Art',
  'Drawing & Sketching',
  'Painting',
  'Digital Sculpting',
  '3D Art',
];

export const INITIAL_ARTWORKS: ArtworkItem[] = [
  {
    id: 'murugan-clay-render',
    catalogueNumber: 'CAT. 01',
    title: 'Four-Armed Seated Deity with Vel & Ornate Pedestal',
    tamilTitle: 'முருகப்பெருமான் சிற்ப வடிவம்',
    categories: ['Digital Sculpting', '3D Art', 'Sculpture'],
    medium: 'ZBrush Digital Sculpture · Clay MatCap Study',
    year: '2026',
    description:
      'High-resolution three-dimensional digital sculpture of a seated four-armed deity holding the sacred Vel (spear), conch, vajra, and lotus, resting in Lalitasana atop a classical South Indian relief pedestal.',
    technicalNotes:
      'Sculpted in ZBrush with emphasis on traditional Shilpa Shastra iconometry, intricate crown (Karanda Makuta) beadwork, necklace layering, and deep-relief yali/floral scroll base carving.',
    imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM_fe1d4107.jpeg',
    companionImageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.20_AM_23864509.jpeg',
    companionLabel: 'View Rear Sculpting Viewport',
    aspectRatio: 'portrait',
    featuredSpan: true,
    isPlaceholder: false,
    replacementPathHint: 'assets/images/sculpture-murugan-front.jpg',
  },
  {
    id: 'ganesha-flute-gold',
    catalogueNumber: 'CAT. 02',
    title: 'Venugopala Ganapati with Peacock & Prabhavali Arch',
    tamilTitle: 'புல்லாங்குழல் விநாயகர் சிற்பம்',
    categories: ['Digital Sculpting', '3D Art', 'Sculpture', 'Traditional Art'],
    medium: 'ZBrush Digital Sculpture · Antique Gold MatCap Render',
    year: '2026',
    description:
      'Ornate digital sculpture depicting Lord Ganesha seated on a double-layered lotus pitham playing the flute, flanked by a finely feathered peacock and framed by a Kirtimukha Prabhavali torana arch.',
    technicalNotes:
      'Focuses on harmonious silhouette composition, individual feather detailing on the peacock, lotus petal volume, and traditional South Indian bronze casting surface aesthetics.',
    imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.22_AM_574544c0.jpeg',
    aspectRatio: 'square',
    featuredSpan: true,
    isPlaceholder: false,
    replacementPathHint: 'assets/images/sculpture-ganesha-gold.jpg',
  },
  {
    id: 'kodanda-rama-gold',
    catalogueNumber: 'CAT. 03',
    title: 'Standing Archer Deity (Kodanda Rama) on Padmasana',
    tamilTitle: 'கோதண்டராமர் நின்ற திருக்கோலம்',
    categories: ['Digital Sculpting', '3D Art', 'Sculpture'],
    medium: 'ZBrush Digital Sculpture · Bronze-Gold Shader Study',
    year: '2026',
    description:
      'Full-figure standing sculpture poised in graceful Tribhanga contrapposto, holding the tall serpent-tipped bow and arrow atop a sculpted lotus pedestal.',
    technicalNotes:
      'Explores balanced weight distribution, flowing dhoti drapery folds, waist Simhamukha belt ornamentation, and classical Chola-inspired facial serenity.',
    imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM__1__5afcf882.jpeg',
    companionImageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.20_AM__1__464a7b1e.jpeg',
    companionLabel: 'View Rear Anatomy & Drapery Study',
    aspectRatio: 'portrait',
    isPlaceholder: false,
    replacementPathHint: 'assets/images/sculpture-rama-front.jpg',
  },
  {
    id: 'murugan-rear-viewport',
    catalogueNumber: 'CAT. 04',
    title: 'Dorsal Ornamentation & Pedestal Relief Study (ZBrush Viewport)',
    categories: ['Digital Sculpting', '3D Art'],
    medium: 'ZBrush Live Sculpting Viewport · ZAdd / Polish Study',
    year: '2026',
    description:
      'Direct ZBrush workspace capture demonstrating rear hair lock arrangement (Jata), upper shawl drapery tension, and three-tiered ornamental scroll relief along the back of the throne base.',
    technicalNotes:
      'Demonstrates full 360-degree sculptural completeness—ensuring the dorsal silhouette, shoulder girdle, and rear pedestal mouldings maintain the same rigor as the frontal view.',
    imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.20_AM_23864509.jpeg',
    companionImageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM_fe1d4107.jpeg',
    companionLabel: 'View Front Clay Render',
    aspectRatio: 'portrait',
    isPlaceholder: false,
    replacementPathHint: 'assets/images/zbrush-murugan-rear.jpg',
  },
  {
    id: 'rama-rear-viewport',
    catalogueNumber: 'CAT. 05',
    title: 'Standing Figure — Dorsal Anatomy & Lower Drapery Rhythm',
    categories: ['Digital Sculpting', '3D Art', 'Sculpture'],
    medium: 'ZBrush Clay Shader · Rear Structural Study',
    year: '2026',
    description:
      'Rear structural study examining spinal curvature, shoulder blade transitions, sacred thread flow, and cascading pleat geometry of the lower garment.',
    technicalNotes:
      'Constructed using subtool organization, clean polygroup topology, and precision crease/polish passes for crisp ornamental borders.',
    imageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.20_AM__1__464a7b1e.jpeg',
    companionImageUrl: 'assets/aistudio/WhatsApp_Image_2026-11-03_at_10.57.21_AM__1__5afcf882.jpeg',
    companionLabel: 'View Front Gold Render',
    aspectRatio: 'portrait',
    isPlaceholder: false,
    replacementPathHint: 'assets/images/zbrush-rama-rear.jpg',
  },
  {
    id: 'traditional-clay-bust-placeholder',
    catalogueNumber: 'CAT. 06',
    title: 'Traditional Studio Clay Portrait & Volume Study',
    categories: ['Sculpture', 'Traditional Art'],
    medium: 'Terracotta & Wet Studio Clay on Armature',
    year: '2026',
    description:
      'Reserved slot for Pravin Kumar’s studio photograph of traditional clay modelling and life-size portrait sculpture created during BFA Sculpture studio practice at Kumbakonam.',
    technicalNotes:
      'Replaceable artwork slot: Click "Preview Your Photo" on this card or replace assets/images/traditional-sculpture-01.jpg to display your original studio photograph.',
    aspectRatio: 'portrait',
    isPlaceholder: true,
    placeholderType: 'clay-sculpture',
    replacementPathHint: 'assets/images/traditional-sculpture-01.jpg',
  },
  {
    id: 'charcoal-anatomy-drawing-placeholder',
    catalogueNumber: 'CAT. 07',
    title: 'Figurative Form & Chiaroscuro Sketch Study',
    categories: ['Drawing & Sketching', 'Traditional Art'],
    medium: 'Charcoal & Graphite on Archival Cartridge Paper',
    year: '2026',
    description:
      'Reserved slot for Pravin Kumar’s observational life drawing, structural anatomy sketches, and preparatory sculptural studies.',
    technicalNotes:
      'Replaceable artwork slot: Click "Preview Your Photo" on this card or replace assets/images/drawing-study-01.jpg with your scanned sketch.',
    aspectRatio: 'landscape',
    isPlaceholder: true,
    placeholderType: 'charcoal-drawing',
    replacementPathHint: 'assets/images/drawing-study-01.jpg',
  },
  {
    id: 'fine-art-painting-placeholder',
    catalogueNumber: 'CAT. 08',
    title: 'Color, Light & Atmospheric Composition Study',
    categories: ['Painting', 'Traditional Art'],
    medium: 'Acrylic / Oil on Canvas',
    year: '2026',
    description:
      'Reserved slot for Pravin Kumar’s fine art painting work exploring tonal harmony, surface brushwork, and spatial depth.',
    technicalNotes:
      'Replaceable artwork slot: Click "Preview Your Photo" on this card or replace assets/images/painting-study-01.jpg with your original canvas photograph.',
    aspectRatio: 'landscape',
    isPlaceholder: true,
    placeholderType: 'fine-painting',
    replacementPathHint: 'assets/images/painting-study-01.jpg',
  },
];

export interface SculpturePillar {
  index: string;
  title: string;
  subtitle: string;
  description: string;
  materials: string;
}

export const SCULPTURE_PILLARS: SculpturePillar[] = [
  {
    index: '01',
    title: 'Traditional Sculpture',
    subtitle: 'Heritage & Classical Iconometry',
    description:
      'Rooted in the rich sculptural lineage of Kumbakonam, exploring classical South Indian canon proportions, rhythmic posture, and devotional form.',
    materials: 'Stone · Bronze Casting Moulds · Traditional Relief',
  },
  {
    index: '02',
    title: 'Clay Modelling',
    subtitle: 'Additive & Subtractive Tactility',
    description:
      'Building expressive volumes from internal armature to refined surface planes, capturing organic anatomy and immediate gesture in wet clay.',
    materials: 'Water-Based Studio Clay · Terracotta · Plastilina',
  },
  {
    index: '03',
    title: 'Three-Dimensional Forms',
    subtitle: 'Mass, Void & Spatial Balance',
    description:
      'Investigating how light wraps around convex and concave contours so every sculpture commands presence from a full 360-degree walkaround.',
    materials: 'Free-Standing Maquettes · Monumental Studies',
  },
  {
    index: '04',
    title: 'Sculptural Concepts',
    subtitle: 'From Sketch to Structural Volume',
    description:
      'Translating observational drawings and conceptual compositions into physical and digital armatures with clear structural hierarchy.',
    materials: 'Preparatory Charcoal Studies · Scale Models',
  },
  {
    index: '05',
    title: 'Material & Texture Studies',
    subtitle: 'Surface Contrast & Patina',
    description:
      'Contrasting smooth, meditative skin planes against intricate ornamental carving, drapery folds, and chiseled pedestal relief.',
    materials: 'Chisel Tooling · Burnished Clay · Metallic Shaders',
  },
];

export interface ZBrushPillar {
  index: string;
  title: string;
  description: string;
  detailTag: string;
}

export const ZBRUSH_PILLARS: ZBrushPillar[] = [
  {
    index: '01',
    title: '3D Character & Deity Sculpting',
    description:
      'Crafting expressive figures and traditional iconographic forms in ZBrush with anatomical conviction and spiritual poise.',
    detailTag: 'Anatomy · Pose · Expression',
  },
  {
    index: '02',
    title: 'Digital Modelling & Subtools',
    description:
      'Structuring complex multi-part sculptures—crowns, weapons, Prabhavali arches, and lotus pedestals—with clean subtool organization.',
    detailTag: 'Base Mesh · PolyGroups · Symmetry',
  },
  {
    index: '03',
    title: 'Form Development',
    description:
      'Establishing primary silhouette, secondary muscle/drapery masses, and tertiary ornamental rhythms from every camera angle.',
    detailTag: 'Primary Volume · Silhouette · Balance',
  },
  {
    index: '04',
    title: 'Surface Detailing & Relief',
    description:
      'Carving intricate jewelry, floral scrollwork, beaded garlands, and crisp garment folds using precision ZAdd, DamStandard, and Polish brushes.',
    detailTag: 'Ornamentation · Micro-Relief · Precision',
  },
  {
    index: '05',
    title: 'Clay-Style & Metallic Renders',
    description:
      'Presenting high-resolution meshes under studio clay and antique Chola-gold MatCap lighting to evaluate form and prepares models for 3D printing or casting.',
    detailTag: 'Clay MatCap · Gold Shader · BPR Lighting',
  },
];

export interface SkillCardItem {
  name: string;
  category: 'Artistic Skills' | 'Digital Skills';
  focus: string;
  description: string;
  mediumsOrTools: string;
}

export const SKILLS_LIST: SkillCardItem[] = [
  {
    name: 'Sculpture',
    category: 'Artistic Skills',
    focus: 'Three-Dimensional Volume & Form',
    description:
      'Traditional figurative, devotional, and relief sculpture developed through academic studio training at the Government College of Fine Arts, Kumbakonam.',
    mediumsOrTools: 'Clay Modelling · Relief Carving · Armature Construction',
  },
  {
    name: 'Drawing',
    category: 'Artistic Skills',
    focus: 'Structural Observation & Proportion',
    description:
      'Foundational life drawing and anatomical study used to analyze proportion, perspective, and light before committing form to clay or digital mesh.',
    mediumsOrTools: 'Graphite · Charcoal · Conté · Ink',
  },
  {
    name: 'Painting',
    category: 'Artistic Skills',
    focus: 'Color Harmony & Surface Atmosphere',
    description:
      'Exploring chromatic temperature, tonal value, and expressive brushwork to build depth and mood across two-dimensional surfaces.',
    mediumsOrTools: 'Acrylic · Oil · Watercolor Studies',
  },
  {
    name: 'Sketching',
    category: 'Artistic Skills',
    focus: 'Rapid Ideation & Gesture',
    description:
      'Capturing spontaneous movement, ornamental motifs, and multi-angle sculptural thumbnails to iterate concepts rapidly.',
    mediumsOrTools: 'Sketchbooks · Dry Media · Gesture Studies',
  },
  {
    name: 'Creative Composition',
    category: 'Artistic Skills',
    focus: 'Visual Balance & Narrative Rhythm',
    description:
      'Arranging positive mass and negative space, pedestal framing, and focal hierarchy so each artwork guides the viewer’s eye naturally.',
    mediumsOrTools: 'Spatial Rhythm · Silhouette Design · Framing',
  },
  {
    name: 'ZBrush',
    category: 'Digital Skills',
    focus: 'High-Resolution Digital Sculpting',
    description:
      'Translating traditional hand-sculpting instincts into Pixologic/Maxon ZBrush using dynamic subdivision, custom alphas, and precision brushes.',
    mediumsOrTools: 'DynaMesh · ZRemesher · SubTools · MatCap Rendering',
  },
  {
    name: '3D Digital Sculpting',
    category: 'Digital Skills',
    focus: 'Digital Clay to Physical & Render Form',
    description:
      'Developing complete 360-degree digital sculptures of deities, characters, and ornamental reliefs suitable for portfolio presentation and fabrication.',
    mediumsOrTools: '3D Form Blocking · High-Poly Detailing · Turntable Presentation',
  },
];
