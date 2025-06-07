import { FileExplorer } from "./FileExplorer";
import PreviewContainer from "./PreviewContainer";
import { ReactPlayground } from "./ReactPlayground";
import { TailwindPlayground } from "./TailwindPlayground";

function buildIframeContent(files) {
  const html = files["/index.html"]?.code || "<div id='root'></div>";
  const css = files["/index.css"]?.code || files["/styles.css"]?.code || "";
  const js = files["/index.js"]?.code || "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script type="module">${js}</script>
      </body>
    </html>
  `;
}

export const Playground = (props) => {
  const { framework, files: filesJson } = props;
  
  if(framework === "react") {
    return <ReactPlayground {...props} />;
  }

  if(framework === "tailwind") {
    return <TailwindPlayground {...props} />;
  }

  const files =
    typeof filesJson === "string" ? JSON.parse(filesJson) : filesJson;

  const srcDoc = buildIframeContent(files);

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
