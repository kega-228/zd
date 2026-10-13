import { ChargingStation } from './ChargingStation.js';
import { renderStation, addHistoryRow, setMonitoringButtons, setChargeBusy } from './ui.js';

const stations = ['EV-1', 'EV-2', 'EV-3'].map(id => new ChargingStation(id));

const startBtn = document.getElementById('startMonitoring');
const stopBtn = document.getElementById('stopMonitoring');
const refreshAllBtn = document.getElementById('refreshAll');

stations.forEach((station, i) => {
    const n = i + 1;
    const cardEl = document.getElementById(`card${n}`);
    const inputEl = document.getElementById(`cardInput${n}`);
    const chargeBtn = document.getElementById(`startCharge${n}`);
    const tableEl = document.getElementById(`history-table${n}`);

    station.addEventListener('change', () => renderStation(cardEl, station));

    chargeBtn.addEventListener('click', async () => {
        setChargeBusy(chargeBtn, true);
        try {
            const record = await station.charge(inputEl.value.trim());
            addHistoryRow(tableEl, record);
        } finally {
            setChargeBusy(chargeBtn, false);
        }
    });
});

startBtn.addEventListener('click', () => {
    stations.forEach(station => station.startMonitoring());
    setMonitoringButtons(startBtn, stopBtn, true);
});

stopBtn.addEventListener('click', () => {
    stations.forEach(station => station.stopMonitoring());
    setMonitoringButtons(startBtn, stopBtn, false);
});

refreshAllBtn.addEventListener('click', async () => {
    refreshAllBtn.disabled = true;
    try {
        await Promise.all(stations.map(station => station.refresh()));
        stations.forEach((station, i) => {
            renderStation(document.getElementById(`card${i + 1}`), station);
        });
    } finally {
        refreshAllBtn.disabled = false;
    }
});

setMonitoringButtons(startBtn, stopBtn, false);
