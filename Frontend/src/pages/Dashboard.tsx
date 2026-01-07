import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogTitle, DialogHeader } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Trash2, Plus, LogOut, Users, Code, Copy } from 'lucide-react';

export const Dashboard = () => {
    const { projects, fetchProjects, addProject, joinProject, deleteProject } = useProjectStore();
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    
    // Modal States
    const [newProjectName, setNewProjectName] = useState('');
    const [joinProjectId, setJoinProjectId] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    useEffect(() => { fetchProjects(); }, []);

    const handleCreate = async () => {
        if (!newProjectName) return;
        await addProject(newProjectName);
        setIsCreateOpen(false);
        setNewProjectName('');
    };

    const handleJoin = async () => {
        if (!joinProjectId) return;
        try {
            await joinProject(joinProjectId);
            setIsJoinOpen(false);
            setJoinProjectId('');
        } catch (err) {
            alert("Failed to join. Check the Project ID.");
        }
    };

    const copyToClipboard = (id: string) => {
        navigator.clipboard.writeText(id);
        alert("Project ID copied to clipboard!");
    };

    return (
        <div className="p-8 min-h-screen bg-background text-foreground">
            <div className="flex flex-col md:flex-row justify-between mb-8 items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user?.username}</p>
                </div>
                <div className="flex gap-3">
                    {/* JOIN PROJECT BUTTON */}
                    <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Users className="mr-2 h-4 w-4"/> Join Project</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Join Existing Project</DialogTitle></DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-muted-foreground mb-2">Ask the project owner for their Project ID.</p>
                                <Input 
                                    placeholder="Paste Project ID here..." 
                                    value={joinProjectId} 
                                    onChange={e => setJoinProjectId(e.target.value)} 
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleJoin}>Join Room</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* NEW PROJECT BUTTON */}
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4"/> New Project</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
                            <Input 
                                placeholder="Project Name" 
                                value={newProjectName} 
                                onChange={e => setNewProjectName(e.target.value)} 
                            />
                            <DialogFooter>
                                <Button onClick={handleCreate}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="destructive" size="icon" onClick={() => { logout(); navigate('/'); }}>
                        <LogOut className="h-4 w-4"/>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(p => (
                    <Card key={p._id} onClick={() => navigate(`/editor/${p._id}`)} className="cursor-pointer hover:bg-muted/50 transition group relative">
                        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Code className="h-5 w-5 text-primary"/> {p.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-1">Owner: {p.owner.username}</p>
                            <p className="text-xs text-muted-foreground">{p.fileCount} Files</p>
                            
                            {/* COPY ID Button (Visible on Hover) */}
                            <div className="mt-4 flex items-center gap-2">
                                <code className="bg-muted px-2 py-1 rounded text-xs text-muted-foreground truncate max-w-[150px]">{p._id}</code>
                                <Button 
                                    variant="ghost" size="icon" className="h-6 w-6"
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(p._id); }}
                                >
                                    <Copy className="h-3 w-3"/>
                                </Button>
                            </div>
                        </CardContent>
                        
                        {/* Only Owner can delete */}
                        {p.owner._id === user?.id && (
                            <CardFooter className="pt-0">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                    onClick={(e) => { e.stopPropagation(); deleteProject(p._id); }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};