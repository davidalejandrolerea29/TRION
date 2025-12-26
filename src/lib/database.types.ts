export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          created_at?: string;
        };
      };
      content: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          description: string;
          image_url: string;
          content_url: string;
          is_external: boolean;
          is_premium: boolean;
          file_type: 'video' | 'pdf' | 'image' | 'external';
          file_size: number | null;
          preview_duration: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          description?: string;
          image_url?: string;
          content_url?: string;
          is_external?: boolean;
          is_premium?: boolean;
          file_type?: 'video' | 'pdf' | 'image' | 'external';
          file_size?: number | null;
          preview_duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          title?: string;
          description?: string;
          image_url?: string;
          content_url?: string;
          is_external?: boolean;
          is_premium?: boolean;
          file_type?: 'video' | 'pdf' | 'image' | 'external';
          file_size?: number | null;
          preview_duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          is_admin: boolean;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          is_admin?: boolean;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          is_admin?: boolean;
          role?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_session_id: string;
          stripe_customer_id: string;
          status: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_session_id?: string;
          stripe_customer_id?: string;
          status?: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_session_id?: string;
          stripe_customer_id?: string;
          status?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      user_purchases: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          amount: number;
          status: string;
          purchase_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          amount?: number;
          status?: string;
          purchase_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          amount?: number;
          status?: string;
          purchase_date?: string;
          created_at?: string;
        };
      };
    };
  }
}

export type Category = Database['public']['Tables']['categories']['Row'];
export type Content = Database['public']['Tables']['content']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];