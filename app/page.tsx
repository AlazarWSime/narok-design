"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import CustomOrderForm from "./components/CustomOrderForm";
import NewsletterForm from "./components/NewsletterForm";
import ProductGrid from "./components/ProductGrid";
import ProfileControl from "./components/ProfileControl";
import SearchOverlay from "./components/SearchOverlay";
import { useSiteState } from "./components/SiteState";
import { Category, matchesProductSearch } from "./data/catalog";
import { usePanelFocus } from "./hooks/usePanelFocus";

const copy = {
  en: {
    announcement: "Designed in Addis Ababa · Worldwide delivery", menu: "Menu", search: "Search", bag: "Cart",
    nav: ["Shop", "Collection", "Custom Orders", "About", "Admin"], navHrefs: ["/shop", "/collection", "/custom-orders", "/about", "/admin"],
    heroEyebrow: "Ethiopian design · Made in Addis Ababa", heroTitle: "Ethiopian Heritage, Made for the World.",
    heroBody: "Traditional clothing shaped by Ethiopian artistry, made for celebrations, ceremonies and everyday pride—wherever you call home.",
    shopNow: "Shop the collection", customCta: "Create a custom order", categories: ["Women", "Men", "Children", "Custom", "Our Story"],
    filters: { all: "All pieces", women: "Women", men: "Men", children: "Children" },
    collectionEyebrow: "Collection · 01", collectionTitle: "Tradition, tailored to you",
    collectionBody: "Explore ready-made and made-to-order clothing for women, men and children, with pricing in USD and ETB.",
    visualSample: "Original catalogue image", add: "Add to cart",
    storyEyebrow: "Our atelier · Addis Ababa", storyTitle: "Designed by an Ethiopian hand, for a global community.",
    storyBody: "NAROK DESIGN brings the language of Ethiopian traditional clothing into a contemporary wardrobe. Each silhouette begins in Addis Ababa and celebrates the skill, color and symbolism carried through generations.",
    storyBody2: "We create for Ethiopians at home, the diaspora, and anyone around the world who wants to wear Ethiopian heritage with respect and joy.", storyLink: "Meet NAROK DESIGN",
    customEyebrow: "Made for you · 02", customTitle: "Your measurements. Your color. Your story.",
    customBody: "Choose a style and tell us how you want it made. Your enquiry is saved securely for our atelier to review before confirming fabric, timeline and final price.",
    steps: ["Choose your garment", "Share measurements", "Select color & fabric", "Confirm occasion & deadline"],
    policiesEyebrow: "What to expect · 03", policiesTitle: "From Addis Ababa to your door",
    policies: [["Ready-made", "Dispatched in 2–4 business days."], ["Custom orders", "Created in approximately 3–6 weeks after measurements and design are confirmed."], ["Worldwide delivery", "Estimated delivery in 5–12 business days after dispatch."], ["Returns", "Unworn ready-made pieces may be returned within 14 days. Custom orders are final sale."]],
    newsletterTitle: "Stories, new pieces and atelier notes from Addis Ababa.",
    footerGroups: [["Shop", "Women", "Men", "Children", "Custom Orders"], ["About", "Our Story", "Craft & Care", "Delivery", "Returns"], ["Visit", "Addis Ababa, Ethiopia", "Worldwide delivery", "Consultations by request"]],
    panelMenu: "Explore NAROK DESIGN", panelSearch: "Search the collection", searchPlaceholder: "Search dresses, men, children…", suggestions: "Try: Habesha kemis, custom, children, men",
    bagTitle: "Your shopping bag", emptyBag: "Your shopping bag is ready for a piece you love.", continueShopping: "Continue browsing", checkout: "Checkout securely", checkoutDemo: "Choose Telebirr, bank transfer or pay on delivery at checkout.", noResults: "No pieces match that search yet.",
  },
  am: {
    announcement: "በአዲስ አበባ የተነደፈ · ዓለም አቀፍ መላኪያ", menu: "ምናሌ", search: "ፈልግ", bag: "ጋሪ",
    nav: ["ይግዙ", "ስብስብ", "ብጁ ትዕዛዝ", "ስለ እኛ", "አስተዳዳሪ"], navHrefs: ["/shop", "/collection", "/custom-orders", "/about", "/admin"],
    heroEyebrow: "የኢትዮጵያ ዲዛይን · በአዲስ አበባ የተሰራ", heroTitle: "የኢትዮጵያ ቅርስ፣ ለዓለም የተሰራ።",
    heroBody: "በኢትዮጵያ ጥበብ የተቀረጹ ባህላዊ ልብሶች፤ ለበዓል፣ ለሥነ ሥርዓት እና ለዕለት ኩራት።",
    shopNow: "ስብስቡን ይመልከቱ", customCta: "ብጁ ትዕዛዝ ይፍጠሩ", categories: ["ሴቶች", "ወንዶች", "ልጆች", "ብጁ", "ታሪካችን"],
    filters: { all: "ሁሉም", women: "ሴቶች", men: "ወንዶች", children: "ልጆች" }, collectionEyebrow: "ስብስብ · 01", collectionTitle: "ባህል፣ ለእርስዎ የተሰፋ",
    collectionBody: "ለሴቶች፣ ለወንዶች እና ለልጆች የተዘጋጁ እና በትዕዛዝ የሚሰሩ ልብሶችን በUSD እና ETB ዋጋ ይመልከቱ።", visualSample: "የካታሎግ ምስል", add: "ወደ ጋሪ ያክሉ",
    storyEyebrow: "የልብስ ስፌት ቤታችን · አዲስ አበባ", storyTitle: "በኢትዮጵያዊ ዲዛይነር፣ ለዓለም ማህበረሰብ።",
    storyBody: "NAROK DESIGN የኢትዮጵያን ባህላዊ አልባሳት ቋንቋ ወደ ዘመናዊ ልብስ ያመጣል። እያንዳንዱ ንድፍ በአዲስ አበባ ይጀምራል።",
    storyBody2: "በኢትዮጵያ፣ በውጭ አገር ለሚኖሩ ኢትዮጵያውያን እና ቅርሱን በክብር ለሚለብሱ ሁሉ እንፈጥራለን።", storyLink: "NAROK DESIGNን ይወቁ",
    customEyebrow: "ለእርስዎ የተሰራ · 02", customTitle: "የእርስዎ መጠን። የእርስዎ ቀለም። የእርስዎ ታሪክ።",
    customBody: "የሚፈልጉትን ልብስ ይምረጡ እና እንዴት እንዲሰራ ይንገሩን። ጨርቅ፣ ጊዜና ዋጋ ከመረጋገጡ በፊት ጥያቄዎ በደህና ይቀመጣል።", steps: ["ልብስ ይምረጡ", "መጠን ያስገቡ", "ቀለምና ጨርቅ ይምረጡ", "ቀንና ዝግጅት ያረጋግጡ"],
    policiesEyebrow: "ምን እንደሚጠበቅ · 03", policiesTitle: "ከአዲስ አበባ እስከ ቤትዎ",
    policies: [["ዝግጁ ልብስ", "በ2–4 የሥራ ቀናት ውስጥ ይላካል።"], ["ብጁ ትዕዛዝ", "መጠንና ዲዛይን ከተረጋገጠ በኋላ በ3–6 ሳምንታት ይዘጋጃል።"], ["ዓለም አቀፍ መላኪያ", "ከተላከ በኋላ በ5–12 የሥራ ቀናት ይደርሳል።"], ["መመለሻ", "ያልተለበሰ ዝግጁ ልብስ በ14 ቀናት ይመለሳል። ብጁ ትዕዛዝ አይመለስም።"]],
    newsletterTitle: "ከአዲስ አበባ ታሪኮች፣ አዳዲስ ልብሶች እና የስፌት ቤት ዜና።",
    footerGroups: [["ይግዙ", "ሴቶች", "ወንዶች", "ልጆች", "ብጁ ትዕዛዝ"], ["ስለ እኛ", "ታሪካችን", "ጥበብና እንክብካቤ", "መላኪያ", "መመለሻ"], ["አድራሻ", "አዲስ አበባ፣ ኢትዮጵያ", "ዓለም አቀፍ መላኪያ", "ቀጠሮ በጥያቄ"]],
    panelMenu: "NAROK DESIGNን ያስሱ", panelSearch: "ስብስቡን ይፈልጉ", searchPlaceholder: "ቀሚስ፣ ወንዶች፣ ልጆች…", suggestions: "ሐበሻ ቀሚስ፣ ብጁ፣ ልጆች፣ ወንዶች",
    bagTitle: "የግዢ ቦርሳዎ", emptyBag: "የግዢ ቦርሳዎ ለሚወዱት ልብስ ዝግጁ ነው።", continueShopping: "መመልከትዎን ይቀጥሉ", checkout: "በደህና ይክፈሉ", checkoutDemo: "Telebirr፣ የባንክ ዝውውር ወይም በመላኪያ ጊዜ ክፍያ ይምረጡ።", noResults: "ከዚህ ፍለጋ ጋር የሚዛመድ ናሙና የለም።",
  },
};

export default function Home() {
  const { language, setLanguage, selection, removeFromSelection, wishlist, catalog, catalogLoading, settings } = useSiteState();
  const [category, setCategory] = useState<Category>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLElement>(null);
  const selectionRef = useRef<HTMLElement>(null);
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

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog.filter((product) => (category === "all" || product.category === category) && matchesProductSearch(product, normalized));
  }, [catalog, category, query]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSelection = useCallback(() => setCartOpen(false), []);
  const closePanels = useCallback(() => { closeMenu(); closeSelection(); }, [closeMenu, closeSelection]);
  usePanelFocus(menuOpen, menuRef, closeMenu);
  usePanelFocus(cartOpen, selectionRef, closeSelection);

  return (
    <main>
      <header className={`site-header ${headerScrolled ? "scrolled" : ""}`}>
        <div className="header-left"><button className="header-action menu-trigger" onClick={() => setMenuOpen(true)} aria-label={t.menu}><span className="menu-lines"><i /><i /></span>{t.menu}</button><button type="button" className="header-action header-search-launch" onClick={() => setSearchOpen(true)} aria-label={t.panelSearch}><span className="search-glyph" aria-hidden="true" /></button></div>
        <a className="wordmark" href="#home">{settings.storeName}</a>
        <div className="header-actions"><button className="header-action wishlist-header" onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })} aria-label={language === "en" ? `${wishlist.length} saved pieces` : `${wishlist.length} የተቀመጡ ልብሶች`}>♡ <span>{wishlist.length}</span></button><button className="header-action selection-action" data-mobile-label={t.bag} onClick={() => setCartOpen(true)}>{t.bag} <span>{selection.length}</span></button><ProfileControl language={language} /></div>
      </header>

      <section className="hero" id="home"><Image className="hero-background" src="/narok-women.png" alt="" fill priority sizes="100vw" /><div className="hero-shade" /><div className="hero-content"><p className="eyebrow">{t.heroEyebrow}</p><h1>{t.heroTitle}</h1><p className="hero-copy">{t.heroBody}</p><div className="hero-actions"><a href="/shop">{t.shopNow}</a><a href="/custom-orders">{t.customCta}</a></div></div><a className="scroll-cue" href="#collection" aria-label="Scroll to collection"><span>↓</span></a></section>

      <nav className="category-nav" aria-label="Collection categories">{[[t.categories[0], "/shop"], [t.categories[1], "/shop"], [t.categories[2], "/shop"], [t.categories[3], "/custom-orders"], [t.categories[4], "/about"]].map(([label, href], index) => <a href={href} key={label}><span>0{index + 1}</span>{label}</a>)}</nav>

      <section className="collection" id="collection">
        <div className="section-heading"><p className="eyebrow dark">{t.collectionEyebrow}</p><h2>{t.collectionTitle}</h2><p>{t.collectionBody}</p></div>
        <div className="filter-row" id="shop">{(Object.keys(t.filters) as Category[]).map((filter) => <button className={category === filter ? "active" : ""} onClick={() => setCategory(filter)} key={filter}>{t.filters[filter]}</button>)}</div>
        {query && <div className="search-summary"><span>“{query}”</span><button onClick={() => setQuery("")}>×</button></div>}
        <ProductGrid products={filteredProducts} language={language} addLabel={t.add} sampleLabel={t.visualSample} madeToOrderLabel={language === "en" ? "Made to order" : "በትዕዛዝ"} noResultsLabel={t.noResults} loading={catalogLoading} />
      </section>

      <section className="story" id="about"><div className="story-image"><Image src="/narok-women.png" alt="NAROK DESIGN Ethiopian fashion portrait" fill sizes="(max-width: 980px) 100vw, 54vw" style={{ objectFit: "cover", objectPosition: "25% center" }} /></div><div className="story-copy"><p className="eyebrow">{t.storyEyebrow}</p><h2>{t.storyTitle}</h2><p className="lead">{t.storyBody}</p><p>{t.storyBody2}</p><a href="#custom">{t.storyLink} <span>→</span></a></div></section>

      <section className="custom-order" id="custom"><div className="custom-intro"><p className="eyebrow">{t.customEyebrow}</p><h2>{t.customTitle}</h2><p>{t.customBody}</p><ol>{t.steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol></div>
        <CustomOrderForm language={language} />
      </section>

      <section className="policies" id="services"><div className="section-heading"><p className="eyebrow dark">{t.policiesEyebrow}</p><h2>{t.policiesTitle}</h2></div><div className="policy-grid">{t.policies.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

      <footer><div className="footer-top"><h2>{t.newsletterTitle}</h2><NewsletterForm language={language} /></div><div className="footer-links">{t.footerGroups.map(([heading, ...links], groupIndex) => <div key={heading}><h3>{heading}</h3>{links.map((link) => <a href={groupIndex === 0 ? "#shop" : groupIndex === 1 ? "#about" : "#custom"} key={link}>{link}</a>)}</div>)}<div className="locale"><h3>Language / ቋንቋ</h3><button onClick={() => setLanguage("en")}><span>English</span><span>{language === "en" ? "●" : "○"}</span></button><button onClick={() => setLanguage("am")}><span>አማርኛ</span><span>{language === "am" ? "●" : "○"}</span></button><p className="price-note"><span>Prices</span><span>{settings.currency} · USD · ETB</span></p></div></div><div className="footer-bottom"><p>© 2026 {settings.storeName} · ADDIS ABABA</p><a className="wordmark" href="#home">{settings.storeName}</a><div><a href="#services">Delivery & Returns</a><a href="#custom">Custom Orders</a></div></div></footer>

      <button className={`panel-backdrop ${menuOpen || cartOpen ? "visible" : ""}`} onClick={closePanels} aria-label="Close open panel" />
      <aside ref={menuRef} className={`side-panel menu-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen} role="dialog" aria-modal="true" aria-labelledby="menu-panel-title"><button className="panel-close" onClick={closeMenu} aria-label="Close menu">×</button><p className="panel-label" id="menu-panel-title">{t.panelMenu}</p><nav>{t.nav.map((item, index) => <a className={t.navHrefs[index] === "/admin" ? "menu-admin-entry" : undefined} href={t.navHrefs[index]} onClick={closeMenu} key={item}>{item}<span>0{index + 1}</span></a>)}</nav><div className="panel-meta"><button onClick={() => setLanguage(language === "en" ? "am" : "en")}>{language === "en" ? "አማርኛ" : "English"}</button><a href="#custom" onClick={closeMenu}>Addis Ababa</a></div></aside>
      <aside ref={selectionRef} className={`side-panel cart-panel ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen} role="dialog" aria-modal="true" aria-labelledby="selection-panel-title"><button className="panel-close" onClick={closeSelection} aria-label="Close bag">×</button><p className="panel-label" id="selection-panel-title">{t.bagTitle} · {selection.length}</p>{selection.length === 0 ? <div className="empty-bag"><div><p>{t.emptyBag}</p><button onClick={() => { closeSelection(); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>{t.continueShopping}</button></div></div> : <><div className="bag-items">{selection.map((productId, index) => { const item = catalog.find((product) => product.id === productId); return item ? <div key={`${item.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item.name[language]}<small>${item.usd} USD · {item.etb.toLocaleString()} ETB</small></p><button onClick={() => removeFromSelection(index)} aria-label={`Remove ${item.name[language]}`}>×</button></div> : null; })}</div><a className="checkout" href="/checkout">{t.checkout}</a><p className="checkout-note static-note">{t.checkoutDemo}</p></>}</aside>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} language={language} catalog={catalog} loading={catalogLoading} query={query} setQuery={setQuery} storeName={settings.storeName} />
    </main>
  );
}
