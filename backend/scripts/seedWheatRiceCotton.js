// One-off seed script: writes Wheat/Rice/Cotton crops, pests/diseases,
// articles, and article sections directly into Firestore via the Firebase
// Admin SDK, using the same field shapes the admin API writes.
//
// Safe to re-run: every document uses a fixed, deterministic ID and is
// written with `.set()`, so running this twice updates the same docs
// instead of creating duplicates.
//
// Usage (from the backend/ folder, where .env + serviceAccount.json live):
//   node scripts/seedWheatRiceCotton.js

import "dotenv/config";
import admin from "../src/firebaseAdmin.js";

const db = admin.firestore();

const CROPS = [
  {
    slug: "wheat",
    nameEn: "Wheat",
    nameUr: "گندم",
    icon: "grass",
    order: 1,
    showInPests: true,
    diseases: [
      {
        order: 1,
        nameEn: "Yellow Rust",
        nameUr: "پیلی زنگ",
        descriptionEn:
          "A fungal disease causing yellow stripes on wheat leaves, common in cool, humid weather.",
        descriptionUr:
          "ایک پھپھوندی جو گندم کے پتوں پر پیلی دھاریاں پیدا کرتی ہے، ٹھنڈے اور نم موسم میں عام ہوتی ہے۔",
        symptomsEn: [
          "Yellow, powdery stripes running along leaf veins",
          "Stunted plant growth",
          "Reduced grain size and yield",
        ],
        symptomsUr: [
          "پتوں کی رگوں کے ساتھ پیلی، پاؤڈر نما دھاریاں",
          "پودے کی نشوونما رک جانا",
          "دانے کا سائز اور پیداوار کم ہونا",
        ],
        solutionsEn: [
          "Spray a recommended fungicide (e.g. Propiconazole) at first sign of infection",
          "Use rust-resistant wheat varieties",
          "Avoid excessive nitrogen fertilizer",
          "Rotate crops to reduce fungal buildup in soil",
        ],
        solutionsUr: [
          "انفیکشن کی پہلی علامت پر تجویز کردہ فنجی سائیڈ (مثلاً پروپیکونازول) کا اسپرے کریں",
          "زنگ سے مزاحم گندم کی اقسام استعمال کریں",
          "نائٹروجن کھاد کا زیادہ استعمال نہ کریں",
          "مٹی میں پھپھوندی کے پھیلاؤ کو کم کرنے کے لیے فصلوں کی گردش کریں",
        ],
      },
      {
        order: 2,
        nameEn: "Wheat Aphid",
        nameUr: "تیلا (گندم کا کیڑا)",
        descriptionEn:
          "Small sap-sucking insects that cluster on stems and leaves, weakening the plant.",
        descriptionUr:
          "چھوٹے رس چوسنے والے کیڑے جو تنوں اور پتوں پر جمع ہو کر پودے کو کمزور کرتے ہیں۔",
        symptomsEn: [
          "Curling and yellowing of leaves",
          "Sticky honeydew residue on leaves",
          "Sooty mold growth on affected areas",
        ],
        symptomsUr: [
          "پتوں کا مڑنا اور پیلا ہونا",
          "پتوں پر چپچپا میٹھا مادہ (شہد نما) نظر آنا",
          "متاثرہ حصوں پر کالی پھپھوندی کا اگنا",
        ],
        solutionsEn: [
          "Spray insecticidal soap or neem oil",
          "Introduce natural predators like ladybird beetles",
          "Use a recommended systemic insecticide if infestation is severe",
        ],
        solutionsUr: [
          "کیڑے مار صابن یا نیم کے تیل کا اسپرے کریں",
          "قدرتی شکاری جیسے لیڈی برڈ بیٹل کا استعمال کریں",
          "شدید حملے کی صورت میں تجویز کردہ سسٹیمک کیڑے مار دوا استعمال کریں",
        ],
      },
      {
        order: 3,
        nameEn: "Loose Smut",
        nameUr: "کانگیاری",
        descriptionEn:
          "A seed-borne fungal disease that replaces wheat grains with black powdery spores.",
        descriptionUr:
          "ایک بیج سے پھیلنے والی پھپھوندی جو گندم کے دانوں کو کالے پاؤڈر نما بیجانوں سے بدل دیتی ہے۔",
        symptomsEn: [
          "Black powdery masses replacing grains in the ear head",
          "Infected ears emerge slightly earlier than healthy ones",
          "Spores spread by wind to healthy flowers during flowering",
        ],
        symptomsUr: [
          "بالی کے دانوں کی جگہ کالے پاؤڈر نما مادے کا بن جانا",
          "متاثرہ بالیاں صحت مند بالیوں سے کچھ پہلے نکلتی ہیں",
          "پھول آنے کے دوران بیجانے ہوا کے ذریعے صحت مند پھولوں تک پھیل جاتے ہیں",
        ],
        solutionsEn: [
          "Treat seed with a systemic fungicide (e.g. Carboxin or Tebuconazole) before sowing",
          "Use certified, disease-free seed",
          "Avoid using seed from an infected field",
        ],
        solutionsUr: [
          "بوائی سے پہلے بیج کو سسٹیمک فنجی سائیڈ (مثلاً کاربوکسن یا ٹیبوکونازول) سے علاج کریں",
          "سرٹیفائیڈ اور بیماری سے پاک بیج استعمال کریں",
          "متاثرہ کھیت کا بیج استعمال کرنے سے گریز کریں",
        ],
      },
      {
        order: 4,
        nameEn: "Termites",
        nameUr: "دیمک",
        descriptionEn:
          "Soil-dwelling insects that damage wheat roots and stems, especially in dry conditions.",
        descriptionUr:
          "مٹی میں رہنے والے کیڑے جو خاص طور پر خشک حالات میں گندم کی جڑوں اور تنوں کو نقصان پہنچاتے ہیں۔",
        symptomsEn: [
          "Wilting and drying of plants in patches",
          "Hollowed stems near the root zone",
          "Plants easily uprooted due to damaged roots",
        ],
        symptomsUr: [
          "کھیت میں جگہ جگہ پودوں کا مرجھانا اور سوکھنا",
          "جڑ کے قریب تنوں کا کھوکھلا ہونا",
          "جڑیں خراب ہونے کی وجہ سے پودوں کا آسانی سے اکھڑ جانا",
        ],
        solutionsEn: [
          "Apply recommended soil-applied insecticide (e.g. Chlorpyrifos) before sowing",
          "Ensure proper field sanitation by removing crop residue and organic debris",
          "Avoid water stress, as termite damage is worse in dry soil",
        ],
        solutionsUr: [
          "بوائی سے پہلے تجویز کردہ مٹی میں ڈالی جانے والی کیڑے مار دوا (مثلاً کلورپائریفوس) استعمال کریں",
          "فصل کی باقیات اور نامیاتی ملبہ ہٹا کر کھیت کی صفائی کو یقینی بنائیں",
          "پانی کی کمی سے بچیں کیونکہ خشک مٹی میں دیمک کا نقصان زیادہ ہوتا ہے",
        ],
      },
    ],
    articles: [
     {
      categoryEn: "Field Crops",
      categoryUr: "میدانی فصلیں",
      titleEn: "Complete Guide to Wheat Cultivation",
      titleUr: "گندم کی کاشت کا مکمل رہنما",
      summaryEn:
        "Learn the key steps for growing healthy wheat, from sowing to harvest, for a better yield.",
      summaryUr:
        "بوائی سے کٹائی تک بہتر پیداوار کے لیے صحت مند گندم اگانے کے اہم مراحل جانیں۔",
      readTimeMinutes: 5,
      icon: "grass",
      order: 1,
      sections: [
        {
          headingEn: "Soil Preparation & Sowing",
          headingUr: "زمین کی تیاری اور بوائی",
          bodyEn:
            "Wheat grows best in well-drained loamy soil with a pH between 6 and 7.5. Plough the field 2-3 times and level it properly before sowing. Sow seeds in November for irrigated areas, using 100-125 kg of certified seed per acre, at a row spacing of 22.5 cm.",
          bodyUr:
            "گندم اچھی نکاسی والی چکنی مٹی میں بہترین اگتی ہے جس کا پی ایچ 6 سے 7.5 کے درمیان ہو۔ بوائی سے پہلے کھیت کو 2 سے 3 بار ہل چلا کر اچھی طرح ہموار کریں۔ آبپاشی والے علاقوں میں نومبر میں بوائی کریں، فی ایکڑ 100 سے 125 کلوگرام سرٹیفائیڈ بیج استعمال کریں اور قطاروں کا فاصلہ 22.5 سینٹی میٹر رکھیں۔",
        },
        {
          headingEn: "Irrigation & Fertilizer",
          headingUr: "آبپاشی اور کھاد",
          bodyEn:
            "Wheat requires 4-6 irrigations depending on soil type and weather. The first irrigation (crown root stage) is critical, about 20-25 days after sowing. Apply fertilizer based on a soil test; a general recommendation is 2 bags of DAP and 1 bag of Urea at sowing, plus 1 more bag of Urea at the first irrigation.",
          bodyUr:
            "گندم کو مٹی کی قسم اور موسم کے لحاظ سے 4 سے 6 آبپاشیوں کی ضرورت ہوتی ہے۔ پہلی آبپاشی (تاج جڑ کا مرحلہ) نہایت اہم ہے جو بوائی کے 20 سے 25 دن بعد کی جاتی ہے۔ مٹی کے ٹیسٹ کی بنیاد پر کھاد ڈالیں؛ عمومی سفارش یہ ہے کہ بوائی کے وقت 2 بوری ڈی اے پی اور 1 بوری یوریا، جبکہ پہلی آبپاشی پر مزید 1 بوری یوریا دیں۔",
        },
        {
          headingEn: "Harvesting Tips",
          headingUr: "کٹائی کے مشورے",
          bodyEn:
            "Harvest wheat when the crop turns golden yellow and grains are hard, usually 120-150 days after sowing. Harvesting too early reduces grain weight, while delayed harvesting can cause shattering losses. Combine harvesters can reduce labor and time significantly.",
          bodyUr:
            "گندم کی کٹائی اس وقت کریں جب فصل سنہری پیلی ہو جائے اور دانے سخت ہو جائیں، عام طور پر بوائی کے 120 سے 150 دن بعد۔ جلد کٹائی سے دانے کا وزن کم ہو جاتا ہے جبکہ دیر سے کٹائی سے دانے گرنے کا نقصان ہو سکتا ہے۔ کمبائن ہارویسٹر کے استعمال سے وقت اور مزدوری میں کافی کمی آتی ہے۔",
        },
      ],
     },
     {
      categoryEn: "Field Crops",
      categoryUr: "میدانی فصلیں",
      titleEn: "Managing Pests & Diseases in Wheat",
      titleUr: "گندم میں کیڑوں اور بیماریوں کا انتظام",
      summaryEn:
        "A practical guide to identifying and controlling the most common wheat pests and diseases before they affect yield.",
      summaryUr:
        "پیداوار متاثر ہونے سے پہلے گندم کے عام کیڑوں اور بیماریوں کی شناخت اور کنٹرول کا عملی رہنما۔",
      readTimeMinutes: 4,
      icon: "bug_report",
      order: 4,
      sections: [
        {
          headingEn: "Scouting Your Field Regularly",
          headingUr: "کھیت کا باقاعدہ معائنہ",
          bodyEn:
            "Walk through the field at least twice a week during the vegetative and flowering stages, checking the undersides of leaves and stem bases for early signs of rust, aphids, or termite damage. Early detection makes treatment far more effective and affordable.",
          bodyUr:
            "نشوونما اور پھول آنے کے مراحل میں ہفتے میں کم از کم دو بار کھیت کا معائنہ کریں، پتوں کی نچلی سطح اور تنے کی جڑ کا جائزہ لیں تاکہ زنگ، تیلے یا دیمک کے نقصان کی ابتدائی علامات کا پتہ چل سکے۔ ابتدائی نشاندہی علاج کو زیادہ مؤثر اور کم خرچ بنا دیتی ہے۔",
        },
        {
          headingEn: "Choosing the Right Treatment",
          headingUr: "درست علاج کا انتخاب",
          bodyEn:
            "Match the treatment to the problem: fungicides for rust and smut, insecticides for aphids, and soil treatments for termites. Always follow label instructions for dose and timing, and rotate chemical groups to prevent resistance building up over seasons.",
          bodyUr:
            "مسئلے کے مطابق علاج کا انتخاب کریں: زنگ اور کانگیاری کے لیے فنجی سائیڈ، تیلے کے لیے کیڑے مار دوا، اور دیمک کے لیے مٹی کا علاج۔ ہمیشہ خوراک اور وقت کے لیے لیبل کی ہدایات پر عمل کریں اور موسموں کے دوران مزاحمت بننے سے بچنے کے لیے کیمیائی گروپس تبدیل کرتے رہیں۔",
        },
        {
          headingEn: "Preventive Practices",
          headingUr: "احتیاطی تدابیر",
          bodyEn:
            "Use certified, treated seed every season, rotate wheat with a non-cereal crop where possible, and avoid excess nitrogen which makes plants more attractive to pests and more susceptible to fungal disease.",
          bodyUr:
            "ہر موسم میں سرٹیفائیڈ اور علاج شدہ بیج استعمال کریں، جہاں ممکن ہو گندم کو غیر اناج والی فصل کے ساتھ ہمہ گیر کریں، اور نائٹروجن کا زیادہ استعمال نہ کریں کیونکہ اس سے پودے کیڑوں کے لیے زیادہ پرکشش اور پھپھوندی کے لیے زیادہ حساس ہو جاتے ہیں۔",
        },
      ],
     },
    ],
  },
  {
    slug: "rice",
    nameEn: "Rice",
    nameUr: "چاول",
    icon: "rice_bowl",
    order: 2,
    showInPests: true,
    diseases: [
      {
        order: 1,
        nameEn: "Rice Blast",
        nameUr: "چاول کا جھلساؤ",
        descriptionEn:
          "A serious fungal disease affecting leaves, stems, and panicles of rice.",
        descriptionUr:
          "ایک سنگین پھپھوندی جو چاول کے پتوں، تنوں اور بالیوں کو متاثر کرتی ہے۔",
        symptomsEn: [
          "Diamond-shaped gray lesions with brown borders on leaves",
          "Rotting of the neck node causing panicles to break",
          "Whitish or grayish spots on stems",
        ],
        symptomsUr: [
          "پتوں پر ہیرے کی شکل کے سرمئی دھبے جن کے کنارے بھورے ہوں",
          "گردن کی گرہ کا سڑنا جس سے بالیاں ٹوٹ جاتی ہیں",
          "تنوں پر سفیدی مائل یا سرمئی دھبے",
        ],
        solutionsEn: [
          "Use certified, blast-resistant rice varieties",
          "Apply fungicide (e.g. Tricyclazole) at the booting stage",
          "Avoid excess nitrogen application",
          "Maintain proper field drainage",
        ],
        solutionsUr: [
          "سرٹیفائیڈ اور جھلساؤ سے مزاحم چاول کی اقسام استعمال کریں",
          "بالی نکلنے کے مرحلے پر فنجی سائیڈ (مثلاً ٹرائی سائیکلازول) کا استعمال کریں",
          "نائٹروجن کا زیادہ استعمال نہ کریں",
          "کھیت کی مناسب نکاسی آب کو یقینی بنائیں",
        ],
      },
      {
        order: 2,
        nameEn: "Rice Stem Borer",
        nameUr: "تنے کا سرنگ لگانے والا کیڑا",
        descriptionEn:
          "Larvae bore into rice stems, causing dead hearts and white heads.",
        descriptionUr:
          "اس کیڑے کے لاروے چاول کے تنوں میں سرنگ بنا دیتے ہیں جس سے \"ڈیڈ ہارٹ\" اور \"سفید بالیاں\" پیدا ہوتی ہیں۔",
        symptomsEn: [
          "Dead central shoot (dead heart) in young plants",
          "White, empty panicles (white head) at maturity",
          "Small holes visible on stems near the base",
        ],
        symptomsUr: [
          "نوجوان پودوں میں مرکزی ٹہنی کا مرجھا جانا (ڈیڈ ہارٹ)",
          "پکنے کے مرحلے پر سفید اور خالی بالیاں (وائٹ ہیڈ)",
          "تنے کی جڑ کے قریب چھوٹے سوراخ نظر آنا",
        ],
        solutionsEn: [
          "Install pheromone traps to monitor and reduce moth population",
          "Apply a recommended systemic insecticide at early infestation",
          "Remove and destroy stubble after harvest to eliminate larvae",
        ],
        solutionsUr: [
          "پتنگوں کی تعداد کم کرنے کے لیے فیرومون ٹریپس نصب کریں",
          "ابتدائی حملے پر تجویز کردہ سسٹیمک کیڑے مار دوا استعمال کریں",
          "لاروے کے خاتمے کے لیے کٹائی کے بعد باقیات کو ہٹا کر تلف کریں",
        ],
      },
      {
        order: 3,
        nameEn: "Bacterial Leaf Blight",
        nameUr: "بیکٹیریل جھلساؤ",
        descriptionEn:
          "A bacterial disease causing wilting and yellowing of rice leaves, spreading fast in warm, wet conditions.",
        descriptionUr:
          "ایک بیکٹیریل بیماری جو چاول کے پتوں کو مرجھا اور پیلا کر دیتی ہے، گرم اور نم موسم میں تیزی سے پھیلتی ہے۔",
        symptomsEn: [
          "Water-soaked streaks near leaf tips and margins",
          "Yellowing and drying of leaves starting from the tip",
          "Wilting of young seedlings in severe cases",
        ],
        symptomsUr: [
          "پتوں کے کناروں اور نوک کے قریب پانی سے بھری لکیریں",
          "پتوں کا نوک سے شروع ہو کر پیلا اور خشک ہونا",
          "شدید حملے میں نوجوان پنیری کا مرجھا جانا",
        ],
        solutionsEn: [
          "Use resistant rice varieties where available",
          "Avoid excessive nitrogen fertilizer application",
          "Apply copper-based bactericide as a preventive spray",
          "Drain standing water if blight symptoms appear",
        ],
        solutionsUr: [
          "جہاں ممکن ہو مزاحم چاول کی اقسام استعمال کریں",
          "نائٹروجن کھاد کا زیادہ استعمال نہ کریں",
          "احتیاطی تدبیر کے طور پر تانبے پر مبنی بیکٹیریا کش دوا کا اسپرے کریں",
          "جھلساؤ کی علامات ظاہر ہونے پر کھڑا پانی نکال دیں",
        ],
      },
      {
        order: 4,
        nameEn: "Rice Hispa",
        nameUr: "چاول کا ہسپا کیڑا",
        descriptionEn:
          "A small beetle whose grubs mine inside leaves while adults scrape the leaf surface.",
        descriptionUr:
          "ایک چھوٹا بھونرا جس کے بچے پتوں کے اندر سرنگ بناتے ہیں جبکہ بالغ کیڑے پتوں کی سطح کھرچتے ہیں۔",
        symptomsEn: [
          "White, parallel streaks on leaves from surface scraping",
          "Blotch-like mines visible inside leaf tissue",
          "Overall whitish appearance of the field from a distance",
        ],
        symptomsUr: [
          "سطح کھرچنے کی وجہ سے پتوں پر سفید متوازی لکیریں",
          "پتوں کے اندر دھبے نما سرنگیں نظر آنا",
          "دور سے کھیت کا مجموعی طور پر سفیدی مائل نظر آنا",
        ],
        solutionsEn: [
          "Clip and destroy affected leaf tips in case of light infestation",
          "Spray a recommended insecticide when infestation crosses threshold levels",
          "Avoid excessive nitrogen use, which favors hispa buildup",
        ],
        solutionsUr: [
          "ہلکے حملے کی صورت میں متاثرہ پتوں کی نوکیں کاٹ کر تلف کریں",
          "حملہ حد سے بڑھ جانے پر تجویز کردہ کیڑے مار دوا کا اسپرے کریں",
          "نائٹروجن کا زیادہ استعمال نہ کریں کیونکہ اس سے ہسپا کیڑے کی افزائش بڑھتی ہے",
        ],
      },
    ],
    articles: [
     {
      categoryEn: "Field Crops",
      categoryUr: "میدانی فصلیں",
      titleEn: "Best Practices for Rice Farming",
      titleUr: "چاول کی کاشت کے بہترین طریقے",
      summaryEn:
        "A practical overview of nursery raising, transplanting, and water management for a healthy rice crop.",
      summaryUr:
        "صحت مند چاول کی فصل کے لیے نرسری کی تیاری، پنیری لگانے اور پانی کے انتظام کا عملی جائزہ۔",
      readTimeMinutes: 6,
      icon: "rice_bowl",
      order: 2,
      sections: [
        {
          headingEn: "Nursery Preparation",
          headingUr: "نرسری کی تیاری",
          bodyEn:
            "Prepare a fine, leveled seedbed and soak seeds for 24 hours before sowing to speed up germination. Use 8-10 kg of quality seed per acre of transplanted area. Keep a thin water layer on the nursery bed and apply a starter dose of nitrogen fertilizer after the first week.",
          bodyUr:
            "باریک اور ہموار بیج کی کیاری تیار کریں اور اگاؤ کو تیز کرنے کے لیے بوائی سے پہلے بیج کو 24 گھنٹے پانی میں بھگو دیں۔ پنیری کے لیے فی ایکڑ 8 سے 10 کلوگرام معیاری بیج استعمال کریں۔ نرسری کی کیاری پر پانی کی ہلکی تہہ برقرار رکھیں اور پہلے ہفتے کے بعد نائٹروجن کھاد کی ابتدائی خوراک دیں۔",
        },
        {
          headingEn: "Transplanting & Water Management",
          headingUr: "پنیری کی منتقلی اور پانی کا انتظام",
          bodyEn:
            "Transplant 25-30 day old seedlings into the main field, maintaining 2-3 seedlings per hill with a spacing of 20x15 cm. Keep 2-5 cm of standing water during the vegetative stage, and drain the field a week before harvest to allow the soil to firm up.",
          bodyUr:
            "25 سے 30 دن پرانی پنیری کو مرکزی کھیت میں منتقل کریں، ہر جھونڈ میں 2 سے 3 پودے رکھیں اور فاصلہ 20x15 سینٹی میٹر رکھیں۔ نشوونما کے مرحلے میں 2 سے 5 سینٹی میٹر پانی کھڑا رکھیں، اور کٹائی سے ایک ہفتہ پہلے کھیت سے پانی نکال دیں تاکہ زمین سخت ہو جائے۔",
        },
        {
          headingEn: "Weed & Pest Control",
          headingUr: "جڑی بوٹیوں اور کیڑوں کا کنٹرول",
          bodyEn:
            "Control weeds within the first 20-25 days using recommended herbicides or manual weeding. Monitor regularly for stem borer and rice blast, and apply treatment promptly at the first sign of infestation to protect yield.",
          bodyUr:
            "پہلے 20 سے 25 دنوں میں تجویز کردہ جڑی بوٹی مار ادویات یا ہاتھ سے گوڈی کے ذریعے جڑی بوٹیوں کو کنٹرول کریں۔ تنے کے سرنگ لگانے والے کیڑے اور جھلساؤ کی باقاعدگی سے نگرانی کریں اور پیداوار کے تحفظ کے لیے حملے کی پہلی علامت پر فوری علاج کریں۔",
        },
      ],
     },
     {
      categoryEn: "Field Crops",
      categoryUr: "میدانی فصلیں",
      titleEn: "Managing Pests & Diseases in Rice",
      titleUr: "چاول میں کیڑوں اور بیماریوں کا انتظام",
      summaryEn:
        "A field-tested approach to spotting and treating rice blast, bacterial blight, stem borer, and hispa early.",
      summaryUr:
        "چاول کے جھلساؤ، بیکٹیریل بلائٹ، تنے کے سرنگ لگانے والے کیڑے اور ہسپا کیڑے کی بروقت نشاندہی اور علاج کا آزمودہ طریقہ۔",
      readTimeMinutes: 4,
      icon: "bug_report",
      order: 5,
      sections: [
        {
          headingEn: "Water Management to Reduce Disease",
          headingUr: "بیماری کم کرنے کے لیے پانی کا انتظام",
          bodyEn:
            "Avoid continuous deep flooding, which favors bacterial blight; alternate wetting and drying can reduce disease pressure while still meeting the crop's water needs.",
          bodyUr:
            "مسلسل گہرے پانی کھڑا رکھنے سے گریز کریں کیونکہ اس سے بیکٹیریل بلائٹ بڑھتا ہے؛ باری باری پانی دینا اور خشک کرنا فصل کی پانی کی ضرورت پوری کرتے ہوئے بیماری کا دباؤ کم کر سکتا ہے۔",
        },
        {
          headingEn: "Balanced Fertilizer Use",
          headingUr: "متوازن کھاد کا استعمال",
          bodyEn:
            "Excess nitrogen makes rice plants softer and more attractive to stem borer, hispa, and blast fungus. Split nitrogen doses across growth stages instead of applying it all at once.",
          bodyUr:
            "نائٹروجن کی زیادتی چاول کے پودوں کو نرم اور تنے کے کیڑے، ہسپا اور جھلساؤ کی پھپھوندی کے لیے زیادہ پرکشش بنا دیتی ہے۔ نائٹروجن کی خوراک ایک ہی بار دینے کے بجائے نشوونما کے مختلف مراحل میں تقسیم کریں۔",
        },
        {
          headingEn: "Timely Chemical Control",
          headingUr: "بروقت کیمیائی کنٹرول",
          bodyEn:
            "When pest or disease levels cross the recommended threshold, apply the specific fungicide or insecticide promptly, and avoid unnecessary blanket spraying that can harm natural predators like spiders and ladybird beetles.",
          bodyUr:
            "جب کیڑے یا بیماری کی سطح تجویز کردہ حد سے تجاوز کر جائے تو مخصوص فنجی سائیڈ یا کیڑے مار دوا فوری طور پر استعمال کریں، اور غیر ضروری عمومی اسپرے سے گریز کریں جو مکڑیوں اور لیڈی برڈ بیٹلز جیسے قدرتی شکاریوں کو نقصان پہنچا سکتا ہے۔",
        },
      ],
     },
    ],
  },
  {
    slug: "cotton",
    nameEn: "Cotton",
    nameUr: "کپاس",
    icon: "cotton",
    order: 3,
    showInPests: true,
    diseases: [
      {
        order: 1,
        nameEn: "Whitefly",
        nameUr: "سفید مکھی",
        descriptionEn:
          "Tiny white insects that suck sap and transmit viral diseases like leaf curl virus.",
        descriptionUr:
          "چھوٹے سفید کیڑے جو رس چوستے ہیں اور لیف کرل وائرس جیسی بیماریاں پھیلاتے ہیں۔",
        symptomsEn: [
          "Yellowing and curling of leaves",
          "Sticky honeydew leading to sooty mold",
          "Stunted plant growth and reduced boll formation",
        ],
        symptomsUr: [
          "پتوں کا پیلا ہونا اور مڑنا",
          "چپچپا مادہ جس سے کالی پھپھوندی بن جاتی ہے",
          "پودے کی نشوونما رک جانا اور ٹینڈوں کی تعداد کم ہونا",
        ],
        solutionsEn: [
          "Use yellow sticky traps to monitor population",
          "Spray a neem-based or recommended insecticide",
          "Remove and destroy heavily infested plant debris",
        ],
        solutionsUr: [
          "آبادی کی نگرانی کے لیے پیلے چپچپا ٹریپس استعمال کریں",
          "نیم پر مبنی یا تجویز کردہ کیڑے مار دوا کا اسپرے کریں",
          "شدید متاثرہ پودوں کی باقیات کو ہٹا کر تلف کریں",
        ],
      },
      {
        order: 2,
        nameEn: "Pink Bollworm",
        nameUr: "گلابی سنڈی",
        descriptionEn:
          "A destructive pest whose larvae feed inside cotton bolls, damaging fibre and seed.",
        descriptionUr:
          "ایک نقصان دہ کیڑا جس کے لاروے کپاس کے ٹینڈوں کے اندر رہ کر روئی اور بیج کو نقصان پہنچاتے ہیں۔",
        symptomsEn: [
          "Small holes in cotton bolls with larvae inside",
          "Rosette-shaped, deformed flowers",
          "Premature opening or shedding of bolls",
        ],
        symptomsUr: [
          "ٹینڈوں پر چھوٹے سوراخ جن کے اندر لاروے موجود ہوں",
          "پھولوں کی بگڑی ہوئی، گلاب نما شکل",
          "ٹینڈوں کا وقت سے پہلے کھلنا یا گرنا",
        ],
        solutionsEn: [
          "Install pheromone traps for early detection",
          "Destroy crop residue and avoid ratooning after harvest",
          "Apply recommended insecticide when the threshold level is reached",
        ],
        solutionsUr: [
          "ابتدائی نشاندہی کے لیے فیرومون ٹریپس نصب کریں",
          "کٹائی کے بعد فصل کی باقیات کو تلف کریں اور دوبارہ کاشت (ریٹونگ) سے گریز کریں",
          "نقصان کی حد تک پہنچنے پر تجویز کردہ کیڑے مار دوا کا استعمال کریں",
        ],
      },
      {
        order: 3,
        nameEn: "Cotton Leaf Curl Virus",
        nameUr: "کپاس کا پتہ مروڑ وائرس",
        descriptionEn:
          "A viral disease spread by whitefly, causing severe leaf curling and yield loss.",
        descriptionUr:
          "سفید مکھی کے ذریعے پھیلنے والی ایک وائرل بیماری جو پتوں کے شدید مڑنے اور پیداوار میں کمی کا باعث بنتی ہے۔",
        symptomsEn: [
          "Upward or downward curling of leaves",
          "Thickened, dark green veins on the underside of leaves",
          "Leaf-like outgrowths (enations) on the underside of leaves",
          "Stunted plants with reduced boll formation",
        ],
        symptomsUr: [
          "پتوں کا اوپر یا نیچے کی طرف مڑنا",
          "پتوں کے نیچے موٹی اور گہری سبز رگیں",
          "پتوں کے نیچے پتوں جیسی نشوونما (اینیشنز) کا بننا",
          "پودوں کی نشوونما رک جانا اور ٹینڈوں کی تعداد کم ہونا",
        ],
        solutionsEn: [
          "Grow virus-resistant cotton varieties",
          "Control whitefly population early using yellow sticky traps and recommended insecticides",
          "Remove and destroy infected plants promptly to reduce virus spread",
          "Avoid planting cotton near vegetable crops that host whitefly",
        ],
        solutionsUr: [
          "وائرس سے مزاحم کپاس کی اقسام کاشت کریں",
          "پیلے چپچپا ٹریپس اور تجویز کردہ کیڑے مار ادویات سے سفید مکھی کی آبادی کو ابتدائی مرحلے میں کنٹرول کریں",
          "وائرس کے پھیلاؤ کو کم کرنے کے لیے متاثرہ پودوں کو فوری طور پر ہٹا کر تلف کریں",
          "کپاس کو ایسی سبزیوں کی فصلوں کے قریب نہ لگائیں جو سفید مکھی کی میزبانی کرتی ہیں",
        ],
      },
      {
        order: 4,
        nameEn: "Cotton Aphid",
        nameUr: "کپاس کا تیلا",
        descriptionEn:
          "Small sap-sucking insects that cluster on the underside of leaves, weakening plants.",
        descriptionUr:
          "چھوٹے رس چوسنے والے کیڑے جو پتوں کی نچلی سطح پر جمع ہو کر پودوں کو کمزور کرتے ہیں۔",
        symptomsEn: [
          "Curling and yellowing of leaves",
          "Sticky honeydew on leaves and lint, reducing cotton quality",
          "Sooty mold growth on affected leaves",
        ],
        symptomsUr: [
          "پتوں کا مڑنا اور پیلا ہونا",
          "پتوں اور روئی پر چپچپا میٹھا مادہ جو کپاس کے معیار کو کم کرتا ہے",
          "متاثرہ پتوں پر کالی پھپھوندی کا اگنا",
        ],
        solutionsEn: [
          "Conserve natural predators like ladybird beetles and lacewings",
          "Spray neem oil or insecticidal soap for light infestations",
          "Use a recommended systemic insecticide only when the economic threshold is reached",
        ],
        solutionsUr: [
          "لیڈی برڈ بیٹل اور لیس ونگ جیسے قدرتی شکاریوں کو محفوظ رکھیں",
          "ہلکے حملے کے لیے نیم کا تیل یا کیڑے مار صابن اسپرے کریں",
          "معاشی نقصان کی حد تک پہنچنے پر ہی تجویز کردہ سسٹیمک کیڑے مار دوا استعمال کریں",
        ],
      },
    ],
    articles: [
     {
      categoryEn: "Cash Crops",
      categoryUr: "نقدی فصلیں",
      titleEn: "Cotton Farming: A Season-by-Season Guide",
      titleUr: "کپاس کی کاشت: موسم بہ موسم رہنما",
      summaryEn:
        "Key guidance on sowing time, fertilizer schedule, and pest management to maximize cotton yield.",
      summaryUr:
        "کپاس کی پیداوار بڑھانے کے لیے بوائی کے وقت، کھاد کے شیڈول اور کیڑوں کے انتظام سے متعلق اہم رہنمائی۔",
      readTimeMinutes: 5,
      icon: "cotton",
      order: 3,
      sections: [
        {
          headingEn: "Sowing Time & Seed Rate",
          headingUr: "بوائی کا وقت اور بیج کی مقدار",
          bodyEn:
            "Sow cotton from mid-April to May once soil temperature reaches around 18°C. Use 6-8 kg of delinted seed per acre with a row spacing of 75 cm and plant-to-plant distance of 25-30 cm to ensure good sunlight and air circulation.",
          bodyUr:
            "جب مٹی کا درجہ حرارت تقریباً 18 ڈگری سینٹی گریڈ تک پہنچ جائے تو اپریل کے وسط سے مئی تک کپاس کی بوائی کریں۔ فی ایکڑ 6 سے 8 کلوگرام ڈی لنٹڈ بیج استعمال کریں، قطاروں کا فاصلہ 75 سینٹی میٹر اور پودے سے پودے کا فاصلہ 25 سے 30 سینٹی میٹر رکھیں تاکہ سورج کی روشنی اور ہوا کی گردش بہتر رہے۔",
        },
        {
          headingEn: "Fertilizer & Irrigation Schedule",
          headingUr: "کھاد اور آبپاشی کا شیڈول",
          bodyEn:
            "Apply fertilizer in split doses: half of the nitrogen and full phosphorus/potash at sowing, with the remaining nitrogen at the flowering stage. Cotton needs irrigation every 15-20 days depending on weather, with special care during flowering and boll formation.",
          bodyUr:
            "کھاد کو تقسیم شدہ خوراکوں میں دیں: بوائی کے وقت نصف نائٹروجن اور مکمل فاسفورس/پوٹاش، جبکہ باقی نائٹروجن پھول آنے کے مرحلے پر دیں۔ کپاس کو موسم کے لحاظ سے ہر 15 سے 20 دن بعد آبپاشی کی ضرورت ہوتی ہے، خاص طور پر پھول اور ٹینڈے بننے کے دوران خاص خیال رکھیں۔",
        },
        {
          headingEn: "Managing Whitefly & Bollworm",
          headingUr: "سفید مکھی اور سنڈی کا انتظام",
          bodyEn:
            "Scout the field weekly for whitefly and pink bollworm. Use yellow sticky traps and pheromone traps for early detection, and rely on recommended insecticides only when pest levels cross the economic threshold, to protect beneficial insects.",
          bodyUr:
            "سفید مکھی اور گلابی سنڈی کے لیے ہفتہ وار کھیت کا معائنہ کریں۔ ابتدائی نشاندہی کے لیے پیلے چپچپا ٹریپس اور فیرومون ٹریپس استعمال کریں، اور فائدہ مند کیڑوں کے تحفظ کے لیے تجویز کردہ کیڑے مار ادویات صرف اس وقت استعمال کریں جب کیڑوں کی سطح معاشی نقصان کی حد سے تجاوز کر جائے۔",
        },
      ],
     },
     {
      categoryEn: "Cash Crops",
      categoryUr: "نقدی فصلیں",
      titleEn: "Managing Pests & Diseases in Cotton",
      titleUr: "کپاس میں کیڑوں اور بیماریوں کا انتظام",
      summaryEn:
        "Practical steps to control whitefly, pink bollworm, leaf curl virus, and aphids throughout the cotton season.",
      summaryUr:
        "پورے کپاس کے سیزن میں سفید مکھی، گلابی سنڈی، پتہ مروڑ وائرس اور تیلے کو کنٹرول کرنے کے عملی اقدامات۔",
      readTimeMinutes: 5,
      icon: "bug_report",
      order: 6,
      sections: [
        {
          headingEn: "Early Season Vigilance",
          headingUr: "سیزن کے آغاز میں چوکسی",
          bodyEn:
            "Whitefly and leaf curl virus establish early, so start monitoring from the seedling stage using yellow sticky traps, and remove any plant showing leaf curl symptoms immediately to slow virus spread.",
          bodyUr:
            "سفید مکھی اور پتہ مروڑ وائرس ابتدائی مرحلے میں ہی قائم ہو جاتے ہیں، اس لیے پنیری کے مرحلے سے ہی پیلے چپچپا ٹریپس کے ذریعے نگرانی شروع کریں اور پتہ مروڑ کی علامات ظاہر کرنے والے کسی بھی پودے کو فوری طور پر ہٹا دیں تاکہ وائرس کا پھیلاؤ سست ہو۔",
        },
        {
          headingEn: "Pheromone Traps for Bollworm",
          headingUr: "سنڈی کے لیے فیرومون ٹریپس",
          bodyEn:
            "Install pheromone traps at flowering to track pink bollworm moth activity, and time insecticide sprays based on trap catches rather than a fixed calendar schedule.",
          bodyUr:
            "پھول آنے کے مرحلے پر گلابی سنڈی کے پتنگوں کی سرگرمی جاننے کے لیے فیرومون ٹریپس نصب کریں، اور کیڑے مار دوا کا اسپرے مقررہ کیلنڈر کے بجائے ٹریپ میں پکڑے گئے پتنگوں کی تعداد کی بنیاد پر کریں۔",
        },
        {
          headingEn: "End-of-Season Sanitation",
          headingUr: "سیزن کے اختتام پر صفائی",
          bodyEn:
            "After the last picking, destroy crop stalks and residue promptly rather than leaving them in the field, since leftover stalks let pink bollworm and whitefly survive to infest the next season's crop.",
          bodyUr:
            "آخری چنائی کے بعد فصل کی ٹہنیوں اور باقیات کو کھیت میں چھوڑنے کے بجائے فوری طور پر تلف کریں، کیونکہ باقی رہ جانے والی ٹہنیاں گلابی سنڈی اور سفید مکھی کو اگلے سیزن کی فصل پر حملہ کرنے کے لیے زندہ رہنے دیتی ہیں۔",
        },
      ],
     },
    ],
  },
];

async function run() {
  for (const crop of CROPS) {
    await db.collection("learning_crops").doc(crop.slug).set({
      nameEn: crop.nameEn,
      nameUr: crop.nameUr,
      icon: crop.icon,
      order: crop.order,
      showInPests: crop.showInPests,
    });
    console.log(`✔ crop: ${crop.slug}`);

    for (let i = 0; i < crop.diseases.length; i++) {
      const d = crop.diseases[i];
      const diseaseId = `${crop.slug}_pest_${i + 1}`;
      await db.collection("learning_crop_diseases").doc(diseaseId).set({
        cropId: crop.slug,
        order: d.order,
        nameEn: d.nameEn,
        nameUr: d.nameUr,
        descriptionEn: d.descriptionEn,
        descriptionUr: d.descriptionUr,
        symptomsEn: d.symptomsEn,
        symptomsUr: d.symptomsUr,
        solutionsEn: d.solutionsEn,
        solutionsUr: d.solutionsUr,
      });
      console.log(`  ✔ disease: ${diseaseId}`);
    }

    for (let j = 0; j < crop.articles.length; j++) {
      const a = crop.articles[j];
      // First article keeps its original id for backward compatibility with
      // the earlier seed run; subsequent ones get a suffixed id.
      const articleId =
        j === 0 ? `${crop.slug}_article` : `${crop.slug}_article_${j + 1}`;
      await db.collection("learning_articles").doc(articleId).set({
        categoryEn: a.categoryEn,
        categoryUr: a.categoryUr,
        titleEn: a.titleEn,
        titleUr: a.titleUr,
        summaryEn: a.summaryEn,
        summaryUr: a.summaryUr,
        readTimeMinutes: a.readTimeMinutes,
        icon: a.icon,
        order: a.order,
      });
      console.log(`  ✔ article: ${articleId}`);

      for (let i = 0; i < a.sections.length; i++) {
        const s = a.sections[i];
        const sectionId = `${articleId}_section_${i + 1}`;
        await db.collection("learning_article_sections").doc(sectionId).set({
          articleId,
          order: i + 1,
          headingEn: s.headingEn,
          headingUr: s.headingUr,
          bodyEn: s.bodyEn,
          bodyUr: s.bodyUr,
        });
        console.log(`    ✔ section: ${sectionId}`);
      }
    }
  }

  console.log(
    "\nDone. Seeded 3 crops, 12 pests/diseases, 6 articles, 18 sections."
  );
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
