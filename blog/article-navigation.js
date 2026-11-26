// Highlights the current section in the article's table of contents while reading.
// The contents list, "Continue reading" cards and community links are static HTML written by
// tools/sync-site.js, so this script only toggles aria-current and never changes layout.
(() => {
  const links = [...document.querySelectorAll('.article-toc a[href^="#"]')];
  if (!links.length) return;
  const headings = links.map(link => document.getElementById(link.hash.slice(1)));

  const setActive = active => links.forEach(link => {
    if (link === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  links.forEach(link => link.addEventListener('click', () => setActive(link)));

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    const link = links[headings.indexOf(visible.target)];
    if (link) setActive(link);
  }, { rootMargin: '-15% 0px -70% 0px' });
  headings.forEach(heading => heading && observer.observe(heading));
})();
