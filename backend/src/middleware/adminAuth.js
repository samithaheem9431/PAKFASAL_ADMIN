import { verifyFirebaseToken } from "./verifyFirebaseToken.js";
import { checkAdminRole } from "./checkAdminRole.js";

export const adminAuth = [verifyFirebaseToken, checkAdminRole];
