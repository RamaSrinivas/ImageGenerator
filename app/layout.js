import "./globals.css";

export const metadata = {
  title: "Editorial Image Generator",
  description: "AI Editorial Image Generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
