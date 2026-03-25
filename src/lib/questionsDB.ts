// ============================
// Questions Database: Extracted from uploaded PDF trivia file
// Each letter maps to an array of {question, answer, category}
// ============================

export interface Question {
  question: string;
  answer: string;
  category: string;
}

export const QUESTIONS_DB: Record<string, Question[]> = {
  'أ': [
    { question: 'سورة في القرآن الكريم يطلق عليها أخت الأنعام؟', answer: 'الأعراف', category: 'قرآن' },
    { question: 'غزوة جرح فيها رسول الله ﷺ وكسرت رباعيته؟', answer: 'أحد', category: 'إسلام' },
    { question: 'أول من جمع القرآن الكريم بين لوحين؟', answer: 'أبو بكر الصديق', category: 'إسلام' },
    { question: 'أبو البشر؟', answer: 'آدم عليه السلام', category: 'إسلام' },
    { question: 'مادة تصنع من مزج الماء والرمل والحصى والتراب؟', answer: 'الأسمنت', category: 'عام' },
    { question: 'ما اسم زوجة فرعون؟', answer: 'آسيا', category: 'إسلام' },
    { question: 'لقب أطلقه أهل مكة على محمد ﷺ قبل الإسلام؟', answer: 'الأمين', category: 'إسلام' },
    { question: 'حيوان يطلق عليه أسماء كثيرة؟', answer: 'الأسد', category: 'حيوانات' },
    { question: 'شاعر جاهلي لقب بذي القروح؟', answer: 'امرؤ القيس', category: 'أدب' },
    { question: 'مؤلف كتاب لسان العرب؟', answer: 'ابن منظور', category: 'أدب' },
    { question: 'الفيلسوف الذي أطلق عليه لقب المعلم الأول؟', answer: 'أرسطو', category: 'فلسفة' },
    { question: 'وكالة الأنباء التركية؟', answer: 'الأناضول', category: 'إعلام' },
    { question: 'وحدة لقياس شدة التيار الكهربائي؟', answer: 'الأمبير', category: 'علوم' },
    { question: 'الاسم الذي كان يطلق على أسبانيا قديمًا؟', answer: 'الأندلس', category: 'جغرافيا' },
  ],
  'ب': [
    { question: 'سورة من سور القرآن الكريم يطلق عليها سنام القرآن؟', answer: 'البقرة', category: 'قرآن' },
    { question: 'عالم مسلم اكتشف أن سرعة الضوء أكبر من سرعة الصوت؟', answer: 'البيروني', category: 'علوم' },
    { question: 'الحرب التي حدثت في الجاهلية واستمرت قرابة الأربعين عامًا بين قبيلتي بكر وتغلب؟', answer: 'البسوس', category: 'تاريخ' },
    { question: 'ما عاصمة كولومبيا؟', answer: 'بوجوتا', category: 'جغرافيا' },
    { question: 'أول طبيب أجرى عملية زراعة قلب؟', answer: 'برنارد', category: 'طب' },
    { question: 'مدينة أوروبية أقيمت فيها أول دورة أولمبية عام 1900م؟', answer: 'باريس', category: 'رياضة' },
    { question: 'الفيلسوف الهندي الذي كتب كتاب كليلة ودمنة؟', answer: 'بيدبا', category: 'أدب' },
    { question: 'لقب أطلق على السيدة مريم أم نبي الله عيسى عليه السلام؟', answer: 'البتول', category: 'إسلام' },
    { question: 'دولة في أمريكا اللاتينية هي الوحيدة التي تتكلم البرتغالية؟', answer: 'البرازيل', category: 'جغرافيا' },
    { question: 'أبعد الكواكب عن الشمس اكتشف مطلع القرن العشرين؟', answer: 'بلوتو', category: 'فضاء' },
    { question: 'في القرآن الكريم ذكر لفظ الزمهرير فما معناه؟', answer: 'البرد الشديد', category: 'قرآن' },
    { question: 'من الدول التي تمتلك حق النقض (الفيتو)؟', answer: 'بريطانيا', category: 'سياسة' },
  ],
  'ت': [
    { question: 'سورة في القرآن الكريم ابتدأت باسم ثمرتين؟', answer: 'التين', category: 'قرآن' },
    { question: 'مرض من الأمراض الصيفية وهو حمى خبيثة؟', answer: 'التيفود', category: 'طب' },
    { question: 'أعلى هضبة في العالم؟', answer: 'التبت', category: 'جغرافيا' },
    { question: 'عاصمة الصين الوطنية؟', answer: 'تايبيه', category: 'جغرافيا' },
    { question: 'مؤلف كتاب مشكاة المصابيح؟', answer: 'التبريزي', category: 'أدب' },
    { question: 'أكمل العبارة المشهورة: تاج المروءة ...؟', answer: 'التواضع', category: 'ثقافة' },
    { question: 'مقبرة هندية مبنية من الرخام الأبيض تعتبر من عجائب الدنيا السبع؟', answer: 'تاج محل', category: 'عمارة' },
    { question: 'مكوك فضائي أمريكي انفجر بعد ثوان من انطلاقه عام 1986م؟', answer: 'تشالنجر', category: 'فضاء' },
    { question: 'مدينة يمنية مشهورة من أشهر معالمها جبل صبر؟', answer: 'تعز', category: 'جغرافيا' },
    { question: 'آلة تستخدم في رؤية أجسام بعيدة جدًا؟', answer: 'تلسكوب', category: 'علوم' },
    { question: 'عاصمة جمهورية جورجيا؟', answer: 'تفليس', category: 'جغرافيا' },
    { question: 'ما الدولة التي عاصمتها عشق آباد؟', answer: 'تركمانستان', category: 'جغرافيا' },
  ],
  'ث': [
    { question: 'صحابي جليل بايع الرسول على ألا يسأل الناس شيئًا - مولى رسول الله؟', answer: 'ثوبان', category: 'إسلام' },
    { question: 'يطلق على المرأة التي سبق لها الزواج؟', answer: 'ثيّب', category: 'لغة' },
    { question: 'مؤلف كتاب فقه اللغة؟', answer: 'الثعالبي', category: 'أدب' },
    { question: 'الغاز الذي يستعمل في إطفاء الحرائق؟', answer: 'ثاني أكسيد الكربون', category: 'علوم' },
    { question: 'أول من دخل الكعبة ملبيًا؟', answer: 'ثمامة بن أثال', category: 'إسلام' },
    { question: 'مضاد حيوي طبيعي يستخدم في الطعام والدواء؟', answer: 'الثوم', category: 'صحة' },
    { question: 'من الصحابة لُقّب بخطيب الرسول؟', answer: 'ثابت بن قيس', category: 'إسلام' },
    { question: 'جهاز تسجل به حرارة الجو بطريقة آلية؟', answer: 'ثرموجراف', category: 'علوم' },
    { question: 'طعام يتكون من خبز ومرق؟', answer: 'ثريد', category: 'طعام' },
    { question: 'مجموعة النجوم المتصلة يطلق عليها؟', answer: 'الثريا', category: 'فلك' },
    { question: 'مرض يصيب فروة شعر الإنسان؟', answer: 'ثعلبة', category: 'طب' },
  ],
  'ج': [
    { question: 'صحابي جليل يكنى بأبي الغفاري هاجر إلى الحبشة؟', answer: 'جعفر بن أبي طالب', category: 'إسلام' },
    { question: 'أكبر جزيرة في العالم؟', answer: 'جرينلاند', category: 'جغرافيا' },
    { question: 'من شعراء العرب اشتهر بالهجاء؟', answer: 'جرير', category: 'أدب' },
    { question: 'مؤسس الإمبراطورية المغولية؟', answer: 'جنكيز خان', category: 'تاريخ' },
    { question: 'العلم الذي يعنى بطبقات الأرض؟', answer: 'جيولوجيا', category: 'علوم' },
    { question: 'مدينة فيها أعلى نافورة؟', answer: 'جدة', category: 'جغرافيا' },
    { question: 'عالم كيمياء مشهور يلقب بأبي الكيمياء؟', answer: 'جابر بن حيان', category: 'علوم' },
  ],
  'ح': [
    { question: 'سورة في القرآن الكريم ورد فيها ذكر الذباب؟', answer: 'الحج', category: 'قرآن' },
    { question: 'وحدة لقياس القدرة تساوي 550 رطل/قدم في الثانية؟', answer: 'الحصان', category: 'علوم' },
    { question: 'يطلق على صوت المحتضر؟', answer: 'حشرجة', category: 'لغة' },
    { question: 'مدينة سورية يوجد فيها قبر خالد بن الوليد؟', answer: 'حمص', category: 'جغرافيا' },
    { question: 'مؤسس جماعة الإخوان المسلمين؟', answer: 'حسن البنا', category: 'تاريخ' },
    { question: 'أضخم الحيوانات اللافقارية؟', answer: 'الحبّار', category: 'حيوانات' },
    { question: 'من بنى الكعبة المشرفة ببنائها الحالي؟', answer: 'الحجاج بن يوسف', category: 'تاريخ' },
    { question: 'حدائق بابل المعلقة من عجائب الدنيا السبع - في أي حضارة؟', answer: 'الحضارة البابلية', category: 'تاريخ' },
  ],
  'خ': [
    { question: 'ماذا يسمى طعام الوالدة؟', answer: 'الخُرس', category: 'لغة' },
    { question: 'ما هو مرض الدفتيريا عند العرب؟', answer: 'خانوق', category: 'طب' },
    { question: 'أين تحصل الأسماك على الأكسجين؟', answer: 'الخياشيم', category: 'علوم' },
    { question: 'ما هي وسيلة تمثيل سطح الأرض على لوحة مستوية؟', answer: 'الخريطة', category: 'جغرافيا' },
    { question: 'ما هو صوت النمر؟', answer: 'خرخرة', category: 'حيوانات' },
    { question: 'ما هو اللفظ العربي للمادة الكيميائية الزنك؟', answer: 'خارصين', category: 'علوم' },
    { question: 'كم عدد عيون النحلة؟', answer: 'خمس عيون', category: 'حيوانات' },
    { question: 'ما المصطلح النحوي الذي يطلق على ما يسند إلى المبتدأ؟', answer: 'الخبر', category: 'لغة' },
    { question: 'قطعة من البحر تدخل في البر؟', answer: 'الخليج', category: 'جغرافيا' },
    { question: 'شاعرة عربية اشتهرت برثاء أخيها صخر؟', answer: 'الخنساء', category: 'أدب' },
  ],
  'د': [
    { question: 'في اللغة بمعنى المكر؟', answer: 'الدهاء', category: 'لغة' },
    { question: 'من مدن جمهورية مصر العربية؟', answer: 'دمياط', category: 'جغرافيا' },
    { question: 'أول وحدة عملة في تاريخ الإسلام؟', answer: 'الدينار', category: 'تاريخ' },
    { question: 'ما هي عاصمة دولة تنزانيا؟', answer: 'دار السلام', category: 'جغرافيا' },
    { question: 'هو سواد الليل وظلمته؟', answer: 'الدجى', category: 'لغة' },
    { question: 'صغير الدب؟', answer: 'ديسم', category: 'حيوانات' },
    { question: 'الشجرة العظيمة المتشبعة ذات الفروع العديدة؟', answer: 'الدوحة', category: 'لغة' },
    { question: 'ماء لم يخرج من الأرض ولم ينزل من السماء؟', answer: 'الدموع', category: 'ألغاز' },
    { question: 'الطائر الذي يكنى بأبي اليقظات؟', answer: 'الديك', category: 'حيوانات' },
    { question: 'صوت النمل؟', answer: 'دبيب', category: 'لغة' },
  ],
  'ذ': [
    { question: 'من أنواع السمك - ذئب البحر وسمك آخر؟', answer: 'ذئب البحر', category: 'حيوانات' },
    { question: 'بمعنى السهوب وسرحان العقل؟', answer: 'الذهول', category: 'لغة' },
    { question: 'حشرة ذكرت في القرآن الكريم؟', answer: 'الذباب', category: 'قرآن' },
    { question: 'هو القبيح من كل شيء؟', answer: 'ذميم', category: 'لغة' },
    { question: 'نوع من أنواع الجمال الروحي والخلق الرفيع؟', answer: 'الذوق', category: 'لغة' },
    { question: 'في اللغة بمعنى الخوف والفزع؟', answer: 'ذعر', category: 'لغة' },
    { question: 'صفة تدل على الفطنة والحفظ معًا؟', answer: 'الذهن', category: 'لغة' },
    { question: 'ما ميقات أهل العراق؟', answer: 'ذات عرق', category: 'إسلام' },
  ],
  'ر': [
    { question: 'ما هي عاصمة إيطاليا؟', answer: 'روما', category: 'جغرافيا' },
    { question: 'ما هي عاصمة اليابان القديمة؟', answer: 'روما ليست - كيوتو', category: 'جغرافيا' },
    { question: 'شهر رمضان المبارك - ما سبب تسميته؟', answer: 'رمضاء الحر', category: 'إسلام' },
  ],
  'ز': [
    { question: 'نبي من أنبياء الله كفله نبي آخر؟', answer: 'زكريا', category: 'إسلام' },
    { question: 'ما هو المعدن الذي يستخدم في حماية الحديد من الصدأ؟', answer: 'الزنك', category: 'علوم' },
  ],
  'س': [
    { question: 'ما هو أكبر صحراء في العالم؟', answer: 'الصحراء الكبرى', category: 'جغرافيا' },
    { question: 'سنام الإسلام هو؟', answer: 'السيف / الجهاد', category: 'إسلام' },
  ],
  'ش': [
    { question: 'الشهر الميلادي الثاني؟', answer: 'شباط (فبراير)', category: 'عام' },
    { question: 'شاعر جاهلي من شعراء الصعاليك اسمه ثابت بن أوس الأزدي؟', answer: 'الشنفرى', category: 'أدب' },
  ],
  'ص': [
    { question: 'الصقور من أنواع الطيور الجارحة - ما أشهرها؟', answer: 'صقر الشاهين', category: 'حيوانات' },
  ],
  'ض': [
    { question: 'الضب صغيره يسمى ماذا؟', answer: 'ضبّ (حسل)', category: 'حيوانات' },
  ],
  'ط': [
    { question: 'ما هو الطائر الذي يُعتبر رمز السلام؟', answer: 'الحمامة / طائر السلام', category: 'حيوانات' },
  ],
  'ظ': [
    { question: 'ما هو الظل؟', answer: 'منطقة معتمة تتكون خلف جسم معتم', category: 'علوم' },
  ],
  'ع': [
    { question: 'كم عدد قارات العالم؟', answer: 'سبع قارات', category: 'جغرافيا' },
    { question: 'مؤسس علم الاجتماع من أشهر كتبه العبر وديوان المبتدأ والخبر؟', answer: 'ابن خلدون (عبد الرحمن)', category: 'تاريخ' },
  ],
  'غ': [
    { question: 'ما هو الغاز الذي نتنفسه؟', answer: 'غاز الأكسجين', category: 'علوم' },
  ],
  'ف': [
    { question: 'ما هي أكبر دولة في أفريقيا مساحة؟', answer: 'الجزائر (فرنسا لا!)', category: 'جغرافيا' },
  ],
  'ق': [
    { question: 'ما هو أعلى جبل في العالم؟', answer: 'قمة إيفرست', category: 'جغرافيا' },
  ],
  'ك': [
    { question: 'ما هو أكبر كوكب صخري في المجموعة الشمسية؟', answer: 'كوكب الأرض', category: 'فضاء' },
  ],
  'ل': [
    { question: 'ما هي اللغة الأكثر تحدثًا في العالم؟', answer: 'لغة الماندرين الصينية', category: 'ثقافة' },
  ],
  'م': [
    { question: 'ما هو أصغر دولة في العالم؟', answer: 'مدينة الفاتيكان', category: 'جغرافيا' },
  ],
  'ن': [
    { question: 'ما هو المعدن الأغلى في العالم؟', answer: 'البلاتين أو الذهب', category: 'علوم' },
  ],
  'هـ': [
    { question: 'ما هي عاصمة فنلندا؟', answer: 'هلسنكي', category: 'جغرافيا' },
  ],
  'و': [
    { question: 'ما هي أكبر جزيرة في العالم؟', answer: 'غرينلاند', category: 'جغرافيا' },
  ],
  'ي': [
    { question: 'ما هو البحر الذي يفصل بين أوروبا وأفريقيا؟', answer: 'البحر الأبيض المتوسط', category: 'جغرافيا' },
  ],
};

/** Get a random question for a given letter */
export function getQuestionForLetter(letter: string): Question {
  const questions = QUESTIONS_DB[letter];
  if (!questions || questions.length === 0) {
    return {
      question: `سؤال يبدأ جوابه بحرف "${letter}" - ما هو؟`,
      answer: `الجواب يبدأ بحرف ${letter}`,
      category: 'عام',
    };
  }
  return questions[Math.floor(Math.random() * questions.length)];
}
