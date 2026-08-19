/* =============================================================
   MAMELODI FC — MAIN SCRIPT
   Vanilla JavaScript only. No frameworks/libraries.
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* -----------------------------------------------------------
     1. MOBILE HAMBURGER NAVIGATION
     Toggles the nav menu open/closed and animates the icon.
     ----------------------------------------------------------- */
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
      var isOpen = navMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close the mobile menu whenever a nav link is clicked
    var navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -----------------------------------------------------------
     2. SMOOTH SCROLLING FOR ON-PAGE ANCHOR LINKS
     Only applies to links that point to an ID on the SAME page.
     ----------------------------------------------------------- */
  document.querySelectorAll('a[href*="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      var hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      var pagePart = href.substring(0, hashIndex);
      var targetId = href.substring(hashIndex + 1);
      var currentPage = window.location.pathname.split('/').pop();

      // Only intercept if the link targets the current page (or is a bare #id)
      var isSamePage = pagePart === '' || pagePart === currentPage || (pagePart === 'index.html' && currentPage === '');

      if (isSamePage && targetId) {
        var target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          var headerOffset = 80;
          var elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  /* -----------------------------------------------------------
     3. ACTIVE NAVIGATION LINK HIGHLIGHTING
     Highlights the nav link matching the current page/section
     as the user scrolls, and on page load.
     ----------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-link');

  function highlightActiveLink() {
    var scrollPos = window.scrollY + 120;
    var currentSectionId = null;

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navAnchors.forEach(function (a) {
      a.classList.remove('active');
      var href = a.getAttribute('href') || '';
      if (currentSectionId && href.indexOf('#' + currentSectionId) !== -1) {
        a.classList.add('active');
      }
    });

    // If no in-page section matched, fall back to matching the file name
    if (!currentSectionId) {
      var currentPage = window.location.pathname.split('/').pop() || 'index.html';
      navAnchors.forEach(function (a) {
        var linkPage = (a.getAttribute('href') || '').split('#')[0];
        if (linkPage === currentPage) a.classList.add('active');
      });
    }
  }

  if (sections.length) {
    window.addEventListener('scroll', highlightActiveLink);
  }
  highlightActiveLink();

  /* -----------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS
     Uses IntersectionObserver to fade/slide elements into view.
     ----------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: just show everything if IntersectionObserver isn't supported
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* -----------------------------------------------------------
     5. GALLERY FILTER + LIGHTBOX
     ----------------------------------------------------------- */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');

      galleryItems.forEach(function (item) {
        var category = item.getAttribute('data-category');
        if (filter === 'all' || filter === category) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var galleryList = Array.prototype.slice.call(galleryItems);
  var currentIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !galleryList[index]) return;
    currentIndex = index;
    var img = galleryList[index].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showNext(step) {
    // Only cycle through currently visible (filtered) items
    var visible = galleryList.filter(function (item) { return item.style.display !== 'none'; });
    var visibleIndex = visible.indexOf(galleryList[currentIndex]);
    var nextVisibleIndex = (visibleIndex + step + visible.length) % visible.length;
    var nextItem = visible[nextVisibleIndex];
    currentIndex = galleryList.indexOf(nextItem);
    openLightbox(currentIndex);
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () { openLightbox(index); });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showNext(-1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { showNext(1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showNext(-1);
    if (e.key === 'ArrowRight') showNext(1);
  });

  /* -----------------------------------------------------------
     6. CONTACT FORM VALIDATION
     Basic client-side checks. No backend — shows a success
     message and resets the form. Replace with real submission
     logic (e.g. fetch to a server or form service) later.
     ----------------------------------------------------------- */
  var contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;

      var fields = [
        { id: 'playerName', check: function (v) { return v.trim().length > 1; }, msg: 'Please enter the player\'s full name.' },
        { id: 'guardianName', check: function (v) { return v.trim().length > 1; }, msg: 'Please enter a parent/guardian name.' },
        { id: 'email', check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: 'Please enter a valid email address.' },
        { id: 'phone', check: function (v) { return /^[0-9+\s()-]{7,}$/.test(v.trim()); }, msg: 'Please enter a valid phone number.' },
        { id: 'message', check: function (v) { return v.trim().length > 9; }, msg: 'Please add a short message (at least 10 characters).' }
      ];

      fields.forEach(function (field) {
        var input = document.getElementById(field.id);
        if (!input) return;
        var group = input.closest('.form-group');
        var valid = field.check(input.value);

        if (!valid) {
          isValid = false;
          group.classList.add('invalid');
        } else {
          group.classList.remove('invalid');
        }
      });

      var successBox = document.getElementById('formSuccess');

      if (isValid) {
        if (successBox) {
          successBox.classList.add('show');
          successBox.textContent = 'Thank you! Your message has been received. We will get back to you soon.';
        }
        contactForm.reset();
      } else {
        if (successBox) successBox.classList.remove('show');
      }
    });

    // Remove the error state as soon as the user starts fixing a field
    contactForm.querySelectorAll('input, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        var group = input.closest('.form-group');
        if (group) group.classList.remove('invalid');
      });
    });
  }

  /* -----------------------------------------------------------
     7. BACK TO TOP BUTTON
     ----------------------------------------------------------- */
  var backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -----------------------------------------------------------
     8. DYNAMIC CURRENT YEAR IN FOOTER
     ----------------------------------------------------------- */
  var yearEls = document.querySelectorAll('#currentYear');
  var thisYear = new Date().getFullYear();
  yearEls.forEach(function (el) { el.textContent = thisYear; });

  /* -----------------------------------------------------------
     9. HEADER BACKGROUND ON SCROLL (subtle)
     ----------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        header.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }

});
