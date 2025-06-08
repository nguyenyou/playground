export type PlaygroundFramework = 'vanilla' | 'react' | 'tailwind';

export type PlaygroundFiles = Record<string, { code: string }>;

export interface IframeContentBuilder {
  build(files: PlaygroundFiles): Promise<string> | string;
}

// Base HTML template parts
const createBaseHtmlTemplate = (css: string, additionalHead: string = '', body: string, scripts: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
      }
    </style>
    <style>${css}</style>
    ${additionalHead}
  </head>
  <body>
    ${body}
    ${scripts}
  </body>
</html>
`;

// Vanilla JS playground
export const vanillaContentBuilder: IframeContentBuilder = {
  build(files: PlaygroundFiles) {
    const html = files['/index.html']?.code || "<div id='root'></div>";
    const css = files['/index.css']?.code || files['/styles.css']?.code || '';
    const js = files['/index.js']?.code || '';

    return createBaseHtmlTemplate(
      css,
      '',
      html,
      `<script type="module">${js}</script>`
    );
  }
};

// Tailwind playground
export const tailwindContentBuilder: IframeContentBuilder = {
  build(files: PlaygroundFiles) {
    const html = files['/index.html']?.code || '';
    const css = files['/index.css']?.code || files['/styles.css']?.code || '';
    const js = files['/index.js']?.code || '';

    return createBaseHtmlTemplate(
      css,
      '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>',
      `${html}<div id="root"></div>`,
      `<script type="module">${js}</script>`
    );
  }
};

// React playground with SWC transformation
export const reactContentBuilder: IframeContentBuilder = {
  async build(files: PlaygroundFiles) {
    const swc = require("@swc/core");
    
    const html = files['/index.html']?.code || '';
    const css = files['/index.css']?.code || files['/styles.css']?.code || '';
    const js = files['/index.js']?.code || '';
    
    const transformedJs = await swc.transform(js, {
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

    const importMap = `
      <script type="importmap">
        {
          "imports": {
            "react": "https://esm.sh/react@19",
            "react-dom": "https://esm.sh/react-dom@19",
            "react-dom/client": "https://esm.sh/react-dom@19/client"
          }
        }
      </script>
    `;

    return createBaseHtmlTemplate(
      css,
      '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>' + importMap,
      `${html}<div id="root"></div>`,
      `<script type="module">${transformedJs.code}</script>`
    );
  }
};

// Content builder factory
export const getContentBuilder = (framework: PlaygroundFramework): IframeContentBuilder => {
  switch (framework) {
    case 'react':
      return reactContentBuilder;
    case 'tailwind':
      return tailwindContentBuilder;
    case 'vanilla':
    default:
      return vanillaContentBuilder;
  }
};

// Utility to parse files from JSON string
export const parsePlaygroundFiles = (filesJson: string | PlaygroundFiles): PlaygroundFiles => {
  return typeof filesJson === 'string' ? JSON.parse(filesJson) : filesJson;
}; 