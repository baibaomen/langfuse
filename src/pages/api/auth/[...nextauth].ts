import NextAuth from "next-auth";
import { authOptions } from "@/src/server/auth";
import Providers from "next-auth/providers";
import KeycloakProvider from "next-auth/providers/keycloak";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID ?? "",
      clientSecret: process.env.KEYCLOAK_SECRET ?? "",
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
    // Add more providers as needed
  ],
  // Add custom configuration as needed
});
