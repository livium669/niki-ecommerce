import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL, // or undefined to infer from window.location
});

export const { signIn, signOut, useSession, signUp } = authClient;
