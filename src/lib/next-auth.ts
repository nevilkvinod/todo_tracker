import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    // Configure authentication providers here
    // e.g., GitHubProvider, CredentialsProvider
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session?.user && token?.sub) {
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
