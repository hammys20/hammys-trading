// app/terms/page.tsx
export default function TermsPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ margin: 0 }}>Terms &amp; Conditions</h1>

      <div style={{ marginTop: 18, display: "grid", gap: 16, lineHeight: 1.6 }}>
        <section>
          <h2 style={{ margin: "0 0 6px" }}>1. All Sales Are Final</h2>
          <p>
            All sales are final. We do not accept returns, exchanges, or cancellations
            for any reason. This includes but is not limited to buyer&apos;s remorse,
            grading expectations, condition disputes, or incorrect purchases.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>2. Product Descriptions &amp; Condition</h2>
          <p>
            We strive to describe all items as accurately as possible, including
            condition, edition, and authenticity. However, trading cards are
            collectibles, and condition assessments may be subjective. Please review
            all photos and descriptions carefully before purchasing.
          </p>
          <p>
            By completing a purchase, you acknowledge that you have reviewed the item
            details and agree to the listed condition.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>3. Authenticity</h2>
          <p>
            All cards sold are authentic to the best of our knowledge. Any graded cards
            are sold exactly as encapsulated by the grading company, and we make no
            guarantees beyond the grading provider&apos;s assessment.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>4. Pricing &amp; Payments</h2>
          <p>
            All prices are listed in U.S. dollars unless otherwise stated. We reserve
            the right to change prices at any time without notice. Orders are not
            confirmed until payment is successfully processed.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>5. Shipping &amp; Risk of Loss</h2>
          <p>
            Once an order has shipped, ownership and risk of loss transfer to the
            buyer. We are not responsible for delays, damage, or loss caused by
            shipping carriers, weather, or other events beyond our control.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>6. Chargebacks &amp; Fraud</h2>
          <p>
            Unauthorized chargebacks or payment disputes for delivered items may result
            in account termination and potential collection or legal action. Please
            contact us directly if there is an issue with your order.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>7. Limitation of Liability</h2>
          <p>
            We are not liable for any indirect, incidental, or consequential damages
            arising from the use of this website or the purchase of any products.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>8. Changes to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms &amp; Conditions at
            any time. Continued use of the site constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px" }}>9. Contact</h2>
          <p>
            If you have questions prior to purchasing, please contact us before placing
            an order. We&apos;re always happy to help clarify details upfront.
          </p>
        </section>
      </div>
    </main>
  );
}
