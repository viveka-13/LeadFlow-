import axios from 'axios';
import { Lead } from '../types';

export class MetaService {
  private static readonly GRAPH_API_URL = 'https://graph.facebook.com/v19.0';

  /**
   * Fetches lead details from Meta Graph API using the leadgen_id
   */
  static async fetchLeadDetails(leadgenId: string): Promise<Lead | null> {
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (!accessToken || accessToken === 'your_meta_page_access_token') {
      console.warn('[Meta] META_ACCESS_TOKEN not configured properly. Skipping actual fetch.');
      // For local testing without real credentials, return a mock or throw an error.
      // We will throw an error to simulate real behavior if no token is provided.
      // But for testing with the Lead Testing Tool, we might want to return mock data if not properly configured.
      return null;
    }

    try {
      console.log(`[Meta] Fetching lead: ${leadgenId}`);
      const response = await axios.get(`${this.GRAPH_API_URL}/${leadgenId}`, {
        params: {
          access_token: accessToken,
        },
      });

      const data = response.data;
      
      // Meta returns field_data as an array of {name, values[]}
      let email = '';
      let phone = '';
      let name = 'Unknown Lead';

      if (data.field_data && Array.isArray(data.field_data)) {
        for (const field of data.field_data) {
          const value = field.values && field.values[0] ? field.values[0] : '';
          if (field.name === 'email') email = value;
          if (field.name === 'phone_number') phone = value;
          if (field.name === 'full_name' || field.name === 'first_name') name = value;
        }
      }

      return {
        id: data.id,
        name,
        email,
        phone,
        createdAt: data.created_time || new Date().toISOString(),
        source: 'meta'
      };
    } catch (error: any) {
      console.error(`[Meta] Error fetching lead ${leadgenId}:`, error.response?.data || error.message);
      return null;
    }
  }
}
