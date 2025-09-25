import Image from "next/image";

export default function Home() {
  return (
    <>
      <header>
        <nav>
          <div className="logo">Cuddleia</div>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Shop</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero" style={{ backgroundImage: "url('https://picsum.photos/seed/hero/1200/600')" }}>
          <div className="hero-content">
            <h1>Welcome to Cuddleia</h1>
            <p>Where every stitch is a hug</p>
            <a href="#" className="cta-button">Shop Now</a>
          </div>
        </section>

        <section className="products">
          <h2>Our Creations</h2>
          <div className="product-grid">
            <div className="product-card">
              <Image src="https://picsum.photos/seed/1/300/300" alt="Plushie 1" data-ai-hint="cute plushie" width={300} height={300} />
              <h3>Barnaby the Bear</h3>
              <p>$25.00</p>
            </div>
            <div className="product-card">
              <Image src="https://picsum.photos/seed/2/300/300" alt="Plushie 2" data-ai-hint="cute octopus" width={300} height={300} />
              <h3>Olly the Octopus</h3>
              <p>$30.00</p>
            </div>
            <div className="product-card">
              <Image src="https://picsum.photos/seed/3/300/300" alt="Plushie 3" data-ai-hint="cute dinosaur" width={300} height={300} />
              <h3>Rex the Dino</h3>
              <p>$28.00</p>
            </div>
            <div className="product-card">
              <Image src="https://picsum.photos/seed/4/300/300" alt="Plushie 4" data-ai-hint="fluffy bunny" width={300} height={300} />
              <h3>Luna the Bunny</h3>
              <p>$22.00</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2024 Cuddleia. All rights reserved.</p>
      </footer>
    </>
  );
}
