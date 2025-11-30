const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('../models/Location');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const locations = [
    // Patna District
    { state: 'Bihar', district: 'Patna', subdistrict: 'Patna Sadar', village: 'Patna' },
    { state: 'Bihar', district: 'Patna', subdistrict: 'Patna Sadar', village: 'Phulwari Sharif' },
    { state: 'Bihar', district: 'Patna', subdistrict: 'Danapur', village: 'Danapur' },
    { state: 'Bihar', district: 'Patna', subdistrict: 'Danapur', village: 'Khagaul' },
    { state: 'Bihar', district: 'Patna', subdistrict: 'Bihta', village: 'Bihta' },
    { state: 'Bihar', district: 'Patna', subdistrict: 'Bihta', village: 'Amhara' },

    // Gaya District
    { state: 'Bihar', district: 'Gaya', subdistrict: 'Gaya Town', village: 'Gaya' },
    { state: 'Bihar', district: 'Gaya', subdistrict: 'Bodh Gaya', village: 'Bodh Gaya' },
    { state: 'Bihar', district: 'Gaya', subdistrict: 'Manpur', village: 'Manpur' },

    // Muzaffarpur District
    { state: 'Bihar', district: 'Muzaffarpur', subdistrict: 'Muzaffarpur East', village: 'Muzaffarpur' },
    { state: 'Bihar', district: 'Muzaffarpur', subdistrict: 'Kanti', village: 'Kanti' },
    { state: 'Bihar', district: 'Muzaffarpur', subdistrict: 'Motipur', village: 'Motipur' },

    // Bhagalpur District
    { state: 'Bihar', district: 'Bhagalpur', subdistrict: 'Bhagalpur', village: 'Bhagalpur' },
    { state: 'Bihar', district: 'Bhagalpur', subdistrict: 'Sultanganj', village: 'Sultanganj' },
    { state: 'Bihar', district: 'Bhagalpur', subdistrict: 'Naugachia', village: 'Naugachia' },

    // Sample data for other states (optional, for testing)
    { state: 'Delhi', district: 'South Delhi', subdistrict: 'Hauz Khas', village: 'Hauz Khas' },
    { state: 'Delhi', district: 'South Delhi', subdistrict: 'Mehrauli', village: 'Sultanpur' }
];

const seedLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected');

        // Clear existing locations
        await Location.deleteMany({});
        console.log('Locations cleared');

        // Insert new locations
        await Location.insertMany(locations);
        console.log('Locations seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding locations:', error);
        process.exit(1);
    }
};

seedLocations();
