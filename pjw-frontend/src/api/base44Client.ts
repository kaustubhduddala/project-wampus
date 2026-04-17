import {
  createDelivery,
  getAdvocacyUpdates,
  getDeliveries,
  getSponsors,
  getStoreItems,
  getVolunteerSummary,
} from "./publicApi";

interface BaseEntity {
  id: string;
}

class EntityClient<T extends BaseEntity> {
  private readonly listFn?: () => Promise<T[]>;
  private readonly createFn?: (data: Partial<T>) => Promise<T>;

  constructor(options: { list?: () => Promise<T[]>; create?: (data: Partial<T>) => Promise<T> }) {
    this.listFn = options.list;
    this.createFn = options.create;
  }

  async list(sortBy?: string): Promise<T[]> {
    void sortBy;
    if (!this.listFn) {
      throw new Error("List operation is not available for this entity.");
    }
    return this.listFn();
  }

  async get(id: string): Promise<T | null> {
    void id;
    throw new Error("Get operation is not supported in this compatibility client.");
  }

  async create(data: Partial<T>): Promise<T> {
    if (!this.createFn) {
      throw new Error("Create operation is not available for this entity.");
    }
    return this.createFn(data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    void id;
    void data;
    throw new Error("Update operation is not supported in this compatibility client.");
  }

  async delete(id: string): Promise<void> {
    void id;
    throw new Error("Delete operation is not supported in this compatibility client.");
  }
}

type DeliveryEntity = {
  id: string;
  lat: number;
  lng: number;
  notes?: string;
  items?: string[];
};

type VolunteerSummaryEntity = {
  id: string;
  active_volunteers: number;
  total_hours_logged: number;
  entry_count: number;
};

const authClient = {
  redirectToLogin() {
    window.location.assign("/home");
  },
  logout() {
    window.location.assign("/home");
  },
};

export const base44 = {
  entities: {
    AdvocacyUpdate: new EntityClient({ list: getAdvocacyUpdates as () => Promise<BaseEntity[]> }),
    Delivery: new EntityClient<DeliveryEntity>({
      list: getDeliveries as () => Promise<DeliveryEntity[]>,
      create: async (data) => {
        const lat = Number(data.lat);
        const lng = Number(data.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          throw new Error("lat and lng are required for delivery creation.");
        }

        return createDelivery({
          lat,
          lng,
          notes: typeof data.notes === "string" ? data.notes : undefined,
          items: Array.isArray(data.items) ? data.items.map(String) : undefined,
        }) as Promise<DeliveryEntity>;
      },
    }),
    Donation: new EntityClient({ list: async () => [] }),
    MerchandiseItem: new EntityClient({ list: getStoreItems as () => Promise<BaseEntity[]> }),
    Sponsors: new EntityClient({ list: getSponsors as () => Promise<BaseEntity[]> }),
    Sponsor: new EntityClient({ list: getSponsors as () => Promise<BaseEntity[]> }),
    Volunteer: new EntityClient<VolunteerSummaryEntity>({
      list: async () => {
        const summary = await getVolunteerSummary();
        return [{ id: "summary", ...summary }];
      },
    }),
  },
  auth: authClient,
  integrations: {
    Core: {
      async UploadFile(): Promise<{ file_url: string }> {
        throw new Error("UploadFile is not available in the current backend API.");
      },
    },
  },
};
