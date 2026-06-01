import { createClient } from '@/lib/supabase/server';

/**
 * Generează un URL semnat pentru accesul la fișierele din Storage.
 * În MAILMIND V4, fișierele sunt organizate sub path-ul: {userId}/{campaignId}/{fileName}
 */
export async function getSignedUrl(userId: string, filePath: string, expiresIn: number = 3600) {
  const supabase = await createClient();

  // Verificăm dacă path-ul aparține utilizatorului (security check redundant dar bun)
  if (!filePath.startsWith(userId)) {
    throw new Error("Unauthorized access to file path");
  }

  const { data, error } = await supabase.storage
    .from('vault')
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }

  return data.signedUrl;
}
