export interface DuplicateDetectionResult {
  isDuplicate: boolean
  confidence: number
  matchedFields: string[]
  existingApplication?: any
}

// Comprehensive name variations and aliases
const NAME_VARIATIONS = {
  // Common nicknames and variations
  alexander: ["alex", "al", "xander", "sander"],
  alexandra: ["alex", "alexa", "sandra", "sandy", "lexie"],
  anthony: ["tony", "ant", "antonio"],
  benjamin: ["ben", "benny", "benji"],
  catherine: ["kate", "katie", "cathy", "cat", "katherine"],
  christopher: ["chris", "christie", "topher"],
  daniel: ["dan", "danny", "dani"],
  elizabeth: ["liz", "beth", "betty", "eliza", "lisa"],
  francisco: ["frank", "paco", "pancho"],
  gabrielle: ["gabi", "gabby", "elle"],
  isabella: ["bella", "izzy", "isa"],
  jacqueline: ["jackie", "jac", "jacque"],
  jennifer: ["jen", "jenny", "jenn"],
  jonathan: ["jon", "johnny", "nathan"],
  katherine: ["kate", "katie", "kathy", "kat"],
  margaret: ["maggie", "meg", "peggy", "marge"],
  matthew: ["matt", "matty"],
  michael: ["mike", "micky", "mick"],
  nicholas: ["nick", "nicky", "nico"],
  patricia: ["pat", "patty", "tricia"],
  rebecca: ["becky", "becca", "bec"],
  richard: ["rick", "ricky", "dick", "rich"],
  robert: ["rob", "bob", "bobby", "robbie"],
  stephanie: ["steph", "steffi", "annie"],
  theodore: ["ted", "teddy", "theo"],
  victoria: ["vicky", "vic", "tori"],
  william: ["will", "bill", "billy", "willie", "liam"],
  zachary: ["zach", "zack", "zac"],

  // International variations
  jose: ["joseph", "pepe", "chema"],
  maria: ["mary", "marie", "mari"],
  carlos: ["charlie", "carl"],
  ana: ["anna", "anne", "annie"],
  luis: ["louis", "lou"],
  juan: ["john", "johnny"],
  pedro: ["peter", "pete"],
  miguel: ["michael", "mike"],
  rafael: ["ralph", "rafa"],
  antonio: ["anthony", "tony"],

  // Asian name variations
  wei: ["way", "wai"],
  li: ["lee", "ly"],
  wang: ["wong"],
  chen: ["chan", "tan"],
  zhang: ["chang"],
  liu: ["lau", "lew"],
  yang: ["yeung", "young"],
  huang: ["wong", "hwang"],
  zhao: ["chao", "chow"],
  wu: ["woo", "ng"],
}

// Email domain variations and common typos
const EMAIL_DOMAINS = {
  "gmail.com": ["gmai.com", "gmial.com", "gmail.co", "gmaill.com", "g-mail.com"],
  "yahoo.com": ["yaho.com", "yahoo.co", "yahooo.com", "yhoo.com"],
  "hotmail.com": ["hotmai.com", "hotmial.com", "hotmall.com", "hotmil.com"],
  "outlook.com": ["outlok.com", "outloook.com", "outlook.co"],
  "aol.com": ["ao.com", "aoll.com"],
  "icloud.com": ["iclod.com", "iclould.com", "icoud.com"],
  "protonmail.com": ["protonmai.com", "protonmial.com"],
  "live.com": ["liv.com", "livee.com"],
}

// Location aliases and variations
const LOCATION_VARIATIONS = {
  // US Cities
  "new york": ["nyc", "ny", "new york city", "manhattan", "brooklyn", "queens", "bronx"],
  "los angeles": ["la", "los angeles ca", "hollywood", "beverly hills", "santa monica"],
  "san francisco": ["sf", "san fran", "frisco", "bay area"],
  chicago: ["chi", "chicago il", "windy city"],
  houston: ["houston tx", "h-town"],
  philadelphia: ["philly", "philadelphia pa"],
  phoenix: ["phoenix az"],
  "san antonio": ["san antonio tx"],
  "san diego": ["sd", "san diego ca"],
  dallas: ["dallas tx", "big d"],
  "san jose": ["san jose ca", "sj"],
  austin: ["austin tx", "atx"],
  jacksonville: ["jax", "jacksonville fl"],
  "fort worth": ["fort worth tx"],
  columbus: ["columbus oh"],
  charlotte: ["charlotte nc"],
  seattle: ["seattle wa", "emerald city"],
  denver: ["denver co", "mile high city"],
  washington: ["dc", "washington dc", "dmv area"],
  boston: ["boston ma", "beantown"],
  "el paso": ["el paso tx"],
  detroit: ["detroit mi", "motor city"],
  nashville: ["nashville tn", "music city"],
  portland: ["portland or", "pdx"],
  "oklahoma city": ["okc", "oklahoma city ok"],
  "las vegas": ["vegas", "las vegas nv", "sin city"],
  louisville: ["louisville ky"],
  baltimore: ["baltimore md", "charm city"],
  milwaukee: ["milwaukee wi"],
  albuquerque: ["albuquerque nm", "abq"],
  tucson: ["tucson az"],
  fresno: ["fresno ca"],
  sacramento: ["sacramento ca", "sac"],
  mesa: ["mesa az"],
  "kansas city": ["kc", "kansas city mo"],
  atlanta: ["atlanta ga", "atl"],
  "long beach": ["long beach ca", "lb"],
  "colorado springs": ["colorado springs co"],
  raleigh: ["raleigh nc"],
  miami: ["miami fl", "magic city"],
  "virginia beach": ["virginia beach va", "vb"],
  omaha: ["omaha ne"],
  oakland: ["oakland ca"],
  minneapolis: ["minneapolis mn", "twin cities"],
  tulsa: ["tulsa ok"],
  arlington: ["arlington tx"],
  tampa: ["tampa fl"],
  "new orleans": ["nola", "new orleans la", "big easy"],
  wichita: ["wichita ks"],
  cleveland: ["cleveland oh"],
  bakersfield: ["bakersfield ca"],
  aurora: ["aurora co"],
  anaheim: ["anaheim ca"],
  honolulu: ["honolulu hi"],
  "santa ana": ["santa ana ca"],
  "corpus christi": ["corpus christi tx"],
  riverside: ["riverside ca"],
  lexington: ["lexington ky"],
  stockton: ["stockton ca"],
  "st. louis": ["saint louis", "st louis", "stl"],
  "st. paul": ["saint paul", "st paul"],
  cincinnati: ["cincinnati oh"],
  pittsburgh: ["pittsburgh pa", "steel city"],

  // International Cities
  london: ["london uk", "london england", "greater london"],
  paris: ["paris france"],
  tokyo: ["tokyo japan"],
  beijing: ["beijing china", "peking"],
  shanghai: ["shanghai china"],
  mumbai: ["mumbai india", "bombay"],
  delhi: ["delhi india", "new delhi"],
  bangalore: ["bangalore india", "bengaluru"],
  hyderabad: ["hyderabad india"],
  chennai: ["chennai india", "madras"],
  kolkata: ["kolkata india", "calcutta"],
  pune: ["pune india", "poona"],
  ahmedabad: ["ahmedabad india"],
  surat: ["surat india"],
  jaipur: ["jaipur india"],
  lucknow: ["lucknow india"],
  kanpur: ["kanpur india"],
  nagpur: ["nagpur india"],
  indore: ["indore india"],
  thane: ["thane india"],
  bhopal: ["bhopal india"],
  visakhapatnam: ["visakhapatnam india", "vizag"],
  pimpri: ["pimpri india"],
  patna: ["patna india"],
  vadodara: ["vadodara india", "baroda"],
  ghaziabad: ["ghaziabad india"],
  ludhiana: ["ludhiana india"],
  agra: ["agra india"],
  nashik: ["nashik india"],
  faridabad: ["faridabad india"],
  meerut: ["meerut india"],
  rajkot: ["rajkot india"],
  kalyan: ["kalyan india"],
  vasai: ["vasai india"],
  varanasi: ["varanasi india", "benares"],
  srinagar: ["srinagar india"],
  aurangabad: ["aurangabad india"],
  dhanbad: ["dhanbad india"],
  amritsar: ["amritsar india"],
  "navi mumbai": ["navi mumbai india"],
  allahabad: ["allahabad india", "prayagraj"],
  ranchi: ["ranchi india"],
  howrah: ["howrah india"],
  coimbatore: ["coimbatore india"],
  jabalpur: ["jabalpur india"],
  gwalior: ["gwalior india"],
  vijayawada: ["vijayawada india"],
  jodhpur: ["jodhpur india"],
  madurai: ["madurai india"],
  raipur: ["raipur india"],
  kota: ["kota india"],
  guwahati: ["guwahati india"],
  chandigarh: ["chandigarh india"],
  solapur: ["solapur india"],
  hubli: ["hubli india"],
  tiruchirappalli: ["tiruchirappalli india", "trichy"],
  bareilly: ["bareilly india"],
  mysore: ["mysore india", "mysuru"],
  tiruppur: ["tiruppur india"],
  gurgaon: ["gurgaon india", "gurugram"],
  aligarh: ["aligarh india"],
  jalandhar: ["jalandhar india"],
  bhubaneswar: ["bhubaneswar india"],
  salem: ["salem india"],
  warangal: ["warangal india"],
  mira: ["mira india"],
  thiruvananthapuram: ["thiruvananthapuram india", "trivandrum"],
  bhiwandi: ["bhiwandi india"],
  saharanpur: ["saharanpur india"],
  guntur: ["guntur india"],
  amravati: ["amravati india"],
  bikaner: ["bikaner india"],
  noida: ["noida india"],
  jamshedpur: ["jamshedpur india"],
  "bhilai nagar": ["bhilai nagar india", "bhilai"],
  cuttack: ["cuttack india"],
  firozabad: ["firozabad india"],
  kochi: ["kochi india", "cochin"],
  bhavnagar: ["bhavnagar india"],
  dehradun: ["dehradun india"],
  durgapur: ["durgapur india"],
  asansol: ["asansol india"],
  nanded: ["nanded india"],
  kolhapur: ["kolhapur india"],
  ajmer: ["ajmer india"],
  gulbarga: ["gulbarga india"],
  jamnagar: ["jamnagar india"],
  ujjain: ["ujjain india"],
  loni: ["loni india"],
  siliguri: ["siliguri india"],
  jhansi: ["jhansi india"],
  ulhasnagar: ["ulhasnagar india"],
  nellore: ["nellore india"],
  jammu: ["jammu india"],
  sangli: ["sangli india"],
  islampur: ["islampur india"],
  kadapa: ["kadapa india"],
  cawnpore: ["cawnpore india", "kanpur"],
  nizamabad: ["nizamabad india"],
  orai: ["orai india"],
  bharatpur: ["bharatpur india"],
  begusarai: ["begusarai india"],
  "new delhi": ["new delhi india", "delhi"],
  tumkur: ["tumkur india"],
  tirunelveli: ["tirunelveli india"],
  malegaon: ["malegaon india"],
  gaya: ["gaya india"],
}

// Phone number patterns using simple string matching
const PHONE_COUNTRY_CODES = [
  "+1",
  "+63",
  "+91",
  "+86",
  "+44",
  "+33",
  "+49",
  "+81",
  "+82",
  "+55",
  "+52",
  "+61",
  "+39",
  "+34",
  "+7",
  "+90",
  "+20",
  "+27",
  "+234",
  "+254",
  "+256",
  "+233",
  "+225",
  "+212",
  "+213",
  "+216",
  "+218",
  "+220",
  "+221",
  "+222",
  "+223",
  "+224",
  "+226",
  "+227",
  "+228",
  "+229",
  "+230",
  "+231",
  "+232",
  "+235",
  "+236",
  "+237",
  "+238",
  "+239",
  "+240",
  "+241",
  "+242",
  "+243",
  "+244",
  "+245",
  "+246",
  "+247",
  "+248",
  "+249",
  "+250",
  "+251",
  "+252",
  "+253",
  "+255",
  "+257",
  "+258",
  "+260",
  "+261",
  "+262",
  "+263",
  "+264",
  "+265",
  "+266",
  "+267",
  "+268",
  "+269",
  "+290",
  "+291",
  "+297",
  "+298",
  "+299",
  "+350",
  "+351",
  "+352",
  "+353",
  "+354",
  "+355",
  "+356",
  "+357",
  "+358",
  "+359",
  "+370",
  "+371",
  "+372",
  "+373",
  "+374",
  "+375",
  "+376",
  "+377",
  "+378",
  "+380",
  "+381",
  "+382",
  "+383",
  "+385",
  "+386",
  "+387",
  "+389",
  "+420",
  "+421",
  "+423",
  "+500",
  "+501",
  "+502",
  "+503",
  "+504",
  "+505",
  "+506",
  "+507",
  "+508",
  "+509",
  "+590",
  "+591",
  "+592",
  "+593",
  "+594",
  "+595",
  "+596",
  "+597",
  "+598",
  "+599",
  "+670",
  "+672",
  "+673",
  "+674",
  "+675",
  "+676",
  "+677",
  "+678",
  "+679",
  "+680",
  "+681",
  "+682",
  "+683",
  "+684",
  "+685",
  "+686",
  "+687",
  "+688",
  "+689",
  "+690",
  "+691",
  "+692",
  "+850",
  "+852",
  "+853",
  "+855",
  "+856",
  "+880",
  "+886",
  "+960",
  "+961",
  "+962",
  "+963",
  "+964",
  "+965",
  "+966",
  "+967",
  "+968",
  "+970",
  "+971",
  "+972",
  "+973",
  "+974",
  "+975",
  "+976",
  "+977",
  "+992",
  "+993",
  "+994",
  "+995",
  "+996",
  "+998",
]

// Common phone number formats to normalize
const PHONE_SEPARATORS = ["-", ".", " ", "(", ")", "+"]

export class DuplicateDetectionService {
  // Calculate Levenshtein distance for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Calculate similarity percentage
  private similarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Normalize name for comparison
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize spaces
      .trim()
  }

  // Get name variations
  private getNameVariations(name: string): string[] {
    const normalized = this.normalizeName(name)
    const variations = [normalized]

    // Split into parts and check each part for variations
    const parts = normalized.split(" ")

    for (const part of parts) {
      if (NAME_VARIATIONS[part]) {
        NAME_VARIATIONS[part].forEach((variation) => {
          variations.push(normalized.replace(part, variation))
        })
      }

      // Check if this part is a variation of something else
      for (const [original, vars] of Object.entries(NAME_VARIATIONS)) {
        if (vars.includes(part)) {
          variations.push(normalized.replace(part, original))
          // Also add other variations
          vars.forEach((v) => {
            if (v !== part) {
              variations.push(normalized.replace(part, v))
            }
          })
        }
      }
    }

    return [...new Set(variations)]
  }

  // Normalize email for comparison
  private normalizeEmail(email: string): string {
    if (!email) return ""

    const [local, domain] = email.toLowerCase().split("@")
    if (!local || !domain) return email.toLowerCase()

    // Remove dots and plus addressing from Gmail
    let normalizedLocal = local
    if (domain === "gmail.com") {
      normalizedLocal = local.replace(/\./g, "").split("+")[0]
    }

    return `${normalizedLocal}@${domain}`
  }

  // Get email variations including common typos
  private getEmailVariations(email: string): string[] {
    if (!email) return []

    const normalized = this.normalizeEmail(email)
    const variations = [normalized, email.toLowerCase()]

    const [local, domain] = normalized.split("@")
    if (!local || !domain) return variations

    // Check for domain typos
    for (const [correctDomain, typos] of Object.entries(EMAIL_DOMAINS)) {
      if (domain === correctDomain) {
        typos.forEach((typo) => {
          variations.push(`${local}@${typo}`)
        })
      } else if (typos.includes(domain)) {
        variations.push(`${local}@${correctDomain}`)
      }
    }

    return [...new Set(variations)]
  }

  // Normalize location for comparison
  private normalizeLocation(location: string): string {
    if (!location) return ""

    return location
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize spaces
      .trim()
  }

  // Get location variations
  private getLocationVariations(location: string): string[] {
    if (!location) return []

    const normalized = this.normalizeLocation(location)
    const variations = [normalized]

    // Check direct matches
    for (const [canonical, aliases] of Object.entries(LOCATION_VARIATIONS)) {
      if (normalized === canonical || aliases.includes(normalized)) {
        variations.push(canonical)
        variations.push(...aliases)
      }
    }

    // Check partial matches for compound locations
    const words = normalized.split(" ")
    for (const word of words) {
      for (const [canonical, aliases] of Object.entries(LOCATION_VARIATIONS)) {
        if (canonical.includes(word) || aliases.some((alias) => alias.includes(word))) {
          variations.push(canonical)
          variations.push(...aliases)
        }
      }
    }

    return [...new Set(variations)]
  }

  // Normalize phone number for comparison
  private normalizePhone(phone: string): string {
    if (!phone) return ""

    // Remove all separators and spaces
    let normalized = phone.replace(/[-.\s()]/g, "")

    // Remove leading + if present
    if (normalized.startsWith("+")) {
      normalized = normalized.substring(1)
    }

    // Remove leading 1 for US numbers if it's 11 digits
    if (normalized.length === 11 && normalized.startsWith("1")) {
      normalized = normalized.substring(1)
    }

    return normalized
  }

  // Get phone number variations
  private getPhoneVariations(phone: string): string[] {
    if (!phone) return []

    const normalized = this.normalizePhone(phone)
    const variations = [normalized, phone]

    // Add variations with different country codes
    for (const code of PHONE_COUNTRY_CODES) {
      const codeNumber = code.substring(1) // Remove +

      // If phone starts with this country code, add version without it
      if (normalized.startsWith(codeNumber)) {
        variations.push(normalized.substring(codeNumber.length))
      }

      // Add version with this country code
      if (!normalized.startsWith(codeNumber)) {
        variations.push(codeNumber + normalized)
      }
    }

    // Add common US format variations
    if (normalized.length === 10) {
      variations.push("1" + normalized) // Add US country code
    }

    return [...new Set(variations)]
  }

  // Check if applications are duplicates
  public async checkDuplicate(
    newApplication: {
      applicant_name: string
      applicant_email?: string
      applicant_city?: string
      applicant_phone?: string
    },
    existingApplications: any[],
  ): Promise<DuplicateDetectionResult> {
    let highestConfidence = 0
    let matchedApplication = null
    let allMatchedFields: string[] = []

    for (const existing of existingApplications) {
      const matchResult = this.compareApplications(newApplication, existing)

      if (matchResult.confidence > highestConfidence) {
        highestConfidence = matchResult.confidence
        matchedApplication = existing
        allMatchedFields = matchResult.matchedFields
      }
    }

    // Consider it a duplicate if confidence is above 85%
    const isDuplicate = highestConfidence >= 0.85

    return {
      isDuplicate,
      confidence: highestConfidence,
      matchedFields: allMatchedFields,
      existingApplication: matchedApplication,
    }
  }

  private compareApplications(
    app1: {
      applicant_name: string
      applicant_email?: string
      applicant_city?: string
      applicant_phone?: string
    },
    app2: any,
  ): { confidence: number; matchedFields: string[] } {
    let totalScore = 0
    let maxScore = 0
    const matchedFields: string[] = []

    // Name comparison (weight: 40%)
    const nameWeight = 0.4
    maxScore += nameWeight

    const name1Variations = this.getNameVariations(app1.applicant_name)
    const name2Variations = this.getNameVariations(app2.applicant_name)

    let nameScore = 0
    for (const n1 of name1Variations) {
      for (const n2 of name2Variations) {
        const similarity = this.similarity(n1, n2)
        nameScore = Math.max(nameScore, similarity)
      }
    }

    if (nameScore > 0.8) {
      matchedFields.push("name")
    }
    totalScore += nameScore * nameWeight

    // Email comparison (weight: 35%)
    if (app1.applicant_email && app2.applicant_email) {
      const emailWeight = 0.35
      maxScore += emailWeight

      const email1Variations = this.getEmailVariations(app1.applicant_email)
      const email2Variations = this.getEmailVariations(app2.applicant_email)

      let emailScore = 0
      for (const e1 of email1Variations) {
        for (const e2 of email2Variations) {
          if (e1 === e2) {
            emailScore = 1.0
            break
          }
          const similarity = this.similarity(e1, e2)
          emailScore = Math.max(emailScore, similarity)
        }
        if (emailScore === 1.0) break
      }

      if (emailScore > 0.9) {
        matchedFields.push("email")
      }
      totalScore += emailScore * emailWeight
    }

    // Phone number comparison (weight: 20%)
    if (app1.applicant_phone && app2.applicant_phone) {
      const phoneWeight = 0.2
      maxScore += phoneWeight

      const phone1Variations = this.getPhoneVariations(app1.applicant_phone)
      const phone2Variations = this.getPhoneVariations(app2.applicant_phone)

      let phoneScore = 0
      for (const p1 of phone1Variations) {
        for (const p2 of phone2Variations) {
          if (p1 === p2) {
            phoneScore = 1.0
            break
          }
          const similarity = this.similarity(p1, p2)
          phoneScore = Math.max(phoneScore, similarity)
        }
        if (phoneScore === 1.0) break
      }

      if (phoneScore > 0.9) {
        matchedFields.push("phone")
      }
      totalScore += phoneScore * phoneWeight
    }

    // Location comparison (weight: 5%)
    if (app1.applicant_city && app2.applicant_city) {
      const locationWeight = 0.05
      maxScore += locationWeight

      const location1Variations = this.getLocationVariations(app1.applicant_city)
      const location2Variations = this.getLocationVariations(app2.applicant_city)

      let locationScore = 0
      for (const l1 of location1Variations) {
        for (const l2 of location2Variations) {
          if (l1 === l2) {
            locationScore = 1.0
            break
          }
          const similarity = this.similarity(l1, l2)
          locationScore = Math.max(locationScore, similarity)
        }
        if (locationScore === 1.0) break
      }

      if (locationScore > 0.8) {
        matchedFields.push("location")
      }
      totalScore += locationScore * locationWeight
    }

    // Normalize confidence by actual maximum possible score
    const confidence = maxScore > 0 ? totalScore / maxScore : 0

    return { confidence, matchedFields }
  }
}

export const duplicateDetectionService = new DuplicateDetectionService()
