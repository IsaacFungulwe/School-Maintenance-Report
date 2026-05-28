# School Maintenance Report - Client

Modern React frontend for the School Maintenance Report application.

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (already provided):
```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── App.jsx              # Main app component with routing
├── main.jsx             # React entry point
├── style.css            # Tailwind CSS imports
├── utils/
│   └── api.js           # Axios API client with interceptors
└── assets/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Features

✅ React 18 with Vite  
✅ Tailwind CSS 4 for styling  
✅ React Router v7 for routing  
✅ Axios with request/response interceptors  
✅ Hot module replacement (HMR)  
✅ ESLint configured  
✅ Environment configuration ready  

## Backend Integration

The frontend is configured to communicate with the backend API at `http://localhost:5000/api`.

Update the API client in `src/utils/api.js` as needed for your endpoints.

## Next Steps

1. Create page components in `src/pages/`
2. Create reusable components in `src/components/`
3. Create custom hooks in `src/hooks/` if needed
4. Update routing in `App.jsx`
5. Remove `src/counter.js` and `src/assets/` boilerplate files

## Note on Cleanup

The following files are no longer needed and can be safely deleted:
- `src/counter.js`
- `src/assets/vite.svg`
- `public/` directory (if it exists with old assets)
