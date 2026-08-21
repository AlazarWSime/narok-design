"use client";

import { FormEvent, useState } from "react";

type Language = "en" | "am";
type PageKind = "shop" | "collection" | "custom" | "about";

const routes = ["/shop", "/collection", "/custom-orders", "/about"];
const menuLabels = {
  en: ["Shop", "Collection", "Custom Orders", "About"],
  am: ["ይግዙ", "ስብስብ", "ብጁ ትዕዛዝ", "ስለ እኛ"],
};

const products = [
  ["Addis Tibeb Kemis", "አዲስ ጥበብ ቀሚስ", "$220 USD · 31,000 ETB", "Women / ሴቶች", "https://www.ethiopian.store/cdn/shop/files/il_fullxfull.4965225750_cwwu-898104.jpg?v=1749304439&width=1200"],
  ["Gondar Celebration Dress", "ጎንደር የበዓል ቀሚስ", "$285 USD · 40,000 ETB", "Women / ሴቶች", "https://www.ethiopian.store/cdn/shop/files/photo_2025-08-27_00-23-58.jpg?v=1756280221&width=1200"],
  ["Shewa Men’s Ensemble", "የሸዋ ወንዶች ልብስ", "$190 USD · 27,000 ETB", "Men / ወንዶች", "https://ethiopian.store/cdn/shop/products/il_fullxfull.5048486776_4jmy.jpg?v=1719987561&width=1200"],
  ["Lalibela Ceremonial Set", "ላሊበላ የክብረ በዓል ልብስ", "$240 USD · 34,000 ETB", "Men / ወንዶች", "https://www.ethiopian.store/cdn/shop/files/1000001064.jpg?v=1718881402&width=1200"],
  ["Little Habesha Dress", "የልጆች ሐበሻ ቀሚስ", "$95 USD · 13,500 ETB", "Children / ልጆች", "https://ethgebya.com/cdn/shop/files/il_fullxfull.7466953991_51ip.jpg?v=1771942000&width=1200"],
  ["Children’s Festive Set", "የልጆች የበዓል ልብስ", "$110 USD · 15,500 ETB", "Children / ልጆች", "https://i.etsystatic.com/56419426/r/il/89c07f/7318225934/il_fullxfull.7318225934_6r5e.jpg"],
];

const pageCopy = {
  shop: {
    en: ["Shop", "Clothing made to carry Ethiopian heritage forward.", "Browse sample ready-made and made-to-order pieces for women, men and children."],
    am: ["ይግዙ", "የኢትዮጵያን ቅርስ ወደፊት የሚያስተላልፉ ልብሶች።", "ለሴቶች፣ ለወንዶች እና ለልጆች የተዘጋጁ እና ብጁ ልብሶችን ይመልከቱ።"],
  },
  collection: {
    en: ["Collection", "A wardrobe shaped by place, memory and celebration.", "Discover the three parts of the NAROK DESIGN collection."],
    am: ["ስብስብ", "በቦታ፣ በትውስታ እና በበዓል የተቀረጸ ልብስ።", "የNAROK DESIGN ስብስብ ሦስት ክፍሎችን ይወቁ።"],
  },
  custom: {
    en: ["Custom Orders", "Made around your measurements, color and occasion.", "Share your preferences with our Addis Ababa atelier through this frontend request form."],
    am: ["ብጁ ትዕዛዝ", "በእርስዎ መጠን፣ ቀለም እና ዝግጅት የተሰራ።", "ምርጫዎን ለአዲስ አበባ የስፌት ቤታችን ያካፍሉ።"],
  },
  about: {
    en: ["About", "Ethiopian design, created in Addis Ababa for the world.", "Meet the story, purpose and process behind NAROK DESIGN."],
    am: ["ስለ እኛ", "በአዲስ አበባ ለዓለም የተፈጠረ የኢትዮጵያ ዲዛይን።", "የNAROK DESIGNን ታሪክ፣ ዓላማ እና ሂደት ይወቁ።"],
  },
};

export default function InnerPage({ kind }: { kind: PageKind }) {
  const [language, setLanguage] = useState<Language>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bag, setBag] = useState<string[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const copy = pageCopy[kind][language];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setSent(true);
  };

  return (
    <main className="inner-page">
      <div className="announcement"><span>{language === "en" ? "Designed in Addis Ababa · Worldwide delivery" : "በአዲስ አበባ የተነደፈ · ዓለም አቀፍ መላኪያ"}</span><span aria-hidden="true">✦</span><button onClick={() => setLanguage(language === "en" ? "am" : "en")}>{language === "en" ? "አማርኛ" : "English"}</button><span>USD · ETB</span></div>
      <header className="site-header page-header scrolled">
        <button className="header-action menu-trigger" onClick={() => setMenuOpen(true)}><span className="menu-lines"><i /><i /></span>{language === "en" ? "Menu" : "ምናሌ"}</button>
        <a className="wordmark" href="/">NAROK DESIGN</a>
        <div className="header-actions"><a className="header-action" href="/shop">{language === "en" ? "Search" : "ፈልግ"}</a><button className="header-action" onClick={() => setBagOpen(true)}>{language === "en" ? "Bag" : "ቦርሳ"} <span>{bag.length}</span></button></div>
      </header>

      <section className={`page-hero page-hero-${kind}`}>
        <div><p className="eyebrow">NAROK DESIGN · ADDIS ABABA</p><h1>{copy[1]}</h1><p>{copy[2]}</p></div>
        <span>{copy[0]}</span>
      </section>

      {kind === "shop" && <ShopContent language={language} bag={bag} setBag={setBag} />}
      {kind === "collection" && <CollectionContent language={language} />}
      {kind === "custom" && <CustomContent language={language} sent={sent} submit={submit} />}
      {kind === "about" && <AboutContent language={language} />}

      <footer className="inner-footer"><div><a className="wordmark" href="/">NAROK DESIGN</a><p>{language === "en" ? "Ethiopian heritage, made for the world." : "የኢትዮጵያ ቅርስ፣ ለዓለም የተሰራ።"}</p></div><nav>{menuLabels[language].map((label, index) => <a href={routes[index]} key={label}>{label}</a>)}</nav><p>© 2026 · ADDIS ABABA, ETHIOPIA</p></footer>

      <button className={`panel-backdrop ${menuOpen || bagOpen ? "visible" : ""}`} onClick={() => { setMenuOpen(false); setBagOpen(false); }} aria-label="Close panel" />
      <aside className={`side-panel menu-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}><button className="panel-close" onClick={() => setMenuOpen(false)}>×</button><p className="panel-label">{language === "en" ? "Explore NAROK DESIGN" : "NAROK DESIGNን ያስሱ"}</p><nav>{menuLabels[language].map((label, index) => <a className={routes[index].includes(kind === "custom" ? "custom-orders" : kind) ? "current" : ""} href={routes[index]} key={label}>{label}<span>0{index + 1}</span></a>)}</nav><div className="panel-meta"><button onClick={() => setLanguage(language === "en" ? "am" : "en")}>{language === "en" ? "አማርኛ" : "English"}</button><a href="/">Home</a></div></aside>
      <aside className={`side-panel cart-panel ${bagOpen ? "open" : ""}`} aria-hidden={!bagOpen}><button className="panel-close" onClick={() => setBagOpen(false)}>×</button><p className="panel-label">{language === "en" ? "Your bag" : "ቦርሳዎ"} · {bag.length}</p>{bag.length === 0 ? <div className="empty-bag"><p>{language === "en" ? "Your bag is waiting." : "ቦርሳዎ እየጠበቀ ነው።"}</p></div> : <div className="bag-items">{bag.map((item, index) => <div key={`${item}-${index}`}><span>0{index + 1}</span><p>{item}</p><button onClick={() => setBag((items) => items.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div>}</aside>
    </main>
  );
}

function ShopContent({ language, bag, setBag }: { language: Language; bag: string[]; setBag: (value: string[]) => void }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? products : products.filter((product) => product[3].startsWith(filter));
  return <section className="inner-content shop-page"><div className="inner-section-heading"><p className="eyebrow dark">{language === "en" ? "Sample catalogue" : "የናሙና ካታሎግ"}</p><h2>{language === "en" ? "Shop every piece" : "ሁሉንም ልብስ ይመልከቱ"}</h2></div><div className="filter-row">{["All", "Women", "Men", "Children"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="product-grid">{filtered.map((product) => <article className="product-card" key={product[0]}><div className="product-image"><img src={product[4]} alt={`${product[0]} sample`} /><span className="sample-badge">Sample image</span><button className="quick-add" onClick={() => setBag([...bag, language === "en" ? product[0] : product[1]])}>+</button></div><div className="product-info"><div><h3>{language === "en" ? product[0] : product[1]}</h3><p>{product[3]}</p></div><p>{product[2]}</p></div></article>)}</div></section>;
}

function CollectionContent({ language }: { language: Language }) {
  const collections = language === "en" ? [
    ["Women", "Habesha kemis reimagined through considered proportions, expressive color and hand-finished detail."],
    ["Men", "Ceremonial and everyday ensembles that pair Ethiopian textile language with a clean modern silhouette."],
    ["Children", "Soft, joyful traditional clothing designed for celebrations, portraits and family occasions."],
  ] : [["ሴቶች", "በዘመናዊ ቅርጽ፣ ቀለም እና በእጅ ጥበብ የተሰራ ሐበሻ ቀሚስ።"], ["ወንዶች", "የኢትዮጵያን ጨርቅ ቋንቋ ከዘመናዊ ቅርጽ ጋር የሚያጣምሩ ልብሶች።"], ["ልጆች", "ለበዓል፣ ለፎቶ እና ለቤተሰብ ዝግጅት የተሰሩ ለስላሳ ባህላዊ ልብሶች።"]];
  return <section className="inner-content collection-page">{collections.map(([title, body], index) => <article className="collection-feature" key={title}><div className={`collection-visual visual-${index + 1}`}><span>0{index + 1}</span></div><div><p className="eyebrow dark">NAROK DESIGN COLLECTION</p><h2>{title}</h2><p>{body}</p><a href="/shop">{language === "en" ? "Shop this collection" : "ይህን ስብስብ ይግዙ"} →</a></div></article>)}</section>;
}

function CustomContent({ language, sent, submit }: { language: Language; sent: boolean; submit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <section className="inner-content custom-page"><div className="custom-page-intro"><p className="eyebrow dark">01 · 04</p><h2>{language === "en" ? "Tell us what you want to create." : "ምን መፍጠር እንደሚፈልጉ ይንገሩን።"}</h2><p>{language === "en" ? "After you submit, the atelier will eventually review your request, confirm measurements and recommend the final fabric and timeline. This version remains a frontend demonstration." : "ጥያቄዎን ከላኩ በኋላ የስፌት ቤቱ መጠን፣ ጨርቅ እና ጊዜ ያረጋግጣል። ይህ ገጽ የፊት ገጽ ማሳያ ብቻ ነው።"}</p><ol><li>01 · {language === "en" ? "Choose the garment" : "ልብስ ይምረጡ"}</li><li>02 · {language === "en" ? "Share measurements" : "መጠን ያስገቡ"}</li><li>03 · {language === "en" ? "Choose color and fabric" : "ቀለምና ጨርቅ ይምረጡ"}</li><li>04 · {language === "en" ? "Add occasion and date" : "ዝግጅትና ቀን ያስገቡ"}</li></ol></div><form className="custom-form page-form" onSubmit={submit}><label>{language === "en" ? "Full name" : "ሙሉ ስም"}<input required /></label><label>{language === "en" ? "Email or WhatsApp" : "ኢሜይል ወይም WhatsApp"}<input required /></label><label className="full">{language === "en" ? "Garment" : "ልብስ"}<select defaultValue="" required><option value="" disabled>{language === "en" ? "Choose a garment" : "ልብስ ይምረጡ"}</option><option>Habesha kemis</option><option>Men’s traditional clothing</option><option>Children’s traditional clothing</option></select></label><label className="full">{language === "en" ? "Measurements" : "መጠኖች"}<textarea required /></label><label>{language === "en" ? "Color" : "ቀለም"}<input required /></label><label>{language === "en" ? "Fabric" : "ጨርቅ"}<input required /></label><label>{language === "en" ? "Occasion" : "ዝግጅት"}<input /></label><label>{language === "en" ? "Needed by" : "የሚፈለግበት ቀን"}<input type="date" /></label><div className="form-submit full"><button>{language === "en" ? "Send custom request" : "ብጁ ጥያቄ ይላኩ"} →</button><small>{language === "en" ? "Demo only — no data is sent yet." : "ማሳያ ብቻ — መረጃ አይላክም።"}</small></div>{sent && <p className="form-success full">{language === "en" ? "Thank you. Your request has been saved in this demo." : "እናመሰግናለን። ጥያቄዎ በማሳያው ውስጥ ተቀምጧል።"}</p>}</form></section>;
}

function AboutContent({ language }: { language: Language }) {
  return <section className="inner-content about-page"><article className="about-story"><div className="about-image" /><div><p className="eyebrow dark">{language === "en" ? "Our story" : "ታሪካችን"}</p><h2>{language === "en" ? "A contemporary home for Ethiopian clothing." : "ለኢትዮጵያ ልብስ ዘመናዊ ቤት።"}</h2><p>{language === "en" ? "NAROK DESIGN was imagined in Addis Ababa by an Ethiopian designer with a belief that traditional clothing can feel rooted, personal and relevant wherever it is worn. We design for Ethiopians at home, the diaspora and international customers discovering Ethiopian artistry." : "NAROK DESIGN በአዲስ አበባ በኢትዮጵያዊ ዲዛይነር ተፈጠረ። ለኢትዮጵያውያን፣ በውጭ ለሚኖሩ እና የኢትዮጵያን ጥበብ ለሚያውቁ ደንበኞች እንፈጥራለን።"}</p></div></article><div className="values-grid">{(language === "en" ? [["Place", "Designed in Addis Ababa, Ethiopia."], ["Purpose", "Preserve heritage through clothing made to be lived in."], ["People", "Created for women, men, children and a global community."], ["Process", "Ready-made and made-to-order, with room for personal choice."]] : [["ቦታ", "በአዲስ አበባ፣ ኢትዮጵያ የተነደፈ።"], ["ዓላማ", "በሚለበስ ልብስ ቅርስን መጠበቅ።"], ["ሰዎች", "ለሴቶች፣ ለወንዶች፣ ለልጆች እና ለዓለም ማህበረሰብ።"], ["ሂደት", "ዝግጁ እና ብጁ ትዕዛዝ፣ ለግል ምርጫ ቦታ ያለው።"]]).map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>;
}
