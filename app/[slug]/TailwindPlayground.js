import * as React from "react";
import { FileExplorer } from "./FileExplorer";
import PreviewContainer from "./PreviewContainer";

async function buildIframeContent(files) {
  const html = files["/index.html"]?.code || "";
  const css = files["/index.css"]?.code || files["/styles.css"]?.code || "";
  const js = files["/index.js"]?.code || "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${css}</style>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body>
        ${html}
        <div id="root"></div>
        <script type="module">
          ${js}
        </script>
      </body>
    </html>
  `;
}

export const TailwindPlayground = async ({ files: filesJson }) => {
  const files =
    typeof filesJson === "string" ? JSON.parse(filesJson) : filesJson;
  const srcDoc = await buildIframeContent(files);

  return (
    <div>
      <FileExplorer files={files} />
      <PreviewContainer>
        <iframe
          srcDoc={srcDoc}
          className="w-full h-full border border-gray-200 rounded-md"
          sandbox="allow-scripts allow-modals"
          title="Playground"
        />
      </PreviewContainer>
    </div>
  )
}
