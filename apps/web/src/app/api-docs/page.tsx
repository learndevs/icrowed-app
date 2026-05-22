import Script from "next/script";

export const metadata = {
  title: "API Docs | iCrowd",
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div id="swagger-ui" />
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
      />
      <Script
        id="swagger-ui-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function initSwaggerUI() {
              if (!window.SwaggerUIBundle) {
                window.setTimeout(initSwaggerUI, 50);
                return;
              }
              window.SwaggerUIBundle({
                url: '/api/openapi',
                dom_id: '#swagger-ui',
                deepLinking: true,
                persistAuthorization: true,
                layout: 'BaseLayout'
              });
            }
            initSwaggerUI();
          `,
        }}
      />
    </main>
  );
}
