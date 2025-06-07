import * as React from "react";
import { FileExplorer } from "./FileExplorer";
import PreviewContainer from "./PreviewContainer";
const swc = require("@swc/core");

async function transformJSX(jsxCode) {
  const result = await swc.transform(jsxCode, {
    jsc: {
      parser: {
        syntax: "typescript",
        jsx: true,
        tsx: true,
      },
      transform: {
        react: {
          runtime: "classic",
          importSource: "react",
        },
      },
    },
    module: {
      type: "es6",
    },
  });

  return result.code;
}

async function buildIframeContent(files) {
  const html = files["/index.html"]?.code || "";
  const css = files["/index.css"]?.code || files["/styles.css"]?.code || "";
  const js = files["/index.js"]?.code || "";
  const jsxCode = await transformJSX(js);

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
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@19",
              "react-dom": "https://esm.sh/react-dom@19",
              "react-dom/client": "https://esm.sh/react-dom@19/client"
            }
          }
        </script>
        <script type="module">
          ${jsxCode}
        </script>
      </body>
    </html>
  `;
}

export const ReactPlayground = async ({ files: filesJson }) => {
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
  );
};
