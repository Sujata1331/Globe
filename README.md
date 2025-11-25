# Khel.ai Globe Frontend Assignment

A beautiful 3D interactive globe built with React, Three.js, and React Three Fiber, featuring location pins with hover tooltips.

## 🚀 Features

- **3D Globe**: Animated 3D globe with smooth rotation
- **Interactive Pins**: Location pins placed at specific coordinates
- **Hover Tooltips**: Beautiful tooltips appear on pin hover
- **Modern UI**: Clean, pixel-perfect design matching the reference
- **TypeScript**: Fully typed for better development experience

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **Tailwind CSS** - Styling

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 🚢 Deployment

This project is configured for Vercel deployment. Simply:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect the Vite configuration and deploy

Or use Vercel CLI:

```bash
npm install -g vercel
vercel
```

## 📝 Customization

### Adding New Locations

Edit `src/data/locations.ts` to add or modify location pins:

```typescript
{
  id: '9',
  name: 'Your City',
  lat: 0.0,
  lng: 0.0,
  description: 'Your description'
}
```

### Styling

The project uses Tailwind CSS. Modify `tailwind.config.js` for theme customization.

## 📄 License

MIT

