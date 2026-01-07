import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Login, Signup } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { EditorPage } from './pages/Editor';
import { Home } from './pages/Home';

// Wrapper for pages that require login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Wrapper for pages that should NOT be accessible if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Wrap Login & Signup with PublicRoute */}
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/signup" 
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    } 
                />
                
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/editor/:id" 
                    element={
                        <ProtectedRoute>
                            <EditorPage />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
}