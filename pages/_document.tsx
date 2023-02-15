import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
          <meta charSet="UTF-8" />
          <meta
            name="description"
            content="Nextjs with Tailwind and Daisy UI Kanban Board"
          />
          <meta name="keywords" content="Kanban Board" />
          <meta name="author" content="MSD" />
        </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
