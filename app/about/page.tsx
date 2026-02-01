export const metadata = {
  title: "About Us | Hammy’s Trading",
  description:
    "Learn the story behind Hammy’s Trading — a family-run, faith-first trading card business built on community, collecting, and love for the hobby.",
};

const galleryImages = [
  {
    src: "/about/kings-of-cards-hit.jpg",
    alt: "A big hit from a 2025 Phoenix Football hobby box at Kings of Cards at the Rex",
  },
  {
    src: "/about/hamilton-couple.jpg",
    alt: "Jason and family co-founder selfie in the car",
  },
  {
    src: "/about/charizard-pull.jpg",
    alt: "One of the boys holding a Charizard pull at a card shop",
  },
  {
    src: "/about/three-boys-cards.jpg",
    alt: "The boys at a table with Celebration Elite Trainer Boxes",
  },
];

function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: "1.25rem",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <h3 style={{ marginBottom: "0.5rem", fontSize: "1.05rem" }}>{title}</h3>
      <p style={{ margin: 0, opacity: 0.9 }}>{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "3rem 1.25rem",
        lineHeight: 1.7,
      }}
    >
      <section
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.7 }}>
            Family-Run • Faith-First • Collectors
          </p>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>
            About Hammy’s Trading
          </h1>

          <p>
            Hammy’s Trading started the same way many great stories do—at home, with
            family, and a shared love for collecting.
          </p>

          <p>
            Back in <strong>2020 during the pandemic</strong>, my two boys—then{" "}
            <strong>7 and 4 years old</strong>—and I discovered Pokémon cards
            together. What began as opening packs quickly turned into learning about
            card values, conditions, and the excitement of sending cards off to be
            graded. Watching those slabs come back sparked something special for all
            of us.
          </p>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
          }}
        >
          <a href={galleryImages[0].src} target="_blank" rel="noreferrer">
            <img
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 14,
                objectFit: "cover",
              }}
            />
          </a>
        </div>
      </section>

      <div style={{ height: 28 }} />

      <section>
        <p>
          As the years went on, our collection grew… a lot. Fast forward{" "}
          <strong>six years</strong>, and while Pokémon is still close to our
          hearts, the boys are now just as passionate about{" "}
          <strong>football cards</strong>, and our house is filled with stacks of
          Pokémon and sports cards alike.
        </p>

        <p>
          That’s when the idea hit us: why not turn what we already love into a fun
          family adventure?
        </p>

        <p>
          Hammy’s Trading isn’t about chasing quick profits or hype. It’s about the
          community, the thrill of the hunt, the stories behind the cards, and
          connecting with other collectors who feel the same way we do.
        </p>
      </section>

      <div style={{ margin: "2.5rem 0 2rem", opacity: 0.3 }}>
        <hr />
      </div>

      <section>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
          Why We’re Different
        </h2>

        <p>
          In a hobby that’s often driven by hype, flips, and fast money, we take a
          different approach.
        </p>

        <p>
          <strong>Hammy’s Trading was built as a family experience first.</strong>{" "}
          What started as a dad and two kids opening Pokémon packs turned into years
          of learning, collecting, grading, and growing together.
        </p>

        <p>
          But above all else, <strong>our faith comes first</strong>.
        </p>

        <p>
          We are followers of <strong>Jesus Christ</strong>, and that shapes how we
          treat people, how we do business, and why we do this at all.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <ValueCard
          title="✝️ Faith Before Everything"
          description="Our relationship with Jesus Christ is the most important thing in our lives, and we aim to honor God in how we serve others."
        />
        <ValueCard
          title="🧡 Community Over Profit"
          description="We focus on relationships, not quick wins or hype-driven sales."
        />
        <ValueCard
          title="🎴 Collectors, Not Just Sellers"
          description="We sell what we love and understand the collector mindset firsthand."
        />
        <ValueCard
          title="👨‍👦‍👦 Family-Run & Purpose-Driven"
          description="This is personal to us—built as a family and guided by strong values."
        />
        <ValueCard
          title="🔍 Transparency & Trust"
          description="Clear descriptions, honest conditions, and no games."
        />
        <ValueCard
          title="🔥 Fun Still Matters"
          description="The hobby should stay joyful, encouraging, and welcoming."
        />
      </div>

      <div style={{ margin: "2.5rem 0 2rem", opacity: 0.3 }}>
        <hr />
      </div>

      <section
        style={{
          padding: "1.5rem",
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 style={{ marginBottom: "0.75rem" }}>Our Mission</h3>
        <p style={{ fontStyle: "italic", marginBottom: "0.5rem" }}>
          “Whatever we do, we do it with integrity, joy, and love—serving others
          above ourselves.”
        </p>
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          Inspired by Colossians 3:23 &amp; Philippians 2:3
        </p>
      </section>

      <div style={{ margin: "2.5rem 0 1.5rem", opacity: 0.3 }}>
        <hr />
      </div>

      <section>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          Moments That Made Us
        </h2>
        <p style={{ opacity: 0.85, marginBottom: "1rem" }}>
          Tap an image to view full size. On mobile, swipe to browse.
        </p>
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(240px, 1fr)",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 8,
            scrollSnapType: "x mandatory",
          }}
        >
          {galleryImages.map((img) => (
            <a
              key={img.src}
              href={img.src}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.03)",
                scrollSnapAlign: "start",
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                style={{
                  width: "100%",
                  height: 320,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
