const fileDownload = async (id) => {
  try {
    const res = await fetch("/api/download-resource?id=" + id);
    if (!res.ok) {
      alert("Errore nel download del file.");
      return;
    }

    const blob = await res.blob();
    const tempUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = tempUrl;
    const filename =
      res.headers
        .get("Content-Disposition")
        ?.split("filename=")[1]
        ?.replace(/"/g, "") || "download";
    a.download = filename;
    a.click();
    URL.revokeObjectURL(tempUrl);
  } catch (err) {
    console.error("Errore download:", err);
    alert("Errore nel download del file.");
  }
};

export default fileDownload;
