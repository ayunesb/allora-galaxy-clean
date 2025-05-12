import { HubSpotAdapter } from './HubSpotAdapter';

class HubSpotAdapter {
  // ...existing code...

  async updateContact(contactId: string, properties: any) {
    const previousValues = await this.getContactProperties(contactId, Object.keys(properties));
    const updatedProperties = {
      ...properties,
      previous_value: previousValues?.['mql_count'] ?? undefined,
    };

    // ...existing code...
  }

  // ...existing code...
}

export default HubSpotAdapter;