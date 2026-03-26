// ============================
// GuestBuzzer: Mobile buzzer view for players
// Full-screen responsive push button
// ============================
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useBuzzer } from "@/hooks/useBuzzer";
import GameFooter from "@/components/game/GameFooter";

const GuestBuzzer = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "";
  const team = (searchParams.get("team") as 'team1' | 'team2') || "team1";
  const playerName = searchParams.get("name") || "لاعب";

  const { buzzerState, buzzedTeam, lockedOutTeam, buzz } = useBuzzer(roomId, false);
  const [pressed, setPressed] = useState(false);

  const isMyTeamLocked = lockedOutTeam === team;
  const canBuzz = (buzzerState === 'open') ||
    (buzzerState === 'rebound' && !isMyTeamLocked) ||
    (buzzerState === 'cooldown' && !isMyTeamLocked);

  const teamColor = team === 'team1' ? 'hsl(25, 87%, 61%)' : 'hsl(222, 78%, 60%)';

  const handleBuzz = () => {
    if (!canBuzz) return;
    setPressed(true);
    buzz(team);
    setTimeout(() => setPressed(false), 300);
  };

  // Button color based on state
  let buttonBg = 'hsl(140, 60%, 45%)'; // Green = ready
  let buttonText = 'اضغط!';
  let statusText = 'جاهز للإجابة';

  if (buzzerState === 'idle') {
    buttonBg = 'hsl(0, 0%, 40%)';
    buttonText = 'انتظر...';
    statusText = 'في انتظار السؤال';
  } else if (buzzerState === 'locked') {
    if (buzzedTeam === team) {
      buttonBg = teamColor;
      buttonText = 'أنت أجبت!';
      statusText = 'في انتظار حكم المضيف';
    } else {
      buttonBg = 'hsl(0, 0%, 35%)';
      buttonText = 'الفريق الآخر';
      statusText = 'الفريق المنافس أجاب أولاً';
    }
  } else if (buzzerState === 'rebound' && isMyTeamLocked) {
    buttonBg = 'hsl(0, 70%, 50%)';
    buttonText = 'محظور';
    statusText = 'دورك ممنوع - انتظر';
  } else if (buzzerState === 'cooldown' && isMyTeamLocked) {
    buttonBg = 'hsl(40, 90%, 50%)';
    buttonText = '٣ ثوانٍ...';
    statusText = 'تبريد - انتظر قليلاً';
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="pt-6 pb-3 px-4 text-center">
        <p className="text-cream/60 text-sm font-tajawal">{playerName}</p>
        <div
          className="inline-block px-4 py-1 rounded-full font-tajawal font-bold text-sm mt-1"
          style={{ backgroundColor: `${teamColor}20`, color: teamColor }}
        >
          {team === 'team1' ? 'الفريق الأول' : 'الفريق الثاني'}
        </div>
      </div>

      {/* Main buzzer area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.button
          className="w-64 h-64 md:w-80 md:h-80 rounded-full font-tajawal font-[900] text-4xl md:text-5xl text-white shadow-2xl select-none"
          style={{
            background: buttonBg,
            boxShadow: canBuzz
              ? `0 0 60px ${buttonBg}80, 0 10px 40px rgba(0,0,0,0.5), inset 0 -8px 20px rgba(0,0,0,0.3)`
              : `0 4px 20px rgba(0,0,0,0.4), inset 0 -4px 10px rgba(0,0,0,0.2)`,
          }}
          whileHover={canBuzz ? { scale: 1.05 } : {}}
          whileTap={canBuzz ? { scale: 0.92 } : {}}
          animate={pressed ? { scale: [1, 0.9, 1.05, 1] } : {}}
          onClick={handleBuzz}
          disabled={!canBuzz}
        >
          {buttonText}
        </motion.button>
      </div>

      {/* Status */}
      <div className="pb-6 px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            className="text-cream/50 font-tajawal text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
      </div>

      <GameFooter />
    </div>
  );
};

export default GuestBuzzer;
