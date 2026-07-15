/**
 * Translation dictionaries — the single source of truth for all UI copy.
 *
 * Every user-facing string lives here keyed by a stable key, with an `en` and
 * `ar` value. Components read strings via the `t()` helper from `useLanguage()`
 * instead of hard-coding text, so English/Arabic switch instantly with the
 * language toggle. Keep both languages in sync when adding keys.
 */

export const LOCALES = ["en", "ar"];
export const DEFAULT_LOCALE = "en";

/** RTL locales — used to derive text direction. */
export const RTL_LOCALES = ["ar"];

/**
 * Language switcher options. `short` is the compact label shown in the header
 * selector; `label` is the full name shown in the dropdown menu.
 */
export const LANGUAGE_OPTIONS = [
  { code: "en", short: "EN", label: "English" },
  { code: "ar", short: "AR", label: "العربية" },
];

export const TRANSLATIONS = {
  en: {
    "common.login": "Login",
    "common.language": "Language",

    "nav.problem": "Problem",
    "nav.solution": "Solution",
    "nav.preview": "Preview",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.contact": "Contact",
    "nav.bookDemo": "Book a Demo",
    "nav.openMenu": "Open menu",
    "nav.closeMenu": "Close menu",

    "hero.eyebrow": "Built For The GCC",
    "hero.headingLine1": "Screen Every Applicant.",
    "hero.headingLine2Lead": "Talk To ",
    "hero.headingLine2Accent": "The Five Who Matter.",
    "hero.subtext":
      "Qabil reads every CV, runs a bilingual WhatsApp screen, and hands your recruiters a ranked shortlist. In Arabic and English, hosted inside the UAE.",
    "hero.bookDemo": "Book a demo",
    "hero.watch": "Watch Overview",
    "hero.imageAlt": "Gulf city skyline",

    "ps.eyebrow": "The Fix On The Same Desk",
    "ps.headingLine1": "Here's what's breaking.",
    "ps.headingLine2": "Here's what closes it.",
    "ps.subheading":
      "Three points where hiring stalls — and what Qabil does at each one instead.",
    "ps.problemLabel": "Problem",
    "ps.solutionLabel": "Solution",
    "ps.item1.problemTitle": "Manual Screening Bottleneck",
    "ps.item1.problemDesc": "Recruiters waste 3–5 days screening CVs for every single role.",
    "ps.item1.solutionTitle": "AI Screening Agent: Assessment",
    "ps.item1.solutionDesc":
      "Qabil surfaces the top real candidates first, with reasoning at every stage. Shortlist of 10 ready in 20 minutes of recruiter review.",
    "ps.item2.problemTitle": "AI-Polished, Unverifiable CVs",
    "ps.item2.problemDesc": "AI-polished CVs make it hard to trust what you're reading.",
    "ps.item2.solutionTitle": "Semantic Evaluation of Cv",
    "ps.item2.solutionDesc":
      "Qabil flags fabricated or AI-generated content. Every candidate carries an authenticity flag, know who to probe deeper.",
    "ps.item3.problemTitle": "Arabic CV Blind Spot",
    "ps.item3.problemDesc":
      "Arabic CVs fail in all existing tools — Gulf candidates disadvantaged.",
    "ps.item3.solutionTitle": "Native Arabic NLP Parser",
    "ps.item3.solutionDesc":
      "Qabil provides RTL support, Gulf CV fields, bilingual analysis. 100% of applicants screened equally, regardless of language.",
    "ps.item4.problemTitle": "No Shows, No Warning",
    "ps.item4.problemDesc":
      "No visibility on candidate seriousness — ghost interviews waste days.",
    "ps.item4.solutionTitle": "Commitment Scoring",
    "ps.item4.solutionDesc":
      "Qabil scores commitment and runs an interview confirmation cascade. No-shows drop from 35% to under 8%.",

    "preview.eyebrow": "Product Preview",
    "preview.heading": "The platform, live.",
    "preview.subheading": "A look at what your HR team sees every day.",
    "preview.imageAlt": "Qabil dashboard shown on a laptop",

    "features.eyebrow": "Built For The Gulf, Not Adapted To It",
    "features.headingLine1": "The reasons a GCC agency",
    "features.headingLine2": "can actually deploy this.",
    "features.card1.title": "In-region by default",
    "features.card1.value":
      "Hosted in Azure UAE North. Candidate data stays inside the UAE compliance boundary — the question every client and regulator asks, answered before it's raised.",
    "features.card2.title": "Genuinely bilingual",
    "features.card2.value":
      "Arabic and English handled natively in parsing, screening and conversation — not bolted-on translation. Candidates feel spoken to, not processed.",
    "features.card3.title": "GCC hiring signals",
    "features.card3.value":
      "Emiratisation and Saudisation preferences, visa and residency status, DHA/MOH/HAAD licensing — read and ranked, because they decide who you can actually place.",
    "features.card4.title": "Audit-ready decisions",
    "features.card4.value":
      "Every screening decision is logged with its reasoning for a PDPL bias audit. Defensible to your client, your candidate and the regulator.",

    "pricing.eyebrow": "Founding Partner Programme",
    "pricing.headingLine1": "Five agencies. Founding price.",
    "pricing.headingLine2": "Direct line to the build.",
    "pricing.price": "AED 2,000",
    "pricing.priceUnit": "/month",
    "pricing.sar": "≈ SAR 2,040 · for KSA agencies",
    "pricing.descLead": "Locked for ",
    "pricing.descEmphasis": "6 months",
    "pricing.descTail":
      ". Onboarding on your live roles, your CVs, your branding — and your feedback shapes the roadmap before anyone else gets in.",
    "pricing.seats": "Five founding seats · by invitation",

    "contact.eyebrow": "Get in touch",
    "contact.heading": "Book a 30-minute demo",
    "contact.subheading": "No slides. No pressure. Just the product.",
    "contact.fullName.label": "Full name",
    "contact.fullName.placeholder": "Enter your full name",
    "contact.jobTitle.label": "Job Title",
    "contact.jobTitle.placeholder": "e.g., HR Director",
    "contact.company.label": "Company",
    "contact.company.placeholder": "Your company name",
    "contact.workEmail.label": "Work Email",
    "contact.workEmail.placeholder": "you@company.com",
    "contact.comment.label": "Comment",
    "contact.comment.placeholder": "",
    "contact.submit": "Book my demo",

    "footer.heading": "See Qabil run on your next open role.",
    "footer.chat": "Chat With Us",
    "footer.copyright":
      "© 2026 Qabil. All rights reserved. Built with purpose for the GCC market.",
    "footer.nav.problems": "Problems",
    "footer.nav.solutions": "Solutions",
    "footer.nav.features": "Features",
    "footer.nav.pricing": "Pricing",
    "footer.nav.contact": "Contact Us",
  },
  ar: {
    "common.login": "تسجيل الدخول",
    "common.language": "اللغة",

    "nav.problem": "المشكلة",
    "nav.solution": "الحل",
    "nav.preview": "المعاينة",
    "nav.features": "المميزات",
    "nav.pricing": "الأسعار",
    "nav.contact": "تواصل معنا",
    "nav.bookDemo": "احجز عرضاً",
    "nav.openMenu": "فتح القائمة",
    "nav.closeMenu": "إغلاق القائمة",

    "hero.eyebrow": "مصمم لمنطقة الخليج",
    "hero.headingLine1": "افحص كل متقدم.",
    "hero.headingLine2Lead": "تحدث إلى ",
    "hero.headingLine2Accent": "الخمسة الأهم.",
    "hero.subtext":
      "يقرأ قابل كل سيرة ذاتية، ويجري مقابلة أولية ثنائية اللغة عبر واتساب، ويسلّم فريق التوظيف قائمة مرتبة. بالعربية والإنجليزية، ومُستضاف داخل الإمارات.",
    "hero.bookDemo": "احجز عرضاً",
    "hero.watch": "شاهد العرض",
    "hero.imageAlt": "أفق مدينة خليجية",

    "ps.eyebrow": "الحل على المكتب نفسه",
    "ps.headingLine1": "هذا ما يتعطّل.",
    "ps.headingLine2": "وهذا ما يحلّه.",
    "ps.subheading":
      "ثلاث نقاط يتعثّر فيها التوظيف — وما الذي يفعله قابل عند كل واحدة منها.",
    "ps.problemLabel": "المشكلة",
    "ps.solutionLabel": "الحل",
    "ps.item1.problemTitle": "اختناق الفرز اليدوي",
    "ps.item1.problemDesc": "يهدر المسؤولون 3–5 أيام في فرز السير الذاتية لكل وظيفة.",
    "ps.item1.solutionTitle": "وكيل الفرز بالذكاء الاصطناعي: التقييم",
    "ps.item1.solutionDesc":
      "يُبرز قابل أفضل المرشحين الحقيقيين أولاً، مع تعليل في كل مرحلة. قائمة من 10 جاهزة خلال 20 دقيقة من مراجعة المسؤول.",
    "ps.item2.problemTitle": "سير ذاتية مصقولة بالذكاء الاصطناعي وغير قابلة للتحقق",
    "ps.item2.problemDesc": "تجعل السير الذاتية المصقولة بالذكاء الاصطناعي من الصعب الوثوق بما تقرأه.",
    "ps.item2.solutionTitle": "التقييم الدلالي للسيرة الذاتية",
    "ps.item2.solutionDesc":
      "يكشف قابل المحتوى المُلفّق أو المُولّد بالذكاء الاصطناعي. يحمل كل مرشّح مؤشر مصداقية، لتعرف من الذي يستحق تدقيقاً أعمق.",
    "ps.item3.problemTitle": "نقطة عمياء في السير الذاتية العربية",
    "ps.item3.problemDesc":
      "تفشل السير الذاتية العربية في جميع الأدوات الحالية — ما يضع مرشّحي الخليج في وضع غير عادل.",
    "ps.item3.solutionTitle": "محلّل لغة عربية أصيل",
    "ps.item3.solutionDesc":
      "يوفّر قابل دعم الكتابة من اليمين إلى اليسار، وحقول السير الذاتية الخليجية، وتحليلاً ثنائي اللغة. يُفحَص 100% من المتقدمين بالتساوي، بغضّ النظر عن اللغة.",
    "ps.item4.problemTitle": "غياب دون سابق إنذار",
    "ps.item4.problemDesc":
      "لا وضوح حول جدّية المرشّح — المقابلات الوهمية تُهدر الأيام.",
    "ps.item4.solutionTitle": "تقييم الالتزام",
    "ps.item4.solutionDesc":
      "يقيّم قابل مدى الالتزام ويُجري سلسلة تأكيدات للمقابلة. تنخفض نسبة الغياب من 35% إلى أقل من 8%.",

    "preview.eyebrow": "معاينة المنتج",
    "preview.heading": "المنصّة، بشكل مباشر.",
    "preview.subheading": "نظرة على ما يراه فريق الموارد البشرية كل يوم.",
    "preview.imageAlt": "لوحة تحكم قابل معروضة على حاسوب محمول",

    "features.eyebrow": "مصمّم للخليج، لا مُكيّف له",
    "features.headingLine1": "الأسباب التي تتيح لوكالة خليجية",
    "features.headingLine2": "تطبيق هذا فعلياً.",
    "features.card1.title": "داخل المنطقة افتراضياً",
    "features.card1.value":
      "مُستضاف على Azure UAE North. تبقى بيانات المرشّحين داخل حدود الامتثال الإماراتية — وهو السؤال الذي يطرحه كل عميل وجهة تنظيمية، مُجاب عنه قبل أن يُطرح.",
    "features.card2.title": "ثنائي اللغة بحق",
    "features.card2.value":
      "يُعالَج العربية والإنجليزية بشكل أصيل في التحليل والفرز والمحادثة — لا ترجمة مُضافة لاحقاً. يشعر المرشّحون بأنهم مُخاطَبون، لا مُعالَجون.",
    "features.card3.title": "إشارات التوظيف الخليجية",
    "features.card3.value":
      "أفضليات التوطين والسعودة، وحالة التأشيرة والإقامة، وتراخيص DHA/MOH/HAAD — تُقرأ وتُرتّب، لأنها تحدّد من يمكنك توظيفه فعلاً.",
    "features.card4.title": "قرارات جاهزة للتدقيق",
    "features.card4.value":
      "يُسجَّل كل قرار فرز مع تعليله لأغراض تدقيق التحيّز وفق PDPL. قابل للدفاع أمام عميلك ومرشّحك والجهة التنظيمية.",

    "pricing.eyebrow": "برنامج الشركاء المؤسّسين",
    "pricing.headingLine1": "خمس وكالات. سعر تأسيسي.",
    "pricing.headingLine2": "خط مباشر إلى فريق التطوير.",
    "pricing.price": "2,000 درهم",
    "pricing.priceUnit": "/شهرياً",
    "pricing.sar": "≈ 2,040 ريال · لوكالات السعودية",
    "pricing.descLead": "مُثبّت لمدة ",
    "pricing.descEmphasis": "6 أشهر",
    "pricing.descTail":
      ". إعداد على وظائفك الفعلية وسيرك الذاتية وهويتك التجارية — وملاحظاتك تصوغ خارطة الطريق قبل أن ينضمّ أي أحد آخر.",
    "pricing.seats": "خمسة مقاعد تأسيسية · بدعوة خاصة",

    "contact.eyebrow": "تواصل معنا",
    "contact.heading": "احجز عرضاً تجريبياً مدته 30 دقيقة",
    "contact.subheading": "لا شرائح عرض. لا ضغط. المنتج فقط.",
    "contact.fullName.label": "الاسم الكامل",
    "contact.fullName.placeholder": "أدخل اسمك الكامل",
    "contact.jobTitle.label": "المسمّى الوظيفي",
    "contact.jobTitle.placeholder": "مثال: مدير الموارد البشرية",
    "contact.company.label": "الشركة",
    "contact.company.placeholder": "اسم شركتك",
    "contact.workEmail.label": "البريد الإلكتروني للعمل",
    "contact.workEmail.placeholder": "you@company.com",
    "contact.comment.label": "ملاحظة",
    "contact.comment.placeholder": "",
    "contact.submit": "احجز عرضي",

    "footer.heading": "شاهد قابل يعمل على وظيفتك الشاغرة القادمة.",
    "footer.chat": "تحدّث معنا",
    "footer.copyright":
      "© 2026 قابل. جميع الحقوق محفوظة. مبنيّ بعناية لسوق دول الخليج.",
    "footer.nav.problems": "المشكلات",
    "footer.nav.solutions": "الحلول",
    "footer.nav.features": "المميزات",
    "footer.nav.pricing": "الأسعار",
    "footer.nav.contact": "تواصل معنا",
  },
};
