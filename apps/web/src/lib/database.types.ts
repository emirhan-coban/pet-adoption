// Elle yazılmış tip tanımları — supabase/migrations/*.sql şemasından türetildi.
// Supabase CLI kurulu olduğunda gerçek codegen ile değiştirilebilir:
//   supabase gen types typescript --project-id <PROJECT_ID> > src/lib/database.types.ts

export type UserRole = 'individual' | 'corporate' | 'admin'
export type CorporateStatus = 'pending' | 'approved' | 'rejected'
export type PetType = 'cat' | 'dog' | 'bird' | 'rabbit' | 'other'
export type PetGender = 'male' | 'female' | 'unknown'
export type ListingStatus = 'active' | 'adopted' | 'hidden'
export type AdoptionMode = 'bulletin' | 'application_form'
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'
export type ReportStatus = 'open' | 'investigating' | 'resolved'

export interface HealthStatus {
  vaccinated?: boolean
  neutered?: boolean
  dewormed?: boolean
  microchipped?: boolean
  vet_checked?: boolean
}

export interface Traits {
  friendly?: boolean
  indoor?: boolean
  good_with_kids?: boolean
  good_with_pets?: boolean
  trained?: boolean
  quiet?: boolean
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          trust_score: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']> & { id: string; email: string }
        Update: Partial<Database['public']['Tables']['users']['Row']>
        Relationships: []
      }
      corporate_profiles: {
        Row: {
          user_id: string
          organization_name: string
          tax_id: string | null
          derbis_no: string | null
          address: string | null
          document_url: string | null
          status: CorporateStatus
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: Partial<Database['public']['Tables']['corporate_profiles']['Row']> & {
          user_id: string
          organization_name: string
        }
        Update: Partial<Database['public']['Tables']['corporate_profiles']['Row']>
        Relationships: []
      }
      listings: {
        Row: {
          id: string
          user_id: string
          pet_type: PetType
          breed: string | null
          name: string | null
          age_months: number | null
          gender: PetGender
          city: string
          district: string | null
          health_status: HealthStatus
          traits: Traits
          description: string | null
          petvet_chip_id: string | null
          adoption_mode: AdoptionMode
          status: ListingStatus
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['listings']['Row']> & {
          user_id: string
          pet_type: PetType
          city: string
        }
        Update: Partial<Database['public']['Tables']['listings']['Row']>
        Relationships: []
      }
      listing_media: {
        Row: {
          id: string
          listing_id: string
          media_url: string
          is_primary: boolean
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['listing_media']['Row']> & {
          listing_id: string
          media_url: string
        }
        Update: Partial<Database['public']['Tables']['listing_media']['Row']>
        Relationships: [
          {
            foreignKeyName: 'listing_media_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          listing_id: string
          content: string
          is_read: boolean
          ai_flagged: boolean
          is_hidden: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & {
          sender_id: string
          receiver_id: string
          listing_id: string
          content: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Row']>
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          listing_id: string
          applicant_id: string
          form_responses: Record<string, unknown>
          status: ApplicationStatus
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['applications']['Row']> & {
          listing_id: string
          applicant_id: string
        }
        Update: Partial<Database['public']['Tables']['applications']['Row']>
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          listing_id: string | null
          reason: string
          description: string | null
          status: ReportStatus
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['reports']['Row']> & {
          reporter_id: string
          reason: string
        }
        Update: Partial<Database['public']['Tables']['reports']['Row']>
        Relationships: []
      }
      favorites: {
        Row: {
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['favorites']['Row']> & {
          user_id: string
          listing_id: string
        }
        Update: Partial<Database['public']['Tables']['favorites']['Row']>
        Relationships: []
      }
      view_count_tracker: {
        Row: {
          user_id: string
          listing_id: string
          viewed_at: string
        }
        Insert: Partial<Database['public']['Tables']['view_count_tracker']['Row']> & {
          user_id: string
          listing_id: string
        }
        Update: Partial<Database['public']['Tables']['view_count_tracker']['Row']>
        Relationships: []
      }
    }
    Views: {
      conversation_summaries: {
        Row: {
          last_message_id: string
          listing_id: string
          sender_id: string
          receiver_id: string
          last_message: string
          last_message_at: string
          is_read: boolean
          pet_type: PetType
          pet_name: string | null
          city: string
          pet_photo: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_my_profile: {
        Args: Record<string, never>
        Returns: {
          full_name: string | null
          phone: string | null
          avatar_url: string | null
        }[]
      }
      update_my_profile: {
        Args: {
          p_full_name: string
          p_phone?: string | null
          p_avatar_url?: string | null
        }
        Returns: undefined
      }
      delete_user_account: {
        Args: Record<string, never>
        Returns: void
      }
      increment_view_count: {
        Args: { listing_uuid: string }
        Returns: void
      }
    }
  }
}
