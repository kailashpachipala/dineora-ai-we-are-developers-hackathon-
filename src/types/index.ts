export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface Table {
	id: string;
	table_number: string;
	min_capacity: number;
	max_capacity: number;
	seating_area: string;
}

export interface Restaurant {
	id: string;
	name: string;
	slug: string;
	description: string;
	cuisine_type: string;
	address: string;
	city: string;
	neighborhood: string;
	latitude?: number;
	longitude?: number;
	price_tier: string;
	average_spend_per_person: number;
	rating: number;
	review_count: number;
	opening_time: string;
	closing_time: string;
	is_active: boolean;
	distance_km: number;
	currency_symbol: string;
	seating_options: string[];
	tables: Table[];
	image_url?: string;
	tags?: string[];
}

export interface AvailableSlot {
	time: string;
	table_id: string;
	table_number: string;
	seating_area: string;
	is_exact: boolean;
	is_available: boolean;
	estimated_spend: number;
}

export interface SearchRecommendation {
	restaurant: Restaurant;
	match_score: number;
	match_reasons: string[];
	available_slots: AvailableSlot[];
	waitlist_available: boolean;
}

export interface StructuredReservationIntent {
	party_size: number;
	target_date: string;
	preferred_time: string;
	occasion: string;
	seating_preference: string;
	location: string;
	cuisine_preference: string;
	currency_symbol: string;
	budget_per_person: number | null;
	total_budget: number | null;
	estimated_group_spend: number | null;
	spend_notice?: string;
	special_requests: string;
	preferred_restaurant: string | null;
	raw_prompt: string;
	extracted_at: string;
}

export interface IntentValidation {
	is_valid: boolean;
	errors: string[];
	warnings: string[];
	passed_invariants: string[];
}

export interface ReservationRecord {
	id: string;
	reservation_code: string;
	restaurant_id: string;
	restaurant_name: string;
	table_id: string;
	table_number: string;
	seating_area: string;
	party_size: number;
	reservation_date: string;
	start_time: string;
	end_time: string;
	status: ReservationStatus;
	guest_name: string;
	guest_email: string;
	guest_phone: string;
	special_requests?: string;
	estimated_spend: number;
	currency_symbol: string;
	address?: string;
	distance_km?: number;
	idempotency_key?: string;
	created_at: string;
}

export interface WaitlistRecord {
	id: string;
	restaurant_id: string;
	restaurant_name: string;
	party_size: number;
	desired_date: string;
	preferred_time: string;
	guest_name: string;
	guest_email: string;
	guest_phone: string;
	status: 'active' | 'notified' | 'converted' | 'expired' | 'cancelled';
	priority_score: number;
	created_at: string;
}

export interface HealthResponse {
	status: string;
	version: string;
	project_name: string;
	environment: string;
	timestamp: string;
	components: Record<string, unknown>;
}
