
/**
 * HubSpot API adapter for integrating with HubSpot CRM
 */

// Types for HubSpot API responses
export interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    phone?: string;
    lifecycle_stage?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// Types for internal use
interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain?: string;
    industry?: string;
    [key: string]: any;
  };
}

/**
 * Fetch contacts from HubSpot
 * @param apiKey HubSpot API key
 * @param limit Maximum number of contacts to retrieve
 * @returns Array of contacts
 */
export async function fetchHubspotContacts(apiKey: string, limit: number = 100): Promise<HubSpotContact[]> {
  try {
    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HubSpot API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error: any) {
    console.error('Error fetching HubSpot contacts:', error);
    throw error;
  }
}

/**
 * Create a new contact in HubSpot
 * @param apiKey HubSpot API key
 * @param contactData Contact properties
 * @returns Created contact
 */
export async function createHubspotContact(
  apiKey: string, 
  contactData: { 
    email: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    [key: string]: any;
  }
): Promise<HubSpotContact> {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: contactData
      })
    });
    
    if (!response.ok) {
      throw new Error(`HubSpot API Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error creating HubSpot contact:', error);
    throw error;
  }
}

/**
 * Sync leads from application database to HubSpot
 * @param apiKey HubSpot API key
 * @param leads Application leads
 * @returns Results of the sync operation
 */
export async function syncLeadsToHubspot(
  apiKey: string, 
  leads: Array<{
    email: string;
    name?: string;
    company?: string;
    score?: number;
    created_at: string;
    [key: string]: any;
  }>
): Promise<{ success: boolean; synced: number; failed: number; errors: any[] }> {
  const errors: any[] = [];
  let synced = 0;
  let failed = 0;
  
  try {
    // Process each lead
    for (const lead of leads) {
      try {
        // Map lead data to HubSpot contact properties
        const contactData = {
          email: lead.email,
          firstname: lead.name?.split(' ')[0],
          lastname: lead.name?.split(' ').slice(1).join(' '),
          company: lead.company,
          lead_score: lead.score?.toString(),
          lead_source: 'Allora OS App',
          lead_created_date: lead.created_at
        };
        
        await createHubspotContact(apiKey, contactData);
        synced++;
      } catch (error) {
        failed++;
        errors.push({ lead: lead.email, error });
      }
    }
    
    return {
      success: failed === 0,
      synced,
      failed,
      errors
    };
  } catch (error) {
    console.error('Error syncing leads to HubSpot:', error);
    throw error;
  }
}
