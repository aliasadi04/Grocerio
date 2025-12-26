# 🥕 Family Groceries

A beautiful, real-time grocery list app for families to shop together. Built with React and Supabase.

![Family Groceries App](https://via.placeholder.com/800x400/2d5a27/ffffff?text=Family+Groceries)

## ✨ Features

- **Add Items**: Quick input with name and quantity
- **Check Items**: Tap to mark items as collected
- **Real-time Sync**: Changes appear instantly for all family members
- **Buy & Remove**: Review checked items before removing them
- **PWA Ready**: Install on your phone's home screen
- **Beautiful UI**: Warm, family-friendly design

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account (free tier works great!)

---

## 📦 Setup Instructions

### Step 1: Set Up Supabase (Free Backend)

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com/)
   - Sign up for free (no credit card required)

2. **Create a New Project**
   - Click "New Project"
   - Give it a name (e.g., "family-groceries")
   - Set a secure database password (save this!)
   - Choose a region close to you
   - Click "Create new project" and wait ~2 minutes

3. **Create the Database Table**
   - In your project, go to **SQL Editor** (left sidebar)
   - Click "New query" and paste this SQL:

   ```sql
   -- Create the grocery_items table
   CREATE TABLE grocery_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     quantity TEXT NOT NULL DEFAULT '1',
     checked BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security (RLS)
   ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

   -- Create a policy to allow all operations (for family use)
   -- For a more secure setup, you'd add authentication
   CREATE POLICY "Allow all operations" ON grocery_items
     FOR ALL
     USING (true)
     WITH CHECK (true);

   -- Enable real-time updates
   ALTER PUBLICATION supabase_realtime ADD TABLE grocery_items;
   ```

   - Click "Run" to execute

4. **Get Your API Keys**
   - Go to **Settings** (gear icon) → **API**
   - Copy these values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (under "Project API keys")

### Step 2: Set Up the App Locally

1. **Clone/Download the project** and navigate to it:
   ```bash
   cd grocery-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env and add your Supabase credentials
   ```

   Your `.env` file should look like:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**: Visit `http://localhost:3000`

---

## 🌐 Deploy for Free

### Option A: Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/family-groceries.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com/) and sign in with GitHub
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Add Environment Variables**:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Click "Deploy"
   - Done! You'll get a URL like `https://family-groceries.vercel.app`

### Option B: Deploy to Netlify

1. **Push to GitHub** (same as above)

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://www.netlify.com/) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repo
   - **Build settings**:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - **Add Environment Variables** in Site settings:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy!

---

## 📱 Install as a Phone App (PWA)

Once deployed, you can add it to your phone's home screen:

### iPhone/iPad:
1. Open the app URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android:
1. Open the app URL in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Tap "Add"

---

## 🛠️ Project Structure

```
grocery-app/
├── public/
│   ├── grocery.svg      # App icon
│   └── manifest.json    # PWA manifest
├── src/
│   ├── components/      # React components (if separated)
│   ├── lib/
│   │   └── supabase.js  # Supabase client config
│   ├── styles/
│   │   └── index.css    # All styles
│   ├── App.jsx          # Main application
│   └── main.jsx         # Entry point
├── .env.example         # Environment template
├── index.html           # HTML entry
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

---

## 🔒 Making It Secure (Optional)

The current setup allows anyone with the link to use the app. For family-only access:

### Option 1: Simple Password Protection
Add a password check in the app (simple but not highly secure)

### Option 2: Supabase Authentication
1. Enable Email Auth in Supabase Dashboard → Authentication
2. Update RLS policies to check `auth.uid()`
3. Add login/signup forms to the app

---

## 🐛 Troubleshooting

**"Failed to load items" error**
- Check that your Supabase URL and key are correct in `.env`
- Verify the `grocery_items` table was created
- Check that RLS policies are set up correctly

**Items not syncing in real-time**
- Make sure you ran the `ALTER PUBLICATION` SQL command
- Check browser console for WebSocket errors

**App not loading**
- Clear browser cache
- Check the browser console for errors
- Verify all dependencies are installed (`npm install`)

---

## 🎨 Customization

### Change Colors
Edit the CSS variables in `src/styles/index.css`:
```css
:root {
  --color-sage: #2d5a27;        /* Primary green */
  --color-terracotta: #c45d3e;  /* Accent/buy button */
  --color-cream: #faf8f5;       /* Background */
  /* ... more colors */
}
```

### Change Fonts
Update the Google Fonts import in `index.html` and the `--font-` variables in CSS.

---

## 📝 License

MIT License - feel free to use this for your family!

---

## 🙏 Credits

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Happy Shopping! 🛒**
