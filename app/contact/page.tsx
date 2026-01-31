// app/contact/page.tsx
export default function ContactPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ margin: 0 }}>Contact Us</h1>
      <p style={{ opacity: 0.85, marginTop: 12 }}>
        Have a question about an item, order, or upcoming listings? We’re happy to help.
      </p>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>📧 Email:</div>
        <p style={{ opacity: 0.85 }}>
          If you need clarification on card condition, grading, or details. We aim to respond
          as quickly as possible.
        </p>
      </div>
    </main>
  );
}
