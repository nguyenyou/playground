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