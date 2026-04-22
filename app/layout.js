import "./globals.css";

export const metadata = {
  title: "Life",
  description: "A one-line life planner with draggable chips.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
