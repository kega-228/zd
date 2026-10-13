const STATE_LABELS = {
    free: 'Вільна',
    charging: 'Заряджає авто',
    fault: 'Несправна',
};

function makeLine(text, className) {
    const p = document.createElement('p');
    p.textContent = text;
    if (className) p.className = className;
    return p;
}

export function renderStation(container, station) {
    container.replaceChildren();
    if (!station.state && !station.lastError) return;

    container.append(makeLine(`Станція ${station.id}`, 'card-title'));

    if (station.state) {
        const s = station.state;
        container.append(makeLine(`Стан: ${STATE_LABELS[s.state] ?? s.state}`));
        if (s.state === 'charging') {
            container.append(makeLine(`Потужність: ${s.powerKw} кВт`));
            container.append(makeLine(`Заряд батареї: ${s.batteryPercent}%`));
        }
    }

    if (station.lastError) {
        container.append(makeLine(station.lastError, 'error'));
    }
}

export function addHistoryRow(table, record) {
    const body = table.tBodies[0] ?? table.createTBody();
    const row = body.insertRow();
    row.insertCell().textContent = record.time;
    row.insertCell().textContent = record.cardId;
    row.insertCell().textContent = record.decision;
}

export function setMonitoringButtons(startBtn, stopBtn, isMonitoring) {
    startBtn.disabled = isMonitoring;
    stopBtn.disabled = !isMonitoring;
}

export function setChargeBusy(button, isBusy) {
    button.disabled = isBusy;
}
