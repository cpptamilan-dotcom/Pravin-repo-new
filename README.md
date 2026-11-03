# Pravin Kumar — Sculptor & Fine Artist Portfolio (`pravin-kumar-art-portfolio`)

A minimalist, Apple-inspired digital art gallery and personal portfolio website for **Pravin Kumar**, Bachelor of Fine Arts (BFA) graduate specializing in **Sculpture** from **கவின் கலைக் கல்லூரி, கும்பகோணம்** (*Tamil Nadu Dr. J. Jayalalithaa Music and Fine Arts University*, Class of 2026).

---

## 1. Artist Profile

- **Name:** Pravin Kumar
- **Professional Title:** Sculptor | Fine Artist | 3D Digital Artist
- **Education:**
  - Bachelor of Fine Arts (BFA) — Specialization: Sculpture (2026)
  - College: கவின் கலைக் கல்லூரி, கும்பகோணம் (Government College of Fine Arts, Kumbakonam)
  - University: Tamil Nadu Dr. J. Jayalalithaa Music and Fine Arts University
- **Skills:**
  - **Artistic:** Sculpture, Drawing, Sketching, Painting, Creative Composition
  - **Digital:** ZBrush, 3D Digital Sculpting
- **Location:** Pakripalayam, Chengam, Tiruvannamalai, Tamil Nadu – 606709
- **Phone:** 9345890373
- **Email:** bpppravin934589@gmail.com

---

## 2. Project Structure

```text
pravin-kumar-art-portfolio/
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── images/
│   └── icons/
│       └── pk-monogram.svg
├── public/
│   └── assets/
│       └── aistudio/          # Supplied ZBrush digital sculpture renders & studies
├── src/                       # Interactive Vite + TypeScript source
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   └── data/
│       └── portfolioData.ts
└── .gitignore
```

---

## 3. GitHub Repository Setup & Push Instructions

1. Sign in to GitHub and create a new repository named **`pravin-kumar-art-portfolio`** (keep it Public for free GitHub Pages hosting).
2. Run the following Git commands from the root directory of this project (replace `<YOUR_GITHUB_USERNAME>` with your actual GitHub username):

```bash
git init
git add .
git commit -m "Initial commit: Pravin Kumar Sculpture & Digital Art Portfolio"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/pravin-kumar-art-portfolio.git
git push -u origin main
```

---

## 4. GitHub Pages Deployment Instructions

### Option A: Deploy Built Static Files (`dist/`)
1. Run `npm install && npm run build` locally to generate the production `dist/` folder.
2. Or enable **GitHub Actions** in your repository:
   - Go to **Settings → Pages**.
   - Under **Build and deployment → Source**, choose **GitHub Actions** (or select your deployment branch).

### Option B: Direct Branch Deployment
1. Go to your repository on GitHub and click **Settings**.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment → Branch**, select **`main`** and **`/ (root)`**, then click **Save**.
4. Wait 1–2 minutes for GitHub Pages to publish your live site.

---

## 5. Custom Domain Setup Instructions

1. Purchase your domain name from any domain registrar (e.g., Namecheap, Cloudflare, GoDaddy, Porkbun).
2. In your DNS provider dashboard, add the following **A Records** pointing `@` to GitHub Pages IP addresses:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add a **CNAME Record** for `www` pointing to `<YOUR_GITHUB_USERNAME>.github.io`.
4. In your GitHub repository, navigate to **Settings → Pages → Custom domain**, enter your domain name, click **Save**, and enable **Enforce HTTPS**.

---

## 6. Image Replacement Guide

Never present stock or generated placeholder images as original artwork. To add or replace any studio photograph or ZBrush render:

1. **Instant Browser Preview:**
   - Click **"Preview Your Photo"** on any replaceable studio slot, **"Replace Hero Photo"** on the hero frame, or **"Add Artwork Preview"** in the Selected Artworks section to preview your images immediately.
2. **Permanent File Replacement:**
   - Place your optimized `.jpg` or `.webp` artwork photographs in `public/assets/images/` (or `assets/images/`).
   - Open `src/data/portfolioData.ts` (and `js/main.js` if using the standalone vanilla bundle).
   - Locate the artwork entry in `INITIAL_ARTWORKS`, update `imageUrl: '/assets/images/your-photo.jpg'`, and set `isPlaceholder: false`.
