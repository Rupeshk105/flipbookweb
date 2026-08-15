export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          role: 'admin' | 'customer';
          full_name: string | null;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          role?: 'admin' | 'customer';
          full_name?: string | null;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          role?: 'admin' | 'customer';
          full_name?: string | null;
          email?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          profile_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      albums: {
        Row: {
          id: string;
          customer_id: string;
          title: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string;
          description: string | null;
          cover_photo_path: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          title?: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string;
          description?: string | null;
          cover_photo_path?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          title?: string;
          bride_name?: string;
          groom_name?: string;
          wedding_date?: string;
          description?: string | null;
          cover_photo_path?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          album_id: string;
          storage_path: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          storage_path: string;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          storage_path?: string;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      album_music: {
        Row: {
          id: string;
          album_id: string;
          storage_path: string;
          title: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          storage_path: string;
          title?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          storage_path?: string;
          title?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'admin' | 'customer';
      customer_status: 'active' | 'inactive';
    };
  };
};
