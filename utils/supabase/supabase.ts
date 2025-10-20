export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: {
          p_usename: string
        }
        Returns: {
          username: string
          password: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      proceeding: {
        Row: {
          dates: string[]
          id: number
          number: number
          term: number
          title: string
        }
        Insert: {
          dates: string[]
          id?: number
          number: number
          term: number
          title: string
        }
        Update: {
          dates?: string[]
          id?: number
          number?: number
          term?: number
          title?: string
        }
        Relationships: []
      }
      proceeding_day: {
        Row: {
          date: string
          day_no: number
          id: number
          proceeding_id: number
          yt_link: string | null
        }
        Insert: {
          date: string
          day_no: number
          id?: number
          proceeding_id: number
          yt_link?: string | null
        }
        Update: {
          date?: string
          day_no?: number
          id?: number
          proceeding_id?: number
          yt_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_proceeding'
            columns: ['proceeding_id']
            referencedRelation: 'proceeding'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_proceeding'
            columns: ['proceeding_id']
            referencedRelation: 'statement_min'
            referencedColumns: ['proceeding_id']
          },
        ]
      }
      proceeding_point_ai: {
        Row: {
          category: string | null
          id: number
          number_sequence: number | null
          official_point: string
          official_topic: string
          print_numbers: string[] | null
          proceeding_day_id: number
          summary_main: Json | null
          summary_tldr: string | null
          title: string | null
          topic: string | null
          voting_numbers: number[] | null
        }
        Insert: {
          category?: string | null
          id?: number
          number_sequence?: number | null
          official_point: string
          official_topic: string
          print_numbers?: string[] | null
          proceeding_day_id: number
          summary_main?: Json | null
          summary_tldr?: string | null
          title?: string | null
          topic?: string | null
          voting_numbers?: number[] | null
        }
        Update: {
          category?: string | null
          id?: number
          number_sequence?: number | null
          official_point?: string
          official_topic?: string
          print_numbers?: string[] | null
          proceeding_day_id?: number
          summary_main?: Json | null
          summary_tldr?: string | null
          title?: string | null
          topic?: string | null
          voting_numbers?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_proceeding_day_ai'
            columns: ['proceeding_day_id']
            referencedRelation: 'proceeding_day'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_proceeding_day_ai'
            columns: ['proceeding_day_id']
            referencedRelation: 'statement_min'
            referencedColumns: ['proceeding_day_id']
          },
        ]
      }
      process_votes: {
        Row: {
          created_at: string
          id: number
          process_id: number
          user_id: string
          vote_type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          process_id: number
          user_id: string
          vote_type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          process_id?: number
          user_id?: string
          vote_type?: string | null
        }
        Relationships: []
      }
      statement: {
        Row: {
          id: number
          number_sequence: number
          number_source: number
          official_point: string | null
          official_prints: string[] | null
          official_topic: string | null
          proceeding_day_id: number
          speaker_function: string | null
          speaker_name: string | null
          text: string | null
          voting_numbers: string[] | null
        }
        Insert: {
          id?: number
          number_sequence: number
          number_source: number
          official_point?: string | null
          official_prints?: string[] | null
          official_topic?: string | null
          proceeding_day_id: number
          speaker_function?: string | null
          speaker_name?: string | null
          text?: string | null
          voting_numbers?: string[] | null
        }
        Update: {
          id?: number
          number_sequence?: number
          number_source?: number
          official_point?: string | null
          official_prints?: string[] | null
          official_topic?: string | null
          proceeding_day_id?: number
          speaker_function?: string | null
          speaker_name?: string | null
          text?: string | null
          voting_numbers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_proceeding_day'
            columns: ['proceeding_day_id']
            referencedRelation: 'proceeding_day'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_proceeding_day'
            columns: ['proceeding_day_id']
            referencedRelation: 'statement_min'
            referencedColumns: ['proceeding_day_id']
          },
        ]
      }
      statement_ai: {
        Row: {
          citations: string[] | null
          citations_time: string[] | null
          id: number
          interruptions: Json | null
          point_split: Json | null
          speaker_rating: Json | null
          start_end_time: string | null
          statement_id: number
          summary_discussion: string | null
          summary_tldr: string | null
          topic: string | null
          topic_att: number | null
          topic_attitude: Json | null
          yt_sec: string | null
        }
        Insert: {
          citations?: string[] | null
          citations_time?: string[] | null
          id?: number
          interruptions?: Json | null
          point_split?: Json | null
          speaker_rating?: Json | null
          start_end_time?: string | null
          statement_id: number
          summary_discussion?: string | null
          summary_tldr?: string | null
          topic?: string | null
          topic_att?: number | null
          topic_attitude?: Json | null
          yt_sec?: string | null
        }
        Update: {
          citations?: string[] | null
          citations_time?: string[] | null
          id?: number
          interruptions?: Json | null
          point_split?: Json | null
          speaker_rating?: Json | null
          start_end_time?: string | null
          statement_id?: number
          summary_discussion?: string | null
          summary_tldr?: string | null
          topic?: string | null
          topic_att?: number | null
          topic_attitude?: Json | null
          yt_sec?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_statement_ai'
            columns: ['statement_id']
            referencedRelation: 'statement'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_statement_ai'
            columns: ['statement_id']
            referencedRelation: 'statement_min'
            referencedColumns: ['statement_id']
          },
        ]
      }
      statement_to_point: {
        Row: {
          id: number
          proceeding_point_ai_id: number
          statement_id: number
        }
        Insert: {
          id?: number
          proceeding_point_ai_id: number
          statement_id: number
        }
        Update: {
          id?: number
          proceeding_point_ai_id?: number
          statement_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'fk_proceeding_point_ai'
            columns: ['proceeding_point_ai_id']
            referencedRelation: 'proceeding_point_ai'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_statement'
            columns: ['statement_id']
            referencedRelation: 'statement'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_statement'
            columns: ['statement_id']
            referencedRelation: 'statement_min'
            referencedColumns: ['statement_id']
          },
        ]
      }
      tag: {
        Row: {
          description: string | null
          id: number
          sub_tag: string
          tag: string
        }
        Insert: {
          description?: string | null
          id?: number
          sub_tag: string
          tag: string
        }
        Update: {
          description?: string | null
          id?: number
          sub_tag?: string
          tag?: string
        }
        Relationships: []
      }
      tag_to_point: {
        Row: {
          id: number
          proceeding_point_ai_id: number
          tag_id: number
        }
        Insert: {
          id?: number
          proceeding_point_ai_id: number
          tag_id: number
        }
        Update: {
          id?: number
          proceeding_point_ai_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'fk_proceeding_point_ai'
            columns: ['proceeding_point_ai_id']
            referencedRelation: 'proceeding_point_ai'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_tag'
            columns: ['tag_id']
            referencedRelation: 'tag'
            referencedColumns: ['id']
          },
        ]
      }
      tag_to_print: {
        Row: {
          id: number
          print_number: string
          tag_id: number
        }
        Insert: {
          id?: number
          print_number: string
          tag_id: number
        }
        Update: {
          id?: number
          print_number?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'fk_tag'
            columns: ['tag_id']
            referencedRelation: 'tag'
            referencedColumns: ['id']
          },
        ]
      }
      tmp_emo: {
        Row: {
          avg_db: number | null
          chunk_end_sec: number
          chunk_start_sec: number
          clap_audio_event: string | null
          emotion_label: string | null
          event_label: string | null
          id: number
          peak_db: number | null
          shouting: boolean | null
        }
        Insert: {
          avg_db?: number | null
          chunk_end_sec: number
          chunk_start_sec: number
          clap_audio_event?: string | null
          emotion_label?: string | null
          event_label?: string | null
          id?: number
          peak_db?: number | null
          shouting?: boolean | null
        }
        Update: {
          avg_db?: number | null
          chunk_end_sec?: number
          chunk_start_sec?: number
          clap_audio_event?: string | null
          emotion_label?: string | null
          event_label?: string | null
          id?: number
          peak_db?: number | null
          shouting?: boolean | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: number
          point_id: number
          user_id: string
          vote_type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          point_id: number
          user_id: string
          vote_type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          point_id?: number
          user_id?: string
          vote_type?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          id: number
          target_id: number
          target_type: string
          user_id: string
          emoji: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          target_id: number
          target_type: string
          user_id: string
          emoji: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          target_id?: number
          target_type?: string
          user_id?: string
          emoji?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_chat_messages_conversation'
            columns: ['conversation_id']
            referencedRelation: 'chat_conversations'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      statement_min: {
        Row: {
          proceeding_day_id: number | null
          proceeding_day_no: number | null
          proceeding_id: number | null
          proceeding_number: number | null
          statement_ai_id: number | null
          statement_id: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              '': string
            }
            Returns: unknown
          }
        | {
            Args: {
              '': unknown
            }
            Returns: unknown
          }
      get_all_process_vote_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          process_id: number
          upvotes: number
          downvotes: number
        }[]
      }
      get_all_vote_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          point_id: number
          upvotes: number
          downvotes: number
        }[]
      }
      get_proceeding_day_details: {
        Args: {
          p_number: number
          p_date: string
        }
        Returns: Json
      }
      get_proceeding_details: {
        Args: {
          p_number: string
          p_date: string
        }
        Returns: Json
      }
      get_process_vote_counts: {
        Args: {
          process_id: number
        }
        Returns: {
          upvotes: number
          downvotes: number
        }[]
      }
      get_reaction_counts: {
        Args: {
          target_id: number
          target_type: string
        }
        Returns: {
          emoji: string
          count: number
        }[]
      }
      get_statements_for_proceeding_point: {
        Args: {
          proceeding_point_id: number
        }
        Returns: {
          speaker_name: string
          summary_tldr: string
          speaker_rating: number
          topic_attitude: string
          citations: string
          yt_sec: number
        }[]
      }
      get_top_post_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_name: string
          category_count: number
        }[]
      }
      get_vote_counts:
        | {
            Args: {
              p_target_type: Database['public']['Enums']['vote_target']
              p_target_ids: number[]
            }
            Returns: {
              target_id: number
              upvotes: number
              downvotes: number
            }[]
          }
        | {
            Args: {
              point_id: number
            }
            Returns: {
              upvotes: number
              downvotes: number
            }[]
          }
      gtrgm_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          '': unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      halfvec_avg: {
        Args: {
          '': number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          '': unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              '': unknown
            }
            Returns: number
          }
        | {
            Args: {
              '': unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              '': string
            }
            Returns: string
          }
        | {
            Args: {
              '': unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              '': unknown
            }
            Returns: unknown
          }
      set_limit: {
        Args: {
          '': number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          '': string
        }
        Returns: string[]
      }
      sparsevec_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          '': unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          '': number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              '': string
            }
            Returns: number
          }
        | {
            Args: {
              '': unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          '': string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          '': string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          '': string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          '': unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      vote_target: 'process' | 'print' | 'person'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey'
            columns: ['upload_id']
            referencedRelation: 's3_multipart_uploads'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
