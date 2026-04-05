export const metadata = {
  title: "Booski Live",
  description: "Minimal Vercel runtime for keeping Booski live on Ghost.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Georgia, 'Times New Roman', serif",
          background: "#f2efe8",
          color: "#151515",
        }}
      >
        {children}
      </body>
    </html>
  );
}
