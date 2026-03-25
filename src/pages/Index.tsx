// ============================
// Index: Landing page with 3D title, Zid auth, host name input
// ============================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";
import { GoogleIcon, AppleIcon, EmailIcon } from "@/components/icons/AuthIcons";
import { validateZidPurchase, validateDebugCode } from "@/lib/zidMockService";
import GameTitle from "@/components/game/GameTitle";
import GameFooter from "@/components/game/GameFooter";
import patternTribal from "@/assets/pattern-tribal.webp";
import patternGeometric from "@/assets/pattern-geometric.webp";

const Index = () => {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("رحّال");
  const [roomCode, setRoomCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [debugCode, setDebugCode] = useState("");

  const handleSignIn = async (provider: "google" | "apple") => {
    setAuthLoading(provider);
    setAuthError("");
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setAuthError("حدث خطأ في تسجيل الدخول. حاول مرة أخرى.");
        console.error(`${provider} sign-in error:`, error);
      }
      // After OAuth, would validate Zid purchase on callback
    } catch (err) {
      setAuthError("تعذر الاتصال. تحقق من اتصال الإنترنت.");
      console.error(`${provider} sign-in failed:`, err);
    } finally {
      setAuthLoading(null);
    }
  };

  const handleEmailSignIn = async () => {
    setAuthLoading("email");
    setAuthError("");
    // Mock: validate Zid purchase for a demo email
    const result = await validateZidPurchase("team.rahal3@gmail.com");
    if (result.valid) {
      navigate("/lobby");
    } else {
      setAuthError(result.message);
    }
    setAuthLoading(null);
  };

  const handleDebugBypass = () => {
    if (validateDebugCode(debugCode)) {
      navigate("/lobby");
    } else {
      setAuthError("رمز غير صالح");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#1a3644' }}>
      {/* Background patterns */}
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10">
        {/* 3D Editable Title */}
        <motion.div
          className="mb-6 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <GameTitle hostName={hostName} editable onHostNameChange={setHostName} />
        </motion.div>

        {/* Host name input */}
        <motion.div
          className="w-full max-w-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <label className="text-cream/60 text-sm font-tajawal block mb-1.5">اسم المضيف</label>
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="أدخل اسمك هنا"
            className="w-full border rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none transition-colors"
            style={{
              backgroundColor: 'rgba(26,54,68,0.6)',
              borderColor: 'rgba(242,139,68,0.3)',
              color: 'hsl(var(--cream))',
            }}
          />
        </motion.div>

        {/* Auth buttons */}
        <motion.div
          className="flex flex-col gap-3 w-full max-w-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <button
            className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#fff', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            onClick={() => handleSignIn("google")}
            disabled={!!authLoading}
          >
            <GoogleIcon />
            {authLoading === "google" ? "جاري التسجيل..." : "تسجيل الدخول بـ Google"}
          </button>

          <button
            className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#000', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            onClick={() => handleSignIn("apple")}
            disabled={!!authLoading}
          >
            <AppleIcon />
            {authLoading === "apple" ? "جاري التسجيل..." : "تسجيل الدخول بـ Apple"}
          </button>

          <button
            className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #f28b44, #e07030)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(242,139,68,0.3)',
            }}
            onClick={handleEmailSignIn}
            disabled={!!authLoading}
          >
            <EmailIcon />
            {authLoading === "email" ? "جاري التحقق..." : "تسجيل الدخول بالبريد"}
          </button>

          {authError && (
            <motion.p
              className="text-center text-sm font-tajawal"
              style={{ color: '#ef4444' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {authError}
            </motion.p>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-3 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          <motion.button
            className="w-full py-4 rounded-xl font-tajawal font-[900] text-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #f28b44, #e07030)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(242,139,68,0.4)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(242,139,68,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/lobby")}
          >
            تسجيل دخول المضيف
          </motion.button>

          {!showJoin ? (
            <motion.button
              className="glass w-full py-4 rounded-xl font-tajawal font-bold text-xl transition-all"
              style={{ color: 'hsl(var(--cream))' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowJoin(true)}
            >
              الانضمام للعبة
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
                  className="flex-1 rounded-lg px-4 py-3 text-center text-2xl font-tajawal tracking-[0.3em] focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(26,54,68,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'hsl(var(--cream))',
                  }}
                  dir="ltr"
                />
                <motion.button
                  className="px-6 rounded-lg font-tajawal font-bold"
                  style={{ background: 'linear-gradient(135deg, #f28b44, #e07030)', color: '#fff' }}
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

          {/* Debug bypass */}
          <button
            className="text-cream/30 hover:text-cream/50 text-xs font-tajawal transition-colors mt-2"
            onClick={() => setShowDebug(!showDebug)}
          >
            وضع المطوّر
          </button>

          <AnimatePresence>
            {showDebug && (
              <motion.div
                className="glass rounded-xl p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-cream/50 text-xs font-tajawal mb-2">رمز الاستخدام غير المحدود (Debug)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={debugCode}
                    onChange={(e) => setDebugCode(e.target.value)}
                    placeholder="أدخل الرمز"
                    className="flex-1 rounded-lg px-3 py-2 text-sm font-tajawal focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(26,54,68,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'hsl(var(--cream))',
                    }}
                    dir="ltr"
                  />
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-tajawal font-bold"
                    style={{ background: 'linear-gradient(135deg, #4a80e8, #3668c0)', color: '#fff' }}
                    onClick={handleDebugBypass}
                  >
                    تحقق
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className="text-cream/40 hover:text-cream/60 text-sm font-tajawal transition-colors"
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
