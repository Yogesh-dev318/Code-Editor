import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Code2, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                            <Code2 className="h-6 w-6 text-blue-500" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            CodeCraft
                        </span>
                    </Link>

                    {/* RIGHT SIDE ACTIONS */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-neutral-400 hidden sm:inline-block">
                                    Hi, {user?.username}
                                </span>
                                <Link to="/dashboard">
                                    <Button size="sm" variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 border-0 text-white backdrop-blur-sm">
                                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                                    </Button>
                                </Link>
                                <Button size="sm" variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/5">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/20 rounded-full px-6">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};