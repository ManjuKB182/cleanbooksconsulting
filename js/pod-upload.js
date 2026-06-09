(function () {
  const params = new URLSearchParams(window.location.search);
  const rowKey = params.get("key") || params.get("rowKey") || "";
  const rowNumber = params.get("row") || "";
  const scriptUrl = window.POD_CONFIG && window.POD_CONFIG.scriptUrl;
  const csvUrl = window.POD_CONFIG && window.POD_CONFIG.csvUrl;

  const els = {
    invoiceTitle: document.getElementById("invoiceTitle"),
    invoiceNumber: document.getElementById("invoiceNumber"),
    customerName: document.getElementById("customerName"),
    partner: document.getElementById("partner"),
    poNumber: document.getElementById("poNumber"),
    sku: document.getElementById("sku"),
    productName: document.getElementById("productName"),
    invoiceValue: document.getElementById("invoiceValue"),
    lrNumber: document.getElementById("lrNumber"),
    form: document.getElementById("podForm"),
    uploadedBy: document.getElementById("uploadedBy"),
    file: document.getElementById("podFile"),
    remarks: document.getElementById("remarks"),
    formMessage: document.getElementById("formMessage"),
    submitButton: document.getElementById("submitButton"),
    ocrStatus: document.getElementById("ocrStatus"),
    ocrProgress: document.getElementById("ocrProgress"),
    extractedInvoiceNumber: document.getElementById("extractedInvoiceNumber"),
    extractedLrNumber: document.getElementById("extractedLrNumber"),
    extractedPodDate: document.getElementById("extractedPodDate"),
    extractedReceiver: document.getElementById("extractedReceiver")
  };

  let invoiceRow = null;
  let ocrText = "";

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function setStatus(text, progress) {
    els.ocrStatus.textContent = text;
    els.ocrProgress.value = progress || 0;
  }

  function firstMatch(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1].trim().replace(/[|:;]+$/g, "");
    }
    return "";
  }

  function extractFields(text) {
    const normalized = text.replace(/\s+/g, " ");
    return {
      invoiceNumber: firstMatch(normalized, [/(?:invoice|inv)\s*(?:no|number|#)?\s*[:\-]?\s*([a-z0-9\-\/]+)/i]),
      lrNumber: firstMatch(normalized, [/(?:lr|l\.r\.|awb|docket|consignment|order)\s*(?:no|number|#)?\s*[:\-]?\s*([a-z0-9\-\/]+)/i]),
      podDate: firstMatch(normalized, [/(?:delivered|delivery|pod|date)\s*(?:on|date)?\s*[:\-]?\s*(\d{1,2}[.\-/ ]\d{1,2}[.\-/ ]\d{2,4})/i]),
      receiver: firstMatch(normalized, [/(?:received by|receiver|recipient|name)\s*[:\-]?\s*([a-z][a-z .]{2,45})/i])
    };
  }

  function applyExtracted(fields) {
    els.extractedInvoiceNumber.value = fields.invoiceNumber || "";
    els.extractedLrNumber.value = fields.lrNumber || "";
    els.extractedPodDate.value = fields.podDate || "";
    els.extractedReceiver.value = fields.receiver || "";
  }

  function renderInvoice(row) {
    invoiceRow = row;
    els.invoiceTitle.textContent = row["Invoice Number"] || "Invoice line";
    els.invoiceNumber.textContent = row["Invoice Number"] || "-";
    els.customerName.textContent = row["Customer Name"] || "-";
    els.partner.textContent = row.Partner || "-";
    els.poNumber.textContent = row["PO Number"] || "-";
    els.sku.textContent = row.SKU || "-";
    els.productName.textContent = row["Product Name"] || "-";
    els.invoiceValue.textContent = money(row["Invoice Value"]);
    els.lrNumber.textContent = row["LR Number"] || "-";
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"' && quoted && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(value);
        value = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(value);
        if (row.some(function (cell) { return cell.trim(); })) rows.push(row);
        row = [];
        value = "";
      } else {
        value += char;
      }
    }

    row.push(value);
    if (row.some(function (cell) { return cell.trim(); })) rows.push(row);
    return rows;
  }

  function rowsFromCsv(text) {
    const rows = parseCsv(text);
    const headers = rows.shift() || [];
    return rows.map(function (row, index) {
      return headers.reduce(function (object, header, columnIndex) {
        object[header] = row[columnIndex] || "";
        object._rowNumber = index + 2;
        return object;
      }, {});
    });
  }

  async function loadInvoice() {
    if (!rowKey && !rowNumber) {
      els.formMessage.textContent = "Invalid upload link. Please open the link from the tracker sheet.";
      els.submitButton.disabled = true;
      return;
    }

    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const rows = rowsFromCsv(csvText);
    const row = rows.find(function (item) {
      return (rowKey && item["POD Row Key"] === rowKey) || (rowNumber && String(item._rowNumber) === String(rowNumber));
    });
    if (!row) throw new Error("Invoice row not found. Please run Apps Script setup and open the generated upload link.");
    renderInvoice(row);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  els.file.addEventListener("change", async function () {
    const file = els.file.files[0];
    ocrText = "";
    applyExtracted({});
    if (!file) return setStatus("Waiting for file", 0);

    if (file.type === "application/pdf") {
      setStatus("PDF selected. OCR runs for images in this page.", 1);
      return;
    }

    try {
      setStatus("Reading POD", 0.05);
      const result = await Tesseract.recognize(file, "eng", {
        logger: function (event) {
          if (event.status === "recognizing text") setStatus("Reading POD", event.progress || 0.1);
        }
      });
      ocrText = result.data.text || "";
      applyExtracted(extractFields(ocrText));
      setStatus("Read complete", 1);
    } catch (error) {
      setStatus("Could not auto-read. Upload can still continue.", 0);
    }
  });

  els.form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!invoiceRow) return;

    const file = els.file.files[0];
    if (!els.uploadedBy.value.trim()) {
      els.formMessage.textContent = "Name is mandatory.";
      return;
    }
    if (!file) {
      els.formMessage.textContent = "POD file is mandatory.";
      return;
    }

    els.submitButton.disabled = true;
    els.formMessage.textContent = "Uploading POD...";

    try {
      if (!scriptUrl || scriptUrl.includes("PASTE_")) {
        throw new Error("Setup pending: add the Apps Script web app URL in js/pod-config.js.");
      }

      const formData = new FormData();
      formData.append("action", "upload");
      formData.append("key", rowKey);
      formData.append("row", rowNumber || String(invoiceRow._rowNumber || ""));
      formData.append("uploadedBy", els.uploadedBy.value.trim());
      formData.append("remarks", els.remarks.value.trim());
      formData.append("fileName", file.name);
      formData.append("mimeType", file.type || "application/octet-stream");
      formData.append("fileData", await fileToBase64(file));
      formData.append("ocrText", ocrText);
      formData.append("extractedInvoiceNumber", els.extractedInvoiceNumber.value);
      formData.append("extractedLrNumber", els.extractedLrNumber.value);
      formData.append("extractedPodDate", els.extractedPodDate.value);
      formData.append("extractedReceiver", els.extractedReceiver.value);

      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });

      els.form.reset();
      applyExtracted({});
      setStatus("Upload complete", 1);
      els.formMessage.textContent = "POD submitted. Please refresh the dashboard/sheet in a few seconds to confirm the update.";
    } catch (error) {
      els.formMessage.textContent = error.message;
    } finally {
      els.submitButton.disabled = false;
    }
  });

  loadInvoice().catch(function (error) {
    els.formMessage.textContent = error.message;
    els.submitButton.disabled = true;
  });
})();
