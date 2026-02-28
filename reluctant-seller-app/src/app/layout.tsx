import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Reluctant Seller | Close More by Pushing Less",
  description: "The complete system for founders and CEOs who close more by pushing less. Interactive simulator, 20-page playbook, and AI email generator.",
  openGraph: {
    title: "The Reluctant Seller",
    description: "Stop selling. Start letting people buy. The complete system for founders and CEOs.",
    url: "https://reluctant.work",
    siteName: "The Reluctant Seller",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Reluctant Seller",
    description: "Stop selling. Start letting people buy.",
  },
  metadataBase: new URL("https://reluctant.work"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Meta Pixel — Replace YOUR_PIXEL_ID with your actual Meta Pixel ID */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="bg-[#F2F2F7] text-black min-h-screen">
        <div className="ambient-bg" />
        {children}
      </body>
    </html>
  );
}
