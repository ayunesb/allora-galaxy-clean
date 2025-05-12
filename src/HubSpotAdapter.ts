
import { HubSpotClient } from './adapters/hubspot_client';
import { Logger } from './adapters/logger';

class HubSpotAdapter {
  private client: HubSpotClient;
  private logger: Logger;

  constructor(client: HubSpotClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  async updateContact(contactId: string, properties: any) {
    try {
      const previousValues = await this.client.getContactByEmail(contactId);
      const updatedProperties = {
        ...properties,
        previous_value: previousValues?.properties?.mql_count ?? undefined,
      };

      // Code to update contact would go here
      return updatedProperties;
    } catch (error) {
      this.logger.error('Error updating contact', error);
      throw error;
    }
  }
}

export default HubSpotAdapter;
