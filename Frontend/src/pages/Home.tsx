import { useNavigate } from 'react-router-dom';
import { BackgroundBeams } from '../components/ui/background-beams';
import { TypewriterEffect } from '../components/ui/typewriter-effect';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar'; 
import { Code2, Sparkles, Terminal, Users } from 'lucide-react';
import { SparklesCore } from '../components/ui/Sparkles';
export const Home = () => {
    const navigate = useNavigate();

    const words = [
        { text: "Build", className: "text-white" },
        { text: "awesome", className: "text-white" },
        { text: "apps", className: "text-white" },
        { text: "with", className: "text-white" },
        { text: "CodeCraft.", className: "text-blue-500" },
    ];

    return (
        <div className="min-h-screen w-full bg-neutral-950 relative flex flex-col antialiased overflow-hidden text-white">
            
            {/* NAVBAR */}
            <Navbar />

            {/* Background */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <BackgroundBeams className="hidden md:block"/>
                <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="absolute inset-0 z-0 block md:hidden"
          particleColor={"#FFFFFF"}
        />
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col items-center justify-center p-4 z-10 relative text-center mt-10">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-xs text-neutral-400 mb-8 hover:border-neutral-700 transition-colors cursor-default">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span>Now with AI Assistance</span>
                </div>

                {/* Typewriter */}
                <div className="mb-8">
                     <TypewriterEffect words={words} className="text-4xl md:text-7xl font-bold" />
                </div>

                {/* Subtitle */}
                <p className="text-neutral-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
                    A powerful real-time code editor tailored for developers. 
                    Run code in 5+ languages, debug with AI, and collaborate instantly.
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                        size="lg"
                        onClick={() => navigate('/signup')}
                        className="bg-white text-black hover:bg-neutral-200 font-semibold px-10 h-12 rounded-full transition-transform active:scale-95 text-base shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Get Started Free
                    </Button>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-3 gap-8 mt-20 border-t border-neutral-800/50 pt-8 opacity-60">
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <Terminal className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">Multi-Lang</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <Users className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">Collab</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <Code2 className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">AI Power</span>
                    </div>
                </div>
            </div>

            {/* FOOTER (Transparent) */}
            <div className="relative z-10 w-full py-4 flex flex-col items-center justify-center">
                <p className="opacity-50 text-xs sm:text-sm text-neutral-400">
                    Made By <a href="https://github.com/Yogesh-dev318" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Yogesh Choudhary</a>
                </p>
            </div>

        </div>
    );
};