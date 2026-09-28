import { ReservationRecord, Restaurant } from '../types';

const table = (id: string, number: string, min: number, max: number, area = 'indoor') => ({
	id,
	table_number: number,
	min_capacity: min,
	max_capacity: max,
	seating_area: area,
});

export const SEED_RESTAURANTS: Restaurant[] = [
        {
                id: 'rest_01', name: 'Subbayya Gari Hotel', slug: 'subbayya-gari-hotel',
                description: 'Fresh coastal flavours with fire-grilled favourites.', cuisine_type: 'Andhra & Coastal Multi-Cuisine',
		address: '12 Harbour Road', city: 'Kakinada', neighborhood: 'Riverfront', price_tier: '$$',
		average_spend_per_person: 500, rating: 4.8, review_count: 328, opening_time: '12:00', closing_time: '23:00',
		is_active: true, distance_km: 1.2, currency_symbol: '₹', seating_options: ['indoor', 'outdoor', 'quiet', 'booth'],
		tables: [table('tbl_01', 'T1', 1, 2, 'quiet'), table('tbl_02', 'T2', 2, 4), table('tbl_03', 'T3', 4, 8, 'outdoor')],
	},
	{
                id: 'rest_02', name: 'The Costa Grill', slug: 'the-costa-grill', description: 'A warm dining room for memorable celebrations.',
		cuisine_type: 'Modern Indian', address: '88 Market Street', city: 'Kakinada', neighborhood: 'City Center', price_tier: '$$$',
		average_spend_per_person: 700, rating: 4.7, review_count: 214, opening_time: '17:00', closing_time: '23:00',
		is_active: true, distance_km: 2.4, currency_symbol: '₹', seating_options: ['indoor', 'booth', 'quiet'],
		tables: [table('tbl_04', 'T4', 2, 4, 'booth'), table('tbl_05', 'T5', 4, 6)],
	},
	{
                id: 'rest_03', name: 'Grand Kakinada by GRT Hotels', slug: 'grand-kakinada', description: 'Modern seasonal dining with garden seating.',
		cuisine_type: 'Contemporary', address: '4 Garden Lane', city: 'Kakinada', neighborhood: 'Uptown', price_tier: '$$',
		average_spend_per_person: 450, rating: 4.6, review_count: 187, opening_time: '11:30', closing_time: '22:30',
		is_active: true, distance_km: 3.1, currency_symbol: '₹', seating_options: ['indoor', 'outdoor', 'patio'],
		tables: [table('tbl_06', 'T6', 1, 2), table('tbl_07', 'T7', 2, 6, 'patio')],
	},
];

export const INITIAL_RESERVATIONS: ReservationRecord[] = [];

const CITY_VENUES: Record<string, Array<{ name: string; slug: string; description: string; cuisine: string; neighborhood: string }>> = {
        Kakinada: [
                { name: 'Subbayya Gari Hotel', slug: 'subbayya-gari-hotel', description: 'Traditional Andhra vegetarian meals and timeless local hospitality.', cuisine: 'Andhra · Vegetarian', neighborhood: 'Main Road' },
                { name: 'The Costa Grill', slug: 'the-costa-grill', description: 'Coastal flavours, grills and an easy family dining room.', cuisine: 'Coastal · Multi-Cuisine', neighborhood: 'Sarpavaram' },
                { name: 'Grand Kakinada by GRT Hotels', slug: 'grand-kakinada', description: 'Hotel dining with polished service and generous regional plates.', cuisine: 'Indian · Fine Dining', neighborhood: 'Ramanayyapeta' },
                { name: 'Garden Cafe', slug: 'garden-cafe-kakinada', description: 'Relaxed cafe dining with snacks, coffee and garden seating.', cuisine: 'Cafe · Multi-Cuisine', neighborhood: 'Bhanugudi' },
                { name: 'Royal Park', slug: 'royal-park-kakinada', description: 'A dependable local favourite for family dinners and celebrations.', cuisine: 'Indian · Family Dining', neighborhood: 'Jagannaickpur' },
                { name: 'Amrutham Family Restaurant', slug: 'amrutham-kakinada', description: 'Comforting South Indian and Andhra dishes for every occasion.', cuisine: 'South Indian · Family Dining', neighborhood: 'Suryaraopeta' },
        ],
        Mumbai: [
                { name: 'Ekaa', slug: 'ekaa-mumbai', description: 'Thoughtful modern Indian dining in the heart of Fort.', cuisine: 'Modern Indian · Tasting Menu', neighborhood: 'Fort' },
                { name: 'Jamavar', slug: 'jamavar-mumbai', description: 'Refined Indian cooking with a grand, intimate dining room.', cuisine: 'Indian · Fine Dining', neighborhood: 'Lower Parel' },
                { name: 'The Table', slug: 'the-table-mumbai', description: 'Ingredient-led plates and warm hospitality near Colaba.', cuisine: 'Global · Contemporary', neighborhood: 'Colaba' },
                { name: 'Khyber', slug: 'khyber-mumbai', description: 'A celebrated old-school address for North-West Frontier cuisine.', cuisine: 'North Indian · Heritage', neighborhood: 'Kala Ghoda' },
                { name: 'Hakkasan Mumbai', slug: 'hakkasan-mumbai', description: 'Modern Cantonese dining with a polished late-night atmosphere.', cuisine: 'Cantonese · Fine Dining', neighborhood: 'Worli' },
                { name: 'The Bombay Canteen', slug: 'the-bombay-canteen', description: 'Playful Indian plates inspired by the many flavours of Mumbai.', cuisine: 'Modern Indian · Bar', neighborhood: 'Lower Parel' },
        ],
        Delhi: [
                { name: 'Indian Accent', slug: 'indian-accent-delhi', description: 'Inventive Indian cuisine in a polished modern setting.', cuisine: 'Indian · Fine Dining', neighborhood: 'Lodhi Road' },
                { name: 'Bukhara', slug: 'bukhara-delhi', description: 'Legendary North-West Frontier cooking and rustic hospitality.', cuisine: 'North Indian · Grill', neighborhood: 'Chanakyapuri' },
                { name: 'Gulati', slug: 'gulati-delhi', description: 'A beloved destination for classic North Indian flavours.', cuisine: 'Mughlai · Family Dining', neighborhood: 'Pandara Road' },
                { name: 'Dum Pukht', slug: 'dum-pukht-delhi', description: 'Slow-cooked Awadhi cuisine in an elegant dining room.', cuisine: 'Awadhi · Fine Dining', neighborhood: 'Chanakyapuri' },
                { name: 'The Big Chill', slug: 'the-big-chill-delhi', description: 'Comforting global dishes and desserts for relaxed catch-ups.', cuisine: 'Continental · Cafe', neighborhood: 'Khan Market' },
                { name: 'Burma Burma', slug: 'burma-burma-delhi', description: 'Fragrant Burmese food with a colourful vegetarian menu.', cuisine: 'Burmese · Vegetarian', neighborhood: 'Saket' },
        ],
        Bengaluru: [
                { name: 'Bengaluru Oota Company', slug: 'bengaluru-oota-company', description: 'A warm celebration of Karnataka food stories.', cuisine: 'Karnataka · Regional', neighborhood: 'Indiranagar' },
                { name: 'Farzi Cafe', slug: 'farzi-cafe-bengaluru', description: 'Playful modern Indian plates and a lively dining room.', cuisine: 'Modern Indian · Bar', neighborhood: 'UB City' },
                { name: 'Karavalli', slug: 'karavalli-bengaluru', description: 'Coastal and regional South Indian cuisine with heritage charm.', cuisine: 'South Indian · Fine Dining', neighborhood: 'Residency Road' },
                { name: 'MTR', slug: 'mtr-bengaluru', description: 'A Bengaluru institution for classic South Indian breakfast.', cuisine: 'South Indian · Heritage', neighborhood: 'Lalbagh' },
                { name: 'Toit', slug: 'toit-bengaluru', description: 'Craft beer, wood-fired plates and a lively evening crowd.', cuisine: 'Global · Brewpub', neighborhood: 'Indiranagar' },
                { name: 'The Fatty Bao', slug: 'the-fatty-bao-bengaluru', description: 'Creative Asian small plates in a relaxed neighbourhood bar.', cuisine: 'Asian · Bar', neighborhood: 'Indiranagar' },
        ],
        Hyderabad: [
                { name: 'AnTeRa Kitchen & Bar', slug: 'antera-hyderabad', description: 'Contemporary Indian cooking with a modern Hyderabad spirit.', cuisine: 'Contemporary Indian · Bar', neighborhood: 'Jubilee Hills' },
                { name: 'Bawarchi', slug: 'bawarchi-hyderabad', description: 'A Hyderabad favourite for aromatic biryani and grills.', cuisine: 'Hyderabadi · Biryani', neighborhood: 'RTC X Roads' },
                { name: 'Mehfil', slug: 'mehfil-hyderabad', description: 'Comforting biryani, kebabs and generous family tables.', cuisine: 'Mughlai · Family Dining', neighborhood: 'Kukatpally' },
                { name: 'Jewel of Nizam', slug: 'jewel-of-nizam-hyderabad', description: 'Fine dining with a royal view over the city lights.', cuisine: 'Indian · Fine Dining', neighborhood: 'Golkonda' },
                { name: 'Chicha’s', slug: 'chichas-hyderabad', description: 'Casual Hyderabadi favourites, grills and biryani.', cuisine: 'Hyderabadi · Casual', neighborhood: 'Jubilee Hills' },
                { name: 'Olive Bistro', slug: 'olive-bistro-hyderabad', description: 'Mediterranean plates and sunset dining by the lake.', cuisine: 'Mediterranean · Bistro', neighborhood: 'Jubilee Hills' },
        ],
        Chennai: [
                { name: 'Avartana', slug: 'avartana-chennai', description: 'A progressive South Indian tasting experience.', cuisine: 'South Indian · Fine Dining', neighborhood: 'ITC Grand Chola' },
                { name: 'Dakshin', slug: 'dakshin-chennai', description: 'Traditional regional cooking served with elegance.', cuisine: 'South Indian · Heritage', neighborhood: 'Alwarpet' },
                { name: 'The Marina', slug: 'the-marina-chennai', description: 'Fresh seafood and coastal flavours by the city.', cuisine: 'Seafood · Coastal', neighborhood: 'Mylapore' },
                { name: 'Murugan Idli Shop', slug: 'murugan-idli-shop-chennai', description: 'A much-loved stop for soft idlis and traditional tiffin.', cuisine: 'South Indian · Casual', neighborhood: 'T Nagar' },
                { name: 'The Flying Elephant', slug: 'the-flying-elephant-chennai', description: 'A vibrant multi-cuisine restaurant for celebratory evenings.', cuisine: 'Global · Bar', neighborhood: 'Guindy' },
                { name: 'Southern Spice', slug: 'southern-spice-chennai', description: 'Regional South Indian specialities in a refined setting.', cuisine: 'South Indian · Fine Dining', neighborhood: 'Nungambakkam' },
        ],
        Kolkata: [
                { name: '6 Ballygunge Place', slug: '6-ballygunge-place', description: 'Beloved Bengali home-style cooking in a relaxed setting.', cuisine: 'Bengali · Family Dining', neighborhood: 'Ballygunge' },
                { name: 'Peter Cat', slug: 'peter-cat-kolkata', description: 'An iconic Park Street address for classic comfort food.', cuisine: 'Continental · Classic', neighborhood: 'Park Street' },
                { name: 'Kosha', slug: 'kosha-kolkata', description: 'Modern Bengali dishes with a thoughtful contemporary lens.', cuisine: 'Bengali · Contemporary', neighborhood: 'Salt Lake' },
                { name: '6 Ballygunge Place Thali', slug: '6-ballygunge-place-thali', description: 'A generous Bengali thali built around seasonal comfort food.', cuisine: 'Bengali · Thali', neighborhood: 'Ballygunge' },
                { name: 'Bohemian', slug: 'bohemian-kolkata', description: 'Inventive Bengali fusion in a warm neighbourhood dining room.', cuisine: 'Bengali · Fusion', neighborhood: 'Ballygunge' },
                { name: 'Mocambo', slug: 'mocambo-kolkata', description: 'A Park Street classic for Continental comfort dishes.', cuisine: 'Continental · Heritage', neighborhood: 'Park Street' },
        ],
        Pune: [
                { name: 'Malaka Spice', slug: 'malaka-spice-pune', description: 'A colourful neighbourhood favourite for Asian flavours.', cuisine: 'Asian · Casual', neighborhood: 'Koregaon Park' },
                { name: 'Shabree', slug: 'shabree-pune', description: 'Vegetarian Maharashtrian classics in a lively dining room.', cuisine: 'Maharashtrian · Vegetarian', neighborhood: 'Deccan' },
                { name: 'The Daily All Day', slug: 'the-daily-all-day-pune', description: 'All-day dining, cocktails and easy weekend energy.', cuisine: 'Global · Bar', neighborhood: 'Kalyani Nagar' },
                { name: 'Vaishali', slug: 'vaishali-pune', description: 'A Pune institution for South Indian snacks and filter coffee.', cuisine: 'South Indian · Casual', neighborhood: 'FC Road' },
                { name: 'Paasha', slug: 'paasha-pune', description: 'Rooftop North Indian dining with a city skyline view.', cuisine: 'North Indian · Rooftop', neighborhood: 'Shivajinagar' },
                { name: 'The Flour Works', slug: 'the-flour-works-pune', description: 'Fresh bakes, brunch plates and a calm garden setting.', cuisine: 'Bakery · Cafe', neighborhood: 'Kalyani Nagar' },
        ],
        Ahmedabad: [
                { name: 'Agashiye', slug: 'agashiye-ahmedabad', description: 'A graceful rooftop Gujarati thali experience.', cuisine: 'Gujarati · Heritage', neighborhood: 'Old City' },
                { name: 'Vishalla', slug: 'vishalla-ahmedabad', description: 'Village-inspired Gujarati dining surrounded by craft and culture.', cuisine: 'Gujarati · Traditional', neighborhood: 'Vasna' },
                { name: 'Seva Cafe', slug: 'seva-cafe-ahmedabad', description: 'A warm community cafe built around generous vegetarian food.', cuisine: 'Vegetarian · Cafe', neighborhood: 'Navrangpura' },
                { name: 'The House of Makeba', slug: 'house-of-makeba-ahmedabad', description: 'A lively modern restaurant for global plates and drinks.', cuisine: 'Global · Bar', neighborhood: 'Prahlad Nagar' },
                { name: 'Gordhan Thal', slug: 'gordhan-thal-ahmedabad', description: 'A festive Gujarati thali experience for family gatherings.', cuisine: 'Gujarati · Thali', neighborhood: 'SG Highway' },
                { name: 'The Green House', slug: 'the-green-house-ahmedabad', description: 'A leafy cafe for light meals, tea and long conversations.', cuisine: 'Cafe · Vegetarian', neighborhood: 'Lal Darwaja' },
        ],
        Jaipur: [
                { name: '1135 AD', slug: '1135-ad-jaipur', description: 'Regal Rajasthani and North Indian dining inside Amber Fort.', cuisine: 'Rajasthani · Fine Dining', neighborhood: 'Amber' },
                { name: 'Suvarna Mahal', slug: 'suvarna-mahal-jaipur', description: 'Opulent royal Indian cuisine in a historic palace setting.', cuisine: 'Indian · Fine Dining', neighborhood: 'Rambagh' },
                { name: 'Lassiwala', slug: 'lassiwala-jaipur', description: 'A beloved old-city stop for traditional lassi and snacks.', cuisine: 'Rajasthani · Casual', neighborhood: 'MI Road' },
                { name: 'Bar Palladio', slug: 'bar-palladio-jaipur', description: 'Italian plates and cocktails in an unmistakable blue setting.', cuisine: 'Italian · Bar', neighborhood: 'Narain Niwas' },
                { name: 'Chokhi Dhani', slug: 'chokhi-dhani-jaipur', description: 'A colourful Rajasthani village-style dining experience.', cuisine: 'Rajasthani · Cultural', neighborhood: 'Tonk Road' },
                { name: 'Café Palladio', slug: 'cafe-palladio-jaipur', description: 'Elegant daytime dining with Mediterranean-inspired plates.', cuisine: 'Mediterranean · Cafe', neighborhood: 'C Scheme' },
        ],
        Goa: [
                { name: 'Gunpowder', slug: 'gunpowder-goa', description: 'South Indian flavours in a relaxed, leafy garden setting.', cuisine: 'South Indian · Coastal', neighborhood: 'Assagao' },
                { name: 'Mum’s Kitchen', slug: 'mums-kitchen-goa', description: 'Goan home cooking, heritage recipes and warm stories.', cuisine: 'Goan · Heritage', neighborhood: 'Miramar' },
                { name: 'The Fisherman’s Wharf', slug: 'fishermans-wharf-goa', description: 'Fresh seafood, river views and easy coastal evenings.', cuisine: 'Seafood · Goan', neighborhood: 'Cavelossim' },
                { name: 'Pousada by the Beach', slug: 'pousada-by-the-beach-goa', description: 'Slow beachside lunches and classic Goan hospitality.', cuisine: 'Goan · Seafood', neighborhood: 'Calangute' },
                { name: 'Antares', slug: 'antares-goa', description: 'Sunset dining, cocktails and coastal plates on the cliff.', cuisine: 'Global · Seafood', neighborhood: 'Vagator' },
                { name: 'Mojigao', slug: 'mojigao-goa', description: 'A garden cafe for nourishing plates and creative drinks.', cuisine: 'Cafe · Vegetarian', neighborhood: 'Assagao' },
        ],
        Kochi: [
                { name: 'Fort House Restaurant', slug: 'fort-house-kochi', description: 'Backwater views and Kerala flavours in Fort Kochi.', cuisine: 'Kerala · Seafood', neighborhood: 'Fort Kochi' },
                { name: 'Kashi Art Cafe', slug: 'kashi-art-cafe-kochi', description: 'Art, coffee and thoughtful plates in a historic courtyard.', cuisine: 'Cafe · Contemporary', neighborhood: 'Fort Kochi' },
                { name: 'Paragon', slug: 'paragon-kochi', description: 'A local favourite for Malabar classics and seafood.', cuisine: 'Malabar · Family Dining', neighborhood: 'Edappally' },
                { name: 'Kadal Sadan', slug: 'kadal-sadan-kochi', description: 'A seafood-forward kitchen celebrating Kerala’s coast.', cuisine: 'Kerala · Seafood', neighborhood: 'Vypin' },
                { name: 'District 7 Encore', slug: 'district-7-encore-kochi', description: 'A lively modern restaurant for groups and late dinners.', cuisine: 'Global · Bar', neighborhood: 'Kakkanad' },
                { name: 'Brindhavan', slug: 'brindhavan-kochi', description: 'Vegetarian South Indian comfort food and fresh coffee.', cuisine: 'South Indian · Vegetarian', neighborhood: 'Palarivattom' },
        ],
        Chandigarh: [
                { name: 'Indian Coffee House', slug: 'indian-coffee-house-chandigarh', description: 'A much-loved city institution for simple, familiar meals.', cuisine: 'Indian · Cafe', neighborhood: 'Sector 17' },
                { name: 'Nik Baker’s', slug: 'nik-bakers-chandigarh', description: 'Bakes, brunches and easy all-day dining.', cuisine: 'Bakery · Continental', neighborhood: 'Sector 9' },
                { name: 'Whistling Duck', slug: 'whistling-duck-chandigarh', description: 'Modern Asian plates and cocktails for an evening out.', cuisine: 'Asian · Bar', neighborhood: 'Sector 7' },
                { name: 'Kesar Da Dhaba', slug: 'kesar-da-dhaba-chandigarh', description: 'Punjabi comfort food with generous family-style portions.', cuisine: 'Punjabi · Family Dining', neighborhood: 'Sector 35' },
                { name: 'Virgin Courtyard', slug: 'virgin-courtyard-chandigarh', description: 'European-inspired plates in a relaxed courtyard setting.', cuisine: 'European · Bistro', neighborhood: 'Sector 10' },
                { name: 'Fumo', slug: 'fumo-chandigarh', description: 'A stylish contemporary restaurant for evening gatherings.', cuisine: 'Asian · Contemporary', neighborhood: 'Sector 17' },
        ],
};

export function getRestaurantsForLocation(location: string): Restaurant[] {
        const venues = CITY_VENUES[location];
        if (!venues) return SEED_RESTAURANTS;
        return venues.map((venue, index) => {
                const base = SEED_RESTAURANTS[index % SEED_RESTAURANTS.length];
                const cityKey = location.toLowerCase().replace(/\s+/g, '_');
                return {
                        ...base,
                        id: `${cityKey}_${index + 1}`,
                        name: venue.name,
                        slug: venue.slug,
                        description: venue.description,
                        cuisine_type: venue.cuisine,
                        city: location,
                        neighborhood: venue.neighborhood,
                        address: `${venue.neighborhood}, ${location}`,
                        distance_km: Number((1.1 + index * 1.3).toFixed(1)),
                        tables: base.tables.map((table, tableIndex) => ({ ...table, id: `${cityKey}_table_${index + 1}_${tableIndex + 1}` })),
                };
        });
}

export function findRestaurantById(id: string): Restaurant | undefined {
        if (id.startsWith('rest_')) return SEED_RESTAURANTS.find((restaurant) => restaurant.id === id);
        return Object.keys(CITY_VENUES).flatMap((city) => getRestaurantsForLocation(city)).find((restaurant) => restaurant.id === id);
}
