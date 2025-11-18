export const WORLD_CITIES = new Set([
  // United States - Major Cities & Metros (500+ cities)
  "new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia", "san antonio", "san diego", "dallas", "san jose",
  "austin", "jacksonville", "fort worth", "columbus", "charlotte", "san francisco", "indianapolis", "seattle", "denver", "washington",
  "boston", "el paso", "detroit", "nashville", "portland", "memphis", "oklahoma city", "las vegas", "louisville", "baltimore",
  "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas city", "atlanta", "long beach", "colorado springs",
  "raleigh", "miami", "virginia beach", "omaha", "oakland", "minneapolis", "tulsa", "arlington", "tampa", "new orleans",
  "wichita", "cleveland", "bakersfield", "aurora", "anaheim", "honolulu", "santa ana", "corpus christi", "riverside", "lexington",
  "stockton", "henderson", "saint paul", "st. paul", "cincinnati", "pittsburgh", "greensboro", "anchorage", "plano", "lincoln",
  "orlando", "irvine", "newark", "toledo", "durham", "chula vista", "fort wayne", "jersey city", "st. petersburg", "laredo",
  "madison", "chandler", "buffalo", "lubbock", "scottsdale", "reno", "glendale", "gilbert", "winston-salem", "north las vegas",
  "norfolk", "chesapeake", "garland", "irving", "hialeah", "fremont", "boise", "richmond", "baton rouge", "spokane",
  "des moines", "tacoma", "san bernardino", "modesto", "fontana", "santa clarita", "birmingham", "oxnard", "fayetteville", "moreno valley",
  "huntington beach", "salt lake city", "grand rapids", "amarillo", "yonkers", "aurora", "montgomery", "akron", "little rock", "huntsville",
  "augusta", "port st. lucie", "grand prairie", "mobile", "brownsville", "providence", "overland park", "garden grove", "chattanooga", "oceanside",
  "jackson", "fort lauderdale", "santa rosa", "rancho cucamonga", "tempe", "ontario", "vancouver", "cape coral", "sioux falls", "springfield",
  "peoria", "pembroke pines", "elk grove", "salem", "lancaster", "corona", "eugene", "palmdale", "salinas", "pasadena",
  "fort collins", "hayward", "pomona", "cary", "rockford", "alexandria", "escondido", "mckinney", "joliet", "sunnyvale",
  "torrance", "bridgeport", "lakewood", "hollywood", "paterson", "naperville", "syracuse", "mesquite", "dayton", "savannah",
  "clarksville", "orange", "fullerton", "killeen", "frisco", "hampton", "mcallen", "warren", "bellevue", "west valley city",
  
  // Canada - All Major Cities
  "toronto", "montreal", "vancouver", "calgary", "edmonton", "ottawa", "winnipeg", "quebec city", "hamilton", "kitchener",
  "london", "victoria", "halifax", "oshawa", "windsor", "saskatoon", "regina", "st. john's", "barrie", "kelowna",
  "abbotsford", "greater sudbury", "kingston", "saguenay", "sherbrooke", "trois-rivières", "trois-rivieres", "moncton", "saint john", "thunder bay",
  "kamloops", "red deer", "lethbridge", "brantford", "nanaimo", "peterborough", "chilliwack", "prince george", "sault ste. marie", "sarnia",
  "wood buffalo", "new westminster", "chatham-kent", "coquitlam", "burnaby", "guelph", "cambridge", "whitby", "burlington", "richmond",
  
  // Mexico - All Major Cities
  "mexico city", "guadalajara", "monterrey", "puebla", "tijuana", "leon", "juarez", "zapopan", "naucalpan", "merida",
  "san luis potosi", "aguascalientes", "hermosillo", "saltillo", "mexicali", "culiacan", "acapulco", "tlalnepantla", "cancun", "queretaro",
  "torreon", "morelia", "toluca", "chihuahua", "reynosa", "veracruz", "tuxtla gutierrez", "pachuca", "cuernavaca", "oaxaca",
  "mazatlan", "tampico", "durango", "san nicolas de los garza", "tlaquepaque", "guadalupe", "ciudad lopez mateos", "celaya", "irapuato", "matamoros",
  
  // Central America
  "guatemala city", "san salvador", "tegucigalpa", "managua", "san jose", "panama city", "belize city", "san pedro sula", "leon", "granada",
  "san miguel", "santa ana", "ciudad del este", "san pedro", "alajuela", "cartago", "heredia", "liberia", "puntarenas", "limon",
  "david", "colon", "santiago", "la ceiba", "choloma", "el progreso", "choluteca", "comayagua", "puerto cortes", "siguatepeque",
  
  // Caribbean
  "havana", "santo domingo", "port-au-prince", "santiago de cuba", "kingston", "san juan", "nassau", "bridgetown", "port of spain", "george town",
  "castries", "roseau", "st. george's", "kingstown", "basseterre", "plymouth", "road town", "willemstad", "oranjestad", "philipsburg",
  
  // === SOUTH AMERICA ===
  
  // Brazil - Major Cities
  "sao paulo", "rio de janeiro", "brasilia", "salvador", "fortaleza", "belo horizonte", "manaus", "curitiba", "recife", "goiania",
  "porto alegre", "belem", "guarulhos", "campinas", "sao luis", "sao goncalo", "maceio", "duque de caxias", "natal", "teresina",
  "campo grande", "nova iguacu", "sao bernardo do campo", "joao pessoa", "santo andre", "osasco", "jaboatao dos guararapes", "sao jose dos campos", "ribeirao preto", "uberlandia",
  "sorocaba", "contagem", "aracaju", "feira de santana", "cuiaba", "joinville", "aparecida de goiania", "londrina", "juiz de fora", "ananindeua",
  
  // Argentina - Major Cities
  "buenos aires", "cordoba", "rosario", "mendoza", "tucuman", "la plata", "mar del plata", "salta", "santa fe", "san juan",
  "resistencia", "santiago del estero", "corrientes", "posadas", "bahia blanca", "parana", "neuquen", "formosa", "san salvador de jujuy", "la rioja",
  
  // Colombia - Major Cities
  "bogota", "medellin", "cali", "barranquilla", "cartagena", "cucuta", "bucaramanga", "pereira", "santa marta", "ibague",
  "pasto", "manizales", "neiva", "villavicencio", "armenia", "valledupar", "monteria", "sincelejo", "popayan", "buenaventura",
  
  // Peru - Major Cities
  "lima", "arequipa", "trujillo", "chiclayo", "piura", "iquitos", "cusco", "huancayo", "chimbote", "pucallpa",
  "tacna", "ica", "juliaca", "sullana", "ayacucho", "cajamarca", "puno", "huanuco", "chincha alta", "tumbes",
  
  // Chile - Major Cities
  "santiago", "valparaiso", "concepcion", "la serena", "antofagasta", "temuco", "rancagua", "talca", "arica", "puerto montt",
  "chillan", "iquique", "los angeles", "coquimbo", "osorno", "valdivia", "punta arenas", "quilpue", "talcahuano", "calama",
  
  // Venezuela - Major Cities
  "caracas", "maracaibo", "valencia", "barquisimeto", "maracay", "ciudad guayana", "barcelona", "maturin", "ciudad bolivar", "cumaná",
  
  // Ecuador - Major Cities
  "quito", "guayaquil", "cuenca", "santo domingo", "machala", "manta", "portoviejo", "ambato", "riobamba", "loja",
  
  // Bolivia - Major Cities
  "la paz", "santa cruz", "cochabamba", "sucre", "oruro", "tarija", "potosi", "sacaba", "montero", "trinidad",
  
  // Paraguay & Uruguay
  "asuncion", "ciudad del este", "san lorenzo", "luque", "capiata", "montevideo", "salto", "paysandu", "las piedras", "rivera",
  
  // === EUROPE ===
  
  // United Kingdom
  "london", "birmingham", "leeds", "glasgow", "sheffield", "manchester", "edinburgh", "liverpool", "bristol", "cardiff",
  "belfast", "newcastle", "leicester", "nottingham", "coventry", "bradford", "southampton", "brighton", "plymouth", "reading",
  "wolverhampton", "stoke-on-trent", "derby", "swansea", "southend-on-sea", "dundee", "aberdeen", "norwich", "ipswich", "exeter",
  "cambridge", "oxford", "york", "portsmouth", "sunderland", "peterborough", "luton", "bolton", "blackpool", "milton keynes",
  
  // France
  "paris", "marseille", "lyon", "toulouse", "nice", "nantes", "strasbourg", "montpellier", "bordeaux", "lille",
  "rennes", "reims", "le havre", "saint-etienne", "toulon", "grenoble", "dijon", "angers", "nimes", "villeurbanne",
  "le mans", "aix-en-provence", "clermont-ferrand", "brest", "tours", "amiens", "limoges", "annecy", "perpignan", "besancon",
  
  // Germany
  "berlin", "hamburg", "munich", "cologne", "frankfurt", "stuttgart", "dusseldorf", "dortmund", "essen", "leipzig",
  "bremen", "dresden", "hanover", "nuremberg", "duisburg", "bochum", "wuppertal", "bielefeld", "bonn", "munster",
  "karlsruhe", "mannheim", "augsburg", "wiesbaden", "gelsenkirchen", "monchengladbach", "braunschweig", "chemnitz", "kiel", "aachen",
  
  // Spain
  "madrid", "barcelona", "valencia", "seville", "zaragoza", "malaga", "murcia", "palma", "las palmas", "bilbao",
  "alicante", "cordoba", "valladolid", "vigo", "gijon", "hospitalet", "vitoria", "granada", "elche", "oviedo",
  "santa cruz de tenerife", "badalona", "cartagena", "terrassa", "jerez", "sabadell", "mostoles", "alcala de henares", "pamplona", "fuenlabrada",
  
  // Italy
  "rome", "milan", "naples", "turin", "palermo", "genoa", "bologna", "florence", "bari", "catania",
  "verona", "venice", "messina", "padua", "trieste", "brescia", "taranto", "prato", "parma", "modena",
  "reggio calabria", "reggio emilia", "perugia", "ravenna", "livorno", "cagliari", "foggia", "rimini", "salerno", "ferrara",
  
  // Netherlands
  "amsterdam", "rotterdam", "the hague", "utrecht", "eindhoven", "tilburg", "groningen", "almere", "breda", "nijmegen",
  "enschede", "haarlem", "arnhem", "zaanstad", "amersfoort", "apeldoorn", "'s-hertogenbosch", "s-hertogenbosch", "hoofddorp", "maastricht",
  
  // Belgium
  "brussels", "antwerp", "ghent", "charleroi", "liege", "bruges", "namur", "leuven", "mons", "aalst",
  
  // Poland
  "warsaw", "krakow", "lodz", "wroclaw", "poznan", "gdansk", "szczecin", "bydgoszcz", "lublin", "katowice",
  "bialystok", "gdynia", "czestochowa", "radom", "sosnowiec", "torun", "kielce", "gliwice", "zabrze", "bytom",
  
  // Russia - Major Cities
  "moscow", "saint petersburg", "novosibirsk", "yekaterinburg", "nizhny novgorod", "kazan", "chelyabinsk", "omsk", "samara", "rostov-on-don",
  "ufa", "krasnoyarsk", "voronezh", "perm", "volgograd", "krasnodar", "saratov", "tyumen", "tolyatti", "izhevsk",
  "barnaul", "irkutsk", "ulyanovsk", "vladivostok", "yaroslavl", "khabarovsk", "makhachkala", "orenburg", "novokuznetsk", "kemerovo",
  
  // Ukraine
  "kyiv", "kiev", "kharkiv", "odesa", "odessa", "dnipro", "donetsk", "zaporizhzhia", "lviv", "kryvyi rih",
  
  // Other European Cities
  "vienna", "budapest", "prague", "bucharest", "sofia", "athens", "lisbon", "copenhagen", "stockholm", "oslo",
  "helsinki", "dublin", "zagreb", "bratislava", "ljubljana", "sarajevo", "belgrade", "skopje", "tirana", "pristina",
  "zurich", "geneva", "basel", "bern", "lausanne", "lucerne", "winterthur", "st. gallen", "lugano", "biel",
  
  // === ASIA ===
  
  // China - Major Cities (100+ cities)
  "beijing", "shanghai", "guangzhou", "shenzhen", "chengdu", "chongqing", "tianjin", "wuhan", "xi'an", "hangzhou",
  "nanjing", "shenyang", "harbin", "changchun", "dalian", "jinan", "qingdao", "zhengzhou", "shijiazhuang", "taiyuan",
  "hefei", "nanchang", "changsha", "fuzhou", "xiamen", "nanning", "kunming", "guiyang", "lhasa", "lanzhou",
  "xining", "yinchuan", "urumqi", "hohhot", "suzhou", "wuxi", "ningbo", "wenzhou", "dongguan", "foshan",
  "zhongshan", "zhuhai", "huizhou", "jiangmen", "shaoguan", "zhanjiang", "maoming", "zhaoqing", "qingyuan", "chaozhou",
  
  // Japan - All Major Cities
  "tokyo", "yokohama", "osaka", "nagoya", "sapporo", "fukuoka", "kobe", "kyoto", "kawasaki", "saitama",
  "hiroshima", "sendai", "chiba", "kitakyushu", "sakai", "niigata", "hamamatsu", "kumamoto", "sagamihara", "shizuoka",
  "okayama", "kagoshima", "hachioji", "funabashi", "kawaguchi", "himeji", "suita", "utsunomiya", "matsuyama", "higashiosaka",
  
  // South Korea - Major Cities
  "seoul", "busan", "incheon", "daegu", "daejeon", "gwangju", "suwon", "ulsan", "changwon", "seongnam",
  "goyang", "yongin", "bucheon", "cheongju", "ansan", "jeonju", "cheonan", "pohang", "gimhae", "pyeongtaek",
  
  // India - Major Cities (150+ cities)
  "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "ahmedabad", "chennai", "kolkata", "surat", "pune",
  "jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "pimpri-chinchwad", "patna",
  "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot", "kalyan-dombivli", "vasai-virar",
  "varanasi", "srinagar", "aurangabad", "dhanbad", "amritsar", "navi mumbai", "allahabad", "prayagraj", "ranchi", "howrah",
  "coimbatore", "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur", "kota", "chandigarh", "guwahati",
  "solapur", "hubli-dharwad", "mysore", "mysuru", "tiruchirappalli", "bareilly", "moradabad", "gurgaon", "gurugram", "aligarh",
  "jalandhar", "bhubaneswar", "salem", "warangal", "guntur", "bhiwandi", "saharanpur", "gorakhpur", "bikaner", "amravati",
  
  // Pakistan - Major Cities
  "karachi", "lahore", "faisalabad", "rawalpindi", "gujranwala", "peshawar", "multan", "hyderabad", "islamabad", "quetta",
  "bahawalpur", "sargodha", "sialkot", "sukkur", "larkana", "sheikhupura", "rahim yar khan", "jhang", "dera ghazi khan", "gujrat",
  
  // Bangladesh - Major Cities
  "dhaka", "chittagong", "khulna", "rajshahi", "sylhet", "comilla", "rangpur", "barisal", "bogra", "mymensingh",
  
  // Indonesia - Major Cities
  "jakarta", "surabaya", "bandung", "medan", "semarang", "makassar", "palembang", "tangerang", "depok", "bekasi",
  "south tangerang", "batam", "pekanbaru", "bandar lampung", "padang", "malang", "denpasar", "samarinda", "tasikmalaya", "pontianak",
  
  // Thailand - Major Cities
  "bangkok", "nonthaburi", "nakhon ratchasima", "chiang mai", "hat yai", "udon thani", "pak kret", "khon kaen", "chon buri", "nakhon si thammarat",
  
  // Vietnam - Major Cities
  "ho chi minh city", "saigon", "hanoi", "hai phong", "da nang", "can tho", "bien hoa", "hue", "nha trang", "buon ma thuot",
  
  // Malaysia - Major Cities
  "kuala lumpur", "george town", "ipoh", "shah alam", "petaling jaya", "johor bahru", "malacca", "alor setar", "kuching", "kota kinabalu",
  
  // Philippines - Comprehensive (ALL cities & municipalities - 300+)
  
  // National Capital Region (NCR/Metro Manila)
  "manila", "quezon city", "caloocan", "taguig", "pasig", "mandaluyong", "makati", "marikina", 
  "parañaque", "paraňaque", "paranaque", "las piñas", "las pinas", "muntinlupa", "valenzuela", "malabon", 
  "navotas", "san juan", "pasay", "pateros",
  
  // Luzon - Calabarzon
  "antipolo", "bacoor", "dasmariñas", "dasmarinas", "imus", "cavite city", "tagaytay", "silang", "general trias", "trece martires",
  "biñan", "binan", "santa rosa", "cabuyao", "calamba", "san pedro", "san pablo", "los baños", "los banos", "bay", "calauan",
  "lipa", "batangas city", "tanauan", "santo tomas", "lemery", "nasugbu", "taal", "balayan", "san juan", "rosario",
  "lucena", "sariaya", "candelaria", "tayabas", "lucban", "pagbilao", "atimonan", "gumaca", "lopez", "calauag",
  
  // Luzon - Central Luzon
  "olongapo", "subic", "dinalupihan", "balanga", "mariveles", "orani", "hermosa", "limay", "orion", "pilar",
  "cabanatuan", "gapan", "san jose", "palayan", "science city of muñoz", "science city of munoz", "guimba", "talavera",
  "angeles", "san fernando", "mabalacat", "mexico", "porac", "guagua", "lubao", "floridablanca", "apalit", "macabebe",
  "tarlac city", "concepcion", "capas", "bamban", "victoria", "paniqui", "gerona", "la paz", "camiling", "santa ignacia",
  
  // Luzon - Cordillera
  "baguio", "la trinidad", "itogon", "tuba", "sablan", "tublay", "baguio city", "tabuk", "bontoc",
  
  // Luzon - Ilocos Region
  "san carlos", "dagupan", "urdaneta", "alaminos", "lingayen", "binmaley", "manaoag", "pozorrubio", "rosales", "tayug",
  "vigan", "candon", "laoag", "batac", "san nicolas", "paoay", "sarrat", "bacarra", "burgos", "dingras",
  
  // Luzon - Cagayan Valley
  "santiago", "cauayan", "ilagan", "tuguegarao", "aparri", "sanchez mira", "gonzaga", "buguey", "lal-lo", "alcala",
  
  // Visayas - Central Visayas
  "cebu city", "mandaue", "lapu-lapu", "talisay", "toledo", "danao", "carcar", "naga", "minglanilla", "consolacion",
  "compostela", "liloan", "cordova", "bogo", "dumanjug", "sogod", "santander", "argao", "dalaguete", "alcoy",
  "tagbilaran", "ubay", "talibon", "jagna", "trinidad", "tubigon", "clarin", "inabanga", "guindulman", "loon",
  
  // Visayas - Western Visayas
  "iloilo city", "passi", "roxas city", "bacolod", "silay", "talisay", "bago", "himamaylan", "kabankalan", "sagay",
  "cadiz", "escalante", "victorias", "san carlos", "la carlota", "kalibo", "san jose", "caticlan", "malay", "numancia",
  
  // Visayas - Eastern Visayas
  "tacloban", "ormoc", "baybay", "calbayog", "catbalogan", "borongan", "maasin", "bato", "sogod", "abuyog",
  "tanauan", "palo", "tolosa", "dulag", "mayorga", "julita", "javier", "hindang", "hilongos", "matalom",
  
  // Visayas - Negros Oriental
  "dumaguete", "bais", "bayawan", "canlaon", "guihulngan", "tanjay", "sibulan", "valencia", "zamboanguita", "manjuyod",
  
  // Mindanao - Davao Region
  "davao city", "tagum", "panabo", "digos", "mati", "samal", "island garden city of samal", "nabunturan", "monkayo", "montevista",
  "compostela", "new corella", "carmen", "braulio dujali", "san isidro", "santo tomas", "hagonoy", "padada", "kiblawan", "magsaysay",
  
  // Mindanao - Northern Mindanao
  "cagayan de oro", "gingoog", "el salvador", "jasaan", "villanueva", "tagoloan", "opol", "manolo fortich", "malaybalay", "valencia",
  "maramag", "quezon", "don carlos", "kitacharao", "sumilao", "malitbog", "lantapan", "pangantucan", "cabanglasan", "talakag",
  
  // Mindanao - SOCCSKSARGEN
  "general santos", "koronadal", "tacurong", "kidapawan", "cotabato city", "midsayap", "mlang", "tupi", "polomolok", "tantangan",
  "surallah", "banga", "norala", "lago", "t'boli", "tampakan", "south upi", "president roxas", "columbio", "esperanza",
  
  // Mindanao - Caraga
  "butuan", "cabadbaran", "bayugan", "bislig", "tandag", "surigao city", "prosperidad", "san francisco", "bunawan", "veruela",
  
  // Mindanao - Zamboanga Peninsula
  "zamboanga city", "pagadian", "dipolog", "dapitan", "oroquieta", "ozamiz", "tangub", "isabela city", "ipil", "molave",
  "aurora", "bayog", "dimataling", "dinas", "dumalinao", "dumingag", "kumalarang", "labangan", "lakewood", "lapuyan",
  
  // Mindanao - BARMM
  "marawi", "cotabato city", "lamitan", "jolo", "bongao", "siasi", "languyan", "panglima sugala", "balabagan", "datu odin sinsuat",
  
  // Mindanao - Davao del Norte
  "tagum", "panabo", "island garden city of samal", "samal", "asuncion", "braulio e. dujali", "carmen", "kapalong", "new corella",
  "san isidro", "santo tomas", "talaingod",
  
  // === MIDDLE EAST ===
  
  // Saudi Arabia
  "riyadh", "jeddah", "mecca", "medina", "dammam", "khobar", "tabuk", "buraydah", "khamis mushait", "hail",
  "najran", "abha", "yanbu", "al-hasa", "al-qatif", "al-jubail", "hafar al-batin", "sakaka", "jizan", "al-baha",
  
  // United Arab Emirates
  "dubai", "abu dhabi", "sharjah", "al ain", "ajman", "ras al-khaimah", "fujairah", "umm al-quwain", "khor fakkan", "dibba",
  
  // Iran
  "tehran", "mashhad", "isfahan", "karaj", "tabriz", "shiraz", "qom", "ahvaz", "kermanshah", "urmia",
  
  // Iraq
  "baghdad", "basra", "mosul", "erbil", "kirkuk", "najaf", "karbala", "nasiriyah", "amarah", "duhok",
  
  // Turkey
  "istanbul", "ankara", "izmir", "bursa", "adana", "gaziantep", "konya", "antalya", "kayseri", "mersin",
  "diyarbakir", "eskisehir", "samsun", "denizli", "sanliurfa", "adapazari", "malatya", "kahramanmaras", "erzurum", "van",
  
  // Israel & Palestine
  "jerusalem", "tel aviv", "haifa", "rishon lezion", "petah tikva", "ashdod", "netanya", "beersheba", "holon", "bnei brak",
  "ramallah", "gaza", "hebron", "nablus", "khan younis", "bethlehem", "jenin", "tulkarm", "qalqilya", "jericho",
  
  // Other Middle East
  "beirut", "tripoli", "sidon", "tyre", "damascus", "aleppo", "homs", "latakia", "amman", "zarqa",
  "irbid", "aqaba", "kuwait city", "manama", "doha", "muscat", "salalah", "sohar", "nizwa", "sur",
  
  // === AFRICA ===
  
  // Nigeria
  "lagos", "kano", "ibadan", "abuja", "port harcourt", "benin city", "kaduna", "maiduguri", "zaria", "aba",
  "jos", "ilorin", "oyo", "enugu", "abeokuta", "onitsha", "warri", "calabar", "sokoto", "akure",
  
  // Egypt
  "cairo", "alexandria", "giza", "shubra el-kheima", "port said", "suez", "luxor", "al-mahalla al-kubra", "tanta", "asyut",
  
  // South Africa
  "johannesburg", "cape town", "durban", "pretoria", "port elizabeth", "bloemfontein", "pietermaritzburg", "east london", "kimberley", "polokwane",
  "nelspruit", "rustenburg", "george", "midrand", "soweto", "sandton", "benoni", "springs", "tembisa", "vereeniging",
  
  // Kenya
  "nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "ruiru", "kikuyu", "thika", "malindi", "kitale",
  
  // Ethiopia
  "addis ababa", "dire dawa", "mekelle", "gondar", "bahir dar", "hawassa", "dessie", "jimma", "jijiga", "shashamane",
  
  // Other African Cities
  "kinshasa", "lubumbashi", "mbuji-mayi", "kananga", "kisangani", "dakar", "pikine", "touba", "thies", "kaolack",
  "accra", "kumasi", "tamale", "takoradi", "tema", "casablanca", "rabat", "fes", "marrakech", "tangier",
  "algiers", "oran", "constantine", "annaba", "tunis", "sfax", "sousse", "kairouan", "tripoli", "benghazi",
  "misrata", "luanda", "huambo", "benguela", "lobito", "dar es salaam", "mwanza", "arusha", "dodoma", "mbeya",
  "kampala", "gulu", "lira", "mbarara", "jinja", "khartoum", "omdurman", "khartoum north", "port sudan", "kassala",
  "mogadishu", "hargeisa", "berbera", "bosaso", "kismayo", "antananarivo", "toamasina", "antsirabe", "mahajanga", "fianarantsoa",
  
  // === OCEANIA ===
  
  // Australia
  "sydney", "melbourne", "brisbane", "perth", "adelaide", "gold coast", "newcastle", "canberra", "sunshine coast", "wollongong",
  "geelong", "hobart", "townsville", "cairns", "toowoomba", "darwin", "ballarat", "bendigo", "albury", "launceston",
  "mackay", "rockhampton", "bunbury", "bundaberg", "maitland", "wagga wagga", "hervey bay", "coffs harbour", "shepparton", "port macquarie",
  
  // New Zealand
  "auckland", "wellington", "christchurch", "hamilton", "tauranga", "lower hutt", "dunedin", "palmerston north", "napier", "porirua",
  "hibiscus coast", "new plymouth", "rotorua", "whangarei", "nelson", "hastings", "invercargill", "upper hutt", "whanganui", "gisborne",
  
  // Pacific Islands
  "suva", "lautoka", "nadi", "labasa", "port moresby", "lae", "arawa", "mount hagen", "madang", "wewak",
  "port vila", "luganville", "honiara", "apia", "gizo", "nuku'alofa", "funafuti", "majuro", "palikir", "tarawa",
  
  // US States (full names) for better detection
  "california", "texas", "florida", "new york", "pennsylvania", "illinois", "ohio", "georgia", "north carolina", "michigan",
  "new jersey", "virginia", "washington", "arizona", "massachusetts", "tennessee", "indiana", "missouri", "maryland", "wisconsin",
  "colorado", "minnesota", "south carolina", "alabama", "louisiana", "kentucky", "oregon", "oklahoma", "connecticut", "utah",
  "iowa", "nevada", "arkansas", "mississippi", "kansas", "new mexico", "nebraska", "west virginia", "idaho", "hawaii",
  "new hampshire", "maine", "montana", "rhode island", "delaware", "south dakota", "north dakota", "alaska", "vermont", "wyoming",
  
  // Common abbreviations
  "ca", "ny", "tx", "fl", "il", "pa", "oh", "ga", "nc", "mi", "nj", "va", "wa", "az", "ma",
  "tn", "in", "mo", "md", "wi", "co", "mn", "sc", "al", "la", "ky", "or", "ok", "ct", "ut",
])

export const INTERNATIONAL_NAMES = {
  firstNames: new Set([
    // Traditional English names
    "james", "robert", "john", "michael", "david", "william", "richard", "charles", "joseph", "thomas",
    "christopher", "daniel", "paul", "mark", "donald", "george", "kenneth", "steven", "edward", "brian",
    "ronald", "anthony", "kevin", "jason", "matthew", "gary", "timothy", "jose", "larry", "jeffrey",
    "frank", "scott", "eric", "stephen", "andrew", "raymond", "gregory", "joshua", "jerry", "dennis",
    "mary", "patricia", "jennifer", "linda", "elizabeth", "barbara", "susan", "jessica", "sarah", "karen",
    "nancy", "lisa", "betty", "helen", "sandra", "donna", "carol", "ruth", "sharon", "michelle",
    "laura", "emily", "kimberly", "deborah", "amy", "angela", "ashley", "brenda", "emma", "olivia",
    
    // Modern popular names
    "liam", "noah", "oliver", "elijah", "lucas", "mason", "logan", "alexander", "ethan", "jacob",
    "sophia", "isabella", "mia", "charlotte", "amelia", "evelyn", "abigail", "harper", "ella", "aria",
    "grace", "chloe", "victoria", "madison", "ellie", "scarlett", "sofia", "avery", "lily", "hannah",
    
    // Spanish/Hispanic names
    "juan", "jose", "carlos", "luis", "miguel", "jorge", "pedro", "francisco", "rafael", "antonio",
    "maria", "carmen", "ana", "rosa", "elena", "isabel", "teresa", "lucia", "gabriela", "valentina",
    "santiago", "mateo", "diego", "sebastian", "alejandro", "nicolas", "adrian", "javier", "fernando", "eduardo",
    "sofia", "camila", "valentina", "isabella", "victoria", "daniela", "mariana", "fernanda", "jimena", "andrea",
    
    // French names
    "pierre", "jean", "louis", "marc", "paul", "andre", "michel", "philippe", "jacques", "henri",
    "marie", "anne", "francoise", "christine", "isabelle", "catherine", "veronique", "sylvie", "nathalie", "sandrine",
    "lucas", "leo", "gabriel", "raphael", "louis", "arthur", "hugo", "jules", "nathan", "maxime",
    "emma", "jade", "louise", "alice", "chloe", "lea", "manon", "camille", "sarah", "lola",
    
    // German names
    "hans", "peter", "klaus", "wolfgang", "jürgen", "günter", "horst", "dieter", "werner", "helmut",
    "anna", "maria", "ursula", "monika", "elisabeth", "petra", "sabine", "susanne", "andrea", "christine",
    "leon", "noah", "ben", "paul", "jonas", "elias", "finn", "luis", "luca", "felix",
    "mia", "emma", "hannah", "sophia", "emilia", "lina", "marie", "anna", "lea", "clara",
    
    // Italian names
    "giuseppe", "antonio", "mario", "francesco", "giovanni", "luigi", "angelo", "vincenzo", "pietro", "paolo",
    "maria", "anna", "rosa", "teresa", "angela", "giovanna", "lucia", "francesca", "giuseppina", "caterina",
    "leonardo", "francesco", "alessandro", "lorenzo", "mattia", "andrea", "gabriele", "matteo", "riccardo", "davide",
    "sofia", "giulia", "aurora", "alice", "ginevra", "emma", "giorgia", "greta", "beatrice", "anna",
    
    // Chinese names (Pinyin)
    "wei", "ming", "li", "jun", "lei", "jie", "yang", "feng", "hong", "bin",
    "ying", "xin", "jing", "yan", "fang", "xia", "hui", "mei", "ling", "qing",
    "chen", "wang", "zhang", "liu", "li", "yang", "huang", "zhao", "wu", "zhou",
    
    // Japanese names (Romanized)
    "hiroshi", "takeshi", "kenji", "kazuo", "masao", "yuki", "haruto", "sota", "yuito", "hinata",
    "yoko", "akiko", "keiko", "yuki", "mika", "rina", "sakura", "hana", "aoi", "mei",
    
    // Korean names (Romanized)
    "min", "jun", "ji", "soo", "hyun", "young", "ho", "jin", "dong", "seung",
    "kim", "lee", "park", "choi", "jung", "kang", "cho", "yoon", "jang", "lim",
    
    // Indian names
    "raj", "amit", "vijay", "rahul", "anil", "suresh", "prakash", "ramesh", "kumar", "ravi",
    "priya", "pooja", "anjali", "neha", "kavita", "sunita", "rekha", "geeta", "meena", "savita",
    "arjun", "rohan", "aditya", "aarav", "vivaan", "ishaan", "aayan", "sai", "reyansh", "ayaan",
    "aadhya", "ananya", "diya", "ira", "kiara", "navya", "pari", "saanvi", "sara", "zara",
    
    // Arabic names
    "mohammed", "ahmed", "ali", "omar", "hassan", "hussein", "ibrahim", "khalid", "salem", "yousef",
    "fatima", "aisha", "zainab", "maryam", "khadija", "sarah", "amina", "nour", "layla", "hana",
    
    // Russian names
    "vladimir", "sergei", "alexander", "dmitry", "andrei", "alexei", "igor", "pavel", "mikhail", "ivan",
    "elena", "olga", "tatiana", "natalia", "svetlana", "maria", "irina", "anna", "yulia", "ekaterina",
    
    // Polish names
    "jan", "andrzej", "piotr", "krzysztof", "stanislaw", "tomasz", "pawel", "jacek", "marcin", "michal",
    "maria", "anna", "katarzyna", "malgorzata", "agnieszka", "barbara", "ewa", "zofia", "krystyna", "teresa",
    
    // Portuguese/Brazilian names
    "joao", "jose", "antonio", "francisco", "carlos", "paulo", "pedro", "lucas", "luis", "marcos",
    "maria", "ana", "francisca", "antonia", "adriana", "juliana", "mariana", "patricia", "aline", "amanda",
    
    // Dutch names
    "jan", "peter", "johannes", "cornelis", "willem", "hendrik", "gerrit", "adrianus", "jacobus", "martinus",
    "maria", "anna", "johanna", "cornelia", "petronella", "hendrika", "geertruida", "elisabeth", "wilhelmina", "adriana",
    
    // Scandinavian names
    "lars", "erik", "anders", "johan", "per", "nils", "magnus", "bjorn", "hans", "ola",
    "anna", "emma", "maria", "karin", "kristina", "lisa", "helena", "eva", "birgitta", "ingrid",
    
    // Greek names
    "konstantinos", "georgios", "ioannis", "dimitrios", "nikolaos", "panagiotis", "andreas", "christos", "spyridon", "athanasios",
    "maria", "eleni", "georgia", "aikaterini", "vasiliki", "sophia", "christina", "alexandra", "dimitra", "anna",
    
    // Turkish names
    "mehmet", "mustafa", "ahmet", "ali", "hasan", "huseyin", "ibrahim", "ismail", "omer", "yusuf",
    "fatma", "ayse", "emine", "hatice", "zeynep", "elif", "merve", "busra", "rabia", "sema",
  ]),
  
  lastNames: new Set([
    // English surnames
    "smith", "johnson", "williams", "brown", "jones", "garcia", "miller", "davis", "rodriguez", "martinez",
    "hernandez", "lopez", "gonzalez", "wilson", "anderson", "thomas", "taylor", "moore", "jackson", "martin",
    "lee", "perez", "thompson", "white", "harris", "sanchez", "clark", "ramirez", "lewis", "robinson",
    "walker", "young", "allen", "king", "wright", "scott", "torres", "nguyen", "hill", "flores",
    "green", "adams", "nelson", "baker", "hall", "rivera", "campbell", "mitchell", "carter", "roberts",
    
    // Spanish/Hispanic surnames
    "fernandez", "gomez", "diaz", "moreno", "jimenez", "alvarez", "romero", "torres", "ruiz", "vargas",
    "ramos", "mendez", "castro", "ortiz", "silva", "rojas", "gutierrez", "mendoza", "cruz", "vazquez",
    
    // Chinese surnames (Pinyin)
    "wang", "li", "zhang", "liu", "chen", "yang", "huang", "zhao", "wu", "zhou",
    "xu", "sun", "ma", "zhu", "hu", "guo", "he", "gao", "lin", "luo",
    
    // Japanese surnames
    "sato", "suzuki", "takahashi", "tanaka", "watanabe", "ito", "yamamoto", "nakamura", "kobayashi", "kato",
    "yoshida", "yamada", "sasaki", "yamaguchi", "matsumoto", "inoue", "kimura", "hayashi", "shimizu", "yamazaki",
    
    // Korean surnames  
    "kim", "lee", "park", "choi", "jung", "kang", "cho", "yoon", "jang", "lim",
    "han", "oh", "seo", "shin", "kwon", "hwang", "ahn", "song", "hong", "jeon",
    
    // Indian surnames
    "patel", "singh", "kumar", "sharma", "gupta", "khan", "shah", "mehta", "reddy", "jain",
    "agarwal", "mishra", "verma", "yadav", "sinha", "pandey", "chopra", "bhatt", "malhotra", "kapoor",
    
    // European surnames
    "muller", "schmidt", "schneider", "fischer", "weber", "meyer", "wagner", "becker", "schulz", "hoffmann",
    "dubois", "martin", "bernard", "thomas", "robert", "richard", "petit", "durand", "leroy", "moreau",
    "rossi", "russo", "ferrari", "esposito", "bianchi", "romano", "colombo", "ricci", "marino", "greco",
    "kowalski", "wisniewski", "wojcik", "kaminski", "lewandowski", "zielinski", "szymanski", "wozniak", "dabrowski", "kozlowski",
    
    // Russian surnames
    "ivanov", "smirnov", "kuznetsov", "popov", "sokolov", "lebedev", "kozlov", "novikov", "morozov", "petrov",
    "volkov", "solovyov", "vasiliev", "zaitsev", "pavlov", "semyonov", "golubev", "vinogradov", "bogdanov", "vorobyov",
    
    // Arabic surnames
    "abdullah", "mohammed", "ahmed", "ali", "salem", "hassan", "hussein", "ibrahim", "khalil", "yousef",
    
    // Portuguese/Brazilian surnames
    "silva", "santos", "oliveira", "souza", "rodrigues", "ferreira", "alves", "pereira", "lima", "gomes",
    "costa", "ribeiro", "martins", "carvalho", "rocha", "almeida", "nascimento", "araujo", "melo", "barbosa",
    
    // African surnames
    "okafor", "eze", "nwosu", "okeke", "obi", "nwachukwu", "onyeka", "chukwu", "igwe", "nnamdi",
    "mensah", "adjei", "osei", "boateng", "asante", "owusu", "agyei", "antwi", "appiah", "amoah",
  ])
}
