const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site-config.json'), 'utf8'));

if (typeof config.replyWindow !== 'string' || !config.replyWindow.trim()) {
  throw new Error('site-config.json must define a non-empty replyWindow string.');
}
if (typeof config.studioHours !== 'string' || !config.studioHours.trim()) {
  throw new Error('site-config.json must define a non-empty studioHours string.');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

const replyWindow = escapeHtml(config.replyWindow.trim());
const studioHours = escapeHtml(config.studioHours.trim());
const shortReply = `We reply within ${replyWindow}.`;
const whatsappNumber = String(config.whatsappNumber || '').replace(/\D/g, '');

if (!/^[1-9]\d{7,14}$/.test(whatsappNumber)) {
  throw new Error('site-config.json must define a valid international whatsappNumber.');
}

function encodeQueryValue(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, character =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function whatsappUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeQueryValue(message)}`;
}

function formatPhoneNumber() {
  if (whatsappNumber.startsWith('91') && whatsappNumber.length === 12) {
    const localNumber = whatsappNumber.slice(2);
    return `+91 ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`;
  }
  return `+${whatsappNumber}`;
}

const displayPhone = formatPhoneNumber();

function syncContactLinks() {
  const filePath = 'contact/index.html';
  const absolutePath = path.join(root, filePath);
  let html = fs.readFileSync(absolutePath, 'utf8');
  const message = "Hi Khadeeja Designs, I'd like to enquire about Aari embroidery.";
  const links = `<!-- contact-quick-links:start -->
      <div class="contact-quick-links" role="group" aria-label="Contact Khadeeja Designs directly">
        <div class="contact-quick-links__actions">
          <a class="button button--ghost contact-quick-link whatsapp-link" href="${whatsappUrl(message)}" aria-label="WhatsApp Khadeeja Designs about Aari embroidery" data-contact-method="whatsapp"><img class="whatsapp-icon" src="/images/whatsapp-icon.png" alt="" aria-hidden="true"><span class="whatsapp-label">WhatsApp</span></a>
          <a class="button button--ghost contact-quick-link" href="tel:+${whatsappNumber}" aria-label="Call Khadeeja Designs at ${displayPhone}" data-contact-method="call">Call ${displayPhone}</a>
        </div>
      </div>
      <!-- contact-quick-links:end -->`;
  const mobileBar = `<!-- contact-mobile-bar:start -->
  <div class="mobile-contact-bar contact-contact-bar" role="group" aria-label="Contact Khadeeja Designs">
    <a class="button mobile-contact-bar__whatsapp whatsapp-link" href="${whatsappUrl(message)}" aria-label="WhatsApp Khadeeja Designs about Aari embroidery" data-contact-method="whatsapp"><img class="whatsapp-icon" src="/images/whatsapp-icon.png" alt="" aria-hidden="true"><span class="whatsapp-label">WhatsApp</span></a>
    <a class="button mobile-contact-bar__call" href="tel:+${whatsappNumber}" aria-label="Call Khadeeja Designs at ${displayPhone}" data-contact-method="call">Call</a>
  </div>
  <!-- contact-mobile-bar:end -->`;
  const markedBlock = /<!-- contact-quick-links:start -->[\s\S]*?<!-- contact-quick-links:end -->/;
  if (markedBlock.test(html)) {
    html = html.replace(markedBlock, links);
  } else {
    const heading = '<h2 class="form-heading">Send your <em>enquiry.</em></h2>';
    if (!html.includes(heading)) {
      throw new Error(`Could not find the enquiry heading in ${filePath}.`);
    }
    html = html.replace(heading, `${heading}\n      ${links}`);
  }

  const mobileBarBlock = /<!-- contact-mobile-bar:start -->[\s\S]*?<!-- contact-mobile-bar:end -->/;
  if (mobileBarBlock.test(html)) {
    html = html.replace(mobileBarBlock, mobileBar);
  } else {
    const mainEnd = html.lastIndexOf('</main>');
    if (mainEnd < 0) throw new Error(`Could not find the main element in ${filePath}.`);
    html = `${html.slice(0, mainEnd)}${mobileBar}\n${html.slice(mainEnd)}`;
  }
  html = html.replace(/<body\b([^>]*)>/i, (bodyTag, attributes) => {
    const classAttribute = attributes.match(/\bclass=(["'])(.*?)\1/i);
    if (classAttribute) {
      if (classAttribute[2].split(/\s+/).includes('contact-page')) return bodyTag;
      return bodyTag.replace(classAttribute[0], `class=${classAttribute[1]}${classAttribute[2]} contact-page${classAttribute[1]}`);
    }
    return `<body class="contact-page"${attributes}>`;
  });
  fs.writeFileSync(absolutePath, html);
}

function syncReplyWindow(filePath, addProductNote = false) {
  const absolutePath = path.join(root, filePath);
  let html = fs.readFileSync(absolutePath, 'utf8');

  if (addProductNote) {
    let hasProductNote = false;
    html = html.replace(/<p class="copy reply-window-note">[\s\S]*?<\/p>/g, () => {
      if (hasProductNote) return '';
      hasProductNote = true;
      return `<p class="copy reply-window-note">We reply within <span data-reply-window-static>${replyWindow}</span>.</p>`;
    });

    if (!hasProductNote) {
      const cta = '<a class="cta"';
      const ctaIndex = html.indexOf(cta);
      if (ctaIndex < 0) {
        throw new Error(`Could not find product CTA in ${filePath}.`);
      }
      html = `${html.slice(0, ctaIndex)}<p class="copy reply-window-note">We reply within <span data-reply-window-static>${replyWindow}</span>.</p>${html.slice(ctaIndex)}`;
    }
  }

  const markerCounts = { replyWindow: 0, studioHours: 0 };
  html = html.replace(
    /<span\b([^>]*\bdata-(?:reply-window|studio-hours)(?:-static)?\b[^>]*)>[\s\S]*?<\/span>/g,
    (_match, attributes) => {
      const isStudioHours = /\bdata-studio-hours(?:-static)?(?=$|[\s=>])/.test(attributes);
      const key = isStudioHours ? 'studioHours' : 'replyWindow';
      markerCounts[key] += 1;
      const staticAttributes = attributes
        .replace(/\bdata-reply-window(?=$|[\s=>])/g, 'data-reply-window-static')
        .replace(/\bdata-studio-hours(?=$|[\s=>])/g, 'data-studio-hours-static');
      return `<span${staticAttributes}>${isStudioHours ? studioHours : replyWindow}</span>`;
    },
  );

  if (markerCounts.replyWindow === 0) {
    throw new Error(`Could not find a reply-window element in ${filePath}.`);
  }

  fs.writeFileSync(absolutePath, html);
}

function updateMetaDescription(filePath, targetAttribute, description) {
  const absolutePath = path.join(root, filePath);
  let html = fs.readFileSync(absolutePath, 'utf8');
  const marker = `${targetAttribute.name}="${targetAttribute.value}"`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error(`Could not find ${marker} in ${filePath}.`);
  }

  const tagStart = html.lastIndexOf('<meta', markerIndex);
  const tagEnd = html.indexOf('>', markerIndex);
  if (tagStart < 0 || tagEnd < 0) {
    throw new Error(`Could not read the ${marker} meta tag in ${filePath}.`);
  }

  const tag = html.slice(tagStart, tagEnd + 1);
  const expectedContent = `content="${escapeHtml(description)}"`;
  const updatedTag = tag.replace(/\bcontent="[^"]*"/, expectedContent);
  if (updatedTag === tag) {
    if (tag.includes(expectedContent)) return;
    throw new Error(`Could not update the content for ${marker} in ${filePath}.`);
  }

  fs.writeFileSync(absolutePath, `${html.slice(0, tagStart)}${updatedTag}${html.slice(tagEnd + 1)}`);
}

function syncProductContactMarkup(productId, product) {
  const filePath = path.join('explore', 'designs', productId, 'index.html');
  const absolutePath = path.join(root, filePath);
  let html = fs.readFileSync(absolutePath, 'utf8');
  const title = String(product.title || '').trim();
  if (!title) throw new Error(`product.json must define a title for ${productId}.`);

  const pageUrl = `https://khadeejadesigns.in/explore/designs/${productId}/`;
  const message = `Hi Khadeeja Designs, I'm interested in ${title} (${pageUrl})`;
  const escapedTitle = escapeHtml(title);
  const actions = `<!-- product-contact-actions:start -->
<div class="product-actions" role="group" aria-label="Enquiry options">
  <a class="cta" href="/contact/#id=${encodeURIComponent(productId)}" aria-label="Make the ${escapedTitle} design yours">Make It Yours →</a>
  <a class="button button--ghost product-whatsapp whatsapp-link" href="${escapeHtml(whatsappUrl(message))}" aria-label="Discuss the ${escapedTitle} design on WhatsApp" data-contact-method="whatsapp"><span class="whatsapp-prefix">Discuss on</span><img class="whatsapp-icon" src="/images/whatsapp-icon.png" alt="" aria-hidden="true"></a>
</div>
<!-- product-contact-actions:end -->`;
  const actionsBlock = /<!-- product-contact-actions:start -->[\s\S]*?<!-- product-contact-actions:end -->/;
  if (actionsBlock.test(html)) {
    html = html.replace(actionsBlock, actions);
  } else {
    const oldCta = `<a class="cta" href="/contact/#id=${productId}">Make It Yours →</a>`;
    if (!html.includes(oldCta)) {
      throw new Error(`Could not find the static Make It Yours link in ${filePath}.`);
    }
    html = html.replace(oldCta, actions);
  }

  if (!/<body\b[^>]*\bclass="[^"]*\bproduct-page\b/i.test(html)) {
    if (!/<body\b[^>]*>/i.test(html)) throw new Error(`Could not find the body element in ${filePath}.`);
    html = html.replace(/<body\b([^>]*)>/i, '<body class="product-page"$1>');
  }

  const phoneLink = `<a class="button button--ghost product-contact-bar__call" href="tel:+${whatsappNumber}" aria-label="Call Khadeeja Designs at ${displayPhone}" data-contact-method="call">Call</a>`;
  const whatsappLink = `<a class="button button--gold product-contact-bar__whatsapp mobile-contact-bar__whatsapp whatsapp-link" href="${escapeHtml(whatsappUrl(message))}" aria-label="Discuss the ${escapedTitle} design on WhatsApp" data-contact-method="whatsapp"><span class="whatsapp-label">WhatsApp</span></a>`;
  const contactBar = `<!-- product-contact-bar:start -->
<div class="product-contact-bar mobile-contact-bar" role="group" aria-label="Contact Khadeeja Designs about this design">
  ${whatsappLink}
  ${phoneLink.replace('product-contact-bar__call', 'product-contact-bar__call mobile-contact-bar__call')}
</div>
<!-- product-contact-bar:end -->`;
  const barBlock = /<!-- product-contact-bar:start -->[\s\S]*?<!-- product-contact-bar:end -->/;
  if (barBlock.test(html)) {
    html = html.replace(barBlock, contactBar);
  } else {
    const mainEnd = html.indexOf('</main>');
    const footerStart = html.indexOf('<footer', mainEnd);
    if (mainEnd < 0 || footerStart < 0) {
      throw new Error(`Could not find the product main/footer boundary in ${filePath}.`);
    }
    html = `${html.slice(0, footerStart)}${contactBar}\n${html.slice(footerStart)}`;
  }

  fs.writeFileSync(absolutePath, html);
}

syncReplyWindow('faq/index.html');
syncReplyWindow('contact/index.html');
syncReplyWindow('explore/index.html');
syncReplyWindow(path.join('blog', 'how-to-choose-aari-embroidery-bridal-blouse', 'index.html'));
syncReplyWindow('thankyou/index.html');
syncContactLinks();

const shortReplyText = `We reply within ${config.replyWindow.trim()}.`;
for (const [filePath, description] of [
  ['contact/index.html', `Get a custom Aari blouse quote in Trichy. Share your saree and occasion with Khadeeja Designs. ${shortReplyText}`],
  ['faq/index.html', `Answers about Aari work, pricing, custom orders and delivery from Khadeeja Designs. ${shortReplyText}`],
]) {
  updateMetaDescription(filePath, { name: 'name', value: 'description' }, description);
  updateMetaDescription(filePath, { name: 'property', value: 'og:description' }, description);
}

const productIds = JSON.parse(
  fs.readFileSync(path.join(root, 'explore', 'designs', 'index.json'), 'utf8'),
);
if (!Array.isArray(productIds) || productIds.some(id => typeof id !== 'string')) {
  throw new Error('explore/designs/index.json must contain an array of product IDs.');
}

for (const productId of productIds) {
  const productPath = path.join('explore', 'designs', productId, 'product.json');
  const product = JSON.parse(fs.readFileSync(path.join(root, productPath), 'utf8'));
  const pagePath = path.join('explore', 'designs', productId, 'index.html');
  syncReplyWindow(pagePath, true);
  syncProductContactMarkup(productId, product);
}
