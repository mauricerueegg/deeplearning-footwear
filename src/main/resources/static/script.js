function checkFiles(files) {
    console.log(files);

    if (files.length != 1) {
        alert("Bitte genau eine Datei hochladen.");
        return;
    }

    const fileSize = files[0].size / 1024 / 1024; // in MiB
    if (fileSize > 10) {
        alert("Datei zu gross (max. 10 MB)");
        return;
    }

    answerPart.style.visibility = "visible";
    const file = files[0];

    // Preview
    if (file) {
        preview.src = URL.createObjectURL(files[0]);
    }

    // Upload
    const formData = new FormData();
    for (const name in files) {
        formData.append("image", files[name]);
    }

    fetch('/analyze', {
        method: 'POST',
        headers: {},
        body: formData
    }).then(response => {
        response.text().then(function (text) {
            try {
                const predictions = JSON.parse(text);
                displayAnswer(predictions);
            } catch (e) {
                answer.innerHTML = "Fehler beim Anzeigen der Antwort.";
                console.error("Parsing-Fehler:", e);
            }
        });
    }).catch(error => {
        console.error("Fehler beim Upload:", error);
    });
}

function displayAnswer(predictions) {
    const answerDiv = document.getElementById("answer");
    answerDiv.innerHTML = "";

    // Sortiere nach Wahrscheinlichkeit absteigend
    predictions.sort((a, b) => b.probability - a.probability);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th style="text-align:left; padding: 8px;">Blume</th>
            <th style="text-align:left; padding: 8px;">Wahrscheinlichkeit</th>
        </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    predictions.forEach(pred => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.style.padding = "8px";
        nameCell.textContent = pred.className.replace(/_/g, " ");

        const probCell = document.createElement("td");
        probCell.style.padding = "8px";

        const percent = (pred.probability * 100).toFixed(1) + "%";

        const barWrapper = document.createElement("div");
        barWrapper.style.background = "#fce4ec";
        barWrapper.style.borderRadius = "4px";
        barWrapper.style.overflow = "hidden";
        barWrapper.style.height = "16px";
        barWrapper.style.width = "100%";

        const bar = document.createElement("div");
        bar.style.height = "100%";
        bar.style.width = `${pred.probability * 100}%`;
        bar.style.background = "#f06292"; // Pastellrosa
        bar.style.transition = "width 0.5s ease";

        barWrapper.appendChild(bar);

        probCell.innerHTML = `<span>${percent}</span>`;
        probCell.appendChild(barWrapper);

        row.appendChild(nameCell);
        row.appendChild(probCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    answerDiv.appendChild(table);
}