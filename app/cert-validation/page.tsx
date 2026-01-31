export default function CertValidationPage() {
  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "28px 16px 48px",
        display: "grid",
        gap: 18,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <p style={{ margin: 0, opacity: 0.7, fontWeight: 700, letterSpacing: "0.12em" }}>
          CERT VALIDATION
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)" }}>
          Verify PSA, CGC, and BGS certifications
        </h1>
        <p style={{ margin: 0, opacity: 0.78, maxWidth: 720 }}>
          Use the official PSA, CGC, and BGS lookup tools to confirm certification numbers
          for graded cards.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <a
          href="https://www.psacard.com/cert?_gl=1*ynpdn*_gcl_au*MTAzODAwNjk2Ny4xNzY0NjA5Njk2*_ga*NTgwMTExMjg2LjE3NjQ2MDk3MDE.*_ga_GGS8NWPYE2*czE3Njc3MzI0OTkkbzE1JGcxJHQxNzY3NzMyNTMyJGoyNyRsMCRoMA..*_ga_1QVXQ1V575*czE3Njc3MzI1MzMkbzUkZzAkdDE3Njc3MzI1MzMkajYwJGwxJGg1NzU2NTc3NDc.&QTM_SID=a3a5c1746adc3bbd29ab7495ada7ec19&QTM_UID=9bacc3752ab6c5354254d8987e77a5d0"
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            color: "inherit",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 18,
            padding: 18,
            display: "grid",
            gap: 12,
            minHeight: 180,
          }}
        >
          <img
            src="https://www.psacard.com/Content/images/psa-logo-reg.png"
            alt="PSA"
            style={{ maxWidth: 160, height: "auto" }}
          />
          <div style={{ fontWeight: 700, fontSize: 18 }}>PSA Certification Lookup</div>
          <div style={{ opacity: 0.72 }}>
            Search PSA cert numbers on the official PSA site.
          </div>
        </a>

        <a
          href="https://www.cgccards.com/certlookup/"
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            color: "inherit",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 18,
            padding: 18,
            display: "grid",
            gap: 12,
            minHeight: 180,
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Certified_Guaranty_Company.svg/250px-Certified_Guaranty_Company.svg.png"
            alt="CGC"
            style={{ maxWidth: 160, height: "auto" }}
          />
          <div style={{ fontWeight: 700, fontSize: 18 }}>CGC Certification Lookup</div>
          <div style={{ opacity: 0.72 }}>
            Search CGC cert numbers on the official CGC Cards site.
          </div>
        </a>

        <a
          href="https://www.beckett.com/grading/card-lookup"
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            color: "inherit",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 18,
            padding: 18,
            display: "grid",
            gap: 12,
            minHeight: 180,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background: "rgba(255,255,255,0.08)",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: 20,
            }}
          >
            BGS
          </div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>BGS Card Lookup</div>
          <div style={{ opacity: 0.72 }}>
            Search Beckett cert numbers on the official BGS lookup page.
          </div>
        </a>
      </div>
    </main>
  );
}
