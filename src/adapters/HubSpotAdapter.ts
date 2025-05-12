import { HubSpotClient } from './hubspot_client';
import { Logger } from './logger';

interface HubSpotContact {
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    company: string;
    website: string;
    mql_count?: number;
    [key: string]: any;
  };
}

export class HubSpotAdapter {
  private client: HubSpotClient;
  private logger: Logger;

  constructor(client: HubSpotClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  async createOrUpdateContact(contact: HubSpotContact): Promise<void> {
    try {
      const previousValues = await this.client.getContactByEmail(contact.properties.email);
      const updatedContact = {
        properties: {
          ...contact.properties,
          previous_value: previousValues?.properties?.mql_count ?? undefined,
        },
      };
      await this.client.createOrUpdateContact(updatedContact);
    } catch (error) {
      this.logger.error('Error creating or updating contact', error);
      throw error;
    }
  }
}
