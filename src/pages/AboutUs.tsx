// ============================
// About Us: Content from the uploaded من_نحن.html file
// ============================
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GameFooter from "@/components/game/GameFooter";

const sections = [
  {
    title: "من نحن في رحّـــال؟",
    text: [
      "انطلقنا من شغف عميق بقوة اللعب وقدرته على الإلهام والتعليم والجمع بين القلوب، لنؤسس وجهة فريدة لكل باحثٍ عن تجربة تتجاوز حدود المألوف.",
      "في عالمنا، كل لعبة هي مدينة نابضة بالحياة على خريطة واسعة من الإبداع، لها قصتها الخاصة وأسرارها التي تنتظر من يكتشفها. نحن نؤمن بأن اللعب ليس مجرد وسيلة للترفيه، بل هو رحلة شيّقة لاستكشاف الذات وتنمية المهارات وتعزيز الروابط.",
    ],
  },
  {
    title: "ماذا نصنع؟",
    text: [
      "نتخصص في تصميم وإنتاج باقة متكاملة من الألعاب التي تلبي كل الأذواق والاهتمامات: من الألعاب اللوحية التي تجمع العائلة والأصدقاء، والألعاب الورقية التي تشعل الذهن، إلى الألعاب الإلكترونية الحديثة والألعاب الحركية المليئة بالتفاعل والحيوية.",
      "تتنوع ألعابنا لتغطي مجالات واسعة تجمع بين الذكاء، المهارة، المعرفة، والقيم، وكل ذلك في إطار من التحدي والمرح.",
    ],
  },
  {
    title: "مبدأنا الأساسي",
    text: [
      "نضع رضى الله عز وجل ورسوله الكريم نصب أعيننا في كل خطوة نخطوها. نحرص على أن تكون جميع منتجاتنا متوافقة مع قيمنا، لتقدم محتوى هادفًا وآمنًا يثري العقل والروح، ويسهم في بناء جيلٍ واعٍ ومبدع.",
    ],
  },
  {
    title: "لماذا رحّـــال؟",
    text: [
      "لأننا نرى في كل لاعبٍ \"رحّالًا\" مغامرًا. هدفنا هو أن نأخذك في رحلة لا تُنسى، تنتقل فيها بين مدن ألعابنا، وتخوض تحدياتها، وتكشف أسرارها، وتكتسب في كل خطوة معرفة جديدة وقيمة راسخة.",
      "نسعى لأن نكون في كل بيت، نلهم العقول وننشر البهجة، ونعيد تعريف معنى اللعب ليصبح مغامرة ذات معنى ومتعة.",
    ],
  },
];

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col stage-bg sweep-light">
      {/* Header */}
      <header
        className="text-center py-16 px-4"
        style={{ background: 'var(--gradient-header)' }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-tajawal font-[900] text-primary mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          رحّـــال
        </motion.h1>
        <p className="text-cream/90 text-lg font-tajawal">
          لسنا مجرد صانعي ألعاب، بل نحن معماريو عوالمٍ ومصممو مغامرات.
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 flex flex-col gap-6 -mt-6 relative z-10">
        {sections.map((section, i) => (
          <motion.section
            key={i}
            className="bg-white/95 rounded-xl p-6 md:p-8 border-r-4 border-primary"
            style={{ boxShadow: 'var(--shadow-card)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <h2 className="text-2xl font-tajawal font-[800] text-teal-deep mb-3 flex items-center gap-2">
              {section.title}
            </h2>
            {section.text.map((p, j) => (
              <p key={j} className="text-midnight leading-relaxed text-justify mb-3 last:mb-0 font-tajawal">
                {p}
              </p>
            ))}
          </motion.section>
        ))}

        <motion.button
          className="btn-golden mx-auto px-8 py-3 rounded-xl font-tajawal font-bold text-lg mt-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
        >
          العودة للرئيسية
        </motion.button>
      </main>

      <GameFooter />
    </div>
  );
};

export default AboutUs;
