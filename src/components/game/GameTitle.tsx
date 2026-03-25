// ============================
// GameTitle: Dynamic 3D-styled title "خلية الحروف مع [Host Name]"
// Fixed: no random numbers, clean rendering
// ============================
import { motion } from "framer-motion";

interface GameTitleProps {
  hostName?: string;
  className?: string;
}

const GameTitle = ({ hostName = "رحّال", className = "" }: GameTitleProps) => {
  return (
    <motion.div
      className={`text-center select-none ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-tajawal font-[900] leading-tight tracking-tight">
        <span className="text-cream" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          خلية{" "}
        </span>
        <span className="text-golden" style={{ textShadow: "0 2px 4px rgba(250,204,21,0.3), 0 0 20px rgba(250,204,21,0.1)" }}>
          الحروف
        </span>
      </h1>
      <div className="text-xl md:text-2xl lg:text-3xl mt-1 font-tajawal font-bold">
        <span className="text-accent" style={{ textShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
          مع{" "}
        </span>
        <span className="text-primary" style={{ textShadow: "0 2px 8px rgba(229,122,68,0.3)" }}>
          {hostName}
        </span>
      </div>
    </motion.div>
  );
};

export default GameTitle;
