import { Elysia } from "elysia";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-fallback");

export interface AuthPayload {
    sub: string; // subject (user/player id)
    role: "admin" | "gov_employee" | "citizen";
    exp: number; // expiration timestamp
}

export const jwtAuth = (requiredRole: "admin" | "gov_employee") =>
    new Elysia()
        .derive({ as: "scoped" }, async ({ request }) => {
            const authHeader = request.headers.get("authorization");
            if (!authHeader?.startsWith("Bearer ")) {
                throw new Error("Unauthorized: Missing token");
            }

            const token = authHeader.replace("Bearer ", "");

            try {
                const { payload } = await jwtVerify(token, secret);
                const authPayload = payload as unknown as AuthPayload;

                // Role check
                if (
                    requiredRole === "admin" && authPayload.role !== "admin"
                ) {
                    throw new Error("Forbidden: Admins only");
                }

                if (
                    requiredRole === "gov_employee" &&
                    !["gov_employee", "admin"].includes(authPayload.role)
                ) {
                    throw new Error("Forbidden: Government employees only");
                }

                return { user: authPayload };
            } catch (err) {
                console.error("JWT verification failed", err);
                throw new Error("Unauthorized: Invalid or expired token");
            }
        });