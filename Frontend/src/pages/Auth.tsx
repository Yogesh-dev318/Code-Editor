import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ShootingStars } from '../components/ui/shooting-stars';
import { StarsBackground } from '../components/ui/stars-background';

const inputClasses = "h-11 bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all duration-200";
const labelClasses = "block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5 ml-1";

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginAction } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await loginAction(email, password);
            navigate('/dashboard');
        } catch (err) { alert('Login Failed'); }
    };

    return (
        <div className="h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased overflow-hidden">
            <div className="absolute inset-0 z-0">
                <ShootingStars />
                <StarsBackground />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <Card className="border-neutral-800 bg-black/40 backdrop-blur-xl text-neutral-100 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-3xl font-bold tracking-tighter text-white">Welcome Back</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelClasses}>Email Address</label>
                                <Input 
                                    placeholder="name@example.com" 
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)} 
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Password</label>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)} 
                                    className={inputClasses}
                                />
                            </div>
                            <Button className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-medium transition-colors mt-2">
                                Login
                            </Button>
                        </form>
                        <div className="mt-6 text-center text-sm text-neutral-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signupAction } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await signupAction(username, email, password);
            navigate('/dashboard');
        } catch (err) { alert('Signup Failed'); }
    };

    return (
        <div className="h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased overflow-hidden">
            <div className="absolute inset-0 z-0">
                <ShootingStars />
                <StarsBackground />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <Card className="border-neutral-800 bg-black/40 backdrop-blur-xl text-neutral-100 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-3xl font-bold tracking-tighter text-white">Create Account</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Get started with your free account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelClasses}>Username</label>
                                <Input 
                                    placeholder="johndoe" 
                                    value={username}
                                    onChange={e => setUsername(e.target.value)} 
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Email Address</label>
                                <Input 
                                    placeholder="name@example.com" 
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)} 
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Password</label>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)} 
                                    className={inputClasses}
                                />
                            </div>
                            <Button className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-medium transition-colors mt-2">
                                Sign Up
                            </Button>
                        </form>
                        <div className="mt-6 text-center text-sm text-neutral-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors hover:underline">
                                Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};