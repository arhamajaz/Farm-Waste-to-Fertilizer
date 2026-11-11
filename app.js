/**
 * KrishiUrja Biorefinery Platform
 * Vanilla JavaScript (No Frameworks)
 * Implements navigation active state tracking, spatial awareness indicator,
 * accessible mobile navigation drawer, and interactive simulation models.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

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
      stage1Val: "Moisture: 12% | Bulk: 620 kg/m³",
      stage2Name: "Catalytic Torrefaction",
      stage2Val: "450°C Oxygen-Starved Reactor",
      stage3Name: "Bio-Fortified Granulation",
      stage3Val: "N-P-K Inoculation + Humic Acid",
      yieldFertilizer: "540 kg / MT",
      yieldEnergy: "145 m³ / MT",
      yieldCarbon: "> 45 Years"
    },
    bagasse: {
      stage1Name: "Rotary Drum De-watering",
      stage1Val: "Moisture: 10% | Bulk: 540 kg/m³",
      stage2Name: "Slow Fast-Pyrolysis Kiln",
      stage2Val: "520°C Thermal Decomposition",
      stage3Name: "Potassium Enrich Pelleting",
      stage3Val: "Microbial Consortium + Biochar",
      yieldFertilizer: "590 kg / MT",
      yieldEnergy: "180 m³ / MT",
      yieldCarbon: "> 60 Years"
    },
    cotton: {
      stage1Name: "Hammer-Mill Shredding",
      stage1Val: "Particle Size: < 6mm | Moisture: 11%",
      stage2Name: "Carbonization Retort",
      stage2Val: "480°C High-Lignin Fixation",
      stage3Name: "Liquid Mineral Impregnation",
      stage3Val: "Phosphorus + Mycorrhizae",
      yieldFertilizer: "480 kg / MT",
      yieldEnergy: "160 m³ / MT",
      yieldCarbon: "> 55 Years"
    },
    mustard: {
      stage1Name: "Pneumatic Sieving & Milling",
      stage1Val: "Moisture: 9% | Bulk: 580 kg/m³",
      stage2Name: "Autothermal Pyrolysis",
      stage2Val: "440°C Low-Emission Kiln",
      stage3Name: "Sulfur-Organic Blending",
      stage3Val: "High Sulfur Natural Humus",
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

  feedstockChips.forEach(chip => {
    chip.addEventListener('click', () => {
      feedstockChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');

      const type = chip.getAttribute('data-feedstock');
      const data = feedstockData[type];

      if (data) {
        stage1NameEl.textContent = data.stage1Name;
        stage1ValEl.textContent = data.stage1Val;
        stage2NameEl.textContent = data.stage2Name;
        stage2ValEl.textContent = data.stage2Val;
        stage3NameEl.textContent = data.stage3Name;
        stage3ValEl.textContent = data.stage3Val;

        yieldFertilizerEl.textContent = data.yieldFertilizer;
        yieldEnergyEl.textContent = data.yieldEnergy;
        yieldCarbonEl.textContent = data.yieldCarbon;

        showToast(`Loaded process parameters for ${chip.querySelector('.chip-label').textContent}`);
      }
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

  function renderWasteAnalysis(wasteId) {
    const item = farmWasteData.find(w => w.id === wasteId);
    if (!item) return;

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
    const prosHtml = item.pros.map(pro => `
      <li class="ap-list-item">
        <span class="ap-bullet-check" aria-hidden="true">✔</span>
        <span>${pro}</span>
      </li>
    `).join('');

    const consHtml = item.cons.map(con => `
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
              <span>${item.category}</span>
              <span>&bull;</span>
              <span class="text-green">Stoichiometric Match Verified</span>
            </div>
            <h3 class="ap-feedstock-title">${item.icon} ${item.name}</h3>
            <span class="wc-local-name">${item.localName}</span>
          </div>
          <span class="status-pill status-ready">Optimal Path</span>
        </div>

        <!-- Matching Conversion Technology Hero (Prominent Green Accent Color) -->
        <div class="ap-tech-hero">
          <div class="ap-tech-meta">
            <span class="ap-tech-label">OPTIMAL CONVERSION TECHNOLOGY</span>
            <div class="ap-tech-name text-green">${item.optimalTechnology}</div>
            <span class="ap-tech-sub">${item.technologySub}</span>
          </div>
          <div class="ap-tech-icon" aria-hidden="true">
            ${item.optimalTechnology === 'Biochar Pyrolysis' ? '🔥' : (item.optimalTechnology === 'Anaerobic Digestion' ? '🔄' : '🌿')}
          </div>
        </div>

        <!-- Stoichiometric Quick Specs -->
        <div class="ap-specs-strip">
          <div class="ap-spec-card">
            <span class="ap-spec-label">Average C:N Ratio</span>
            <span class="ap-spec-value text-saffron">${item.cnRatio}</span>
            <span class="ap-spec-sub">Spread: ${item.cnRange}</span>
          </div>
          <div class="ap-spec-card">
            <span class="ap-spec-label">Moisture Content</span>
            <span class="ap-spec-value text-charcoal">${item.moistureContent}</span>
            <span class="ap-spec-sub">${parseInt(item.moistureContent) > 50 ? 'Liquid / Wet Slurry' : 'Dry Solid Biomass'}</span>
          </div>
          <div class="ap-spec-card">
            <span class="ap-spec-label">Primary Bio-Product</span>
            <span class="ap-spec-value text-green" style="font-size: 0.95rem;">${item.primaryOutput.split('&')[0]}</span>
            <span class="ap-spec-sub">Commercial value off-take</span>
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
            Why ${item.optimalTechnology} Fits This C:N Ratio
          </div>
          <p class="ap-rationale-text">${item.whySelected}</p>
        </div>

        <!-- Fundamental Pros and Cons Pathway Grid -->
        <div class="ap-pros-cons">
          <div class="ap-pro-col">
            <div class="ap-col-title green">
              <span>✔</span> Pathway Advantages
            </div>
            <ul class="ap-list">
              ${prosHtml}
            </ul>
          </div>

          <div class="ap-con-col">
            <div class="ap-col-title amber">
              <span>⚠</span> Operational Constraints
            </div>
            <ul class="ap-list">
              ${consHtml}
            </ul>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="ap-footer-action">
          <div class="ap-agronomic-note">
            <strong>Agronomic Fit:</strong> ${item.agronomicRecommendation}
          </div>
          <a href="#formulation" class="btn btn-sm btn-saffron btn-action-forward" id="btn-forward-formulation" style="flex-shrink: 0;">
            <span>Configure Formulation</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    `;

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

    showToast(`Evaluated ${item.name}: Optimal Pathway is ${item.optimalTechnology}`);
  }

  // Attach accessible click and keyboard listeners
  wasteCardButtons.forEach(card => {
    card.addEventListener('click', () => {
      const wasteId = card.getAttribute('data-waste-id');
      renderWasteAnalysis(wasteId);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const wasteId = card.getAttribute('data-waste-id');
        renderWasteAnalysis(wasteId);
      }
    });
  });

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

  /**
   * Dynamically renders the 'Regional Profile' HTML panel
   * @param {Object} profile - State profile object
   */
  function renderRegionalProfile(profile) {
    if (!regionalProfilePanel || !profile) return;

    regionalProfilePanel.classList.remove('fade-in');
    void regionalProfilePanel.offsetWidth; // Force CSS animation restart
    regionalProfilePanel.classList.add('fade-in');

    regionalProfilePanel.innerHTML = `
      <div class="rp-header">
        <div>
          <span class="rp-state-badge">State Code: ${profile.id} &bull; ${profile.feedstockType}</span>
          <h3 class="rp-state-title" id="profile-state-name">${profile.name}</h3>
        </div>
        <span class="status-pill status-ready">
          <span class="pulse-dot"></span> Active Profile
        </span>
      </div>

      <!-- Dominant Waste Callout Card -->
      <div class="rp-waste-card">
        <span class="rp-waste-label">Dominant Farm Waste Type</span>
        <h4 class="rp-waste-value">
          <span aria-hidden="true">🌾</span>
          <span id="profile-waste-type">${profile.dominantWaste}</span>
        </h4>
        <p class="rp-waste-meta">
          <strong>Average C:N Ratio:</strong> ${profile.cn} &bull; <strong>Annual Surplus:</strong> ${profile.density}
        </p>
      </div>

      <!-- Recommended Conversion Technology Card (Green Accent) -->
      <div class="rp-tech-card">
        <span class="rp-tech-label">Recommended Conversion Technology</span>
        <h4 class="rp-tech-value">
          <span aria-hidden="true">⚡</span>
          <span id="profile-tech-name">${profile.tech}</span>
        </h4>
        <p class="rp-waste-meta">
          Targeted biochemical valorization matching substrate moisture and stoichiometric kinetics.
        </p>
      </div>

      <!-- Technical Rationale Breakdown -->
      <div class="rp-rationale-box">
        <strong>Biochemical Selection Rationale:</strong>
        <p style="margin: 6px 0 0 0;">${profile.reason}</p>
      </div>

      <!-- Regional Impact Metrics Grid -->
      <div class="rp-metrics-grid">
        <div class="rp-metric-box">
          <span class="rpm-label">Annual Biomass Volume</span>
          <span class="rpm-val text-charcoal">${profile.density}</span>
        </div>
        <div class="rp-metric-box">
          <span class="rpm-label">Bio-Fertilizer Potential</span>
          <span class="rpm-val text-green">${profile.output}</span>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="rp-action-wrap">
        <a href="#formulation" class="btn btn-saffron btn-full" id="btn-profile-formulate">
          <span>Configure Formulation for ${profile.dominantWaste}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    `;

    if (mapPillState) {
      mapPillState.textContent = `${profile.name} Active`;
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

    if (calculatedCarbon >= 14.0 && calculatedNpk >= 6.0) {
      fcoComplianceStatus.className = 'status-pill status-ready';
      fcoComplianceStatus.textContent = '✓ FCO 1985 Grade Passed';
    } else {
      fcoComplianceStatus.className = 'status-pill status-active';
      fcoComplianceStatus.textContent = '⚠ Non-Standard Formulation';
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

    // Synchronize dashboard numbers and charts immediately
    if (typeof calculateDashboard === 'function') {
      calculateDashboard();
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

    roiResultsContainer.innerHTML = `
      <div class="roi-results-card">
        
        <!-- Hero Result: 3-Year Projected Savings in Massive Bold Font (Green Accent) -->
        <div class="roi-hero-result">
          <div class="rhr-header-row">
            <span class="rhr-badge">Projected Farmer Profitability</span>
            <span class="rhr-guarantee-pill">
              <span class="pulse-dot"></span> 40% Cost Advantage
            </span>
          </div>

          <div class="rhr-title-label" data-i18n="roi_3yr_savings">3-Year Projected Savings</div>
          <div class="rhr-massive-value text-green" id="roi-massive-savings">
            ${formatINR(threeYearSavings)}
          </div>
          
          <p class="rhr-subtext">
            By switching your <strong>${farmSize} hectare</strong> farm to a localized farm-waste biorefinery organo-mineral fertilizer model, you save <strong>${formatINR(annualSavings)}</strong> every single year compared to synthetic Urea &amp; DAP.
          </p>
        </div>

        <!-- Metric Statistics Grid -->
        <div class="roi-metrics-grid">
          <div class="roi-stat-box">
            <span class="rsb-label">Annual Cost Savings</span>
            <strong class="rsb-value text-green">${formatINR(annualSavings)} / yr</strong>
            <span class="rsb-sub">40% direct input spend reduction</span>
          </div>

          <div class="roi-stat-box">
            <span class="rsb-label">Savings Per Hectare</span>
            <strong class="rsb-value text-charcoal">${formatINR(savingsPerHaAnnual)} / ha / yr</strong>
            <span class="rsb-sub">${formatINR(savingsPerHaThreeYear)} total over 3 years</span>
          </div>

          <div class="roi-stat-box">
            <span class="rsb-label">New Annual Bio-Fertilizer Spend</span>
            <strong class="rsb-value text-charcoal">${formatINR(newAnnualSpend)} / yr</strong>
            <span class="rsb-sub">Down from ${formatINR(syntheticSpend)} on synthetics</span>
          </div>

          <div class="roi-stat-box">
            <span class="rsb-label">3-Yr Carbon Abatement</span>
            <strong class="rsb-value text-saffron">${carbonAvoided} tCO₂e</strong>
            <span class="rsb-sub">Avoided stubble burning &amp; soil carbon sequestration</span>
          </div>
        </div>

        <!-- 3-Year Cumulative Savings Trajectory Timeline -->
        <div class="roi-trajectory-container">
          <div class="rtc-header">
            <span class="rtc-title">3-Year Cumulative Savings Trajectory</span>
            <span class="rtc-tag">Zero Capital Expenditure &bull; FPO Farmgate Delivery</span>
          </div>
          <div class="rtc-steps-grid">
            <div class="rtc-step">
              <span class="rtc-step-badge">Year 1</span>
              <div class="rtc-step-amount text-charcoal">${formatINR(annualSavings)}</div>
              <div class="rtc-step-note">Immediate 40% input cut</div>
            </div>
            <div class="rtc-step">
              <span class="rtc-step-badge">Year 2</span>
              <div class="rtc-step-amount text-charcoal">${formatINR(annualSavings * 2)}</div>
              <div class="rtc-step-note">Soil carbon &amp; moisture retention gains</div>
            </div>
            <div class="rtc-step rtc-step-highlight">
              <span class="rtc-step-badge bg-green text-white">Year 3 Total</span>
              <div class="rtc-step-amount text-green">${formatINR(threeYearSavings)}</div>
              <div class="rtc-step-note">Cumulative net profit &amp; improved yield</div>
            </div>
          </div>
        </div>

      </div>
    `;

    if (e && typeof showToast === 'function') {
      showToast(`Projected 3-Year Savings calculated: ${formatINR(threeYearSavings)}`);
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
      severity: 8,
      occurrence: 5,
      detection: 4,
      mitigationStrategy: "Decentralized GPS-tracked village baling hubs; 4-month covered buffer briquette depot storage; flexible multi-feedstock processing."
    },
    {
      potentialFailure: "Pyrolysis Retort Thermal Runaway / Incomplete Gas Cracking",
      severity: 9,
      occurrence: 2,
      detection: 3,
      mitigationStrategy: "Automated nitrogen purge systems, dual redundant IR pyrometers, emergency thermal oxidizer flare with acoustic pressure release."
    },
    {
      potentialFailure: "Microbial Consortia Contamination by Soil Pathogens",
      severity: 7,
      occurrence: 3,
      detection: 2,
      mitigationStrategy: "Steam-autoclaved biochar carrier sterilization (121°C, 30 min); cleanroom liquid broth inoculation; qPCR batch purity verification."
    },
    {
      potentialFailure: "Moisture Shock in Feedstock Balings during Monsoon",
      severity: 6,
      occurrence: 4,
      detection: 2,
      mitigationStrategy: "Waste-heat flue gas rotary cascade drying drum; automated moisture gate sensor interlocks rejecting feedstock >25% moisture."
    },
    {
      potentialFailure: "Heavy Metal Accumulation Exceeding Statutory Tolerances",
      severity: 9,
      occurrence: 2,
      detection: 2,
      mitigationStrategy: "Upstream Atomic Absorption Spectrometry (AAS) screening of rock phosphate batches; certified vendor provenance for mineral inputs."
    },
    {
      potentialFailure: "Granule Attrition & Biochar Dusting in Rural Transit",
      severity: 5,
      occurrence: 4,
      detection: 3,
      mitigationStrategy: "Chitosan-starch cross-linked nanocomposite binder coating ensuring >25 N/granule crushing strength; sealed HDPE moisture-proof bags."
    }
  ];

  const fcoComplianceMetrics = [
    {
      name: "Viable Microbial Colony Count",
      standard: "Minimum 5 × 10⁷ CFU/g (Azotobacter, Rhizobium, PSB)",
      actual: "1.8 × 10⁸ CFU/g (Assayed at 30°C)",
      status: true,
      category: "Microbiological Specification"
    },
    {
      name: "pH Buffer Range (1:5 dilution)",
      standard: "6.5 – 7.5 (Neutral to mildly alkaline)",
      actual: "7.1 ± 0.2 (Optimal for Indian soils)",
      status: true,
      category: "Chemical Balance"
    },
    {
      name: "Total Organic Carbon Content",
      standard: "Minimum 14.0% by weight (Schedule IV)",
      actual: "22.4% (Enriched recalcitrant biochar)",
      status: true,
      category: "Soil Health Index"
    },
    {
      name: "Moisture Content (Free Water)",
      standard: "Maximum 15.0% by weight for solid granules",
      actual: "12.8% (Free-flowing granules)",
      status: true,
      category: "Physical Quality"
    },
    {
      name: "Heavy Metals: Lead (Pb)",
      standard: "Max. 100.0 mg/kg limit",
      actual: "0.08 mg/kg (99.9% below threshold)",
      status: true,
      category: "Toxicological Safety"
    },
    {
      name: "Heavy Metals: Cadmium (Cd)",
      standard: "Max. 5.0 mg/kg limit",
      actual: "0.02 mg/kg (Zero toxic hazard)",
      status: true,
      category: "Toxicological Safety"
    },
    {
      name: "Heavy Metals: Arsenic (As)",
      standard: "Max. 10.0 mg/kg limit",
      actual: "0.12 mg/kg (Passed safety threshold)",
      status: true,
      category: "Toxicological Safety"
    },
    {
      name: "Biological Pathogen Screening (Salmonella & E. coli)",
      standard: "Nil / Absent in 20g sample",
      actual: "Zero Detect (Thermal sterilization pass)",
      status: true,
      category: "Biological Safety"
    },
    {
      name: "Particle Size Granulometry (2.0 – 4.0 mm)",
      standard: "Min. 90% material passing through 4mm sieve",
      actual: "87.4% (Batch sieving calibration in progress)",
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

    fmeaMockData.forEach(item => {
      const tr = document.createElement('tr');

      const getBadgeClass = (val) => {
        if (val >= 8) return 'high';
        if (val >= 5) return 'med';
        return 'low';
      };

      tr.innerHTML = `
        <td class="td-failure">${item.potentialFailure}</td>
        <td class="th-num"><span class="fmea-num-badge ${getBadgeClass(item.severity)}">${item.severity}</span></td>
        <td class="th-num"><span class="fmea-num-badge ${getBadgeClass(item.occurrence)}">${item.occurrence}</span></td>
        <td class="th-num"><span class="fmea-num-badge ${getBadgeClass(item.detection)}">${item.detection}</span></td>
        <td class="td-strategy">${item.mitigationStrategy}</td>
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

    fcoComplianceMetrics.forEach(metric => {
      const li = document.createElement('li');
      li.className = 'fco-item';

      // Conditional rendering:
      // status === true: bold Green 'Pass' badge
      // status === false: prominent Saffron/Orange 'Warning' badge
      const badgeHtml = metric.status
        ? `<span class="badge-status badge-pass" role="status" aria-label="Passed: ${metric.name}">✓ Pass</span>`
        : `<span class="badge-status badge-warning" role="status" aria-label="Warning: ${metric.name}">⚠ Warning</span>`;

      li.innerHTML = `
        <div class="fco-metric-info">
          <span class="fco-metric-name">${metric.name}</span>
          <span class="fco-metric-standard"><strong>Standard:</strong> ${metric.standard}</span>
          <span class="fco-metric-actual"><strong>Assay Result:</strong> ${metric.actual}</span>
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

  // Initial calculation and data rendering runs
  calculateFormulation();
  calculateDashboard();
  calculateFarmerROI();
  renderFMEATable();
  renderFCOChecklist();

  // =========================================================================
  // 9. Progressive Web App (PWA) Service Worker Registration & Offline Resilience
  // =========================================================================
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
});

