export type PlaygroundFramework = 'vanilla' | 'react' | 'tailwind';

export type PlaygroundFiles = Record<string, { code: string }>;

export interface PlaygroundConfig {
  supportTailwind?: boolean;
  supportReact?: boolean;
  includeResetCSS?: boolean;
  includeRootDiv?: boolean;
  additionalHead?: string;
}

export interface IframeContentBuilder {
  build(files: PlaygroundFiles, config?: PlaygroundConfig): Promise<string> | string;
}

// Base HTML template parts
const createBaseHtmlTemplate = (css: string, additionalHead: string = '', body: string, scripts: string, includeResetCSS: boolean = true) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${includeResetCSS ? `<style>
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
      }
    </style>` : ''}
    <style>${css}</style>
    ${additionalHead}
  </head>
  <body>
    ${body}
    ${scripts}
  </body>
</html>
`;

// Flexible content builder
export const flexibleContentBuilder: IframeContentBuilder = {
  async build(files: PlaygroundFiles, config: PlaygroundConfig = {}) {
    const {
      supportTailwind = false,
      supportReact = false,
      includeResetCSS = true,
      includeRootDiv = false,
      additionalHead = ''
    } = config;

    const html = files['/index.html']?.code || '';
    const css = files['/index.css']?.code || files['/styles.css']?.code || '';
    let js = files['/index.js']?.code || '';

    let headContent = additionalHead;
    let transformedJs = js;

    // Add Tailwind support
    if (supportTailwind) {
      headContent += '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>';
    }

    // Add React support
    if (supportReact) {
      const swc = require("@swc/core");
      
      // Transform JSX/TSX code
      if (js) {
        const result = await swc.transform(js, {
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
        transformedJs = result.code;
      }

      // Add React import map
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
      headContent += importMap;
    }

    const body = `${html}${includeRootDiv ? '<div id="root"></div>' : ''}`;
    const scripts = transformedJs ? `<script type="module">${transformedJs}</script>` : '';

    return createBaseHtmlTemplate(
      css,
      headContent,
      body,
      scripts,
      includeResetCSS
    );
  }
};

// Legacy builders for backward compatibility
export const vanillaContentBuilder: IframeContentBuilder = {
  build(files: PlaygroundFiles) {
    return flexibleContentBuilder.build(files, {
      supportTailwind: false,
      supportReact: false,
      includeResetCSS: true,
      includeRootDiv: false
    });
  }
};

export const tailwindContentBuilder: IframeContentBuilder = {
  build(files: PlaygroundFiles) {
    return flexibleContentBuilder.build(files, {
      supportTailwind: true,
      supportReact: false,
      includeResetCSS: true,
      includeRootDiv: false
    });
  }
};

export const reactContentBuilder: IframeContentBuilder = {
  build(files: PlaygroundFiles) {
    return flexibleContentBuilder.build(files, {
      supportTailwind: true, // React builder also included Tailwind in original
      supportReact: true,
      includeResetCSS: true,
      includeRootDiv: true // React typically needs a root div
    });
  }
};

// Content builder factory - now supports config
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

// New flexible builder function
export const buildPlaygroundContent = async (
  files: PlaygroundFiles, 
  config: PlaygroundConfig = {}
): Promise<string> => {
  return await flexibleContentBuilder.build(files, config);
};

// Utility to parse files from JSON string
export const parsePlaygroundFiles = (filesJson: string | PlaygroundFiles): PlaygroundFiles => {
  return typeof filesJson === 'string' ? JSON.parse(filesJson) : filesJson;
}; 