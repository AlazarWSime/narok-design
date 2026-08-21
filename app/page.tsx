"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Language = "en" | "am";
type Category = "all" | "women" | "men" | "children";
type Product = {
  id: number;
  category: Exclude<Category, "all">;
  name: Record<Language, string>;
  type: Record<Language, string>;
  usd: number;
  etb: number;
  image: string;
  madeToOrder?: boolean;
};

const products: Product[] = [
  { id: 1, category: "women", name: { en: "Addis Tibeb Kemis", am: "አዲስ ጥበብ ቀሚስ" }, type: { en: "Ready-made · Hand-finished", am: "ዝግጁ · በእጅ የተጠናቀቀ" }, usd: 220, etb: 31000, image: "https://www.ethiopian.store/cdn/shop/files/il_fullxfull.4965225750_cwwu-898104.jpg?v=1749304439&width=1200" },
  { id: 2, category: "women", name: { en: "Gondar Celebration Dress", am: "ጎንደር የበዓል ቀሚስ" }, type: { en: "Made to order · Cotton", am: "በትዕዛዝ · ጥጥ" }, usd: 285, etb: 40000, image: "https://www.ethiopian.store/cdn/shop/files/photo_2025-08-27_00-23-58.jpg?v=1756280221&width=1200", madeToOrder: true },
  { id: 3, category: "men", name: { en: "Shewa Men’s Ensemble", am: "የሸዋ ወንዶች ልብስ" }, type: { en: "Made to order · Two-piece", am: "በትዕዛዝ · ሁለት ክፍል" }, usd: 190, etb: 27000, image: "https://ethiopian.store/cdn/shop/products/il_fullxfull.5048486776_4jmy.jpg?v=1719987561&width=1200", madeToOrder: true },
  { id: 4, category: "men", name: { en: "Lalibela Ceremonial Set", am: "ላሊበላ የክብረ በዓል ልብስ" }, type: { en: "Made to order · Woven detail", am: "በትዕዛዝ · የተሸመነ ጥበብ" }, usd: 240, etb: 34000, image: "https://www.ethiopian.store/cdn/shop/files/1000001064.jpg?v=1718881402&width=1200", madeToOrder: true },
  { id: 5, category: "children", name: { en: "Little Habesha Dress", am: "የልጆች ሐበሻ ቀሚስ" }, type: { en: "Ready-made · Soft cotton", am: "ዝግጁ · ለስላሳ ጥጥ" }, usd: 95, etb: 13500, image: "https://ethgebya.com/cdn/shop/files/il_fullxfull.7466953991_51ip.jpg?v=1771942000&width=1200" },
  { id: 6, category: "children", name: { en: "Children’s Festive Set", am: "የልጆች የበዓል ልብስ" }, type: { en: "Made to order · Custom color", am: "በትዕዛዝ · ብጁ ቀለም" }, usd: 110, etb: 15500, image: "https://i.etsystatic.com/56419426/r/il/89c07f/7318225934/il_fullxfull.7318225934_6r5e.jpg", madeToOrder: true },
];

const copy = {
  en: {
    announcement: "Designed in Addis Ababa · Worldwide delivery", menu: "Menu", search: "Search", bag: "Bag",
    nav: ["Shop", "Collection", "Custom Orders", "About"], navHrefs: ["/shop", "/collection", "/custom-orders", "/about"],
    heroEyebrow: "Ethiopian design · Made in Addis Ababa", heroTitle: "Ethiopian Heritage, Made for the World.",
    heroBody: "Traditional clothing shaped by Ethiopian artistry, made for celebrations, ceremonies and everyday pride—wherever you call home.",
    shopNow: "Shop the collection", customCta: "Create a custom order", categories: ["Women", "Men", "Children", "Custom", "Our Story"],
    filters: { all: "All pieces", women: "Women", men: "Men", children: "Children" },
    collectionEyebrow: "Sample collection · 01", collectionTitle: "Tradition, tailored to you",
    collectionBody: "Explore ready-made and made-to-order clothing for women, men and children. Sample pieces and pricing are shown while the final collection is prepared.",
    visualSample: "Sample image", add: "Add to bag",
    storyEyebrow: "Our atelier · Addis Ababa", storyTitle: "Designed by an Ethiopian hand, for a global community.",
    storyBody: "NAROK DESIGN brings the language of Ethiopian traditional clothing into a contemporary wardrobe. Each silhouette begins in Addis Ababa and celebrates the skill, color and symbolism carried through generations.",
    storyBody2: "We create for Ethiopians at home, the diaspora, and anyone around the world who wants to wear Ethiopian heritage with respect and joy.", storyLink: "Meet NAROK DESIGN",
    customEyebrow: "Made for you · 02", customTitle: "Your measurements. Your color. Your story.",
    customBody: "Choose a style and tell us how you want it made. This frontend demo captures the details our atelier will need before confirming fabric, timeline and final price.",
    steps: ["Choose your garment", "Share measurements", "Select color & fabric", "Confirm occasion & deadline"],
    form: { name: "Full name", contact: "Email or WhatsApp", garment: "Garment", garmentPlaceholder: "Choose a garment", garments: ["Women’s Habesha kemis", "Men’s traditional clothing", "Children’s traditional clothing"], measurements: "Measurements", measurementsPlaceholder: "Chest, waist, hip, height, shoulder, sleeve length…", color: "Preferred color", fabric: "Fabric preference", fabricPlaceholder: "Handwoven cotton, chiffon, or choose for me", occasion: "Occasion", deadline: "Needed by", notes: "Additional notes", submit: "Send custom request", success: "Thank you. Your custom request has been saved in this demo.", demo: "Demo only — no information is sent to a server yet." },
    policiesEyebrow: "What to expect · 03", policiesTitle: "From Addis Ababa to your door",
    policies: [["Ready-made", "Dispatched in 2–4 business days."], ["Custom orders", "Created in approximately 3–6 weeks after measurements and design are confirmed."], ["Worldwide delivery", "Estimated delivery in 5–12 business days after dispatch."], ["Returns", "Unworn ready-made pieces may be returned within 14 days. Custom orders are final sale."]],
    newsletterTitle: "Stories, new pieces and atelier notes from Addis Ababa.", newsletterLabel: "Join the NAROK DESIGN list", newsletterPlaceholder: "Your email address", subscribed: "Welcome to NAROK DESIGN.",
    footerGroups: [["Shop", "Women", "Men", "Children", "Custom Orders"], ["About", "Our Story", "Craft & Care", "Delivery", "Returns"], ["Visit", "Addis Ababa, Ethiopia", "Worldwide delivery", "Consultations by request"]],
    panelMenu: "Explore NAROK DESIGN", panelSearch: "Search the collection", searchPlaceholder: "Search dresses, men, children…", suggestions: "Try: Habesha kemis, custom, children, men",
    bagTitle: "Your bag", emptyBag: "Your bag is waiting for something special.", continueShopping: "Continue shopping", checkout: "Continue to checkout", checkoutDemo: "Checkout is ready to connect to your future online store.", noResults: "No sample pieces match that search yet.",
  },
  am: {
    announcement: "በአዲስ አበባ የተነደፈ · ዓለም አቀፍ መላኪያ", menu: "ምናሌ", search: "ፈልግ", bag: "ቦርሳ",
    nav: ["ይግዙ", "ስብስብ", "ብጁ ትዕዛዝ", "ስለ እኛ"], navHrefs: ["/shop", "/collection", "/custom-orders", "/about"],
    heroEyebrow: "የኢትዮጵያ ዲዛይን · በአዲስ አበባ የተሰራ", heroTitle: "የኢትዮጵያ ቅርስ፣ ለዓለም የተሰራ።",
    heroBody: "በኢትዮጵያ ጥበብ የተቀረጹ ባህላዊ ልብሶች፤ ለበዓል፣ ለሥነ ሥርዓት እና ለዕለት ኩራት።",
    shopNow: "ስብስቡን ይመልከቱ", customCta: "ብጁ ትዕዛዝ ይፍጠሩ", categories: ["ሴቶች", "ወንዶች", "ልጆች", "ብጁ", "ታሪካችን"],
    filters: { all: "ሁሉም", women: "ሴቶች", men: "ወንዶች", children: "ልጆች" }, collectionEyebrow: "የናሙና ስብስብ · 01", collectionTitle: "ባህል፣ ለእርስዎ የተሰፋ",
    collectionBody: "ለሴቶች፣ ለወንዶች እና ለልጆች የተዘጋጁ እና በትዕዛዝ የሚሰሩ ልብሶችን ይመልከቱ።", visualSample: "የናሙና ምስል", add: "ወደ ቦርሳ ጨምር",
    storyEyebrow: "የልብስ ስፌት ቤታችን · አዲስ አበባ", storyTitle: "በኢትዮጵያዊ ዲዛይነር፣ ለዓለም ማህበረሰብ።",
    storyBody: "NAROK DESIGN የኢትዮጵያን ባህላዊ አልባሳት ቋንቋ ወደ ዘመናዊ ልብስ ያመጣል። እያንዳንዱ ንድፍ በአዲስ አበባ ይጀምራል።",
    storyBody2: "በኢትዮጵያ፣ በውጭ አገር ለሚኖሩ ኢትዮጵያውያን እና ቅርሱን በክብር ለሚለብሱ ሁሉ እንፈጥራለን።", storyLink: "NAROK DESIGNን ይወቁ",
    customEyebrow: "ለእርስዎ የተሰራ · 02", customTitle: "የእርስዎ መጠን። የእርስዎ ቀለም። የእርስዎ ታሪክ።",
    customBody: "የሚፈልጉትን ልብስ ይምረጡ እና እንዴት እንዲሰራ ይንገሩን። ይህ የፊት ገጽ ማሳያ መረጃዎን ብቻ ያሳያል።", steps: ["ልብስ ይምረጡ", "መጠን ያስገቡ", "ቀለምና ጨርቅ ይምረጡ", "ቀንና ዝግጅት ያረጋግጡ"],
    form: { name: "ሙሉ ስም", contact: "ኢሜይል ወይም WhatsApp", garment: "ልብስ", garmentPlaceholder: "ልብስ ይምረጡ", garments: ["የሴቶች ሐበሻ ቀሚስ", "የወንዶች ባህላዊ ልብስ", "የልጆች ባህላዊ ልብስ"], measurements: "መጠኖች", measurementsPlaceholder: "ደረት፣ ወገብ፣ ቁመት፣ ትከሻ፣ እጅጌ…", color: "የሚፈለግ ቀለም", fabric: "የጨርቅ ምርጫ", fabricPlaceholder: "የእጅ ጥጥ፣ ሺፎን፣ ወይም ምረጡልኝ", occasion: "ዝግጅት", deadline: "የሚፈለግበት ቀን", notes: "ተጨማሪ መረጃ", submit: "ብጁ ጥያቄ ይላኩ", success: "እናመሰግናለን። ጥያቄዎ በዚህ ማሳያ ውስጥ ተቀምጧል።", demo: "ማሳያ ብቻ — መረጃ ወደ ሰርቨር አይላክም።" },
    policiesEyebrow: "ምን እንደሚጠበቅ · 03", policiesTitle: "ከአዲስ አበባ እስከ ቤትዎ",
    policies: [["ዝግጁ ልብስ", "በ2–4 የሥራ ቀናት ውስጥ ይላካል።"], ["ብጁ ትዕዛዝ", "መጠንና ዲዛይን ከተረጋገጠ በኋላ በ3–6 ሳምንታት ይዘጋጃል።"], ["ዓለም አቀፍ መላኪያ", "ከተላከ በኋላ በ5–12 የሥራ ቀናት ይደርሳል።"], ["መመለሻ", "ያልተለበሰ ዝግጁ ልብስ በ14 ቀናት ይመለሳል። ብጁ ትዕዛዝ አይመለስም።"]],
    newsletterTitle: "ከአዲስ አበባ ታሪኮች፣ አዳዲስ ልብሶች እና የስፌት ቤት ዜና።", newsletterLabel: "የNAROK DESIGN ዜና ይቀበሉ", newsletterPlaceholder: "የኢሜይል አድራሻ", subscribed: "ወደ NAROK DESIGN እንኳን ደህና መጡ።",
    footerGroups: [["ይግዙ", "ሴቶች", "ወንዶች", "ልጆች", "ብጁ ትዕዛዝ"], ["ስለ እኛ", "ታሪካችን", "ጥበብና እንክብካቤ", "መላኪያ", "መመለሻ"], ["አድራሻ", "አዲስ አበባ፣ ኢትዮጵያ", "ዓለም አቀፍ መላኪያ", "ቀጠሮ በጥያቄ"]],
    panelMenu: "NAROK DESIGNን ያስሱ", panelSearch: "ስብስቡን ይፈልጉ", searchPlaceholder: "ቀሚስ፣ ወንዶች፣ ልጆች…", suggestions: "ሐበሻ ቀሚስ፣ ብጁ፣ ልጆች፣ ወንዶች",
    bagTitle: "ቦርሳዎ", emptyBag: "ቦርሳዎ ልዩ ነገር እየጠበቀ ነው።", continueShopping: "መግዛትዎን ይቀጥሉ", checkout: "ወደ ክፍያ ይቀጥሉ", checkoutDemo: "ክፍያው ከወደፊቱ የመስመር ላይ መደብር ጋር ለመገናኘት ዝግጁ ነው።", noResults: "ከዚህ ፍለጋ ጋር የሚዛመድ ናሙና የለም።",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [category, setCategory] = useState<Category>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [bag, setBag] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [customSent, setCustomSent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(false);
  const t = copy[language];

  useEffect(() => {
    const updateHeader = () => {
      const hero = document.getElementById("home");
      if (hero) setHeaderScrolled(window.scrollY >= hero.offsetTop + hero.offsetHeight / 2);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
    return () => { window.removeEventListener("scroll", updateHeader); window.removeEventListener("resize", updateHeader); };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); setCartOpen(false); }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => (category === "all" || product.category === category) && (!normalized || `${product.name.en} ${product.name.am} ${product.type.en} ${product.category}`.toLowerCase().includes(normalized)));
  }, [category, query]);

  const closePanels = () => { setMenuOpen(false); setSearchOpen(false); setCartOpen(false); };
  const runSearch = (event: FormEvent) => { event.preventDefault(); setCategory("all"); setSearchOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); };
  const submitCustom = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setCustomSent(true); event.currentTarget.reset(); };
  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubscribed(true); };

  return (
    <main>
      <div className="announcement"><span>{t.announcement}</span><span aria-hidden="true">✦</span><button onClick={() => setLanguage(language === "en" ? "am" : "en")}>{language === "en" ? "አማርኛ" : "English"}</button><span>USD · ETB</span></div>
      <header className={`site-header ${headerScrolled ? "scrolled" : ""}`}>
        <button className="header-action menu-trigger" onClick={() => setMenuOpen(true)} aria-label={t.menu}><span className="menu-lines"><i /><i /></span>{t.menu}</button>
        <a className="wordmark" href="#home">NAROK DESIGN</a>
        <div className="header-actions"><button className="header-action" onClick={() => setSearchOpen(true)}>{t.search}</button><button className="header-action wishlist-header" onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}>♡ <span>{wishlist.length}</span></button><button className="header-action" onClick={() => setCartOpen(true)}>{t.bag} <span>{bag.length}</span></button></div>
      </header>

      <section className="hero" id="home"><div className="hero-shade" /><div className="hero-content"><p className="eyebrow">{t.heroEyebrow}</p><h1>{t.heroTitle}</h1><p className="hero-copy">{t.heroBody}</p><div className="hero-actions"><a href="/shop">{t.shopNow}</a><a href="/custom-orders">{t.customCta}</a></div></div><a className="scroll-cue" href="#collection" aria-label="Scroll to collection"><span>↓</span></a></section>

      <nav className="category-nav" aria-label="Collection categories">{[[t.categories[0], "/shop"], [t.categories[1], "/shop"], [t.categories[2], "/shop"], [t.categories[3], "/custom-orders"], [t.categories[4], "/about"]].map(([label, href], index) => <a href={href} key={label}><span>0{index + 1}</span>{label}</a>)}</nav>

      <section className="collection" id="collection">
        <div className="section-heading"><p className="eyebrow dark">{t.collectionEyebrow}</p><h2>{t.collectionTitle}</h2><p>{t.collectionBody}</p></div>
        <div className="filter-row" id="shop">{(Object.keys(t.filters) as Category[]).map((filter) => <button className={category === filter ? "active" : ""} onClick={() => setCategory(filter)} key={filter}>{t.filters[filter]}</button>)}</div>
        {query && <div className="search-summary"><span>“{query}”</span><button onClick={() => setQuery("")}>×</button></div>}
        <div className="product-grid">{filteredProducts.map((product) => {
          const saved = wishlist.includes(product.id);
          return <article className="product-card" key={product.id}><div className="product-image"><img src={product.image} alt={`${product.name[language]} — ${t.visualSample}`} loading="lazy" /><span className="sample-badge">{t.visualSample}</span>{product.madeToOrder && <span className="order-badge">{language === "en" ? "Made to order" : "በትዕዛዝ"}</span>}<button className={`heart ${saved ? "saved" : ""}`} onClick={() => setWishlist((items) => saved ? items.filter((id) => id !== product.id) : [...items, product.id])}>{saved ? "♥" : "♡"}</button><button className="quick-add" onClick={() => setBag((items) => [...items, product])} aria-label={`${t.add}: ${product.name[language]}`}>+</button></div><div className="product-info"><div><h3>{product.name[language]}</h3><p>{product.type[language]}</p></div><p>${product.usd} USD<br />{product.etb.toLocaleString()} ETB</p></div></article>;
        })}</div>
        {filteredProducts.length === 0 && <p className="no-results">{t.noResults}</p>}
      </section>

      <section className="story" id="about"><div className="story-image" role="img" aria-label="NAROK DESIGN Ethiopian fashion portrait" /><div className="story-copy"><p className="eyebrow">{t.storyEyebrow}</p><h2>{t.storyTitle}</h2><p className="lead">{t.storyBody}</p><p>{t.storyBody2}</p><a href="#custom">{t.storyLink} <span>→</span></a></div></section>

      <section className="custom-order" id="custom"><div className="custom-intro"><p className="eyebrow">{t.customEyebrow}</p><h2>{t.customTitle}</h2><p>{t.customBody}</p><ol>{t.steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol></div>
        <form className="custom-form" onSubmit={submitCustom}><label>{t.form.name}<input name="name" required /></label><label>{t.form.contact}<input name="contact" required /></label><label className="full">{t.form.garment}<select name="garment" defaultValue="" required><option value="" disabled>{t.form.garmentPlaceholder}</option>{t.form.garments.map((item) => <option key={item}>{item}</option>)}</select></label><label className="full">{t.form.measurements}<textarea name="measurements" placeholder={t.form.measurementsPlaceholder} required /></label><label>{t.form.color}<input name="color" required /></label><label>{t.form.fabric}<input name="fabric" placeholder={t.form.fabricPlaceholder} required /></label><label>{t.form.occasion}<input name="occasion" /></label><label>{t.form.deadline}<input name="deadline" type="date" /></label><label className="full">{t.form.notes}<textarea name="notes" /></label><div className="form-submit full"><button type="submit">{t.form.submit} <span>→</span></button><small>{t.form.demo}</small></div>{customSent && <p className="form-success full" role="status">{t.form.success}</p>}</form>
      </section>

      <section className="policies" id="services"><div className="section-heading"><p className="eyebrow dark">{t.policiesEyebrow}</p><h2>{t.policiesTitle}</h2></div><div className="policy-grid">{t.policies.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

      <footer><div className="footer-top"><h2>{t.newsletterTitle}</h2>{subscribed ? <p className="success-message">{t.subscribed}</p> : <form onSubmit={submitNewsletter}><label htmlFor="email">{t.newsletterLabel}</label><div><input id="email" type="email" placeholder={t.newsletterPlaceholder} required /><button aria-label="Subscribe">→</button></div></form>}</div><div className="footer-links">{t.footerGroups.map(([heading, ...links], groupIndex) => <div key={heading}><h3>{heading}</h3>{links.map((link) => <a href={groupIndex === 0 ? "#shop" : groupIndex === 1 ? "#about" : "#custom"} key={link}>{link}</a>)}</div>)}<div className="locale"><h3>Language / ቋንቋ</h3><button onClick={() => setLanguage("en")}><span>English</span><span>{language === "en" ? "●" : "○"}</span></button><button onClick={() => setLanguage("am")}><span>አማርኛ</span><span>{language === "am" ? "●" : "○"}</span></button><button><span>Prices</span><span>USD · ETB</span></button></div></div><div className="footer-bottom"><p>© 2026 NAROK DESIGN · ADDIS ABABA</p><a className="wordmark" href="#home">NAROK DESIGN</a><div><a href="#services">Delivery & Returns</a><a href="#custom">Custom Orders</a></div></div></footer>

      <button className={`panel-backdrop ${menuOpen || searchOpen || cartOpen ? "visible" : ""}`} onClick={closePanels} aria-label="Close open panel" />
      <aside className={`side-panel menu-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}><button className="panel-close" onClick={() => setMenuOpen(false)}>×</button><p className="panel-label">{t.panelMenu}</p><nav>{t.nav.map((item, index) => <a href={t.navHrefs[index]} onClick={() => setMenuOpen(false)} key={item}>{item}<span>0{index + 1}</span></a>)}</nav><div className="panel-meta"><button onClick={() => setLanguage(language === "en" ? "am" : "en")}>{language === "en" ? "አማርኛ" : "English"}</button><a href="#custom" onClick={() => setMenuOpen(false)}>Addis Ababa</a></div></aside>
      <aside className={`side-panel search-panel ${searchOpen ? "open" : ""}`} aria-hidden={!searchOpen}><button className="panel-close" onClick={() => setSearchOpen(false)}>×</button><p className="panel-label">{t.panelSearch}</p><form onSubmit={runSearch}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} /><button aria-label="Search">→</button></form><p className="suggestions">{t.suggestions}</p></aside>
      <aside className={`side-panel cart-panel ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}><button className="panel-close" onClick={() => setCartOpen(false)}>×</button><p className="panel-label">{t.bagTitle} · {bag.length}</p>{bag.length === 0 ? <div className="empty-bag"><div><p>{t.emptyBag}</p><button onClick={() => { setCartOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>{t.continueShopping}</button></div></div> : <><div className="bag-items">{bag.map((item, index) => <div key={`${item.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item.name[language]}<small>${item.usd} USD · {item.etb.toLocaleString()} ETB</small></p><button onClick={() => setBag((items) => items.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div><button className="checkout" onClick={() => setCheckoutMessage(true)}>{t.checkout}</button>{checkoutMessage && <p className="checkout-note" role="status">{t.checkoutDemo}</p>}</>}</aside>
    </main>
  );
}
