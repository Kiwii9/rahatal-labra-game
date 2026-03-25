// ============================
// Index: Main landing page with 3D title, auth buttons, host name input
// ============================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";
import patternTribal from "@/assets/pattern-tribal.webp";
import patternGeometric from "@/assets/pattern-geometric.webp";
import GameFooter from "@/components/game/GameFooter";

const Index = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [authLoading, setAuthLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: "google" | "apple") => {
    setAuthLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        console.error(`${provider} sign-in error:`, error);
      }
    } catch (err) {
      console.error(`${provider} sign-in failed:`, err);
    } finally {
      setAuthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col stage-bg sweep-light relative">
      {/* Background patterns with blend mode */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url(${patternTribal})`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url(${patternGeometric})`,
          backgroundSize: '600px',
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        {/* 3D Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1
            className="text-5xl md:text-7xl font-tajawal font-[900] leading-tight"
            style={{
              textShadow: `
                0 1px 0 hsl(20 76% 48%),
                0 2px 0 hsl(20 76% 43%),
                0 3px 0 hsl(20 76% 38%),
                0 4px 0 hsl(20 76% 33%),
                0 5px 0 hsl(20 76% 28%),
                0 8px 15px rgba(0,0,0,0.4),
                0 12px 25px rgba(0,0,0,0.2)
              `,
            }}
          >
            <span style={{ color: 'hsl(var(--cream))' }}>خلية </span>
            <span style={{ color: 'hsl(var(--golden))' }}>الحروف</span>
          </h1>
          <p className="text-cream/50 text-lg md:text-xl font-tajawal mt-3">
            لعبة المعرفة والتحدي الجماعي
          </p>
        </motion.div>

        {/* Auth buttons */}
        <motion.div
          className="flex flex-col gap-3 w-full max-w-sm mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <button
            className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: '#fff',
              color: '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onClick={() => handleSignIn("google")}
            disabled={!!authLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {authLoading === "google" ? "جاري التسجيل..." : "تسجيل الدخول بـ Google"}
          </button>

          <button
            className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: '#000',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            onClick={() => handleSignIn("apple")}
            disabled={!!authLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {authLoading === "apple" ? "جاري التسجيل..." : "تسجيل الدخول بـ Apple"}
          </button>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-4 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            className="btn-golden w-full py-4 rounded-xl font-tajawal font-bold text-xl transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/lobby")}
          >
            🎙️ تسجيل دخول المضيف
          </motion.button>

          {!showJoin ? (
            <motion.button
              className="glass w-full py-4 rounded-xl font-tajawal font-bold text-xl text-cream transition-all hover:bg-cream/10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowJoin(true)}
            >
              🎮 الانضمام للعبة
            </motion.button>
          ) : (
            <motion.div
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <p className="text-cream/60 text-sm font-tajawal mb-2">أدخل رمز الغرفة</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="flex-1 bg-background/50 border border-cream/20 rounded-lg px-4 py-3 text-cream text-center text-2xl font-tajawal tracking-[0.3em] placeholder:text-cream/30 focus:outline-none focus:border-primary"
                  dir="ltr"
                />
                <motion.button
                  className="btn-terracotta px-6 rounded-lg font-tajawal font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => roomCode.length === 6 && navigate(`/game?room=${roomCode}&role=player`)}
                  disabled={roomCode.length !== 6}
                >
                  دخول
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.button
            className="text-cream/40 hover:text-cream/60 text-sm font-tajawal transition-colors mt-2"
            onClick={() => navigate("/about")}
          >
            من نحن؟
          </motion.button>
        </motion.div>
      </div>

      <GameFooter />
    </div>
  );
};

export default Index;
