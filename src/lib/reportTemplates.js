export const REPORT_TEMPLATES = [
  {
    id: "farming",
    label: "Agriculture & Farming",
    icon: "🌾",
    color: "#16a34a",
    lightColor: "#f0fdf4",
    description: "Livestock, crops, dairy, poultry, aquaculture",
    examples: ["Sheep farming", "Poultry unit", "Dairy farm", "Organic vegetables"],
    contextHint: "This is an agriculture/farming project. Focus on land area, production capacity, livestock count, crop yield, seasonal considerations, cold storage, government subsidies for farmers, soil/water requirements.",
    extraSections: {
      short: ["Land & Infrastructure Details", "Production Capacity & Yield", "Input Costs (Feed/Seeds/Labor)", "Government Subsidies Applicable"],
      long: ["Land & Infrastructure Details", "Production Capacity & Yield", "Input Cost Analysis (Feed/Seeds/Fertilizer)", "Seasonal Cash Flow", "Government Subsidies & Schemes", "Cold Chain & Storage", "Crop/Livestock Insurance"]
    }
  },
  {
    id: "tech",
    label: "Technology & Software",
    icon: "💻",
    color: "#2563eb",
    lightColor: "#eff6ff",
    description: "SaaS, apps, IT services, AI, fintech, edtech",
    examples: ["SaaS platform", "Mobile app", "IT consulting firm", "AI startup"],
    contextHint: "This is a tech/software project. Focus on product features, tech stack, MRR/ARR metrics, CAC, LTV, burn rate, scalability, IP/patents, development timeline, team skills.",
    extraSections: {
      short: ["Product/Tech Overview", "Revenue Model (MRR/ARR)", "Go-to-Market Strategy"],
      long: ["Product Architecture", "Technology Stack", "Revenue Model (MRR/ARR/CAC/LTV)", "Development Roadmap", "IP & Competitive Moat", "Scalability Plan", "Team & Hiring Plan"]
    }
  },
  {
    id: "retail",
    label: "Retail & E-Commerce",
    icon: "🛍️",
    color: "#dc2626",
    lightColor: "#fff1f2",
    description: "Shops, online stores, franchises, distribution",
    examples: ["Supermarket", "Online fashion store", "Franchise outlet", "FMCG distribution"],
    contextHint: "This is a retail/e-commerce project. Focus on store location, SKU count, inventory turnover, gross margin, footfall/traffic, supply chain, channel strategy (online/offline).",
    extraSections: {
      short: ["Store/Platform Setup", "Inventory & SKU Plan", "Sales Channel Strategy"],
      long: ["Store Layout & Location Analysis", "Inventory Management Plan", "SKU & Category Strategy", "Supply Chain & Vendors", "Footfall/Traffic Projections", "Omnichannel Strategy", "Customer Loyalty Program"]
    }
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    icon: "🏭",
    color: "#7c3aed",
    lightColor: "#f5f3ff",
    description: "Production units, processing plants, fabrication",
    examples: ["Food processing unit", "Steel fabrication", "Garment factory", "Plastic manufacturing"],
    contextHint: "This is a manufacturing project. Focus on installed capacity, capacity utilization ramp-up, raw material sourcing, power/utility requirements, machinery list with costs, production process, quality certifications.",
    extraSections: {
      short: ["Installed Capacity & Utilization", "Machinery & Equipment List", "Raw Material Sourcing"],
      long: ["Plant Layout & Infrastructure", "Installed Capacity & Utilization Schedule", "Machinery & Equipment (with costs)", "Raw Material Sourcing & Vendors", "Power, Water & Utility Requirements", "Production Process Flow", "Quality Control & Certifications", "Pollution Control Measures"]
    }
  },
  {
    id: "hospitality",
    label: "Tourism & Hospitality",
    icon: "🏨",
    color: "#d97706",
    lightColor: "#fffbeb",
    description: "Hotels, resorts, restaurants, travel, events",
    examples: ["Boutique hotel", "Restaurant chain", "Travel agency", "Resort & spa"],
    contextHint: "This is a hospitality/tourism project. Focus on room count/seating capacity, occupancy rates, average revenue per unit, seasonal demand, staff-to-guest ratio, tourism trends in the area.",
    extraSections: {
      short: ["Capacity & Occupancy Plan", "Revenue Per Available Room/Cover", "Seasonal Demand Analysis"],
      long: ["Property Layout & Room/Seating Capacity", "Occupancy Rate Projections", "Revenue Per Available Room (RevPAR)", "Seasonal Demand & Pricing Strategy", "F&B Revenue Plan", "Staff Structure & Training", "Tourism Trends & Catchment Area"]
    }
  },
  {
    id: "renewable",
    label: "Renewable Energy",
    icon: "☀️",
    color: "#0d9488",
    lightColor: "#f0fdfa",
    description: "Solar, wind, biogas, EV charging, energy storage",
    examples: ["Solar rooftop project", "Wind farm", "Biogas plant", "EV charging station"],
    contextHint: "This is a renewable energy project. Focus on installed capacity in kW/MW, energy generation (units/year), tariff rates, PPA agreements, government incentives, payback period, carbon credits.",
    extraSections: {
      short: ["Installed Capacity (kW/MW)", "Annual Energy Generation", "Government Incentives & Subsidies"],
      long: ["Technical Specifications & Equipment", "Installed Capacity & Generation Estimates", "Tariff Structure & PPA Terms", "Government Incentives & Net Metering", "Carbon Credit Potential", "Land/Rooftop Requirements", "Grid Connectivity Plan", "Payback & IRR Analysis"]
    }
  },
  {
    id: "healthcare",
    label: "Healthcare & Pharma",
    icon: "🏥",
    color: "#0284c7",
    lightColor: "#f0f9ff",
    description: "Clinics, hospitals, pharma, diagnostics, wellness",
    examples: ["Diagnostic centre", "Pharmacy chain", "Clinic", "Medical device startup"],
    contextHint: "This is a healthcare/pharma project. Focus on bed/consultation capacity, OPD/IPD volumes, regulatory approvals (CDSCO, FSSAI, state health dept), medical staff qualifications, insurance tie-ups.",
    extraSections: {
      short: ["Facility Capacity & Services", "Regulatory Approvals Required", "Patient Volume Projections"],
      long: ["Facility Layout & Bed/Consultation Capacity", "Medical Services Offered", "Regulatory Approvals & Licensing", "Medical Staff & Qualification Plan", "OPD/IPD Volume Projections", "Insurance & TPA Tie-ups", "Medical Equipment List & Cost", "Healthcare Technology (HIS/EMR)"]
    }
  },
  {
    id: "education",
    label: "Education & Training",
    icon: "🎓",
    color: "#9333ea",
    lightColor: "#fdf4ff",
    description: "Schools, coaching, EdTech, skill training, colleges",
    examples: ["Coaching institute", "EdTech startup", "Vocational training centre", "Preschool"],
    contextHint: "This is an education/training project. Focus on student capacity, courses offered, fee structure, batch sizes, faculty qualifications, recognition/affiliation, digital learning infrastructure.",
    extraSections: {
      short: ["Student Capacity & Courses", "Fee Structure & Revenue Model", "Accreditation & Affiliation"],
      long: ["Infrastructure & Classroom Capacity", "Courses & Curriculum Overview", "Fee Structure & Batch Plan", "Faculty Recruitment Plan", "Accreditation & Regulatory Approvals", "Digital Learning Platform", "Student Acquisition Strategy", "Placement & Outcome Metrics"]
    }
  },
  {
    id: "general",
    label: "General Business",
    icon: "📋",
    color: "#475569",
    lightColor: "#f8fafc",
    description: "Any other business type or custom industry",
    examples: ["Service business", "Consultancy", "Import/Export", "Mixed use"],
    contextHint: "This is a general business project. Use standard business report sections appropriate for the specific industry mentioned.",
    extraSections: {
      short: [],
      long: []
    }
  }
];