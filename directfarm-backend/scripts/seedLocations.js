const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('../models/Location');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const locations = [
    // --- ROHTAS DISTRICT ---
    // Sasaram
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sasaram', village: 'Sasaram (Town)' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sasaram', village: 'Dhurwa' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sasaram', village: 'Karwandia' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sasaram', village: 'Mokaram' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sasaram', village: 'Amra Talab' },

    // Dehri
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dehri', village: 'Dehri (Town)' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dehri', village: 'Dalmianagar' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dehri', village: 'Bastipur' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dehri', village: 'Manikpur' },

    // Bikramganj
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Bikramganj', village: 'Bikramganj (Town)' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Bikramganj', village: 'Tenduni' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Bikramganj', village: 'Munj' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Bikramganj', village: 'Dhangai' },

    // Nokha
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nokha', village: 'Nokha (Town)' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nokha', village: 'Roop Sagar' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nokha', village: 'Barahri' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nokha', village: 'Nasriganj Road' },

    // Karakat
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Karakat', village: 'Gorari' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Karakat', village: 'Sakala' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Karakat', village: 'Mohanpur' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Karakat', village: 'Karakat' },

    // Nasriganj
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nasriganj', village: 'Nasriganj (Town)' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nasriganj', village: 'Hariharganj' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nasriganj', village: 'Amiawar' },

    // Dawath
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dawath', village: 'Dawath' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dawath', village: 'Koath' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dawath', village: 'Babhani' },

    // Chenari
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Chenari', village: 'Chenari (Town)' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Chenari', village: 'Khurmabad' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Chenari', village: 'Puthar' },

    // Sheosagar
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sheosagar', village: 'Sheosagar' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sheosagar', village: 'Konar' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sheosagar', village: 'Baddi' },

    // Dinara
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dinara', village: 'Dinara' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dinara', village: 'Bhanas' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Dinara', village: 'Ganj Bharsara' },

    // Kargahar
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Kargahar', village: 'Kargahar' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Kargahar', village: 'Bhalari' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Kargahar', village: 'Khairra' },

    // Kochas
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Kochas', village: 'Kochas (Town)' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Kochas', village: 'Parsa' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Kochas', village: 'Chakia' },

    // Rajpur
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Rajpur', village: 'Rajpur' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Rajpur', village: 'Dehri' }, // Note: Distinct from Dehri block

    // Sanjhauli
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sanjhauli', village: 'Sanjhauli' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Sanjhauli', village: 'Mona' },

    // Suryapura
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Suryapura', village: 'Suryapura' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Suryapura', village: 'Agarer' },

    // Tilouthu
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Tilouthu', village: 'Tilouthu' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Tilouthu', village: 'Radha Shanta' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Tilouthu', village: 'Indrapuri' },

    // Akorhigola
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Akorhigola', village: 'Akorhigola' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Akorhigola', village: 'Baran' },

    // Nauhatta
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nauhatta', village: 'Nauhatta' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nauhatta', village: 'Chuna Bhatta' },
    { state: 'Bihar', district: 'Rohtas', subdistrict: 'Nauhatta', village: 'Yadunathpur' },

    // --- AURANGABAD DISTRICT ---
    // Aurangabad
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Aurangabad', village: 'Aurangabad (Town)' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Aurangabad', village: 'Jasma' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Aurangabad', village: 'Ora' },

    // Daudnagar
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Daudnagar', village: 'Daudnagar (Town)' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Daudnagar', village: 'Shamshernagar' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Daudnagar', village: 'Makhdumpur' },

    // Barun
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Barun', village: 'Barun' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Barun', village: 'Siris' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Barun', village: 'Karsara' },

    // Obra
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Obra', village: 'Obra' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Obra', village: 'Kharanti' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Obra', village: 'Bel' },

    // Rafiganj
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Rafiganj', village: 'Rafiganj (Town)' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Rafiganj', village: 'Pauthu' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Rafiganj', village: 'Itar' },

    // Nabinagar
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Nabinagar', village: 'Nabinagar (Town)' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Nabinagar', village: 'Chandragarh' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Nabinagar', village: 'Bela' },

    // Kutumba
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Kutumba', village: 'Kutumba' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Kutumba', village: 'Matihani' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Kutumba', village: 'Amba' },

    // Deo
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Deo', village: 'Deo' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Deo', village: 'Ketaki' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Deo', village: 'Bedhna' },

    // Madanpur
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Madanpur', village: 'Madanpur' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Madanpur', village: 'Khiriyawan' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Madanpur', village: 'Ghatrain' },

    // Goh
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Goh', village: 'Goh' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Goh', village: 'Ukhra' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Goh', village: 'Bandeya' },

    // Haspura
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Haspura', village: 'Haspura' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Haspura', village: 'Pachrukiya' },
    { state: 'Bihar', district: 'Aurangabad', subdistrict: 'Haspura', village: 'Ahiapur' },
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
        const result = await Location.insertMany(locations);
        console.log(`Successfully seeded ${result.length} locations`);

        process.exit();
    } catch (error) {
        console.error('Error seeding locations:', error);
        process.exit(1);
    }
};

seedLocations();
