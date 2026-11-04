require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const {
  User,
  Customer,
  Provider,
  Technician,
  Category,
  Service,
  Address,
  Booking,
  Payment,
  Transaction,
  Commission,
  Review,
  Complaint,
  Coupon,
  Availability,
  ProviderDocument,
  Notification,
  SlotAllocation
} = require('../models');
const {
  ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PROVIDER_STATUS,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY
} = require('../config/constants');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Ensuring clean, idempotent state...');
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Provider.deleteMany({}),
      Technician.deleteMany({}),
      Category.deleteMany({}),
      Service.deleteMany({}),
      Address.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Transaction.deleteMany({}),
      Commission.deleteMany({}),
      Review.deleteMany({}),
      Complaint.deleteMany({}),
      Coupon.deleteMany({}),
      Availability.deleteMany({}),
      ProviderDocument.deleteMany({}),
      Notification.deleteMany({}),
      SlotAllocation.deleteMany({})
    ]);

    // 1. Super Admins
    console.log('[Seed] Creating Super Admin Accounts...');
    const superAdmin1 = await User.create({
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@homeserve.com',
      phone: '+91 9825000001',
      password: 'Admin@12345',
      role: ROLES.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true
    });

    const superAdmin2 = await User.create({
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@homeserve.tech',
      phone: '+91 9825000002',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true
    });

    // 2. 20 Realistic Customers
    console.log('[Seed] Creating 20 Ahmedabad Customers...');
    const rawCustomers = [
      { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@gmail.com', phone: '+91 9825100001' },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya@gmail.com', phone: '+91 9825100002' },
      { firstName: 'Amit', lastName: 'Verma', email: 'amit@gmail.com', phone: '+91 9825100003' },
      { firstName: 'Neha', lastName: 'Joshi', email: 'neha@gmail.com', phone: '+91 9825100004' },
      { firstName: 'Sneha', lastName: 'Mehta', email: 'sneha.m@gmail.com', phone: '+91 9825100005' },
      { firstName: 'Rajesh', lastName: 'Gupta', email: 'rajesh.g@gmail.com', phone: '+91 9825100006' },
      { firstName: 'Anjali', lastName: 'Desai', email: 'anjali.d@gmail.com', phone: '+91 9825100007' },
      { firstName: 'Vikram', lastName: 'Rathore', email: 'vikram.r@gmail.com', phone: '+91 9825100008' },
      { firstName: 'Pooja', lastName: 'Shah', email: 'pooja.s@gmail.com', phone: '+91 9825100009' },
      { firstName: 'Deepak', lastName: 'Trivedi', email: 'deepak.t@gmail.com', phone: '+91 9825100010' },
      { firstName: 'Kavita', lastName: 'Nair', email: 'kavita.n@gmail.com', phone: '+91 9825100011' },
      { firstName: 'Suresh', lastName: 'Iyer', email: 'suresh.i@gmail.com', phone: '+91 9825100012' },
      { firstName: 'Ritu', lastName: 'Agarwal', email: 'ritu.a@gmail.com', phone: '+91 9825100013' },
      { firstName: 'Manoj', lastName: 'Dave', email: 'manoj.d@gmail.com', phone: '+91 9825100014' },
      { firstName: 'Divya', lastName: 'Chauhan', email: 'divya.c@gmail.com', phone: '+91 9825100015' },
      { firstName: 'Sanjay', lastName: 'Parekh', email: 'sanjay.p@gmail.com', phone: '+91 9825100016' },
      { firstName: 'Bhavna', lastName: 'Bhatt', email: 'bhavna.b@gmail.com', phone: '+91 9825100017' },
      { firstName: 'Gaurav', lastName: 'Solanki', email: 'gaurav.s@gmail.com', phone: '+91 9825100018' },
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@gmail.com', phone: '+91 9825100019' },
      { firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@gmail.com', phone: '+91 9825100020' }
    ];

    const customerUserDocs = [];
    const customerDocs = [];

    for (const c of rawCustomers) {
      const uDoc = await User.create({
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        password: 'CustomerPassword123!',
        role: ROLES.CUSTOMER,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + customerUserDocs.length}?w=150&auto=format&fit=crop&q=80`,
        isActive: true,
        isEmailVerified: true
      });
      customerUserDocs.push(uDoc);

      const custProfile = await Customer.create({
        user: uDoc._id,
        savedAddresses: [],
        totalBookings: 0
      });
      customerDocs.push(custProfile);
    }

    // 3. 30 Customer Service Addresses in Ahmedabad, Gujarat
    console.log('[Seed] Creating 30 Ahmedabad Service Addresses...');
    const rawAddresses = [
      { streetAddress: 'Flat 402, Shivalik Residency, AEC Ground', area: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', landmark: 'Behind HL College' },
      { streetAddress: 'B-12 Orchid Harmony, Opp. Star Bazaar', area: 'Satellite', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', landmark: 'Near Jodhpur Cross Road' },
      { streetAddress: 'A-704 Gala Celestia, Near Vastrapur Lake', area: 'Vastrapur', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', landmark: 'Opposite AlphaOne Mall' },
      { streetAddress: 'Villa 18, Applewoods Township, SP Ring Road', area: 'Bopal', city: 'Ahmedabad', state: 'Gujarat', pincode: '380058', landmark: 'Near Shanti Asiatic School' },
      { streetAddress: '301 Titanium Square, S.G. Highway', area: 'Thaltej', city: 'Ahmedabad', state: 'Gujarat', pincode: '380054', landmark: 'Opposite Acrysil Limited' },
      { streetAddress: '12 Shrinath Apartment, Jawahar Chowk', area: 'Maninagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380008', landmark: 'Near Kankaria Gate 3' },
      { streetAddress: '502 Safal Parisar, Anand Nagar Road', area: 'Prahlad Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', landmark: 'Opp. Prahladnagar Garden' },
      { streetAddress: 'Row House 22, Sangath Terraces', area: 'Chandkheda', city: 'Ahmedabad', state: 'Gujarat', pincode: '382424', landmark: 'Near Visat Petrol Pump' },
      { streetAddress: 'D-903 Olive Greens, Off SG Highway', area: 'Gota', city: 'Ahmedabad', state: 'Gujarat', pincode: '382481', landmark: 'Opp. Silver Oak College' },
      { streetAddress: '204 Sukan Residency, S.P. Ring Road', area: 'Science City', city: 'Ahmedabad', state: 'Gujarat', pincode: '380060', landmark: 'Near Science City Main Gate' },
      { streetAddress: 'Flat 101, Nilkanth Flats, Municipal Market', area: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', landmark: 'Near Stadium Cross Road' },
      { streetAddress: '403 Goyal Intercity, Drive-In Road', area: 'Vastrapur', city: 'Ahmedabad', state: 'Gujarat', pincode: '380054', landmark: 'Opposite Drive-In Cinema' },
      { streetAddress: 'Plot 55, Sun City Sector 1', area: 'South Bopal', city: 'Ahmedabad', state: 'Gujarat', pincode: '380058', landmark: 'Near Sobo Center' },
      { streetAddress: 'C-302 Silver Brook, Ramdev Nagar', area: 'Satellite', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', landmark: 'Near ISRO Colony' },
      { streetAddress: 'Flat 801, Zion Prime, Thaltej Shilaj Road', area: 'Thaltej', city: 'Ahmedabad', state: 'Gujarat', pincode: '380059', landmark: 'Near Club O7 Road' },
      { streetAddress: 'House 14, Brahmin Mitra Mandal Society', area: 'Ellisbridge', city: 'Ahmedabad', state: 'Gujarat', pincode: '380006', landmark: 'Near Law Garden' },
      { streetAddress: 'Flat 604, Venus Parkland, Vejalpur Road', area: 'Prahlad Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380051', landmark: 'Near Butbhavani Temple' },
      { streetAddress: 'B-201 Dev Castle, Rambaug', area: 'Maninagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380008', landmark: 'Near LG Hospital' },
      { streetAddress: 'House 8, Krishna Bungalows, New CG Road', area: 'Chandkheda', city: 'Ahmedabad', state: 'Gujarat', pincode: '382424', landmark: 'Near D-Mart' },
      { streetAddress: 'Tower 4, Flat 1102, Godrej Garden City', area: 'Gota', city: 'Ahmedabad', state: 'Gujarat', pincode: '382470', landmark: 'Near Global Indian School' },
      { streetAddress: 'B-303 Heritage Skyz, Science City Road', area: 'Science City', city: 'Ahmedabad', state: 'Gujarat', pincode: '380060', landmark: 'Near Hetarth Party Plot' },
      { streetAddress: 'Flat 502, Maruti Towers, Subhash Bridge', area: 'Sabarmati', city: 'Ahmedabad', state: 'Gujarat', pincode: '380027', landmark: 'Near RTO Office' },
      { streetAddress: 'Flat 304, Suryadeep Enclave, Paldi', area: 'Paldi', city: 'Ahmedabad', state: 'Gujarat', pincode: '380007', landmark: 'Near Mahalaxmi Cross Road' },
      { streetAddress: 'House 31, Swastik Society, Stadium Road', area: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', landmark: 'Behind Stadium Bus Stand' },
      { streetAddress: 'Flat 702, Aryavrat IV, Prernatirth Road', area: 'Satellite', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', landmark: 'Near Prernatirth Derasar' },
      { streetAddress: 'Row House 9, Bopal Lake Road', area: 'Bopal', city: 'Ahmedabad', state: 'Gujarat', pincode: '380058', landmark: 'Near Bopal Lake' },
      { streetAddress: 'Flat 1204, Westgate Residency', area: 'Thaltej', city: 'Ahmedabad', state: 'Gujarat', pincode: '380054', landmark: 'Near YMCA Club' },
      { streetAddress: 'Flat 401, Pushpak Flats, Uttam Nagar', area: 'Maninagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380008', landmark: 'Near Railway Station' },
      { streetAddress: 'B-504 Vandematram Icon, Gota', area: 'Gota', city: 'Ahmedabad', state: 'Gujarat', pincode: '382481', landmark: 'Near Gota Flyover' },
      { streetAddress: 'A-801 Status Elysium, Science City Road', area: 'Science City', city: 'Ahmedabad', state: 'Gujarat', pincode: '380060', landmark: 'Opposite CIMS Hospital' }
    ];

    const addressDocs = [];
    for (let i = 0; i < rawAddresses.length; i++) {
      const custUser = customerUserDocs[i % customerUserDocs.length];
      const addrDoc = await Address.create({
        user: custUser._id,
        streetAddress: rawAddresses[i].streetAddress,
        landmark: rawAddresses[i].landmark,
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: rawAddresses[i].pincode,
        contactPhone: custUser.phone,
        type: i % 3 === 0 ? 'office' : 'home',
        isDefault: i < customerUserDocs.length
      });
      addressDocs.push(addrDoc);

      await Customer.findOneAndUpdate(
        { user: custUser._id },
        { $push: { savedAddresses: addrDoc._id } }
      );
    }

    // 4. 8 Service Categories
    console.log('[Seed] Creating 8 Service Categories...');
    const rawCategories = [
      { name: 'Electrical Services', slug: 'electrical-services', icon: 'bi-lightning-charge-fill', description: 'Licensed electricians for repairs, wiring, and inverter maintenance.' },
      { name: 'Plumbing Services', slug: 'plumbing-services', icon: 'bi-droplet-fill', description: 'Expert plumbers for leakages, tap fittings, and drainage unblocking.' },
      { name: 'AC Repair & Maintenance', slug: 'ac-repair-maintenance', icon: 'bi-snow', description: 'Certified HVAC technicians for split/window AC servicing, gas charging, and installation.' },
      { name: 'Home Cleaning', slug: 'home-cleaning', icon: 'bi-stars', description: 'Professional deep cleaning for full homes, kitchens, bathrooms, and upholstery.' },
      { name: 'Painting Services', slug: 'painting-services', icon: 'bi-brush-fill', description: 'Interior and exterior wall painting, waterproof primer coats, and texture design.' },
      { name: 'Carpentry Services', slug: 'carpentry-services', icon: 'bi-hammer', description: 'Skilled carpenters for modular furniture assembly, door locks, hinges, and wooden repairs.' },
      { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'bi-gear-wide-connected', description: 'Rapid repairs for refrigerators, washing machines, microwaves, and water heaters.' },
      { name: 'Pest Control', slug: 'pest-control', icon: 'bi-shield-shaded', description: 'Odorless pest treatments for cockroaches, termites, bed bugs, and rodents.' }
    ];

    const categoryMap = {};
    for (const cat of rawCategories) {
      const catDoc = await Category.create(cat);
      categoryMap[cat.slug] = catDoc;
    }

    // 5. 15 Service Providers (10 Approved, 3 Pending, 2 Rejected)
    console.log('[Seed] Creating 15 Service Providers in Ahmedabad...');
    const rawProviders = [
      // 10 Approved Providers
      {
        firstName: 'Rajesh', lastName: 'Verma', email: 'apex.homes@homeserve.tech', phone: '+91 9825200001',
        businessName: 'Apex Home Solutions', address: '401 Abhishree Complex, Satellite, Ahmedabad',
        gstNumber: '24AAACH7409R1ZX', experience: 8, status: PROVIDER_STATUS.APPROVED, rating: 4.8, totalReviews: 46,
        categories: [categoryMap['electrical-services']._id, categoryMap['ac-repair-maintenance']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380015', '380054', '380058'] }]
      },
      {
        firstName: 'Sunita', lastName: 'Deshmukh', email: 'sparkle.clean@homeserve.tech', phone: '+91 9825200002',
        businessName: 'SparkleClean Facility Management', address: 'Shop 12, Titanium City Centre, Anandnagar, Ahmedabad',
        gstNumber: '24BBDES1290K1ZY', experience: 6, status: PROVIDER_STATUS.APPROVED, rating: 4.7, totalReviews: 38,
        categories: [categoryMap['home-cleaning']._id, categoryMap['pest-control']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380009', '380015', '380051'] }]
      },
      {
        firstName: 'Vikram', lastName: 'Malhotra', email: 'quickfix.appliances@homeserve.tech', phone: '+91 9825200003',
        businessName: 'QuickFix Appliance Services', address: '203 Galaxy Line, CG Road, Navrangpura, Ahmedabad',
        gstNumber: '24AABCM9981P1ZZ', experience: 10, status: PROVIDER_STATUS.APPROVED, rating: 4.9, totalReviews: 52,
        categories: [categoryMap['appliance-repair']._id, categoryMap['electrical-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380009', '380008', '380007'] }]
      },
      {
        firstName: 'Paresh', lastName: 'Vora', email: 'gujarat.plumbing@homeserve.tech', phone: '+91 9825200004',
        businessName: 'Gujarat Plumbers & Sanitary Works', address: 'Ground Floor, Shivalik Plaza, Vastrapur, Ahmedabad',
        gstNumber: '24CCCPV4521J1Z8', experience: 12, status: PROVIDER_STATUS.APPROVED, rating: 4.6, totalReviews: 31,
        categories: [categoryMap['plumbing-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380015', '380054', '380058'] }]
      },
      {
        firstName: 'Jignesh', lastName: 'Panchal', email: 'shreeji.paint@homeserve.tech', phone: '+91 9825200005',
        businessName: 'Shreeji Painting & Decorators', address: 'B-14 Trade Square, Science City Road, Ahmedabad',
        gstNumber: '24DDDPJ8823M1Z5', experience: 9, status: PROVIDER_STATUS.APPROVED, rating: 4.8, totalReviews: 29,
        categories: [categoryMap['painting-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380060', '382481', '380054'] }]
      },
      {
        firstName: 'Nilesh', lastName: 'Suthar', email: 'urban.woodcraft@homeserve.tech', phone: '+91 9825200006',
        businessName: 'Urban Woodcraft & Carpentry', address: '7 Heritage Arcade, Prahlad Nagar, Ahmedabad',
        gstNumber: '24EEENS3492Q1Z3', experience: 14, status: PROVIDER_STATUS.APPROVED, rating: 4.9, totalReviews: 44,
        categories: [categoryMap['carpentry-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380015', '380051', '380054'] }]
      },
      {
        firstName: 'Hasmukh', lastName: 'Prajapati', email: 'coolbreeze.ac@homeserve.tech', phone: '+91 9825200007',
        businessName: 'CoolBreeze AC Care', address: '104 Dev Complex, Bopal Cross Road, Ahmedabad',
        gstNumber: '24FFFHP6712L1Z1', experience: 7, status: PROVIDER_STATUS.APPROVED, rating: 4.7, totalReviews: 36,
        categories: [categoryMap['ac-repair-maintenance']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380058', '380054', '380015'] }]
      },
      {
        firstName: 'Dharmendra', lastName: 'Rathod', email: 'safehome.pest@homeserve.tech', phone: '+91 9825200008',
        businessName: 'SafeHome Pest Management', address: '52 Fortune Business Hub, Gota, Ahmedabad',
        gstNumber: '24GGGFR1190K1Z9', experience: 11, status: PROVIDER_STATUS.APPROVED, rating: 4.8, totalReviews: 41,
        categories: [categoryMap['pest-control']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['382481', '382424', '380060'] }]
      },
      {
        firstName: 'Bhavesh', lastName: 'Makwana', email: 'brightspark@homeserve.tech', phone: '+91 9825200009',
        businessName: 'BrightSpark Electrical Works', address: '15 Shree Arcade, Jawahar Chowk, Maninagar, Ahmedabad',
        gstNumber: '24HHHBM9945R1Z4', experience: 8, status: PROVIDER_STATUS.APPROVED, rating: 4.6, totalReviews: 27,
        categories: [categoryMap['electrical-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380008', '380007', '380027'] }]
      },
      {
        firstName: 'Geeta', lastName: 'Solanki', email: 'cleanpro.ahm@homeserve.tech', phone: '+91 9825200010',
        businessName: 'CleanPro Ahmedabad', address: '301 Shivalik Shilp, Iscon Cross Road, Ahmedabad',
        gstNumber: '24IIIAS2389P1Z2', experience: 5, status: PROVIDER_STATUS.APPROVED, rating: 4.5, totalReviews: 22,
        categories: [categoryMap['home-cleaning']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380015', '380054', '380058'] }]
      },

      // 3 Pending Providers
      {
        firstName: 'Mukesh', lastName: 'Thakor', email: 'reliable.ref@homeserve.tech', phone: '+91 9825200011',
        businessName: 'Reliable Refrigeration & AC', address: '8 Sun Complex, Chandkheda, Ahmedabad',
        gstNumber: '24JJJMT5521N1Z0', experience: 4, status: PROVIDER_STATUS.PENDING, rating: 0.0, totalReviews: 0,
        categories: [categoryMap['ac-repair-maintenance']._id, categoryMap['appliance-repair']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['382424'] }]
      },
      {
        firstName: 'Vijay', lastName: 'Rawal', email: 'maruti.plumbing@homeserve.tech', phone: '+91 9825200012',
        businessName: 'Maruti Plumbing & Drainage', address: '19 Sukan Mall, Science City, Ahmedabad',
        gstNumber: '24KKKVR7732T1ZY', experience: 3, status: PROVIDER_STATUS.PENDING, rating: 0.0, totalReviews: 0,
        categories: [categoryMap['plumbing-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380060'] }]
      },
      {
        firstName: 'Ketan', lastName: 'Chauhan', email: 'elite.pest@homeserve.tech', phone: '+91 9825200013',
        businessName: 'Elite Pest Eradication', address: '22 Ratna Business Square, Ashram Road, Ahmedabad',
        gstNumber: '24LLLKC8841W1ZX', experience: 5, status: PROVIDER_STATUS.PENDING, rating: 0.0, totalReviews: 0,
        categories: [categoryMap['pest-control']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['380006', '380009'] }]
      },

      // 2 Rejected Providers
      {
        firstName: 'Mohan', lastName: 'Lal', email: 'flybynight@homeserve.tech', phone: '+91 9825200014',
        businessName: 'FlyByNight Home Care', address: 'Temporary Stall 4, Sarkhej, Ahmedabad',
        gstNumber: '24MMMML0000X1ZZ', experience: 1, status: PROVIDER_STATUS.REJECTED, rating: 0.0, totalReviews: 0,
        categories: [categoryMap['electrical-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['382210'] }]
      },
      {
        firstName: 'Gopal', lastName: 'Sharma', email: 'unverified.repairs@homeserve.tech', phone: '+91 9825200015',
        businessName: 'Unverified Repairs & Fix', address: 'Shop 99, Odhav Ring Road, Ahmedabad',
        gstNumber: '24NNNGS9999Y1ZA', experience: 2, status: PROVIDER_STATUS.REJECTED, rating: 0.0, totalReviews: 0,
        categories: [categoryMap['plumbing-services']._id],
        serviceAreas: [{ city: 'Ahmedabad', pincodes: ['382415'] }]
      }
    ];

    const providerDocs = [];
    const approvedProviderDocs = [];

    for (let pIdx = 0; pIdx < rawProviders.length; pIdx++) {
      const pData = rawProviders[pIdx];
      const pUser = await User.create({
        firstName: pData.firstName,
        lastName: pData.lastName,
        email: pData.email,
        phone: pData.phone,
        password: 'ProviderPassword123!',
        role: ROLES.PROVIDER,
        avatar: `https://images.unsplash.com/photo-${1507003211169 + pIdx}?w=150&auto=format&fit=crop&q=80`,
        isActive: true,
        isEmailVerified: true
      });

      const pDoc = await Provider.create({
        user: pUser._id,
        businessName: pData.businessName,
        description: `Certified professional service provider in Ahmedabad specializing in quality residential and commercial maintenance with over ${pData.experience} years of domain excellence.`,
        categoryIds: pData.categories,
        serviceAreas: pData.serviceAreas,
        verificationStatus: pData.status,
        rating: pData.rating,
        totalReviews: pData.totalReviews,
        commissionRate: 15,
        completedJobsCount: pData.totalReviews * 2,
        bankDetails: {
          accountName: pData.businessName,
          accountNumber: `91827364500${pIdx}`,
          bankName: 'HDFC Bank Ltd',
          ifscCode: 'HDFC0001234'
        }
      });
      providerDocs.push(pDoc);

      if (pData.status === PROVIDER_STATUS.APPROVED) {
        approvedProviderDocs.push(pDoc);

        // Create 7-day working availability for approved providers
        for (let day = 0; day <= 6; day++) {
          await Availability.create({
            provider: pDoc._id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '19:00',
            slotDuration: 120,
            maxBookingsPerSlot: 2,
            isOffDay: day === 0 // Sunday off
          });
        }
      }
    }

    // 6. 25 Field Technicians
    console.log('[Seed] Creating 25 Field Technicians...');
    const rawTechs = [
      { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.tech@homeserve.tech', phone: '+91 9825300001', pIdx: 0, spec: 'HVAC & Electrical', exp: 6 },
      { firstName: 'Mahesh', lastName: 'Patel', email: 'mahesh.tech@homeserve.tech', phone: '+91 9825300002', pIdx: 0, spec: 'AC Installation & Wiring', exp: 5 },
      { firstName: 'Govind', lastName: 'Vaghela', email: 'govind.tech@homeserve.tech', phone: '+91 9825300003', pIdx: 0, spec: 'Distribution Boards & Regulators', exp: 8 },
      { firstName: 'Suresh', lastName: 'Chavda', email: 'suresh.clean@homeserve.tech', phone: '+91 9825300004', pIdx: 1, spec: 'Deep Cleaning & Sanitization', exp: 4 },
      { firstName: 'Rekha', lastName: 'Parmar', email: 'rekha.clean@homeserve.tech', phone: '+91 9825300005', pIdx: 1, spec: 'Kitchen & Bathroom Scrubbing', exp: 5 },
      { firstName: 'Dinesh', lastName: 'Bhil', email: 'dinesh.clean@homeserve.tech', phone: '+91 9825300006', pIdx: 1, spec: 'Sofa & Carpet Wet Extraction', exp: 3 },
      { firstName: 'Amit', lastName: 'Kulkarni', email: 'amit.tech@homeserve.tech', phone: '+91 9825300007', pIdx: 2, spec: 'Refrigerator & Washing Machine', exp: 7 },
      { firstName: 'Prakash', lastName: 'Joshi', email: 'prakash.tech@homeserve.tech', phone: '+91 9825300008', pIdx: 2, spec: 'Microwave & RO Water Purifier', exp: 6 },
      { firstName: 'Chetan', lastName: 'Pandya', email: 'chetan.tech@homeserve.tech', phone: '+91 9825300009', pIdx: 2, spec: 'Water Heaters & Chimneys', exp: 4 },
      { firstName: 'Naran', lastName: 'Solanki', email: 'naran.plumb@homeserve.tech', phone: '+91 9825300010', pIdx: 3, spec: 'Pipe Leakage & Sanitary Ware', exp: 9 },
      { firstName: 'Pravin', lastName: 'Thakur', email: 'pravin.plumb@homeserve.tech', phone: '+91 9825300011', pIdx: 3, spec: 'Bathroom Fittings & Drainage', exp: 6 },
      { firstName: 'Ashok', lastName: 'Dabhi', email: 'ashok.plumb@homeserve.tech', phone: '+91 9825300012', pIdx: 3, spec: 'Overhead Tanks & Pressure Pumps', exp: 8 },
      { firstName: 'Kailash', lastName: 'Prajapati', email: 'kailash.paint@homeserve.tech', phone: '+91 9825300013', pIdx: 4, spec: 'Wall Texture & Royal Luxury Emulsion', exp: 10 },
      { firstName: 'Vinod', lastName: 'Barot', email: 'vinod.paint@homeserve.tech', phone: '+91 9825300014', pIdx: 4, spec: 'Waterproofing & Exterior Coating', exp: 7 },
      { firstName: 'Devendra', lastName: 'Suthar', email: 'devendra.wood@homeserve.tech', phone: '+91 9825300015', pIdx: 5, spec: 'Modular Furniture & Hydraulic Hinges', exp: 11 },
      { firstName: 'Ramesh', lastName: 'Mistry', email: 'ramesh.wood@homeserve.tech', phone: '+91 9825300016', pIdx: 5, spec: 'Door Locks & Wood Restoration', exp: 8 },
      { firstName: 'Pranav', lastName: 'Nair', email: 'pranav.ac@homeserve.tech', phone: '+91 9825300017', pIdx: 6, spec: 'Split & Inverter AC Specialist', exp: 5 },
      { firstName: 'Jayesh', lastName: 'Gadhavi', email: 'jayesh.ac@homeserve.tech', phone: '+91 9825300018', pIdx: 6, spec: 'Refrigerant Gas Refill & Compressor', exp: 7 },
      { firstName: 'Manish', lastName: 'Zala', email: 'manish.pest@homeserve.tech', phone: '+91 9825300019', pIdx: 7, spec: 'Herbal Cockroach Gel & Bed Bug Fog', exp: 6 },
      { firstName: 'Kirit', lastName: 'Makwana', email: 'kirit.pest@homeserve.tech', phone: '+91 9825300020', pIdx: 7, spec: 'Termite Drilling & Anti-Fumigation', exp: 9 },
      { firstName: 'Haresh', lastName: 'Darji', email: 'haresh.elec@homeserve.tech', phone: '+91 9825300021', pIdx: 8, spec: 'Ceiling Fan & Chandelier Mount', exp: 4 },
      { firstName: 'Shailesh', lastName: 'Gohil', email: 'shailesh.elec@homeserve.tech', phone: '+91 9825300022', pIdx: 8, spec: 'Short Circuit Diagnostic & Wiring', exp: 8 },
      { firstName: 'Alpa', lastName: 'Vaghela', email: 'alpa.clean@homeserve.tech', phone: '+91 9825300023', pIdx: 9, spec: 'Villa & Duplex Deep Clean', exp: 5 },
      { firstName: 'Sanjay', lastName: 'Vankar', email: 'sanjay.clean@homeserve.tech', phone: '+91 9825300024', pIdx: 9, spec: 'Floor Buffing & Window Polish', exp: 6 },
      { firstName: 'Pooja', lastName: 'Rathod', email: 'pooja.clean@homeserve.tech', phone: '+91 9825300025', pIdx: 9, spec: 'Move-In Move-Out Disinfection', exp: 4 }
    ];

    const techDocs = [];
    for (let tIdx = 0; tIdx < rawTechs.length; tIdx++) {
      const tData = rawTechs[tIdx];
      const assignedProv = approvedProviderDocs[tData.pIdx % approvedProviderDocs.length];

      const tUser = await User.create({
        firstName: tData.firstName,
        lastName: tData.lastName,
        email: tData.email,
        phone: tData.phone,
        password: 'TechPassword123!',
        role: ROLES.TECHNICIAN,
        avatar: `https://images.unsplash.com/photo-${1519085360753 + tIdx}?w=150&auto=format&fit=crop&q=80`,
        isActive: true,
        isEmailVerified: true
      });

      const tDoc = await Technician.create({
        user: tUser._id,
        provider: assignedProv._id,
        specialization: [tData.spec],
        experienceYears: tData.exp,
        isAvailable: true,
        rating: 4.8,
        completedJobsCount: 20 + (tIdx * 3)
      });
      techDocs.push(tDoc);
    }

    // 7. 40 Service Listings (At least 5 per category with exact requested prices)
    console.log('[Seed] Creating 40 Service Listings with Exact INR Pricing...');
    const rawServices = [
      // Electrical Services
      { title: 'Fan Installation', catSlug: 'electrical-services', price: 299, dur: 45, pIdx: 0, img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800' },
      { title: 'Switchboard Repair', catSlug: 'electrical-services', price: 199, dur: 30, pIdx: 8, img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800' },
      { title: 'Wiring Repair', catSlug: 'electrical-services', price: 499, dur: 60, pIdx: 0, img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800' },
      { title: 'Light Installation', catSlug: 'electrical-services', price: 249, dur: 30, pIdx: 8, img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800' },
      { title: 'Inverter Repair', catSlug: 'electrical-services', price: 599, dur: 60, pIdx: 0, img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800' },

      // Plumbing Services
      { title: 'Tap Repair', catSlug: 'plumbing-services', price: 199, dur: 30, pIdx: 3, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800' },
      { title: 'Pipe Leakage', catSlug: 'plumbing-services', price: 399, dur: 60, pIdx: 3, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800' },
      { title: 'Bathroom Fitting', catSlug: 'plumbing-services', price: 799, dur: 90, pIdx: 3, img: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800' },
      { title: 'Drain Cleaning', catSlug: 'plumbing-services', price: 499, dur: 60, pIdx: 3, img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800' },
      { title: 'Water Tank Repair', catSlug: 'plumbing-services', price: 699, dur: 90, pIdx: 3, img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800' },

      // AC Services
      { title: 'AC General Service', catSlug: 'ac-repair-maintenance', price: 599, dur: 60, pIdx: 6, img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800' },
      { title: 'AC Installation', catSlug: 'ac-repair-maintenance', price: 1499, dur: 120, pIdx: 0, img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800' },
      { title: 'Gas Refill', catSlug: 'ac-repair-maintenance', price: 1999, dur: 90, pIdx: 6, img: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800' },
      { title: 'AC Repair', catSlug: 'ac-repair-maintenance', price: 499, dur: 60, pIdx: 6, img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800' },
      { title: 'AC Uninstallation', catSlug: 'ac-repair-maintenance', price: 799, dur: 60, pIdx: 0, img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800' },

      // Home Cleaning
      { title: 'Full Home Deep Cleaning', catSlug: 'home-cleaning', price: 2499, dur: 240, pIdx: 1, img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800' },
      { title: 'Bathroom Deep Cleaning', catSlug: 'home-cleaning', price: 499, dur: 60, pIdx: 9, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800' },
      { title: 'Kitchen Deep Cleaning', catSlug: 'home-cleaning', price: 899, dur: 120, pIdx: 1, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800' },
      { title: 'Sofa & Upholstery Cleaning', catSlug: 'home-cleaning', price: 699, dur: 90, pIdx: 9, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800' },
      { title: 'Balcony Cleaning', catSlug: 'home-cleaning', price: 349, dur: 45, pIdx: 1, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' },

      // Painting Services
      { title: 'Full Home Painting', catSlug: 'painting-services', price: 8999, dur: 720, pIdx: 4, img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800' },
      { title: 'Single Room Painting', catSlug: 'painting-services', price: 1999, dur: 180, pIdx: 4, img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800' },
      { title: 'Waterproofing Treatment', catSlug: 'painting-services', price: 2499, dur: 240, pIdx: 4, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800' },
      { title: 'Wall Texture Painting', catSlug: 'painting-services', price: 1499, dur: 120, pIdx: 4, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800' },
      { title: 'Door & Window Polishing', catSlug: 'painting-services', price: 899, dur: 90, pIdx: 4, img: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800' },

      // Carpentry Services
      { title: 'Door Lock Repair & Replacement', catSlug: 'carpentry-services', price: 299, dur: 45, pIdx: 5, img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800' },
      { title: 'Furniture Assembly', catSlug: 'carpentry-services', price: 499, dur: 60, pIdx: 5, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
      { title: 'Cupboard Hinge Repair', catSlug: 'carpentry-services', price: 249, dur: 30, pIdx: 5, img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800' },
      { title: 'Wooden Partition Installation', catSlug: 'carpentry-services', price: 1999, dur: 180, pIdx: 5, img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800' },
      { title: 'Bed Repair & Slat Replacement', catSlug: 'carpentry-services', price: 599, dur: 60, pIdx: 5, img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800' },

      // Appliance Repair
      { title: 'Refrigerator Repair', catSlug: 'appliance-repair', price: 499, dur: 60, pIdx: 2, img: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800' },
      { title: 'Washing Machine Repair', catSlug: 'appliance-repair', price: 549, dur: 60, pIdx: 2, img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800' },
      { title: 'Microwave Oven Repair', catSlug: 'appliance-repair', price: 399, dur: 45, pIdx: 2, img: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800' },
      { title: 'Water Purifier / RO Service', catSlug: 'appliance-repair', price: 449, dur: 45, pIdx: 2, img: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=800' },
      { title: 'Geyser / Water Heater Repair', catSlug: 'appliance-repair', price: 399, dur: 45, pIdx: 2, img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800' },

      // Pest Control
      { title: 'Cockroach Control', catSlug: 'pest-control', price: 699, dur: 45, pIdx: 7, img: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800' },
      { title: 'Termite Treatment', catSlug: 'pest-control', price: 1899, dur: 120, pIdx: 7, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' },
      { title: 'Bed Bug Control', catSlug: 'pest-control', price: 1199, dur: 90, pIdx: 1, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800' },
      { title: 'Mosquito Fogging', catSlug: 'pest-control', price: 799, dur: 45, pIdx: 7, img: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800' },
      { title: 'Rodent Control', catSlug: 'pest-control', price: 899, dur: 60, pIdx: 7, img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800' }
    ];

    const serviceDocs = [];
    for (let sIdx = 0; sIdx < rawServices.length; sIdx++) {
      const s = rawServices[sIdx];
      const prov = approvedProviderDocs[s.pIdx % approvedProviderDocs.length];
      const cat = categoryMap[s.catSlug];
      const slug = `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${(100 + sIdx)}`;

      const sDoc = await Service.create({
        provider: prov._id,
        category: cat._id,
        title: s.title,
        slug,
        description: `Professional doorstep ${s.title} in Ahmedabad by verified technicians. Transparent pricing, safety gear compliance, and guaranteed post-service warranty.`,
        price: s.price,
        discountPrice: s.price > 400 ? s.price - 50 : 0,
        durationMinutes: s.dur,
        coverImage: s.img,
        includedFeatures: ['Doorstep inspection', 'Certified tools & equipment', 'Safety gear compliance', 'Post-service cleanup'],
        excludedFeatures: ['Consumables & extra spare parts (billed at MRP)', 'Major structural civil modifications'],
        isActive: true,
        rating: 4.8,
        totalBookings: 15 + sIdx
      });
      serviceDocs.push(sDoc);
    }

    // 8. 5 Promotional Coupons
    console.log('[Seed] Creating 5 Promotional Coupons...');
    const rawCoupons = [
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 299, maxDiscountAmount: 100, usageLimit: 500, days: 90 },
      { code: 'HOME20', discountType: 'percentage', discountValue: 20, minOrderAmount: 599, maxDiscountAmount: 250, usageLimit: 200, days: 60 },
      { code: 'FIRST100', discountType: 'flat', discountValue: 100, minOrderAmount: 399, maxDiscountAmount: 100, usageLimit: 300, days: 45 },
      { code: 'CLEAN15', discountType: 'percentage', discountValue: 15, minOrderAmount: 499, maxDiscountAmount: 300, usageLimit: 150, days: 30 },
      { code: 'FESTIVE25', discountType: 'percentage', discountValue: 25, minOrderAmount: 999, maxDiscountAmount: 500, usageLimit: 100, days: 30 }
    ];

    for (const c of rawCoupons) {
      await Coupon.create({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        maxDiscountAmount: c.maxDiscountAmount,
        usageLimit: c.usageLimit,
        usedCount: 12,
        validTill: new Date(Date.now() + c.days * 86400000),
        isActive: true
      });
    }

    // 9. 100+ Bookings across Past 3 Months and Next 30 Days
    console.log('[Seed] Generating 105 Realistic Bookings across Ahmedabad...');
    const timeSlots = ['09:00 - 11:00', '11:00 - 13:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00'];
    const bookingStatusSequence = [
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.IN_PROGRESS,
      BOOKING_STATUS.ON_THE_WAY,
      BOOKING_STATUS.ARRIVED,
      BOOKING_STATUS.TECHNICIAN_ASSIGNED,
      BOOKING_STATUS.ACCEPTED,
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CANCELLED
    ];

    const bookingDocs = [];
    const completedBookingDocs = [];
    const now = new Date();

    for (let b = 1; b <= 105; b++) {
      const custUser = customerUserDocs[b % customerUserDocs.length];
      const srv = serviceDocs[b % serviceDocs.length];
      const prov = approvedProviderDocs[b % approvedProviderDocs.length];
      const addr = addressDocs[b % addressDocs.length];
      const status = bookingStatusSequence[b % bookingStatusSequence.length];

      // Match tech to this provider
      const matchingTechs = techDocs.filter(t => t.provider.toString() === prov._id.toString());
      const tech = matchingTechs.length > 0 ? matchingTechs[b % matchingTechs.length] : techDocs[0];

      let bookingDate;
      if (status === BOOKING_STATUS.COMPLETED || status === BOOKING_STATUS.CANCELLED) {
        // Past date (1 to 85 days ago)
        const pastDays = (b % 85) + 1;
        bookingDate = new Date(now.getTime() - pastDays * 86400000).toISOString().slice(0, 10);
      } else if ([BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.ARRIVED, BOOKING_STATUS.ON_THE_WAY].includes(status)) {
        // Today
        bookingDate = now.toISOString().slice(0, 10);
      } else {
        // Future date (1 to 28 days ahead)
        const futureDays = (b % 28) + 1;
        bookingDate = new Date(now.getTime() + futureDays * 86400000).toISOString().slice(0, 10);
      }

      const slot = timeSlots[b % timeSlots.length];
      const basePrice = srv.discountPrice > 0 ? srv.discountPrice : srv.price;
      const discount = b % 4 === 0 ? 50 : 0;
      const platformFee = 49;
      const totalAmount = Math.max(0, basePrice - discount + platformFee);

      const refNumber = `HSB-${bookingDate.replace(/-/g, '')}-${String(b).padStart(4, '0')}`;

      const bookingDoc = await Booking.create({
        bookingReference: refNumber,
        customer: custUser._id,
        provider: prov._id,
        technician: [BOOKING_STATUS.PENDING, BOOKING_STATUS.REJECTED].includes(status) ? null : tech._id,
        service: srv._id,
        bookingDate,
        timeSlot: slot,
        serviceAddress: {
          streetAddress: addr.streetAddress,
          landmark: addr.landmark,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          contactPhone: custUser.phone,
          type: addr.type
        },
        problemDescription: `Customer requested expert doorstep ${srv.title} service at ${addr.area}, Ahmedabad.`,
        status,
        statusHistory: [
          { status: BOOKING_STATUS.PENDING, timestamp: new Date(now.getTime() - 86400000), remarks: 'Booking placed by customer' },
          ...(status !== BOOKING_STATUS.PENDING ? [{ status: BOOKING_STATUS.ACCEPTED, timestamp: new Date(now.getTime() - 72000000), remarks: 'Confirmed by provider' }] : []),
          ...([BOOKING_STATUS.TECHNICIAN_ASSIGNED, BOOKING_STATUS.ON_THE_WAY, BOOKING_STATUS.ARRIVED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETED].includes(status) ? [{ status: BOOKING_STATUS.TECHNICIAN_ASSIGNED, timestamp: new Date(now.getTime() - 54000000), remarks: 'Technician dispatched' }] : []),
          ...(status === BOOKING_STATUS.COMPLETED ? [{ status: BOOKING_STATUS.COMPLETED, timestamp: new Date(now.getTime() - 10000000), remarks: 'Work completed successfully' }] : [])
        ],
        pricing: {
          basePrice,
          discount,
          couponCode: discount > 0 ? 'HOME20' : '',
          platformFee,
          tax: 0,
          totalAmount
        },
        paymentStatus: status === BOOKING_STATUS.COMPLETED ? PAYMENT_STATUS.PAID : (status === BOOKING_STATUS.CANCELLED ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PENDING),
        paymentMethod: b % 2 === 0 ? PAYMENT_METHODS.RAZORPAY : PAYMENT_METHODS.CASH_ON_DELIVERY,
        completedAt: status === BOOKING_STATUS.COMPLETED ? new Date(now.getTime() - 10000000) : null
      });

      bookingDocs.push(bookingDoc);
      if (status === BOOKING_STATUS.COMPLETED) {
        completedBookingDocs.push(bookingDoc);
      }

      // Payments, Transactions, and Commission
      if (bookingDoc.paymentStatus === PAYMENT_STATUS.PAID) {
        const pmt = await Payment.create({
          booking: bookingDoc._id,
          user: custUser._id,
          amount: totalAmount,
          currency: 'INR',
          razorpayOrderId: `order_seed_${b}`,
          razorpayPaymentId: `TEST_TXN_${Date.now()}_${b}`,
          razorpaySignature: `sig_seed_${b}`,
          status: 'captured'
        });

        await Transaction.create({
          payment: pmt._id,
          booking: bookingDoc._id,
          type: 'payment',
          amount: totalAmount,
          status: 'success',
          referenceId: pmt.razorpayPaymentId
        });

        // 15% platform commission
        const commRate = prov.commissionRate || 15;
        const platformComm = Math.round((totalAmount * commRate) / 100);
        const providerPayout = totalAmount - platformComm;

        await Commission.create({
          booking: bookingDoc._id,
          provider: prov._id,
          totalBookingAmount: totalAmount,
          commissionPercentage: commRate,
          platformCommissionAmount: platformComm,
          providerPayoutAmount: providerPayout,
          payoutStatus: 'settled',
          settledAt: new Date()
        });
      }
    }

    // 10. 40 Reviews on Completed Bookings
    console.log('[Seed] Creating 40 Customer Reviews for Completed Bookings...');
    const feedbackSamples = [
      { rating: 5, comment: 'Outstanding service! The technician arrived exactly on time in Satellite and solved the problem in 20 minutes.' },
      { rating: 5, comment: 'Very professional and polite. Used genuine spare parts and cleaned up the site afterward.' },
      { rating: 4, comment: 'Good diagnostic skills. AC cooling has restored back to ice-cold. Fair pricing.' },
      { rating: 5, comment: 'Excellent pipe leakage repair in Vastrapur. Fixed concealed wall joints without damaging tiles.' },
      { rating: 4, comment: 'Great job with modular kitchen cleaning. Highly recommended for busy homeowners in Ahmedabad.' },
      { rating: 5, comment: 'Punctual, verified professional. Showed his HomeServe ID badge before entering.' },
      { rating: 3, comment: 'Service quality was good, but technician arrived 25 minutes late due to SG Highway traffic.' },
      { rating: 5, comment: 'Best home services experience! Booking on app was super fast, and the invoice was generated instantly.' }
    ];

    for (let r = 0; r < Math.min(40, completedBookingDocs.length); r++) {
      const bDoc = completedBookingDocs[r];
      const feed = feedbackSamples[r % feedbackSamples.length];

      await Review.create({
        booking: bDoc._id,
        customer: bDoc.customer,
        provider: bDoc.provider,
        service: bDoc.service,
        rating: feed.rating,
        comment: feed.comment,
        isPublished: true,
        replyFromProvider: r % 3 === 0 ? 'Thank you so much for choosing us! Glad to serve you.' : ''
      });
    }

    // 11. 15 Support Complaints
    console.log('[Seed] Creating 15 Customer Support Complaints...');
    const complaintScenarios = [
      { subj: 'Technician Delay in Arrival', desc: 'Technician was delayed by 45 minutes beyond the scheduled slot without prior update.', prio: 'medium', stat: 'resolved' },
      { subj: 'Billing Invoice Discrepancy', desc: 'Promotional discount of ₹50 was not reflected on the initial estimate sheet.', prio: 'high', stat: 'resolved' },
      { subj: 'Slight Water Seepage Recurred', desc: 'Small drop seepage noticed near washbasin drain pipe 3 days after repair.', prio: 'high', stat: 'under_investigation' },
      { subj: 'Uncollected Trash Debris', desc: 'Old packaging boxes were left in the corridor outside the apartment.', prio: 'low', stat: 'open' },
      { subj: 'Slot Reschedule Coordination', desc: 'Requested an afternoon slot reschedule but provider called in morning.', prio: 'medium', stat: 'resolved' }
    ];

    for (let c = 0; c < 15; c++) {
      const bDoc = bookingDocs[c * 6];
      const scen = complaintScenarios[c % complaintScenarios.length];

      await Complaint.create({
        booking: bDoc._id,
        raisedBy: bDoc.customer,
        provider: bDoc.provider,
        subject: scen.subj,
        description: scen.desc,
        priority: scen.prio,
        status: scen.stat,
        adminResolutionRemarks: scen.stat === 'resolved' ? 'Investigated by support supervisor and resolved with customer satisfaction.' : 'Customer care team investigating with field manager.'
      });
    }

    // 12. Multi-Role Notifications
    console.log('[Seed] Generating In-App System Notifications...');
    for (const prov of approvedProviderDocs) {
      await Notification.create({
        recipient: prov.user,
        title: 'New Service Booking Request',
        message: 'You have new service booking requests awaiting dispatch in Ahmedabad.',
        type: 'booking_update'
      });
    }

    console.log(`\n======================================================`);
    console.log(`  HOMESERVE TECHNOLOGIES DATABASE SEEDED (AHMEDABAD)   `);
    console.log(`======================================================`);
    console.log(`  Super Admin Accounts:      2 (admin@homeserve.com, admin@homeserve.tech)`);
    console.log(`  Customers:                ${customerUserDocs.length} (Ahmedabad Residents)`);
    console.log(`  Ahmedabad Addresses:      ${addressDocs.length} (Navrangpura, Satellite, Vastrapur, Bopal, etc.)`);
    console.log(`  Service Providers:        ${providerDocs.length} (10 Approved, 3 Pending, 2 Rejected)`);
    console.log(`  Field Technicians:        ${techDocs.length} (Certified Ahmedabad Specialists)`);
    console.log(`  Service Categories:       ${Object.keys(categoryMap).length} (Electrical, Plumbing, AC, Cleaning, etc.)`);
    console.log(`  Service Listings:         ${serviceDocs.length} (Exact INR Catalog Pricing)`);
    console.log(`  Bookings Generated:       ${bookingDocs.length} (Past 90 Days to Next 30 Days)`);
    console.log(`  Verified Reviews:         40`);
    console.log(`  Support Complaints:       15`);
    console.log(`  Promotional Coupons:       5 (WELCOME10, HOME20, FIRST100, CLEAN15, FESTIVE25)`);
    console.log(`======================================================`);
    console.log(`  Credentials for Testing:`);
    console.log(`  Super Admin:  admin@homeserve.com             / Admin@12345`);
    console.log(`  Customer:     rahul@gmail.com                 / CustomerPassword123!`);
    console.log(`  Customer:     priya@gmail.com                 / CustomerPassword123!`);
    console.log(`  Customer:     john.doe@gmail.com              / CustomerPassword123!`);
    console.log(`  Provider:     apex.homes@homeserve.tech       / ProviderPassword123!`);
    console.log(`  Provider:     sparkle.clean@homeserve.tech    / ProviderPassword123!`);
    console.log(`  Technician:   rahul.tech@homeserve.tech       / TechPassword123!`);
    console.log(`======================================================\n`);

    if (require.main === module) {
      await disconnectDB();
      console.log('[Seed] Database disconnected cleanly.');
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
