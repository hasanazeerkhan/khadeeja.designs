/**
 * Schema.org Structured Data Generator
 * Generates JSON-LD for better SEO and rich snippets
 * 
 * Usage: Add generated schemas to <head> section
 */

// ============ Organization Schema ============
function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Khadeeja Designs",
    "image": "https://khadeejadesigns.com/public/logo.png",
    "description": "Hand-stitched Aari embroidery studio specializing in bridal, couture, and bespoke orders.",
    "url": "https://khadeejadesigns.com",
    "telephone": "+918667454391",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "17 East Sayakara Lane, Jaffersha Street",
      "addressLocality": "Trichy",
      "addressRegion": "Tamil Nadu",
      "postalCode": "620008",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://instagram.com/khadeeja.designs",
      "https://www.facebook.com/khadeejadesigns",
      "https://www.pinterest.com/khadeejadesigns"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+918667454391",
      "email": "khadeejadesigns@gmail.com"
    },
    "priceRange": "₹₹₹"
  };
}

// ============ Product/Service Schema ============
function generateServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Custom Aari Embroidery",
    "description": "Hand-stitched Aari embroidery services for bridal, couture, and bespoke orders.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Khadeeja Designs",
      "url": "https://khadeejadesigns.com"
    },
    "areaServed": {
      "@type": "GeoShape",
      "box": "10.65 78.00 10.90 78.70"
    },
    "serviceType": "Embroidery",
    "image": "https://khadeejadesigns.com/public/logo.png",
    "ratingValue": 4.8,
    "ratingCount": 45
  };
}

// ============ Blog Post Schema ============
function generateBlogPostSchema(blogData) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blogData.title,
    "description": blogData.excerpt || blogData.title,
    "image": `https://khadeejadesigns.com/${blogData.image}`,
    "datePublished": blogData.date,
    "dateModified": blogData.date,
    "author": {
      "@type": "Person",
      "name": "Khadeeja Designs",
      "url": "https://khadeejadesigns.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Khadeeja Designs",
      "logo": {
        "@type": "ImageObject",
        "url": "https://khadeejadesigns.com/public/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://khadeejadesigns.com/blogs/blogs.html?post=${blogData.slug}`
    }
  };
}

// ============ Product Schema ============
function generateProductSchema(productData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name || "Hand-stitched Aari Embroidered Piece",
    "description": productData.description || "Custom embroidered textile",
    "image": productData.image || "https://khadeejadesigns.com/public/logo.png",
    "brand": {
      "@type": "Brand",
      "name": "Khadeeja Designs"
    },
    "offers": {
      "@type": "AggregateOffer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "INR",
      "price": productData.price || "Custom Pricing",
      "url": "https://khadeejadesigns.com#contact"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8,
      "ratingCount": 45
    }
  };
}

// ============ FAQPage Schema ============
function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Aari embroidery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aari is a hooked-needle technique producing chain stitch motifs. It's used for dense, textured embroidery with beads and sequins."
        }
      },
      {
        "@type": "Question",
        "name": "Do you take custom bridal orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Bridal orders include design consultation, sample swatch, stitching schedule, and mid-way quality check."
        }
      },
      {
        "@type": "Question",
        "name": "How long does a project take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Small pieces: 7-10 days. Full bridal sets: 14-28 days. Rush orders available at surcharge."
        }
      },
      {
        "@type": "Question",
        "name": "What materials do you use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "High-twist silk threads, glass and crystal beads, and reinforced base fabrics like silk, velvet, and organza."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer international shipping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we ship internationally with tracking and insurance options."
        }
      }
    ]
  };
}

// ============ Breadcrumb Schema ============
function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// ============ Insert Schema into Page ============
function insertSchema(schema, location = 'head') {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  
  if (location === 'head') {
    document.head.appendChild(script);
  } else {
    document.body.appendChild(script);
  }
}

// ============ Auto-insert schemas based on page type ============
function initializeSchemas() {
  // Always add organization schema
  insertSchema(generateOrganizationSchema());
  insertSchema(generateServiceSchema());
  insertSchema(generateFAQSchema());

  // Add breadcrumb if on blog page
  if (window.location.pathname.includes('/blogs/')) {
    const breadcrumbs = [
      { name: 'Home', url: 'https://khadeejadesigns.com' },
      { name: 'Blog', url: 'https://khadeejadesigns.com/blogs' },
      { name: document.title.split('-')[0].trim(), url: window.location.href }
    ];
    insertSchema(generateBreadcrumbSchema(breadcrumbs));
  }

  console.log('Schema.org structured data inserted');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSchemas);
} else {
  initializeSchemas();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateOrganizationSchema,
    generateServiceSchema,
    generateBlogPostSchema,
    generateProductSchema,
    generateFAQSchema,
    generateBreadcrumbSchema,
    insertSchema,
    initializeSchemas
  };
}
