import "./globals.css";

export const metadata = {
  title: "Production System",
  description: "Internal Production Data System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
