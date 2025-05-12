
import { getEnvWithDefault } from '@/lib/env';

interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    lifecyclestage?: string;
    hs_lead_status?: string;
    [key: string]: any;
  };
}

interface HubSpotDeals {
  id: string;
  properties: {
    dealname: string;
    amount?: string;
    closedate?: string;
    dealstage?: string;
    pipeline?: string;
    [key: string]: any;
  };
}

/**
 * Adapter for HubSpot API integration
 */
export class HubspotAdapter {
  private apiKey: string;
  private baseUrl: string = 'https://api.hubapi.com';

  constructor(apiKey?: string) {
    // Use provided API key or get it from environment variables
    this.apiKey = apiKey || getEnvWithDefault('HUBSPOT_API_KEY', '');
    
    if (!this.apiKey) {
      console.warn('HubSpot API key not found. Some functionality may be limited.');
    }
  }

  /**
   * Fetch MQLs (Marketing Qualified Leads) from HubSpot
   */
  async fetchMQLs(limit: number = 100): Promise<HubSpotContact[]> {
    if (!this.apiKey) {
      throw new Error('HubSpot API key is required to fetch MQLs');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/crm/v3/objects/contacts/search`, 
        {
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
                    propertyName: 'lifecyclestage',
                    operator: 'EQ',
                    value: 'marketingqualifiedlead'
                  }
                ]
              }
            ],
            properties: ['email', 'firstname', 'lastname', 'company', 'lifecyclestage', 'hs_lead_status'],
            limit: limit
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HubSpot API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data.results as HubSpotContact[];
    } catch (error) {
      console.error('Error fetching MQLs from HubSpot:', error);
      throw error;
    }
  }

  /**
   * Create or update contact in HubSpot
   */
  async upsertContact(contact: { email: string; [key: string]: any }): Promise<HubSpotContact> {
    if (!this.apiKey) {
      throw new Error('HubSpot API key is required to upsert contacts');
    }

    if (!contact.email) {
      throw new Error('Email is required for contact creation/update');
    }

    try {
      // First check if contact exists
      const searchResponse = await fetch(
        `${this.baseUrl}/crm/v3/objects/contacts/search`, 
        {
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
                    value: contact.email
                  }
                ]
              }
            ],
            properties: ['email']
          })
        }
      );

      const searchData = await searchResponse.json();
      
      if (searchData.total > 0) {
        // Update existing contact
        const contactId = searchData.results[0].id;
        const updateResponse = await fetch(
          `${this.baseUrl}/crm/v3/objects/contacts/${contactId}`, 
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              properties: this.formatContactProperties(contact)
            })
          }
        );

        if (!updateResponse.ok) {
          throw new Error(`Failed to update contact: ${updateResponse.statusText}`);
        }

        return await updateResponse.json();
      } else {
        // Create new contact
        const createResponse = await fetch(
          `${this.baseUrl}/crm/v3/objects/contacts`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              properties: this.formatContactProperties(contact)
            })
          }
        );

        if (!createResponse.ok) {
          throw new Error(`Failed to create contact: ${createResponse.statusText}`);
        }

        return await createResponse.json();
      }
    } catch (error) {
      console.error('Error upserting contact in HubSpot:', error);
      throw error;
    }
  }

  /**
   * Format contact properties for HubSpot API
   */
  private formatContactProperties(contact: Record<string, any>): Record<string, any> {
    const { email, ...otherProps } = contact;
    
    // Map common property names to HubSpot properties
    const properties: Record<string, any> = {
      email,
      ...(contact.firstName && { firstname: contact.firstName }),
      ...(contact.lastName && { lastname: contact.lastName }),
      ...(contact.name && !contact.firstName && { firstname: contact.name.split(' ')[0] }),
      ...(contact.name && !contact.lastName && { lastname: contact.name.split(' ').slice(1).join(' ') }),
      ...otherProps
    };
    
    return properties;
  }
}

export default HubspotAdapter;
