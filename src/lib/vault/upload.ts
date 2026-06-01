import { createClient } from '@/lib/supabase/client';

/**
 * Încărcarea fișierelor în Private Cloud Vault.
 */
export async function uploadToVault(file: File, userId: string, campaignId: string) {
  const supabase = createClient();
  const filePath = `${userId}/${campaignId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from('vault')
    .upload(filePath, file);

  if (error) throw error;
  return data;
}
