"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- vinext client navigation currently requires plain anchors */

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import type { Category, Language, Product } from "../data/catalog";
import { usePanelFocus } from "../hooks/usePanelFocus";
import CustomOrderForm from "./CustomOrderForm";
import ProductGrid from "./ProductGrid";
import ProfileControl from "./ProfileControl";
import { useSiteState } from "./SiteState";

type PageKind = "shop" | "collection" | "custom" | "about";
const routes = ["/shop", "/collection", "/custom-orders", "/about"];
const menuLabels = { en: ["Shop", "Collection", "Custom Orders", "About"], am: ["ይግዙ", "ስብስብ", "ብጁ ትዕዛዝ", "ስለ እኛ"] };
const pageCopy = {
  shop: { en: ["Shop", "Clothing made to carry Ethiopian heritage forward.", "Browse ready-made and made-to-order pieces for women, men and children."], am: ["ይግዙ", "የኢትዮጵያን ቅርስ ወደፊት የሚያስተላልፉ ልብሶች።", "ለሴቶች፣ ለወንዶች እና ለልጆች የተዘጋጁ እና ብጁ ልብሶችን ይመልከቱ።"] },
  collection: { en: ["Collection", "A wardrobe shaped by place, memory and celebration.", "Discover the three parts of the NAROK DESIGN collection."], am: ["ስብስብ", "በቦታ፣ በትውስታ እና በበዓል የተቀረጸ ልብስ።", "የNAROK DESIGN ስብስብ ሦስት ክፍሎችን ይወቁ።"] },
  custom: { en: ["Custom Orders", "Made around your measurements, color and occasion.", "Share your preferences securely with our Addis Ababa atelier."], am: ["ብጁ ትዕዛዝ", "በእርስዎ መጠን፣ ቀለም እና ዝግጅት የተሰራ።", "ምርጫዎን በደህና ለአዲስ አበባ የስፌት ቤታችን ያካፍሉ።"] },
  about: { en: ["About", "Ethiopian design, created in Addis Ababa for the world.", "Meet the story, purpose and process behind NAROK DESIGN."], am: ["ስለ እኛ", "በአዲስ አበባ ለዓለም የተፈጠረ የኢትዮጵያ ዲዛይን።", "የNAROK DESIGNን ታሪክ፣ ዓላማ እና ሂደት ይወቁ።"] },
};

export default function InnerPage({ kind }: { kind: PageKind }) {
  const { language, setLanguage, selection, removeFromSelection, catalog, catalogLoading, settings } = useSiteState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectionOpen, setSelectionOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const selectionRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSelection = useCallback(() => setSelectionOpen(false), []);
  usePanelFocus(menuOpen, menuRef, closeMenu);
  usePanelFocus(selectionOpen, selectionRef, closeSelection);
  const copy = pageCopy[kind][language];

  return (
    <main className="inner-page">
      <div className="announcement"><span>{settings.announcement}</span><span aria-hidden="true">✦</span><button onClick={() => setLanguage(language === "en" ? "am" : "en")}>{language === "en" ? "አማርኛ" : "English"}</button><span>{settings.currency} · {settings.shippingThresholdEtb.toLocaleString()} ETB+</span></div>
      <header className="site-header page-header scrolled">
        <button className="header-action menu-trigger" onClick={() => setMenuOpen(true)} aria-label={language === "en" ? "Menu" : "ምናሌ"}><span className="menu-lines"><i /><i /></span>{language === "en" ? "Menu" : "ምናሌ"}</button>
        <a className="wordmark" href="/">{settings.storeName}</a>
        <div className="header-actions"><a className="header-action search-action" href="/shop#catalogue">{language === "en" ? "Search" : "ፈልግ"}</a><button className="header-action selection-action" data-mobile-label={language === "en" ? "Selection" : "ምርጫ"} onClick={() => setSelectionOpen(true)}>{language === "en" ? "Selection" : "ምርጫ"} <span>{selection.length}</span></button><ProfileControl language={language} /></div>
      </header>

      <section className={`page-hero page-hero-${kind}`}><Image className="page-hero-image" src="/narok-women.png" alt="" fill priority sizes="100vw" /><div><p className="eyebrow">NAROK DESIGN · ADDIS ABABA</p><h1>{copy[1]}</h1><p>{copy[2]}</p></div><span>{copy[0]}</span></section>
      {kind === "shop" && <ShopContent language={language} catalog={catalog} loading={catalogLoading} />}
      {kind === "collection" && <CollectionContent language={language} />}
      {kind === "custom" && <CustomContent language={language} />}
      {kind === "about" && <AboutContent language={language} />}

      <footer className="inner-footer"><div><a className="wordmark" href="/">{settings.storeName}</a><p>{language === "en" ? "Ethiopian heritage, made for the world." : "የኢትዮጵያ ቅርስ፣ ለዓለም የተሰራ።"}</p></div><nav>{menuLabels[language].map((label, index) => <a href={routes[index]} key={label}>{label}</a>)}</nav><p>© 2026 · ADDIS ABABA, ETHIOPIA</p></footer>

      <button className={`panel-backdrop ${menuOpen || selectionOpen ? "visible" : ""}`} onClick={() => { closeMenu(); closeSelection(); }} aria-label="Close panel" />
      <aside ref={menuRef} className={`side-panel menu-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen} role="dialog" aria-modal="true" aria-labelledby="inner-menu-title"><button className="panel-close" onClick={closeMenu} aria-label="Close menu">×</button><p className="panel-label" id="inner-menu-title">{language === "en" ? "Explore NAROK DESIGN" : "NAROK DESIGNን ያስሱ"}</p><nav>{menuLabels[language].map((label, index) => <a className={routes[index].includes(kind === "custom" ? "custom-orders" : kind) ? "current" : ""} href={routes[index]} key={label}>{label}<span>0{index + 1}</span></a>)}</nav><div className="panel-meta"><button onClick={() => setLanguage(language === "en" ? "am" : "en")}>{language === "en" ? "አማርኛ" : "English"}</button><a href="/">Home</a></div></aside>
      <aside ref={selectionRef} className={`side-panel cart-panel ${selectionOpen ? "open" : ""}`} aria-hidden={!selectionOpen} role="dialog" aria-modal="true" aria-labelledby="inner-selection-title"><button className="panel-close" onClick={closeSelection} aria-label="Close selection">×</button><p className="panel-label" id="inner-selection-title">{language === "en" ? "Your selection" : "ምርጫዎ"} · {selection.length}</p>{selection.length === 0 ? <div className="empty-bag"><p>{language === "en" ? "Save pieces here before sending an atelier enquiry." : "ለስፌት ቤቱ ጥያቄ ከመላክዎ በፊት ልብሶችን እዚህ ይምረጡ።"}</p></div> : <><div className="bag-items">{selection.map((productId, index) => { const item = catalog.find((product) => product.id === productId); return item ? <div key={`${item.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item.name[language]}<small>${item.usd} USD · {item.etb.toLocaleString()} ETB</small></p><button onClick={() => removeFromSelection(index)} aria-label={`Remove ${item.name[language]}`}>×</button></div> : null; })}</div><a className="checkout" href="/custom-orders">{language === "en" ? "Enquire about these pieces" : "ስለነዚህ ልብሶች ይጠይቁ"}</a></>}</aside>
    </main>
  );
}

function ShopContent({ language, catalog, loading }: { language: Language; catalog: Product[]; loading: boolean }) {
  const [filter, setFilter] = useState<Category>("all");
  const labels: Record<Category, Record<Language, string>> = { all: { en: "All", am: "ሁሉም" }, women: { en: "Women", am: "ሴቶች" }, men: { en: "Men", am: "ወንዶች" }, children: { en: "Children", am: "ልጆች" } };
  const filtered = filter === "all" ? catalog : catalog.filter((product) => product.category === filter);
  return <section className="inner-content shop-page" id="catalogue"><div className="inner-section-heading"><p className="eyebrow dark">{language === "en" ? "Catalogue" : "ካታሎግ"}</p><h2>{language === "en" ? "Shop every piece" : "ሁሉንም ልብስ ይመልከቱ"}</h2></div><div className="filter-row">{(["all", "women", "men", "children"] as Category[]).map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{labels[item][language]}</button>)}</div><ProductGrid products={filtered} language={language} addLabel={language === "en" ? "Add to selection" : "ወደ ምርጫ ያክሉ"} sampleLabel={language === "en" ? "Original catalogue image" : "የካታሎግ ምስል"} madeToOrderLabel={language === "en" ? "Made to order" : "በትዕዛዝ"} noResultsLabel={language === "en" ? "No pieces match this filter." : "ከዚህ ማጣሪያ ጋር የሚዛመድ ልብስ የለም።"} loading={loading} /></section>;
}

function CollectionContent({ language }: { language: Language }) {
  const collections = language === "en" ? [["Women", "Habesha kemis reimagined through considered proportions, expressive color and hand-finished detail.", "/narok-women.png"], ["Men", "Ceremonial and everyday ensembles that pair Ethiopian textile language with a clean modern silhouette.", "/narok-men.png"], ["Children", "Soft, joyful traditional clothing designed for celebrations, portraits and family occasions.", "/narok-children.png"]] : [["ሴቶች", "በዘመናዊ ቅርጽ፣ ቀለም እና በእጅ ጥበብ የተሰራ ሐበሻ ቀሚስ።", "/narok-women.png"], ["ወንዶች", "የኢትዮጵያን ጨርቅ ቋንቋ ከዘመናዊ ቅርጽ ጋር የሚያጣምሩ ልብሶች።", "/narok-men.png"], ["ልጆች", "ለበዓል፣ ለፎቶ እና ለቤተሰብ ዝግጅት የተሰሩ ለስላሳ ባህላዊ ልብሶች።", "/narok-children.png"]];
  return <section className="inner-content collection-page">{collections.map(([title, body, image], index) => <article className="collection-feature" key={title}><div className={`collection-visual visual-${index + 1}`}><Image src={image} alt="" fill sizes="(max-width: 980px) 100vw, 50vw" style={{ objectFit: "cover", objectPosition: "center" }} /><span>0{index + 1}</span></div><div><p className="eyebrow dark">NAROK DESIGN COLLECTION</p><h2>{title}</h2><p>{body}</p><a href="/shop">{language === "en" ? "Shop this collection" : "ይህን ስብስብ ይግዙ"} →</a></div></article>)}</section>;
}

function CustomContent({ language }: { language: Language }) {
  return <section className="inner-content custom-page"><div className="custom-page-intro"><p className="eyebrow dark">01 · 04</p><h2>{language === "en" ? "Tell us what you want to create." : "ምን መፍጠር እንደሚፈልጉ ይንገሩን።"}</h2><p>{language === "en" ? "Your enquiry is stored securely for the atelier to review. We will confirm measurements, fabric, timeline and price directly with you; no payment is taken online." : "ጥያቄዎ የስፌት ቤቱ እንዲመለከተው በደህና ይቀመጣል። መጠን፣ ጨርቅ፣ ጊዜና ዋጋ በቀጥታ ይረጋገጣሉ፤ በመስመር ላይ ክፍያ አይደረግም።"}</p><ol><li>01 · {language === "en" ? "Choose the garment" : "ልብስ ይምረጡ"}</li><li>02 · {language === "en" ? "Share measurements" : "መጠን ያስገቡ"}</li><li>03 · {language === "en" ? "Choose color and fabric" : "ቀለምና ጨርቅ ይምረጡ"}</li><li>04 · {language === "en" ? "Add occasion and date" : "ዝግጅትና ቀን ያስገቡ"}</li></ol></div><CustomOrderForm language={language} className="custom-form page-form" /></section>;
}

function AboutContent({ language }: { language: Language }) {
  return <section className="inner-content about-page"><article className="about-story"><div className="about-image"><Image src="/narok-women.png" alt={language === "en" ? "NAROK DESIGN Ethiopian fashion" : "የNAROK DESIGN የኢትዮጵያ ፋሽን"} fill sizes="(max-width: 980px) 100vw, 50vw" style={{ objectFit: "cover", objectPosition: "25% center" }} /></div><div><p className="eyebrow dark">{language === "en" ? "Our story" : "ታሪካችን"}</p><h2>{language === "en" ? "A contemporary home for Ethiopian clothing." : "ለኢትዮጵያ ልብስ ዘመናዊ ቤት።"}</h2><p>{language === "en" ? "NAROK DESIGN was imagined in Addis Ababa by an Ethiopian designer with a belief that traditional clothing can feel rooted, personal and relevant wherever it is worn. We design for Ethiopians at home, the diaspora and international customers discovering Ethiopian artistry." : "NAROK DESIGN በአዲስ አበባ በኢትዮጵያዊ ዲዛይነር ተፈጠረ። ለኢትዮጵያውያን፣ በውጭ ለሚኖሩ እና የኢትዮጵያን ጥበብ ለሚያውቁ ደንበኞች እንፈጥራለን።"}</p></div></article><div className="values-grid">{(language === "en" ? [["Place", "Designed in Addis Ababa, Ethiopia."], ["Purpose", "Preserve heritage through clothing made to be lived in."], ["People", "Created for women, men, children and a global community."], ["Process", "Ready-made and made-to-order, with room for personal choice."]] : [["ቦታ", "በአዲስ አበባ፣ ኢትዮጵያ የተነደፈ።"], ["ዓላማ", "በሚለበስ ልብስ ቅርስን መጠበቅ።"], ["ሰዎች", "ለሴቶች፣ ለወንዶች፣ ለልጆች እና ለዓለም ማህበረሰብ።"], ["ሂደት", "ዝግጁ እና ብጁ ትዕዛዝ፣ ለግል ምርጫ ቦታ ያለው።"]]).map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>;
}
