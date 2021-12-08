export const exportJson = (env, domain, data) => {
  const date = new Date().toLocaleDateString().replace(/\//g,'.');
  const time = new Date().toLocaleTimeString().replace(/:/g,'')
  const fileName = `${env}-${domain}-gamekv-${date}-${time}`;
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
