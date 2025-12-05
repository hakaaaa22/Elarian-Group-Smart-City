import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = { title: "ELARIAN Smart City OS" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-[#0e0f11] text-white">
        <Sidebar />
        <main className="flex-1 p-10">{children}</main>
      </body>
    </html>
  );
}
