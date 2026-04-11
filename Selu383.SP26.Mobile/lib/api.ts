export type UserDto = {
  id: number;
  userName: string;
  pridePoints?: number;
  roles: string[];
};

export type LoginDto = {
  userName: string;
  password: string;
};

export type LocationDto = {
  id: number;
  name: string;
  address: string;
  tableCount: number;
  managerId?: number | null;
};

export type MenuItemDto = {
  id: number;
  itemName: string;
  type: string;
  featured: boolean;
  price: number;
  description: string;
  nutrition: string;
};

export type OrderItemDto = {
  menuItemId?: number;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
};

export type CreateOrderDto = {
  locationId: number;
  pickupType: 'In Store' | 'Drive Through';
  paymentMethod: string;
  total: number;
  items: OrderItemDto[];
};

export type OrderHistoryDto = {
  id: number;
  orderedAt: string;
  total: number;
  items: OrderItemDto[];
};

type RequestOptions = RequestInit & {
  allowNotFound?: boolean;
};

const defaultApiBaseUrl = 'http://10.0.2.2:5169';

export function getApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  return configured && configured.length > 0 ? configured : defaultApiBaseUrl;
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    if (options.allowNotFound && response.status === 404) {
      return null as T;
    }

    let message = `Request failed (${response.status})`;
    try {
      const text = await response.text();
      if (text) {
        message = text;
      }
    } catch {
      // Ignore parse errors and keep fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return null as T;
  }

  return (await response.json()) as T;
}

export const authenticationApi = {
  me: () => request<UserDto | null>('/api/authentication/me', { allowNotFound: true }),
  login: (payload: LoginDto) =>
    request<UserDto>('/api/authentication/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request<void>('/api/authentication/logout', {
      method: 'POST',
    }),
};

export const usersApi = {
  getById: (id: number) => request<UserDto>(`/api/users/${id}`),
};

export const locationsApi = {
  list: () => request<LocationDto[]>('/api/locations'),
};

export const menuItemsApi = {
  list: () => request<MenuItemDto[]>('/api/menuitems'),
};

export const ordersApi = {
  history: () => request<OrderHistoryDto[]>('/api/orders/history'),
  create: (payload: CreateOrderDto) =>
    request<void>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
