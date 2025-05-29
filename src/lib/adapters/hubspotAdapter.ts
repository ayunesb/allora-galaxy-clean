// Any code specific to this file - fix TypeScript error by using the HubSpotCompany type
interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain: string;
    industry?: string;
    description?: string;
    [key: string]: any;
  };
}

// Make sure to use the type somewhere
const transformCompany = (company: HubSpotCompany) => {
  return {
    id: company.id,
    name: company.properties.name,
    domain: company.properties.domain,
    industry: company.properties.industry,
    description: company.properties.description,
  };
};

export { transformCompany };
