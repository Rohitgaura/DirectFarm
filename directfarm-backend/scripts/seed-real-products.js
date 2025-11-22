const mongoose = require('mongoose');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
require('dotenv').config();

const seedRealProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/directfarm');
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Create a farmer user at the specified location (Delhi, India)
        // Location: 28.4741, 77.0714
        const farmerUserData = {
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@example.com',
            password: 'farmer123', // Will be hashed by the model
            phone: '9876543210',
            role: 'farmer',
            experienceYears: 15,
            address: 'Village Sultanpur, Delhi, India',
            location: {
                type: 'Point',
                coordinates: [77.0714, 28.4741] // [longitude, latitude]
            }
        };

        // Check if farmer already exists
        let farmerUser = await User.findOne({ email: farmerUserData.email });

        if (!farmerUser) {
            farmerUser = new User(farmerUserData);
            await farmerUser.save();
            console.log('✅ Created farmer user: Rajesh Kumar');

            // Create Farmer record
            const farmerRecord = new Farmer({
                userId: farmerUser._id,
                name: farmerUser.name,
                email: farmerUser.email,
                phone: farmerUser.phone,
                address: farmerUser.address,
                experienceYears: farmerUser.experienceYears
            });
            await farmerRecord.save();
            console.log('✅ Created farmer record');
        } else {
            console.log('ℹ️  Farmer user already exists');
        }

        // Real products from this farmer
        const realProducts = [
            {
                name: 'Fresh Tomatoes',
                description: 'Organically grown fresh red tomatoes, perfect for cooking and salads. Harvested daily from our farm.',
                pricePerKg: 40,
                quantity: 500,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'],
                harvestingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                name: 'Cauliflower',
                description: 'Fresh white cauliflower, grown without pesticides. Rich in vitamins and minerals.',
                pricePerKg: 35,
                quantity: 300,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1568584711271-e88a5e8b0a8f?w=400'],
                harvestingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                name: 'Green Peas',
                description: 'Sweet and tender green peas, freshly harvested. Perfect for curries and rice dishes.',
                pricePerKg: 60,
                quantity: 200,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400'],
                harvestingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                name: 'Potatoes',
                description: 'High-quality potatoes, ideal for all types of cooking. Freshly dug from our fields.',
                pricePerKg: 25,
                quantity: 800,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
                harvestingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                name: 'Spinach (Palak)',
                description: 'Fresh green spinach leaves, rich in iron and nutrients. Grown organically.',
                pricePerKg: 30,
                quantity: 150,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'],
                harvestingDate: new Date() // Today
            },
            {
                name: 'Carrots',
                description: 'Crunchy orange carrots, sweet and nutritious. Great for salads and cooking.',
                pricePerKg: 45,
                quantity: 400,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'],
                harvestingDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
            },
            {
                name: 'Onions',
                description: 'Fresh red onions, essential for Indian cooking. Long shelf life.',
                pricePerKg: 30,
                quantity: 600,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400'],
                harvestingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                name: 'Cabbage',
                description: 'Fresh green cabbage, crisp and healthy. Perfect for salads and stir-fries.',
                pricePerKg: 20,
                quantity: 350,
                farmerId: farmerUser._id,
                location: {
                    state: 'Delhi',
                    district: 'South Delhi',
                    village: 'Sultanpur',
                    coordinates: [77.0714, 28.4741]
                },
                images: ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400'],
                harvestingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            }
        ];

        // Insert real products
        const result = await Product.insertMany(realProducts);
        console.log(`✅ Created ${result.length} real products`);

        console.log('\n📊 Summary:');
        console.log(`   Farmer: ${farmerUser.name}`);
        console.log(`   Location: ${farmerUser.address}`);
        console.log(`   Coordinates: ${farmerUser.location.coordinates[1]}, ${farmerUser.location.coordinates[0]}`);
        console.log(`   Products: ${result.length}`);
        console.log('\n✅ Real product data seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding real products:', error);
        process.exit(1);
    }
};

seedRealProducts();
