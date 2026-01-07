import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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
        <div className="flex h-screen items-center justify-center bg-background">
            <Card className="w-96">
                <CardHeader><CardTitle>Login</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
                        <Input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                        <Button className="w-full">Login</Button>
                    </form>
                </CardContent>
            </Card>
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
        <div className="flex h-screen items-center justify-center bg-background">
            <Card className="w-96">
                <CardHeader><CardTitle>Sign Up</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input placeholder="Username" onChange={e => setUsername(e.target.value)} />
                        <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
                        <Input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                        <Button className="w-full">Sign Up</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};