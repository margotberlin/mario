import { KaboomGame } from "@/components/KaboomGame";
import { Sparkles, Trophy, Star, Gamepad2 } from "lucide-react";
import { useHealthPing } from "@/hooks/use-health";

export default function Home() {
  // Simple check just to ensure API hooks format works, safely ignoring errors
  useHealthPing();

  return (
    <div className="min-h-screen flex flex-col pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-20 left-10 text-yellow-300 opacity-50 -rotate-12 pointer-events-none">
        <Sparkles size={64} />
      </div>
      <div className="absolute bottom-40 right-10 text-primary opacity-30 rotate-12 pointer-events-none">
        <Star size={80} fill="currentColor" />
      </div>
      
      <div className="max-w-5xl mx-auto w-full relative z-10 flex-grow flex flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl border-4 border-foreground shadow-playful-sm flex items-center justify-center rotate-3">
              <Gamepad2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-black text-foreground uppercase tracking-tight">
                Cube<span className="text-primary">Dasher</span>
              </h1>
              <p className="text-lg text-muted-foreground font-semibold">Jump, dodge, and collect!</p>
            </div>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl border-4 border-foreground shadow-playful-sm flex items-center gap-3 -rotate-2">
            <Trophy className="text-secondary" fill="currentColor" />
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Local Best</p>
              <p className="text-xl font-black font-display leading-none">
                {typeof window !== 'undefined' ? localStorage.getItem("platformerHighScore") || "0" : "0"}
              </p>
            </div>
          </div>
        </header>

        {/* Game Container */}
        <main className="flex-grow flex items-center justify-center">
          <KaboomGame />
        </main>
        
        {/* Instructions */}
        <footer className="mt-16 max-w-2xl mx-auto text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border-4 border-foreground shadow-playful-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl border-4 border-foreground bg-yellow-400 mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]"></div>
              <h3 className="font-display font-bold text-lg">You</h3>
              <p className="text-muted-foreground text-sm font-semibold">Keep bouncing!</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-4 border-foreground shadow-playful-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl border-4 border-foreground bg-red-500 mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]"></div>
              <h3 className="font-display font-bold text-lg">Avoid</h3>
              <p className="text-muted-foreground text-sm font-semibold">Watch out!</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-4 border-foreground shadow-playful-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl border-4 border-foreground bg-yellow-500 mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]"></div>
              <h3 className="font-display font-bold text-lg">Collect</h3>
              <p className="text-muted-foreground text-sm font-semibold">+100 Points</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
