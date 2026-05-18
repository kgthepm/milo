# MILO Landing Page

Super cool landing page for MILO - AI-Powered Movie & TV Tracking Dashboard.

## 🚀 Deploy to Netlify

### Option 1: Drag & Drop (Easiest)

1. Log in to [Netlify](https://app.netlify.com)
2. Drag the entire `milo-landing` folder into the "Sites" area
3. Wait a few seconds and your site is live!

### Option 2: Git Deploy

1. Push this folder to a GitHub repository
2. In Netlify, click "Add new site" → "Import an existing project"
3. Connect your GitHub account and select the repository
4. Deploy settings will be auto-detected (Static HTML)
5. Click "Deploy site"

### Option 3: Netlify CLI

```bash
npm install -g netlify-cli
cd milo-landing
netlify deploy
```

## 🔧 Customization

### Update Links

Search and replace these URLs in `index.html`:
- `https://github.com/yourusername/milo` → Your actual GitHub repo URL
- Live demo link → Your deployed app URL

### Update Contact/Footer

Update footer content in `index.html` (around line 450):
- Add your name
- Add social media links
- Update copyright year

## 🎨 Features

- ✨ **Standalone HTML** - No build tools required
- 🎨 **Tailwind CSS** - Via CDN for instant styling
- 🎭 **Lucide Icons** - Beautiful icon library via CDN
- 🌈 **Neon Effects** - Matches the MILO app aesthetic
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **Fast Loading** - Minimal dependencies
- 🎬 **Smooth Animations** - Fade-in, float, pulse effects

## 📂 File Structure

```
milo-landing/
├── index.html    # Complete landing page (HTML + CSS + JS)
└── README.md     # This file
```

## 🌐 Custom Domain (Optional)

After deploying to Netlify:

1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Follow DNS instructions
4. Your custom domain will be live!

## 🎯 What's Included

### Hero Section
- Animated MILO branding with neon glow
- Compelling tagline
- Primary CTA: Download/Clone
- Secondary CTA: Try Live Demo
- Tech stack icons

### Features Section
- 6 feature cards with glassmorphism
- Hover animations and neon borders
- Lucide icons for each feature

### Tech Stack Section
- 8 technology cards
- Responsive grid layout
- Hover effects on icons

### CTA Section
- Final call-to-action
- Neon border effect
- Links to GitHub

### Footer
- MILO branding
- Copyright notice
- GitHub link

## 🎭 Color Scheme

- **Cyan**: `#00d4ff` (primary accent)
- **Magenta**: `#ff006e` (secondary accent)
- **Purple**: `#8338ec` (tertiary accent)
- **Dark Background**: `#0a0a0f` → `#12121a`

## 📝 Notes

- The landing page is completely self-contained
- No backend or API required
- Can be hosted anywhere that supports static sites
- Works perfectly on Netlify, GitHub Pages, Vercel, etc.

## 🎉 Enjoy!

Your MILO landing page is ready to wow visitors with its futuristic design and smooth animations!