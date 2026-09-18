
const COUNTER_URL =
    "https://firestore.googleapis.com/v1/projects/contador-web-davito/databases/(default)/documents/visits/counter";

let counterTask = null;

function readCount(doc) {
    const field = doc && doc.fields && doc.fields.count;
    if (!field) return 0;
    const raw = field.integerValue != null ? field.integerValue : field.doubleValue;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
}

function renderCount(value) {
    const counterEl = document.getElementById("counter-value");
    if (!counterEl) return;
    try {
        counterEl.textContent = Number(value).toLocaleString("es-ES");
    } catch (e) {
        counterEl.textContent = String(value);
    }
}

async function fetchCounterDoc() {
    const res = await fetch(COUNTER_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("counter GET " + res.status);
    return res.json();
}

async function writeCount(count) {
    const res = await fetch(COUNTER_URL + "?updateMask.fieldPaths=count", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fields: { count: { integerValue: String(count) } }
        })
    });
    if (!res.ok) throw new Error("counter PATCH " + res.status);
    return res.json();
}

export async function initVisitCounter() {
    if (counterTask) return counterTask;
    counterTask = (async () => {
        const counterEl = document.getElementById("counter-value");
        if (!counterEl) return;

        try {
            const doc = await fetchCounterDoc();
            let currentCount = readCount(doc);

            if (!sessionStorage.getItem("has_visited")) {
                currentCount += 1;
                sessionStorage.setItem("has_visited", "true");
                renderCount(currentCount);
                try {
                    await writeCount(currentCount);
                } catch (writeErr) {
                    console.warn("No se pudo guardar el contador:", writeErr);
                }
            } else {
                renderCount(currentCount);
            }
        } catch (error) {
            console.error("Error al actualizar el contador:", error);
            if (counterEl.textContent === "..." || !counterEl.textContent.trim()) {
                counterEl.textContent = "—";
            }
        }
    })();
    return counterTask;
}

function bootCounter() {
    if (!document.getElementById("counter-value")) return;
    initVisitCounter();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCounter);
} else {
    bootCounter();
}
