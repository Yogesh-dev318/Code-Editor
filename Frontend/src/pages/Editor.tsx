import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useFileStore } from '../store/useFileStore';
import api from '../api/axios';
import { cn } from "../lib/utils";

// UI Components
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../components/ui/select";
import { 
    File, Plus, Trash2, Play, Bot, Loader2, Code2, 
    TerminalSquare, CheckCircle, Cloud, ArrowRightFromLine, 
    ChevronRight, Laptop2, LayoutDashboard, AlertTriangle,
    PanelLeft, X, Bug, Search, Sparkles, ArrowLeft, Clock, Timer
} from 'lucide-react';
import { toast } from 'sonner';

export const EditorPage = () => {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const { 
        files, activeFile, fetchFiles, createFile, deleteFile, setActiveFile, updateFileContent 
    } = useFileStore();

    // Local State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState("javascript");
    const [stdin, setStdin] = useState(""); 
    const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // Default to 1 (yourself)
    const [onlineUsers, setOnlineUsers] = useState(1);

    // Save & AI State
    const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Error">("Saved");
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // AI Rate Limit State
    const [usageCount, setUsageCount] = useState(0);
    const [rateLimitTimer, setRateLimitTimer] = useState(0);
    const [aiMode, setAiMode] = useState<'menu' | 'fix' | 'review' | 'generate'>('menu');
    
    // Constants
    const MAX_REQUESTS_PER_MINUTE = 3;

    // Dialog States
    const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [isDeleteFileOpen, setIsDeleteFileOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);

    const editorRef = useRef<any>(null);

    // 1. Language Detection & Mobile Init
    useEffect(() => {
        if (activeFile) {
            if (activeFile.name.endsWith('.py')) setLanguage('python');
            else if (activeFile.name.endsWith('.java')) setLanguage('java');
            else if (activeFile.name.endsWith('.cpp')) setLanguage('cpp');
            else if (activeFile.name.endsWith('.c')) setLanguage('c');
            else if (activeFile.name.endsWith('.ts')) setLanguage('typescript');
            else if (activeFile.name.endsWith('.rs')) setLanguage('rust');
            else setLanguage('javascript');
        }
    }, [activeFile]);

    // Close sidebar on mobile initially
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    // 2. Socket Connection & Sync
    useEffect(() => {
        if (projectId) {
            fetchFiles(projectId);
            const newSocket = io('/', { // Connects to the same domain
                transports: ['websocket'], 
                withCredentials: true 
            });
            setSocket(newSocket);
            newSocket.emit('join-project', projectId);

            // Listen for user count updates
            newSocket.on('user-count', (count: number) => {
                console.log("Online users update:", count); // Debug log
                setOnlineUsers(Math.max(1, count)); // Ensure it never shows 0
            });

            newSocket.on('code-update', ({ fileId, content }) => {
                updateFileContent(fileId, content);
            });

            newSocket.on('refresh-files', () => {
                fetchFiles(projectId); 
            });

            return () => { newSocket.disconnect(); };
        }
    }, [projectId]);

    // --- RATE LIMIT TIMER EFFECT ---
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (rateLimitTimer > 0) {
            interval = setInterval(() => {
                setRateLimitTimer((prev) => prev - 1);
            }, 1000);
        } else if (rateLimitTimer === 0 && usageCount >= MAX_REQUESTS_PER_MINUTE) {
            // Reset usage count after timer finishes
            setUsageCount(0);
        }
        return () => clearInterval(interval);
    }, [rateLimitTimer, usageCount]);

    // --- HANDLERS ---
    const handleCreateSubmit = async () => {
        if (!newFileName) return;
        const allowedExtensions = ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.rs'];
        const isValid = allowedExtensions.some(ext => newFileName.toLowerCase().endsWith(ext));

        if (!isValid) {
            toast.error("Unsupported File Type", { description: `Please use one of: ${allowedExtensions.join(', ')}` });
            return;
        }

        if (projectId) {
            try {
                await createFile(newFileName, projectId);
                socket?.emit('project-structure-updated', { projectId });
                toast.success("File created successfully");
                setIsCreateFileOpen(false);
                setNewFileName("");
            } catch (err) {
                toast.error("Failed to create file");
            }
        }
    };

    const handleDeleteSubmit = async () => {
        if (fileToDelete) {
            try {
                await deleteFile(fileToDelete);
                socket?.emit('project-structure-updated', { projectId });
                toast.success("File deleted");
                setIsDeleteFileOpen(false);
                setFileToDelete(null);
            } catch (err) {
                toast.error("Failed to delete file");
            }
        }
    };

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        editor.focus(); 
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && activeFile) {
            updateFileContent(activeFile._id, value);
            setSaveStatus("Saving...");
            if (socket) socket.emit('code-change', { projectId, fileId: activeFile._id, content: value });
            
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(async () => {
                try {
                    await api.put(`/files/${activeFile._id}`, { content: value });
                    setSaveStatus("Saved");
                } catch (err) { setSaveStatus("Error"); }
            }, 1000);
        }
    };

    const runCode = async () => {
        if (!activeFile) return;
        setIsRunning(true);
        setActiveTab('output'); 
        setOutput("Running selected file via Piston API...");

        try {
            const singleFilePayload = [{ name: activeFile.name, content: activeFile.content }];
            const res = await api.post('/run', { language, files: singleFilePayload, stdin });
            setOutput(res.data.output);
        } catch (err: any) {
            const errorMsg = err.response?.data?.output || err.message || "Execution Failed";
            setOutput(`Error: ${errorMsg}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleAi = async (context: 'fix' | 'review' | 'generate') => {
        // Rate Limit Check
        if (rateLimitTimer > 0) {
            toast.error(`Please wait ${rateLimitTimer}s before using AI again.`);
            return;
        }

        setIsAiLoading(true);
        try {
            // 1. Prepare Prompt with File Extension Context
            let promptToSend = aiPrompt;
            const fileExtension = activeFile?.name.split('.').pop() || 'js'; // Default to js if unknown
            
            if (context === 'fix') {
                promptToSend = `(File context: .${fileExtension}) \n\n ${output || "Please find and fix errors in this code."}`; 
            } else if (context === 'generate') {
                 // Append extension info for generation
                 promptToSend = `${aiPrompt} \n\n (Important: Generate code strictly for a .${fileExtension} file)`;
            }

            const res = await api.post('/ai/assist', { 
                code: context === 'generate' ? '' : activeFile?.content, 
                prompt: promptToSend, 
                context 
            });

            const result = res.data.result.replace(/```javascript|```python|```java|```cpp|```/g, '');
            
            if (context === 'fix' || context === 'generate') {
                handleEditorChange(result); 
                toast.success("Code updated successfully");
            } else { 
                setOutput(result); 
                setActiveTab('output'); 
                toast.success("Review completed");
            }
            
            setIsAiOpen(false); 
            setAiPrompt("");
            setAiMode('menu'); 

            // Increment Usage & Trigger Cooldown if needed
            const newCount = usageCount + 1;
            setUsageCount(newCount);
            if (newCount >= MAX_REQUESTS_PER_MINUTE) {
                setRateLimitTimer(60); 
            }

        } catch (err) { 
            toast.error("AI Request Failed"); 
        } finally { 
            setIsAiLoading(false); 
        }
    };

    // Reset AI mode when dialog opens
    useEffect(() => {
        if (isAiOpen) setAiMode('menu');
    }, [isAiOpen]);

    return (
        <div className="flex h-screen w-full bg-neutral-950 text-white overflow-hidden font-sans relative">
            
            {/* --- MOBILE BACKDROP --- */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR (EXPLORER) --- */}
            <div 
                className={cn(
                    "fixed lg:relative z-50 h-full flex-col border-r border-neutral-800 bg-neutral-900 transition-all duration-300 ease-in-out overflow-hidden shadow-2xl lg:shadow-none",
                    isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 opacity-0 lg:opacity-100"
                )}
            >
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between h-14 min-w-[256px]">
                    <span className="font-semibold text-sm flex items-center gap-2 text-neutral-300">
                        <Code2 className="h-4 w-4 text-blue-500" /> Explorer
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsCreateFileOpen(true)} className="h-6 w-6 text-neutral-400 hover:text-white hover:bg-neutral-800">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-6 w-6 text-neutral-400 hover:text-white hover:bg-neutral-800">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-[256px]">
                    {files.map(f => (
                        <div 
                            key={f._id} 
                            onClick={() => { setActiveFile(f); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
                            className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 ${
                                activeFile?._id === f._id 
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white border border-transparent'
                            }`}
                        >
                            <span className="flex items-center gap-2 truncate">
                                {activeFile?._id === f._id ? <ChevronRight className="h-3 w-3" /> : <File className="h-3 w-3" />}
                                {f.name}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-opacity" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setFileToDelete(f._id);
                                    setIsDeleteFileOpen(true);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MAIN EDITOR AREA --- */}
            <div className="flex flex-1 flex-col min-w-0 bg-neutral-950">
                
                {/* TOOLBAR */}
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 p-2 px-3 sm:px-4 h-14 shrink-0">
                    
                    {/* Left Section */}
                    <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                        
                        {!isSidebarOpen && (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsSidebarOpen(true)}
                                className="text-neutral-400 hover:text-white hover:bg-neutral-800 h-8 w-8 shrink-0"
                            >
                                <PanelLeft className="h-4 w-4" />
                            </Button>
                        )}

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate('/dashboard')}
                            className="text-neutral-400 hover:text-white hover:bg-neutral-800 gap-2 h-8 px-2 sm:px-3"
                        >
                            <LayoutDashboard className="h-4 w-4" /> 
                            <span className="hidden sm:inline">Dashboard</span>
                        </Button>
                        
                        <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />
                        
                        <span className="text-sm font-medium text-neutral-300 flex items-center gap-2 truncate">
                            {activeFile ? (
                                <><File className="h-4 w-4 text-neutral-500 shrink-0" /> <span className="truncate">{activeFile.name}</span></>
                            ) : (
                                <span className="text-neutral-600 italic truncate">Select file...</span>
                            )}
                        </span>
                        
                        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 ml-2">
                            {saveStatus === "Saved" ? (
                                <span className="flex items-center gap-1 text-green-500/80"><CheckCircle className="h-3 w-3"/> Saved</span>
                            ) : saveStatus === "Saving..." ? (
                                <span className="flex items-center gap-1 text-blue-500"><Cloud className="h-3 w-3 animate-pulse"/> Saving...</span>
                            ) : (
                                <span className="text-red-500">Error</span>
                            )}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {/* ONLINE USERS INDICATOR */}
                        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-400 mr-1 sm:mr-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-medium hidden sm:inline">{onlineUsers} Online</span>
                            <span className="font-medium sm:hidden">{onlineUsers}</span>
                        </div>

                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-[100px] sm:w-[120px] h-8 bg-neutral-900 border-neutral-800 text-neutral-300 text-xs focus:ring-0">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-300">
                                <SelectItem value="javascript">JS</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="c">C</SelectItem>
                                <SelectItem value="typescript">TS</SelectItem>
                                <SelectItem value="rust">Rust</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setIsAiOpen(true)}
                            className="h-8 w-8 sm:w-auto px-0 sm:px-3 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                        >
                            <Bot className="h-4 w-4 sm:mr-2" /> 
                            <span className="hidden sm:inline">AI</span>
                        </Button>
                        
                        <Button 
                            size="sm" 
                            className="h-8 bg-green-600 hover:bg-green-700 text-white px-3 sm:min-w-[80px] shadow-lg shadow-green-900/20" 
                            onClick={runCode} 
                            disabled={isRunning || !activeFile}
                        >
                            {isRunning ? <Loader2 className="mr-0 sm:mr-2 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-0 sm:mr-2 h-3.5 w-3.5" />} 
                            <span className="hidden sm:inline">Run</span>
                        </Button>
                    </div>
                </div>

                {/* EDITOR + OUTPUT SPLIT */}
                <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">
                    
                    {/* Editor Container */}
                    <div className="flex-1 relative min-h-0 min-w-0">
                        <Editor 
                            height="100%" 
                            theme="vs-dark" 
                            language={language === 'c' || language === 'cpp' ? 'cpp' : language} 
                            value={activeFile?.content || ""} 
                            onMount={handleEditorDidMount} 
                            onChange={handleEditorChange} 
                            options={{ 
                                minimap: { enabled: false }, 
                                fontSize: 14, 
                                fontFamily: 'JetBrains Mono, monospace', 
                                padding: { top: 20 }, 
                                automaticLayout: true, 
                                renderLineHighlight: 'line',
                                cursorBlinking: 'smooth',
                                smoothScrolling: true,
                            }} 
                        />
                    </div>

                    {/* Right Panel (Output/Input) */}
                    <div className="
                        w-full lg:w-[400px] lg:min-w-[400px] 
                        h-[40vh] lg:h-full 
                        border-t lg:border-t-0 lg:border-l border-neutral-800 
                        bg-neutral-950 flex flex-col 
                        shrink-0 z-10 shadow-xl lg:shadow-none
                    ">
                        <div className="flex border-b border-neutral-800 bg-neutral-900/50 shrink-0">
                            <button 
                                onClick={() => setActiveTab('output')} 
                                className={`flex-1 p-3 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'output' ? 'text-white border-b-2 border-blue-500 bg-neutral-800/50' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'}`}
                            >
                                <TerminalSquare className="h-3.5 w-3.5" /> Output
                            </button>
                            <button 
                                onClick={() => setActiveTab('input')} 
                                className={`flex-1 p-3 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'input' ? 'text-white border-b-2 border-green-500 bg-neutral-800/50' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'}`}
                            >
                                <ArrowRightFromLine className="h-3.5 w-3.5" /> Input
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-hidden relative bg-neutral-950">
                            {activeTab === 'output' ? (
                                <div className="h-full p-4 font-mono text-sm whitespace-pre-wrap text-neutral-300 overflow-y-auto custom-scrollbar">
                                    {output ? output : (
                                        <div className="h-full flex flex-col items-center justify-center text-neutral-700">
                                            <Laptop2 className="h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-xs">Run code to see output</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Textarea 
                                    className="h-full w-full bg-neutral-950 text-neutral-300 font-mono border-none focus-visible:ring-0 p-4 resize-none" 
                                    placeholder="Enter standard input (stdin) here..." 
                                    value={stdin} 
                                    onChange={(e) => setStdin(e.target.value)} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            
            <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New File</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Enter a filename with a supported extension.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-3">
                        <Input 
                            placeholder="e.g. main.js" 
                            value={newFileName} 
                            onChange={(e) => setNewFileName(e.target.value)} 
                            className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-blue-500/50"
                            autoFocus
                        />
                        <div className="text-[11px] text-neutral-500 bg-neutral-900/50 p-2 rounded border border-neutral-800">
                            <span className="font-semibold block mb-1">Supported Extensions:</span>
                            <div className="flex flex-wrap gap-1">
                                {['.js', '.ts', '.py', '.java', '.c', '.cpp', '.rs'].map(ext => (
                                    <span key={ext} className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">{ext}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateFileOpen(false)} className="text-neutral-400 hover:bg-neutral-800">Cancel</Button>
                        <Button onClick={handleCreateSubmit} className="bg-blue-600 hover:bg-blue-700">Create File</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteFileOpen} onOpenChange={setIsDeleteFileOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" /> Delete File?
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Are you sure you want to delete this file? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteFileOpen(false)} className="text-neutral-400 hover:bg-neutral-800">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteSubmit} className="bg-red-600 hover:bg-red-700">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Assistant Dialog - Refactored */}
            <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
                <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-400">
                            <Bot className="h-5 w-5" />AI Assistant
                        </DialogTitle>
                    </DialogHeader>

                    {/* AI MODE: MENU */}
                    {aiMode === 'menu' && (
                        <div className="grid grid-cols-1 gap-3 py-4">
                            
                            {/* RATE LIMIT COOLDOWN UI */}
                            {rateLimitTimer > 0 && (
                                <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg mb-2 text-red-400 animate-pulse">
                                    <Timer className="h-8 w-8 mb-2" />
                                    <span className="text-lg font-bold">Limit Reached</span>
                                    <span className="text-sm">AI available in {rateLimitTimer}s</span>
                                </div>
                            )}

                            {/* Option 1: Fix Bugs */}
                            <Button 
                                disabled={rateLimitTimer > 0}
                                className="h-16 w-full flex items-center justify-start gap-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setAiMode('fix')}
                            >
                                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Bug className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <span className="block font-medium text-white">Fix Bugs</span>
                                    <span className="text-xs text-neutral-400">Fix code based on console output</span>
                                </div>
                            </Button>

                            {/* Option 2: Code Review */}
                            <Button 
                                disabled={rateLimitTimer > 0}
                                className="h-16 w-full flex items-center justify-start gap-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setAiMode('review')}
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Search className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <span className="block font-medium text-white">Code Review</span>
                                    <span className="text-xs text-neutral-400">Analyze code for improvements</span>
                                </div>
                            </Button>

                            {/* Option 3: Generate Code */}
                            <Button 
                                disabled={rateLimitTimer > 0}
                                className="h-16 w-full flex items-center justify-start gap-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setAiMode('generate')}
                            >
                                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <span className="block font-medium text-white">Generate Code</span>
                                    <span className="text-xs text-neutral-400">Create new code from a prompt</span>
                                </div>
                            </Button>

                            {/* Rate Limit Notice */}
                            <div className="mt-2 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-neutral-500 bg-neutral-950/50 p-2 rounded border border-neutral-800/50">
                                <Clock className="h-3 w-3" />
                                <span>Usage Limit: {MAX_REQUESTS_PER_MINUTE - usageCount} uses remaining before cooldown.</span>
                            </div>
                        </div>
                    )}

                    {/* AI MODE: FIX */}
                    {aiMode === 'fix' && (
                        <div className="space-y-4 py-4">
                             <div className="bg-neutral-950 p-4 rounded-md border border-neutral-800 text-sm text-neutral-300">
                                <p className="font-semibold text-white mb-2 flex items-center gap-2"><Bug className="h-4 w-4"/> Fix Context:</p>
                                {output ? (
                                    <div className="font-mono text-xs opacity-70 line-clamp-6">
                                        {output}
                                    </div>
                                ) : (
                                    <span className="text-yellow-500 flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3"/> No output detected. AI will check code only.
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setAiMode('menu')} className="flex-1 text-neutral-400 hover:bg-neutral-800"><ArrowLeft className="h-4 w-4 mr-2"/> Back</Button>
                                <Button onClick={() => handleAi('fix')} disabled={isAiLoading} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white">
                                    {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Fix Code"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* AI MODE: REVIEW */}
                    {aiMode === 'review' && (
                        <div className="space-y-4 py-4">
                            <div className="bg-neutral-950 p-4 rounded-md border border-neutral-800 text-sm text-neutral-300">
                                <p className="font-semibold text-white mb-2 flex items-center gap-2"><Search className="h-4 w-4"/> Review Scope:</p>
                                <p>AI will analyze <b>{activeFile?.name}</b> for best practices, potential bugs, and optimization opportunities.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setAiMode('menu')} className="flex-1 text-neutral-400 hover:bg-neutral-800"><ArrowLeft className="h-4 w-4 mr-2"/> Back</Button>
                                <Button onClick={() => handleAi('review')} disabled={isAiLoading} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white">
                                    {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Start Review"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* AI MODE: GENERATE */}
                    {aiMode === 'generate' && (
                         <div className="space-y-4 py-4">
                            <Textarea 
                                placeholder="Describe the code you want to generate..." 
                                value={aiPrompt} 
                                onChange={(e) => setAiPrompt(e.target.value)} 
                                className="h-32 bg-neutral-950 border-neutral-800 text-white resize-none focus-visible:ring-purple-500/50" 
                            />
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setAiMode('menu')} className="flex-1 text-neutral-400 hover:bg-neutral-800"><ArrowLeft className="h-4 w-4 mr-2"/> Back</Button>
                                <Button onClick={() => handleAi('generate')} disabled={isAiLoading} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white">
                                    {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Generate"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};