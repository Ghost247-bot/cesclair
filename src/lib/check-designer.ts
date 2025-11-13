export async function checkIsDesigner(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  try {
    const response = await fetch(`/api/designers/by-email?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.exists === true && data.status === 'approved';
  } catch (error) {
    console.error('Error checking designer status:', error);
    return false;
  }
}

