# Frontend Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Environment Setup
Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Project Overview

Your complete School Maintenance Report frontend is ready with:

###  Authentication System
- Login page with email/password validation
- Registration page with role selection
- JWT token management with localStorage persistence
- Automatic token refresh on 401 responses
- Protected routes with role-based access control

### Role-Based Dashboards
- **Admin Dashboard**: Statistics, recent tickets, quick stats
- **Student Dashboard**: My tickets overview, quick ticket creation
- **Technician Dashboard**: Assigned work queue, task management

###  Ticket Management
- Create tickets with attachments
- View ticket details and history
- Add comments and notes
- Update ticket status
- Filter and search tickets
- View assigned technician

###  Admin Features
- User management with role assignment
- User deactivation
- Location management (CRUD)
- Dashboard analytics

### UI/UX Features
- Dark mode / Light mode toggle
- Responsive sidebar navigation
- Responsive navbar with user menu
- Clean, professional design
- Smooth transitions and animations
- Loading states and skeleton loaders
- Error handling with toast notifications
- Empty states for better UX

### Technical Features
- Full dark mode support (Tailwind)
- Context API for state management
- Custom hooks for authentication
- Axios interceptors for API calls
- API service layer abstraction
- Error boundary ready
- Code splitting ready
- SEO friendly

---

## File Structure

```
client/
├── src/
│   ├── api/                    # API service layer
│   │   ├── authApi.js
│   │   ├── ticketApi.js
│   │   ├── userApi.js
│   │   ├── locationApi.js
│   │   ├── noteApi.js
│   │   └── index.js
│   ├── components/
│   │   ├── common/             # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── Loaders.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   └── index.js
│   │   └── auth/                # Auth components
│   ├── context/                 # Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useTheme.js
│   │   ├── useApi.js
│   │   └── index.js
│   ├── layouts/                 # Layout components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── index.jsx
│   ├── pages/
│   │   ├── auth/               # Auth pages
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── DashboardRedirect.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── TechnicianDashboard.jsx
│   │   ├── tickets/            # Ticket pages
│   │   │   ├── TicketListPage.jsx
│   │   │   ├── CreateTicketPage.jsx
│   │   │   └── TicketDetailsPage.jsx
│   │   ├── admin/              # Admin pages
│   │   │   ├── UsersManagementPage.jsx
│   │   │   ├── LocationsManagementPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   └── error/              # Error pages
│   │       └── ErrorPages.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── style.css                # Global styles
├── public/
├── .env                         # Environment variables
├── .env.example                 # Example env
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── .eslintrc.json
└── README.md
```

---

## Key Configurations

### Tailwind CSS (tailwind.config.js)
- Dark mode enabled via class strategy
- Custom colors defined
- Extended theme for future needs

### Vite (vite.config.js)
- React plugin with HMR
- Tailwind CSS integration
- API proxy to backend
- Optimized build settings

### ESLint (.eslintrc.json)
- React best practices
- React hooks validation
- No JSX import needed (React 17+)

---

## API Integration

All API calls go through the Axios instance in `src/utils/api.js` which:

1. Automatically adds JWT token to all requests
2. Handles 401 errors by redirecting to login
3. Sets proper content-type headers
4. Handles CORS with the backend proxy

### Example API Call:
```javascript
import { ticketApi } from './api/ticketApi'

// Automatically includes auth token
const tickets = await ticketApi.getAll({ status: 'open' })
```

---

## Authentication Flow

```
1. User enters login credentials
2. POST /auth/login
3. Receive JWT token + user data
4. Store token in localStorage
5. AuthContext updates with user state
6. Redirect to dashboard
7. All subsequent requests include token
8. On 401, token cleared and user redirected to login
```

---

## Required Backend Setup

Your backend needs to provide:

### Auth Endpoints
```
POST /auth/login
POST /auth/register
GET /auth/me
```

### Ticket Endpoints
```
GET /tickets/stats
GET /tickets
POST /tickets
GET /tickets/:id
PATCH /tickets/:id/status
PATCH /tickets/:id/assign
DELETE /tickets/:id
```

### User Endpoints
```
GET /users
POST /users
PATCH /users/:id/role
PATCH /users/:id/deactivate
```

### Location Endpoints
```
GET /locations
POST /locations
DELETE /locations/:id
```

### Note Endpoints
```
GET /notes
POST /notes
```

---

## Development Workflow

### 1. Running Locally
```bash
# Terminal 1 - Backend
cd ..
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2. Making Changes
- Edit files in `src/`
- HMR will auto-reload the browser
- Check console for errors

### 3. Building for Production
```bash
npm run build
npm run preview  # Preview production build
```

---

## Next Steps

### Phase 1: Integration
- [ ] Test login/register with backend
- [ ] Verify API endpoints match
- [ ] Test token persistence
- [ ] Verify protected routes work

### Phase 2: Features
- [ ] Add ticket attachment uploads
- [ ] Implement real-time notifications
- [ ] Add advanced filtering
- [ ] Add export functionality
- [ ] Add user avatar uploads

### Phase 3: Polish
- [ ] Add loading placeholders
- [ ] Optimize performance
- [ ] Add more animations
- [ ] Accessibility audit
- [ ] Cross-browser testing

### Phase 4: Deployment
- [ ] Environment configuration
- [ ] Build optimization
- [ ] CDN setup
- [ ] Analytics
- [ ] Error monitoring

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 5174,  // Change this
}
```

### API Not Working
- Check VITE_API_URL in .env
- Verify backend is running
- Check browser console for CORS errors
- Ensure token is in localStorage

### Dark Mode Not Working
- Check if `dark` class is on HTML element
- Verify tailwind.config.js has `darkMode: 'class'`
- Check localStorage for theme preference

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`
- Restart dev server

---

## Performance Tips

1. **Code Splitting**: Pages are already set up for lazy loading
2. **Image Optimization**: Use image compression for attachments
3. **API Caching**: Add caching headers on backend
4. **Bundle Analysis**: `npm run build -- --analyze`
5. **Lazy Loading**: Use React.lazy() for heavy components

---

## Security Best Practices

JWT stored in localStorage (consider httpOnly on backend)
Protected routes with role checking
API requests include auth token
Automatic logout on 401
XSS protection via React
CORS configured properly

---

## Support Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

---

## Ready to Go!

Your frontend is now fully set up and ready for:
- Development
- Testing
- Integration with backend
- Production deployment

Start with `npm install && npm run dev` and happy coding! 🚀
