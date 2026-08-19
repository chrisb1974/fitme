// Returns the authenticated user's id from the request's JWT, or null if the
// caller is not a logged-in user (e.g. only the public anon key was used).
//
// Supabase's gateway already verifies the JWT signature (verify_jwt=true) before
// the function runs, so here we only need to read the claims: a real user token
// has role "authenticated" and a "sub" (user id); the anon key has role "anon".
export function getUserId(req: Request): string | null {
  const authz = req.headers.get('Authorization') || '';
  const token = authz.replace(/^Bearer\s+/i, '').trim();
  if (!token || token.split('.').length !== 3) return null;
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (payload.role !== 'authenticated' || !payload.sub) return null;
    return payload.sub as string;
  } catch {
    return null;
  }
}
