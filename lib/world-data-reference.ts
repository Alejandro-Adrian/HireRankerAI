export const WORLD_CITIES = new Set([
  // United States - Major Cities
  "new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia", "san antonio", "san diego", "dallas", "san jose",
  "austin", "jacksonville", "fort worth", "columbus", "charlotte", "san francisco", "indianapolis", "seattle", "denver", "washington",
  "boston", "el paso", "detroit", "nashville", "portland", "memphis", "oklahoma city", "las vegas", "louisville", "baltimore",
  "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas city", "atlanta", "long beach", "colorado springs",
  "raleigh", "miami", "virginia beach", "omaha", "oakland", "minneapolis", "tulsa", "arlington", "tampa", "new orleans",
  
  // Canada - Major Cities
  "toronto", "montreal", "vancouver", "calgary", "edmonton", "ottawa", "winnipeg", "quebec city", "hamilton", "kitchener",
  "london", "victoria", "halifax", "oshawa", "windsor", "saskatoon", "regina", "st. john's", "barrie", "kelowna",
  
  // United Kingdom
  "london", "manchester", "birmingham", "leeds", "glasgow", "southampton", "liverpool", "newcastle", "nottingham", "sheffield",
  "bristol", "belfast", "leicester", "edinburgh", "brighton", "bournemouth", "cardiff", "middlesbrough", "stoke", "coventry",
  
  // Australia  
  "sydney", "melbourne", "brisbane", "perth", "adelaide", "gold coast", "canberra", "newcastle", "wollongong", "geelong",
  "hobart", "townsville", "cairns", "darwin", "toowoomba", "ballarat", "bendigo", "albury", "launceston", "mackay",
  
  // Europe - Major Cities
  "paris", "berlin", "madrid", "rome", "barcelona", "vienna", "hamburg", "munich", "milan", "prague",
  "budapest", "warsaw", "bucharest", "vienna", "stockholm", "brussels", "amsterdam", "copenhagen", "oslo", "helsinki",
  "dublin", "lisbon", "athens", "zurich", "geneva", "lyon", "marseille", "valencia", "seville", "naples",
  "frankfurt", "cologne", "stuttgart", "dusseldorf", "dortmund", "essen", "leipzig", "dresden", "hanover", "nuremberg",
  
  // Asia - Major Cities
  "tokyo", "delhi", "shanghai", "mumbai", "beijing", "osaka", "karachi", "dhaka", "manila", "seoul",
  "jakarta", "bangkok", "hong kong", "singapore", "kuala lumpur", "tehran", "baghdad", "riyadh", "ankara", "istanbul",
  "dubai", "abu dhabi", "doha", "kuwait city", "amman", "beirut", "damascus", "jerusalem", "tel aviv", "kabul",
  "islamabad", "lahore", "kolkata", "chennai", "bangalore", "hyderabad", "ahmedabad", "pune", "surat", "jaipur",
  "lucknow", "kanpur", "nagpur", "visakhapatnam", "indore", "thane", "bhopal", "patna", "vadodara", "ludhiana",
  
  // China - Major Cities  
  "guangzhou", "shenzhen", "chengdu", "tianjin", "wuhan", "hangzhou", "nanjing", "xi'an", "chongqing", "shenyang",
  "qingdao", "jinan", "harbin", "zhengzhou", "shijiazhuang", "suzhou", "taiyuan", "kunming", "changchun", "dalian",
  
  // Japan - Major Cities
  "yokohama", "nagoya", "sapporo", "kobe", "kyoto", "fukuoka", "kawasaki", "saitama", "hiroshima", "sendai",
  
  // India - Major Cities
  "gurgaon", "noida", "ghaziabad", "faridabad", "chandigarh", "coimbatore", "kochi", "madurai", "nashik", "rajkot",
  
  // Southeast Asia
  "ho chi minh city", "hanoi", "phnom penh", "vientiane", "yangon", "naypyidaw", "kathmandu", "thimphu", "colombo", "male",
  
  // Middle East
  "muscat", "manama", "sanaa", "aden", "jeddah", "medina", "mecca", "basra", "mosul", "erbil",
  
  // Africa - Major Cities
  "lagos", "cairo", "kinshasa", "johannesburg", "khartoum", "alexandria", "abidjan", "casablanca", "cape town", "durban",
  "nairobi", "dakar", "accra", "addis ababa", "pretoria", "kampala", "dar es salaam", "luanda", "kano", "ibadan",
  "algiers", "tripoli", "rabat", "tunis", "mogadishu", "bamako", "niamey", "ouagadougou", "conakry", "freetown",
  
  // South America - Major Cities
  "sao paulo", "rio de janeiro", "buenos aires", "lima", "bogota", "santiago", "caracas", "montevideo", "quito", "asuncion",
  "brasilia", "belo horizonte", "fortaleza", "manaus", "recife", "salvador", "curitiba", "porto alegre", "goiania", "campinas",
  "medellin", "cali", "barranquilla", "cartagena", "guayaquil", "cuenca", "arequipa", "trujillo", "chiclayo", "iquitos",
  
  // Mexico - Major Cities
  "mexico city", "guadalajara", "monterrey", "puebla", "tijuana", "leon", "juarez", "zapopan", "naucalpan", "merida",
  "san luis potosi", "aguascalientes", "hermosillo", "saltillo", "mexicali", "culiacan", "acapulco", "tlalnepantla", "cancun", "queretaro",
  
  // Central America
  "guatemala city", "san salvador", "tegucigalpa", "managua", "san jose", "panama city", "belize city", "san pedro sula", "leon", "granada",
  
  // Caribbean
  "havana", "santo domingo", "port-au-prince", "kingston", "san juan", "nassau", "bridgetown", "port of spain", "george town", "castries",
  
  // Oceania
  "auckland", "wellington", "christchurch", "hamilton", "tauranga", "napier", "dunedin", "palmerston north", "rotorua", "new plymouth",
  "suva", "lautoka", "port moresby", "lae", "mount hagen", "madang", "port vila", "honiara", "apia", "nuku'alofa",
  
  // Russia - Major Cities
  "moscow", "saint petersburg", "novosibirsk", "yekaterinburg", "kazan", "nizhny novgorod", "chelyabinsk", "samara", "omsk", "rostov-on-don",
  "ufa", "krasnoyarsk", "voronezh", "perm", "volgograd", "krasnodar", "saratov", "tyumen", "tolyatti", "izhevsk",
  
  // Common US State Abbreviations & Full Names
  "california", "texas", "florida", "new york", "pennsylvania", "illinois", "ohio", "georgia", "north carolina", "michigan",
  "ca", "ny", "tx", "fl", "il", "pa", "oh", "ga", "nc", "mi", "nj", "va", "wa", "az", "ma",
])

export const INTERNATIONAL_NAMES = {
  // English-speaking countries
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
