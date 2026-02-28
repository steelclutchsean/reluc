import { hasActiveEntitlement } from "@/lib/subscriptions";
import { extractTokenFromRequest, verifyAccessToken } from "@/lib/auth";

export async function getAuthorizedUser(req: Request) {
  const token = extractTokenFromRequest(req);
  if (!token) return null;

  const { payload } = await verifyAccessToken(token);
  if (!payload.userId) return null;

  const entitled = await hasActiveEntitlement(payload.userId, Boolean(payload.lifetime));
  if (!entitled) return null;

  return {
    userId: payload.userId,
    email: payload.email || "",
    lifetime: Boolean(payload.lifetime),
  };
}
