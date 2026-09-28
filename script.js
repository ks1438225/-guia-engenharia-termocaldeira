const state = {
    running: false,
    paused: false,
    emergency: false,
    elapsed: 0,
    temp: 25,
    energy: 0,
    speed: 1,
    mode: {
        temp: "normal",
        time: "normal",
        energy: "normal"
    }
};

const $ = id => document.getElementById(id);

const tempSp = $("tempSp");
const timeSp = $("timeSp");
const energySp = $("energySp");

const modes = {
    slow: 0.5,
    normal: 1,
    fast: 1.5,
    manual: 1
};

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");

    const secondsFormatted = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${secondsFormatted}`;
}

function updateClock() {
    const date = new Date();

    $("clockValue").textContent =
        date.toLocaleDateString("pt-BR") +
        " " +
        date.toLocaleTimeString("pt-BR");
}

function setText(id, value) {
    $(id).textContent = value;
}

function updateDisplay() {
    const temperatureSetpoint = Number(tempSp.value);
    const energySetpoint = Number(energySp.value);
    const timeSetpoint = Number(timeSp.value);

    setText("tempValue", state.temp.toFixed(1));
    setText("energyValue", state.energy.toFixed(1));
    setText("timeValue", formatTime(state.elapsed));

    setText("tempSpDisplay", temperatureSetpoint);
    setText("energySpDisplay", energySetpoint);
    setText("timeSpDisplay", formatTime(timeSetpoint));

    setText("sideTemp", state.temp.toFixed(1));
    setText("sideEnergy", state.energy.toFixed(1));
    setText("sideTime", formatTime(state.elapsed));

    setText("sideTempSp", temperatureSetpoint);
    setText("sideEnergySp", energySetpoint);
    setText("sideTimeSp", formatTime(timeSetpoint));

    setText(
        "sideTempMode",
        state.mode.temp.toUpperCase()
    );

    setText(
        "sideTimeMode",
        state.mode.time.toUpperCase()
    );

    setText(
        "sideEnergyMode",
        state.mode.energy.toUpperCase()
    );
}

function setSystem(text, cycle) {
    setText("systemState", text);
    setText("cycleState", cycle);
}

function stopCycle() {
    state.running = false;
    state.paused = false;

    setSystem(
        "SISTEMA PARADO",
        "CICLO PARADO"
    );

    $("operationLed").classList.remove("active");
}

function startCycle() {
    if (state.emergency) {
        return;
    }

    state.running = true;
    state.paused = false;

    setSystem(
        "CICLO EM EXECUÇÃO",
        "CICLO ATIVO"
    );

    $("operationLed").classList.add("active");
}

function pauseCycle() {
    if (state.running) {
        state.paused = true;

        setSystem(
            "CICLO PAUSADO",
            "AGUARDANDO RETOMADA"
        );
    }
}

function resumeCycle() {
    if (
        state.running &&
        !state.emergency
    ) {
        state.paused = false;

        setSystem(
            "CICLO EM EXECUÇÃO",
            "CICLO ATIVO"
        );
    }
}

function resetSystem() {
    state.running = false;
    state.paused = false;
    state.emergency = false;
    state.elapsed = 0;
    state.temp = 25;
    state.energy = 0;

    $("faultLed").classList.remove("active");
    $("peakLed").classList.remove("active");
    $("estopBtn").classList.remove("active");

    setSystem(
        "SISTEMA PRONTO",
        "CICLO PARADO"
    );

    updateDisplay();
}

function emergencyStop() {
    state.emergency = true;
    state.running = false;
    state.paused = false;

    $("faultLed").classList.add("active");
    $("peakLed").classList.add("active");

    setSystem(
        "EMERGÊNCIA ATIVADA",
        "CICLO BLOQUEADO"
    );
}

function exitSystem() {
    setSystem(
        "ENCERRAMENTO SOLICITADO",
        "SAÍDA"
    );

    setTimeout(() => {
        document.body.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                justify-content:center;
                height:100vh;
                background:#071018;
                color:#e8f1f7;
                font:700 22px Arial
            ">
                IHM ENCERRADA
            </div>
        `;
    }, 400);
}

function setMode(target, mode, button) {
    state.mode[target] = mode;

    document
        .querySelectorAll(`[data-target="${target}"]`)
        .forEach(element => {
            element.classList.remove("active");
        });

    button.classList.add("active");

    updateDisplay();
}

function simulate() {
    if (
        !state.running ||
        state.paused ||
        state.emergency
    ) {
        return;
    }

    const temperatureTarget = Number(tempSp.value);
    const energyTarget = Number(energySp.value);

    const temperatureRate =
        modes[state.mode.temp] *
        state.speed;

    const temperatureDifference =
        temperatureTarget - state.temp;

    state.temp +=
        Math.max(
            -0.7,
            Math.min(
                0.7,
                temperatureDifference *
                0.012 *
                temperatureRate
            )
        ) +
        (Math.random() - 0.5) * 0.18;

    const energyRate =
        modes[state.mode.energy] *
        state.speed;

    state.energy +=
        Math.max(
            -0.3,
            Math.min(
                0.3,
                (energyTarget - state.energy) *
                0.06 *
                energyRate
            )
        ) +
        (Math.random() - 0.5) * 0.08;

    state.elapsed += 0.2 * state.speed;

    if (state.temp >= temperatureTarget - 1) {
        $("peakLed").classList.add("active");
    } else {
        $("peakLed").classList.remove("active");
    }

    if (state.elapsed >= Number(timeSp.value)) {
        state.elapsed = Number(timeSp.value);
        stopCycle();
    }

    updateDisplay();
}

tempSp.addEventListener(
    "input",
    updateDisplay
);

timeSp.addEventListener(
    "input",
    updateDisplay
);

energySp.addEventListener(
    "input",
    updateDisplay
);

document
    .querySelectorAll(".mode-row button")
    .forEach(button => {
        button.addEventListener(
            "click",
            () => {
                setMode(
                    button.dataset.target,
                    button.dataset.mode,
                    button
                );
            }
        );
    });

document
    .querySelectorAll('input[name="speed"]')
    .forEach(radio => {
        radio.addEventListener(
            "change",
            () => {
                state.speed = Number(radio.value);
            }
        );
    });

$("startBtn").addEventListener(
    "click",
    startCycle
);

$("stopBtn").addEventListener(
    "click",
    stopCycle
);

$("pauseBtn").addEventListener(
    "click",
    pauseCycle
);

$("resumeBtn").addEventListener(
    "click",
    resumeCycle
);

$("resetBtn").addEventListener(
    "click",
    resetSystem
);

$("estopBtn").addEventListener(
    "click",
    emergencyStop
);

$("exitBtn").addEventListener(
    "click",
    exitSystem
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "F12" ||
            event.key === "Escape"
        ) {
            event.preventDefault();
            emergencyStop();

        } else if (
            event.key === "Enter"
        ) {
            startCycle();

        } else if (
            event.code === "Space"
        ) {
            event.preventDefault();

            if (state.paused) {
                resumeCycle();
            } else {
                pauseCycle();
            }

        } else if (
            event.key.toLowerCase() === "r"
        ) {
            resetSystem();

        } else if (
            event.key.toLowerCase() === "s"
        ) {
            stopCycle();

        } else if (
            event.key === "ArrowUp"
        ) {
            tempSp.value = Math.min(
                Number(tempSp.max),
                Number(tempSp.value) + 1
            );

            updateDisplay();

        } else if (
            event.key === "ArrowDown"
        ) {
            tempSp.value = Math.max(
                Number(tempSp.min),
                Number(tempSp.value) - 1
            );

            updateDisplay();
        }
    }
);

setInterval(
    updateClock,
    1000
);

setInterval(
    simulate,
    200
);

updateClock();
updateDisplay();