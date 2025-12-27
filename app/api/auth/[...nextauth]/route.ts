import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import * as bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // 1. ค้นหา User ใน DB
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user) return null;

        // 2. เช็ครหัสผ่าน
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) return null;

        // 3. ส่งข้อมูล User กลับไป (ไม่ส่ง password)
        return {
          id: user.id,
          name: user.name,
          email: user.role, // Hack: เราใช้ field email เก็บ role ชั่วคราวเพื่อให้ frontend ใช้ง่าย
        };
      }
    })
  ],
  pages: {
    signIn: '/login', // บอกว่าหน้า Login ของเราอยู่ที่ไหน
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        // @ts-ignore
        session.user.role = token.role; 
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.email; // รับค่า role มาจาก authorize
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };