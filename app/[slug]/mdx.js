import { visit } from "unist-util-visit";


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
  