import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Code2 } from 'lucide-react';

export const Home = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background text-center px-4">
            <div className="rounded-full bg-muted p-6 mb-8">
                <Code2 className="h-20 w-20 text-primary" />
            </div>
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight">CollabCode</h1>
            <p className="mb-8 text-xl text-muted-foreground">Real-time collaboration with AI superpowers.</p>
            
            <div className="flex gap-4">
                {isAuthenticated ? (
                    <Button size="lg" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                ) : (
                    <>
                        <Button size="lg" onClick={() => navigate('/login')}>Login</Button>
                        <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>Sign Up</Button>
                    </>
                )}
            </div>
        </div>
    );
};