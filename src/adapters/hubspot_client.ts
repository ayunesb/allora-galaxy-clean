
/**
 * HubSpot client for interacting with the HubSpot API
 */
export interface HubSpotContact {
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    phone?: string;
    company?: string;
    website?: string;
    mql_count?: number;
    previous_value?: number;
    [key: string]: any;
  };
}

export class HubSpotClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.hubapi.com';
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      const url = `${this.baseUrl}/crm/v3/objects/contacts/search`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email
                }
              ]
            }
          ],
          properties: ['email', 'firstname', 'lastname', 'mql_count']
        })
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results[0] || null;
    } catch (error) {
      console.error('Error fetching contact from HubSpot:', error);
      return null;
    }
  }

  /**
   * Create or update a contact
   */
  async createOrUpdateContact(contact: HubSpotContact): Promise<any> {
    try {
      const email = contact.properties.email;
      const existingContact = await this.getContactByEmail(email);
      
      let url;
      let method;
      
      if (existingContact) {
        url = `${this.baseUrl}/crm/v3/objects/contacts/${existingContact.id}`;
        method = 'PATCH';
      } else {
        url = `${this.baseUrl}/crm/v3/objects/contacts`;
        method = 'POST';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          properties: contact.properties
        })
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating/updating contact in HubSpot:', error);
      throw error;
    }
  }
}
