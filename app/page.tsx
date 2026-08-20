"use client";

import { FormEvent, useEffect, useState } from "react";

const products = [
  {
    name: "Arcadia Top Handle",
    detail: "Natural-grain calfskin",
    price: "$3,850",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=90",
    tone: "sand",
  },
  {
    name: "Lueur No. 7",
    detail: "Eau de parfum · 100 ml",
    price: "$320",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=90",
    tone: "stone",
  },
  {
    name: "Avenue Slingback",
    detail: "Polished lambskin",
    price: "$1,280",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=90",
    tone: "chalk",
  },
];

const editorials = [
  {
    tag: "The campaign",
    title: "A Parisian interlude",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1500&q=88",
  },
  {
    tag: "The journal",
    title: "Objects made to travel",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1500&q=88",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [bag, setBag] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      const hero = document.querySelector<HTMLElement>(".hero");
      if (!hero) return;
      const halfwayPoint = hero.offsetTop + hero.offsetHeight / 2;
      setHeaderScrolled(window.scrollY >= halfwayPoint);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  const addToBag = (name: string) => {
    setBag((items) => [...items, name]);
    setCartOpen(true);
  };

  const submitNewsletter = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <main id="top">
      <div className="announcement">
        <span>Complimentary delivery and returns</span>
        <a href="#services">Discover our services</a>
      </div>

      <header className={`site-header ${headerScrolled ? "scrolled" : ""}`}>
        <button className="header-action menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="menu-lines" aria-hidden="true"><i /><i /></span> Menu
        </button>
        <a className="wordmark" href="#top" aria-label="Maison Lueur home">MAISON LUEUR</a>
        <div className="header-actions">
          <button className="header-action" onClick={() => setSearchOpen(true)} aria-label="Search">Search</button>
          <button className="header-action" onClick={() => setCartOpen(true)} aria-label={`Shopping bag with ${bag.length} items`}>
            Bag <span>{bag.length}</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">The new campaign</p>
          <h1>Horizons in motion</h1>
          <p className="hero-copy">A study in silhouette, light and the enduring art of the journey.</p>
          <div className="hero-actions">
            <a href="#collection">Discover the collection</a>
            <a href="#story">Explore the story</a>
          </div>
        </div>
        <a className="scroll-cue" href="#collection" aria-label="Scroll to collection"><span>↓</span></a>
      </section>

      <nav className="category-nav" aria-label="Shop by category">
        <a href="#collection"><span>01</span> New arrivals</a>
        <a href="#collection"><span>02</span> Women</a>
        <a href="#men"><span>03</span> Men</a>
        <a href="#collection"><span>04</span> Travel</a>
        <a href="#collection"><span>05</span> Gifts</a>
      </nav>

      <section className="collection" id="collection">
        <div className="section-heading">
          <p className="eyebrow dark">The icons</p>
          <h2>Objects of desire</h2>
          <p>Modern signatures, shaped by hand and designed to accompany a lifetime.</p>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.name}>
              <div className={`product-image ${product.tone}`}>
                <img src={product.image} alt={product.name} />
                <button className="quick-add" onClick={() => addToBag(product.name)} aria-label={`Add ${product.name} to bag`}>+</button>
                {index === 0 && <span className="new-badge">New</span>}
              </div>
              <div className="product-info">
                <div><h3>{product.name}</h3><p>{product.detail}</p></div>
                <p>{product.price}</p>
              </div>
            </article>
          ))}
        </div>
        <a className="text-link" href="#top">View all new arrivals <span>→</span></a>
      </section>

      <section className="craft" id="story">
        <div className="craft-image" role="img" aria-label="Artisan shaping leather by hand" />
        <div className="craft-copy">
          <p className="eyebrow dark">Savoir-faire</p>
          <h2>The beauty of time</h2>
          <p className="lead">Every line begins with the hand: measured, cut, burnished and finished in our atelier.</p>
          <p>Materials are chosen for the way they live—not only for how they look today. Each piece carries the subtle variations of its making, and becomes more personal with every journey.</p>
          <a className="underlined" href="#journal">Enter the atelier</a>
        </div>
      </section>

      <section className="mens-story" id="men">
        <div className="mens-overlay" />
        <div className="mens-copy">
          <p className="eyebrow">Men’s Autumn Collection</p>
          <h2>Quiet confidence</h2>
          <a href="#collection">Discover the silhouettes</a>
        </div>
      </section>

      <section className="journal" id="journal">
        <div className="section-heading left-heading">
          <p className="eyebrow dark">Maison stories</p>
          <h2>The journal</h2>
        </div>
        <div className="editorial-grid">
          {editorials.map((item) => (
            <article className="editorial-card" key={item.title}>
              <a className="editorial-image" href="#top" aria-label={item.title}>
                <img src={item.image} alt="" />
                <span>Read story ↗</span>
              </a>
              <p className="eyebrow dark">{item.tag}</p>
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="services" id="services">
        <div className="section-heading">
          <p className="eyebrow dark">The Maison at your service</p>
          <h2>A considered experience</h2>
        </div>
        <div className="service-grid">
          <article><span>01</span><h3>Private appointments</h3><p>Discover the collection with a dedicated client advisor.</p><a href="#top">Book an appointment</a></article>
          <article><span>02</span><h3>Complimentary delivery</h3><p>Signature packaging and secure delivery, offered with every order.</p><a href="#top">Delivery & returns</a></article>
          <article><span>03</span><h3>Personalisation</h3><p>Make selected pieces your own with initials or hand-painted details.</p><a href="#top">Explore the service</a></article>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div>
            <p className="eyebrow">The Lueur letter</p>
            <h2>Stories, objects and invitations.</h2>
          </div>
          {subscribed ? (
            <p className="success-message">Thank you. You’re on the list.</p>
          ) : (
            <form onSubmit={submitNewsletter}>
              <label htmlFor="email">Email address</label>
              <div><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /><button aria-label="Subscribe">→</button></div>
            </form>
          )}
        </div>
        <div className="footer-links">
          <div><h3>Client services</h3><a href="#services">Contact us</a><a href="#services">Delivery & returns</a><a href="#services">Book an appointment</a></div>
          <div><h3>The Maison</h3><a href="#story">Our story</a><a href="#story">Craftsmanship</a><a href="#journal">Journal</a></div>
          <div><h3>Follow</h3><a href="#top">Instagram</a><a href="#top">Pinterest</a><a href="#top">WeChat</a></div>
          <div className="locale"><h3>Shipping to</h3><button>United States · EN <span>⌄</span></button></div>
        </div>
        <div className="footer-bottom"><a className="wordmark" href="#top">MAISON LUEUR</a><p>© 2026 Maison Lueur</p><div><a href="#top">Privacy</a><a href="#top">Legal</a><a href="#top">Accessibility</a></div></div>
      </footer>

      <div className={`panel-backdrop ${menuOpen || searchOpen || cartOpen ? "visible" : ""}`} onClick={() => { setMenuOpen(false); setSearchOpen(false); setCartOpen(false); }} />

      <aside className={`side-panel menu-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <button className="panel-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
        <p className="panel-label">Explore</p>
        <nav><a href="#collection" onClick={() => setMenuOpen(false)}>New arrivals <span>01</span></a><a href="#collection" onClick={() => setMenuOpen(false)}>Women <span>02</span></a><a href="#men" onClick={() => setMenuOpen(false)}>Men <span>03</span></a><a href="#collection" onClick={() => setMenuOpen(false)}>Travel <span>04</span></a><a href="#collection" onClick={() => setMenuOpen(false)}>Gifts <span>05</span></a></nav>
        <div className="panel-meta"><a href="#services">Book an appointment</a><a href="#services">Find a store</a></div>
      </aside>

      <aside className={`side-panel search-panel ${searchOpen ? "open" : ""}`} aria-hidden={!searchOpen}>
        <button className="panel-close" onClick={() => setSearchOpen(false)} aria-label="Close search">×</button>
        <p className="panel-label">Search the Maison</p>
        <form onSubmit={(e) => { e.preventDefault(); setSearchOpen(false); document.getElementById("collection")?.scrollIntoView(); }}>
          <input autoFocus={searchOpen} aria-label="Search" placeholder="What are you looking for?" />
          <button>→</button>
        </form>
        <p className="suggestions">Popular: <a href="#collection" onClick={() => setSearchOpen(false)}>Leather goods</a> · <a href="#collection" onClick={() => setSearchOpen(false)}>Fragrance</a></p>
      </aside>

      <aside className={`side-panel cart-panel ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
        <button className="panel-close" onClick={() => setCartOpen(false)} aria-label="Close bag">×</button>
        <p className="panel-label">Your bag · {bag.length}</p>
        {bag.length === 0 ? <div className="empty-bag"><p>Your bag is waiting.</p><button onClick={() => { setCartOpen(false); document.getElementById("collection")?.scrollIntoView(); }}>Discover the collection</button></div> : <>
          <div className="bag-items">{bag.map((item, index) => <div key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p><button onClick={() => setBag((items) => items.filter((_, i) => i !== index))} aria-label={`Remove ${item}`}>×</button></div>)}</div>
          <button className="checkout" onClick={() => alert("Checkout is ready to connect to your commerce platform.")}>Continue to checkout</button>
        </>}
      </aside>
    </main>
  );
}
