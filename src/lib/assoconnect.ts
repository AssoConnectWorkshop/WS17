import "server-only";

const BASE_URL = "https://app.assoconnect.com/api/v1";

export type Organization = {
  "@id": string;
  "@type": string;
  brand: string;
  isAdvanced: boolean;
  isLegalIndependent: boolean;
  logoUrl: string;
  name: string;
  parent: string | null;
  phoneNumber: string;
  url: string;
};

async function request<T>(path: string): Promise<T> {
  const token = process.env.ASSOCONNECT_API_KEY;
  if (!token) throw new Error("ASSOCONNECT_API_KEY is not set");

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: "application/ld+json",
      "X-AUTH-TOKEN": token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`AssoConnect ${path} failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export function getOrganization(ulid = process.env.ASSOCONNECT_ORGANIZATION_ULID) {
  if (!ulid) throw new Error("ASSOCONNECT_ORGANIZATION_ULID is not set");
  return request<Organization>(`/organizations/${ulid}`);
}

export type Contact = {
  "@id": string;
  "@type": string;
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  membershipDate?: string;
  status?: string;
};

export type ContactsResponse = {
  "@context": string;
  "@id": string;
  "@type": string;
  "hydra:member": Contact[];
  "hydra:totalItems": number;
  "hydra:view": {
    "@id": string;
    "@type": string;
    "hydra:first": string;
    "hydra:next"?: string;
  };
};

export async function getContacts(
  ulid = process.env.ASSOCONNECT_ORGANIZATION_ULID,
  page = 1
): Promise<ContactsResponse> {
  if (!ulid) throw new Error("ASSOCONNECT_ORGANIZATION_ULID is not set");
  return request<ContactsResponse>(`/organizations/${ulid}/contacts?page=${page}&itemsPerPage=100`);
}

export async function getAllContacts(
  ulid = process.env.ASSOCONNECT_ORGANIZATION_ULID
): Promise<Contact[]> {
  if (!ulid) throw new Error("ASSOCONNECT_ORGANIZATION_ULID is not set");

  const allContacts: Contact[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getContacts(ulid, page);
    allContacts.push(...response["hydra:member"]);

    if (!response["hydra:view"]["hydra:next"]) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return allContacts;
}

export async function getMembershipStats(
  ulid = process.env.ASSOCONNECT_ORGANIZATION_ULID,
  periodFrom?: string,
  periodTo?: string
): Promise<{ total: number; active: number; new: number; inactive: number }> {
  const contacts = await getAllContacts(ulid);

  const total = contacts.length;
  let active = 0;
  let newMembers = 0;

  if (periodFrom) {
    const fromDate = new Date(periodFrom);
    const toDate = periodTo ? new Date(periodTo) : new Date();

    contacts.forEach((contact) => {
      if (contact.membershipDate) {
        const memberDate = new Date(contact.membershipDate);
        if (memberDate >= fromDate && memberDate <= toDate) {
          newMembers++;
        }
        if (memberDate <= toDate) {
          active++;
        }
      }
    });
  } else {
    active = contacts.filter((c) => !c.status || c.status !== "inactive").length;
  }

  return {
    total,
    active,
    new: newMembers,
    inactive: Math.max(0, total - active),
  };
}
