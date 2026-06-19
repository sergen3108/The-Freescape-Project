/* ============================================================
   BLOG-POSTS.JS — Liest Posts aus /posts/*.md (Decap CMS)
   ============================================================ */

window.BLOG_POSTS = null;

(async function () {

  let files = [];
  try {
    const res = await fetch('/posts/index.json');
    if (res.ok) files = await res.json();
  } catch (e) {
    console.warn('[blog-posts] Kein /posts/index.json — nutze Fallback-Daten.');
  }

  if (files.length === 0) {
    window.BLOG_POSTS = FALLBACK_POSTS;
    document.dispatchEvent(new CustomEvent('blogPostsReady'));
    return;
  }

  const posts = [];
  await Promise.all(files.map(async (filename) => {
    try {
      const res = await fetch(`/posts/${filename}`);
      if
