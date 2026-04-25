// ============================
// GameTitle: 3D CSS text-shadow title, editable via contentEditable
// ============================
import { motion } from "framer-motion";

interface GameTitleProps {
  hostName?: string;
  className?: string;
  editable?: boolean;
  onHostNameChange?: (name: string) => void;
}

const GameTitle = ({ hostName = "رحّال", className = "", editable = false, onHostNameChange }: GameTitleProps) => {
  return (
    <motion.div
      className={`text-center select-none ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}>
      
      <h1
        className="text-3xl md:text-5xl lg:text-6xl font-tajawal font-[900] leading-tight tracking-tight"
        style={{
          textShadow: `
            0 1px 0 hsl(20 76% 48%),
            0 2px 0 hsl(20 76% 43%),
            0 3px 0 hsl(20 76% 38%),
            0 4px 0 hsl(20 76% 33%),
            0 6px 10px rgba(0,0,0,0.4),
            0 10px 20px rgba(0,0,0,0.2)
          `
        }}>
        
        <span style={{ color: 'hsl(var(--cream))' }}>خلية </span>
        <span style={{ color: '#f28b44' }} className="text-primary-foreground">الحروف</span>
      </h1>
      <div
        className="text-lg md:text-2xl lg:text-3xl mt-1 font-tajawal font-bold"
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
        
        <span style={{ color: 'hsl(var(--cream))' }}>مع </span>
        {editable ? (
          <input
            type="text"
            value={hostName}
            onChange={(e) => onHostNameChange?.(e.target.value || 'رحّال')}
            className="bg-transparent outline-none border-b-2 border-dashed px-2 focus:border-primary text-center font-tajawal font-bold inline-block"
            style={{
              color: '#f28b44',
              borderColor: 'rgba(242,139,68,0.4)',
              width: `${Math.max(hostName.length, 4) + 2}ch`,
              fontSize: 'inherit',
              lineHeight: 'inherit',
            }}
            dir="rtl"
          />
        ) : (
          <span style={{ color: '#f28b44' }}>{hostName}</span>
        )}
      </div>
      <p className="text-cream/40 text-sm md:text-base mt-2 font-tajawal">
        تحدي المعرفة والسرعة
      </p>
    </motion.div>);

};

export default GameTitle;