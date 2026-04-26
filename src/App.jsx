import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Auth pages
import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';

// User pages
import Dashboard from './pages/user/Dashboard.jsx';
import SymptomChecker from './pages/user/SymptomChecker.jsx';
import Library from './pages/user/Library.jsx';
import ArticleDetail from './pages/user/ArticleDetail.jsx';
import Consultations from './pages/user/Consultations.jsx';
import ConsultationRoom from './pages/user/ConsultationRoom.jsx';
import Facilities from './pages/user/Facilities.jsx';
import Referrals from './pages/user/Referrals.jsx';
import Profile from './pages/user/Profile.jsx';
import Settings from './pages/user/Settings.jsx';

// Partner pages
import PartnerDashboard from './pages/partner/PartnerDashboard.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageContent from './pages/admin/ManageContent.jsx';
import ManageFacilities from './pages/admin/ManageFacilities.jsx';

// Spinner
const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
    <div style={{ width:40, height:40, border:'3px solid #eee', borderTopColor:'#F26522', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuth } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuth) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    const fallback = user?.role === 'admin' ? '/admin' : user?.role === 'partner' ? '/partner' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { isAuth, user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (isAuth) {
    const path = user?.role === 'admin' ? '/admin' : user?.role === 'partner' ? '/partner' : '/dashboard';
    return <Navigate to={path} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'Outfit, sans-serif', fontSize: 14, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
        success: { iconTheme: { primary: '#3A7D0A', secondary: '#fff' } },
        error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
      }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

        {/* Shared authenticated */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/library/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
        <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
        <Route path="/consultations/:id" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />
        <Route path="/facilities" element={<ProtectedRoute><Facilities /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />

        {/* User only */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['user']}><Dashboard /></ProtectedRoute>} />
        <Route path="/symptoms" element={<ProtectedRoute roles={['user']}><SymptomChecker /></ProtectedRoute>} />

        {/* Partner */}
        <Route path="/partner" element={<ProtectedRoute roles={['partner']}><PartnerDashboard /></ProtectedRoute>} />
        <Route path="/partner/consultations" element={<ProtectedRoute roles={['partner']}><Consultations /></ProtectedRoute>} />
        <Route path="/partner/referrals" element={<ProtectedRoute roles={['partner']}><Referrals /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute roles={['admin']}><ManageContent /></ProtectedRoute>} />
        <Route path="/admin/facilities" element={<ProtectedRoute roles={['admin']}><ManageFacilities /></ProtectedRoute>} />
        <Route path="/admin/consultations" element={<ProtectedRoute roles={['admin']}><Consultations /></ProtectedRoute>} />
        <Route path="/admin/referrals" element={<ProtectedRoute roles={['admin']}><Referrals /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// // Pages
// import Landing from './pages/Landing.jsx';
// import Login from './pages/auth/Login.jsx';
// import Register from './pages/auth/Register.jsx';
// import ForgotPassword from './pages/auth/ForgotPassword.jsx';
// import Dashboard from './pages/user/Dashboard.jsx';
// import SymptomChecker from './pages/user/SymptomChecker.jsx';
// import Library from './pages/user/Library.jsx';
// import Consultations from './pages/user/Consultations.jsx';
// import ConsultationRoom from './pages/user/ConsultationRoom.jsx';
// import Facilities from './pages/user/Facilities.jsx';
// import Referrals from './pages/user/Referrals.jsx';
// import PartnerDashboard from './pages/partner/PartnerDashboard.jsx';
// import AdminDashboard from './pages/admin/AdminDashboard.jsx';

// // Protected route wrapper
// function ProtectedRoute({ children, roles }) {
//   const { user, loading, isAuth } = useAuth();
//   if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div style={{ width: 40, height: 40, border: '3px solid #eee', borderTopColor: '#F26522', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;
//   if (!isAuth) return <Navigate to="/login" replace />;
//   if (roles && !roles.includes(user?.role)) {
//     const fallback = user?.role === 'admin' ? '/admin' : user?.role === 'partner' ? '/partner' : '/dashboard';
//     return <Navigate to={fallback} replace />;
//   }
//   return children;
// }

// // Redirect authenticated users away from auth pages
// function GuestRoute({ children }) {
//   const { isAuth, user, loading } = useAuth();
//   if (loading) return null;
//   if (isAuth) {
//     const path = user?.role === 'admin' ? '/admin' : user?.role === 'partner' ? '/partner' : '/dashboard';
//     return <Navigate to={path} replace />;
//   }
//   return children;
// }

// function AppRoutes() {
//   return (
//     <>
//       <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontSize: 14, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }, success: { iconTheme: { primary: '#3A7D0A', secondary: '#fff' } }, error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } } }} />
//       <Routes>
//         {/* Public */}
//         <Route path="/" element={<Landing />} />
//         <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
//         <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
//         <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

//         {/* User routes */}
//         <Route path="/dashboard" element={<ProtectedRoute roles={['user']}><Dashboard /></ProtectedRoute>} />
//         <Route path="/symptoms" element={<ProtectedRoute roles={['user']}><SymptomChecker /></ProtectedRoute>} />
//         <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
//         <Route path="/library/:id" element={<ProtectedRoute><Library /></ProtectedRoute>} />
//         <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
//         <Route path="/consultations/:id" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />
//         <Route path="/facilities" element={<ProtectedRoute><Facilities /></ProtectedRoute>} />
//         <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />

//         {/* Partner routes */}
//         <Route path="/partner" element={<ProtectedRoute roles={['partner']}><PartnerDashboard /></ProtectedRoute>} />
//         <Route path="/partner/consultations" element={<ProtectedRoute roles={['partner']}><Consultations /></ProtectedRoute>} />
//         <Route path="/partner/referrals" element={<ProtectedRoute roles={['partner']}><Referrals /></ProtectedRoute>} />

//         {/* Admin routes */}
//         <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
//         <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
//         <Route path="/admin/content" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
//         <Route path="/admin/facilities" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
//         <Route path="/admin/consultations" element={<ProtectedRoute roles={['admin']}><Consultations /></ProtectedRoute>} />
//         <Route path="/admin/referrals" element={<ProtectedRoute roles={['admin']}><Referrals /></ProtectedRoute>} />

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }
