# School Maintenance Report - Frontend

A modern, production-ready React frontend for managing school maintenance tickets and requests.

## Features

- **Role-Based Access Control**: Admin, Technician, and Student dashboards
- **Ticket Management**: Create, view, and manage maintenance tickets
- **User Management**: Manage users and roles (Admin only)
- **Location Management**: Manage maintenance locations (Admin only)
- **Dark Mode**: Full dark mode support with theme persistence
- **Real-time Updates**: Live notifications and status updates
- **Responsive Design**: Mobile, tablet, and desktop support
- **Professional UI**: Clean, modern, enterprise-ready interface

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Ultra-fast build tool
- **Tailwind CSS 4**: Utility-first styling
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors
- **React Hot Toast**: Toast notifications
- **Lucide React**: Beautiful SVG icons
- **Context API**: State management

## Project Structure

```
src/
├── api/                 # API service files
│   ├── authApi.js
│   ├── ticketApi.js
│   ├── userApi.js
│   ├── locationApi.js
│   └── noteApi.js
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   └── auth/           # Auth-specific components
├── context/            # Context providers
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   ├── useTheme.js
│   └── useApi.js
├── layouts/            # Layout components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── index.jsx
├── pages/              # Page components
│   ├── auth/          # Login, Register
│   ├── dashboard/     # Admin, Student, Technician dashboards
│   ├── tickets/       # Ticket management pages
│   ├── admin/         # Admin management pages
│   └── error/         # Error pages
├── routes/             # Route components
│   └── ProtectedRoute.jsx
├── utils/              # Utility functions
│   └── api.js         # Axios instance
├── App.jsx             # Main app component with routing
├── main.jsx            # React entry point
└── style.css           # Global styles

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

### Tickets
- `GET /tickets/stats` - Get ticket statistics
- `GET /tickets` - List tickets
- `GET /tickets/:id` - Get ticket details
- `POST /tickets` - Create ticket
- `PATCH /tickets/:id/status` - Update ticket status
- `PATCH /tickets/:id/assign` - Assign technician
- `DELETE /tickets/:id` - Delete ticket

### Users (Admin)
- `GET /users` - List users
- `POST /users` - Create user
- `PATCH /users/:id/role` - Update user role
- `PATCH /users/:id/deactivate` - Deactivate user

### Locations (Admin)
- `GET /locations` - List locations
- `POST /locations` - Create location
- `DELETE /locations/:id` - Delete location

### Notes
- `GET /notes` - List notes
- `POST /notes` - Create note

## Key Components

### Common Components
- **Button**: Variant styles (primary, secondary, danger, success, ghost)
- **Input**: Text input with error handling
- **Select**: Dropdown select
- **Modal**: Dialog component
- **Card**: Container component
- **Table**: Data table with styling
- **Badge/StatusBadge**: Status indicators
- **FileUpload**: File upload with drag-and-drop
- **Spinner/SkeletonLoader**: Loading states
- **Alert**: Alert messages
- **EmptyState**: Empty state UI

### Layouts
- **DashboardLayout**: Main layout with sidebar and navbar
- **AuthLayout**: Auth page layout
- **Navbar**: Top navigation with theme toggle and user menu
- **Sidebar**: Navigation sidebar with role-based links

## Authentication Flow

1. User logs in or registers
2. Backend returns JWT token
3. Token stored in localStorage
4. Axios interceptors automatically attach token to requests
5. Token sent in Authorization header
6. On 401 response, user redirected to login
7. Token persists across page refreshes

## Theme System

- Light mode by default
- Dark mode toggle in navbar
- Theme preference saved to localStorage
- Uses Tailwind dark mode class strategy
- Smooth transitions between themes

## Role-Based Routes

### Student
- `/student/dashboard` - Dashboard
- `/student/tickets` - My tickets list
- `/student/tickets/create` - Create ticket
- `/student/tickets/:id` - Ticket details

### Technician
- `/technician/dashboard` - Dashboard with assigned work
- `/technician/tickets` - Assigned tickets
- `/technician/tickets/:id` - Ticket details

### Admin
- `/admin/dashboard` - Admin dashboard with statistics
- `/admin/tickets` - All tickets
- `/admin/users` - User management
- `/admin/locations` - Location management
- `/admin/reports` - Reports (placeholder)

## Protected Routes

Routes are protected using the `ProtectedRoute` component which:
- Checks if user is authenticated
- Validates user role
- Redirects to login if not authenticated
- Redirects to unauthorized page if role is insufficient

## State Management

### Context Providers
- **AuthContext**: User authentication state, login/logout
- **ThemeContext**: Dark/light mode state

### Local State
- Form data and validation
- Loading and error states
- Modal open/close states
- Page filters and pagination

## Error Handling

- Global error handling with Axios interceptors
- Toast notifications for user feedback
- Error alerts on pages
- 404 and 403 error pages
- Form validation with error messages

## Best Practices

✅ Functional components with hooks
✅ Context API for global state
✅ Reusable, composable components
✅ Clean folder structure
✅ Proper error handling
✅ Loading states
✅ Responsive design
✅ Accessibility considerations
✅ Dark mode support
✅ Code splitting ready

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for pages
- Code splitting ready
- Optimized re-renders
- Efficient API calls
- Minimal bundle size with Vite

## Security

- JWT token in localStorage
- HTTP-only cookies (backend should implement)
- Automatic token refresh (implement on backend)
- Protected routes with role checking
- XSS protection via React
- CSRF protection (implement on backend)

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Export to PDF/CSV
- [ ] User avatar uploads
- [ ] Ticket history timeline
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Batch operations
- [ ] Offline support

## Support

For issues or questions, contact the development team.

## License

ISC
