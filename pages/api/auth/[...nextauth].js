import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/util/database";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = (await connectDB).db("blueberryrags");
        const user = await db.collection("users").findOne({ id: credentials.id });

        if (!user) {
          throw new Error('존재하지 않는 아이디입니다.');
        }

        const pwCheck = await bcrypt.compare(credentials.password, user.password);
        if (!pwCheck) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        return {
          id: user._id,
          name: user.id,
          role: user.role,
          cart: user.cart
        };
      }
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      const db = (await connectDB).db("blueberryrags");
  
      if (user && account?.provider === "google") {
        let found = await db.collection("users").findOne({ email: user.email });
  
        if (!found) {
          const newUser = {
            id: user.name,
            email: user.email,
            name: user.name,
            nickName: user.name,
            phone: "",
            point: 0,
            coupon: [{ id: "c1", title: "신규 가입 쿠폰", value: 5000 }],
            address: "",
            detailAddress: "",
            agreeToMarketing: false,
            role: "user",
            cart: [],
            createdAt: new Date(),
          };
  
          const result = await db.collection("users").insertOne(newUser);
          found = { ...newUser, _id: result.insertedId };
        }
  
        token.user = {
          id: found._id.toString(),
          name: found.name,
          email: found.email,
          nickName: found.nickName,
          point: found.point,
          coupon: found.coupon,
          role: found.role,
          cart: found.cart,
          provider: "google",
        };
      }
      if (user && account?.provider === "credentials") {
        token.user = {
          id: user.id,
          name: user.name,
          role: user.role,
          cart: user.cart || [],
          provider: "credentials",
        };
      }

  
      return token;
    },
  
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
  
  

  events: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        const db = (await connectDB).db("blueberryrags");

        await db.collection("users").updateOne(
          { email: profile.email },
          {
            $setOnInsert: {
              nickname: profile.name,
              phone: "",
              point: 0,
              coupon: [],
              address: "",
              detailAddress: "",
              agreeToMarketing: false,
              role: "user",
              cart: [],
              createdAt: new Date(),
            }
          },
          { upsert: true }
        );
      }
    },
  },
  

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);