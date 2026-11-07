const archive = document.querySelector(".blog-grid");

if (archive) {
  const cards = [...archive.querySelectorAll(".blog-card")];
  cards.sort((left, right) => {
    const leftDate = left.querySelector("time.blog-date")?.dateTime || "";
    const rightDate = right.querySelector("time.blog-date")?.dateTime || "";
    return rightDate.localeCompare(leftDate);
  });
  archive.append(...cards);
}
