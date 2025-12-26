import { supabase } from './supabase';

export const BUCKET_NAME = 'content-files';

export const storageService = {
    async uploadFile(file: File, path: string): Promise<{ path: string; error: any }> {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        return { path: data?.path || '', error };
    },

    async deleteFile(path: string): Promise<{ error: any }> {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([path]);
        return { error };
    },

    getPublicUrl(path: string): string {
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);
        return data.publicUrl;
    },

    // For premium content that shouldn't be publicly accessible directly
    // though currently we are using public bucket for simplicity as per migration
    // but keeping this for future use if we switch to private bucket
    async getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Error getting signed URL:', error);
            return null;
        }
        return data.signedUrl;
    }
};
