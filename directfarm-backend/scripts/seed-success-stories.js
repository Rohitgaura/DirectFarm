const mongoose = require('mongoose');
const SuccessStory = require('../models/SuccessStory');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/directfarm', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const dummyStories = [
    {
        farmerId: new mongoose.Types.ObjectId(),
        farmerName: 'Rajesh Kumar',
        location: {
            village: 'Khaira',
            district: 'Patna',
            state: 'Bihar'
        },
        story: 'Before joining DirectFarm, I struggled to get fair prices for my vegetables. Middlemen would take most of the profit. Now, I sell directly to buyers and my income has tripled! I can afford better education for my children and have upgraded my farming equipment.',
        beforeIncome: 15000,
        currentIncome: 45000,
        improvements: [
            'Purchased new irrigation system',
            'Children now in private school',
            'Built new storage facility',
            'Expanded farmland by 2 acres'
        ],
        cropTypes: ['Tomatoes', 'Potatoes', 'Cauliflower'],
        yearsWithPlatform: 2,
        isApproved: true,
        isFeatured: true
    },
    {
        farmerId: new mongoose.Types.ObjectId(),
        farmerName: 'Sunita Devi',
        location: {
            village: 'Masaurhi',
            district: 'Patna',
            state: 'Bihar'
        },
        story: 'As a woman farmer, I faced many challenges in traditional markets. DirectFarm gave me a platform to showcase my organic vegetables directly to health-conscious buyers. My income has doubled and I have become financially independent!',
        beforeIncome: 12000,
        currentIncome: 28000,
        improvements: [
            'Started organic farming',
            'Purchased solar panels',
            'Hired 2 farm workers',
            'Opened bank account'
        ],
        cropTypes: ['Organic Spinach', 'Carrots', 'Radish'],
        yearsWithPlatform: 1.5,
        isApproved: true,
        isFeatured: true
    },
    {
        farmerId: new mongoose.Types.ObjectId(),
        farmerName: 'Mohan Singh',
        location: {
            village: 'Danapur',
            district: 'Patna',
            state: 'Bihar'
        },
        story: 'DirectFarm transformed my farming business. I learned about market demands through the platform and started growing high-value crops. The direct connection with buyers eliminated delays and I get paid faster. My family\'s standard of living has improved significantly.',
        beforeIncome: 20000,
        currentIncome: 55000,
        improvements: [
            'Switched to high-value crops',
            'Installed drip irrigation',
            'Purchased tractor',
            'Built concrete house'
        ],
        cropTypes: ['Bell Peppers', 'Broccoli', 'Lettuce'],
        yearsWithPlatform: 3,
        isApproved: true,
        isFeatured: false
    },
    {
        farmerId: new mongoose.Types.ObjectId(),
        farmerName: 'Amit Sharma',
        location: {
            village: 'Phulwari',
            district: 'Patna',
            state: 'Bihar'
        },
        story: 'I was skeptical about online platforms at first, but DirectFarm proved me wrong. The training and support helped me understand buyer preferences. Now I plan my crops based on market demand and my income has increased by 120%. I recommend this platform to all farmers!',
        beforeIncome: 18000,
        currentIncome: 40000,
        improvements: [
            'Learned market-driven farming',
            'Reduced crop wastage',
            'Improved packaging',
            'Expanded customer base'
        ],
        cropTypes: ['Onions', 'Garlic', 'Green Chilies'],
        yearsWithPlatform: 2.5,
        isApproved: true,
        isFeatured: false
    },
    {
        farmerId: new mongoose.Types.ObjectId(),
        farmerName: 'Priya Kumari',
        location: {
            village: 'Maner',
            district: 'Patna',
            state: 'Bihar'
        },
        story: 'DirectFarm gave me the confidence to start my own farming venture. The platform connected me with buyers who appreciate quality produce. I started small but now supply to multiple restaurants and families. My monthly income has increased from ₹10,000 to ₹30,000!',
        beforeIncome: 10000,
        currentIncome: 30000,
        improvements: [
            'Started independent farming',
            'Built greenhouse',
            'Purchased delivery vehicle',
            'Hired assistant'
        ],
        cropTypes: ['Exotic Vegetables', 'Herbs', 'Mushrooms'],
        yearsWithPlatform: 1,
        isApproved: true,
        isFeatured: true
    }
];

async function seedSuccessStories() {
    try {
        // Clear existing stories
        await SuccessStory.deleteMany({});
        console.log('Cleared existing success stories');

        // Insert dummy stories
        const result = await SuccessStory.insertMany(dummyStories);
        console.log(`✅ Successfully inserted ${result.length} success stories`);

        // Display inserted stories
        result.forEach(story => {
            console.log(`\n📖 ${story.farmerName} - ${story.location.village}, ${story.location.district}`);
            console.log(`   Income: ₹${story.beforeIncome} → ₹${story.currentIncome} (${story.incomeImprovement}% increase)`);
            console.log(`   Featured: ${story.isFeatured ? 'Yes' : 'No'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding success stories:', error);
        process.exit(1);
    }
}

seedSuccessStories();
