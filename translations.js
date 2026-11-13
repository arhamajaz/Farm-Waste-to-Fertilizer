/**
 * KrishiUrja Biorefinery Platform
 * Localization (i18n) Data Dictionary
 * Vanilla JavaScript - Zero External Libraries
 * Supports English (en) and Hindi (hi) for Indian rural agricultural accessibility.
 */

const translations = {
  en: {
    // Navigation Bar
    "nav_baseline": "Baseline & Tech Selection",
    "nav_formulation": "Product Formulation",
    "nav_tealca": "TEA, LCA & Circularity",
    "nav_compliance": "Risk & Compliance",
    "nav_run_sim": "Run Simulation",

    // Hero Section
    "hero_initiative_badge": "India National Bio-Economy & Clean Air Initiative",
    "hero_title_p1": "Next-Generation",
    "hero_title_highlight": "Farm-Waste-to-Fertilizer",
    "hero_title_p2": "Biorefinery",
    "hero_lead": "Eliminating open-field crop burning (Parali) across Punjab, Haryana, and the Indo-Gangetic plains. We thermochemically convert crop residue into carbon-negative organo-mineral fertilizers and clean renewable rural bio-energy.",
    "hero_btn_formulation": "Configure Formulation",
    "hero_btn_lca": "Explore TEA & LCA Model",

    // Hero Metric Cards
    "stat_residue_diverted": "Crop Residue Diverted/Yr",
    "stat_biofertilizer_out": "Bio-Fertilizer Output",
    "stat_carbon_abatement": "Carbon Abatement (tCO₂e)",
    "stat_farmer_income": "Farmer Net Income Boost",

    // Module 01: Baseline Mapping & Tech Selection
    "select_region": "Select Agricultural Zone:",
    "module1_tag": "Module 01: Resource Assessment & Technology Selection",
    "module1_title": "Baseline Mapping & Tech Selection Engine",
    "btn_calculate": "Calculate",

    // Module 02: Product Formulation & Future Scope
    "module2_tag": "Module 02: Advanced R&D & Product Formulation",
    "module2_title": "Product Formulation & Future Scope",
    "tab_microbial": "Microbial Consortia",
    "tab_delivery": "Advanced Delivery",
    "tab_biochar": "Biochar Carriers",

    // Module 03: TEA, LCA & Circularity Dashboard
    "module3_tag": "Module 03: Economic, Ecological & Circularity Modeling",
    "module3_title": "TEA, LCA & Circularity Dashboard",
    "roi_title": "'Will it Pay Off?' On-Farm ROI Calculator",
    "roi_calculate": "Calculate Savings",
    "roi_farm_size": "Farm Size (in Hectares)",
    "roi_synthetic_spend": "Current Annual Synthetic Fertilizer Spend (₹)",
    "roi_3yr_savings": "3-Year Projected Savings",

    // Weather Widget (OpenWeatherMap)
    "weather_tag": "Agro-Meteorology & Field Advisory",
    "weather_title": "Local Application Conditions",
    "weather_desc": "Real-time agro-meteorological advisory to optimize bio-fertilizer absorption and prevent microbial desiccation.",
    "weather_temp": "Ambient Temperature",
    "weather_humidity": "Relative Humidity",
    "weather_wind": "Wind Speed",
    "weather_advisory": "Agronomic Application Advisory",
    "weather_btn_refresh": "Refresh Local Weather",
    "weather_ideal": "Ideal conditions for bio-fertilizer application (optimal microbial spore germination & soil moisture absorption).",
    "weather_warm": "High temperature warning: Apply bio-fertilizer during early morning or late evening to prevent microbial desiccation.",
    "weather_cool": "Low temperature advisory: Microbial activity slowed; ensure application during sunny midday hours to facilitate soil warming.",
    "weather_rain": "Precipitation advisory: Delay application until soil surface dries to prevent nutrient runoff.",

    // Soil Testing Labs (Google Maps)
    "lab_map_tag": "Geospatial Agronomy & Lab Connectivity",
    "lab_map_title": "Nearest Soil Testing Labs & Bio-Hubs",
    "lab_map_desc": "Geolocated ICAR, KVK, and accredited soil testing centers for pre-application NPK & pH soil analysis.",
    "lab_map_locate": "Detect My Location",
    "lab_map_status": "Showing Verified ICAR / KVK Soil Testing Centers",

    // ROI Dynamic Results
    "roi_farmer_profitability": "Projected Farmer Profitability",
    "roi_cost_advantage": "40% Cost Advantage",
    "roi_annual_savings": "Annual Cost Savings",
    "roi_annual_savings_sub": "40% direct input spend reduction",
    "roi_savings_per_ha": "Savings Per Hectare",
    "roi_new_spend": "New Annual Bio-Fertilizer Spend",
    "roi_carbon_abatement": "3-Yr Carbon Abatement",
    "roi_carbon_abatement_sub": "Avoided stubble burning & soil carbon sequestration",
    "roi_trajectory_title": "3-Year Cumulative Savings Trajectory",
    "roi_trajectory_tag": "Zero Capital Expenditure • FPO Farmgate Delivery",
    "roi_year1": "Year 1",
    "roi_year1_note": "Immediate 40% input cut",
    "roi_year2": "Year 2",
    "roi_year2_note": "Soil carbon & moisture retention gains",
    "roi_year3": "Year 3 Total",
    "roi_year3_note": "Cumulative net profit & improved yield",

    // Regional Map Dynamic Panel
    "rp_active_profile": "Active Profile",
    "rp_state_code": "State Code",
    "rp_dominant_waste": "Dominant Farm Waste Type",
    "rp_avg_cn": "Average C:N Ratio",
    "rp_annual_surplus": "Annual Surplus",
    "rp_rec_tech": "Recommended Conversion Technology",
    "rp_tech_sub": "Targeted biochemical valorization matching substrate moisture and stoichiometric kinetics.",
    "rp_rationale": "Biochemical Selection Rationale:",
    "rp_biomass_volume": "Annual Biomass Volume",
    "rp_fertilizer_potential": "Bio-Fertilizer Potential",
    "rp_btn_formulate": "Configure Formulation for",

    // Tech Selection Analysis Panel
    "ap_optimal_path": "Optimal Path",
    "ap_match_verified": "Stoichiometric Match Verified",
    "ap_optimal_tech_label": "OPTIMAL CONVERSION TECHNOLOGY",
    "ap_avg_cn": "Average C:N Ratio",
    "ap_spread": "Spread:",
    "ap_moisture": "Moisture Content",
    "ap_slurry": "Liquid / Wet Slurry",
    "ap_solid": "Dry Solid Biomass",
    "ap_advantages": "Core Technical Advantages & Yield Benefits",
    "ap_challenges": "Operational Challenges & Pre-Treatment Requirements",
    "ap_selection_rationale": "Biochemical Selection Rationale",
    "ap_agronomic_rec": "Agronomic Integration Recommendation",
    "ap_btn_proceed": "Proceed to Formulation Engine",
    "ap_primary_bioproduct": "Primary Bio-Product",
    "ap_commercial_offtake": "Commercial value off-take",

    // Chart.js Localized Terms
    "chart_year1": "Year 1",
    "chart_year2": "Year 2",
    "chart_year3": "Year 3",
    "chart_year4": "Year 4",
    "chart_year5": "Year 5",
    "chart_tea_capex": "CAPEX (Setup & Machinery)",
    "chart_tea_opex": "OPEX (Biomass Procurement & Labor)",
    "chart_tea_npv": "Projected Net Present Value (NPV)",
    "chart_lca_baseline": "Synthetic Fertilizer Baseline (Urea & DAP)",
    "chart_lca_bio": "KrishiUrja Bio-Fertilizer (Net Negative Pathway)",
    "chart_circ_inflow": "Resource Inflows",
    "chart_circ_outflow": "Outflows / Waste",
    "chart_circ_recovery": "Energy Recovery",
    "chart_circ_facility": "Facility Performance (ISO 59020)",
    "chart_circ_linear": "Conventional Linear Baseline",

    // Module 04: Risk & Compliance
    "module4_tag": "Module 04: Statutory Governance & Risk Mitigation",
    "module4_title": "Risk Management & Regulatory Compliance Matrix",
    "btn_download_dossier": "Download Statutory Dossier",
    "fmea_eyebrow": "Risk Assessment Matrix",
    "fmea_title": "Failure Mode & Effects Analysis (FMEA)",
    "fmea_lead": "Critical evaluation of process hazards across feedstock logistics, thermochemical pyrolysis, microbial bio-inoculation, and heavy metal controls.",
    "fmea_col_failure": "Potential Failure",
    "fmea_col_severity": "Severity",
    "fmea_col_occurrence": "Occurrence",
    "fmea_col_detection": "Detection",
    "fmea_col_strategy": "Mitigation Strategy",
    "fmea_scale_note": "Severity / Occurrence / Detection Scale: 1 (Low) to 10 (High Risk)",
    "fmea_active_tag": "✓ Active Continuous Mitigation Protocol",
    "fco_eyebrow": "Statutory Standards",
    "fco_title": "FCO Regulatory Compliance Tracker",
    "fco_verified": "Schedule IV Verified",
    "fco_lead": "Continuous laboratory quality assurance aligned with the Fertilizer Control Order (FCO 1985 & 2021 amendments) governing biofertilizers and organic manures.",
    "fco_authority_label": "Governing Authority:",
    "fco_authority_name": "Ministry of Agriculture & Farmers Welfare",
    "fco_stamp": "✓ Certified Laboratory Assay",

    // Footer
    "footer_tagline": "National Farm-Waste-to-Fertilizer Biorefinery Platform",
    "footer_rural_badge": "Designed for rural accessibility & high-contrast outdoor visibility."
  },

  hi: {
    // Navigation Bar
    "nav_baseline": "बेसलाइन एवं तकनीक चयन",
    "nav_formulation": "उत्पाद निर्माण (फॉर्मूलेशन)",
    "nav_tealca": "टीईए, एलसीए और चक्रीयता",
    "nav_compliance": "जोखिम और नियामक अनुपालन",
    "nav_run_sim": "सिमुलेशन शुरू करें",

    // Hero Section
    "hero_initiative_badge": "भारत राष्ट्रीय जैव-अर्थव्यवस्था एवं स्वच्छ वायु पहल",
    "hero_title_p1": "अगली पीढ़ी की",
    "hero_title_highlight": "कृषि-अपशिष्ट से उर्वरक",
    "hero_title_p2": "बायोरिफाइनरी",
    "hero_lead": "पंजाब, हरियाणा और सिंधु-गंगा के मैदानों में पराली जलाने की समस्या का स्थायी समाधान। हम फसल अवशेषों को उच्च गुणवत्ता वाले कार्बन-नेगेटिव जैविक उर्वरक और स्वच्छ ग्रामीण नवीकरणीय ऊर्जा में परिवर्तित करते हैं।",
    "hero_btn_formulation": "फॉर्मूलेशन कॉन्फ़िगर करें",
    "hero_btn_lca": "टीईए और एलसीए मॉडल देखें",

    // Hero Metric Cards
    "stat_residue_diverted": "वार्षिक प्रसंस्कृत फसल अवशेष",
    "stat_biofertilizer_out": "जैव-उर्वरक वार्षिक उत्पादन",
    "stat_carbon_abatement": "कार्बन उत्सर्जन में कमी (tCO₂e)",
    "stat_farmer_income": "किसान शुद्ध आय में वृद्धि",

    // Module 01: Baseline Mapping & Tech Selection
    "select_region": "कृषि क्षेत्र का चयन करें:",
    "module1_tag": "मॉड्यूल 01: संसाधन मूल्यांकन एवं तकनीक चयन",
    "module1_title": "बेसलाइन मैपिंग और तकनीक चयन इंजन",
    "btn_calculate": "गणना करें",

    // Module 02: Product Formulation & Future Scope
    "module2_tag": "मॉड्यूल 02: उन्नत अनुसंधान एवं उत्पाद निर्माण",
    "module2_title": "उत्पाद फॉर्मूलेशन एवं भविष्य का दायरा",
    "tab_microbial": "सूक्ष्मजीव कंसोर्टिया",
    "tab_delivery": "उन्नत नैनो डिलीवरी",
    "tab_biochar": "बायोचार वाहक",

    // Module 03: TEA, LCA & Circularity Dashboard
    "module3_tag": "मॉड्यूल 03: आर्थिक, पर्यावरणीय एवं चक्रीयता मॉडलिंग",
    "module3_title": "टीईए, एलसीए एवं चक्रीयता डैशबोर्ड",
    "roi_title": "'क्या इससे लाभ होगा?' किसान आरओआई कैलकुलेटर",
    "roi_calculate": "बचत की गणना करें",
    "roi_farm_size": "खेत का आकार (हेक्टेयर में)",
    "roi_synthetic_spend": "वर्तमान वार्षिक रासायनिक उर्वरक खर्च (₹)",
    "roi_3yr_savings": "3-वर्षीय अनुमानित बचत",

    // Weather Widget (OpenWeatherMap)
    "weather_tag": "कृषि-मौसम विज्ञान एवं क्षेत्र परामर्श",
    "weather_title": "स्थानीय छिड़काव एवं मौसम परिस्थितियाँ",
    "weather_desc": "जैव-उर्वरक अवशोषण को अनुकूलित करने और सूक्ष्मजीवों को सुरक्षित रखने के लिए वास्तविक समय कृषि-मौसम सलाह।",
    "weather_temp": "परिवेश तापमान",
    "weather_humidity": "सापेक्ष आर्द्रता",
    "weather_wind": "हवा की गति",
    "weather_advisory": "कृषि छिड़काव परामर्श",
    "weather_btn_refresh": "मौसम की जानकारी ताज़ा करें",
    "weather_ideal": "जैव-उर्वरक छिड़काव के लिए आदर्श परिस्थितियाँ (अनुकूलतम सूक्ष्मजीव बीजाणु अंकुरण एवं नमी अवशोषण)।",
    "weather_warm": "उच्च तापमान चेतावनी: सूक्ष्मजीवों को सूखने से बचाने के लिए सुबह जल्दी या शाम को जैव-उर्वरक का छिड़काव करें।",
    "weather_cool": "कम तापमान सलाह: सूक्ष्मजीव गतिविधि धीमी है; मिट्टी को गर्म रखने के लिए धूप वाले दोपहर के समय छिड़काव करें।",
    "weather_rain": "वर्षा चेतावनी: पोषक तत्वों के बहाव को रोकने के लिए मिट्टी की सतह सूखने तक छिड़काव टालें।",

    // Soil Testing Labs (Google Maps)
    "lab_map_tag": "भू-स्थानिक कृषि एवं प्रयोगशाला संपर्क",
    "lab_map_title": "निकटतम मृदा परीक्षण प्रयोगशालाएँ एवं बायो-हब",
    "lab_map_desc": "छिड़काव से पहले मिट्टी के एनपीके और पीएच विश्लेषण के लिए निकटतम आईसीएआर, केवीके और मान्यता प्राप्त मृदा परीक्षण केंद्र।",
    "lab_map_locate": "मेरा स्थान खोजें",
    "lab_map_status": "सत्यापित आईसीएआर / केवीके मृदा परीक्षण केंद्र प्रदर्शित हैं",

    // ROI Dynamic Results
    "roi_farmer_profitability": "किसान अनुमानित लाभप्रदता",
    "roi_cost_advantage": "40% लागत लाभ",
    "roi_annual_savings": "वार्षिक लागत बचत",
    "roi_annual_savings_sub": "40% सीधी इनपुट खर्च में कमी",
    "roi_savings_per_ha": "प्रति हेक्टेयर बचत",
    "roi_new_spend": "नया वार्षिक जैविक उर्वरक खर्च",
    "roi_carbon_abatement": "3-वर्षीय कार्बन रोकथाम",
    "roi_carbon_abatement_sub": "पराली जलाने से बचाव एवं मिट्टी में कार्बन जब्ती",
    "roi_trajectory_title": "3-वर्षीय संचयी बचत प्रक्षेपवक्र",
    "roi_trajectory_tag": "शून्य पूंजीगत व्यय • एफपीओ फार्मगेट डिलीवरी",
    "roi_year1": "वर्ष 1",
    "roi_year1_note": "तत्काल 40% इनपुट लागत में कमी",
    "roi_year2": "वर्ष 2",
    "roi_year2_note": "मृदा कार्बन और नमी प्रतिधारण में सुधार",
    "roi_year3": "वर्ष 3 कुल",
    "roi_year3_note": "संचयी शुद्ध लाभ एवं बेहतर फसल पैदावार",

    // Regional Map Dynamic Panel
    "rp_active_profile": "सक्रिय प्रोफ़ाइल",
    "rp_state_code": "राज्य कोड",
    "rp_dominant_waste": "प्रमुख कृषि अपशिष्ट प्रकार",
    "rp_avg_cn": "औसत C:N अनुपात",
    "rp_annual_surplus": "वार्षिक अधिशेष",
    "rp_rec_tech": "अनुशंसित रूपांतरण तकनीक",
    "rp_tech_sub": "कच्चे माल की नमी और स्टोइकोमेट्रिक गतिकी के अनुसार लक्षित जैव-रासायनिक उपयोग।",
    "rp_rationale": "जैव-रासायनिक चयन का तर्क:",
    "rp_biomass_volume": "वार्षिक बायोमास मात्रा",
    "rp_fertilizer_potential": "जैविक-उर्वरक क्षमता",
    "rp_btn_formulate": "के लिए फॉर्मूलेशन कॉन्फ़िगर करें",

    // Tech Selection Analysis Panel
    "ap_optimal_path": "इष्टतम मार्ग",
    "ap_match_verified": "स्टोइकोमेट्रिक मिलान सत्यापित",
    "ap_optimal_tech_label": "इष्टतम रूपांतरण तकनीक",
    "ap_avg_cn": "औसत C:N अनुपात",
    "ap_spread": "सीमा:",
    "ap_moisture": "नमी की मात्रा",
    "ap_slurry": "तरल / गीला घोल",
    "ap_solid": "ठोस सूखा बायोमास",
    "ap_advantages": "मुख्य तकनीकी लाभ और पैदावार फायदे",
    "ap_challenges": "परिचालन चुनौतियाँ और पूर्व-उपचार आवश्यकताएँ",
    "ap_selection_rationale": "जैव-रासायनिक चयन का आधार",
    "ap_agronomic_rec": "कृषि एकीकरण सिफारिश",
    "ap_btn_proceed": "फॉर्मूलेशन इंजन पर आगे बढ़ें",
    "ap_primary_bioproduct": "प्राथमिक जैव-उत्पाद",
    "ap_commercial_offtake": "वाणिज्यिक मूल्य उत्पाद",

    // Chart.js Localized Terms
    "chart_year1": "वर्ष 1",
    "chart_year2": "वर्ष 2",
    "chart_year3": "वर्ष 3",
    "chart_year4": "वर्ष 4",
    "chart_year5": "वर्ष 5",
    "chart_tea_capex": "कैपेक्स (पूंजीगत मशीनरी व सेटअप)",
    "chart_tea_opex": "ओपेक्स (बायोमास खरीद व श्रम)",
    "chart_tea_npv": "अनुमानित शुद्ध वर्तमान मूल्य (NPV)",
    "chart_lca_baseline": "रासायनिक उर्वरक बेसलाइन (यूरिया व डीएपी)",
    "chart_lca_bio": "कृषिऊर्जा जैव-उर्वरक (नेट नेगेटिव मार्ग)",
    "chart_circ_inflow": "संसाधन इनपुट",
    "chart_circ_outflow": "अपशिष्ट न्यूनतमकरण",
    "chart_circ_recovery": "ऊर्जा पुनर्प्राप्ति",
    "chart_circ_facility": "संयंत्र प्रदर्शन (ISO 59020)",
    "chart_circ_linear": "पारंपरिक रैखिक बेसलाइन",

    // Module 04: Risk & Compliance
    "module4_tag": "मॉड्यूल 04: वैधानिक शासन एवं जोखिम निवारण",
    "module4_title": "जोखिम प्रबंधन और नियामक अनुपालन मैट्रिक्स",
    "btn_download_dossier": "वैधानिक डोजियर डाउनलोड करें",
    "fmea_eyebrow": "जोखिम मूल्यांकन मैट्रिक्स",
    "fmea_title": "विफलता मोड एवं प्रभाव विश्लेषण (FMEA)",
    "fmea_lead": "बायोमास लॉजिस्टिक्स, थर्मोकेमिकल पायरोलिसिस, माइक्रोबियल इनोक्यूलेशन और भारी धातु नियंत्रण में प्रक्रिया जोखिमों का गहन विश्लेषण।",
    "fmea_col_failure": "संभावित विफलता",
    "fmea_col_severity": "गंभीरता",
    "fmea_col_occurrence": "संभावना",
    "fmea_col_detection": "पहचान",
    "fmea_col_strategy": "निवारण रणनीति",
    "fmea_scale_note": "गंभीरता / संभावना / पहचान पैमाना: 1 (कम) से 10 (उच्च जोखिम)",
    "fmea_active_tag": "✓ सक्रिय सतत निवारण प्रोटोकॉल",
    "fco_eyebrow": "वैधानिक मानक",
    "fco_title": "एफसीओ विनियामक अनुपालन ट्रैकर",
    "fco_verified": "अनुसूची IV सत्यापित",
    "fco_lead": "उर्वरक नियंत्रण आदेश (FCO 1985 व 2021 संशोधन) के अनुरूप जैव-उर्वरकों और जैविक खादों के लिए निरंतर प्रयोगशाला गुणवत्ता आश्वासन।",
    "fco_authority_label": "नियामक प्राधिकरण:",
    "fco_authority_name": "कृषि एवं किसान कल्याण मंत्रालय",
    "fco_stamp": "✓ प्रमाणित प्रयोगशाला परीक्षण",

    // Footer
    "footer_tagline": "राष्ट्रीय कृषि-अपशिष्ट से उर्वरक बायोरिफाइनरी मंच",
    "footer_rural_badge": "ग्रामीण पहुंच और उच्च-कंट्रास्ट दृश्यता के लिए विशेष रूप से डिज़ाइन किया गया।"
  }
};

// Expose globally for vanilla browser scripts
if (typeof window !== 'undefined') {
  window.translations = translations;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = translations;
}
