export interface CityFoodSpecialty {
  city: string;
  dishes: string[];
  recommendation: string;
}

// Regional food discovery records used by the recommendation cards.
// These are kept separate from restaurant inventory so the food layer can be
// updated independently of table availability.
export const CITY_FOOD_SPECIALTIES: Record<string, CityFoodSpecialty> = {
  Kakinada: { city: 'Kakinada', dishes: ['Kakinada kaja', 'Pulasa fish curry', 'Gongura mutton', 'Andhra meals'], recommendation: 'Try a coastal Andhra plate with a sweet Kakinada kaja to finish.' },
  Mumbai: { city: 'Mumbai', dishes: ['Vada pav', 'Pav bhaji', 'Bhel puri', 'Bombil fry', 'Misal pav'], recommendation: 'For a first taste of Mumbai, pair pav bhaji or vada pav with a coastal seafood plate.' },
  Delhi: { city: 'Delhi', dishes: ['Butter chicken', 'Chole bhature', 'Seekh kebab', 'Daulat ki chaat'], recommendation: 'Go for a North Indian spread: smoky kebabs, rich gravies and a seasonal chaat.' },
  Bengaluru: { city: 'Bengaluru', dishes: ['Masala dosa', 'Bisi bele bath', 'Mangaluru ghee roast', 'Filter coffee'], recommendation: 'South Indian classics and a strong filter coffee are the local crowd favourites.' },
  Hyderabad: { city: 'Hyderabad', dishes: ['Hyderabadi biryani', 'Haleem', 'Boti kebab', 'Irani chai', 'Osmania biscuits'], recommendation: 'The city’s signature order is biryani followed by Irani chai and Osmania biscuits.' },
  Chennai: { city: 'Chennai', dishes: ['Idli sambar', 'Dosa', 'Chettinad chicken', 'Filter coffee', 'Sundal'], recommendation: 'Choose a South Indian tiffin or Chettinad spread, then finish with filter coffee.' },
  Kolkata: { city: 'Kolkata', dishes: ['Kosha mangsho', 'Macher jhol', 'Kathi roll', 'Mishti doi', 'Rasgulla'], recommendation: 'A Bengali meal is at its best with fish curry, kosha mangsho and mishti doi.' },
  Pune: { city: 'Pune', dishes: ['Misal pav', 'Bakarwadi', 'Maharashtrian thali', 'Puran poli', 'Sabudana khichdi'], recommendation: 'Try a spicy misal pav or a full Maharashtrian thali for the local flavour.' },
  Ahmedabad: { city: 'Ahmedabad', dishes: ['Gujarati thali', 'Khaman', 'Dhokla', 'Fafda-jalebi', 'Handvo'], recommendation: 'A Gujarati thali gives you the widest taste of the city in one sitting.' },
  Jaipur: { city: 'Jaipur', dishes: ['Dal baati churma', 'Laal maas', 'Ghevar', 'Pyaaz kachori', 'Ker sangri'], recommendation: 'Look for a Rajasthani thali with dal baati churma and a seasonal ghevar.' },
  Goa: { city: 'Goa', dishes: ['Goan fish curry', 'Prawn balchão', 'Pork vindaloo', 'Bebinca', 'Ros omelette'], recommendation: 'Coastal seafood is the easy win—save room for bebinca or a Goan dessert.' },
  Kochi: { city: 'Kochi', dishes: ['Appam and stew', 'Kerala sadya', 'Karimeen pollichathu', 'Malabar biryani', 'Puttu and kadala'], recommendation: 'Try appam with stew or a Kerala sadya for a balanced taste of the coast.' },
  Chandigarh: { city: 'Chandigarh', dishes: ['Chole bhature', 'Amritsari kulcha', 'Butter chicken', 'Tandoori fish', 'Lassi'], recommendation: 'Punjabi comfort food is the local favourite—especially kulcha, tandoor and lassi.' },
};
