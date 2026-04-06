export type Plan = 'free' | 'pro' | 'multi'
export type Platform = 'airbnb' | 'vrbo' | 'booking' | 'direct'
export type BookingStatus = 'confirmed' | 'cancelled' | 'pending'
export type AlertChannel = 'sms' | 'messenger' | 'email'
export type AlertStatus = 'pending' | 'sent' | 'failed'
export type TeamRole = 'cleaning' | 'maintenance' | 'checkin'
export type PreferredChannel = 'sms' | 'messenger' | 'whatsapp'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface Property {
  id: string
  owner_id: string
  name: string
  address: string | null
  ical_url: string | null
  last_synced_at: string | null
  checkout_time: string
  notes: string | null
  created_at: string
}

export interface Booking {
  id: string
  property_id: string
  external_uid: string
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  check_in: string
  check_out: string
  platform: Platform | null
  status: BookingStatus
  alert_sent_at: string | null
  created_at: string
  // joined
  property?: Property
}

export interface TeamMember {
  id: string
  property_id: string
  name: string
  phone: string | null
  messenger_id: string | null
  role: TeamRole
  preferred_channel: PreferredChannel
  active: boolean
  created_at: string
}

export interface CleaningAlert {
  id: string
  booking_id: string
  team_member_id: string
  channel: AlertChannel
  message: string
  status: AlertStatus
  sent_at: string | null
  error_message: string | null
  created_at: string
  // joined
  booking?: Booking
  team_member?: TeamMember
}

export interface Subscription {
  id: string
  owner_id: string
  stripe_subscription_id: string | null
  plan: Plan
  status: SubscriptionStatus
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface ParsedBooking {
  external_uid: string
  guest_name: string | null
  guest_email: string | null
  check_in: string
  check_out: string
  platform: Platform | null
  status: BookingStatus
}

export interface PricingPlan {
  id: Plan
  name: string
  price: number
  currency: string
  description: string
  features: string[]
  stripePriceId?: string
  highlighted?: boolean
}

export interface DashboardStats {
  totalProperties: number
  upcomingCheckouts: number
  activeBookings: number
  pendingAlerts: number
}
