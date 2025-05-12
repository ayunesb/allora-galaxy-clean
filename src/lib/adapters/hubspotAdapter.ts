
import { supabase } from '@/integrations/supabase/client';
import { ENV } from '@/lib/env';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Interface for HubSpot contact
interface HubspotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email: string;
    company?: string;
    hs_lead_status?: string;
    lifecyclestage?: string;
    hubspot_score?: string;
    lastmodifieddate?: string;
    createdate?: string;
    [key: string]: any;
  }
}

// Interface for a formatted lead
interface FormattedLead {
  id?: string;
  name: string;
  email: string;
  company?: string;
  source: string;
  status: string;
  score?: number;
  last_activity?: string;
  metadata: {
    hubspot_id?: string;
    lifecycle_stage?: string;
    [key: string]: any;
  }
}

// Get HubSpot API key from environment variables
const HUBSPOT_API_KEY = ENV('HUBSPOT_API_KEY', '');

// Check if the HubSpot integration is configured
export const isHubspotConfigured = (): boolean => {
  return !!HUBSPOT_API_KEY;
};

/**
 * Fetch contacts from HubSpot API
 */
export const fetchHubspotContacts = async (limit = 100): Promise<HubspotContact[]> => {
  if (!isHubspotConfigured()) {
    throw new Error('HubSpot API key not configured');
  }

  try {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((contact: any) => ({
      id: contact.id,
      properties: contact.properties
    }));
  } catch (error) {
    console.error('Error fetching HubSpot contacts:', error);
    throw error;
  }
}

/**
 * Format HubSpot contacts as leads
 */
export const formatHubspotContactsAsLeads = (contacts: HubspotContact[]): FormattedLead[] => {
  return contacts.map(contact => {
    const { properties } = contact;
    
    // Build the name from firstname and lastname
    const name = [properties.firstname, properties.lastname]
      .filter(Boolean)
      .join(' ') || 'Unknown';
    
    // Convert HubSpot score to number
    const scoreAsNumber = properties.hubspot_score 
      ? parseInt(properties.hubspot_score, 10) 
      : undefined;
    
    return {
      name,
      email: properties.email,
      company: properties.company,
      source: 'hubspot',
      status: properties.hs_lead_status || 'new',
      score: scoreAsNumber,
      last_activity: properties.lastmodifieddate,
      metadata: {
        hubspot_id: contact.id,
        lifecycle_stage: properties.lifecyclestage,
        created_date: properties.createdate
      }
    };
  });
}

/**
 * Sync MQLs from HubSpot to our database
 */
export const syncHubspotMQLs = async (tenantId: string): Promise<{ success: boolean; added: number; updated: number; errors: number }> => {
  if (!isHubspotConfigured()) {
    return { success: false, added: 0, updated: 0, errors: 1 };
  }

  try {
    // Log the start of the sync process
    await logSystemEvent('hubspot', 'info', {
      description: 'Starting HubSpot MQL sync',
      tenant_id: tenantId
    }, tenantId);
    
    // Fetch HubSpot contacts
    const contacts = await fetchHubspotContacts();
    
    // Filter for MQLs (marketing qualified leads)
    const mqlContacts = contacts.filter(
      contact => contact.properties.lifecyclestage === 'marketingqualifiedlead'
    );
    
    // Format MQLs as leads
    const leads = formatHubspotContactsAsLeads(mqlContacts);
    
    // Initialize counters
    let added = 0;
    let updated = 0;
    let errors = 0;
    
    // Process each lead
    for (const lead of leads) {
      try {
        // Check if lead already exists by HubSpot ID
        const { data: existingLeads } = await supabase
          .from('leads')
          .select('id, metadata')
          .eq('tenant_id', tenantId)
          .eq('email', lead.email)
          .single();
        
        if (existingLeads) {
          // Update existing lead
          const { error: updateError } = await supabase
            .from('leads')
            .update({
              name: lead.name,
              company: lead.company,
              status: lead.status,
              score: lead.score || 0,
              last_activity: lead.last_activity,
              metadata: {
                ...existingLeads.metadata,
                ...lead.metadata
              }
            })
            .eq('id', existingLeads.id);
            
          if (updateError) {
            throw updateError;
          }
          
          updated++;
        } else {
          // Insert new lead
          const { error: insertError } = await supabase
            .from('leads')
            .insert({
              ...lead,
              tenant_id: tenantId
            });
            
          if (insertError) {
            throw insertError;
          }
          
          added++;
        }
      } catch (error) {
        console.error('Error processing lead:', error);
        errors++;
      }
    }
    
    // Log the completion of the sync process
    await logSystemEvent('hubspot', 'info', {
      description: 'Completed HubSpot MQL sync',
      added,
      updated,
      errors,
      tenant_id: tenantId
    }, tenantId);
    
    return {
      success: true,
      added,
      updated,
      errors
    };
  } catch (error) {
    console.error('Error syncing HubSpot MQLs:', error);
    
    // Log the error
    await logSystemEvent('hubspot', 'error', {
      description: 'Error syncing HubSpot MQLs',
      error: String(error),
      tenant_id: tenantId
    }, tenantId);
    
    return {
      success: false,
      added: 0,
      updated: 0,
      errors: 1
    };
  }
}
