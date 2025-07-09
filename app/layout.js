import NavBar from "./NavBar";
import "./globals.css";
import Wrapper from "./Wrapper";
import NextAuthSessionProvider from "./providers/NextAuthSessionProvider";

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>
        <Wrapper>
          <NavBar />
          {children}
        </Wrapper>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
