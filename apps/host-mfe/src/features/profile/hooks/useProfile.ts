import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getUserProfile, updateProfilePicture } from '../api/profile.api';
// import { toast } from 'react-hot-toast';

export const useProfile = () => {
    const queryClient = useQueryClient();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data: profile, isLoading, refetch } = useQuery({
        queryKey: ['userProfile'],
        queryFn: getUserProfile,
    });

    const updatePicMutation = useMutation({
        mutationFn: ({ userId, base64 }: { userId: string; base64: string }) =>
            updateProfilePicture(userId, { avatarImageBase64String: base64 }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            setPreviewImage(null);
            if (variables.base64 === '') {
                // toast.success('Profile photo deleted successfully.');
            } else {
                // toast.success('User profile updated successfully.');
            }
            setIsDeleteModalOpen(false);
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'We have encountered an error updating your profile.';
            // toast.error(errorMessage);
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedExtensions = ['jpeg', 'jpg', 'png'];
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!extension || !allowedExtensions.includes(extension)) {
            // toast.error('Please select valid Image (JPEG, JPG, PNG).');
            return;
        }

        if (file.size > maxSize) {
            // toast.error('The Image size must be less than 5 MB.');
            return;
        }

        // Base64 conversion
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setPreviewImage(result);
            const base64 = result.split(',')[1];
            if (profile?.id) {
                updatePicMutation.mutate({ userId: profile.id, base64 });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteImage = () => {
        if (profile?.id) {
            updatePicMutation.mutate({ userId: profile.id, base64: '' });
        }
    };

    return {
        profile,
        isLoading,
        refetch,
        handleImageChange,
        handleDeleteImage,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        previewImage,
        isUpdating: updatePicMutation.isPending
    };
};
