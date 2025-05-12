
/**
 * HubSpot client for interacting with HubSpot API
 */
export interface HubSpotClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export class HubSpotClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: HubSpotClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.hubapi.com';
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<Record<string, any>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'email',
                    operator: 'EQ',
                    value: email,
                  },
                ],
              },
            ],
            properties: ['email', 'firstname', 'lastname', 'mql_count'],
            limit: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contact: ${response.status}`);
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].properties || {};
      }

      return {};
    } catch (error) {
      console.error('Error fetching contact by email:', error);
      throw error;
    }
  }

  /**
   * Create or update contact
   */
  async createOrUpdateContact(contact: any): Promise<void> {
    try {
      const { email } = contact.properties;
      if (!email) {
        throw new Error('Email is required for contact operations');
      }

      // First check if contact exists
      const existingContact = await this.getContactByEmail(email);
      
      let response;
      if (Object.keys(existingContact).length > 0) {
        // Update existing contact
        response = await fetch(
          `${this.baseUrl}/crm/v3/objects/contacts/${existingContact.id || ''}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ properties: contact.properties }),
          }
        );
      } else {
        // Create new contact
        response = await fetch(
          `${this.baseUrl}/crm/v3/objects/contacts`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ properties: contact.properties }),
          }
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to create/update contact: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating or updating contact:', error);
      throw error;
    }
  }
}
