import React from "react";

export function JsonLd() {
  const baseUrl = "https://www.skillezo.com";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "SKILLEZO.AI",
    alternateName: ["Skillezo", "SKILLEZO", "SkilledHyre Labs"],
    legalName: "DEVAADYA TECHNOLOGIES PRIVATE LIMITED",
    url: baseUrl,
    logo: `${baseUrl}/skillezo-logo.png`,
    description:
      "AI career intelligence platform that benchmarks candidate employability, provides step-by-step career navigation, and issues cryptographically verified technical credentials.",
    parentOrganization: {
      "@type": "Organization",
      name: "SKILLEDHYRE LABS",
    },
    sameAs: [
      "https://www.linkedin.com/company/skillezo",
      "https://twitter.com/skillezo_ai",
      "https://github.com/Himanshu-20002/SKILLEZO.AI",
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "SKILLEZO.AI",
    url: baseUrl,
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/dashboard/job-center?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${baseUrl}/#softwareapplication`,
    name: "SKILLEZO.AI Career Intelligence OS",
    url: baseUrl,
    applicationCategory: "BusinessApplication, EducationalApplication",
    operatingSystem: "All (Cloud Web Application)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      category: "Free / Freemium",
    },
    featureList: [
      "AI Employability Index Calibration",
      "Cryptographically Verified Technical Assessments",
      "Interactive Step-by-Step Career GPS",
      "High-ATS Resume Analyzer & Canonical Career Dossier",
      "Direct Recruiter Candidate Review & Job Offer Flow",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What is SKILLEZO.AI and how does it help job seekers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SKILLEZO.AI is an AI career intelligence operating system that benchmarks your profile against live industry hiring datasets, computes your Employability Index, and gives you a personalized Career GPS roadmap to reach target engineering and tech roles.",
        },
      },
      {
        "@type": "Question",
        name: "How is the SKILLEZO Employability Index score calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Employability Score analyzes your parsed resume, technical competencies, verified test assessments, and profile completeness against real-time job requisitions, yielding an objective readiness score from 0 to 100.",
        },
      },
      {
        "@type": "Question",
        name: "Are SKILLEZO skill verification badges cryptographically authentic?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Technical competencies verified through SKILLEZO assessment tests are recorded in our cryptographic verification ledger with immutable credential hashes that recruiters can verify instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Can recruiters hire directly through SKILLEZO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Recruiters have access to the Candidate Review Drawer to inspect canonical resumes, review test-verified technical skills, schedule live interviews, and issue official job offers with compensation terms directly inside the platform.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
