import { readFile } from "fs/promises";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { visit } from "unist-util-visit";

function buildIframeContent(files) {
  const html = files["/index.html"]?.code || "<div id='root'></div>";
  const css = files["/index.css"]?.code || files["/styles.css"]?.code || "";
  const js = files["/index.js"]?.code || "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>${css}</style>
        <script type="importmap">
        {
          "imports": {
            "@ui5/webcomponents/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents@2.10.0/",
            "@ui5/webcomponents-ai/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-ai@2.10.0/",
            "@ui5/webcomponents-fiori/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-fiori@2.10.0/",
            "@ui5/webcomponents-compat/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-compat@2.10.0/",
            "@ui5/webcomponents-base/jsx-runtime":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-base@2.10.0/dist/jsx-runtime.js",
            "@ui5/webcomponents-base/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-base@2.10.0/",
            "@ui5/webcomponents-icons/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-icons@2.10.0/",
            "@ui5/webcomponents-localization/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-localization@2.10.0/",
            "@ui5/webcomponents-theming/":"https://cdn.jsdelivr.net/npm/@ui5/webcomponents-theming@2.10.0/",
            "lit-html":"https://cdn.jsdelivr.net/npm/lit-html@2",
            "lit-html/":"https://cdn.jsdelivr.net/npm/lit-html@2/",
            "@zxing/library/":"https://cdn.jsdelivr.net/npm/@zxing/library@0/"
          }
        }
        </script>
      </head>
      <body>
        ${html}
        <script type="module">${js}</script>
      </body>
    </html>
  `;
}

export const Playground = ({ files: filesJson }) => {
  const files =
    typeof filesJson === "string" ? JSON.parse(filesJson) : filesJson;
  const srcDoc = buildIframeContent(files);

  return (
    <div>
      <iframe
        srcDoc={srcDoc}
        style={{
          width: 600,
          height: 400,
          border: "1px solid #ddd",
          borderRadius: 6,
          background: "#fff",
        }}
        sandbox="allow-scripts allow-modals"
        title="Playground"
      />
    </div>
  );
};

function processMeta(meta) {
  const result = {
    fileName: null,
    hidden: false,
    readOnly: false,
    active: false,
  };
  const arr = meta.split(/[ ,]+/);
  for (let i = 0; i < arr.length; i++) {
    const prop = arr[i];
    if (
      prop.endsWith(".js") ||
      prop.endsWith(".css") ||
      prop.endsWith(".html")
    ) {
      result.fileName = prop;
    }
    if (prop in result) {
      result[prop] = true;
    }
  }
  return result;
}
function prepareFilesProp(node) {
  const { children } = node;
  const files = {};

  for (let i = 0; i < children.length; i++) {
    const n = children[i];
    const { meta, lang, value } = n;
    const result = processMeta(meta);
    const file = {
      code: value,
      readOnly: result.readOnly,
      hidden: result.hidden,
      active: result.active,
      lang,
    };
    files[`/${result.fileName}`] = file;
  }
  return files;
}

export function remarkMdxPlayground() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.name === "Playground") {
        node.attributes = node.attributes || [];
        const files = prepareFilesProp(node);
        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "files",
          value: JSON.stringify(files),
        });
      }
    });
  };
}

export default async function RemoteMdxPage() {
  const filename = "./public/index.md";
  const markdown = await readFile(filename, "utf8");
  return (
    <MDXRemote
      components={{
        Playground,
      }}
      source={markdown}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMdxPlayground],
        },
      }}
    />
  );
}
