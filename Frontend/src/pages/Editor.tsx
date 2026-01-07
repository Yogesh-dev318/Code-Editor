import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useFileStore } from '../store/useFileStore';
import api from '../api/axios';

// UI Components
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { 
    File, Plus, Trash2, Play, Bot, Loader2, Code2, 
    TerminalSquare, CheckCircle, Cloud, ArrowRightFromLine
} from 'lucide-react';

export const EditorPage = () => {
    const { id: projectId } = useParams();
    const { 
        files, activeFile, fetchFiles, createFile, deleteFile, setActiveFile, updateFileContent 
    } = useFileStore();

    // Local State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState("javascript");
    
    // NEW: Input Management
    const [stdin, setStdin] = useState(""); 
    const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');

    // Save & AI State
    const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Error">("Saved");
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const editorRef = useRef<any>(null);

    // Language Detection
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

    // Socket Setup
    useEffect(() => {
        if (projectId) {
            fetchFiles(projectId);
            const newSocket = io('http://localhost:3000');
            setSocket(newSocket);
            newSocket.emit('join-project', projectId);
            newSocket.on('code-update', ({ fileId, content }) => {
                updateFileContent(fileId, content);
            });
            return () => { newSocket.disconnect(); };
        }
    }, [projectId]);

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

    // Run Code with Input
    const runCode = async () => {
        if (!activeFile) return;

        setIsRunning(true);
        setActiveTab('output'); // Auto switch to output tab to see result
        setOutput("Running selected file via Piston API...");

        try {
            const singleFilePayload = [{ name: activeFile.name, content: activeFile.content }];

            const res = await api.post('/run', { 
                language: language,
                files: singleFilePayload,
                stdin: stdin // SEND INPUT TO BACKEND
            });
            setOutput(res.data.output);
        } catch (err: any) {
            const errorMsg = err.response?.data?.output || err.message || "Execution Failed";
            setOutput(`Error: ${errorMsg}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleAi = async (context: 'fix' | 'review' | 'generate') => {
        setIsAiLoading(true);
        try {
            const res = await api.post('/ai/assist', { code: context === 'generate' ? '' : activeFile?.content, prompt: aiPrompt, context });
            const result = res.data.result.replace(/```javascript|```python|```java|```cpp|```/g, '');
            if (context === 'fix' || context === 'generate') handleEditorChange(result); 
            else { setOutput(result); setActiveTab('output'); }
            setIsAiOpen(false); setAiPrompt("");
        } catch (err) { alert("AI Request Failed"); } finally { setIsAiLoading(false); }
    };

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
            {/* SIDEBAR */}
            <div className="w-64 flex flex-col border-r border-border bg-muted/20">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2"><Code2 className="h-4 w-4" /> Explorer</span>
                    <Button variant="ghost" size="icon" onClick={() => { const name = prompt("File Name?"); if(name && projectId) createFile(name, projectId); }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {files.map(f => (
                        <div key={f._id} onClick={() => setActiveFile(f)} className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${activeFile?._id === f._id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                            <span className="flex items-center gap-2 truncate"><File className="h-4 w-4" /> {f.name}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteFile(f._id); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* TOOLBAR */}
                <div className="flex items-center justify-between border-b border-border bg-background p-2 px-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{activeFile?.name || "No File Selected"}</span>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-[130px] h-8"><SelectValue placeholder="Language" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="c">C</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                                <SelectItem value="rust">Rust</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                            {saveStatus === "Saved" ? <CheckCircle className="h-3 w-3 text-green-500"/> : saveStatus === "Saving..." ? <Cloud className="h-3 w-3 animate-pulse text-blue-500"/> : <span className="text-red-500">Error</span>}
                            {saveStatus}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsAiOpen(true)}><Bot className="mr-2 h-4 w-4 text-purple-500" /> AI</Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white min-w-[80px]" onClick={runCode} disabled={isRunning || !activeFile}>
                            {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />} Run
                        </Button>
                    </div>
                </div>

                {/* EDITOR + PANEL SPLIT */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 relative">
                        <Editor height="100%" theme="vs-dark" language={language === 'c' || language === 'cpp' ? 'cpp' : language} value={activeFile?.content || ""} onMount={handleEditorDidMount} onChange={handleEditorChange} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, automaticLayout: true, contextmenu: true }} />
                    </div>

                    {/* RIGHT PANEL: OUTPUT & INPUT */}
                    <div className="w-[35%] border-l border-border bg-zinc-950 flex flex-col">
                        {/* Panel Tabs */}
                        <div className="flex border-b border-zinc-800 bg-zinc-900">
                            <button 
                                onClick={() => setActiveTab('output')}
                                className={`flex-1 p-3 text-xs font-mono uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors ${activeTab === 'output' ? 'text-white border-b-2 border-primary bg-zinc-900' : 'text-zinc-500'}`}
                            >
                                <TerminalSquare className="h-4 w-4" /> Output
                            </button>
                            <button 
                                onClick={() => setActiveTab('input')}
                                className={`flex-1 p-3 text-xs font-mono uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors ${activeTab === 'input' ? 'text-white border-b-2 border-primary bg-zinc-900' : 'text-zinc-500'}`}
                            >
                                <ArrowRightFromLine className="h-4 w-4" /> Input
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-hidden relative">
                            {activeTab === 'output' ? (
                                <div className="h-full p-4 font-mono text-sm whitespace-pre-wrap text-zinc-300 overflow-y-auto">
                                    {output || <span className="text-zinc-600 italic">No output yet...</span>}
                                </div>
                            ) : (
                                <Textarea 
                                    className="h-full w-full bg-zinc-950 text-zinc-300 font-mono border-none focus-visible:ring-0 p-4 resize-none"
                                    placeholder="Enter your program input here (stdin)..."
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Gemini AI Assistant</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea placeholder="Ask AI..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="h-32" />
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" onClick={() => handleAi('fix')}>Fix Bugs</Button>
                            <Button variant="outline" onClick={() => handleAi('review')}>Review</Button>
                            <Button className="bg-purple-600" onClick={() => handleAi('generate')}>Generate</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};