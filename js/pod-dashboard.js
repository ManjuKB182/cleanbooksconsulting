(function () {
  const scriptUrl = window.POD_CONFIG && window.POD_CONFIG.scriptUrl;
  const csvUrl = window.POD_CONFIG && window.POD_CONFIG.csvUrl;
  const els = {
    body: document.getElementById("dashboardBody"),
    emptyState: document.getElementById("emptyState"),
    message: document.getElementById("dashboardMessage"),
    search: document.getElementById("searchInput"),
    status: document.getElementById("statusFilter"),
    refresh: document.getElementById("refreshButton"),
    totalCount: document.getElementById("totalCount"),
    totalAmount: document.getElementById("totalAmount"),
    receivedCount: document.getElementById("receivedCount"),
    receivedAmount: document.getElementById("receivedAmount"),
    pendingCount: document.getElementById("pendingCount"),
    pendingAmount: document.getElementById("pendingAmount")
  };

  let rows = [];

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text || "-";
    return td;
  }

  function hasPod(row) {
    return Boolean(row["POD File Link"] || String(row["POD Status"] || "").toLowerCase().includes("received"));
  }

  function updateMetrics(summary) {
    els.totalCount.textContent = summary.total.count;
    els.totalAmount.textContent = money(summary.total.amount);
    els.receivedCount.textContent = summary.received.count;
    els.receivedAmount.textContent = money(summary.received.amount);
    els.pendingCount.textContent = summary.pending.count;
    els.pendingAmount.textContent = money(summary.pending.amount);
  }

  function filteredRows() {
    const query = els.search.value.trim().toLowerCase();
    const status = els.status.value;
    return rows.filter(function (row) {
      const text = [
        row["Invoice Number"],
        row["Customer Name"],
        row.Partner,
        row.SKU,
        row["Product Name"],
        row["LR Number"]
      ].join(" ").toLowerCase();
      const rowHasPod = hasPod(row);
      const statusOk = status === "all" || (status === "received" ? rowHasPod : !rowHasPod);
      return statusOk && (!query || text.includes(query));
    });
  }

  function render() {
    const visible = filteredRows();
    els.emptyState.hidden = visible.length > 0;
    els.body.replaceChildren(
      ...visible.map(function (row) {
        const tr = document.createElement("tr");
        tr.append(
          cell([row["Invoice Number"], row["Invoice Date"]].filter(Boolean).join("\n")),
          cell(row["Customer Name"]),
          cell(row.Partner),
          cell([row.SKU, row["Product Name"]].filter(Boolean).join("\n")),
          cell(money(row["Invoice Value"])),
          cell(row["LR Number"])
        );

        const status = document.createElement("td");
        const pill = document.createElement("span");
        pill.className = "status-pill " + (hasPod(row) ? "status-received" : "status-pending");
        pill.textContent = hasPod(row) ? "POD received" : "POD pending";
        status.append(pill);
        tr.append(status);

        const pod = document.createElement("td");
        if (row["POD File Link"]) {
          const link = document.createElement("a");
          link.href = row["POD File Link"];
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = "Open POD";
          pod.append(link);
        } else if (row["POD Upload Link"]) {
          const link = document.createElement("a");
          link.href = row["POD Upload Link"];
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = "Upload";
          pod.append(link);
        } else {
          pod.textContent = "-";
        }
        tr.append(pod);
        return tr;
      })
    );
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

  function calculateSummary(dataRows) {
    return dataRows.reduce(function (summary, row) {
      const amount = Number(String(row["Invoice Value"] || "").replace(/[^0-9.-]/g, "")) || 0;
      const bucket = hasPod(row) ? "received" : "pending";
      summary.total.count += 1;
      summary.total.amount += amount;
      summary[bucket].count += 1;
      summary[bucket].amount += amount;
      return summary;
    }, {
      total: { count: 0, amount: 0 },
      received: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 }
    });
  }

  async function loadDashboard() {
    if (!csvUrl) {
      els.message.textContent = "Setup pending: add the Google Sheet CSV URL in js/pod-config.js.";
      return;
    }

    els.message.textContent = "Loading dashboard...";
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    rows = rowsFromCsv(csvText).filter(function (row) { return row["Invoice Number"]; });
    updateMetrics(calculateSummary(rows));
    render();
    els.message.textContent = "";
  }

  els.search.addEventListener("input", render);
  els.status.addEventListener("change", render);
  els.refresh.addEventListener("click", function () {
    loadDashboard().catch(function (error) {
      els.message.textContent = error.message;
    });
  });

  loadDashboard().catch(function (error) {
    els.message.textContent = error.message;
  });
})();
