import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SupabaseService {
  constructor(private configService: ConfigService) {}

  /**
   * Get Supabase client
   * @returns Supabase client
   */
  getClient() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or key not provided');
    }

    return createClient(supabaseUrl, supabaseKey);
  }
}
