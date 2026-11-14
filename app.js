/**
 * KrishiUrja Biorefinery Platform
 * Vanilla JavaScript (No Frameworks)
 * Implements navigation active state tracking, spatial awareness indicator,
 * accessible mobile navigation drawer, and interactive simulation models.
 */

// =========================================================================
// EXTERNAL API CREDENTIALS & SCAFFOLDING
// =========================================================================
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';

// Firebase Authentication Scaffolding & Configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_KEY",
  authDomain: "krishiurja-biorefinery.firebaseapp.com",
  projectId: "krishiurja-biorefinery",
  storageBucket: "krishiurja-biorefinery.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Global callback bridge for asynchronous Google Maps API loading
window.initMap = function() {
  if (typeof window.triggerInitMap === 'function') {
    window.triggerInitMap();
  } else {
    window.mapsApiLoaded = true;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Initialization lifecycle flag to avoid Temporal Dead Zone (TDZ) ReferenceErrors
  // during initial page-load localization before downstream components are defined
  let isAppInitialized = false;

  // =========================================================================
  // 1. Persistent Navigation & Animated Bottom Border (Active Indicator)
  // =========================================================================
  const siteHeader = document.getElementById('site-header');
  const navLinksContainer = document.getElementById('nav-links');
  const navIndicator = document.getElementById('nav-indicator');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  /**
   * Recalculate and smoothly reposition the active indicator bar.
   * Gives users instant spatial awareness of where they are in the application.
   */
  function updateNavIndicator(activeEl) {
    if (!navIndicator || !navLinksContainer || !activeEl) return;

    // Check if desktop nav is visible
    if (window.getComputedStyle(navLinksContainer).display === 'none') {
      navIndicator.style.opacity = '0';
      return;
    }

    const containerRect = navLinksContainer.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    const left = activeRect.left - containerRect.left;
    const width = activeRect.width;

    navIndicator.style.left = `${left}px`;
    navIndicator.style.width = `${width}px`;
    navIndicator.style.opacity = '1';
  }

  /**
   * Set active link state and update indicator position
   */
  function setActiveLink(sectionId) {
    let matchedDesktopLink = null;

    // Update desktop links
    navLinks.forEach(link => {
      const targetId = link.getAttribute('data-section');
      if (targetId === sectionId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        matchedDesktopLink = link;
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Update mobile links
    mobileNavLinks.forEach(link => {
      const targetId = link.getAttribute('data-section');
      if (targetId === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (matchedDesktopLink) {
      updateNavIndicator(matchedDesktopLink);
    }
  }

  // Smooth scroll handler for nav anchors
  function handleNavClick(e, link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        const headerOffset = siteHeader ? siteHeader.offsetHeight + 10 : 80;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });

        const sectionId = link.getAttribute('data-section');
        if (sectionId) {
          setActiveLink(sectionId);
        }

        // Close mobile drawer if open
        closeMobileNav();
      }
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => handleNavClick(e, link));

    // Optional hover preview for fluid feedback
    link.addEventListener('mouseenter', () => {
      updateNavIndicator(link);
    });
  });

  navLinksContainer?.addEventListener('mouseleave', () => {
    const currentActive = document.querySelector('.nav-link.active');
    if (currentActive) {
      updateNavIndicator(currentActive);
    }
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => handleNavClick(e, link));
  });

  // Mobile Drawer Toggle
  function openMobileNav() {
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.classList.add('open');
  }

  function closeMobileNav() {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.classList.remove('open');
  }

  mobileToggle?.addEventListener('click', () => {
    const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileNav && mobileToggle && !mobileNav.contains(e.target) && !mobileToggle.contains(e.target)) {
      closeMobileNav();
    }
  });

  // =========================================================================
  // 1.1 Vanilla JavaScript Localization (i18n) Engine
  // =========================================================================
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const mobileLangToggleBtn = document.getElementById('mobile-lang-toggle-btn');
  const langText = document.getElementById('lang-text');
  const mobileLangLabel = document.getElementById('mobile-lang-label');

  let currentLang = 'en';
  let activeRegionalProfile = null;
  let activeWasteId = null;
  let activeFeedstockType = 'paddy';

  /**
   * Translates all child elements in a dynamically injected container
   * @param {HTMLElement} container 
   */
  function translateDynamicContainer(container) {
    if (!container) return;
    const dict = (typeof translations !== 'undefined') ? translations : (window.translations || null);
    if (!dict || !dict[currentLang]) return;

    const elements = container.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[currentLang][key]) {
        el.textContent = dict[currentLang][key];
      }
    });
  }

  /**
   * Set application language and translate all DOM elements with data-i18n attribute
   * @param {string} lang - 'en' or 'hi'
   * @param {boolean} notifyUser - whether to trigger a toast message
   */
  function setLanguage(lang, notifyUser = false) {
    const dict = (typeof translations !== 'undefined') ? translations : (window.translations || null);
    if (!dict || !dict[lang]) {
      console.warn(`[i18n] Translation dictionary not available for language: ${lang}`);
      return;
    }

    currentLang = lang;
    document.documentElement.lang = lang;

    // Loop through all DOM elements with data-i18n
    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[lang][key]) {
        el.textContent = dict[lang][key];
      }
    });

    // Update Language Toggle Button Displays
    const buttonText = lang === 'hi' ? 'हिन्दी / English' : 'English / हिन्दी';
    if (langText) langText.textContent = buttonText;
    if (mobileLangLabel) mobileLangLabel.textContent = buttonText;

    if (langToggleBtn) {
      langToggleBtn.setAttribute('aria-label', lang === 'hi' ? 'Switch to English' : 'Switch to Hindi / हिन्दी में बदलें');
      langToggleBtn.classList.toggle('lang-active-hi', lang === 'hi');
    }
    if (mobileLangToggleBtn) {
      mobileLangToggleBtn.setAttribute('aria-label', lang === 'hi' ? 'Switch to English' : 'Switch to Hindi / हिन्दी में बदलें');
      mobileLangToggleBtn.classList.toggle('lang-active-hi', lang === 'hi');
    }

    // Persist user preference across reloads
    try {
      localStorage.setItem('krishiurja_lang', lang);
    } catch (err) {
      // Storage might be restricted
    }

    // Update active dynamic panels so they reflect new language instantly.
    // Guarded by isAppInitialized to prevent Temporal Dead Zone (TDZ) ReferenceErrors on page load.
    if (isAppInitialized) {
      try {
        if (typeof updateChartsLanguage === 'function') {
          updateChartsLanguage(lang);
        }
      } catch (e) {
        console.warn('[i18n] Error updating charts language:', e);
      }

      try {
        if (activeRegionalProfile && typeof renderRegionalProfile === 'function') {
          renderRegionalProfile(activeRegionalProfile);
        }
      } catch (e) {
        console.warn('[i18n] Error updating regional profile:', e);
      }

      try {
        if (activeWasteId && typeof renderWasteAnalysis === 'function') {
          renderWasteAnalysis(activeWasteId, false);
        }
      } catch (e) {
        console.warn('[i18n] Error updating waste analysis:', e);
      }

      try {
        if (typeof updateHeroFeedstockLanguage === 'function') {
          updateHeroFeedstockLanguage();
        }
      } catch (e) {
        console.warn('[i18n] Error updating hero feedstock language:', e);
      }

      try {
        if (typeof updateWeatherAdvisoryLanguage === 'function') {
          updateWeatherAdvisoryLanguage();
        }
      } catch (e) {
        console.warn('[i18n] Error updating weather advisory language:', e);
      }

      try {
        const roiMassiveSavings = document.getElementById('roi-massive-savings');
        if (roiMassiveSavings && typeof calculateFarmerROI === 'function') {
          calculateFarmerROI(null);
        }
      } catch (e) {
        console.warn('[i18n] Error updating ROI calculation:', e);
      }

      try {
        if (typeof calculateFormulation === 'function') {
          calculateFormulation();
        }
      } catch (e) {
        console.warn('[i18n] Error updating formulation:', e);
      }

      try {
        if (typeof renderFMEATable === 'function') {
          renderFMEATable();
        }
      } catch (e) {
        console.warn('[i18n] Error updating FMEA table:', e);
      }

      try {
        if (typeof renderFCOChecklist === 'function') {
          renderFCOChecklist();
        }
      } catch (e) {
        console.warn('[i18n] Error updating FCO checklist:', e);
      }
    }

    // Recompute the animated active indicator for spatial awareness since nav text width changes
    const activeDesktopNav = document.querySelector('.nav-link.active');
    if (activeDesktopNav) {
      setTimeout(() => updateNavIndicator(activeDesktopNav), 50);
    }

    if (notifyUser && typeof showToast === 'function') {
      showToast(lang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है।' : 'Language changed to English.');
    }
  }

  function handleLanguageToggle() {
    const targetLang = currentLang === 'en' ? 'hi' : 'en';
    setLanguage(targetLang, true);
  }

  langToggleBtn?.addEventListener('click', handleLanguageToggle);
  mobileLangToggleBtn?.addEventListener('click', handleLanguageToggle);

  // Initialize language from localStorage or default to 'en'
  let initialLang = 'en';
  try {
    const saved = localStorage.getItem('krishiurja_lang');
    if (saved === 'en' || saved === 'hi') {
      initialLang = saved;
    }
  } catch (err) {
    initialLang = 'en';
  }
  setLanguage(initialLang, false);

  // =========================================================================
  // 2. Scrollspy with IntersectionObserver for Continuous Spatial Awareness
  // =========================================================================
  const trackedSections = [
    document.getElementById('baseline-mapping'),
    document.getElementById('formulation'),
    document.getElementById('tealca-dashboard'),
    document.getElementById('compliance')
  ].filter(Boolean);

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        setActiveLink(id);
      }
    });
  }, observerOptions);

  trackedSections.forEach(section => sectionObserver.observe(section));

  // Window scroll & resize listeners
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.nav-link.active');
    if (currentActive) {
      updateNavIndicator(currentActive);
    }
  });

  // Initial indicator placement
  setTimeout(() => {
    const initialActive = document.querySelector('.nav-link.active') || navLinks[0];
    if (initialActive) {
      updateNavIndicator(initialActive);
    }
  }, 100);

  // =========================================================================
  // 3. Hero Feedstock Simulator Interactivity
  // =========================================================================
  const feedstockData = {
    paddy: {
      stage1Name: "Briquetting & Densification",
      stage1Name_hi: "ब्रिकेटिंग एवं घनीकरण",
      stage1Val: "Moisture: 12% | Bulk: 620 kg/m³",
      stage1Val_hi: "नमी: 12% | घनत्व: 620 किग्रा/घन मीटर",
      stage2Name: "Catalytic Torrefaction",
      stage2Name_hi: "उत्प्रेरक टॉरिफैक्शन",
      stage2Val: "450°C Oxygen-Starved Reactor",
      stage2Val_hi: "450°C ऑक्सीजन-रहित रिएक्टर",
      stage3Name: "Bio-Fortified Granulation",
      stage3Name_hi: "जैव-संवर्धित दानेदारण",
      stage3Val: "N-P-K Inoculation + Humic Acid",
      stage3Val_hi: "एन-पी-के टीका + ह्यूमिक एसिड",
      yieldFertilizer: "540 kg / MT",
      yieldEnergy: "145 m³ / MT",
      yieldCarbon: "> 45 Years"
    },
    bagasse: {
      stage1Name: "Rotary Drum De-watering",
      stage1Name_hi: "रोटरी ड्रम डी-वाटरिंग",
      stage1Val: "Moisture: 10% | Bulk: 540 kg/m³",
      stage1Val_hi: "नमी: 10% | घनत्व: 540 किग्रा/घन मीटर",
      stage2Name: "Slow Fast-Pyrolysis Kiln",
      stage2Name_hi: "पायरोलिसिस भट्ठा",
      stage2Val: "520°C Thermal Decomposition",
      stage2Val_hi: "520°C थर्मल अपघटन",
      stage3Name: "Potassium Enrich Pelleting",
      stage3Name_hi: "पोटेशियम संवर्धित पेलेटिंग",
      stage3Val: "Microbial Consortium + Biochar",
      stage3Val_hi: "माइक्रोबियल कंसोर्टियम + बायोचार",
      yieldFertilizer: "590 kg / MT",
      yieldEnergy: "180 m³ / MT",
      yieldCarbon: "> 60 Years"
    },
    cotton: {
      stage1Name: "Hammer-Mill Shredding",
      stage1Name_hi: "हैमर-मिल कतरन",
      stage1Val: "Particle Size: < 6mm | Moisture: 11%",
      stage1Val_hi: "कण आकार: < 6मिमी | नमी: 11%",
      stage2Name: "Carbonization Retort",
      stage2Name_hi: "कार्बोनाइजेशन रिटॉर्ट",
      stage2Val: "480°C High-Lignin Fixation",
      stage2Val_hi: "480°C उच्च-लिग्निन स्थिरीकरण",
      stage3Name: "Liquid Mineral Impregnation",
      stage3Name_hi: "तरल खनिज गर्भाधान",
      stage3Val: "Phosphorus + Mycorrhizae",
      stage3Val_hi: "फॉस्फोरस + माइकोराइजा",
      yieldFertilizer: "480 kg / MT",
      yieldEnergy: "160 m³ / MT",
      yieldCarbon: "> 55 Years"
    },
    mustard: {
      stage1Name: "Pneumatic Sieving & Milling",
      stage1Name_hi: "वायवीय छनाई एवं मिलिंग",
      stage1Val: "Moisture: 9% | Bulk: 580 kg/m³",
      stage1Val_hi: "नमी: 9% | घनत्व: 580 किग्रा/घन मीटर",
      stage2Name: "Autothermal Pyrolysis",
      stage2Name_hi: "ऑटोधर्मल पायरोलिसिस",
      stage2Val: "440°C Low-Emission Kiln",
      stage2Val_hi: "440°C कम उत्सर्जन भट्ठा",
      stage3Name: "Sulfur-Organic Blending",
      stage3Name_hi: "सल्फर-जैविक सम्मिश्रण",
      stage3Val: "High Sulfur Natural Humus",
      stage3Val_hi: "उच्च सल्फर प्राकृतिक ह्यूमस",
      yieldFertilizer: "520 kg / MT",
      yieldEnergy: "130 m³ / MT",
      yieldCarbon: "> 40 Years"
    }
  };

  const feedstockChips = document.querySelectorAll('.feedstock-chip');
  const stage1NameEl = document.getElementById('stage1-name');
  const stage1ValEl = document.getElementById('stage1-val');
  const stage2NameEl = document.getElementById('stage2-name');
  const stage2ValEl = document.getElementById('stage2-val');
  const stage3NameEl = document.getElementById('stage3-name');
  const stage3ValEl = document.getElementById('stage3-val');
  const yieldFertilizerEl = document.getElementById('yield-fertilizer');
  const yieldEnergyEl = document.getElementById('yield-energy');
  const yieldCarbonEl = document.getElementById('yield-carbon');

  function updateHeroFeedstockLanguage() {
    const data = feedstockData[activeFeedstockType];
    if (!data) return;
    const isHi = (currentLang === 'hi');
    if (stage1NameEl) stage1NameEl.textContent = isHi ? data.stage1Name_hi : data.stage1Name;
    if (stage1ValEl) stage1ValEl.textContent = isHi ? data.stage1Val_hi : data.stage1Val;
    if (stage2NameEl) stage2NameEl.textContent = isHi ? data.stage2Name_hi : data.stage2Name;
    if (stage2ValEl) stage2ValEl.textContent = isHi ? data.stage2Val_hi : data.stage2Val;
    if (stage3NameEl) stage3NameEl.textContent = isHi ? data.stage3Name_hi : data.stage3Name;
    if (stage3ValEl) stage3ValEl.textContent = isHi ? data.stage3Val_hi : data.stage3Val;
    if (yieldFertilizerEl) yieldFertilizerEl.textContent = data.yieldFertilizer;
    if (yieldEnergyEl) yieldEnergyEl.textContent = data.yieldEnergy;
    if (yieldCarbonEl) yieldCarbonEl.textContent = isHi ? (data.yieldCarbon.replace('Years', 'वर्ष')) : data.yieldCarbon;
  }

  feedstockChips.forEach(chip => {
    chip.addEventListener('click', () => {
      feedstockChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');

      const type = chip.getAttribute('data-feedstock');
      activeFeedstockType = type;
      updateHeroFeedstockLanguage();

      const chipLabel = chip.querySelector('.chip-label')?.textContent || '';
      showToast(currentLang === 'hi' ? `${chipLabel} के प्रक्रिया पैरामीटर लोड किए गए` : `Loaded process parameters for ${chipLabel}`);
    });
  });

  // =========================================================================
  // 4. Module 01: Baseline Mapping & Tech Selection Interactive Engine
  // =========================================================================
  const farmWasteData = [
    {
      id: "rice-husk",
      name: "Rice Husk & Paddy Straw",
      localName: "Parali / Dhan Pual (Indo-Gangetic Plains)",
      icon: "🌾",
      category: "Crop Residue",
      cnRatio: "85:1",
      cnValue: 85,
      cnRange: "80:1 to 100:1",
      moistureContent: "12% (In-field dried)",
      optimalTechnology: "Biochar Pyrolysis",
      technologySub: "Continuous Autothermal Retort Kiln (450°C – 550°C)",
      primaryOutput: "High-Porosity Soil Biochar & Fuel Syngas",
      whySelected: "Paddy straw and rice husk possess an exceptionally high carbon-to-nitrogen ratio (85:1) compounded by high crystalline silica (>12%) and stubborn recalcitrant lignin. In biological systems like anaerobic digestion or standard composting, microbes are severely starved of nitrogen, resulting in biological stall and volatile organic acid acidification. Thermochemical pyrolysis cleanly bypasses microbial digestion bottlenecks, converting 100% of the lignocellulose into permanent, porous aromatic biochar with a 100+ year carbon sequestration half-life in Indian agricultural soils.",
      pros: [
        "Directly eliminates open-field stubble burning (Parali) across Punjab, Haryana, and Western UP, alleviating severe winter smog.",
        "Generates stable biochar that enhances sandy loam soil water-holding capacity by up to 35% and prevents fertilizer leaching.",
        "Co-produces combustible syngas (145 m³/MT) to self-power the refinery and export thermal energy to village mills."
      ],
      cons: [
        "Requires mechanical collection, baling, and localized densification due to low infield bulk density (40–60 kg/m³).",
        "Higher upfront machinery CAPEX for pyrolysis retort chambers and gas scrubbers compared to simple compost heaps."
      ],
      agronomicRecommendation: "Best formulated with cow slurry or poultry manure in Module 02 to introduce active microbiological colonies into the biochar matrix."
    },
    {
      id: "sugarcane-bagasse",
      name: "Sugarcane Bagasse",
      localName: "Ganna Khali / Mill Bagas (Sugar Belts)",
      icon: "🎋",
      category: "Agro-Industrial Residue",
      cnRatio: "120:1",
      cnValue: 120,
      cnRange: "110:1 to 130:1",
      moistureContent: "48% (Mill gate fresh)",
      optimalTechnology: "Biochar Pyrolysis",
      technologySub: "Fluidized-Bed Torrefaction Reactor (500°C)",
      primaryOutput: "Potassium-Rich Biochar Pellets & Process Steam",
      whySelected: "With an extreme C:N ratio exceeding 110:1 and tough fibrous bagasse structure, this substrate lacks the basic nitrogen required for biological microflora proliferation. Aerobic composting would take over 8 months and consume excessive water. Pyrolysis locks the carbon into a high-surface-area (>300 m²/g) organo-mineral matrix, preserving valuable intrinsic potassium and trace minerals while generating process steam for co-located sugar refineries.",
      pros: [
        "Readily centralized in huge volumes at Indian sugar mills without requiring decentralized field baling logistics.",
        "Produces porous, alkali-buffering biochar that rapidly rehabilitates acidic, over-cultivated cane ratoon soils.",
        "Provides internal thermal energy self-sufficiency by utilizing flue gases to dry incoming wet bagasse."
      ],
      cons: [
        "Incoming mill bagasse has ~48% moisture, requiring waste-heat flue gas drying before entering the pyrolysis furnace.",
        "Seasonal crushing calendar (November to March) mandates weather-proof dry storage for year-round plant operation."
      ],
      agronomicRecommendation: "High natural potassium makes it an exceptional DAP replacement when enriched with mineral rock phosphate."
    },
    {
      id: "cow-dung",
      name: "Cow Dung (Gobar Slurry)",
      localName: "Pashu Gobar & Dairy Slurry",
      icon: "🐄",
      category: "Dairy Livestock Byproduct",
      cnRatio: "23:1",
      cnValue: 23,
      cnRange: "20:1 to 25:1",
      moistureContent: "82% (Fresh slurry)",
      optimalTechnology: "Anaerobic Digestion",
      technologySub: "High-Rate Continuous Stirred-Tank Reactor (CSTR)",
      primaryOutput: "Compressed Bio-Gas (CBG) & Fermented Organic Manure",
      whySelected: "Cow dung exhibits the stoichiometric golden standard C:N ratio (20:1 to 25:1) and ideal natural moisture (>80%) required by methanogenic archaea. The carbon supplies metabolic energy while the nitrogen provides cellular amino acids for active microbial proliferation. This produces rapid volatile solids destruction, maximum biomethane yields (55%–65% CH₄), and rich fermented organic manure matching FCO Schedule IV specifications.",
      pros: [
        "Produces commercial-grade Compressed Bio-Gas (CBG) under the Indian SATAT initiative with guaranteed public OMC purchase.",
        "Delivers odor-free, pathogen-free Fermented Organic Manure (FOM) with high organic carbon (>16%) and viable beneficial bacteria.",
        "Continuous year-round daily production from rural dairy farmers and village Gaushalas creating steady daily income."
      ],
      cons: [
        "Substantial water footprint and hydraulic loading requiring dedicated liquid digestate effluent treatment.",
        "Requires strict hermetic anaerobic seal to prevent atmospheric fugitive methane emissions."
      ],
      agronomicRecommendation: "Solid digestate cake provides the primary microbial inoculum and humus base for the Formulation Engine."
    },
    {
      id: "poultry-litter",
      name: "Poultry Litter & Manure",
      localName: "Murgi Khad & Broiler Droppings",
      icon: "🐓",
      category: "Commercial Poultry Manure",
      cnRatio: "10:1",
      cnValue: 10,
      cnRange: "9:1 to 12:1",
      moistureContent: "28% (Deep litter)",
      optimalTechnology: "Anaerobic Digestion",
      technologySub: "Co-Digestion CSTR with High-Carbon Agro-Straw",
      primaryOutput: "High-Nitrogen Biofertilizer & Methane Boost",
      whySelected: "Poultry litter is exceptionally dense in organic nitrogen and uric acid, yielding an ultra-low C:N ratio (10:1). When treated alone, excess nitrogen causes lethal free ammonia (FAN) accumulation that severely inhibits methanogens. However, when paired with high-carbon rice straw or bagasse in a co-digestion regime, it delivers the ideal stoichiometric C:N balance (25:1), accelerating biomethane production by over 40% while capturing vital phosphorus and nitrogen into organic manure.",
      pros: [
        "Highest natural N-P-K concentration (3.8% N, 2.5% P₂O₅, 2.0% K₂O) among all Indian agricultural organic waste streams.",
        "Thermophilic anaerobic digestion temperatures kill harmful avian pathogens (Salmonella, E. coli) within 72 hours.",
        "Prevents severe groundwater nitrate contamination and noxious ammonia air emissions common to raw poultry storage."
      ],
      cons: [
        "Cannot be digested as a mono-substrate; strictly requires high-carbon balancing co-substrates (e.g., paddy straw).",
        "Corrosive ammonia vapors require stainless steel fittings and gas desulfurization bio-scrubbers."
      ],
      agronomicRecommendation: "Acts as the premium natural nitrogen booster in Module 02, replacing synthetic chemical urea."
    },
    {
      id: "cotton-stalks",
      name: "Cotton Crop Stalks",
      localName: "Kapas Lakdi & Stems (Vidarbha & Gujarat)",
      icon: "🌱",
      category: "Woody Crop Residue",
      cnRatio: "72:1",
      cnValue: 72,
      cnRange: "65:1 to 75:1",
      moistureContent: "14% (Seasoned stalks)",
      optimalTechnology: "Biochar Pyrolysis",
      technologySub: "High-Temperature Fixed-Bed Carbonization Kiln (550°C)",
      primaryOutput: "Structured Macro-Porous Biochar & Wood Vinegar",
      whySelected: "Cotton stalks consist of hard, dense, highly lignified woody cellulose with an average C:N ratio of 72:1. In typical field conditions, microbial enzymes require up to two years to degrade hard cotton stems. Thermochemical pyrolysis rapidly carbonizes the stalks in under 30 minutes, producing highly structured, alkaline macro-porous biochar while eliminating dormant pink bollworm pest larvae that hibernate inside leftover stems.",
      pros: [
        "Interrupts the biological life cycle of pink bollworm pests without expensive and harmful chemical insecticides.",
        "Produces dense, highly stable biochar with exceptional cation-exchange capacity and long-term soil structure aeration.",
        "Co-produces condensed pyroligneous acid (wood vinegar), a potent natural organic biopesticide and soil conditioner."
      ],
      cons: [
        "Requires tractor-mounted pullers and shredders to manage tough woody roots and branches prior to feeding.",
        "Higher wear rate on primary cutting blades due to abrasive silica and tough plant fibers."
      ],
      agronomicRecommendation: "Alkaline biochar matrix (pH 8.8) is the premier remedy for neutralizing acidic soils in cotton-growing belts."
    },
    {
      id: "mandi-greens",
      name: "Vegetable & Mandi Greens",
      localName: "Sabzi Mandi Kooda & Fruit Residue",
      icon: "🥬",
      category: "Market Surplus & Organic Waste",
      cnRatio: "24:1",
      cnValue: 24,
      cnRange: "20:1 to 28:1",
      moistureContent: "78% (Fresh market cull)",
      optimalTechnology: "Vermicomposting",
      technologySub: "Tiered Continuous Flow-Through Vermireactor",
      primaryOutput: "Enzyme-Rich Vermicast & Liquid Humic Extract",
      whySelected: "Soft green vegetable leaves, vegetable trimmings, and culled mandi market surpluses are characterized by non-lignified, succulent plant tissue with a mild C:N ratio (24:1) and high moisture. This soft organic texture is the natural feeding substrate for epigeic composting earthworms (Eisenia fetida and Eudrilus eugeniae). The worms and their gut microflora rapidly transform the greens into granular, enzyme-rich vermicompost teeming with plant-growth hormones without demanding external fossil or electrical energy.",
      pros: [
        "Extremely low capital cost (CAPEX) and near-zero electrical requirement; suited for decentralized village clusters.",
        "Yields vermicast rich in plant growth regulators (auxins, cytokinins, gibberellins) and bio-available humic acids.",
        "Rapidly diverts perishable organic waste from municipal open landfills and APMC market yards, preventing leachate formation."
      ],
      cons: [
        "Vulnerable to extreme ambient heat (>38°C) during North Indian summers, requiring shaded thatched structures and moisture misting.",
        "Lower processing throughput rate per square meter compared to continuous industrial pyrolysis kilns."
      ],
      agronomicRecommendation: "Ideal high-value nursery soil amendment, bio-stimulant for horticultural crops, and seedling booster."
    }
  ];

  // Tech Selection Engine DOM elements
  const wasteCardButtons = Array.from(document.querySelectorAll('.waste-card-btn'));
  const techAnalysisPanel = document.getElementById('tech-analysis-panel');
  const analysisEmptyState = document.getElementById('analysis-empty-state');
  const analysisDynamicContent = document.getElementById('analysis-dynamic-content');

  const wasteHindiMap = {
    "rice-husk": {
      name: "चावल की भूसी एवं धान पराली",
      category: "फसल अवशेष",
      optimalTechnology: "बायोचार पायरोलिसिस",
      technologySub: "कंटीन्यूअस ऑटोधर्मल रिटॉर्ट भट्ठा (450°C – 550°C)",
      primaryOutput: "उच्च-छिद्रयुक्त मृदा बायोचार एवं ईंधन सिनगैस",
      whySelected: "धान के पुआल और चावल की भूसी में अत्यधिक उच्च कार्बन-से-नाइट्रोजन अनुपात (85:1) के साथ 12% से अधिक क्रिस्टलीय सिलिका और लिग्निन होता है। अवायवीय पाचन या सामान्य खाद में नाइट्रोजन की कमी के कारण जैविक क्रिया रुक जाती है। थर्मोकेमिकल पायरोलिसिस इस बाधा को पार कर 100% लिग्नोसेल्यूलोज को भारतीय कृषि मिट्टी में 100+ वर्षों तक कार्बन को बांधने वाले छिद्रयुक्त बायोचार में बदल देता है।",
      pros: [
        "पंजाब, हरियाणा और पश्चिमी उत्तर प्रदेश में पराली जलाने की समस्या को सीधे समाप्त करता है।",
        "रेतीली दोमट मिट्टी की जल धारण क्षमता को 35% तक बढ़ाता है और पोषक तत्वों के रिसाव को रोकता है।",
        "दहनशील सिनगैस (145 m³/MT) का सह-उत्पादन करता है जो संयंत्र को आत्मनिर्भर बनाता है।"
      ],
      cons: [
        "कम घनत्व (40-60 kg/m³) के कारण यांत्रिक संग्रह और बेलिंग की आवश्यकता होती है।",
        "सरल खाद गड्ढों की तुलना में पायरोलिसिस रिटॉर्ट कक्षों के लिए उच्च अग्रिम पूंजीगत व्यय (CAPEX)।"
      ],
      agronomicRecommendation: "सक्रिय सूक्ष्मजीवी कॉलोनियों को बायोचार में स्थापित करने के लिए मॉड्यूल 02 में गोबर घोल या पोल्ट्री खाद के साथ मिलाना सर्वोत्तम है।"
    },
    "sugarcane-bagasse": {
      name: "गन्ना खोई (बगास)",
      category: "कृषि-औद्योगिक अवशेष",
      optimalTechnology: "बायोचार पायरोलिसिस",
      technologySub: "फ्लूइडाइज्ड-बेड टॉरिफैक्शन रिएक्टर (500°C)",
      primaryOutput: "पोटेशियम-समृद्ध बायोचार छर्रे एवं प्रक्रिया भाप",
      whySelected: "110:1 से अधिक C:N अनुपात और सख्त रेशेदार संरचना के कारण इस कचरे में नाइट्रोजन की भारी कमी होती है। खुली खाद बनने में 8 महीने से अधिक समय लगता है। पायरोलिसिस कार्बन को उच्च-सतह क्षेत्र (>300 m²/g) वाले मैट्रिक्स में स्थिर करता है और गन्ने के अम्लीय खेतों को सुधारने के लिए प्राकृतिक पोटेशियम को सुरक्षित रखता है।",
      pros: [
        "भारतीय चीनी मिलों पर भारी मात्रा में पहले से केंद्रीकृत, अतिरिक्त बेलिंग की आवश्यकता नहीं।",
        "अत्यधिक झरझरा, क्षारीय बायोचार बनाता है जो अम्लीय गन्ने की मिट्टी को तेजी से सुधारता है।",
        "गीली खोई को सुखाने के लिए आंतरिक फ्लू गैसों का उपयोग करके थर्मल ऊर्जा में आत्मनिर्भरता।"
      ],
      cons: [
        "मिल से आने वाली खोई में लगभग 48% नमी होती है, जिसे भट्ठे में जाने से पहले सुखाना पड़ता है।",
        "मौसमी पेराई कैलेंडर (नवंबर से मार्च) के कारण साल भर संचालन के लिए सूखे भंडारण की आवश्यकता।"
      ],
      agronomicRecommendation: "उच्च प्राकृतिक पोटेशियम इसे रॉक फॉस्फेट के साथ समृद्ध करने पर रासायनिक डीएपी का एक उत्कृष्ट जैविक विकल्प बनाता है।"
    },
    "cow-dung": {
      name: "गोबर घोल (गोबर स्लरी)",
      category: "डेयरी पशुधन उपोत्पाद",
      optimalTechnology: "अवायवीय पाचन (बायोगैस)",
      technologySub: "हाई-रेट कंटीन्यूअस स्टिरर्ड-टैंक रिएक्टर (CSTR)",
      primaryOutput: "संपीड़ित बायो-गैस (CBG) एवं किण्वित जैविक खाद (FOM)",
      whySelected: "गोबर में मीथेनोजेनिक सूक्ष्मजीवों के लिए आदर्श C:N अनुपात (20:1 से 25:1) और 80% से अधिक प्राकृतिक नमी होती है। कार्बन ऊर्जा देता है और नाइट्रोजन कोशिका निर्माण करता है, जिससे तीव्र गैस उत्पादन (55%-65% मीथेन) और एफसीओ अनुसूची IV मानकों के अनुरूप किण्वित जैविक खाद मिलती है।",
      pros: [
        "भारत सरकार की SATAT पहल के तहत वाणिज्यिक संपीड़ित बायो-गैस (CBG) का उत्पादन।",
        "उच्च जैविक कार्बन (>16%) और सक्रिय लाभकारी जीवाणुओं के साथ गंधहीन किण्वित जैविक खाद (FOM)।",
        "ग्रामीण डेयरी किसानों और गौशालाओं से दैनिक निरंतर उत्पादन, स्थिर दैनिक आय का सृजन।"
      ],
      cons: [
        "पर्याप्त जल पदचिह्न और तरल अपशिष्ट जिसके लिए समर्पित निस्यंद उपचार की आवश्यकता होती है।",
        "वातावरण में मीथेन उत्सर्जन रोकने के लिए पूर्ण वायुरोधी सीलिंग आवश्यक है।"
      ],
      agronomicRecommendation: "ठोस डाइजेस्टेड केक फॉर्मूलेशन इंजन के लिए प्राथमिक माइक्रोबियल इनोकुलम और ह्यूमस आधार प्रदान करता है।"
    },
    "poultry-litter": {
      name: "पोल्ट्री खाद एवं विष्ठा",
      category: "वाणिज्यिक पोल्ट्री खाद",
      optimalTechnology: "अवायवीय पाचन (बायोगैस)",
      technologySub: "उच्च-कार्बन कृषि-पुआल के साथ सह-पाचन CSTR",
      primaryOutput: "उच्च-नाइट्रोजन जैव-उर्वरक एवं त्वरित मीथेन",
      whySelected: "पोल्ट्री विष्ठा में यूरिक एसिड और नाइट्रोजन की सघनता के कारण C:N अनुपात बेहद कम (10:1) होता है। इसे अकेले पचाने पर अमोनिया विषाक्तता होती है। लेकिन जब इसे पराली या खोई के साथ सह-पाचन में मिलाया जाता है, तो यह आदर्श 25:1 C:N अनुपात प्राप्त कर मीथेन उत्पादन को 40% बढ़ाता है और समृद्ध खाद बनाता है।",
      pros: [
        "सभी भारतीय जैविक अपशिष्टों में उच्चतम प्राकृतिक N-P-K सांद्रता (3.8% N, 2.5% P₂O₅, 2.0% K₂O)।",
        "थर्मोफिलिक तापमान 72 घंटों के भीतर हानिकारक रोगजनकों को नष्ट करता है।",
        "कच्चे पोल्ट्री भंडारण से होने वाले भूजल संदूषण और अमोनिया उत्सर्जन को रोकता है।",
      ],
      cons: [
        "अकेले एकल-सब्सट्रेट के रूप में नहीं पचाया जा सकता; उच्च-कार्बन सह-सब्सट्रेट की आवश्यकता होती है।",
        "संक्षारक अमोनिया वाष्प के लिए स्टेनलेस स्टील फिटिंग और गैस बायो-स्क्रबर की आवश्यकता होती है।"
      ],
      agronomicRecommendation: "मॉड्यूल 02 में रासायनिक यूरिया की जगह प्राकृतिक नाइट्रोजन बूस्टर के रूप में कार्य करता है।"
    },
    "cotton-stalks": {
      name: "कपास की लकड़ी व डंठल",
      category: "काष्ठीय फसल अवशेष",
      optimalTechnology: "बायोचार पायरोलिसिस",
      technologySub: "उच्च-तापमान फिक्स्ड-बेड कार्बोनाइजेशन भट्ठा (550°C)",
      primaryOutput: "संरचित मैक्रो-पोरस बायोचार एवं लकड़ी का सिरका",
      whySelected: "कपास के डंठल 72:1 C:N अनुपात वाली कठोर काष्ठीय लकड़ी होते हैं। खेतों में सड़ने में दो साल लग जाते हैं। उच्च-तापमान पायरोलिसिस इसे 30 मिनट में क्षारीय बायोचार में बदल देता है और डंठलों के अंदर सुप्त अवस्था में छिपे गुलाबी सुंडी (पिंक बोलवर्म) कीटों को पूरी तरह नष्ट कर देता है।",
      pros: [
        "बिना हानिकारक रासायनिक कीटनाशकों के गुलाबी सुंडी (पिंक बोलवर्म) कीटों के जीवन चक्र को समाप्त करता है।",
        "असाधारण धनायन-विनिमय क्षमता और दीर्घकालिक मिट्टी वातन के साथ स्थिर बायोचार बनाता है।",
        "लकड़ी के सिरके (पायरोलिग्नियस एसिड) का सह-उत्पादन करता है, जो एक प्राकृतिक जैविक कीटनाशक है।"
      ],
      cons: [
        "भोजन कराने से पहले सख्त जड़ों और शाखाओं को काटने के लिए ट्रैक्टर चालित कटर की आवश्यकता।",
        "सख्त रेशों के कारण कटर ब्लेड पर उच्च घिसाव दर।"
      ],
      agronomicRecommendation: "क्षारीय बायोचार (पीएच 8.8) कपास उत्पादक क्षेत्रों की अम्लीय मिट्टी को सुधारने का प्रमुख उपाय है।"
    },
    "mandi-greens": {
      name: "सब्जी मंडी हरी पत्तियां व अपशिष्ट",
      category: "बाजार अधिशेष एवं जैविक कचरा",
      optimalTechnology: "वर्मीकंपोस्टिंग (केंचुआ खाद)",
      technologySub: "टियरड कंटीन्यूअस फ्लो-थ्रू वर्मी-रिएक्टर",
      primaryOutput: "एंजाइम-समृद्ध वर्मीकास्ट एवं तरल ह्यूमिक अर्क",
      whySelected: "सब्जी मंडी के अवशेष मुलायम, उच्च नमी और 24:1 C:N अनुपात वाले होते हैं। यह खाद बनाने वाले केंचुओं (आइसिनिया फेटिडा) का प्राकृतिक भोजन है। केंचुए इसे बिना किसी जीवाश्म ईंधन या बाहरी बिजली के एंजाइम, ऑक्सिन और ह्यूमिक एसिड से भरपूर वर्मीकम्पोस्ट में बदल देते हैं।",
      pros: [
        "अत्यधिक कम पूंजीगत लागत (CAPEX) और शून्य विद्युत मांग; विकेंद्रीकृत ग्राम समूहों के लिए उपयुक्त।",
        "पौध विकास नियामकों (ऑक्सिन, साइटोकिनिन) और ह्यूमिक एसिड से भरपूर वर्मीकास्ट उत्पादन।",
        "सब्जी मंडियों से जैविक कचरे को तुरंत निपटाकर बदबू और लीचेट को रोकता है।"
      ],
      cons: [
        "उत्तर भारतीय गर्मियों (>38°C) के दौरान अत्यधिक गर्मी के प्रति संवेदनशील, छायादार छप्पर की आवश्यकता।",
        "औद्योगिक पायरोलिसिस भट्ठों की तुलना में प्रति वर्ग मीटर धीमी प्रसंस्करण दर।"
      ],
      agronomicRecommendation: "बागवानी फसलों, पौधों की नर्सरी और अंकुरण के लिए आदर्श उच्च-मूल्य वाला बायो-उर्वरक है।"
    }
  };

  function renderWasteAnalysis(wasteId, triggerToast = true) {
    const item = farmWasteData.find(w => w.id === wasteId);
    if (!item) return;
    activeWasteId = wasteId;

    const isHi = (currentLang === 'hi');
    const hiData = wasteHindiMap[wasteId] || {};
    const itemName = isHi && hiData.name ? hiData.name : item.name;
    const itemCat = isHi && hiData.category ? hiData.category : item.category;
    const optTech = isHi && hiData.optimalTechnology ? hiData.optimalTechnology : item.optimalTechnology;
    const techSub = isHi && hiData.technologySub ? hiData.technologySub : item.technologySub;
    const prosList = isHi && hiData.pros ? hiData.pros : item.pros;
    const consList = isHi && hiData.cons ? hiData.cons : item.cons;
    const whySelected = isHi && hiData.whySelected ? hiData.whySelected : item.whySelected;
    const agronomicRecommendation = isHi && hiData.agronomicRecommendation ? hiData.agronomicRecommendation : item.agronomicRecommendation;
    const primaryOutput = isHi && hiData.primaryOutput ? hiData.primaryOutput : item.primaryOutput;

    // Visual highlight on clicked card: subtle Saffron/Orange border & scale transform
    wasteCardButtons.forEach(card => {
      const isSelected = card.getAttribute('data-waste-id') === wasteId;
      if (isSelected) {
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
      } else {
        card.classList.remove('selected');
        card.setAttribute('aria-pressed', 'false');
      }
    });

    // Reveal dynamic analysis panel
    if (analysisEmptyState) analysisEmptyState.style.display = 'none';
    if (analysisDynamicContent) analysisDynamicContent.style.display = 'block';
    if (techAnalysisPanel) techAnalysisPanel.classList.add('has-selection');

    // Build Pros and Cons Lists
    const prosHtml = prosList.map(pro => `
      <li class="ap-list-item">
        <span class="ap-bullet-check" aria-hidden="true">✔</span>
        <span>${pro}</span>
      </li>
    `).join('');

    const consHtml = consList.map(con => `
      <li class="ap-list-item">
        <span class="ap-bullet-warn" aria-hidden="true">⚠</span>
        <span>${con}</span>
      </li>
    `).join('');

    // Dynamic HTML injection with quick fade-in animation
    analysisDynamicContent.innerHTML = `
      <div class="analysis-content-animated">
        <!-- Panel Header -->
        <div class="ap-header">
          <div>
            <div class="ap-feedstock-eyebrow">
              <span class="badge-dot saffron" aria-hidden="true"></span>
              <span>${itemCat}</span>
              <span>&bull;</span>
              <span class="text-green" data-i18n="ap_match_verified">Stoichiometric Match Verified</span>
            </div>
            <h3 class="ap-feedstock-title">${item.icon} ${itemName}</h3>
            <span class="wc-local-name">${item.localName}</span>
          </div>
          <span class="status-pill status-ready" data-i18n="ap_optimal_path">Optimal Path</span>
        </div>

        <!-- Matching Conversion Technology Hero (Prominent Green Accent Color) -->
        <div class="ap-tech-hero">
          <div class="ap-tech-meta">
            <span class="ap-tech-label" data-i18n="ap_optimal_tech_label">OPTIMAL CONVERSION TECHNOLOGY</span>
            <div class="ap-tech-name text-green">${optTech}</div>
            <span class="ap-tech-sub">${techSub}</span>
          </div>
          <div class="ap-tech-icon" aria-hidden="true">
            ${item.optimalTechnology === 'Biochar Pyrolysis' ? '🔥' : (item.optimalTechnology === 'Anaerobic Digestion' ? '🔄' : '🌿')}
          </div>
        </div>

        <!-- Stoichiometric Quick Specs -->
        <div class="ap-specs-strip">
          <div class="ap-spec-card">
            <span class="ap-spec-label" data-i18n="ap_avg_cn">Average C:N Ratio</span>
            <span class="ap-spec-value text-saffron">${item.cnRatio}</span>
            <span class="ap-spec-sub"><span data-i18n="ap_spread">Spread:</span> ${item.cnRange}</span>
          </div>
          <div class="ap-spec-card">
            <span class="ap-spec-label" data-i18n="ap_moisture">Moisture Content</span>
            <span class="ap-spec-value text-charcoal">${item.moistureContent}</span>
            <span class="ap-spec-sub">${parseInt(item.moistureContent) > 50 ? (isHi ? 'तरल / गीला घोल' : 'Liquid / Wet Slurry') : (isHi ? 'ठोस सूखा बायोमास' : 'Dry Solid Biomass')}</span>
          </div>
          <div class="ap-spec-card">
            <span class="ap-spec-label" data-i18n="ap_primary_bioproduct">Primary Bio-Product</span>
            <span class="ap-spec-value text-green" style="font-size: 0.95rem;">${primaryOutput.split('&')[0]}</span>
            <span class="ap-spec-sub" data-i18n="ap_commercial_offtake">Commercial value off-take</span>
          </div>
        </div>

        <!-- Biochemical C:N Ratio Breakdown -->
        <div class="ap-rationale-box">
          <div class="ap-rationale-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span data-i18n="ap_selection_rationale">Biochemical Selection Rationale</span> (${optTech})
          </div>
          <p class="ap-rationale-text">${whySelected}</p>
        </div>

        <!-- Fundamental Pros and Cons Pathway Grid -->
        <div class="ap-pros-cons">
          <div class="ap-pro-col">
            <div class="ap-col-title green">
              <span>✔</span> <span data-i18n="ap_advantages">Core Technical Advantages &amp; Yield Benefits</span>
            </div>
            <ul class="ap-list">
              ${prosHtml}
            </ul>
          </div>

          <div class="ap-con-col">
            <div class="ap-col-title amber">
              <span>⚠</span> <span data-i18n="ap_challenges">Operational Challenges &amp; Pre-Treatment Requirements</span>
            </div>
            <ul class="ap-list">
              ${consHtml}
            </ul>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="ap-footer-action">
          <div class="ap-agronomic-note">
            <strong data-i18n="ap_agronomic_rec">Agronomic Integration Recommendation:</strong> ${agronomicRecommendation}
          </div>
          <a href="#formulation" class="btn btn-sm btn-saffron btn-action-forward" id="btn-forward-formulation" style="flex-shrink: 0;">
            <span data-i18n="ap_btn_proceed">Proceed to Formulation Engine</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    `;

    // Ensure all dynamic elements with data-i18n are immediately localized
    translateDynamicContainer(analysisDynamicContent);

    // Interactivity: Smooth scroll to Formulation module when action button clicked
    const forwardBtn = document.getElementById('btn-forward-formulation');
    forwardBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const formulationEl = document.getElementById('formulation');
      if (formulationEl) {
        const offset = siteHeader ? siteHeader.offsetHeight + 10 : 80;
        window.scrollTo({
          top: formulationEl.getBoundingClientRect().top + window.pageYOffset - offset,
          behavior: 'smooth'
        });
        showToast(`Forwarded ${item.name} to Formulation Engine`);
      }
    });

    if (triggerToast && typeof showToast === 'function') {
      showToast(`Evaluated ${item.name}: Optimal Pathway is ${item.optimalTechnology}`);
    }
  }

  // Attach accessible click and keyboard listeners
  wasteCardButtons.forEach(card => {
    card.addEventListener('click', () => {
      const wasteId = card.getAttribute('data-waste-id');
      renderWasteAnalysis(wasteId, true);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const wasteId = card.getAttribute('data-waste-id');
        renderWasteAnalysis(wasteId, true);
      }
    });
  });

  // Initialize Default Feedstock Analysis: Rice Husk (without alert toast on load)
  renderWasteAnalysis('rice-husk', false);

  // =========================================================================
  // 5. Module 01: Interactive Crop/Waste Regional Map of India Engine
  // =========================================================================
  const regionalWasteProfiles = [
    {
      id: "UP",
      name: "Uttar Pradesh",
      dominantWaste: "Sugarcane Bagasse",
      tech: "Biochar Pyrolysis & Organo-Mineral Co-Granulation",
      reason: "Immense sugar belt biomass volumes across Western and Central UP combine bagasse carbon matrix with pressmud organic phosphorus.",
      cn: "92:1",
      density: "39.8 Million MT/Yr",
      output: "14.2 Million MT Bio-Fertilizer",
      feedstockType: "Agro-Industrial Residue",
      regionKey: "up"
    },
    {
      id: "MH",
      name: "Maharashtra",
      dominantWaste: "Sugarcane Bagasse",
      tech: "Biochar Pyrolysis & Anaerobic Co-Digestion",
      reason: "Extensive sugarcane crushing cooperatives in Western Maharashtra supply bagasse to generate steam and biochar organo-mineral NPK.",
      cn: "115:1",
      density: "28.5 Million MT/Yr",
      output: "10.2 Million MT Bio-Fertilizer",
      feedstockType: "Sugar Mill Residue",
      regionKey: "maharashtra"
    },
    {
      id: "PB",
      name: "Punjab",
      dominantWaste: "Rice Husk",
      tech: "Biochar Pyrolysis",
      reason: "High C:N ratio (85:1) and elevated silica (13%) make paddy straw optimal for catalytic pyrolysis kiln valorization instead of open field burning.",
      cn: "85:1",
      density: "19.5 Million MT/Yr",
      output: "6.8 Million MT Biochar & Bio-NPK",
      feedstockType: "Crop Stubble (Parali)",
      regionKey: "punjab"
    },
    {
      id: "WB",
      name: "West Bengal",
      dominantWaste: "Rice Husk",
      tech: "Biochar Pyrolysis & Aerobic Composting",
      reason: "World's largest paddy production belt generates high-silica rice husk, pyrolyzed into biochar to reinforce alluvial rice paddy root zones.",
      cn: "82:1",
      density: "22.4 Million MT/Yr",
      output: "7.9 Million MT Bio-Fertilizer",
      feedstockType: "Paddy Milling By-Product",
      regionKey: "wb"
    },
    {
      id: "HR",
      name: "Haryana",
      dominantWaste: "Paddy Straw",
      tech: "Biochar Pyrolysis & Biogas",
      reason: "Dense paddy-wheat stubble clusters across Karnal and Kaithal feed decentralized torrefaction hubs producing carbon-negative bio-granules.",
      cn: "78:1",
      density: "11.2 Million MT/Yr",
      output: "4.1 Million MT Bio-Fertilizer",
      feedstockType: "Crop Stubble (Parali)",
      regionKey: "haryana"
    },
    {
      id: "GJ",
      name: "Gujarat",
      dominantWaste: "Cotton Stalks",
      tech: "Biochar Pyrolysis & Humic Inoculation",
      reason: "Woody cotton stalks from Saurashtra and Vidarbha are converted into biochar to counteract salinity and boost cation exchange capacity.",
      cn: "72:1",
      density: "15.4 Million MT/Yr",
      output: "5.5 Million MT Bio-Fertilizer",
      feedstockType: "Woody Crop Residue",
      regionKey: "gj"
    },
    {
      id: "MP",
      name: "Madhya Pradesh",
      dominantWaste: "Soybean Stubble & Wheat Straw",
      tech: "Anaerobic Digestion & Biochar Inoculation",
      reason: "Soybean residues rich in native nitrogen co-processed with high-carbon wheat straw provide the optimal 25:1 C:N digestate balance.",
      cn: "45:1",
      density: "18.6 Million MT/Yr",
      output: "6.7 Million MT Bio-Fertilizer",
      feedstockType: "Legume & Cereal Stover",
      regionKey: "mp"
    },
    {
      id: "RJ",
      name: "Rajasthan",
      dominantWaste: "Mustard Stalks & Husk",
      tech: "Biochar Pyrolysis",
      reason: "Dry, lignified brassica stalks create high-surface-area biochar that boosts sandy soil water retention by up to 40%.",
      cn: "68:1",
      density: "12.8 Million MT/Yr",
      output: "4.6 Million MT Bio-Fertilizer",
      feedstockType: "Oilseed Crop Biomass",
      regionKey: "rj"
    },
    {
      id: "BR",
      name: "Bihar",
      dominantWaste: "Rice Husk & Maize Stalks",
      tech: "Biochar Pyrolysis & Bio-Enriched Granulation",
      reason: "Abundant maize cob and paddy husk supplies in Seemanchal provide silica-rich structural matrices for fortified NPK fertilizers.",
      cn: "75:1",
      density: "16.8 Million MT/Yr",
      output: "5.9 Million MT Bio-Fertilizer",
      feedstockType: "Cereal & Stalk Waste",
      regionKey: "br"
    },
    {
      id: "JH",
      name: "Jharkhand",
      dominantWaste: "Rice Husk & Forest Leaf Biomass",
      tech: "Biochar Pyrolysis & Vermicomposting",
      reason: "Acidic red soils of the Chota Nagpur plateau benefit significantly from alkaline biochar application to neutralize toxic aluminum ions.",
      cn: "52:1",
      density: "7.4 Million MT/Yr",
      output: "2.6 Million MT Bio-Fertilizer",
      feedstockType: "Agro-Forestry Biomass",
      regionKey: "jh"
    },
    {
      id: "OR",
      name: "Odisha",
      dominantWaste: "Rice Husk & Straw",
      tech: "Biochar Pyrolysis & Bio-Formulation",
      reason: "Cyclone-prone coastal delta soils gain high organic carbon stability and shear strength through pyrolyzed rice husk incorporation.",
      cn: "74:1",
      density: "13.6 Million MT/Yr",
      output: "4.8 Million MT Bio-Fertilizer",
      feedstockType: "Paddy Agro-Residue",
      regionKey: "or"
    },
    {
      id: "CH",
      name: "Chhattisgarh",
      dominantWaste: "Rice Husk (Dhan Kuti)",
      tech: "Biochar Pyrolysis & Microbial Inoculation",
      reason: "The Rice Bowl of Central India processes thousands of rice mill husk mounds into high-silica biochar for phosphorus chelation.",
      cn: "80:1",
      density: "12.2 Million MT/Yr",
      output: "4.3 Million MT Bio-Fertilizer",
      feedstockType: "Mill Milling Residue",
      regionKey: "ch"
    },
    {
      id: "TG",
      name: "Telangana",
      dominantWaste: "Cotton Stalks & Paddy Husk",
      tech: "Biochar Pyrolysis & Azotobacter Fortification",
      reason: "Semi-arid cotton belts convert post-harvest woody stalks into biochar, cutting synthetic DAP needs by 35% in red chalka soils.",
      cn: "70:1",
      density: "12.8 Million MT/Yr",
      output: "4.5 Million MT Bio-Fertilizer",
      feedstockType: "Fiber Crop Stems",
      regionKey: "tg"
    },
    {
      id: "AP",
      name: "Andhra Pradesh",
      dominantWaste: "Paddy Straw & Chili Crop Residue",
      tech: "Biochar Pyrolysis & Bio-Manure",
      reason: "Coastal Andhra delta tracts upcycle dense paddy residues and chili plant stalks into disease-suppressive bio-organics.",
      cn: "65:1",
      density: "17.2 Million MT/Yr",
      output: "6.1 Million MT Bio-Fertilizer",
      feedstockType: "Delta Crop Residue",
      regionKey: "ap"
    },
    {
      id: "KA",
      name: "Karnataka",
      dominantWaste: "Sugarcane Bagasse & Maize Stover",
      tech: "Biochar Pyrolysis & Micro-Nutrient Bio-Enrichment",
      reason: "Diverse agro-climatic zones provide bagasse in Belagavi and coffee husk in Malnad, creating balanced multi-nutrient organo-mineral fertilizers.",
      cn: "88:1",
      density: "16.4 Million MT/Yr",
      output: "5.8 Million MT Bio-Fertilizer",
      feedstockType: "Agro-Industrial Residue",
      regionKey: "ka"
    },
    {
      id: "TN",
      name: "Tamil Nadu",
      dominantWaste: "Sugarcane Bagasse & Coir Pith",
      tech: "Biochar Pyrolysis & Pressmud Co-Granulation",
      reason: "Cauvery delta bagasse and Pollachi coir pith combine with sugar mill pressmud, producing high-grade phosphorus-rich bio-granules.",
      cn: "95:1",
      density: "18.2 Million MT/Yr",
      output: "6.5 Million MT Bio-Fertilizer",
      feedstockType: "Horticulture & Mill By-Product",
      regionKey: "tn"
    },
    {
      id: "KL",
      name: "Kerala",
      dominantWaste: "Coir Pith & Coconut Residues",
      tech: "Lignin Degrading Fungal Inoculation & Biochar",
      reason: "Abundant coir pith mounds treated with Pleurotus mushrooms yield high-moisture organic sponges ideal for spice and plantation crops.",
      cn: "110:1",
      density: "6.8 Million MT/Yr",
      output: "2.4 Million MT Bio-Fertilizer",
      feedstockType: "Plantation Residue",
      regionKey: "kl"
    },
    {
      id: "AS",
      name: "Assam & North East",
      dominantWaste: "Tea Prunings, Bamboo & Paddy Husk",
      tech: "Biochar Pyrolysis & Bio-Enzymatic Composting",
      reason: "High tea estate bio-residues and bamboo fibers produce structured activated carbon matrices to rebalance acidic tea soils.",
      cn: "64:1",
      density: "9.8 Million MT/Yr",
      output: "3.4 Million MT Bio-Fertilizer",
      feedstockType: "Plantation & Cane Biomass",
      regionKey: "as"
    },
    {
      id: "HP",
      name: "Himachal Pradesh",
      dominantWaste: "Apple Pomace & Pine Needles",
      tech: "Biochar Pyrolysis",
      reason: "High-resin pine needles and orchard pomace prevent forest wildfires when pyrolyzed into porous carrier biochar.",
      cn: "55:1",
      density: "2.8 Million MT/Yr",
      output: "950,000 MT Bio-Fertilizer",
      feedstockType: "Orchard & Forest Biomass",
      regionKey: "hp"
    },
    {
      id: "UK",
      name: "Uttarakhand",
      dominantWaste: "Pine Needles & Sugarcane Trash",
      tech: "Pyrolysis & Vermicomposting",
      reason: "Combines hillside pine residue torrefaction with terai sugarcane bio-inoculation to replenish organic hill soils.",
      cn: "62:1",
      density: "3.5 Million MT/Yr",
      output: "1.1 Million MT Bio-Fertilizer",
      feedstockType: "Hill Agriculture Residue",
      regionKey: "uk"
    },
    {
      id: "JK",
      name: "Jammu & Kashmir & Ladakh",
      dominantWaste: "Apple Pomace & Walnut Shells",
      tech: "Biochar Pyrolysis & Composting",
      reason: "High lignin and polyphenolic residues from intensive horticulture are ideal for low-temperature torrefaction to produce soil warming biochar.",
      cn: "48:1",
      density: "3.2 Million MT/Yr",
      output: "1.2 Million MT Bio-Fertilizer",
      feedstockType: "Temperate Orchard Biomass",
      regionKey: "jk"
    },
    {
      id: "GA",
      name: "Goa",
      dominantWaste: "Cashew Apple Pomace & Coconut Husk",
      tech: "Organic Bio-Composting",
      reason: "High moisture cashew residue rich in ascorbic acid and sugars accelerates fermentation kinetics for coastal fruit orchards.",
      cn: "35:1",
      density: "380,000 MT/Yr",
      output: "140,000 MT Bio-Fertilizer",
      feedstockType: "Horticulture Fruit Waste",
      regionKey: "ga"
    },
    {
      id: "SK",
      name: "Sikkim",
      dominantWaste: "Organic Horticulture & Cardamom Biomass",
      tech: "100% Organic Vermicomposting",
      reason: "As India's first 100% certified organic state, residues are bio-converted exclusively through non-chemical cold-tolerant microbial consortiums.",
      cn: "28:1",
      density: "420,000 MT/Yr",
      output: "180,000 MT Certified Organic Manure",
      feedstockType: "Organic Plantation Biomass",
      regionKey: "sk"
    },
    {
      id: "DL",
      name: "Delhi NCR",
      dominantWaste: "Urban Green & Agro-Mandi Waste",
      tech: "Rapid In-Vessel Composting",
      reason: "High-nitrogen wholesale mandi organic pulp co-composts with urban forestry prunings for horticulture bio-fertilizer.",
      cn: "22:1",
      density: "1.4 Million MT/Yr",
      output: "480,000 MT Bio-Fertilizer",
      feedstockType: "Market Wholesale Surplus",
      regionKey: "dl"
    }
  ];

  const mapSvg = document.getElementById('india-map-svg');
  const statePaths = Array.from(document.querySelectorAll('.map-state'));
  const regionalProfilePanel = document.getElementById('regional-profile-panel');
  const mapTooltip = document.getElementById('map-tooltip');
  const mapPillState = document.getElementById('map-pill-state');
  const regionChips = document.querySelectorAll('.chip-filter');

  const stateHindiMap = {
    "UP": { name: "उत्तर प्रदेश", dominantWaste: "गन्ना खोई (बगास)", tech: "बायोचार पायरोलिसिस एवं सह-दानेदारण", feedstockType: "कृषि-औद्योगिक अवशेष", reason: "पश्चिमी और मध्य यूपी के विशाल चीनी मिल क्षेत्र बगास के कार्बन मैट्रिक्स को प्रेसमुड ऑर्गेनिक फास्फोरस के साथ जोड़ते हैं।" },
    "MH": { name: "महाराष्ट्र", dominantWaste: "गन्ना खोई (बगास)", tech: "बायोचार पायरोलिसिस एवं सह-पाचन", feedstockType: "चीनी मिल अवशेष", reason: "पश्चिमी महाराष्ट्र की चीनी मिलें भाप और बायोचार एनपीके बनाने के लिए प्रचुर मात्रा में खोई की आपूर्ति करती हैं।" },
    "PB": { name: "पंजाब", dominantWaste: "चावल की भूसी एवं पराली", tech: "बायोचार पायरोलिसिस", feedstockType: "फसल अवशेष (पराली)", reason: "उच्च C:N अनुपात (85:1) और सिलिका सामग्री के कारण पराली जलाने के बजाय कैटेलिटिक पायरोलिसिस के लिए इष्टतम है।" },
    "WB": { name: "पश्चिम बंगाल", dominantWaste: "चावल की भूसी", tech: "बायोचार पायरोलिसिस एवं कंपोस्टिंग", feedstockType: "धान मिलिंग उपोत्पाद", reason: "भारत का सबसे बड़ा धान क्षेत्र उच्च-सिलिका भूसी उत्पन्न करता है, जिसे बायोचार बनाकर मिट्टी में मिलाया जाता है।" },
    "HR": { name: "हरियाणा", dominantWaste: "धान की पराली", tech: "बायोचार पायरोलिसिस एवं बायोगैस", feedstockType: "फसल अवशेष (पराली)", reason: "करनाल और कैथल के पराली क्लस्टर विकेंद्रीकृत टॉरिफैक्शन हब के माध्यम से कार्बन-नेगेटिव बायो-ग्रेन्यूल्स बनाते हैं।" },
    "GJ": { name: "गुजरात", dominantWaste: "कपास के डंठल", tech: "बायोचार पायरोलिसिस एवं ह्यूमिक संवर्धन", feedstockType: "काष्ठीय फसल अवशेष", reason: "कपास के सख्त डंठल उच्च-तापमान पायरोलिसिस द्वारा गुलाबी सुंडी कीट को समाप्त कर क्षारीय बायोचार बनाते हैं।" },
    "MP": { name: "मध्य प्रदेश", dominantWaste: "सोयाबीन एवं गेहूं का भूसा", tech: "बायोचार पायरोलिसिस एवं वर्मीकंपोस्टिंग", feedstockType: "दलहन व तिलहन अवशेष", reason: "मालवा और नर्मदा घाटी के विशाल सोयाबीन-गेहूं अवशेष मिट्टी के ह्यूमस पुनर्जनन के लिए उपयुक्त हैं।" },
    "AP": { name: "आंध्र प्रदेश", dominantWaste: "धान भूसी एवं जलीय खरपतवार", tech: "बायोचार एवं अवायवीय पाचन", feedstockType: "तटीय कृषि-अवशेष", reason: "कृष्णा-गोदावरी डेल्टा के धान अवशेष तटीय लवणता को ठीक करने वाले बायोचार के उत्पादन के लिए आदर्श हैं।" },
    "KA": { name: "कर्नाटक", dominantWaste: "गन्ने की खोई एवं कॉफी पल्प", tech: "बायोचार पायरोलिसिस एवं वर्मीकंपोस्टिंग", feedstockType: "रोपण एवं मिलिंग अवशेष", reason: "दक्कन पठार की लाल मिट्टी की अम्लता को संतुलित करने के लिए समृद्ध बायोचार का उत्पादन।" },
    "TN": { name: "तमिलनाडु", dominantWaste: "नारियल की जटा एवं खोई", tech: "बायोचार एवं वर्मीकंपोस्टिंग", feedstockType: "नारियल व बागवानी अवशेष", reason: "कावेरी डेल्टा में नारियल अवशेष जल-प्रतिधारण और पोटेशियम युक्त जैविक खाद प्रदान करते हैं।" },
    "RJ": { name: "राजस्थान", dominantWaste: "सरसों के डंठल एवं बाजरा भूसा", tech: "बायोचार पायरोलिसिस", feedstockType: "शुष्क फसल अवशेष", reason: "रेतीली शुष्क मिट्टी में नमी रोकने और सल्फर की पूर्ति के लिए सरसों के डंठल का बायोचार सर्वोत्तम है।" },
    "BR": { name: "बिहार", dominantWaste: "मक्के के भुट्टे एवं धान भूसा", tech: "बायोचार पायरोलिसिस एवं बायोगैस", feedstockType: "अनाज व मक्का अवशेष", reason: "सीमांचल और उत्तर बिहार के विशाल मक्का अवशेष उच्च-छिद्रयुक्त मृदा कंडीशनर का उत्पादन करते हैं।" },
    "OD": { name: "ओडिशा", dominantWaste: "धान की भूसी", tech: "बायोचार पायरोलिसिस", feedstockType: "चावल मिलिंग अवशेष", reason: "अम्लीय लाल मिट्टी के पीएच को सामान्य करने के लिए सिलिका युक्त बायोचार का उत्पादन।" },
    "TG": { name: "तेलंगाना", dominantWaste: "कपास के डंठल एवं धान भूसा", tech: "बायोचार पायरोलिसिस", feedstockType: "काष्ठीय फसल अवशेष", reason: "तेलंगाना के शुष्क क्षेत्रों में सूक्ष्मजीव गतिविधि और कार्बन सामग्री को पुनर्जीवित करता है।" },
    "AS": { name: "असम", dominantWaste: "चाय अपशिष्ट एवं धान भूसा", tech: "वर्मीकंपोस्टिंग एवं बायोचार", feedstockType: "चाय बागान अपशिष्ट", reason: "चाय बागानों की अम्लीय मिट्टी को समृद्ध करने के लिए नाइट्रोजन-युक्त बायो-खाद।" },
    "KL": { name: "केरल", dominantWaste: "नारियल अपशिष्ट एवं रबड़ की लकड़ी", tech: "बायोचार पायरोलिसिस", feedstockType: "बागान लकड़ी अवशेष", reason: "उच्च वर्षा वाले क्षेत्रों में पोषक तत्वों के रिसाव को रोकने के लिए उच्च-पोरस बायोचार।" },
    "CH": { name: "छत्तीसगढ़", dominantWaste: "धान की भूसी (राइस हस्क)", tech: "बायोचार पायरोलिसिस", feedstockType: "धान का कटोरा अवशेष", reason: "धान मिलों से निकलने वाली भूसी से ऊर्जा और पोषक तत्व संपन्न सिलिका-बायोचार का निर्माण।" },
    "JH": { name: "झारखंड", dominantWaste: "वन बायोमास एवं धान भूसा", tech: "बायोचार एवं वर्मीकंपोस्टिंग", feedstockType: "वन एवं कृषि अवशेष", reason: "पठारी क्षेत्रों की बंजर मिट्टी को उपजाऊ बनाने के लिए बायो-ह्यूमस खाद।" },
    "UK": { name: "उत्तराखंड", dominantWaste: "गन्ने की खोई एवं चीड़ की पत्तियां", tech: "बायोचार पायरोलिसिस", feedstockType: "पर्वतीय व तराई अवशेष", reason: "तराई के गन्ने और पहाड़ी चीड़ के पत्तों को जंगल की आग रोकने वाले बायोचार में बदलना।" },
    "HP": { name: "हिमाचल प्रदेश", dominantWaste: "सेब की छंटाई व पाइन नीडल्स", tech: "बायोचार पायरोलिसिस", feedstockType: "बागवानी लकड़ी अवशेष", reason: "सेब के बागों की मिट्टी में फंगल रोगों को रोकने और कार्बन बढ़ाने के लिए पाइन बायोचार।" },
    "JK": { name: "जम्मू और कश्मीर", dominantWaste: "अखरोट व सेब बागवानी अपशिष्ट", tech: "बायोचार पायरोलिसिस", feedstockType: "शीतोष्ण बागवानी अवशेष", reason: "घाटी के सेब और अखरोट बागों के लिए धीमी गति से पोषक तत्व छोड़ने वाला बायोचार।" },
    "GA": { name: "गोवा", dominantWaste: "नारियल व काजू छिलके", tech: "बायोचार पायरोलिसिस", feedstockType: "तटीय बागवानी अवशेष", reason: "तटीय रेतीली मिट्टी में पोषक तत्वों को बनाए रखने के लिए कार्बन-समृद्ध बायोचार।" },
    "TR": { name: "त्रिपुरा", dominantWaste: "बांस एवं बागवानी अपशिष्ट", tech: "बायोचार पायरोलिसिस", feedstockType: "बांस व वन अवशेष", reason: "बांस के अवशेषों से उच्च-ऊर्जा बायोचार और सिरका का उत्पादन।" },
    "DL": { name: "दिल्ली एनसीआर", dominantWaste: "सब्जी मंडी अपशिष्ट", tech: "अवायवीय जैव-पाचन", feedstockType: "मंडी थोक अवशेष", reason: "आजादपुर मंडी के गीले जैविक कचरे से ग्रीन एनर्जी और जैविक स्लरी खाद का निर्माण।" }
  };

  /**
   * Dynamically renders the 'Regional Profile' HTML panel
   * @param {Object} profile - State profile object
   */
  function renderRegionalProfile(profile) {
    if (!regionalProfilePanel || !profile) return;
    activeRegionalProfile = profile;

    const isHi = (currentLang === 'hi');
    const hiData = stateHindiMap[profile.id] || {};
    const stateName = isHi && hiData.name ? hiData.name : profile.name;
    const dominantWaste = isHi && hiData.dominantWaste ? hiData.dominantWaste : profile.dominantWaste;
    const techName = isHi && hiData.tech ? hiData.tech : profile.tech;
    const feedstockType = isHi && hiData.feedstockType ? hiData.feedstockType : profile.feedstockType;
    const reasonText = isHi && hiData.reason ? hiData.reason : profile.reason;
    const btnText = isHi ? `${dominantWaste} के लिए फॉर्मूलेशन कॉन्फ़िगर करें` : `Configure Formulation for ${profile.dominantWaste}`;

    regionalProfilePanel.classList.remove('fade-in');
    void regionalProfilePanel.offsetWidth; // Force CSS animation restart
    regionalProfilePanel.classList.add('fade-in');

    regionalProfilePanel.innerHTML = `
      <div class="rp-header">
        <div>
          <span class="rp-state-badge"><span data-i18n="rp_state_code">State Code</span>: ${profile.id} &bull; ${feedstockType}</span>
          <h3 class="rp-state-title" id="profile-state-name">${stateName}</h3>
        </div>
        <span class="status-pill status-ready">
          <span class="pulse-dot"></span> <span data-i18n="rp_active_profile">Active Profile</span>
        </span>
      </div>

      <!-- Dominant Waste Callout Card -->
      <div class="rp-waste-card">
        <span class="rp-waste-label" data-i18n="rp_dominant_waste">Dominant Farm Waste Type</span>
        <h4 class="rp-waste-value">
          <span aria-hidden="true">🌾</span>
          <span id="profile-waste-type">${dominantWaste}</span>
        </h4>
        <p class="rp-waste-meta">
          <strong><span data-i18n="rp_avg_cn">Average C:N Ratio</span>:</strong> ${profile.cn} &bull; <strong><span data-i18n="rp_annual_surplus">Annual Surplus</span>:</strong> ${profile.density}
        </p>
      </div>

      <!-- Recommended Conversion Technology Card (Green Accent) -->
      <div class="rp-tech-card">
        <span class="rp-tech-label" data-i18n="rp_rec_tech">Recommended Conversion Technology</span>
        <h4 class="rp-tech-value">
          <span aria-hidden="true">⚡</span>
          <span id="profile-tech-name">${techName}</span>
        </h4>
        <p class="rp-waste-meta" data-i18n="rp_tech_sub">
          Targeted biochemical valorization matching substrate moisture and stoichiometric kinetics.
        </p>
      </div>

      <!-- Technical Rationale Breakdown -->
      <div class="rp-rationale-box">
        <strong data-i18n="rp_rationale">Biochemical Selection Rationale:</strong>
        <p style="margin: 6px 0 0 0;">${reasonText}</p>
      </div>

      <!-- Regional Impact Metrics Grid -->
      <div class="rp-metrics-grid">
        <div class="rp-metric-box">
          <span class="rpm-label" data-i18n="rp_biomass_volume">Annual Biomass Volume</span>
          <span class="rpm-val text-charcoal">${profile.density}</span>
        </div>
        <div class="rp-metric-box">
          <span class="rpm-label" data-i18n="rp_fertilizer_potential">Bio-Fertilizer Potential</span>
          <span class="rpm-val text-green">${profile.output}</span>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="rp-action-wrap">
        <a href="#formulation" class="btn btn-saffron btn-full" id="btn-profile-formulate">
          <span>${btnText}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    `;

    // Immediately translate any static data-i18n elements inside the panel
    translateDynamicContainer(regionalProfilePanel);

    if (mapPillState) {
      mapPillState.textContent = isHi ? `${stateName} सक्रिय` : `${profile.name} Active`;
    }
  }

  /**
   * Select a state on the map by its ID (e.g. 'UP', 'PB', 'MH')
   * Highlights the state in Green, clears previous highlight, and updates Regional Profile panel
   */
  function selectRegionalState(stateId, triggerToast = false) {
    const profile = regionalWasteProfiles.find(p => p.id === stateId);
    if (!profile) return;

    // Highlight selected state on SVG map using Green accent color
    statePaths.forEach(path => {
      const isMatch = path.getAttribute('id') === stateId;
      if (isMatch) {
        path.classList.add('state-selected');
        path.setAttribute('aria-selected', 'true');
      } else {
        path.classList.remove('state-selected');
        path.setAttribute('aria-selected', 'false');
      }
    });

    // Dynamically update the adjacent 'Regional Profile' HTML panel
    renderRegionalProfile(profile);

    // Sync region filter chips if matching regionKey exists
    if (regionChips.length > 0) {
      regionChips.forEach(chip => {
        const chipRegion = chip.getAttribute('data-region');
        const isMatch = (profile.regionKey && chipRegion === profile.regionKey) ||
                        (chipRegion === 'punjab' && stateId === 'PB') ||
                        (chipRegion === 'haryana' && stateId === 'HR') ||
                        (chipRegion === 'up' && stateId === 'UP') ||
                        (chipRegion === 'maharashtra' && stateId === 'MH') ||
                        (chipRegion === 'mp' && stateId === 'MP');
        if (isMatch) {
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
        } else {
          chip.classList.remove('active');
          chip.setAttribute('aria-pressed', 'false');
        }
      });
    }

    if (triggerToast && typeof showToast === 'function') {
      showToast(`Selected ${profile.name}: Dominant waste is ${profile.dominantWaste}`);
    }
  }

  // Attach Click & Keyboard Event Listeners to all SVG State Paths
  statePaths.forEach(path => {
    const stateId = path.getAttribute('id');
    const profile = regionalWasteProfiles.find(p => p.id === stateId);

    // Click event listener
    path.addEventListener('click', () => {
      selectRegionalState(stateId, true);
    });

    // Keyboard accessibility (Enter or Space)
    path.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRegionalState(stateId, true);
      }
    });

    // Hover Tooltip Interaction
    path.addEventListener('mouseenter', (e) => {
      if (!mapTooltip || !profile) return;
      mapTooltip.textContent = `${profile.name} • ${profile.dominantWaste}`;
      mapTooltip.classList.add('visible');
    });

    path.addEventListener('mousemove', (e) => {
      if (!mapTooltip) return;
      const wrapperRect = mapSvg.getBoundingClientRect();
      const x = e.clientX - wrapperRect.left;
      const y = e.clientY - wrapperRect.top;
      mapTooltip.style.left = `${x}px`;
      mapTooltip.style.top = `${y}px`;
    });

    path.addEventListener('mouseleave', () => {
      if (!mapTooltip) return;
      mapTooltip.classList.remove('visible');
    });
  });

  // Attach Click Handlers to Top Region Selector Chips to drive the SVG Map
  regionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const regionKey = chip.getAttribute('data-region');
      const keyToStateId = {
        punjab: 'PB',
        haryana: 'HR',
        up: 'UP',
        maharashtra: 'MH',
        mp: 'MP'
      };
      const stateId = keyToStateId[regionKey];
      if (stateId) {
        selectRegionalState(stateId, true);
      }
    });
  });

  // Initialize Default State: Punjab (PB)
  selectRegionalState('PB', false);

  // =========================================================================
  // 5. Module 02: Product Formulation & Future Scope Tabs
  // =========================================================================
  const formulationTabButtons = Array.from(document.querySelectorAll('.ft-tab-btn'));
  const formulationPanels = Array.from(document.querySelectorAll('.ft-content-panel'));

  function switchFormulationTab(tabKey) {
    // 1. Hide all panels by default and update tab button active classes & attributes
    formulationTabButtons.forEach(btn => {
      const isMatch = btn.getAttribute('data-tab') === tabKey;
      if (isMatch) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // 2. Display only the matching content panel with smooth animation
    formulationPanels.forEach(panel => {
      const panelId = panel.getAttribute('id');
      if (panelId === `panel-${tabKey}`) {
        panel.hidden = false;
        panel.classList.add('active');
      } else {
        panel.hidden = true;
        panel.classList.remove('active');
      }
    });

    // Feedback
    const activeBtn = document.querySelector(`.ft-tab-btn[data-tab="${tabKey}"]`);
    if (activeBtn) {
      const tabTitle = activeBtn.querySelector('.ft-tab-text')?.textContent || tabKey;
      showToast(`Loaded formulation R&D: ${tabTitle}`);
    }
  }

  formulationTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-tab');
      if (tabKey) {
        switchFormulationTab(tabKey);
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const tabKey = btn.getAttribute('data-tab');
        if (tabKey) switchFormulationTab(tabKey);
      }
    });
  });

  // Mobile / Touch toggle support for custom CSS tooltips
  const infoBubbles = document.querySelectorAll('.info-bubble');
  infoBubbles.forEach(bubble => {
    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentWrap = bubble.closest('.term-with-tooltip');
      if (parentWrap) {
        parentWrap.classList.toggle('tooltip-open');
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.term-with-tooltip.tooltip-open').forEach(el => {
      el.classList.remove('tooltip-open');
    });
  });

  // =========================================================================
  // 6. Module 02: Batch Recipe Mixer & FCO 1985 Calculation
  // =========================================================================
  const sliderBiochar = document.getElementById('slider-biochar');
  const sliderMicrobes = document.getElementById('slider-microbes');
  const sliderMinerals = document.getElementById('slider-minerals');

  const valSliderBiochar = document.getElementById('val-slider-biochar');
  const valSliderMicrobes = document.getElementById('val-slider-microbes');
  const valSliderMinerals = document.getElementById('val-slider-minerals');

  const specCarbon = document.getElementById('spec-carbon');
  const specNpk = document.getElementById('spec-npk');
  const specCn = document.getElementById('spec-cn');
  const specMoist = document.getElementById('spec-moist');
  const specPh = document.getElementById('spec-ph');
  const fcoComplianceStatus = document.getElementById('fco-compliance-status');
  const presetButtons = document.querySelectorAll('.btn-preset');

  function calculateFormulation() {
    const biochar = parseInt(sliderBiochar.value, 10);
    const microbes = parseInt(sliderMicrobes.value, 10);
    const minerals = parseInt(sliderMinerals.value, 10);

    valSliderBiochar.textContent = `${biochar}%`;
    valSliderMicrobes.textContent = `${microbes}%`;
    valSliderMinerals.textContent = `${minerals}%`;

    // Dynamic agronomic chemical formula modeling
    const calculatedCarbon = ((biochar * 0.44) + (microbes * 0.12) + (minerals * 0.02)).toFixed(1);
    const calculatedNpk = ((minerals * 0.18) + (microbes * 0.11) + (biochar * 0.03)).toFixed(1);
    const calculatedCn = (calculatedNpk > 0 && calculatedCarbon > 0)
      ? (calculatedCarbon / (calculatedNpk * 0.18)).toFixed(1)
      : '0.0';
    const calculatedMoist = (14.5 - (biochar * 0.04)).toFixed(1);

    specCarbon.textContent = `${calculatedCarbon}%`;
    specNpk.textContent = `${calculatedNpk}%`;
    specCn.textContent = `${calculatedCn} : 1`;
    specMoist.textContent = `${calculatedMoist}%`;

    const isHi = (currentLang === 'hi');
    if (calculatedCarbon >= 14.0 && calculatedNpk >= 6.0) {
      fcoComplianceStatus.className = 'status-pill status-ready';
      fcoComplianceStatus.textContent = isHi ? '✓ एफसीओ 1985 मानक उत्तीर्ण' : '✓ FCO 1985 Grade Passed';
    } else {
      fcoComplianceStatus.className = 'status-pill status-active';
      fcoComplianceStatus.textContent = isHi ? '⚠ गैर-मानक फॉर्मूलेशन' : '⚠ Non-Standard Formulation';
    }
  }

  sliderBiochar?.addEventListener('input', calculateFormulation);
  sliderMicrobes?.addEventListener('input', calculateFormulation);
  sliderMinerals?.addEventListener('input', calculateFormulation);

  // Formulation Presets
  const presets = {
    balanced: { biochar: 45, microbes: 20, minerals: 35 },
    carbon: { biochar: 65, microbes: 15, minerals: 20 },
    phosphorus: { biochar: 30, microbes: 25, minerals: 45 }
  };

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.getAttribute('data-preset');
      const p = presets[presetKey];

      if (p) {
        sliderBiochar.value = p.biochar;
        sliderMicrobes.value = p.microbes;
        sliderMinerals.value = p.minerals;
        calculateFormulation();
        showToast(`Applied preset: ${btn.textContent}`);
      }
    });
  });

  // =========================================================================
  // 6. Module 03: TEA, LCA & Circularity Dashboard (Chart.js Integration)
  // =========================================================================
  const capacitySlider = document.getElementById('capacity-slider');
  const displayCapacity = document.getElementById('display-capacity');

  // TEA Metrics Text Elements
  const valCapex = document.getElementById('val-capex');
  const valOpex = document.getElementById('val-opex');
  const valRevenue = document.getElementById('val-revenue');
  const valPayback = document.getElementById('val-payback');
  const valFarmerPayout = document.getElementById('val-farmer-payout');
  const valFertilizerOfftake = document.getElementById('val-fertilizer-offtake');
  const valCarbonRev = document.getElementById('val-carbon-rev');

  // LCA Metrics Text Elements
  const valLcaGhg = document.getElementById('val-lca-ghg');
  const valLcaPm = document.getElementById('val-lca-pm');
  const valLcaNer = document.getElementById('val-lca-ner');
  const valLcaWater = document.getElementById('val-lca-water');

  // Card Badges
  const cardTeaCapex = document.getElementById('card-tea-capex');
  const cardTeaOpex = document.getElementById('card-tea-opex');
  const cardTeaNpv = document.getElementById('card-tea-npv');
  const cardLcaBio = document.getElementById('card-lca-bio');

  // Chart.js Instances
  let teaChartInstance = null;
  let lcaChartInstance = null;
  let circularityChartInstance = null;

  /**
   * Initialize Chart.js Data Visualizations
   */
  function initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js library is not yet loaded from CDN.');
      return;
    }

    // 1. TEA Chart: Stacked Bar Chart (CAPEX & OPEX in Saffron/Orange vs NPV in Green over 5 Years)
    const ctxTea = document.getElementById('teaChart')?.getContext('2d');
    if (ctxTea && !teaChartInstance) {
      teaChartInstance = new Chart(ctxTea, {
        type: 'bar',
        data: {
          labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
          datasets: [
            {
              label: 'CAPEX (Setup & Machinery)',
              data: [480, 40, 25, 20, 20],
              backgroundColor: '#EA580C', // Saffron / Orange
              borderColor: '#C2410C',
              borderWidth: 1,
              stack: 'costs',
              borderRadius: 4
            },
            {
              label: 'OPEX (Biomass Procurement & Labor)',
              data: [165, 172, 180, 188, 195],
              backgroundColor: '#FB923C', // Warm Amber / Orange
              borderColor: '#F97316',
              borderWidth: 1,
              stack: 'costs',
              borderRadius: 4
            },
            {
              label: 'Projected Net Present Value (NPV)',
              data: [120, 340, 580, 840, 1120],
              backgroundColor: '#16A34A', // Vibrant Green
              borderColor: '#15803D',
              borderWidth: 1.5,
              stack: 'returns',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false // Handled in custom accessible card footer
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#1F2937',
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const val = context.parsed.y;
                  const cr = (val / 100).toFixed(2);
                  return ` ${context.dataset.label}: ₹ ${val} Lakhs (₹ ${cr} Cr)`;
                }
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { weight: '600' }, color: '#4B5563' }
            },
            y: {
              stacked: false,
              grid: { color: 'rgba(229, 231, 235, 0.6)' },
              ticks: {
                callback: function(val) {
                  return '₹' + val + 'L';
                },
                color: '#6B7280'
              }
            }
          }
        }
      });
    }

    // 2. LCA Chart: Line Graph with Smooth Curve (Tension) & Animated Drawing
    const ctxLca = document.getElementById('lcaChart')?.getContext('2d');
    if (ctxLca && !lcaChartInstance) {
      lcaChartInstance = new Chart(ctxLca, {
        type: 'line',
        data: {
          labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
          datasets: [
            {
              label: 'Synthetic NPK Fertilizer Baseline',
              data: [1480, 1495, 1515, 1530, 1550],
              borderColor: '#DC2626', // Red / Charcoal baseline
              backgroundColor: 'transparent',
              borderDash: [6, 6],
              borderWidth: 2,
              pointBackgroundColor: '#DC2626',
              pointRadius: 4,
              tension: 0.4
            },
            {
              label: 'KrishiUrja Bio-Fertilizer (Net Negative Pathway)',
              data: [420, 150, -140, -520, -840],
              borderColor: '#15803D', // Vibrant Green
              backgroundColor: 'rgba(21, 128, 61, 0.12)',
              fill: true,
              borderWidth: 2.5,
              pointBackgroundColor: '#15803D',
              pointHoverRadius: 6,
              pointRadius: 4,
              tension: 0.4 // Smooth curve tension
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1900,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#1F2937',
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const val = context.parsed.y;
                  return ` ${context.dataset.label}: ${val > 0 ? '+' : ''}${val} kg CO₂e / MT`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { weight: '600' }, color: '#4B5563' }
            },
            y: {
              grid: { color: 'rgba(229, 231, 235, 0.6)' },
              ticks: {
                callback: function(val) {
                  return val + ' kg';
                },
                color: '#6B7280'
              }
            }
          }
        }
      });
    }

    // 3. ISO 59020 Circularity Chart: Radar Chart (Three Axes: Resource Inflows, Outflows/Waste, Energy Recovery)
    const ctxCirc = document.getElementById('circularityChart')?.getContext('2d');
    if (ctxCirc && !circularityChartInstance) {
      circularityChartInstance = new Chart(ctxCirc, {
        type: 'radar',
        data: {
          labels: ['Resource Inflows', 'Outflows / Waste', 'Energy Recovery'],
          datasets: [
            {
              label: 'Facility Performance (ISO 59020)',
              data: [96, 92, 95],
              borderColor: '#15803D',
              backgroundColor: 'rgba(22, 163, 74, 0.22)', // Highly transparent green fill
              borderWidth: 2.5,
              pointBackgroundColor: '#15803D',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: 'Conventional Linear Baseline',
              data: [35, 28, 32],
              borderColor: '#9CA3AF',
              backgroundColor: 'rgba(156, 163, 175, 0.08)',
              borderDash: [5, 5],
              borderWidth: 1.5,
              pointBackgroundColor: '#9CA3AF',
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#1F2937',
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return ` ${context.dataset.label}: ${context.parsed.r}% Performance`;
                }
              }
            }
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 20,
                display: true,
                backdropColor: 'transparent',
                color: '#6B7280',
                font: { size: 10 }
              },
              pointLabels: {
                font: { size: 12, weight: '700' },
                color: '#1F2937'
              },
              grid: {
                color: 'rgba(209, 213, 219, 0.7)'
              },
              angleLines: {
                color: 'rgba(209, 213, 219, 0.7)'
              }
            }
          }
        }
      });
    }

    // Synchronize chart language labels immediately
    updateChartsLanguage(currentLang);

    // Synchronize dashboard numbers and charts immediately
    if (typeof calculateDashboard === 'function') {
      calculateDashboard();
    }
  }

  /**
   * Dynamically update Chart.js labels, dataset legends, and tooltips between English and Hindi
   * @param {string} lang - 'en' or 'hi'
   */
  function updateChartsLanguage(lang) {
    const isHi = (lang === 'hi');
    const yearLabels = isHi
      ? ['वर्ष 1', 'वर्ष 2', 'वर्ष 3', 'वर्ष 4', 'वर्ष 5']
      : ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

    if (teaChartInstance) {
      teaChartInstance.data.labels = yearLabels;
      teaChartInstance.data.datasets[0].label = isHi ? 'कैपेक्स (पूंजीगत मशीनरी व सेटअप)' : 'CAPEX (Setup & Machinery)';
      teaChartInstance.data.datasets[1].label = isHi ? 'ओपेक्स (बायोमास खरीद व श्रम)' : 'OPEX (Biomass Procurement & Labor)';
      teaChartInstance.data.datasets[2].label = isHi ? 'अनुमानित शुद्ध वर्तमान मूल्य (NPV)' : 'Projected Net Present Value (NPV)';
      teaChartInstance.options.plugins.tooltip.callbacks.label = function(context) {
        const val = context.parsed.y;
        const cr = (val / 100).toFixed(2);
        return isHi
          ? ` ${context.dataset.label}: ₹ ${val} लाख (₹ ${cr} करोड़)`
          : ` ${context.dataset.label}: ₹ ${val} Lakhs (₹ ${cr} Cr)`;
      };
      teaChartInstance.update('none');
    }

    if (lcaChartInstance) {
      lcaChartInstance.data.labels = yearLabels;
      lcaChartInstance.data.datasets[0].label = isHi ? 'रासायनिक उर्वरक बेसलाइन (यूरिया व डीएपी)' : 'Synthetic Fertilizer Baseline (Urea & DAP)';
      lcaChartInstance.data.datasets[1].label = isHi ? 'कृषिऊर्जा जैव-उर्वरक (नेट नेगेटिव मार्ग)' : 'KrishiUrja Bio-Fertilizer (Net Negative Pathway)';
      lcaChartInstance.options.plugins.tooltip.callbacks.label = function(context) {
        const val = context.parsed.y;
        return isHi
          ? ` ${context.dataset.label}: ${val > 0 ? '+' : ''}${val} किग्रा CO₂e / मीट्रिक टन`
          : ` ${context.dataset.label}: ${val > 0 ? '+' : ''}${val} kg CO₂e / MT`;
      };
      lcaChartInstance.update('none');
    }

    if (circularityChartInstance) {
      circularityChartInstance.data.labels = isHi
        ? ['संसाधन इनपुट', 'अपशिष्ट न्यूनतमकरण', 'ऊर्जा पुनर्प्राप्ति']
        : ['Resource Inflows', 'Outflows / Waste', 'Energy Recovery'];
      circularityChartInstance.data.datasets[0].label = isHi ? 'संयंत्र प्रदर्शन (ISO 59020)' : 'Facility Performance (ISO 59020)';
      circularityChartInstance.data.datasets[1].label = isHi ? 'पारंपरिक रैखिक बेसलाइन' : 'Conventional Linear Baseline';
      circularityChartInstance.options.plugins.tooltip.callbacks.label = function(context) {
        return isHi
          ? ` ${context.dataset.label}: ${context.parsed.r}% प्रदर्शन`
          : ` ${context.dataset.label}: ${context.parsed.r}% Performance`;
      };
      circularityChartInstance.update('none');
    }
  }

  // Attempt chart initialization immediately and on window load
  initCharts();
  window.addEventListener('load', () => {
    initCharts();
    if (typeof calculateDashboard === 'function') {
      calculateDashboard();
    }
  });

  /**
   * Recalculate financial model, life-cycle stats, and update Chart.js data
   */
  function calculateDashboard() {
    const tons = parseInt(capacitySlider.value, 10);
    if (displayCapacity) displayCapacity.textContent = `${tons} MT / Day`;

    // Financial formulas calibrated for Indian agricultural decentralized biorefineries
    // 50 MT/day benchmark: CAPEX 4.80 Cr, OPEX 1.65 Cr, Revenue 3.42 Cr
    const factor = tons / 50;

    const capex = (4.80 * Math.pow(factor, 0.72)).toFixed(2); // Economies of scale curve
    const opex = (1.65 * factor).toFixed(2);
    const revenue = (3.42 * factor).toFixed(2);
    const netProfit = (revenue - opex);
    const payback = (capex / (netProfit > 0 ? netProfit : 0.5)).toFixed(1);

    if (valCapex) valCapex.textContent = `₹ ${capex} Cr`;
    if (valOpex) valOpex.textContent = `₹ ${opex} Cr`;
    if (valRevenue) valRevenue.textContent = `₹ ${revenue} Cr`;
    if (valPayback) valPayback.textContent = `${payback} Years`;

    const farmerPayoutLakhs = Math.round(82.5 * factor);
    if (valFarmerPayout) valFarmerPayout.textContent = `₹ ${farmerPayoutLakhs} Lakhs / yr`;

    const fertilizerOfftakeCr = (2.15 * factor).toFixed(2);
    if (valFertilizerOfftake) valFertilizerOfftake.textContent = `₹ ${fertilizerOfftakeCr} Cr / yr`;

    const carbonRevLakhs = Math.round(44.5 * factor);
    if (valCarbonRev) valCarbonRev.textContent = `₹ ${carbonRevLakhs} Lakhs / yr`;

    // LCA Metrics
    const ghgAverted = Math.round(18250 * factor);
    if (valLcaGhg) valLcaGhg.textContent = `-${ghgAverted.toLocaleString()} tCO₂e`;

    const pmPrevented = Math.round(425 * factor);
    if (valLcaPm) valLcaPm.textContent = `${pmPrevented} Tons/yr`;

    const waterSaved = (28.4 * factor).toFixed(1);
    if (valLcaWater) valLcaWater.textContent = `${waterSaved} Million Liters`;

    // Update pill text metrics in cards
    if (cardTeaCapex) cardTeaCapex.textContent = `₹${capex} Cr`;
    if (cardTeaOpex) cardTeaOpex.textContent = `₹${opex} Cr`;
    if (cardTeaNpv) cardTeaNpv.textContent = `+₹${(8.4 * factor).toFixed(1)} Cr`;

    const scaledLcaBio = Math.round(-840 * factor);
    if (cardLcaBio) cardLcaBio.textContent = `${scaledLcaBio} kg/MT`;

    // Dynamically update Chart.js instances if initialized
    if (teaChartInstance) {
      teaChartInstance.data.datasets[0].data = [
        Math.round(480 * Math.pow(factor, 0.72)),
        Math.round(40 * factor),
        Math.round(25 * factor),
        Math.round(20 * factor),
        Math.round(20 * factor)
      ];
      teaChartInstance.data.datasets[1].data = [
        Math.round(165 * factor),
        Math.round(172 * factor),
        Math.round(180 * factor),
        Math.round(188 * factor),
        Math.round(195 * factor)
      ];
      teaChartInstance.data.datasets[2].data = [
        Math.round(120 * factor),
        Math.round(340 * factor),
        Math.round(580 * factor),
        Math.round(840 * factor),
        Math.round(1120 * factor)
      ];
      teaChartInstance.update('none');
    }

    if (lcaChartInstance) {
      lcaChartInstance.data.datasets[1].data = [
        Math.round(420 * factor),
        Math.round(150 * factor),
        Math.round(-140 * factor),
        Math.round(-520 * factor),
        Math.round(-840 * factor)
      ];
      lcaChartInstance.update('none');
    }
  }

  capacitySlider?.addEventListener('input', calculateDashboard);

  // Dashboard Tabs (TEA vs LCA)
  const tabTea = document.getElementById('tab-tea');
  const tabLca = document.getElementById('tab-lca');
  const paneTea = document.getElementById('pane-tea');
  const paneLca = document.getElementById('pane-lca');

  tabTea?.addEventListener('click', () => {
    tabTea.classList.add('active');
    tabTea.setAttribute('aria-selected', 'true');
    tabLca.classList.remove('active');
    tabLca.setAttribute('aria-selected', 'false');

    paneTea.hidden = false;
    paneTea.classList.add('active');
    paneLca.hidden = true;
    paneLca.classList.remove('active');
  });

  tabLca?.addEventListener('click', () => {
    tabLca.classList.add('active');
    tabLca.setAttribute('aria-selected', 'true');
    tabTea.classList.remove('active');
    tabTea.setAttribute('aria-selected', 'false');

    paneLca.hidden = false;
    paneLca.classList.add('active');
    paneTea.hidden = true;
    paneTea.classList.remove('active');
  });

  // =========================================================================
  // 6.1 'Will it Pay Off?' On-Farm ROI & Savings Calculator Engine
  // =========================================================================
  const roiForm = document.getElementById('roi-form');
  const roiFarmSizeInput = document.getElementById('roi-farm-size');
  const roiSyntheticSpendInput = document.getElementById('roi-synthetic-spend');
  const roiResultsContainer = document.getElementById('roi-results');

  /**
   * Calculates estimated savings over a 3-year timeline
   * Mock baseline: localized farm-waste bio-fertilizer production costs 40% less than synthetics
   */
  function calculateFarmerROI(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const farmSize = parseFloat(roiFarmSizeInput?.value) || 0;
    const syntheticSpend = parseFloat(roiSyntheticSpendInput?.value) || 0;

    if (syntheticSpend <= 0 || farmSize <= 0) {
      if (roiResultsContainer) {
        roiResultsContainer.innerHTML = `
          <div class="roi-error-msg">
            Please enter a valid farm size (&gt; 0 ha) and annual fertilizer spend (&gt; ₹0) to compute your 3-year projected savings.
          </div>
        `;
      }
      return;
    }

    // Baseline assumption: bio-fertilizer costs 40% less than synthetics
    const discountRate = 0.40;
    const annualSavings = syntheticSpend * discountRate;
    const threeYearSavings = annualSavings * 3;
    const newAnnualSpend = syntheticSpend * (1 - discountRate);
    const savingsPerHaAnnual = annualSavings / farmSize;
    const savingsPerHaThreeYear = threeYearSavings / farmSize;

    // Environmental metrics
    const carbonAvoided = (farmSize * 1.8 * 3).toFixed(1); // 1.8 tCO2e / ha / year

    // Helper formatter for Indian Rupee currency display
    const formatINR = (num) => '₹ ' + Math.round(num).toLocaleString('en-IN');

    if (!roiResultsContainer) return;

    // Only force CSS animation restart on explicit submit/click, not on live keystroke events
    if (e) {
      roiResultsContainer.classList.remove('roi-fade-in');
      void roiResultsContainer.offsetWidth; // Force CSS animation restart
      roiResultsContainer.classList.add('roi-fade-in');
    } else if (!roiResultsContainer.classList.contains('roi-fade-in')) {
      roiResultsContainer.classList.add('roi-fade-in');
    }

    const isHi = (currentLang === 'hi');
    const subtext = isHi
      ? `अपने <strong>${farmSize} हेक्टेयर</strong> खेत को स्थानीय कृषि-अपशिष्ट बायोरिफाइनरी जैविक-खनिज उर्वरक मॉडल में बदलकर, आप रासायनिक यूरिया और डीएपी की तुलना में हर साल <strong>${formatINR(annualSavings)}</strong> की सीधी बचत करते हैं।`
      : `By switching your <strong>${farmSize} hectare</strong> farm to a localized farm-waste biorefinery organo-mineral fertilizer model, you save <strong>${formatINR(annualSavings)}</strong> every single year compared to synthetic Urea &amp; DAP.`;

    roiResultsContainer.innerHTML = `
      <div class="roi-results-card">
        
        <!-- Hero Result: 3-Year Projected Savings in Massive Bold Font (Green Accent) -->
        <div class="roi-hero-result">
          <div class="rhr-header-row">
            <span class="rhr-badge" data-i18n="roi_farmer_profitability">Projected Farmer Profitability</span>
            <div class="rhr-actions-group">
              <span class="rhr-guarantee-pill">
                <span class="pulse-dot"></span> <span data-i18n="roi_cost_advantage">40% Cost Advantage</span>
              </span>
              <button type="button" class="btn-share-whatsapp" id="btn-share-whatsapp" aria-label="Share on WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span data-i18n="btn_share_whatsapp">Share on WhatsApp</span>
              </button>
            </div>
          </div>

          <div class="rhr-title-label" data-i18n="roi_3yr_savings">3-Year Projected Savings</div>
          <div class="rhr-massive-value text-green" id="roi-massive-savings">
            ${formatINR(threeYearSavings)}
          </div>
          
          <p class="rhr-subtext" id="roi-subtext">
            ${subtext}
          </p>
        </div>

        <!-- Metric Statistics Grid -->
        <div class="roi-metrics-grid">
          <div class="roi-stat-box">
            <span class="rsb-label" data-i18n="roi_annual_savings">Annual Cost Savings</span>
            <strong class="rsb-value text-green">${formatINR(annualSavings)} / yr</strong>
            <span class="rsb-sub" data-i18n="roi_annual_savings_sub">40% direct input spend reduction</span>
          </div>

          <div class="roi-stat-box">
            <span class="rsb-label" data-i18n="roi_savings_per_ha">Savings Per Hectare</span>
            <strong class="rsb-value text-charcoal">${formatINR(savingsPerHaAnnual)} / ha / yr</strong>
            <span class="rsb-sub">${formatINR(savingsPerHaThreeYear)} ${isHi ? '3 वर्षों में कुल' : 'total over 3 years'}</span>
          </div>

          <div class="roi-stat-box">
            <span class="rsb-label" data-i18n="roi_new_spend">New Annual Bio-Fertilizer Spend</span>
            <strong class="rsb-value text-charcoal">${formatINR(newAnnualSpend)} / yr</strong>
            <span class="rsb-sub">${isHi ? 'रासायनिक उर्वरकों के' : 'Down from'} ${formatINR(syntheticSpend)} ${isHi ? 'से घटकर' : 'on synthetics'}</span>
          </div>

          <div class="roi-stat-box">
            <span class="rsb-label" data-i18n="roi_carbon_abatement">3-Yr Carbon Abatement</span>
            <strong class="rsb-value text-saffron">${carbonAvoided} tCO₂e</strong>
            <span class="rsb-sub" data-i18n="roi_carbon_abatement_sub">Avoided stubble burning &amp; soil carbon sequestration</span>
          </div>
        </div>

        <!-- 3-Year Cumulative Savings Trajectory Timeline -->
        <div class="roi-trajectory-container">
          <div class="rtc-header">
            <span class="rtc-title" data-i18n="roi_trajectory_title">3-Year Cumulative Savings Trajectory</span>
            <span class="rtc-tag" data-i18n="roi_trajectory_tag">Zero Capital Expenditure &bull; FPO Farmgate Delivery</span>
          </div>
          <div class="rtc-steps-grid">
            <div class="rtc-step">
              <span class="rtc-step-badge" data-i18n="roi_year1">Year 1</span>
              <div class="rtc-step-amount text-charcoal">${formatINR(annualSavings)}</div>
              <div class="rtc-step-note" data-i18n="roi_year1_note">Immediate 40% input cut</div>
            </div>
            <div class="rtc-step">
              <span class="rtc-step-badge" data-i18n="roi_year2">Year 2</span>
              <div class="rtc-step-amount text-charcoal">${formatINR(annualSavings * 2)}</div>
              <div class="rtc-step-note" data-i18n="roi_year2_note">Soil carbon &amp; moisture retention gains</div>
            </div>
            <div class="rtc-step rtc-step-highlight">
              <span class="rtc-step-badge bg-green text-white" data-i18n="roi_year3">Year 3 Total</span>
              <div class="rtc-step-amount text-green">${formatINR(threeYearSavings)}</div>
              <div class="rtc-step-note" data-i18n="roi_year3_note">Cumulative net profit &amp; improved yield</div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Immediately translate newly injected dynamic ROI elements to active language
    translateDynamicContainer(roiResultsContainer);

    // Bind WhatsApp Share button
    const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
    btnShareWhatsapp?.addEventListener('click', () => {
      handleWhatsAppShare(threeYearSavings, farmSize);
    });

    if (e && typeof showToast === 'function') {
      showToast(`Projected 3-Year Savings calculated: ${formatINR(threeYearSavings)}`);
    }
  }

  /**
   * Native Web Share API with graceful fallback to WhatsApp Web / Direct Intent
   */
  function handleWhatsAppShare(threeYearSavings, farmSize) {
    const isHi = (currentLang === 'hi');
    const formatted = '₹ ' + Math.round(threeYearSavings).toLocaleString('en-IN');
    const shareTitle = isHi ? 'मेरी कृषिऊर्जा बायोरिफाइनरी बचत' : 'My BioRefinery ROI';
    const shareText = isHi
      ? `मैंने अपने ${farmSize} हेक्टेयर खेत के लिए कृषि-अपशिष्ट से 3 वर्षों में ${formatted} की बचत का अनुमान लगाया है! विवरण यहाँ देखें:`
      : `I can save ${formatted} over 3 years on fertilizer using localized farm waste! Calculate your farm savings:`;
    const shareUrl = window.location.href.split('#')[0] + '#roi-calculator';

    try {
      if (navigator.share && typeof navigator.share === 'function') {
        navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        }).then(() => {
          showToast(isHi ? 'सफलतापूर्वक साझा किया गया!' : 'Shared successfully!');
        }).catch((err) => {
          if (err && err.name !== 'AbortError') {
            openWhatsAppDirect(shareText, shareUrl);
          }
        });
      } else {
        openWhatsAppDirect(shareText, shareUrl);
      }
    } catch (shareErr) {
      console.warn('[WebShare] Native share failed or unsupported, using direct link fallback:', shareErr);
      openWhatsAppDirect(shareText, shareUrl);
    }
  }

  function openWhatsAppDirect(text, url) {
    try {
      const isHi = (currentLang === 'hi');
      showToast(isHi ? 'व्हाट्सएप खोला जा रहा है...' : 'Opening WhatsApp...');
      const message = encodeURIComponent(`${text} ${url}`);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${message}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (directErr) {
      console.warn('[WhatsApp] Direct window open failed:', directErr);
    }
  }

  // Prevent default form submission and trigger calculation
  roiForm?.addEventListener('submit', (e) => {
    calculateFarmerROI(e);
  });

  // Calculate button click listener
  const btnCalculateRoi = document.getElementById('btn-calculate-roi');
  btnCalculateRoi?.addEventListener('click', (e) => {
    calculateFarmerROI(e);
  });

  // Debounce helper for live calculation on low-end mobile devices
  function debounce(fn, delayMs) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delayMs);
    };
  }

  const debouncedCalculateRoi = debounce(() => {
    calculateFarmerROI(null);
  }, 150);

  // Live calculation updates on input change with debounce to prevent DOM thrashing
  roiFarmSizeInput?.addEventListener('input', debouncedCalculateRoi);
  roiSyntheticSpendInput?.addEventListener('input', debouncedCalculateRoi);

  // =========================================================================
  // 7. Module 04: Risk Management & Regulatory Compliance Matrix
  // =========================================================================
  const fmeaMockData = [
    {
      potentialFailure: "Post-Kharif Biomass Supply Crunch (Crop Burning Window)",
      potentialFailure_hi: "खरीफ बाद बायोमास आपूर्ति संकट (पराली जलाने की अवधि)",
      severity: 8,
      occurrence: 5,
      detection: 4,
      mitigationStrategy: "Decentralized GPS-tracked village baling hubs; 4-month covered buffer briquette depot storage; flexible multi-feedstock processing.",
      mitigationStrategy_hi: "विकेंद्रीकृत जीपीएस-ट्रैक्ड ग्राम बेलिंग हब; 4 महीने का कवर्ड बफर ब्रिकेट भंडारण; लचीला बहु-बायोमास प्रसंस्करण।"
    },
    {
      potentialFailure: "Pyrolysis Retort Thermal Runaway / Incomplete Gas Cracking",
      potentialFailure_hi: "पायरोलिसिस रिटॉर्ट थर्मल रनवे / अधूरा गैस क्रैकिंग",
      severity: 9,
      occurrence: 2,
      detection: 3,
      mitigationStrategy: "Automated nitrogen purge systems, dual redundant IR pyrometers, emergency thermal oxidizer flare with acoustic pressure release.",
      mitigationStrategy_hi: "स्वचालित नाइट्रोजन पर्ज सिस्टम, दोहरे आईआर पायरोमीटर, ध्वनिक दबाव रिलीज के साथ आपातकालीन थर्मल फ्लेयर।"
    },
    {
      potentialFailure: "Microbial Consortia Contamination by Soil Pathogens",
      potentialFailure_hi: "मृदा रोगजनकों द्वारा माइक्रोबियल मिश्रण का संदूषण",
      severity: 7,
      occurrence: 3,
      detection: 2,
      mitigationStrategy: "Steam-autoclaved biochar carrier sterilization (121°C, 30 min); cleanroom liquid broth inoculation; qPCR batch purity verification.",
      mitigationStrategy_hi: "भाप-ऑटोक्लेव्ड बायोचार वाहक नसबंदी (121°C, 30 मिनट); क्लीनरूम तरल इनोकुलेशन; क्यूपीसीआर बैच शुद्धता सत्यापन।"
    },
    {
      potentialFailure: "Moisture Shock in Feedstock Balings during Monsoon",
      potentialFailure_hi: "मानसून के दौरान बायोमास गांठों में नमी का झटका",
      severity: 6,
      occurrence: 4,
      detection: 2,
      mitigationStrategy: "Waste-heat flue gas rotary cascade drying drum; automated moisture gate sensor interlocks rejecting feedstock >25% moisture.",
      mitigationStrategy_hi: "अपशिष्ट-ताप ग्रिप गैस रोटरी ड्रायर ड्रम; >25% नमी वाले कच्चे माल को अस्वीकार करने वाले स्वचालित सेंसर इंटरलॉक।"
    },
    {
      potentialFailure: "Heavy Metal Accumulation Exceeding Statutory Tolerances",
      potentialFailure_hi: "भारी धातुओं का वैधानिक सीमा से अधिक संचय",
      severity: 9,
      occurrence: 2,
      detection: 2,
      mitigationStrategy: "Upstream Atomic Absorption Spectrometry (AAS) screening of rock phosphate batches; certified vendor provenance for mineral inputs.",
      mitigationStrategy_hi: "रॉक फॉस्फेट बैचों की एएएस स्पेक्ट्रोमेट्री जांच; खनिज आदानों के लिए प्रमाणित विक्रेता सत्यापन।"
    },
    {
      potentialFailure: "Granule Attrition & Biochar Dusting in Rural Transit",
      potentialFailure_hi: "ग्रामीण परिवहन में दानों का टूटना एवं बायोचार धूल बनना",
      severity: 5,
      occurrence: 4,
      detection: 3,
      mitigationStrategy: "Chitosan-starch cross-linked nanocomposite binder coating ensuring >25 N/granule crushing strength; sealed HDPE moisture-proof bags.",
      mitigationStrategy_hi: "काइटोसन-स्टार्च नैनोकम्पोजिट बाइंडर कोटिंग (>25 N प्रति दाना पेराई ताकत); सीलबंद नमी-रोधी एचडीपीई बैग।"
    }
  ];

  const fcoComplianceMetrics = [
    {
      name: "Viable Microbial Colony Count",
      name_hi: "जीवित सूक्ष्मजीवी कॉलोनी संख्या",
      standard: "Minimum 5 × 10⁷ CFU/g (Azotobacter, Rhizobium, PSB)",
      standard_hi: "न्यूनतम 5 × 10⁷ CFU/g (एजोटोबैक्टर, राइजोबियम, पीएसबी)",
      actual: "1.8 × 10⁸ CFU/g (Assayed at 30°C)",
      actual_hi: "1.8 × 10⁸ CFU/g (30°C पर परीक्षित)",
      status: true,
      category: "Microbiological Specification"
    },
    {
      name: "pH Buffer Range (1:5 dilution)",
      name_hi: "पीएच बफर सीमा (1:5 तनुकरण)",
      standard: "6.5 – 7.5 (Neutral to mildly alkaline)",
      standard_hi: "6.5 – 7.5 (तटस्थ से हल्का क्षारीय)",
      actual: "7.1 ± 0.2 (Optimal for Indian soils)",
      actual_hi: "7.1 ± 0.2 (भारतीय मिट्टी के लिए इष्टतम)",
      status: true,
      category: "Chemical Balance"
    },
    {
      name: "Total Organic Carbon Content",
      name_hi: "कुल जैविक कार्बन मात्रा",
      standard: "Minimum 14.0% by weight (Schedule IV)",
      standard_hi: "वजन के अनुसार न्यूनतम 14.0% (अनुसूची IV)",
      actual: "22.4% (Enriched recalcitrant biochar)",
      actual_hi: "22.4% (समृद्ध बायोचार कार्बन)",
      status: true,
      category: "Soil Health Index"
    },
    {
      name: "Moisture Content (Free Water)",
      name_hi: "नमी की मात्रा (मुक्त जल)",
      standard: "Maximum 15.0% by weight for solid granules",
      standard_hi: "ठोस दानों के लिए वजन के अनुसार अधिकतम 15.0%",
      actual: "12.8% (Free-flowing granules)",
      actual_hi: "12.8% (मुक्त-प्रवाह दानेदार)",
      status: true,
      category: "Physical Quality"
    },
    {
      name: "Heavy Metals: Lead (Pb)",
      name_hi: "भारी धातु: सीसा (लेड - Pb)",
      standard: "Max. 100.0 mg/kg limit",
      standard_hi: "अधिकतम 100.0 mg/kg सीमा",
      actual: "0.08 mg/kg (99.9% below threshold)",
      actual_hi: "0.08 mg/kg (सीमा से 99.9% कम)",
      status: true,
      category: "Toxicological Safety"
    },
    {
      name: "Heavy Metals: Cadmium (Cd)",
      name_hi: "भारी धातु: कैडमियम (Cd)",
      standard: "Max. 5.0 mg/kg limit",
      standard_hi: "अधिकतम 5.0 mg/kg सीमा",
      actual: "0.02 mg/kg (Zero toxic hazard)",
      actual_hi: "0.02 mg/kg (शून्य विषाक्त खतरा)",
      status: true,
      category: "Toxicological Safety"
    },
    {
      name: "Heavy Metals: Arsenic (As)",
      name_hi: "भारी धातु: आर्सेनिक (As)",
      standard: "Max. 10.0 mg/kg limit",
      standard_hi: "अधिकतम 10.0 mg/kg सीमा",
      actual: "0.12 mg/kg (Passed safety threshold)",
      actual_hi: "0.12 mg/kg (सुरक्षा मानक उत्तीर्ण)",
      status: true,
      category: "Toxicological Safety"
    },
    {
      name: "Biological Pathogen Screening (Salmonella & E. coli)",
      name_hi: "जैविक रोगजनक जांच (साल्मोनेला एवं ई. कोलाई)",
      standard: "Nil / Absent in 20g sample",
      standard_hi: "20 ग्राम नमूने में शून्य / अनुपस्थित",
      actual: "Zero Detect (Thermal sterilization pass)",
      actual_hi: "शून्य संसूचन (थर्मल नसबंदी पास)",
      status: true,
      category: "Biological Safety"
    },
    {
      name: "Particle Size Granulometry (2.0 – 4.0 mm)",
      name_hi: "कण आकार ग्रैन्युलोमेट्री (2.0 – 4.0 मिमी)",
      standard: "Min. 90% material passing through 4mm sieve",
      standard_hi: "4 मिमी छलनी से न्यूनतम 90% सामग्री उत्तीर्ण",
      actual: "87.4% (Batch sieving calibration in progress)",
      actual_hi: "87.4% (बैच छानने का अंशांकन प्रगति पर)",
      status: false, // Testing false/fail conditional rendering -> renders prominent Saffron/Orange 'Warning' badge
      category: "Mechanical Specification"
    }
  ];

  /**
   * Dynamically generate FMEA table rows and inject into <tbody>
   */
  function renderFMEATable() {
    const tbody = document.getElementById('fmea-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const isHi = (currentLang === 'hi');

    fmeaMockData.forEach(item => {
      const tr = document.createElement('tr');

      const getBadgeClass = (val) => {
        if (val >= 8) return 'high';
        if (val >= 5) return 'med';
        return 'low';
      };

      const failure = isHi && item.potentialFailure_hi ? item.potentialFailure_hi : item.potentialFailure;
      const strategy = isHi && item.mitigationStrategy_hi ? item.mitigationStrategy_hi : item.mitigationStrategy;

      tr.innerHTML = `
        <td class="td-failure">${failure}</td>
        <td class="th-num"><span class="fmea-num-badge ${getBadgeClass(item.severity)}">${item.severity}</span></td>
        <td class="th-num"><span class="fmea-num-badge ${getBadgeClass(item.occurrence)}">${item.occurrence}</span></td>
        <td class="th-num"><span class="fmea-num-badge ${getBadgeClass(item.detection)}">${item.detection}</span></td>
        <td class="td-strategy">${strategy}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  /**
   * Loop through compliance metrics and inject into checklist with conditional rendering
   */
  function renderFCOChecklist() {
    const listEl = document.getElementById('fco-checklist');
    if (!listEl) return;

    listEl.innerHTML = '';
    const isHi = (currentLang === 'hi');

    fcoComplianceMetrics.forEach(metric => {
      const li = document.createElement('li');
      li.className = 'fco-item';

      const badgeText = isHi
        ? (metric.status ? '✓ उत्तीर्ण' : '⚠ चेतावनी')
        : (metric.status ? '✓ Pass' : '⚠ Warning');

      const badgeHtml = metric.status
        ? `<span class="badge-status badge-pass" role="status" aria-label="${badgeText}: ${metric.name}">${badgeText}</span>`
        : `<span class="badge-status badge-warning" role="status" aria-label="${badgeText}: ${metric.name}">${badgeText}</span>`;

      const name = isHi && metric.name_hi ? metric.name_hi : metric.name;
      const std = isHi && metric.standard_hi ? metric.standard_hi : metric.standard;
      const act = isHi && metric.actual_hi ? metric.actual_hi : metric.actual;
      const stdLabel = isHi ? 'मानक:' : 'Standard:';
      const actLabel = isHi ? 'परख परिणाम:' : 'Assay Result:';

      li.innerHTML = `
        <div class="fco-metric-info">
          <span class="fco-metric-name">${name}</span>
          <span class="fco-metric-standard"><strong>${stdLabel}</strong> ${std}</span>
          <span class="fco-metric-actual"><strong>${actLabel}</strong> ${act}</span>
        </div>
        ${badgeHtml}
      `;

      listEl.appendChild(li);
    });
  }

  // =========================================================================
  // 8. Interactive Feedback Toast Notifications
  // =========================================================================
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotification || !toastMessage) return;

    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    toastNotification.setAttribute('aria-hidden', 'false');

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
      toastNotification.setAttribute('aria-hidden', 'true');
    }, 3400);
  }

  // Statutory dossier download action
  const btnDownloadDossier = document.getElementById('btn-download-dossier');
  btnDownloadDossier?.addEventListener('click', () => {
    showToast('Detailed Project Report (DPR) & FCO Statutory Dossier generated for single-window clearance!');
  });

  // Quick navigation CTA action
  const btnQuickAudit = document.getElementById('btn-quick-audit');
  btnQuickAudit?.addEventListener('click', () => {
    showToast('Opening Techno-Economic & Life Cycle Simulation Dashboard');
  });

  // =========================================================================
  // 8. Integrated Field Operations: OpenWeatherMap & Google Maps Soil Lab Connectivity
  // =========================================================================
  let currentLat = 28.6139; // Default: Central Indo-Gangetic Plains (New Delhi / Ludhiana)
  let currentLon = 77.2090;

  const weatherTempEl = document.getElementById('weather-temp');
  const weatherHumidityEl = document.getElementById('weather-humidity');
  const weatherWindEl = document.getElementById('weather-wind');
  const weatherLocationEl = document.getElementById('weather-location');
  const weatherRecommendationEl = document.getElementById('weather-recommendation');
  const weatherStatusTextEl = document.getElementById('weather-status-text');
  const weatherMoistureStatusEl = document.getElementById('weather-moisture-status');
  const weatherConditionTextEl = document.getElementById('weather-condition-text');
  const btnRefreshWeather = document.getElementById('btn-refresh-weather');
  const btnDetectLocation = document.getElementById('btn-detect-location');

  let latestWeatherKey = "weather_ideal";

  function updateWeatherAdvisoryLanguage() {
    if (!weatherRecommendationEl) return;
    const dict = (typeof translations !== 'undefined') ? translations : (window.translations || null);
    if (dict && dict[currentLang] && dict[currentLang][latestWeatherKey]) {
      weatherRecommendationEl.textContent = dict[currentLang][latestWeatherKey];
    }
  }

  /**
   * Asynchronously fetch real-time agricultural weather conditions from OpenWeatherMap API
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async function fetchLocalWeather(lat, lon) {
    currentLat = lat || currentLat;
    currentLon = lon || currentLon;

    if (weatherStatusTextEl) {
      weatherStatusTextEl.textContent = currentLang === 'hi' ? 'मौसम लोड हो रहा है...' : 'Updating Weather...';
    }

    try {
      let data;
      // If live API key is not yet configured, gracefully fall back to localized agricultural simulation
      if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        await new Promise(res => setTimeout(res, 350)); // Realistic network latency simulation
        data = {
          name: (lat && Math.abs(lat - 30.9) < 2) ? "Ludhiana (Punjab Agri-Hub)" : "Indo-Gangetic Plains",
          main: {
            temp: 24.6,
            humidity: 58,
            pressure: 1012
          },
          wind: {
            speed: 3.4 // m/s = 12.2 km/h
          },
          weather: [
            { main: "Clear", description: currentLang === 'hi' ? "शांत धूप एवं अनुकूल हवा" : "Mild sunny, clear skies" }
          ],
          isDemo: true
        };
      } else {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLat}&lon=${currentLon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`OpenWeather API HTTP ${response.status}`);
        }
        data = await response.json();
      }

      const temp = Math.round(data.main.temp * 10) / 10;
      const humidity = data.main.humidity;
      const windSpeedKmH = Math.round((data.wind?.speed || 0) * 3.6);
      const locName = data.name || (currentLang === 'hi' ? "स्थानीय कृषि क्षेत्र" : "Local Agricultural Zone");

      if (weatherTempEl) weatherTempEl.textContent = `${temp}°C`;
      if (weatherHumidityEl) weatherHumidityEl.textContent = `${humidity}%`;
      if (weatherWindEl) weatherWindEl.textContent = `${windSpeedKmH} km/h`;
      if (weatherLocationEl) weatherLocationEl.textContent = `${locName} • GPS Sync`;
      if (weatherMoistureStatusEl) {
        weatherMoistureStatusEl.textContent = humidity >= 50 
          ? (currentLang === 'hi' ? 'बीजाणु अवशोषण अनुकूल' : 'Optimal Spore Absorption')
          : (currentLang === 'hi' ? 'कम नमी चेतावनी' : 'Low Moisture Advisory');
      }
      if (weatherConditionTextEl) {
        weatherConditionTextEl.textContent = data.weather?.[0]?.description || (currentLang === 'hi' ? 'स्थिर वायुमंडलीय दबाव' : 'Stable Barometric Pressure');
      }

      // Dynamic Agronomic Bio-Fertilizer Recommendation
      if (temp >= 20 && temp <= 30) {
        latestWeatherKey = "weather_ideal";
      } else if (temp > 30) {
        latestWeatherKey = "weather_warm";
      } else {
        latestWeatherKey = "weather_cool";
      }

      updateWeatherAdvisoryLanguage();

      if (weatherStatusTextEl) {
        weatherStatusTextEl.textContent = data.isDemo 
          ? (currentLang === 'hi' ? 'सिम्युलेटेड मौसम' : 'Simulated Agro-Weather')
          : (currentLang === 'hi' ? 'लाइव मौसम सक्रिय' : 'Live GPS Weather');
      }

    } catch (err) {
      console.warn('[OpenWeatherMap] Fetch failed or offline, applying resilient offline parameters:', err);
      if (weatherTempEl) weatherTempEl.textContent = '24.0°C';
      if (weatherHumidityEl) weatherHumidityEl.textContent = '55%';
      if (weatherWindEl) weatherWindEl.textContent = '10 km/h';
      if (weatherLocationEl) weatherLocationEl.textContent = currentLang === 'hi' ? 'ऑफलाइन डिफ़ॉल्ट ज़ोन' : 'Offline Default Zone';
      latestWeatherKey = 'weather_ideal';
      updateWeatherAdvisoryLanguage();
      if (weatherStatusTextEl) {
        weatherStatusTextEl.textContent = currentLang === 'hi' ? 'ऑफलाइन सलाह' : 'Offline Advisory';
      }
    }
  }

  btnRefreshWeather?.addEventListener('click', () => {
    fetchLocalWeather(currentLat, currentLon);
    showToast(currentLang === 'hi' ? 'स्थानीय मौसम की जानकारी ताज़ा की गई' : 'Refreshed local agricultural weather');
  });

  btnDetectLocation?.addEventListener('click', () => {
    if (navigator.geolocation) {
      showToast(currentLang === 'hi' ? 'जीपीएस स्थान का पता लगाया जा रहा है...' : 'Detecting GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentLat = pos.coords.latitude;
          currentLon = pos.coords.longitude;
          fetchLocalWeather(currentLat, currentLon);
          if (window.googleMapInstance) {
            window.googleMapInstance.setCenter({ lat: currentLat, lng: currentLon });
          }
          showToast(currentLang === 'hi' ? 'जीपीएस स्थान सफलतापूर्वक सिंक्रनाइज़ किया गया' : 'GPS location synchronized successfully');
        },
        () => {
          fetchLocalWeather(currentLat, currentLon);
          showToast(currentLang === 'hi' ? 'जीपीएस अनुपलब्ध: डिफ़ॉल्ट कृषि हब का उपयोग कर रहे हैं' : 'GPS unavailable: Using regional agricultural hub');
        },
        { timeout: 7000 }
      );
    } else {
      fetchLocalWeather(currentLat, currentLon);
    }
  });

  // Verified ICAR & State Agricultural University Soil Testing Labs
  const verifiedSoilLabs = [
    {
      name: "ICAR - Indian Agricultural Research Institute (IARI) Soil Testing Lab",
      name_hi: "आईसीएआर - भारतीय कृषि अनुसंधान संस्थान (पूसा) मृदा परीक्षण प्रयोगशाला",
      authority: "Division of Soil Science & Agricultural Chemistry",
      authority_hi: "मृदा विज्ञान एवं कृषि रसायन संभाग",
      lat: 28.6387,
      lng: 77.1588,
      address: "Pusa Campus, New Delhi 110012",
      tat: "48 Hours / 48 घंटे"
    },
    {
      name: "Punjab Agricultural University (PAU) Central Soil Lab",
      name_hi: "पंजाब कृषि विश्वविद्यालय (पीएयू) केंद्रीय मृदा परीक्षण प्रयोगशाला",
      authority: "Department of Soil Science, PAU",
      authority_hi: "मृदा विज्ञान विभाग, पीएयू",
      lat: 30.9010,
      lng: 75.8073,
      address: "Ferozepur Road, Ludhiana, Punjab 141004",
      tat: "24-48 Hours / 24-48 घंटे"
    },
    {
      name: "ICAR - Indian Institute of Soil Science (IISS)",
      name_hi: "आईसीएआर - भारतीय मृदा विज्ञान संस्थान (आईआईएसएस)",
      authority: "National Soil Health & Bio-Fertilizer Division",
      authority_hi: "राष्ट्रीय मृदा स्वास्थ्य एवं जैव-उर्वरक प्रभाग",
      lat: 23.3104,
      lng: 77.4042,
      address: "Berasia Road, Nabibagh, Bhopal, MP 462038",
      tat: "48 Hours / 48 घंटे"
    },
    {
      name: "Chaudhary Charan Singh Haryana Agricultural University (CCSHAU)",
      name_hi: "चौधरी चरण सिंह हरियाणा कृषि विश्वविद्यालय (एचएयू) मृदा लैब",
      authority: "Regional Soil & Water Testing Center",
      authority_hi: "क्षेत्रीय मृदा एवं जल परीक्षण केंद्र",
      lat: 29.1492,
      lng: 75.7058,
      address: "Hisar, Haryana 125004",
      tat: "48 Hours / 48 घंटे"
    },
    {
      name: "UAS Bangalore Agricultural Soil Testing Center",
      name_hi: "कृषि विज्ञान विश्वविद्यालय (यूएएस) मृदा परीक्षण केंद्र",
      authority: "University of Agricultural Sciences",
      authority_hi: "कृषि विज्ञान विश्वविद्यालय, बेंगलुरु",
      lat: 13.0784,
      lng: 77.5818,
      address: "GKVK Campus, Bengaluru, Karnataka 560065",
      tat: "48 Hours / 48 घंटे"
    }
  ];

  function renderSoilLabMapFallback(container, labs) {
    if (!container) return;
    const isHi = (currentLang === 'hi');
    const labsList = labs || verifiedSoilLabs;
    container.innerHTML = `
      <div class="soil-lab-fallback">
        <div class="slf-header">
          <span class="slf-title">${isHi ? 'मान्यता प्राप्त मृदा परीक्षण केंद्र (निकटतम)' : 'Accredited Soil Testing Centers (Nearest)'}</span>
          <span class="slf-badge">${isHi ? '✓ आईसीएआर / केवीके नेटवर्क' : '✓ ICAR / KVK Network'}</span>
        </div>
        <div class="slf-labs-list">
          ${labsList.slice(0, 3).map(lab => `
            <div class="slf-lab-item">
              <div class="slf-lab-info">
                <h5>${isHi ? lab.name_hi : lab.name}</h5>
                <p>${isHi ? lab.authority_hi : lab.authority} &bull; ${lab.address}</p>
              </div>
              <div class="slf-lab-dist">${lab.tat}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Initializes Google Map and plots nearest soil testing laboratories
   */
  function initMap() {
    const mapContainer = document.getElementById('soil-lab-map');
    if (!mapContainer) return;

    const defaultCenter = { lat: currentLat, lng: currentLon };

    if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
      try {
        const map = new google.maps.Map(mapContainer, {
          center: defaultCenter,
          zoom: 7,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] }
          ]
        });
        window.googleMapInstance = map;

        // Try geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(userLoc);
            new google.maps.Marker({
              position: userLoc,
              map: map,
              title: currentLang === 'hi' ? 'आपका खेत' : 'Your Farm Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: '#EA580C',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2.5
              }
            });
          }, () => {
            // Keep default center
          });
        }

        // Plot soil lab markers
        verifiedSoilLabs.forEach(lab => {
          const marker = new google.maps.Marker({
            position: { lat: lab.lat, lng: lab.lng },
            map: map,
            title: lab.name,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: '#15803D',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 1.5
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family: Inter, sans-serif; padding: 6px; max-width: 240px;">
                <strong style="color: #1F2937; font-size: 13px; display: block; margin-bottom: 3px;">${currentLang === 'hi' ? lab.name_hi : lab.name}</strong>
                <p style="margin: 0 0 4px 0; color: #4B5563; font-size: 11px;">${lab.address}</p>
                <span style="color: #15803D; font-weight: 700; font-size: 11px;">Turnaround: ${lab.tat}</span>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        });

        return;
      } catch (err) {
        console.warn('[GoogleMaps] Live map initialization failed:', err);
      }
    }

    // Neobrutalist Fallback UI when API key is placeholder or offline
    renderSoilLabMapFallback(mapContainer, verifiedSoilLabs);
  }

  // Assign to global bridges
  window.triggerInitMap = initMap;
  window.initMap = initMap;

  // Initial calculation and data rendering runs (wrapped defensively)
  try { calculateFormulation(); } catch (e) { console.warn('[Init] Formulation calculation error:', e); }
  try { calculateDashboard(); } catch (e) { console.warn('[Init] Dashboard calculation error:', e); }
  try { calculateFarmerROI(); } catch (e) { console.warn('[Init] ROI calculation error:', e); }
  try { renderFMEATable(); } catch (e) { console.warn('[Init] FMEA rendering error:', e); }
  try { renderFCOChecklist(); } catch (e) { console.warn('[Init] FCO rendering error:', e); }
  try { fetchLocalWeather(currentLat, currentLon); } catch (e) { console.warn('[Init] Weather fetch error:', e); }
  try { initMap(); } catch (e) { console.warn('[Init] Map initialization error:', e); }
  try { selectRegionalState('PB', false); } catch (e) { console.warn('[Init] Regional state selection error:', e); }
  try { renderWasteAnalysis('rice-husk', false); } catch (e) { console.warn('[Init] Feedstock analysis rendering error:', e); }

  // Mark app as fully initialized so subsequent language toggles update all dynamic components
  isAppInitialized = true;

  // =========================================================================
  // 10. Task 1: Enterprise PDF Export (html2pdf.js)
  // =========================================================================
  try {
    const btnExportPdf = document.getElementById('btn-export-pdf');
    const dashboardContainer = document.getElementById('dashboard-container');

    if (btnExportPdf && dashboardContainer) {
      btnExportPdf.addEventListener('click', async () => {
        const isHi = (currentLang === 'hi');
        if (typeof html2pdf === 'undefined') {
          showToast(isHi ? 'पीडीएफ इंजन लोड हो रहा है या ऑफलाइन है... सिस्टम प्रिंट खोल रहे हैं' : 'PDF engine loading or offline... Opening system print');
          window.print();
          return;
        }

        const originalHtml = btnExportPdf.innerHTML;
        btnExportPdf.disabled = true;
        btnExportPdf.innerHTML = `
          <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #FFFFFF; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 6px;"></span>
          <span>${isHi ? 'पीडीएफ तैयार हो रहा है...' : 'Generating PDF...'}</span>
        `;

        showToast(isHi ? 'उच्च गुणवत्ता वाली पीडीएफ रिपोर्ट तैयार की जा रही है...' : 'Generating enterprise high-fidelity PDF report...');

        const opt = {
          margin: 10,
          filename: 'KrishiUrja_BioRefinery_Report.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#F8FAF9'
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        try {
          await html2pdf().set(opt).from(dashboardContainer).save();
          showToast(isHi ? 'रिपोर्ट सफलतापूर्वक डाउनलोड हो गई!' : 'KrishiUrja Report downloaded successfully!');
        } catch (err) {
          console.warn('[PDF Export] html2pdf error, using browser print fallback:', err);
          showToast(isHi ? 'पीडीएफ डाउनलोड विफल, सिस्टम प्रिंट खोला जा रहा है...' : 'PDF generation fallback: Opening print dialog...');
          window.print();
        } finally {
          btnExportPdf.disabled = false;
          btnExportPdf.innerHTML = originalHtml;
        }
      });
    }
  } catch (pdfModuleErr) {
    console.warn('[PDF Export] Module listener binding deferred or failed:', pdfModuleErr);
  }

  // =========================================================================
  // 11. Task 3: Firebase Authentication Scaffolding & Modal
  // =========================================================================
  try {
    let firebaseAuth = null;
    let googleAuthProvider = null;

    try {
      if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        if (firebase.auth) {
          firebaseAuth = firebase.auth();
          googleAuthProvider = new firebase.auth.GoogleAuthProvider();
        }
      }
    } catch (err) {
      console.warn('[Firebase] Initialization deferred or placeholder config:', err);
    }

    const authModal = document.getElementById('auth-modal');
    const btnNavLogin = document.getElementById('btn-nav-login');
    const mobileBtnLogin = document.getElementById('mobile-btn-login');
    const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
    const btnGoogleSignin = document.getElementById('btn-google-signin');
    const navUserBadge = document.getElementById('nav-user-badge');
    const navUserName = document.getElementById('nav-user-name');
    const navUserAvatar = document.getElementById('nav-user-avatar');
    const btnNavLogout = document.getElementById('btn-nav-logout');
    const mobileUserBadge = document.getElementById('mobile-user-badge');
    const mobileUserName = document.getElementById('mobile-user-name');
    const mobileUserAvatar = document.getElementById('mobile-user-avatar');
    const mobileBtnLogout = document.getElementById('mobile-btn-logout');

    function openAuthModal() {
      if (!authModal) return;
      authModal.classList.add('active');
      authModal.setAttribute('aria-hidden', 'false');
    }

    function closeAuthModal() {
      if (!authModal) return;
      authModal.classList.remove('active');
      authModal.setAttribute('aria-hidden', 'true');
    }

    btnNavLogin?.addEventListener('click', openAuthModal);
    mobileBtnLogin?.addEventListener('click', openAuthModal);
    btnCloseAuthModal?.addEventListener('click', closeAuthModal);

    authModal?.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && authModal?.classList.contains('active')) {
        closeAuthModal();
      }
    });

    function updateAuthUI(user) {
      if (user) {
        const fullName = user.displayName || user.name || 'Farmer Partner';
        const firstName = user.firstName || fullName.split(' ')[0];
        const initial = firstName.charAt(0).toUpperCase();

        if (btnNavLogin) btnNavLogin.classList.add('d-none');
        if (navUserBadge) navUserBadge.classList.remove('d-none');
        if (navUserName) navUserName.textContent = firstName;
        if (navUserAvatar) navUserAvatar.textContent = initial;

        if (mobileBtnLogin) mobileBtnLogin.classList.add('d-none');
        if (mobileUserBadge) mobileUserBadge.classList.remove('d-none');
        if (mobileUserName) mobileUserName.textContent = firstName;
        if (mobileUserAvatar) mobileUserAvatar.textContent = initial;

        try {
          sessionStorage.setItem('krishiurja_user', JSON.stringify({ displayName: fullName, firstName: firstName }));
        } catch (e) {}
      } else {
        if (btnNavLogin) btnNavLogin.classList.remove('d-none');
        if (navUserBadge) navUserBadge.classList.add('d-none');
        if (mobileBtnLogin) mobileBtnLogin.classList.remove('d-none');
        if (mobileUserBadge) mobileUserBadge.classList.add('d-none');

        try {
          sessionStorage.removeItem('krishiurja_user');
        } catch (e) {}
      }
    }

    async function handleGoogleSignIn() {
      const isHi = (currentLang === 'hi');
      try {
        if (firebaseAuth && googleAuthProvider && firebaseConfig.apiKey !== 'YOUR_FIREBASE_KEY') {
          // Live Firebase signInWithPopup execution
          const result = await firebaseAuth.signInWithPopup(googleAuthProvider);
          const user = result.user;
          updateAuthUI(user);
          closeAuthModal();
          showToast(isHi ? `नमस्ते, ${user.displayName || 'किसान मित्र'}! गूगल लॉगिन सफल।` : `Welcome, ${user.displayName || 'Farmer Partner'}! Signed in with Google.`);
        } else {
          // Seamless simulated OAuth flow for local demonstration with placeholder configuration
          await new Promise(res => setTimeout(res, 350));
          const mockUser = {
            displayName: "Ramesh Kumar (Demo Farmer)",
            firstName: "Ramesh",
            email: "ramesh.farmer@kvk.in"
          };
          updateAuthUI(mockUser);
          closeAuthModal();
          showToast(isHi ? 'डेमो गूगल प्रमाणीकरण: रमेश कुमार के रूप में साइन इन हुआ।' : 'Demo Google Auth: Signed in as Ramesh. (Replace YOUR_FIREBASE_KEY for live auth)');
        }
      } catch (err) {
        console.error('[Firebase] Sign-in error:', err);
        showToast(isHi ? 'प्रमाणीकरण त्रुटि या पॉपअप बंद कर दिया गया।' : 'Sign-in cancelled or popup closed.');
      }
    }

    function handleSignOut() {
      const isHi = (currentLang === 'hi');
      try {
        if (firebaseAuth && firebaseConfig.apiKey !== 'YOUR_FIREBASE_KEY') {
          firebaseAuth.signOut().catch(err => console.warn('[Firebase] Sign-out error:', err));
        }
      } catch (e) {}
      updateAuthUI(null);
      showToast(isHi ? 'सफलतापूर्वक साइन आउट किया गया।' : 'Signed out successfully.');
    }

    btnGoogleSignin?.addEventListener('click', handleGoogleSignIn);
    btnNavLogout?.addEventListener('click', handleSignOut);
    mobileBtnLogout?.addEventListener('click', handleSignOut);

    // Check persisted user session
    try {
      const savedUser = sessionStorage.getItem('krishiurja_user');
      if (savedUser) {
        updateAuthUI(JSON.parse(savedUser));
      }
    } catch (e) {}

    if (firebaseAuth && firebaseConfig.apiKey !== 'YOUR_FIREBASE_KEY') {
      firebaseAuth.onAuthStateChanged((user) => {
        if (user) updateAuthUI(user);
      });
    }
  } catch (authModuleErr) {
    console.warn('[Firebase] Auth module error:', authModuleErr);
  }

  // =========================================================================
  // 12. Task 4: Premium Scroll Animations (.reveal-hidden / .reveal-visible)
  // =========================================================================
  try {
    const animContainers = document.querySelectorAll(
      '#baseline-mapping .section-container, #formulation .section-container, #tealca-dashboard .section-container, #compliance .section-container'
    );

    animContainers.forEach(container => {
      container.classList.add('reveal-hidden');
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      animContainers.forEach(container => {
        revealObserver.observe(container);
      });
    } else {
      animContainers.forEach(container => {
        container.classList.add('reveal-visible');
      });
    }
  } catch (animErr) {
    console.warn('[ScrollAnimations] Observer initialization failed:', animErr);
  }

  // =========================================================================
  // 9. Progressive Web App (PWA) Service Worker Registration & Offline Resilience
  // =========================================================================
  try {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] ServiceWorker registration failed:', error);
          });
      });
    }

    // Network state listeners for rural connectivity awareness
    window.addEventListener('online', () => {
      showToast('📶 Connectivity restored. All online services active.');
    });

    window.addEventListener('offline', () => {
      showToast('📡 Offline mode active: Biorefinery maps, calculators & compliance tables available offline.');
    });
  } catch (pwaErr) {
    console.warn('[PWA] Service worker setup failed:', pwaErr);
  }
});

