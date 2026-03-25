// ============================
// Footer: Transparent background, social links, subtle branding
// ============================
import mascotImg from "@/assets/mascot.png";

const socials = [
  { label: "TikTok", url: "https://www.tiktok.com/@rahaalstore", icon: "🎵" },
  { label: "Instagram", url: "https://www.instagram.com/rahaalstore", icon: "📸" },
  { label: "المتجر", url: "https://rsfara.zid.store/", icon: "🛒" },
  { label: "واتساب", url: "https://wa.me/966546190373", icon: "💬" },
  { label: "البريد", url: "mailto:team.rahal3@gmail.com", icon: "✉️" },
];

const GameFooter = () => {
  return (
    <footer className="w-full py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <img
          src={mascotImg}
          alt="رحّال"
          className="w-12 h-12 object-contain mx-auto mb-3 opacity-30"
        />
        <p className="text-cream/60 font-tajawal text-base font-bold mb-3">
          رحّـــال | صانعو عوالم ومغامرات
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 hover:text-golden transition-colors text-sm font-tajawal"
            >
              {s.icon} {s.label}
            </a>
          ))}
        </div>
        <p className="text-cream/30 text-xs font-tajawal">
          © {new Date().getFullYear()} رحّال. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default GameFooter;
