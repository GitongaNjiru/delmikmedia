/**
 * DELMIK MEDIA - Interactive Frontend Logic
 * Modern Vanilla JavaScript for Video Modal, Portfolio Filters, Production Calculator & Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initVideoModal();
  initPortfolioFilters();
  initCostCalculator();
  initFaqAccordion();
  initContactForm();
  initBackToTop();
});

/* ==========================================================================
   1. Sticky Header & Active Navigation Spy
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header blur and height change
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy for Nav links
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   2. Mobile Hamburger Drawer
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const isOpen = navLinks.classList.contains('mobile-open');
    toggleBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   3. Native Video Modal Lightbox
   ========================================================================== */
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const modalTitle = document.getElementById('modalVideoTitle');
  const videoFrame = document.getElementById('modalVideoFrame');
  const modalDirectLink = document.getElementById('modalDirectLink');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!modal || !videoFrame) return;

  // Open modal triggers
  document.querySelectorAll('[data-video-id]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const videoId = trigger.getAttribute('data-video-id');
      const title = trigger.getAttribute('data-video-title') || 'Delmik Media Production';
      
      openVideo(videoId, title);
    });
  });

  function openVideo(videoId, title) {
    modalTitle.textContent = title;
    
    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    if (modalDirectLink) modalDirectLink.href = ytUrl;
    const modalHeaderYtBtn = document.getElementById('modalHeaderYtBtn');
    if (modalHeaderYtBtn) modalHeaderYtBtn.href = ytUrl;

    // If opened directly from file:// (which YouTube blocks with Error 153), open video directly
    if (window.location.protocol === 'file:') {
      window.open(ytUrl, '_blank');
      return;
    }

    // Use standard www.youtube.com embed with origin and inline playback
    let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;
    if (window.location.protocol.startsWith('http')) {
      embedUrl += `&origin=${encodeURIComponent(window.location.origin)}`;
    }

    videoFrame.src = embedUrl;
    modal.showModal();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    videoFrame.src = ''; // stop playback
    modal.close();
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click (Light Dismiss)
  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeModal();
    }
  });

  // Handle ESC key
  modal.addEventListener('cancel', () => {
    videoFrame.src = '';
    document.body.style.overflow = '';
  });
}

/* ==========================================================================
   4. Filterable Portfolio
   ========================================================================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      workCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. Interactive Production Cost Estimator / Calculator
   ========================================================================== */
function initCostCalculator() {
  const calcForm = document.getElementById('productionCalcForm');
  if (!calcForm) return;

  const basePrices = {
    tvc: { name: 'Commercial & TV Adverts (TVC)', kes: 95000, usd: 750 },
    film: { name: 'Film & Cinema Drama', kes: 180000, usd: 1400 },
    event: { name: 'Corporate & VIP Event Coverage', kes: 65000, usd: 500 },
    stream: { name: 'Multi-Cam Live Broadcast', kes: 80000, usd: 620 },
    wedding: { name: 'Luxury Wedding Cinema', kes: 120000, usd: 930 },
    music: { name: 'Music Video Production', kes: 110000, usd: 850 },
    pa: { name: 'PA Sound System Hire', kes: 35000, usd: 270 }
  };

  const crewMultipliers = {
    standard: { label: 'Essential Crew (2-3 Pros)', mult: 1.0 },
    pro: { label: 'Cinematic Pro Crew (4-6 Pros)', mult: 1.45 },
    cinema: { label: 'Full Cinema & Broadcast Unit (7+ Crew)', mult: 1.9 }
  };

  const durationMultipliers = {
    half: { label: 'Half Day Shoot (up to 5 hrs)', mult: 0.75 },
    full: { label: 'Full Day Shoot (up to 10 hrs)', mult: 1.0 },
    twoday: { label: '2-Day Production Shoot', mult: 1.85 },
    threeday: { label: '3-Day Production Shoot', mult: 2.65 }
  };

  const addOnPrices = {
    drone: { name: '4K Drone Aerial Cinematography', kes: 25000, usd: 195 },
    teaser: { name: '24-Hour Express Social Teaser', kes: 15000, usd: 115 },
    sound: { name: 'High-Output PA & Sound System', kes: 30000, usd: 230 },
    raw: { name: 'SSD Master Drive & Raw Archive', kes: 12000, usd: 90 }
  };

  function updateCalculator() {
    const serviceRadio = calcForm.querySelector('input[name="service_type"]:checked');
    const crewRadio = calcForm.querySelector('input[name="crew_tier"]:checked');
    const durationRadio = calcForm.querySelector('input[name="duration"]:checked');
    const addonCheckboxes = calcForm.querySelectorAll('input[name="addons"]:checked');

    const serviceKey = serviceRadio ? serviceRadio.value : 'tvc';
    const crewKey = crewRadio ? crewRadio.value : 'standard';
    const durationKey = durationRadio ? durationRadio.value : 'full';

    const service = basePrices[serviceKey] || basePrices.tvc;
    const crew = crewMultipliers[crewKey] || crewMultipliers.standard;
    const duration = durationMultipliers[durationKey] || durationMultipliers.full;

    let totalKes = service.kes * crew.mult * duration.mult;
    let totalUsd = service.usd * crew.mult * duration.mult;

    const selectedAddons = [];
    addonCheckboxes.forEach(cb => {
      const addon = addOnPrices[cb.value];
      if (addon) {
        totalKes += addon.kes;
        totalUsd += addon.usd;
        selectedAddons.push(addon.name);
      }
    });

    // Rounding
    totalKes = Math.round(totalKes / 1000) * 1000;
    totalUsd = Math.round(totalUsd / 10) * 10;

    // DOM Updates
    document.getElementById('summaryService').textContent = service.name;
    document.getElementById('summaryCrew').textContent = crew.label;
    document.getElementById('summaryDuration').textContent = duration.label;
    document.getElementById('summaryAddons').textContent = selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None selected';

    document.getElementById('displayKes').textContent = `KES ${totalKes.toLocaleString()}`;
    document.getElementById('displayUsd').textContent = `approx. $${totalUsd.toLocaleString()} USD`;

    // Update WhatsApp pre-filled link
    const waText = encodeURIComponent(
      `Hello Delmik Media!\nI generated a production estimate on your website:\n` +
      `• Project Type: ${service.name}\n` +
      `• Crew & Camera: ${crew.label}\n` +
      `• Shoot Duration: ${duration.label}\n` +
      `• Add-ons: ${selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None'}\n` +
      `• Estimated Budget: KES ${totalKes.toLocaleString()} ($${totalUsd.toLocaleString()} USD)\n\n` +
      `I would love to discuss dates and booking availability.`
    );
    const waBtn = document.getElementById('calcWhatsAppBtn');
    if (waBtn) {
      waBtn.href = `https://wa.me/254712150444?text=${waText}`;
    }

    // Update Mailto link
    const mailBtn = document.getElementById('calcEmailBtn');
    if (mailBtn) {
      const mailSubject = encodeURIComponent(`Production Quote Request - ${service.name}`);
      const mailBody = encodeURIComponent(
        `Dear Delmik Media,\n\nI would like to inquire about booking the following production package:\n\n` +
        `• Service: ${service.name}\n` +
        `• Crew Tier: ${crew.label}\n` +
        `• Duration: ${duration.label}\n` +
        `• Add-ons: ${selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None'}\n` +
        `• Estimated Total: KES ${totalKes.toLocaleString()}\n\n` +
        `Please contact me back with available dates and details.\n\nThank you!`
      );
      mailBtn.href = `mailto:delmikmedia@gmail.com?subject=${mailSubject}&body=${mailBody}`;
    }
  }

  calcForm.addEventListener('change', updateCalculator);
  updateCalculator();
}

/* ==========================================================================
   6. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   7. Contact Form Direct Booking Handler
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('mainContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = form.querySelector('[name="client_name"]').value.trim();
    const email = form.querySelector('[name="client_email"]').value.trim();
    const phone = form.querySelector('[name="client_phone"]').value.trim();
    const service = form.querySelector('[name="project_type"]').value;
    const message = form.querySelector('[name="project_desc"]').value.trim();

    if (!name || !email || !message) {
      alert('Please fill out all required fields (Name, Email, and Project Description).');
      return;
    }

    // Create WhatsApp or Mailto redirect
    const confirmChoice = confirm(
      `Thank you, ${name}!\nWould you like to send this inquiry directly via WhatsApp for instant response?\n\nClick 'OK' for WhatsApp, or 'Cancel' to send via Email.`
    );

    if (confirmChoice) {
      const waMsg = encodeURIComponent(
        `Hello Delmik Media!\n\nNew Production Inquiry from Website:\n` +
        `• Name: ${name}\n` +
        `• Email: ${email}\n` +
        `• Phone: ${phone || 'N/A'}\n` +
        `• Service Needed: ${service}\n` +
        `• Project Brief: ${message}`
      );
      window.open(`https://wa.me/254712150444?text=${waMsg}`, '_blank');
    } else {
      const subject = encodeURIComponent(`New Production Inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nProject Brief:\n${message}`
      );
      window.location.href = `mailto:delmikmedia@gmail.com?subject=${subject}&body=${body}`;
    }

    form.reset();
  });
}

/* ==========================================================================
   8. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
