import { authorizeCard, getStationStatus, startSession } from './api.js';

const POLL_INTERVAL_MS = 3000;
const MIN_BALANCE = 100;

export class ChargingStation extends EventTarget {
    constructor(id) {
        super();
        this.id = id;
        this.state = null;
        this.lastError = null;
        this.isMonitoring = false;
        this.history = [];
        this._timerId = null;
        this._generation = 0;
    }

    async refresh() {
        const generation = this._generation;
        try {
            const status = await getStationStatus(this.id);
            if (generation !== this._generation) return; // ответ опоздал (был Стоп) — игнорируем
            this.state = status;
            this.lastError = null;
        } catch (error) {
            if (generation !== this._generation) return;
            this.lastError = error.message; // старый state не стираем
        }
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this._tick(this._generation);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        this._generation++;
        clearTimeout(this._timerId);
        this._timerId = null;
    }

    async _tick(generation) {
        if (generation !== this._generation) return;
        await this.refresh();
        if (generation !== this._generation) return;
        this.dispatchEvent(new Event('change'));
        this._timerId = setTimeout(() => this._tick(generation), POLL_INTERVAL_MS);
    }

    async charge(cardId) {
        const time = new Date().toLocaleTimeString();
        const decision = await this._decide(cardId);
        const record = { time, cardId, decision };
        this.history.push(record);
        return record;
    }

    async _decide(cardId) {
        let card;
        try {
            card = await authorizeCard(cardId);
        } catch (error) {
            return 'Платіжний сервіс недоступний, спробуйте пізніше';
        }

        if (card === null) return 'Картку не знайдено';
        if (card.balance < MIN_BALANCE) return 'Недостатньо коштів';

        try {
            const session = await startSession(this.id, card);
            return `Зарядку розпочато, сесія ${session.sessionId}, власник ${session.owner}`;
        } catch (error) {
            return error.message;
        }
    }
}