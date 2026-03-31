// ============================
// Index: Landing page with auth (Google/Apple/Email), Zid purchase validation, debug codes
// ============================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { GoogleIcon, AppleIcon, EmailIcon } from "@/components/icons/AuthIcons";
import { validateZidPurchase, validateDebugCode } from "@/lib/zidMockService";
import GameTitle from "@/components/game/GameTitle";
import GameFooter from "@/components/game/GameFooter";

const Index = () => {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("رحّال");
  const [roomCode, setRoomCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [debugCode, setDebugCode] = useState("");
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState("");
  const [showPurchaseValidation, setShowPurchaseValidation] = useState(false);

  // Check if already logged in on mount & listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await (supabase as any)
          .from('profiles').select('*').eq('user_id', session.user.id).single();
        if ((profile as any)?.purchase_verified) {
          navigate("/lobby");
        } else {
          setShowPurchaseValidation(true);
        }
      }
    });
    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await (supabase as any)
          .from('profiles').select('*').eq('user_id', session.user.id).single();
        if ((profile as any)?.purchase_verified) {
          navigate("/lobby");
        } else if (profile) {
          setShowPurchaseValidation(true);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (provider: "google" | "apple") => {
    setAuthLoading(provider);
    setAuthError("");
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider as "google" | "apple", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setAuthError("حدث خطأ في تسجيل الدخول. حاول مرة أخرى.");
      }
    } catch (err) {
      setAuthError("تعذر الاتصال. تحقق من اتصال الإنترنت.");
    } finally {
      setAuthLoading(null);
    }
  };

  const handleEmailAuth = async () => {
    setAuthLoading("email");
    setAuthError("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setAuthError("تم إرسال رابط التأكيد إلى بريدك الإلكتروني");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || "حدث خطأ في تسجيل الدخول");
    } finally {
      setAuthLoading(null);
    }
  };

  const handlePurchaseValidation = async () => {
    setAuthError("");
    const result = await validateZidPurchase(email || "");
    const codeValid = validateDebugCode(purchaseCode);
    if (result.valid || codeValid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from('profiles').update({
          purchase_code: purchaseCode || result.purchaseId,
          purchase_verified: true,
          display_name: hostName,
        } as any).eq('user_id', user.id);
      }
      navigate("/lobby");
    } else {
      setAuthError("رمز الشراء غير صالح. يرجى شراء اللعبة من متجر Zid أو إدخال رمز صالح.");
    }
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
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/patterns/tribal-pattern.webp)',
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          opacity: 0.04,
          mixBlendMode: 'soft-light',
        }}
      />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10">
        <motion.div className="mb-6 md:mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
          <GameTitle hostName={hostName} editable onHostNameChange={setHostName} />
        </motion.div>

        <motion.div className="w-full max-w-sm mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <label className="text-cream/60 text-sm font-tajawal block mb-1.5">اسم المضيف</label>
          <input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="أدخل اسمك هنا"
            className="w-full border rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none"
            style={{ backgroundColor: 'rgba(26,54,68,0.6)', borderColor: 'rgba(242,139,68,0.3)', color: 'hsl(var(--cream))' }} />
        </motion.div>

        {showPurchaseValidation ? (
          <motion.div className="w-full max-w-sm glass rounded-2xl p-6 mb-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className="text-cream text-lg font-tajawal font-bold mb-3 text-center">تحقق من رمز الشراء</h3>
            <p className="text-cream/50 text-sm font-tajawal mb-4 text-center">أدخل رمز الشراء من متجر Zid أو رمز المطوّر</p>
            <input value={purchaseCode} onChange={(e) => setPurchaseCode(e.target.value)} placeholder="RAHAAL2024"
              className="w-full border rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none mb-3"
              style={{ backgroundColor: 'rgba(26,54,68,0.6)', borderColor: 'rgba(242,139,68,0.3)', color: 'hsl(var(--cream))' }} dir="ltr" />
            <motion.button className="w-full py-3 rounded-xl font-tajawal font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #f28b44, #e07030)' }} whileTap={{ scale: 0.97 }} onClick={handlePurchaseValidation}>
              تحقق وابدأ
            </motion.button>
            {authError && <p className="text-red-400 text-sm font-tajawal text-center mt-2">{authError}</p>}
          </motion.div>
        ) : (
          <>
            <motion.div className="flex flex-col gap-3 w-full max-w-sm mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <button className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#fff', color: '#333' }} onClick={() => handleSignIn("google")} disabled={!!authLoading}>
                <GoogleIcon />{authLoading === "google" ? "جاري التسجيل..." : "تسجيل الدخول بـ Google"}
              </button>
              <button className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#000', color: '#fff' }} onClick={() => handleSignIn("apple")} disabled={!!authLoading}>
                <AppleIcon />{authLoading === "apple" ? "جاري التسجيل..." : "تسجيل الدخول بـ Apple"}
              </button>
              <button className="w-full py-3 rounded-xl font-tajawal font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #f28b44, #e07030)', color: '#fff' }} onClick={() => setShowEmailAuth(!showEmailAuth)}>
                <EmailIcon />تسجيل الدخول بالبريد
              </button>
              <AnimatePresence>
                {showEmailAuth && (
                  <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني"
                      className="w-full rounded-lg px-4 py-3 font-tajawal text-center focus:outline-none"
                      style={{ backgroundColor: 'rgba(26,54,68,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'hsl(var(--cream))' }} dir="ltr" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور"
                      className="w-full rounded-lg px-4 py-3 font-tajawal text-center focus:outline-none"
                      style={{ backgroundColor: 'rgba(26,54,68,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'hsl(var(--cream))' }} dir="ltr" />
                    <div className="flex gap-2">
                      <motion.button className="flex-1 py-3 rounded-lg font-tajawal font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #f28b44, #e07030)' }} whileTap={{ scale: 0.97 }}
                        onClick={() => { setIsSignUp(false); handleEmailAuth(); }} disabled={!!authLoading}>دخول</motion.button>
                      <motion.button className="flex-1 py-3 rounded-lg font-tajawal font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #4a80e8, #3668c0)' }} whileTap={{ scale: 0.97 }}
                        onClick={() => { setIsSignUp(true); handleEmailAuth(); }} disabled={!!authLoading}>حساب جديد</motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {authError && <motion.p className="text-center text-sm font-tajawal" style={{ color: '#ef4444' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{authError}</motion.p>}
            </motion.div>

            <motion.div className="flex flex-col gap-3 w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              {!showJoin ? (
                <motion.button className="glass w-full py-4 rounded-xl font-tajawal font-bold text-xl" style={{ color: 'hsl(var(--cream))' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowJoin(true)}>الانضمام للعبة</motion.button>
              ) : (
                <motion.div className="glass rounded-xl p-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <p className="text-cream/60 text-sm font-tajawal mb-2">أدخل رمز الغرفة</p>
                  <div className="flex gap-2">
                    <input type="text" maxLength={6} value={roomCode} onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))} placeholder="000000"
                      className="flex-1 rounded-lg px-4 py-3 text-center text-2xl font-tajawal tracking-[0.3em] focus:outline-none"
                      style={{ backgroundColor: 'rgba(26,54,68,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'hsl(var(--cream))' }} dir="ltr" />
                    <motion.button className="px-6 rounded-lg font-tajawal font-bold" style={{ background: 'linear-gradient(135deg, #f28b44, #e07030)', color: '#fff' }}
                      whileTap={{ scale: 0.95 }} onClick={() => roomCode.length === 6 && navigate(`/join?pin=${roomCode}`)} disabled={roomCode.length !== 6}>دخول</motion.button>
                  </div>
                </motion.div>
              )}
              {/* Developer mode removed - debug access is now via activation codes or developer email only */}
              <motion.button className="text-cream/40 hover:text-cream/60 text-sm font-tajawal transition-colors" onClick={() => navigate("/about")}>من نحن؟</motion.button>
            </motion.div>
          </>
        )}
      </div>
      <GameFooter />
    </div>
  );
};

export default Index;
