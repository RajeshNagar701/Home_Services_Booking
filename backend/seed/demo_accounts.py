"""
HomeServe Technologies - Demonstration & Test Accounts Dataset
Contains realistic Indian dummy data for all 4 roles across Ahmedabad, Gujarat.
"""

from datetime import datetime, timedelta

# 1. Super Admin Account
ADMIN_USER = {
    "first_name": "Platform",
    "last_name": "Admin",
    "email": "admin@homeserve.com",
    "password": "Admin@12345",
    "phone": "+91 9825000001",
    "role": "super_admin",
    "is_active": True,
}

# 2. 20 Realistic Customers across Ahmedabad
CUSTOMER_USERS = [
    {"first_name": "Rahul", "last_name": "Sharma", "email": "rahul@gmail.com", "phone": "+91 9825100001"},
    {"first_name": "Priya", "last_name": "Patel", "email": "priya@gmail.com", "phone": "+91 9825100002"},
    {"first_name": "Amit", "last_name": "Verma", "email": "amit@gmail.com", "phone": "+91 9825100003"},
    {"first_name": "Neha", "last_name": "Joshi", "email": "neha@gmail.com", "phone": "+91 9825100004"},
    {"first_name": "Sneha", "last_name": "Mehta", "email": "sneha.m@gmail.com", "phone": "+91 9825100005"},
    {"first_name": "Rajesh", "last_name": "Gupta", "email": "rajesh.g@gmail.com", "phone": "+91 9825100006"},
    {"first_name": "Anjali", "last_name": "Desai", "email": "anjali.d@gmail.com", "phone": "+91 9825100007"},
    {"first_name": "Vikram", "last_name": "Rathore", "email": "vikram.r@gmail.com", "phone": "+91 9825100008"},
    {"first_name": "Pooja", "last_name": "Shah", "email": "pooja.s@gmail.com", "phone": "+91 9825100009"},
    {"first_name": "Deepak", "last_name": "Trivedi", "email": "deepak.t@gmail.com", "phone": "+91 9825100010"},
    {"first_name": "Kavita", "last_name": "Nair", "email": "kavita.n@gmail.com", "phone": "+91 9825100011"},
    {"first_name": "Suresh", "last_name": "Iyer", "email": "suresh.i@gmail.com", "phone": "+91 9825100012"},
    {"first_name": "Ritu", "last_name": "Agarwal", "email": "ritu.a@gmail.com", "phone": "+91 9825100013"},
    {"first_name": "Manoj", "last_name": "Dave", "email": "manoj.d@gmail.com", "phone": "+91 9825100014"},
    {"first_name": "Divya", "last_name": "Chauhan", "email": "divya.c@gmail.com", "phone": "+91 9825100015"},
    {"first_name": "Sanjay", "last_name": "Parekh", "email": "sanjay.p@gmail.com", "phone": "+91 9825100016"},
    {"first_name": "Bhavna", "last_name": "Bhatt", "email": "bhavna.b@gmail.com", "phone": "+91 9825100017"},
    {"first_name": "Gaurav", "last_name": "Solanki", "email": "gaurav.s@gmail.com", "phone": "+91 9825100018"},
    {"first_name": "Meera", "last_name": "Joshi", "email": "meera.j@gmail.com", "phone": "+91 9825100019"},
    {"first_name": "Harish", "last_name": "Patel", "email": "harish.p@gmail.com", "phone": "+91 9825100020"},
]

# 3. 15 Service Providers (10 Approved, 3 Pending, 2 Rejected)
SERVICE_PROVIDERS = [
    # 10 Approved Providers
    {
        "business_name": "Apex Home Solutions",
        "owner_name": "Rajesh Verma",
        "email": "apex.homes@homeserve.tech",
        "phone": "+91 9825200001",
        "address": "401 Abhishree Complex, Satellite, Ahmedabad - 380015",
        "gst_number": "24AAACH7409R1ZX",
        "experience": 8,
        "status": "approved",
        "rating": 4.8,
        "total_reviews": 46,
        "commission_rate": 15,
        "category_slugs": ["electrical-services", "ac-repair-maintenance"],
        "service_areas": ["Satellite", "Vastrapur", "Bodakdev", "Bopal"],
    },
    {
        "business_name": "SparkleClean Facility Management",
        "owner_name": "Sunita Deshmukh",
        "email": "sparkle.clean@homeserve.tech",
        "phone": "+91 9825200002",
        "address": "Shop 12, Titanium City Centre, Anandnagar, Ahmedabad - 380051",
        "gst_number": "24BBDES1290K1ZY",
        "experience": 6,
        "status": "approved",
        "rating": 4.7,
        "total_reviews": 38,
        "commission_rate": 15,
        "category_slugs": ["home-cleaning", "pest-control"],
        "service_areas": ["Navrangpura", "Satellite", "Prahlad Nagar", "Vastrapur"],
    },
    {
        "business_name": "QuickFix Appliance Services",
        "owner_name": "Vikram Malhotra",
        "email": "quickfix.appliances@homeserve.tech",
        "phone": "+91 9825200003",
        "address": "203 Galaxy Line, CG Road, Navrangpura, Ahmedabad - 380009",
        "gst_number": "24AABCM9981P1ZZ",
        "experience": 10,
        "status": "approved",
        "rating": 4.9,
        "total_reviews": 52,
        "commission_rate": 15,
        "category_slugs": ["appliance-repair", "electrical-services"],
        "service_areas": ["Navrangpura", "Maninagar", "Paldi", "Satellite"],
    },
    {
        "business_name": "Gujarat Plumbers & Sanitary Works",
        "owner_name": "Paresh Vora",
        "email": "gujarat.plumbing@homeserve.tech",
        "phone": "+91 9825200004",
        "address": "Ground Floor, Shivalik Plaza, Vastrapur, Ahmedabad - 380015",
        "gst_number": "24CCCPV4521J1Z8",
        "experience": 12,
        "status": "approved",
        "rating": 4.6,
        "total_reviews": 31,
        "commission_rate": 15,
        "category_slugs": ["plumbing-services"],
        "service_areas": ["Vastrapur", "Thaltej", "Bodakdev", "Bopal"],
    },
    {
        "business_name": "Shreeji Painting & Decorators",
        "owner_name": "Jignesh Panchal",
        "email": "shreeji.paint@homeserve.tech",
        "phone": "+91 9825200005",
        "address": "B-14 Trade Square, Science City Road, Ahmedabad - 380060",
        "gst_number": "24DDDPJ8823M1Z5",
        "experience": 9,
        "status": "approved",
        "rating": 4.8,
        "total_reviews": 29,
        "commission_rate": 15,
        "category_slugs": ["painting-services"],
        "service_areas": ["Science City", "Gota", "Thaltej", "Sola"],
    },
    {
        "business_name": "Urban Woodcraft & Carpentry",
        "owner_name": "Nilesh Suthar",
        "email": "urban.woodcraft@homeserve.tech",
        "phone": "+91 9825200006",
        "address": "7 Heritage Arcade, Prahlad Nagar, Ahmedabad - 380015",
        "gst_number": "24EEENS3492Q1Z3",
        "experience": 14,
        "status": "approved",
        "rating": 4.9,
        "total_reviews": 44,
        "commission_rate": 15,
        "category_slugs": ["carpentry-services"],
        "service_areas": ["Prahlad Nagar", "Satellite", "Makarba", "Vastrapur"],
    },
    {
        "business_name": "CoolBreeze AC Care",
        "owner_name": "Hasmukh Prajapati",
        "email": "coolbreeze.ac@homeserve.tech",
        "phone": "+91 9825200007",
        "address": "104 Dev Complex, Bopal Cross Road, Ahmedabad - 380058",
        "gst_number": "24FFFHP6712L1Z1",
        "experience": 7,
        "status": "approved",
        "rating": 4.7,
        "total_reviews": 36,
        "commission_rate": 15,
        "category_slugs": ["ac-repair-maintenance"],
        "service_areas": ["Bopal", "South Bopal", "Ghuma", "Ambli"],
    },
    {
        "business_name": "SafeHome Pest Management",
        "owner_name": "Dharmendra Rathod",
        "email": "safehome.pest@homeserve.tech",
        "phone": "+91 9825200008",
        "address": "52 Fortune Business Hub, Science City Road, Gota, Ahmedabad - 382481",
        "gst_number": "24GGGFR1190K1Z9",
        "experience": 11,
        "status": "approved",
        "rating": 4.8,
        "total_reviews": 41,
        "commission_rate": 15,
        "category_slugs": ["pest-control"],
        "service_areas": ["Gota", "Chandkheda", "Motera", "New CG Road"],
    },
    {
        "business_name": "BrightSpark Electrical Works",
        "owner_name": "Bhavesh Makwana",
        "email": "brightspark@homeserve.tech",
        "phone": "+91 9825200009",
        "address": "15 Shree Arcade, Jawahar Chowk, Maninagar, Ahmedabad - 380008",
        "gst_number": "24HHHBM9945R1Z4",
        "experience": 8,
        "status": "approved",
        "rating": 4.6,
        "total_reviews": 27,
        "commission_rate": 15,
        "category_slugs": ["electrical-services"],
        "service_areas": ["Maninagar", "Kankaria", "Isanpur", "Ghodasar"],
    },
    {
        "business_name": "CleanPro Ahmedabad",
        "owner_name": "Geeta Solanki",
        "email": "cleanpro.ahm@homeserve.tech",
        "phone": "+91 9825200010",
        "address": "301 Shivalik Shilp, Iscon Cross Road, Ahmedabad - 380015",
        "gst_number": "24IIIAS2389P1Z2",
        "experience": 5,
        "status": "approved",
        "rating": 4.5,
        "total_reviews": 22,
        "commission_rate": 15,
        "category_slugs": ["home-cleaning"],
        "service_areas": ["Satellite", "Bodakdev", "Thaltej", "Vastrapur"],
    },

    # 3 Pending Providers
    {
        "business_name": "Reliable Refrigeration & AC",
        "owner_name": "Mukesh Thakor",
        "email": "reliable.ref@homeserve.tech",
        "phone": "+91 9825200011",
        "address": "8 Sun Complex, Chandkheda, Ahmedabad - 382424",
        "gst_number": "24JJJMT5521N1Z0",
        "experience": 4,
        "status": "pending",
        "rating": 0.0,
        "total_reviews": 0,
        "commission_rate": 15,
        "category_slugs": ["ac-repair-maintenance", "appliance-repair"],
        "service_areas": ["Chandkheda", "Motera"],
    },
    {
        "business_name": "Maruti Plumbing & Drainage",
        "owner_name": "Vijay Rawal",
        "email": "maruti.plumbing@homeserve.tech",
        "phone": "+91 9825200012",
        "address": "19 Sukan Mall, Science City, Ahmedabad - 380060",
        "gst_number": "24KKKVR7732T1ZY",
        "experience": 3,
        "status": "pending",
        "rating": 0.0,
        "total_reviews": 0,
        "commission_rate": 15,
        "category_slugs": ["plumbing-services"],
        "service_areas": ["Science City", "Sola"],
    },
    {
        "business_name": "Elite Pest Eradication",
        "owner_name": "Ketan Chauhan",
        "email": "elite.pest@homeserve.tech",
        "phone": "+91 9825200013",
        "address": "22 Ratna Business Square, Ashram Road, Ahmedabad - 380006",
        "gst_number": "24LLLKC8841W1ZX",
        "experience": 5,
        "status": "pending",
        "rating": 0.0,
        "total_reviews": 0,
        "commission_rate": 15,
        "category_slugs": ["pest-control"],
        "service_areas": ["Navrangpura", "Ashram Road", "Paldi"],
    },

    # 2 Rejected Providers
    {
        "business_name": "FlyByNight Home Care",
        "owner_name": "Mohan Lal",
        "email": "flybynight@homeserve.tech",
        "phone": "+91 9825200014",
        "address": "Temporary Stall 4, Sarkhej, Ahmedabad - 382210",
        "gst_number": "24MMMML0000X1ZZ",
        "experience": 1,
        "status": "rejected",
        "rating": 0.0,
        "total_reviews": 0,
        "commission_rate": 15,
        "category_slugs": ["electrical-services"],
        "service_areas": ["Sarkhej"],
    },
    {
        "business_name": "Unverified Repairs & Fix",
        "owner_name": "Gopal Sharma",
        "email": "unverified.repairs@homeserve.tech",
        "phone": "+91 9825200015",
        "address": "Shop 99, Odhav Ring Road, Ahmedabad - 382415",
        "gst_number": "24NNNGS9999Y1ZA",
        "experience": 2,
        "status": "rejected",
        "rating": 0.0,
        "total_reviews": 0,
        "commission_rate": 15,
        "category_slugs": ["plumbing-services"],
        "service_areas": ["Odhav"],
    },
]

# 4. 25 Field Technicians (Assigned to Approved Providers)
TECHNICIANS = [
    # Apex Home Solutions (Provider index 0)
    {"first_name": "Rahul", "last_name": "Sharma", "email": "rahul.tech@homeserve.tech", "phone": "+91 9825300001", "provider_idx": 0, "specialization": "HVAC & Electrical", "experience": 6},
    {"first_name": "Mahesh", "last_name": "Patel", "email": "mahesh.tech@homeserve.tech", "phone": "+91 9825300002", "provider_idx": 0, "specialization": "AC Installation & Inverter Wiring", "experience": 5},
    {"first_name": "Govind", "last_name": "Vaghela", "email": "govind.tech@homeserve.tech", "phone": "+91 9825300003", "provider_idx": 0, "specialization": "Electric Meter & Distribution", "experience": 8},

    # SparkleClean (Provider index 1)
    {"first_name": "Suresh", "last_name": "Chavda", "email": "suresh.clean@homeserve.tech", "phone": "+91 9825300004", "provider_idx": 1, "specialization": "Deep Cleaning & Disinfection", "experience": 4},
    {"first_name": "Rekha", "last_name": "Parmar", "email": "rekha.clean@homeserve.tech", "phone": "+91 9825300005", "provider_idx": 1, "specialization": "Kitchen & Bathroom Sanitization", "experience": 5},
    {"first_name": "Dinesh", "last_name": "Bhil", "email": "dinesh.clean@homeserve.tech", "phone": "+91 9825300006", "provider_idx": 1, "specialization": "Sofa & Carpet Steaming", "experience": 3},

    # QuickFix Appliance (Provider index 2)
    {"first_name": "Amit", "last_name": "Kulkarni", "email": "amit.tech@homeserve.tech", "phone": "+91 9825300007", "provider_idx": 2, "specialization": "Refrigerator & Washing Machine", "experience": 7},
    {"first_name": "Prakash", "last_name": "Joshi", "email": "prakash.tech@homeserve.tech", "phone": "+91 9825300008", "provider_idx": 2, "specialization": "Microwave & Water Purifier RO", "experience": 6},
    {"first_name": "Chetan", "last_name": "Pandya", "email": "chetan.tech@homeserve.tech", "phone": "+91 9825300009", "provider_idx": 2, "specialization": "Geyser & Kitchen Chimney", "experience": 4},

    # Gujarat Plumbers (Provider index 3)
    {"first_name": "Naran", "last_name": "Solanki", "email": "naran.plumb@homeserve.tech", "phone": "+91 9825300010", "provider_idx": 3, "specialization": "Pipe Leakage & Concealed Plumbing", "experience": 9},
    {"first_name": "Pravin", "last_name": "Thakur", "email": "pravin.plumb@homeserve.tech", "phone": "+91 9825300011", "provider_idx": 3, "specialization": "Sanitary & Bathroom Fitting", "experience": 6},
    {"first_name": "Ashok", "last_name": "Dabhi", "email": "ashok.plumb@homeserve.tech", "phone": "+91 9825300012", "provider_idx": 3, "specialization": "Overhead Tank & Drainage Line", "experience": 8},

    # Shreeji Painting (Provider index 4)
    {"first_name": "Kailash", "last_name": "Prajapati", "email": "kailash.paint@homeserve.tech", "phone": "+91 9825300013", "provider_idx": 4, "specialization": "Interior Wall Texture & Royal Paint", "experience": 10},
    {"first_name": "Vinod", "last_name": "Barot", "email": "vinod.paint@homeserve.tech", "phone": "+91 9825300014", "provider_idx": 4, "specialization": "Waterproofing & Exterior Coating", "experience": 7},

    # Urban Woodcraft (Provider index 5)
    {"first_name": "Devendra", "last_name": "Suthar", "email": "devendra.wood@homeserve.tech", "phone": "+91 9825300015", "provider_idx": 5, "specialization": "Modular Furniture & Hinge Fitting", "experience": 11},
    {"first_name": "Ramesh", "last_name": "Mistry", "email": "ramesh.wood@homeserve.tech", "phone": "+91 9825300016", "provider_idx": 5, "specialization": "Door Locks & Wood Restoration", "experience": 8},

    # CoolBreeze AC Care (Provider index 6)
    {"first_name": "Pranav", "last_name": "Nair", "email": "pranav.ac@homeserve.tech", "phone": "+91 9825300017", "provider_idx": 6, "specialization": "Split & Inverter AC Specialist", "experience": 5},
    {"first_name": "Jayesh", "last_name": "Gadhavi", "email": "jayesh.ac@homeserve.tech", "phone": "+91 9825300018", "provider_idx": 6, "specialization": "Gas Refill & Compressor Overhaul", "experience": 7},

    # SafeHome Pest (Provider index 7)
    {"first_name": "Manish", "last_name": "Zala", "email": "manish.pest@homeserve.tech", "phone": "+91 9825300019", "provider_idx": 7, "specialization": "Herbal Cockroach Gel & Bed Bugs", "experience": 6},
    {"first_name": "Kirit", "last_name": "Makwana", "email": "kirit.pest@homeserve.tech", "phone": "+91 9825300020", "provider_idx": 7, "specialization": "Termite Drilling & Anti-Fumigation", "experience": 9},

    # BrightSpark Electrical (Provider index 8)
    {"first_name": "Haresh", "last_name": "Darji", "email": "haresh.elec@homeserve.tech", "phone": "+91 9825300021", "provider_idx": 8, "specialization": "Ceiling Fan & Chandelier Mount", "experience": 4},
    {"first_name": "Shailesh", "last_name": "Gohil", "email": "shailesh.elec@homeserve.tech", "phone": "+91 9825300022", "provider_idx": 8, "specialization": "Short Circuit Diagnosis", "experience": 8},

    # CleanPro Ahmedabad (Provider index 9)
    {"first_name": "Alpa", "last_name": "Vaghela", "email": "alpa.clean@homeserve.tech", "phone": "+91 9825300023", "provider_idx": 9, "specialization": "Villa & Duplex Deep Clean", "experience": 5},
    {"first_name": "Sanjay", "last_name": "Vankar", "email": "sanjay.clean@homeserve.tech", "phone": "+91 9825300024", "provider_idx": 9, "specialization": "Glass Facade & Floor Buffing", "experience": 6},
    {"first_name": "Pooja", "last_name": "Rathod", "email": "pooja.clean@homeserve.tech", "phone": "+91 9825300025", "provider_idx": 9, "specialization": "Move-In Move-Out Cleaning", "experience": 4},
]

# 5. 8 Service Categories
SERVICE_CATEGORIES = [
    {"name": "Electrical Services", "slug": "electrical-services", "icon": "bi-lightning-charge-fill", "description": "Licensed electricians for repairs, installations, wiring, and inverter maintenance."},
    {"name": "Plumbing Services", "slug": "plumbing-services", "icon": "bi-droplet-fill", "description": "Expert plumbers for leakages, tap fittings, pipe routing, and drainage unblocking."},
    {"name": "AC Repair & Maintenance", "slug": "ac-repair-maintenance", "icon": "bi-snow", "description": "Certified HVAC technicians for split/window AC servicing, gas charging, and installation."},
    {"name": "Home Cleaning", "slug": "home-cleaning", "icon": "bi-stars", "description": "Professional deep cleaning for full homes, kitchens, bathrooms, and upholstery."},
    {"name": "Painting Services", "slug": "painting-services", "icon": "bi-brush-fill", "description": "Interior and exterior wall painting, waterproof primer coats, and texture design."},
    {"name": "Carpentry Services", "slug": "carpentry-services", "icon": "bi-hammer", "description": "Skilled carpenters for modular furniture assembly, door locks, hinges, and wooden repairs."},
    {"name": "Appliance Repair", "slug": "appliance-repair", "icon": "bi-gear-wide-connected", "description": "Rapid repairs for refrigerators, washing machines, microwaves, and water heaters."},
    {"name": "Pest Control", "slug": "pest-control", "icon": "bi-shield-shaded", "description": "Odorless pest treatments for cockroaches, termites, bed bugs, and rodents."},
]

# 6. Service Listings (At least 5 services per category with exact requested prices in INR)
SERVICE_LISTINGS = [
    # 1. Electrical Services
    {"title": "Fan Installation", "category_slug": "electrical-services", "price": 299, "duration": 45, "description": "Ceiling or exhaust fan installation including bracket mounting, wiring connection, and regulator balancing."},
    {"title": "Switchboard Repair", "category_slug": "electrical-services", "price": 199, "duration": 30, "description": "Diagnosis and repair of faulty modular switches, sockets, and burnt board components."},
    {"title": "Wiring Repair", "category_slug": "electrical-services", "price": 499, "duration": 60, "description": "Short circuit inspection, neutral wire tracing, and concealed wiring repair with safety insulation."},
    {"title": "Light Installation", "category_slug": "electrical-services", "price": 249, "duration": 30, "description": "Installation of LED tube lights, decorative ceiling fixtures, wall sconces, or spotlights."},
    {"title": "Inverter Repair", "category_slug": "electrical-services", "price": 599, "duration": 60, "description": "Comprehensive troubleshooting of home inverters, battery terminal check, charging circuit, and relay repair."},

    # 2. Plumbing Services
    {"title": "Tap Repair", "category_slug": "plumbing-services", "price": 199, "duration": 30, "description": "Fix dripping taps, spindle replacement, washer change, and aerator cleaning for kitchen or washbasin."},
    {"title": "Pipe Leakage", "category_slug": "plumbing-services", "price": 399, "duration": 60, "description": "Concealed or exposed PVC/CPVC pipe leakage repair, sealant application, and joint replacement."},
    {"title": "Bathroom Fitting", "category_slug": "plumbing-services", "price": 799, "duration": 90, "description": "Installation of shower head, health faucet, angle valve, soap dispenser, and towel rack."},
    {"title": "Drain Cleaning", "category_slug": "plumbing-services", "price": 499, "duration": 60, "description": "Clogged kitchen sink or bathroom drain unblocking using mechanical spring wire and enzyme unblockers."},
    {"title": "Water Tank Repair", "category_slug": "plumbing-services", "price": 699, "duration": 90, "description": "Overhead water tank ball valve replacement, overflow line routing, and inlet connector leak fix."},

    # 3. AC Services
    {"title": "AC General Service", "category_slug": "ac-repair-maintenance", "price": 599, "duration": 60, "description": "High-pressure jet pump cleaning of indoor indoor/outdoor coils, filter wash, tray clearing, and cooling check."},
    {"title": "AC Installation", "category_slug": "ac-repair-maintenance", "price": 1499, "duration": 120, "description": "Complete split AC installation with outdoor unit mounting, copper piping vacuuming, and core drill."},
    {"title": "Gas Refill", "category_slug": "ac-repair-maintenance", "price": 1999, "duration": 90, "description": "R32 / R410A refrigerant gas charging with nitrogen pressure leak test and electronic valve seal."},
    {"title": "AC Repair", "category_slug": "ac-repair-maintenance", "price": 499, "duration": 60, "description": "Diagnostic inspection for cooling loss, water leakage from indoor unit, PCB error code, or blower issue."},
    {"title": "AC Uninstallation", "category_slug": "ac-repair-maintenance", "price": 799, "duration": 60, "description": "Safe split AC dismantling, gas pump down to outdoor compressor, and bracket detachment."},

    # 4. Home Cleaning
    {"title": "Full Home Deep Cleaning", "category_slug": "home-cleaning", "price": 2499, "duration": 240, "description": "Complete top-to-bottom scrub and disinfection of all rooms, floors, windows, and ceiling fans."},
    {"title": "Bathroom Deep Cleaning", "category_slug": "home-cleaning", "price": 499, "duration": 60, "description": "Tile scale removal, commode descaling, mirror buffing, and high-pressure hot water spray."},
    {"title": "Kitchen Deep Cleaning", "category_slug": "home-cleaning", "price": 899, "duration": 120, "description": "Exhaust fan and chimney degreasing, slab wiping, cabinet scrub, and oil stain eradication."},
    {"title": "Sofa & Upholstery Cleaning", "category_slug": "home-cleaning", "price": 699, "duration": 90, "description": "Wet foam shampooing and vacuum extraction for 5-seater fabric or leather sofas."},
    {"title": "Balcony & Window Cleaning", "category_slug": "home-cleaning", "price": 349, "duration": 45, "description": "Track dirt vacuuming, glass panel streak-free wipe, and balcony floor wash."},

    # 5. Painting Services
    {"title": "Full Home Painting", "category_slug": "painting-services", "price": 8999, "duration": 720, "description": "Complete 2-coat emulsion painting with putty filling and primer undercoat for 2BHK/3BHK apartments."},
    {"title": "Single Room Painting", "category_slug": "painting-services", "price": 1999, "duration": 180, "description": "Freshen up single bedroom walls with washable plastic paint and mask tape floor protection."},
    {"title": "Waterproofing Treatment", "category_slug": "painting-services", "price": 2499, "duration": 240, "description": "Terrace or bathroom ceiling dampness repair with chemical polymer coat and crack seal."},
    {"title": "Wall Texture Painting", "category_slug": "painting-services", "price": 1499, "duration": 120, "description": "Designer accent wall texture with metallic or rustic finish for living room focal walls."},
    {"title": "Door & Window Polishing", "category_slug": "painting-services", "price": 899, "duration": 90, "description": "Teak wood PU clear polish and melamine protective coat for front doors and window frames."},

    # 6. Carpentry Services
    {"title": "Door Lock Repair & Replacement", "category_slug": "carpentry-services", "price": 299, "duration": 45, "description": "Cylinder lock installation, latch adjustment, and mortise handle fitting for main or room doors."},
    {"title": "Furniture Assembly", "category_slug": "carpentry-services", "price": 499, "duration": 60, "description": "Professional setup of flat-pack beds, study desks, wardrobes, and modular shoe racks."},
    {"title": "Cupboard Hinge Repair", "category_slug": "carpentry-services", "price": 249, "duration": 30, "description": "Realignment and screw anchor reinforcement of soft-close hydraulic kitchen and wardrobe hinges."},
    {"title": "Wooden Partition Installation", "category_slug": "carpentry-services", "price": 1999, "duration": 180, "description": "Custom plywood or acoustic panel partition fitting for study alcoves and living room dividers."},
    {"title": "Bed Repair & Slat Replacement", "category_slug": "carpentry-services", "price": 599, "duration": 60, "description": "Fix squeaking wooden beds, hydraulic storage channel alignment, and damaged plywood replacement."},

    # 7. Appliance Repair
    {"title": "Refrigerator Repair", "category_slug": "appliance-repair", "price": 499, "duration": 60, "description": "Single/double door fridge diagnosis, relay replacement, cooling fan repair, and door gasket sealing."},
    {"title": "Washing Machine Repair", "category_slug": "appliance-repair", "price": 549, "duration": 60, "description": "Front/top load spin drum vibration diagnosis, drain pump repair, and inlet valve replacement."},
    {"title": "Microwave Oven Repair", "category_slug": "appliance-repair", "price": 399, "duration": 45, "description": "Troubleshoot heating failure, magnetron diode check, glass turntable motor, and touch keypad repair."},
    {"title": "Water Purifier / RO Service", "category_slug": "appliance-repair", "price": 449, "duration": 45, "description": "Sediment and carbon filter replacement, membrane flush, TDS check, and booster pump inspection."},
    {"title": "Geyser / Water Heater Repair", "category_slug": "appliance-repair", "price": 399, "duration": 45, "description": "Thermostat calibration, heating coil descaling, and safety pressure release valve replacement."},

    # 8. Pest Control
    {"title": "Cockroach Control", "category_slug": "pest-control", "price": 699, "duration": 45, "description": "Odorless herbal gel baiting in kitchen cabinets and dark corners with 90-day eradication guarantee."},
    {"title": "Termite Treatment", "category_slug": "pest-control", "price": 1899, "duration": 120, "description": "Sub-slab drilling and chemical barrier injection along skirting boards to protect wooden fixtures."},
    {"title": "Bed Bug Control", "category_slug": "pest-control", "price": 1199, "duration": 90, "description": "Two-stage intensive spray treatment for mattresses, bed frames, and sofa crevices."},
    {"title": "Mosquito Fogging", "category_slug": "pest-control", "price": 799, "duration": 45, "description": "Thermal fogging and larvicide spraying for residential societies, basements, and open gardens."},
    {"title": "Rodent Control", "category_slug": "pest-control", "price": 899, "duration": 60, "description": "Rodent repellent station placement and glue trap routing for home and office false ceilings."},
]

# 7. 30 Realistic Customer Service Addresses across Ahmedabad, Gujarat
AHMEDABAD_ADDRESSES = [
    {"street": "Flat 402, Shivalik Residency, Near AEC Ground", "area": "Navrangpura", "pincode": "380009", "landmark": "Behind HL Commerce College"},
    {"street": "B-12 Orchid Harmony, Opp. Star Bazaar", "area": "Satellite", "pincode": "380015", "landmark": "Near Jodhpur Cross Road"},
    {"street": "A-704 Gala Celestia, Near Vastrapur Lake", "area": "Vastrapur", "pincode": "380015", "landmark": "Opposite AlphaOne Mall"},
    {"street": "Villa 18, Applewoods Township, SP Ring Road", "area": "Bopal", "pincode": "380058", "landmark": "Near Shanti Asiatic School"},
    {"street": "301 Titanium Square, S.G. Highway", "area": "Thaltej", "pincode": "380054", "landmark": "Opposite Acrysil Limited"},
    {"street": "12 Shrinath Apartment, Jawahar Chowk", "area": "Maninagar", "pincode": "380008", "landmark": "Near Kankaria Gate No 3"},
    {"street": "502 Safal Parisar, Anand Nagar Road", "area": "Prahlad Nagar", "pincode": "380015", "landmark": "Opposite Prahladnagar Garden"},
    {"street": "Row House 22, Sangath Terraces", "area": "Chandkheda", "pincode": "382424", "landmark": "Near Visat Petrol Pump"},
    {"street": "D-903 Olive Greens, Off SG Highway", "area": "Gota", "pincode": "382481", "landmark": "Opposite Silver Oak College"},
    {"street": "204 Sukan Residency, S.P. Ring Road", "area": "Science City", "pincode": "380060", "landmark": "Near Science City Main Gate"},
    {"street": "Flat 101, Nilkanth Flats, Navrangpura", "area": "Navrangpura", "pincode": "380009", "landmark": "Near Municipal Market"},
    {"street": "403 Goyal Intercity, Drive-In Road", "area": "Vastrapur", "pincode": "380054", "landmark": "Opposite Drive-In Cinema"},
    {"street": "Plot 55, Sun City Sector 1", "area": "South Bopal", "pincode": "380058", "landmark": "Near Sobo Center"},
    {"street": "C-302 Silver Brook, Ramdev Nagar", "area": "Satellite", "pincode": "380015", "landmark": "Near ISRO Colony"},
    {"street": "Flat 801, Zion Prime, Thaltej Shilaj Road", "area": "Thaltej", "pincode": "380059", "landmark": "Near Club O7 Road"},
    {"street": "House 14, Brahmin Mitra Mandal Society", "area": "Ellisbridge", "pincode": "380006", "landmark": "Near Law Garden"},
    {"street": "Flat 604, Venus Parkland, Vejalpur", "area": "Prahlad Nagar", "pincode": "380051", "landmark": "Near Butbhavani Temple"},
    {"street": "B-201 Dev Castle, Rambaug", "area": "Maninagar", "pincode": "380008", "landmark": "Near LG Hospital"},
    {"street": "House 8, Krishna Bungalows, New CG Road", "area": "Chandkheda", "pincode": "382424", "landmark": "Near D-Mart"},
    {"street": "Tower 4, Flat 1102, Godrej Garden City", "area": "Gota", "pincode": "382470", "landmark": "Near Global Indian International School"},
    {"street": "B-303 Heritage Skyz, Science City Road", "area": "Science City", "pincode": "380060", "landmark": "Near Hetarth Party Plot"},
    {"street": "Flat 502, Maruti Towers, Subhash Bridge", "area": "Sabarmati", "pincode": "380027", "landmark": "Near RTO Office"},
    {"street": "Flat 304, Suryadeep Enclave, Paldi", "area": "Paldi", "pincode": "380007", "landmark": "Near Mahalaxmi Cross Road"},
    {"street": "House 31, Swastik Society", "area": "Navrangpura", "pincode": "380009", "landmark": "Behind Stadium Bus Stand"},
    {"street": "Flat 702, Aryavrat IV", "area": "Satellite", "pincode": "380015", "landmark": "Near Prernatirth Derasar"},
    {"street": "Row House 9, Bopal Gam", "area": "Bopal", "pincode": "380058", "landmark": "Near Bopal Lake"},
    {"street": "Flat 1204, Westgate Residency", "area": "Thaltej", "pincode": "380054", "landmark": "Near YMCA Club"},
    {"street": "Flat 401, Pushpak Flats, Uttam Nagar", "area": "Maninagar", "pincode": "380008", "landmark": "Near Maninagar Railway Station"},
    {"street": "B-504 Vandematram Icon", "area": "Gota", "pincode": "382481", "landmark": "Near Gota Flyover"},
    {"street": "A-801 Status Elysium", "area": "Science City", "pincode": "380060", "landmark": "Opposite CIMS Hospital"}
]

# 8. Sample Coupons & Promotional Offers
SAMPLE_COUPONS = [
    {"code": "WELCOME10", "discount_type": "percentage", "discount_value": 10, "min_order_amount": 299, "max_discount_amount": 100, "usage_limit": 500, "valid_days": 90},
    {"code": "HOME20", "discount_type": "percentage", "discount_value": 20, "min_order_amount": 599, "max_discount_amount": 250, "usage_limit": 200, "valid_days": 60},
    {"code": "FIRST100", "discount_type": "flat", "discount_value": 100, "min_order_amount": 399, "max_discount_amount": 100, "usage_limit": 300, "valid_days": 45},
    {"code": "CLEAN15", "discount_type": "percentage", "discount_value": 15, "min_order_amount": 499, "max_discount_amount": 300, "usage_limit": 150, "valid_days": 30},
    {"code": "FESTIVE25", "discount_type": "percentage", "discount_value": 25, "min_order_amount": 999, "max_discount_amount": 500, "usage_limit": 100, "valid_days": 30},
]

# 9. Provider Subscription Plans
SUBSCRIPTION_PLANS = [
    {"name": "Free Tier", "price": 0, "duration_days": 30, "booking_limit": 15, "commission_rate": 20, "description": "Starter plan for independent technicians and new service businesses."},
    {"name": "Basic", "price": 499, "duration_days": 30, "booking_limit": 50, "commission_rate": 15, "description": "Standard business plan with regional catalog visibility and job alerts."},
    {"name": "Professional", "price": 999, "duration_days": 30, "booking_limit": 150, "commission_rate": 12, "description": "Accelerated visibility, team technician assignments, and priority dispatch."},
    {"name": "Enterprise", "price": 1999, "duration_days": 30, "booking_limit": 500, "commission_rate": 10, "description": "Unlimited bookings, 10% platform fee, dedicated support executive, and badge."},
]
