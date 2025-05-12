
/**
 * HubSpot API adapter for integrating with HubSpot services
 */
export class HubSpotAdapter {
  private apiKey: string;
  private baseUrl: string = 'https://api.hubapi.com';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Fetch contacts from HubSpot
  async getContacts() {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/v1/lists/all/contacts/all`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error);
      throw error;
    }
  }
  
  // Convert null to undefined for API parameters
  private nullToUndefined<T>(value: T | null): T | undefined {
    return value === null ? undefined : value;
  }
  
  // Process contact data to ensure nulls are converted to undefined
  processContactData(contact: any) {
    return {
      id: contact.id,
      firstName: this.nullToUndefined(contact.firstName),
      lastName: this.nullToUndefined(contact.lastName),
      email: contact.email,
      phone: this.nullToUndefined(contact.phone),
      company: this.nullToUndefined(contact.company),
      createdAt: contact.createdAt,
      // Convert all other null values to undefined
      properties: Object.entries(contact.properties || {}).reduce((acc: Record<string, any>, [key, value]: [string, any]) => {
        acc[key] = this.nullToUndefined(value);
        return acc;
      }, {})
    };
  }
}

export default HubSpotAdapter;
