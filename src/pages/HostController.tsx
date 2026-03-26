// ============================
// HostController: Mobile host dashboard showing answers, grading buttons
// ============================
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useBuzzer } from "@/hooks/useBuzzer";
import { getQuestionForLetter } from "@/lib/questionsDB";
import { supabase } from "@/integrations/supabase/client";
import GameFooter from "@/components/game/GameFooter";

const HostController = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "";

  const { buzzerState, buzzedTeam, openFloor, startRebound, resetBuzzer } = useBuzzer(roomId, true);
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{ question: string; answer: string; category: string } | null>(null);
  const [goldenIndex, setGoldenIndex] = useState<number | null>(null);
  const [roomData, setRoomData] = useState<any>(null);

  // Subscribe to room updates for current hex
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`host-ctrl-${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        setRoomData(payload.new);
        if (payload.new.current_hex_index !== null && payload.new.board) {
          const board = payload.new.board as any[];
          const cell = board[payload.new.current_hex_index];
          if (cell) {
            setCurrentLetter(cell.letter);
            if (cell.isGolden) {
              setCurrentQuestion({
                question: 'سؤال ذهبي! نقطة مجانية',
                answer: 'اختر الفريق',
                category: 'ذهبي',
              });
            } else {
              setCurrentQuestion(getQuestionForLetter(cell.letter));
            }
          }
        }
      })
      .subscribe();

    // Initial fetch
    supabase.from('rooms').select('*').eq('id', roomId).single().then(({ data }) => {
      if (data) {
        setRoomData(data);
        const board = data.board as any[];
        const golden = board?.findIndex((c: any) => c.isGolden);
        if (golden !== undefined && golden >= 0) setGoldenIndex(golden);
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const handleCorrect = (team: 'team1' | 'team2') => {
    // Update room: award hex, switch turn
    if (roomData?.board && roomData.current_hex_index !== null) {
      const newBoard = [...(roomData.board as any[])];
      newBoard[roomData.current_hex_index] = { ...newBoard[roomData.current_hex_index], status: team };
      const scoreKey = team === 'team1' ? 'team1_score' : 'team2_score';
      supabase.from('rooms').update({
        board: newBoard,
        [scoreKey]: (roomData[scoreKey] || 0) + 1,
        current_turn: team === 'team1' ? 'team2' : 'team1',
        current_hex_index: null,
        buzzer_state: 'idle',
      } as any).eq('id', roomId).then(() => {
        resetBuzzer();
        setCurrentQuestion(null);
        setCurrentLetter(null);
      });
    }
  };

  const handleWrong = () => {
    if (buzzedTeam) {
      startRebound(buzzedTeam);
    }
  };

  const buzzedTeamName = buzzedTeam === 'team1'
    ? (roomData?.team1_name || 'الفريق الأول')
    : (roomData?.team2_name || 'الفريق الثاني');
  const buzzedColor = buzzedTeam === 'team1'
    ? 'hsl(25, 87%, 61%)'
    : 'hsl(222, 78%, 60%)';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="pt-6 pb-3 px-4 text-center">
        <h1 className="text-xl font-tajawal font-[900] text-cream">لوحة تحكم المضيف</h1>
        <p className="text-cream/40 text-sm font-tajawal">الإجابات مرئية لك فقط</p>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Buzzer state */}
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-cream/60 text-sm font-tajawal mb-2">حالة الجرس</p>
          <div
            className="inline-block px-4 py-2 rounded-full font-tajawal font-bold"
            style={{
              backgroundColor: buzzerState === 'open' ? 'hsla(140, 60%, 45%, 0.2)' :
                buzzerState === 'locked' ? `${buzzedColor}20` : 'hsla(0, 0%, 50%, 0.2)',
              color: buzzerState === 'open' ? 'hsl(140, 60%, 50%)' :
                buzzerState === 'locked' ? buzzedColor : 'hsl(0, 0%, 60%)',
            }}
          >
            {buzzerState === 'idle' && 'غير فعّال'}
            {buzzerState === 'open' && 'مفتوح - في انتظار الإجابة'}
            {buzzerState === 'locked' && `${buzzedTeamName} ضغط!`}
            {buzzerState === 'rebound' && 'إعادة - ١٠ ثوانٍ'}
            {buzzerState === 'cooldown' && 'تبريد - ٣ ثوانٍ'}
          </div>
        </div>

        {/* Current question & answer */}
        {currentQuestion && (
          <div className="glass rounded-xl p-5">
            <div className="text-center mb-3">
              <span className="text-5xl font-tajawal font-[900] text-primary">{currentLetter}</span>
            </div>
            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'hsla(25, 87%, 61%, 0.1)', border: '1px solid hsla(25, 87%, 61%, 0.2)' }}>
              <p className="text-xs text-primary font-tajawal font-bold mb-1">السؤال</p>
              <p className="text-cream font-tajawal text-lg">{currentQuestion.question}</p>
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: 'hsla(140, 60%, 45%, 0.1)', border: '1px solid hsla(140, 60%, 45%, 0.2)' }}>
              <p className="text-xs font-tajawal font-bold mb-1" style={{ color: 'hsl(140, 60%, 50%)' }}>الإجابة</p>
              <p className="text-cream font-tajawal text-xl font-bold">{currentQuestion.answer}</p>
            </div>
          </div>
        )}

        {/* Golden question indicator */}
        {goldenIndex !== null && (
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-golden font-tajawal font-bold text-sm">
              ★ السؤال الذهبي في الخلية رقم {goldenIndex + 1}
            </p>
          </div>
        )}

        {/* Host action buttons */}
        <div className="space-y-3">
          {buzzerState === 'idle' && currentLetter && (
            <motion.button
              className="w-full py-4 rounded-xl font-tajawal font-bold text-lg text-white"
              style={{ background: 'linear-gradient(135deg, hsl(140, 60%, 45%), hsl(140, 60%, 35%))' }}
              whileTap={{ scale: 0.97 }}
              onClick={openFloor}
            >
              افتح الجرس للإجابة
            </motion.button>
          )}

          {buzzerState === 'locked' && (
            <>
              <motion.button
                className="w-full py-4 rounded-xl font-tajawal font-bold text-lg text-white"
                style={{ background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCorrect(buzzedTeam!)}
              >
                إجابة صحيحة ✓
              </motion.button>
              <motion.button
                className="w-full py-4 rounded-xl font-tajawal font-bold text-lg text-white"
                style={{ background: 'linear-gradient(135deg, hsl(0, 70%, 50%), hsl(0, 70%, 40%))' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWrong}
              >
                إجابة خاطئة ✗ (إعادة ١٠ ثوانٍ)
              </motion.button>
            </>
          )}
        </div>
      </div>

      <GameFooter />
    </div>
  );
};

export default HostController;
