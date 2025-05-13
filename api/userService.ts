import ApiClient from './apiClient';

interface User {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'dispatcher' | 'driver' | 'accountant' | 'user';
  isActive: boolean;
  lastLogin?: string;
  phone?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserPermission {
  userId: string;
  module: string;
  actions: string[];
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class UserService {
  static baseEndpoint = 'users';

  static async getAllUsers(): Promise<User[]> {
    return ApiClient.get(this.baseEndpoint);
  }

  static async getUserById(id: string): Promise<User> {
    return ApiClient.get(`${this.baseEndpoint}/${id}`);
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
    return ApiClient.post(this.baseEndpoint, userData);
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return ApiClient.put(`${this.baseEndpoint}/${id}`, userData);
  }

  static async deleteUser(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  static async activateUser(id: string): Promise<User> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/activate`, {});
  }

  static async deactivateUser(id: string): Promise<User> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/deactivate`, {});
  }

  static async changeUserRole(id: string, role: User['role']): Promise<User> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/role`, { role });
  }

  static async changePassword(id: string, passwordData: PasswordChange): Promise<{ success: boolean }> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/password`, passwordData);
  }

  static async resetPassword(email: string): Promise<{ success: boolean }> {
    return ApiClient.post(`${this.baseEndpoint}/reset-password`, { email });
  }

  static async uploadProfileImage(id: string, imageFile: File): Promise<{ imageUrl: string }> {
    return ApiClient.uploadFile(`${this.baseEndpoint}/${id}/profile-image`, imageFile, 'image');
  }

  // Zarządzanie uprawnieniami
  static async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return ApiClient.get(`${this.baseEndpoint}/${userId}/permissions`);
  }

  static async updateUserPermissions(userId: string, permissions: Omit<UserPermission, 'userId'>[]): Promise<UserPermission[]> {
    return ApiClient.put(`${this.baseEndpoint}/${userId}/permissions`, { permissions });
  }

  static async getCurrentUser(): Promise<User> {
    return ApiClient.get(`${this.baseEndpoint}/me`);
  }
  
  static async getUserActivity(userId: string): Promise<{
    activityType: string;
    description: string;
    timestamp: string;
    ipAddress?: string;
  }[]> {
    return ApiClient.get(`${this.baseEndpoint}/${userId}/activity`);
  }
}

export default UserService;