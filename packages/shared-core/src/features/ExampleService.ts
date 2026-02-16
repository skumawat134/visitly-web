import { getApiClient } from '@visitly/api-client';
// import { useQuery } from '@tanstack/react-query';

/**
 * Shared business logic for authentication-related operations
 */
export const AuthService = {
    /**
     * Example method that uses the shared api-client
     */
    async getCurrentUser() {
        try {
            const api = getApiClient();
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    },

    /**
     * Logic to determine if a user has specific permissions
     */
    hasPermission(user: any, permission: string): boolean {
        return user?.permissions?.includes(permission) ?? false;
    }
};
