export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          rules: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: never[]
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          broker: string | null
          starting_balance: number | null
          currency: string | null
          is_default: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          broker?: string | null
          starting_balance?: number | null
          currency?: string | null
          is_default?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          broker?: string | null
          starting_balance?: number | null
          currency?: string | null
          is_default?: boolean | null
          created_at?: string
        }
        Relationships: never[]
      }
      strategies: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          description: string | null
          rules: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          description?: string | null
          rules?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          description?: string | null
          rules?: Json | null
          created_at?: string
        }
        Relationships: never[]
      }
      trades: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          strategy_id: string | null
          symbol: string | null
          trade_date: string
          direction: string | null
          entry_price: number | null
          exit_price: number | null
          position_size: number | null
          stop_loss: number | null
          take_profit: number | null
          fees: number | null
          pnl: number | null
          pnl_pips: number | null
          notes: string | null
          followed_rules: boolean | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          strategy_id?: string | null
          symbol?: string | null
          trade_date: string
          direction?: string | null
          entry_price?: number | null
          exit_price?: number | null
          position_size?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          fees?: number | null
          pnl?: number | null
          pnl_pips?: number | null
          notes?: string | null
          followed_rules?: boolean | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          strategy_id?: string | null
          symbol?: string | null
          trade_date?: string
          direction?: string | null
          entry_price?: number | null
          exit_price?: number | null
          position_size?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          fees?: number | null
          pnl?: number | null
          pnl_pips?: number | null
          notes?: string | null
          followed_rules?: boolean | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: never[]
      }
      trade_images: {
        Row: {
          id: string
          trade_id: string
          user_id: string
          storage_path: string
          url: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trade_id: string
          user_id: string
          storage_path: string
          url: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trade_id?: string
          user_id?: string
          storage_path?: string
          url?: string
          caption?: string | null
          created_at?: string
        }
        Relationships: never[]
      }
      sticky_notes: {
        Row: {
          id: string
          user_id: string
          content: string | null
          x: number
          y: number
          width: number
          height: number
          rotation: number
          color: string | null
          transparent: boolean
          z_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          x?: number
          y?: number
          width?: number
          height?: number
          rotation?: number
          color?: string | null
          transparent?: boolean
          z_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          x?: number
          y?: number
          width?: number
          height?: number
          rotation?: number
          color?: string | null
          transparent?: boolean
          z_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: never[]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
