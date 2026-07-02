import api from '@lib/axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { mockPaginated, mockSuccess, mockDelay, mockError, nextMockId } from '@mocks/mockClient';
import { SEED_USERS, SEED_ROLES } from '@mocks/seedData';

let mockUsersStore = [...SEED_USERS];

function roleByName(name) {
  return SEED_ROLES.find((r) => r.name === name);
}

/**
 * Real backend contract (see backend/app/api/v1/routes/users.py):
 *   GET    /users/?search=&status=&page=&page_size=  -> paginated UserRead[]
 *   GET    /users/{id}                                 -> UserRead
 *   POST   /users/                                      -> UserRead (201)
 *   PUT    /users/{id}                                   -> UserRead
 *   PUT    /users/{id}/role                               -> UserRead
 *   PUT    /users/{id}/status                              -> UserRead
 *   DELETE /users/{id}                                      -> UserRead (suspend, not hard delete)
 */
export const usersApi = {
  async list({ search, status, page = 1, pageSize = 20 } = {}) {
    if (env.useMockApi) {
      let filtered = mockUsersStore;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      if (status) {
        filtered = filtered.filter((u) => u.status === status);
      }
      return mockPaginated(filtered, { page, pageSize });
    }
    return api.get(API_ENDPOINTS.USERS.LIST, { params: { search, status, page, page_size: pageSize } });
  },

  async getById(id) {
    if (env.useMockApi) {
      await mockDelay();
      const user = mockUsersStore.find((u) => u.id === id);
      if (!user) mockError('User not found', { status: 404, code: 'NOT_FOUND' });
      return mockSuccess(user);
    }
    return api.get(API_ENDPOINTS.USERS.BY_ID(id));
  },

  async invite({ name, email, role, phone }) {
    if (env.useMockApi) {
      await mockDelay(600);
      if (mockUsersStore.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        mockError(`A user with email ${email} already exists`, { status: 409, code: 'DUPLICATE_RESOURCE' });
      }
      const newUser = {
        id: nextMockId('usr'),
        name,
        email,
        phone: phone || null,
        avatar_url: null,
        status: 'pending',
        is_email_verified: false,
        last_active_at: null,
        created_at: new Date().toISOString(),
        role: roleByName(role),
      };
      mockUsersStore = [newUser, ...mockUsersStore];
      return mockSuccess(newUser);
    }
    return api.post(API_ENDPOINTS.USERS.LIST, { name, email, role, phone });
  },

  async update(id, payload) {
    if (env.useMockApi) {
      await mockDelay();
      mockUsersStore = mockUsersStore.map((u) => (u.id === id ? { ...u, ...payload } : u));
      return mockSuccess(mockUsersStore.find((u) => u.id === id));
    }
    return api.put(API_ENDPOINTS.USERS.BY_ID(id), payload);
  },

  async updateRole(id, role) {
    if (env.useMockApi) {
      await mockDelay();
      mockUsersStore = mockUsersStore.map((u) => (u.id === id ? { ...u, role: roleByName(role) } : u));
      return mockSuccess(mockUsersStore.find((u) => u.id === id));
    }
    return api.put(API_ENDPOINTS.USERS.ROLE(id), { role });
  },

  async updateStatus(id, status) {
    if (env.useMockApi) {
      await mockDelay();
      mockUsersStore = mockUsersStore.map((u) => (u.id === id ? { ...u, status } : u));
      return mockSuccess(mockUsersStore.find((u) => u.id === id));
    }
    return api.put(API_ENDPOINTS.USERS.STATUS(id), { status });
  },

  async deactivate(id) {
    if (env.useMockApi) {
      await mockDelay();
      mockUsersStore = mockUsersStore.map((u) => (u.id === id ? { ...u, status: 'suspended' } : u));
      return mockSuccess(mockUsersStore.find((u) => u.id === id));
    }
    return api.delete(API_ENDPOINTS.USERS.BY_ID(id));
  },
};
