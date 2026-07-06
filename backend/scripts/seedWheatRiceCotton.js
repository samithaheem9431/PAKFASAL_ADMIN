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
    ],
    article: {
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
    ],
    article: {
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
    ],
    article: {
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

    const articleId = `${crop.slug}_article`;
    const a = crop.article;
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

  console.log("\nDone. Seeded 3 crops, 6 pests/diseases, 3 articles, 9 sections.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
