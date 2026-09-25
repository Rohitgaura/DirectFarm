const bcrypt = require('bcryptjs');
const { sequelize, User, Farmer, Buyer, Product, Negotiation, Notification, SuccessStory, Location } = require('../models');

async function seedDatabase() {
  console.log('🌱 Seeding PostgreSQL Database with Extensive Crop Data for Farmer Ramesh...');

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // 1. Create Admin User
    let adminUser = await User.findOne({ where: { email: 'admin@directfarm.com' } });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@directfarm.com',
        password: 'admin123',
        phone: '9999999999',
        role: 'admin',
        address: 'DirectFarm HQ, New Delhi'
      });
      console.log('✅ Admin user created: admin@directfarm.com / admin123');
    }

    // 2. Create Farmer User & Profile (Ramesh Kumar)
    let farmerUser = await User.findOne({ where: { email: 'ramesh.farmer@example.com' } });
    if (!farmerUser) {
      farmerUser = await User.create({
        name: 'Ramesh Kumar',
        email: 'ramesh.farmer@example.com',
        password: 'farmer123',
        phone: '9876543210',
        role: 'farmer',
        experienceYears: 12,
        address: 'Village Kheri, Karnal, Haryana',
        location: {
          type: 'Point',
          coordinates: [76.9897, 29.6857],
          village: 'Kheri',
          district: 'Karnal',
          state: 'Haryana',
          formattedAddress: 'Karnal, Haryana, India'
        }
      });
      console.log('✅ Farmer user created: ramesh.farmer@example.com / farmer123');
    }

    // 3. Create Multiple Buyer Users & Profiles
    const buyersData = [
      {
        name: 'Priya Sharma',
        email: 'priya.buyer@example.com',
        password: 'buyer123',
        phone: '9123456789',
        address: 'Sector 14, Gurugram, Haryana',
        location: { village: 'Sector 14', district: 'Gurugram', state: 'Haryana' }
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.buyer@example.com',
        password: 'buyer123',
        phone: '9811223344',
        address: 'Azadpur Mandi, Delhi Wholesale Market',
        location: { village: 'Azadpur', district: 'North Delhi', state: 'Delhi' }
      },
      {
        name: 'Ananya Patel',
        email: 'ananya.buyer@example.com',
        password: 'buyer123',
        phone: '9871122334',
        address: 'Sector 62, Noida, Uttar Pradesh',
        location: { village: 'Sector 62', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh' }
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.buyer@example.com',
        password: 'buyer123',
        phone: '9765432109',
        address: 'Sector 17, Chandigarh',
        location: { village: 'Sector 17', district: 'Chandigarh', state: 'Punjab' }
      },
      {
        name: 'Kavita Reddy',
        email: 'kavita.buyer@example.com',
        password: 'buyer123',
        phone: '9988776655',
        address: 'MI Road, Jaipur, Rajasthan',
        location: { village: 'MI Road', district: 'Jaipur', state: 'Rajasthan' }
      }
    ];

    const createdBuyers = [];
    for (const bData of buyersData) {
      let bUser = await User.findOne({ where: { email: bData.email } });
      if (!bUser) {
        bUser = await User.create({
          name: bData.name,
          email: bData.email,
          password: bData.password,
          phone: bData.phone,
          role: 'buyer',
          address: bData.address,
          location: bData.location
        });

        await Buyer.create({
          userId: bUser.id,
          name: bData.name,
          email: bData.email,
          phone: bData.phone,
          address: bData.address,
          verificationStatus: true,
          location: bData.location,
          totalOrders: Math.floor(Math.random() * 8) + 2,
          totalSpent: Math.floor(Math.random() * 10000) + 3000
        });
        console.log(`✅ Buyer user created: ${bData.email}`);
      }
      createdBuyers.push(bUser);
    }

    // 4. Clean & Seed 10 Realistic Crops for Farmer Ramesh
    await Negotiation.destroy({ where: { farmerId: farmerUser.id } });
    await Notification.destroy({ where: { recipientId: farmerUser.id } });
    await Product.destroy({ where: { farmerId: farmerUser.id } });

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const sampleProducts = [
      {
        farmerId: farmerUser.id,
        name: 'Fresh Organic Tomatoes',
        category: 'Vegetables',
        quantity: 250,
        pricePerKg: 35,
        harvestingDate: new Date(now - 1 * oneDay),
        createdAt: new Date(now - 2 * 60 * 60 * 1000), // Uploaded Today (2 hrs ago)
        description: 'Naturally ripened, pesticide-free juicy organic tomatoes directly harvested from Karnal farm.',
        images: [
          { url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop', public_id: 'tomato_1' },
          { url: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=800&auto=format&fit=crop', public_id: 'tomato_2' },
          { url: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=800&auto=format&fit=crop', public_id: 'tomato_3' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Crisp Green Bell Peppers (Capsicum)',
        category: 'Vegetables',
        quantity: 180,
        pricePerKg: 65,
        harvestingDate: new Date(now - 1 * oneDay),
        createdAt: new Date(now - 4 * 60 * 60 * 1000), // Uploaded Today (4 hrs ago)
        description: 'Fresh, crunchy greenhouse-grown green capsicums with vibrant color and thick flesh.',
        images: [
          { url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop', public_id: 'capsicum_1' },
          { url: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=800&auto=format&fit=crop', public_id: 'capsicum_2' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Farm Fresh Green Cauliflower',
        category: 'Vegetables',
        quantity: 220,
        pricePerKg: 30,
        harvestingDate: new Date(now - 1 * oneDay),
        createdAt: new Date(now - 1 * 60 * 60 * 1000), // Uploaded Today (1 hr ago)
        description: 'Tender, compact white-headed cauliflower harvested at peak crispness.',
        images: [
          { url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop', public_id: 'cauli_1' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Crisp Shimla Royal Apples',
        category: 'Fruits',
        quantity: 350,
        pricePerKg: 130,
        harvestingDate: new Date(now - 2 * oneDay),
        createdAt: new Date(now - 5 * 60 * 60 * 1000), // Uploaded Today (5 hrs ago)
        description: 'Crunchy, sweet Grade-A orchard fresh apples delivered straight to market.',
        images: [
          { url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop', public_id: 'apple_1' },
          { url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800&auto=format&fit=crop', public_id: 'apple_2' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Farm Fresh Hybrid Potatoes',
        category: 'Vegetables',
        quantity: 600,
        pricePerKg: 22,
        harvestingDate: new Date(now - 2 * oneDay),
        createdAt: new Date(now - 1 * oneDay - 2 * 60 * 60 * 1000), // Uploaded Yesterday
        description: 'High-yield Grade-A new crop organic potatoes, ideal for wholesale traders and bulk grocery.',
        images: [
          { url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop', public_id: 'potato_1' },
          { url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop', public_id: 'potato_2' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Red Nashik Onions',
        category: 'Vegetables',
        quantity: 500,
        pricePerKg: 28,
        harvestingDate: new Date(now - 3 * oneDay),
        createdAt: new Date(now - 1 * oneDay - 4 * 60 * 60 * 1000), // Uploaded Yesterday
        description: 'Premium quality sun-dried medium-large red onions with long storage shelf life.',
        images: [
          { url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop', public_id: 'onion_1' },
          { url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop', public_id: 'onion_2' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Sweet Crunchy Orange Carrots',
        category: 'Vegetables',
        quantity: 350,
        pricePerKg: 32,
        harvestingDate: new Date(now - 3 * oneDay),
        createdAt: new Date(now - 1 * oneDay - 6 * 60 * 60 * 1000), // Uploaded Yesterday
        description: 'Juicy, naturally sweet soil-grown orange carrots packed with nutrients.',
        images: [
          { url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop', public_id: 'carrot_1' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Organic Traditional Basmati Rice (1121)',
        category: 'Grains',
        quantity: 1200,
        pricePerKg: 85,
        harvestingDate: new Date(now - 15 * oneDay),
        createdAt: new Date(now - 4 * oneDay), // Uploaded Earlier (4 days ago)
        description: 'Aromatic, aged traditional long-grain 1121 Basmati Rice direct from field.',
        images: [
          { url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop', public_id: 'rice_1' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Golden Sharbati Wheat',
        category: 'Grains',
        quantity: 1500,
        pricePerKg: 38,
        harvestingDate: new Date(now - 20 * oneDay),
        createdAt: new Date(now - 6 * oneDay), // Uploaded Earlier (6 days ago)
        description: 'Heavy, lustrous golden Sharbati wheat grains ideal for soft and fluffy rotis.',
        images: [
          { url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop', public_id: 'wheat_1' }
        ],
        location: farmerUser.location
      },
      {
        farmerId: farmerUser.id,
        name: 'Organic Unpolished Yellow Moong Dal',
        category: 'Pulses',
        quantity: 400,
        pricePerKg: 110,
        harvestingDate: new Date(now - 10 * oneDay),
        createdAt: new Date(now - 8 * oneDay), // Uploaded Earlier (8 days ago)
        description: 'Chemical-free unpolished whole yellow moong dal rich in natural plant protein.',
        images: [
          { url: 'https://images.unsplash.com/photo-1585996656797-27b992160d5b?w=800&auto=format&fit=crop', public_id: 'moong_1' }
        ],
        location: farmerUser.location
      }
    ];

    const createdProducts = [];
    for (const prod of sampleProducts) {
      const created = await Product.create(prod);
      createdProducts.push(created);
    }
    console.log(`✅ Seeded ${createdProducts.length} diverse crop listings for Ramesh.`);

    // Update Farmer profile product count
    let farmerProfile = await Farmer.findOne({ where: { userId: farmerUser.id } });
    if (farmerProfile) {
      farmerProfile.totalProducts = createdProducts.length;
      await farmerProfile.save();
    } else {
      await Farmer.create({
        userId: farmerUser.id,
        name: 'Ramesh Kumar',
        email: 'ramesh.farmer@example.com',
        phone: '9876543210',
        farmName: 'Green Valley Organic Farms',
        experienceYears: 12,
        verificationStatus: true,
        address: 'Village Kheri, Karnal, Haryana',
        location: farmerUser.location,
        averageRating: 4.8,
        totalRatings: 24,
        totalProducts: createdProducts.length
      });
    }

    // 5. Seed Realistic Bids & Notifications on Ramesh's Crops
    const tomatoProduct = createdProducts[0];
    const potatoProduct = createdProducts[1];
    const capsicumProduct = createdProducts[2];
    const onionProduct = createdProducts[3];

    const dummyBids = [
      // Bids on Tomatoes
      {
        buyerId: createdBuyers[1].id, // Vikram Singh
        farmerId: farmerUser.id,
        productId: tomatoProduct.id,
        offeredPrice: 38.00,
        quantity: 100,
        status: 'pending',
        createdAt: new Date(now - 15 * 60 * 1000)
      },
      {
        buyerId: createdBuyers[2].id, // Ananya Patel
        farmerId: farmerUser.id,
        productId: tomatoProduct.id,
        offeredPrice: 36.50,
        quantity: 80,
        status: 'pending',
        createdAt: new Date(now - 45 * 60 * 1000)
      },
      {
        buyerId: createdBuyers[0].id, // Priya Sharma
        farmerId: farmerUser.id,
        productId: tomatoProduct.id,
        offeredPrice: 32.00,
        quantity: 50,
        status: 'pending',
        createdAt: new Date(now - 2 * 60 * 60 * 1000)
      },
      {
        buyerId: createdBuyers[3].id, // Rahul Verma
        farmerId: farmerUser.id,
        productId: tomatoProduct.id,
        offeredPrice: 29.00,
        quantity: 120,
        counterOfferPrice: 33.00,
        status: 'counter_offer',
        createdAt: new Date(now - 5 * 60 * 60 * 1000)
      },
      {
        buyerId: createdBuyers[4].id, // Kavita Reddy
        farmerId: farmerUser.id,
        productId: tomatoProduct.id,
        offeredPrice: 35.00,
        quantity: 40,
        status: 'accepted',
        createdAt: new Date(now - 24 * 60 * 60 * 1000)
      },

      // Bids on Potatoes
      {
        buyerId: createdBuyers[2].id, // Ananya Patel
        farmerId: farmerUser.id,
        productId: potatoProduct.id,
        offeredPrice: 24.00,
        quantity: 200,
        status: 'pending',
        createdAt: new Date(now - 10 * 60 * 1000)
      },
      {
        buyerId: createdBuyers[1].id, // Vikram Singh
        farmerId: farmerUser.id,
        productId: potatoProduct.id,
        offeredPrice: 20.00,
        quantity: 300,
        status: 'pending',
        createdAt: new Date(now - 35 * 60 * 1000)
      },

      // Bids on Capsicum
      {
        buyerId: createdBuyers[4].id, // Kavita Reddy
        farmerId: farmerUser.id,
        productId: capsicumProduct.id,
        offeredPrice: 70.00,
        quantity: 50,
        status: 'pending',
        createdAt: new Date(now - 20 * 60 * 1000)
      },

      // Bids on Onions
      {
        buyerId: createdBuyers[0].id, // Priya Sharma
        farmerId: farmerUser.id,
        productId: onionProduct.id,
        offeredPrice: 30.00,
        quantity: 150,
        status: 'pending',
        createdAt: new Date(now - 50 * 60 * 1000)
      }
    ];

    for (const b of dummyBids) {
      const createdNeg = await Negotiation.create(b);
      const targetProduct = createdProducts.find(p => p.id === b.productId) || createdProducts[0];
      const buyerObj = createdBuyers.find(by => by.id === b.buyerId);

      await Notification.create({
        recipientId: farmerUser.id,
        type: 'negotiation',
        message: `New bid received for ${targetProduct.name}: ${b.quantity}kg at ₹${b.offeredPrice}/kg from ${buyerObj ? buyerObj.name : 'a buyer'}`,
        read: false,
        relatedId: createdNeg.id,
        metadata: {
          negotiationId: createdNeg.id,
          productId: targetProduct.id,
          productName: targetProduct.name,
          buyerId: b.buyerId,
          buyerName: buyerObj ? buyerObj.name : 'Buyer',
          quantity: b.quantity,
          offeredPrice: b.offeredPrice
        },
        createdAt: b.createdAt
      });
    }

    console.log(`✅ Seeded ${dummyBids.length} dummy bids & notifications for farmer crops.`);

    // 6. Create Success Story
    const storiesCount = await SuccessStory.count();
    if (storiesCount === 0 && farmerUser) {
      await SuccessStory.create({
        farmerId: farmerUser.id,
        farmerName: 'Ramesh Kumar',
        location: { village: 'Kheri', district: 'Karnal', state: 'Haryana' },
        story: 'DirectFarm helped me bypass multiple middle agents and connect directly with bulk supermarket buyers in Delhi-NCR, increasing my net income by over 45% in one season.',
        beforeIncome: 28000,
        currentIncome: 46000,
        improvements: ['Direct wholesale buyers', 'Fast online payments', 'Better crop rate realization'],
        cropTypes: ['Tomatoes', 'Potatoes', 'Basmati Rice', 'Capsicum'],
        yearsWithPlatform: 2,
        isApproved: true,
        isFeatured: true
      });
      console.log('✅ Seeded sample success story.');
    }

    // 7. Seed Locations
    const locationsCount = await Location.count();
    if (locationsCount === 0) {
      const sampleLocations = [
        { state: 'Haryana', district: 'Karnal', subdistrict: 'Karnal', village: 'Kheri' },
        { state: 'Haryana', district: 'Karnal', subdistrict: 'Nilokheri', village: 'Taraori' },
        { state: 'Haryana', district: 'Gurugram', subdistrict: 'Gurugram', village: 'Wazirabad' },
        { state: 'Punjab', district: 'Ludhiana', subdistrict: 'Ludhiana East', village: 'Sahnewal' },
        { state: 'Punjab', district: 'Amritsar', subdistrict: 'Ajnala', village: 'Chogawan' },
        { state: 'Maharashtra', district: 'Nashik', subdistrict: 'Niphad', village: 'Pimpalgaon' },
        { state: 'Maharashtra', district: 'Pune', subdistrict: 'Haveli', village: 'Manchar' },
        { state: 'Uttar Pradesh', district: 'Varanasi', subdistrict: 'Pindra', village: 'Sindhora' }
      ];

      for (const loc of sampleLocations) {
        await Location.findOrCreate({
          where: loc,
          defaults: loc
        });
      }
      console.log(`✅ Seeded ${sampleLocations.length} sample locations.`);
    }

    console.log('\n🎉 Database crop seeding completed successfully!');
    console.log('🌾 Farmer Ramesh has 10 high-quality crops in dashboard:');
    createdProducts.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} (${p.category}) - ${p.quantity}kg @ ₹${p.pricePerKg}/kg`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = seedDatabase;
