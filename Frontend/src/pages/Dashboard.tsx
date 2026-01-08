import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogTitle, DialogHeader, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Navbar } from '../components/Navbar';
import { Trash2, Plus, Users, Code, Copy, FolderGit2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// NEW IMPORTS
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";

export const Dashboard = () => {
    const { projects, fetchProjects, addProject, joinProject, deleteProject } = useProjectStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    // Modal States
    const [newProjectName, setNewProjectName] = useState('');
    const [joinProjectId, setJoinProjectId] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

    useEffect(() => { fetchProjects(); }, []);

    const handleCreate = async () => {
        if (!newProjectName) return;
        await addProject(newProjectName);
        setIsCreateOpen(false);
        setNewProjectName('');
        toast.success("Project created successfully!");
    };

    const handleJoin = async () => {
        if (!joinProjectId) return;
        try {
            await joinProject(joinProjectId);
            setIsJoinOpen(false);
            setJoinProjectId('');
            toast.success("Joined project successfully!");
        } catch (err) {
            toast.error("Failed to join. Check the Project ID.");
        }
    };

    const confirmDelete = async () => {
        if (projectToDelete) {
            await deleteProject(projectToDelete);
            setIsDeleteOpen(false);
            setProjectToDelete(null);
            toast.success("Project deleted permanently");
        }
    };

    const copyToClipboard = (id: string) => {
        navigator.clipboard.writeText(id);
        toast("Project ID copied to clipboard", {
            description: "Share this with your team members.",
            action: { label: "Close", onClick: () => console.log("Undo") },
        });
    };

    return (
        // Ensure this container is relative and overflows are hidden for the stars
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 relative overflow-hidden">
            
            {/* BACKGROUND ELEMENTS (z-0) */}
            <div className="absolute inset-0 z-0">
                 <ShootingStars starColor="#9E00FF" trailColor="#2EB9DF" minDelay={1000} maxDelay={3000} />
                 <StarsBackground starDensity={0.0002} allStarsTwinkle={true} twinkleProbability={0.8} minTwinkleSpeed={0.6} maxTwinkleSpeed={1.2}/>
            </div>

            {/* NAVBAR (High z-index fixed) */}
            <Navbar />

            {/* MAIN CONTENT (z-10 relative) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Your Projects
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Manage your codebases and collaborate in real-time.
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        {/* JOIN PROJECT */}
                        <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800 hover:text-white backdrop-blur-md">
                                    <Users className="mr-2 h-4 w-4 text-purple-400"/> Join Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                <DialogHeader><DialogTitle>Join Existing Project</DialogTitle></DialogHeader>
                                <div className="py-4">
                                    <p className="text-sm text-neutral-400 mb-2">Enter the Project ID provided by the owner.</p>
                                    <Input 
                                        placeholder="Paste Project ID here..." 
                                        value={joinProjectId} 
                                        onChange={e => setJoinProjectId(e.target.value)} 
                                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-blue-500/50"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleJoin} className="bg-purple-600 hover:bg-purple-700 text-white">Join Room</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* CREATE PROJECT */}
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/20">
                                    <Plus className="mr-2 h-4 w-4"/> New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
                                <div className="py-4">
                                    <Input 
                                        placeholder="Project Name (e.g., AI Chatbot)" 
                                        value={newProjectName} 
                                        onChange={e => setNewProjectName(e.target.value)} 
                                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-blue-500/50"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">Create Project</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* PROJECTS LIST */}
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20 backdrop-blur-sm">
                        <div className="p-4 rounded-full bg-neutral-800/50 mb-4">
                            <FolderGit2 className="h-8 w-8 text-neutral-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No projects yet</h3>
                        <p className="text-neutral-500 text-sm mb-6">Create your first project to start coding.</p>
                        <Button variant="secondary" onClick={() => setIsCreateOpen(true)}>Create Project</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(p => (
                            <Card 
                                key={p._id} 
                                onClick={() => navigate(`/editor/${p._id}`)} 
                                className="group relative bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
                            >
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white group-hover:text-blue-400 transition-colors">
                                        <Code className="h-5 w-5 text-blue-500" /> {p.name}
                                    </CardTitle>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
                                        <div className="flex flex-col gap-1">
                                            <span>Owner: <span className={p.owner._id === user?.id ? "text-green-400" : "text-neutral-300"}>{p.owner.username}</span></span>
                                            <span>{p.fileCount} Files</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center gap-2 relative z-10">
                                        <code className="bg-black/50 px-2 py-1.5 rounded text-[10px] text-neutral-500 font-mono truncate max-w-[120px] select-all">
                                            {p._id}
                                        </code>
                                        <Button 
                                            variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-white hover:bg-neutral-800"
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(p._id); }}
                                            title="Copy Project ID"
                                        >
                                            <Copy className="h-3 w-3"/>
                                        </Button>
                                    </div>
                                </CardContent>
                                
                                <CardFooter className="pt-0 flex justify-end">
                                    {p.owner._id === user?.id && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-500/70 hover:text-red-400 hover:bg-red-500/10 h-8 px-2 z-20 relative"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setProjectToDelete(p._id);
                                                setIsDeleteOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* DELETE DIALOG */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" /> Delete Project?
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="hover:bg-neutral-800 text-neutral-300">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete Forever</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};