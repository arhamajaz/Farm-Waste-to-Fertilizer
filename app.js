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
  // 5. Module 01: Baseline Regional Geospatial Selector
  // =========================================================================
  const regionalData = {
    punjab: {
      title: "Punjab Agrarian Cluster",
      sub: "Districts: Sangrur, Ludhiana, Bathinda, Patiala",
      status: "Peak Burning Risk Window: Oct 15 - Nov 20",
      density: "18.4 Million MT/Yr",
      feedstock: "Paddy Straw (Basmati & Non-Basmati)",
      moisture: "18% - 24% (Requires field drying)",
      silica: "11.2% - 14.8% (Pyrolysis optimized)",
      units: "12 Decentralized Plants",
      soc: "SOC: 0.38% (Critically Low)",
      desc: "Decades of chemical NPK overuse have depleted soil organic carbon. Our organo-mineral biofertilizers reintroduce stable biochar humic structures to replenish native microbiological health.",
      depots: ["Depot Sangrur", "Depot Bathinda", "Depot Patiala", "Ludhiana Hub"]
    },
    haryana: {
      title: "Haryana Grain Belt",
      sub: "Districts: Karnal, Kaithal, Kurukshetra, Fatehabad",
      status: "Residue Aggregation Window: Oct 20 - Nov 25",
      density: "11.2 Million MT/Yr",
      feedstock: "Paddy Straw & Mustard Residue",
      moisture: "15% - 20% (Fast dry)",
      silica: "10.5% - 13.9%",
      units: "8 Decentralized Plants",
      soc: "SOC: 0.42% (Low Deficit)",
      desc: "High salinity soils in south-central Haryana benefit dramatically from our neutral pH buffered biochar formulation to restore ion balance and moisture retention.",
      depots: ["Karnal Central", "Kaithal North", "Fatehabad West", "Kurukshetra"]
    },
    up: {
      title: "Western Uttar Pradesh Sugar & Grain Corridor",
      sub: "Districts: Meerut, Muzaffarnagar, Shamli, Bulandshahr",
      status: "Dual Season Harvest: Nov - Dec & April - May",
      density: "16.8 Million MT/Yr",
      feedstock: "Sugarcane Trash & Wheat / Paddy Residue",
      moisture: "14% - 22%",
      silica: "8.5% - 12.0%",
      units: "14 Decentralized Plants",
      soc: "SOC: 0.45% (Depleted)",
      desc: "Abundant sugarcane trash and stubble combined in co-pyrolysis produce an ultra-rich potassium organo-mineral fertilizer suitable for intensive cash crops.",
      depots: ["Muzaffarnagar Hub", "Meerut Agro Depot", "Shamli East", "Bulandshahr South"]
    },
    maharashtra: {
      title: "Maharashtra Western Sugar Belt",
      sub: "Districts: Kolhapur, Sangli, Pune, Solapur",
      status: "Crushing Season Aggregation: Nov - March",
      density: "14.1 Million MT/Yr",
      feedstock: "Sugarcane Bagasse & Cotton Stalks",
      moisture: "12% - 18%",
      silica: "6.2% - 9.4%",
      units: "10 Decentralized Plants",
      soc: "SOC: 0.52% (Moderate Deficit)",
      desc: "Drought-prone black cotton soils achieve +35% moisture retention capacity when treated with our biochar organo-mineral formula.",
      depots: ["Kolhapur Mill Depot", "Sangli Agro Depot", "Pune East Hub", "Solapur Central"]
    },
    mp: {
      title: "Madhya Pradesh Narmada Basin",
      sub: "Districts: Hoshangabad, Sehore, Raisen, Harda",
      status: "Rabi Season Wheat Stubble Aggregation: April - May",
      density: "9.6 Million MT/Yr",
      feedstock: "Wheat Straw & Soybean Stubble",
      moisture: "8% - 12% (Dry climate)",
      silica: "7.1% - 10.5%",
      units: "7 Decentralized Plants",
      soc: "SOC: 0.48% (Low to Moderate)",
      desc: "High organic matter potential from soybean crop residues combined with rock phosphate fortification provides an ideal slow-release legume fertilizer.",
      depots: ["Hoshangabad Hub", "Sehore Depot", "Harda North", "Raisen Central"]
    }
  };

  const regionChips = document.querySelectorAll('.chip-filter');
  const mapRegionName = document.getElementById('map-region-name');
  const mapRegionSub = document.getElementById('map-region-sub');
  const mapStatus = document.getElementById('map-status');
  const valBiomassDensity = document.getElementById('val-biomass-density');
  const valFeedstockPrimary = document.getElementById('val-feedstock-primary');
  const valMoisture = document.getElementById('val-moisture');
  const valSilica = document.getElementById('val-silica');
  const valUnitsNeeded = document.getElementById('val-units-needed');
  const valSoilSoc = document.getElementById('val-soil-soc');
  const valSoilDesc = document.getElementById('val-soil-desc');
  const depotPoints = document.querySelectorAll('.depot-point');

  regionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      regionChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');

      const regionKey = chip.getAttribute('data-region');
      const data = regionalData[regionKey];

      if (data) {
        mapRegionName.textContent = data.title;
        mapRegionSub.textContent = data.sub;
        mapStatus.textContent = data.status;
        valBiomassDensity.textContent = data.density;
        valFeedstockPrimary.textContent = data.feedstock;
        valMoisture.textContent = data.moisture;
        valSilica.textContent = data.silica;
        valUnitsNeeded.textContent = data.units;
        valSoilSoc.textContent = data.soc;
        valSoilDesc.textContent = data.desc;

        // Update depot labels
        depotPoints.forEach((point, idx) => {
          if (data.depots[idx]) {
            point.textContent = `📍 ${data.depots[idx]}`;
          }
        });

        showToast(`Baseline mapped for ${data.title}`);
      }
    });
  });

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
    const calculatedCn = (calculatedCarbon / (calculatedNpk * 0.18)).toFixed(1);
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
  }

  // Attempt chart initialization immediately and on window load
  initCharts();
  window.addEventListener('load', initCharts);

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
  renderFMEATable();
  renderFCOChecklist();
});

