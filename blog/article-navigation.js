(() => {
  const articles = [
    { slug: "how-to-choose-aari-embroidery-bridal-blouse", title: "How to choose the right Aari embroidery style for your wedding blouse", date: "June 2025" },
    { slug: "bridal-aari-work-blouse-kanchipuram-silk-sarees", title: "Bridal Aari work blouse designs for Kanchipuram silk sarees", date: "July 2025" },
    { slug: "aari-vs-maggam-vs-zardosi", title: "Aari work vs Maggam work vs Zardosi", date: "August 2025" },
    { slug: "aari-work-blouse-price-guide", title: "Aari work blouse price guide: what changes the cost?", date: "September 2025" },
    { slug: "choose-aari-work-wedding-saree-colour", title: "How to choose Aari work for your wedding saree colour", date: "October 2025" },
    { slug: "aari-embroidery-care-washing-guide", title: "Aari embroidery care and washing guide", date: "November 2025" },
    { slug: "simple-aari-work-designs-daily-wear", title: "Simple Aari work designs for daily wear", date: "December 2025" },
    { slug: "aari-motifs-peacock-mango-floral-meaning", title: "Peacock, mango and floral motifs: designs and meaning", date: "January 2026" },
    { slug: "aari-work-timeline-when-to-book-wedding", title: "How long does Aari work take and when should you book?", date: "February 2026" }
  ];

  const currentSlug = window.location.pathname.replace(/\/+$/, "").split("/").pop();
  const currentIndex = articles.findIndex((article) => article.slug === currentSlug);
  const article = document.querySelector("article");
  const headings = article ? [...article.querySelectorAll("h2")] : [];

  if (headings.length > 1) {
    const layout = article.closest(".article-layout, .post-layout");
    if (layout) {
      const toc = document.createElement("nav");
      toc.className = "article-toc";
      toc.setAttribute("aria-label", "Table of contents");

      const title = document.createElement("span");
      title.className = "article-toc-title";
      title.textContent = "On this page";

      const list = document.createElement("ol");
      const links = headings.map((heading, index) => {
        if (!heading.id) {
          const baseId = heading.textContent
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || `section-${index + 1}`;
          let id = baseId;
          let suffix = 2;
          while (document.getElementById(id)) {
            id = `${baseId}-${suffix}`;
            suffix += 1;
          }
          heading.id = id;
        }

        heading.classList.add("article-toc-heading");
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        link.addEventListener("click", () => setActiveLink(link));
        item.append(link);
        list.append(item);
        return link;
      });

      function setActiveLink(activeLink) {
        links.forEach((link) => {
          if (link === activeLink) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }

      toc.append(title, list);
      layout.classList.add("article-layout--with-toc");
      layout.insertBefore(toc, article);
      setActiveLink(links[0]);

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          const visibleHeading = entries
            .filter((entry) => entry.isIntersecting)
            .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];
          if (!visibleHeading) return;
          const activeLink = links[headings.indexOf(visibleHeading.target)];
          if (activeLink) setActiveLink(activeLink);
        }, { rootMargin: "-15% 0px -70% 0px" });

        headings.forEach((heading) => observer.observe(heading));
      }
    }
  }

  const byline = article?.querySelector(".article-byline, .post-byline");
  if (currentIndex === -1 || !article || !byline) return;

  const navigation = document.createElement("nav");
  navigation.className = "article-pagination";
  navigation.setAttribute("aria-label", "Continue reading");

  const label = document.createElement("span");
  label.className = "article-pagination-label";
  label.textContent = "Continue reading";
  navigation.append(label);

  const addLink = (item, direction, className) => {
    if (!item) return;
    const link = document.createElement("a");
    link.className = `article-pagination-link ${className}`;
    link.href = `../${item.slug}/`;

    const directionLabel = document.createElement("span");
    directionLabel.textContent = direction;
    const title = document.createElement("strong");
    title.textContent = item.title;
    const date = document.createElement("small");
    date.textContent = item.date;
    link.append(directionLabel, title, date);
    navigation.append(link);
  };

  addLink(articles[currentIndex - 1], "← Previous article", "article-pagination-link--previous");
  addLink(articles[currentIndex + 1], "Next article →", "article-pagination-link--next");
  byline.after(navigation);
})();
