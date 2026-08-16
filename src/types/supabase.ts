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
        Relationships: [
          {
            foreignKeyName: 'customers_profile_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'customers';
            referencedColumns: ['profile_id'];
          },
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'audit_logs';
            referencedColumns: ['user_id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'customers_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'albums_customer_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'albums';
            referencedColumns: ['customer_id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'albums_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'photos_album_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['album_id'];
          },
          {
            foreignKeyName: 'album_music_album_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'album_music';
            referencedColumns: ['album_id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'photos_album_id_fkey';
            columns: ['album_id'];
            isOneToOne: false;
            referencedRelation: 'albums';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'album_music_album_id_fkey';
            columns: ['album_id'];
            isOneToOne: true;
            referencedRelation: 'albums';
            referencedColumns: ['id'];
          },
        ];
      };
      app_settings: {
        Row: {
          id: string;
          site_name: string;
          contact_phone: string;
          default_customer_password: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          contact_phone?: string;
          default_customer_password?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          contact_phone?: string;
          default_customer_password?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
