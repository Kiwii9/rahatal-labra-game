// ============================
// GameTitle: Dynamic 3D-styled title "خلية الحروف مع [Host Name]"
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
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-tajawal font-[900] leading-tight tracking-tight">
        {/* "خلية" in cream */}
        <span
          className="text-cream inline-block"
          style={{
            textShadow: "0 2px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          خلية{" "}
        </span>
        {/* "الحروف" in golden yellow */}
        <span
          className="text-golden inline-block"
          style={{
            textShadow:
              "0 2px 4px rgba(250,204,21,0.3), 0 4px 12px rgba(250,204,21,0.15), 0 0 30px rgba(250,204,21,0.1)",
          }}
        >
          الحروف
        </span>
      </h1>
      <div className="text-2xl md:text-3xl lg:text-4xl mt-2 font-tajawal font-bold">
        {/* "مع" in vibrant blue */}
        <span
          className="text-accent inline-block"
          style={{
            textShadow: "0 2px 8px rgba(59,130,246,0.3)",
          }}
        >
          مع{" "}
        </span>
        {/* Host name in terracotta */}
        <span
          className="text-primary inline-block"
          style={{
            textShadow: "0 2px 8px rgba(229,122,68,0.3)",
          }}
        >
          {hostName}
        </span>
      </div>
    </motion.div>
  );
};

export default GameTitle;
