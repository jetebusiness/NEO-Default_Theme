import {debounce} from "../../functions/util";

const THRESHOLD_IN_SECONDS = 20;
const TIME_TO_SHOW_MODAL_IN_MILLISECONDS = 300000;
const DEBOUNCE_WAIT_ON_USER_INTERACT_IN_MILLISECONDS = 300;
const TIME_TO_INITIATE_COUNTDOWN_IN_MILLISECONDS = 15000;
const TICK_TIMOUT_IN_MILLISECONDS = 1000;

const events = ["mousemove", "scroll", "touchmove"];
const debounceOnUserInteract = debounce(onUserInteract, DEBOUNCE_WAIT_ON_USER_INTERACT_IN_MILLISECONDS);

let handlerTimeout;
let countdownTimerInterval;
let sessionState;
let countdownText;

window.addEventListener("load", async (event) => {
    sessionState = await getSessionSate();
    
    if (!sessionState.expiresAt) {
        return;
    }
    
    onUserInteract();
    addEventListeners();
});

function onUserInteract() {
    clearTimeout(handlerTimeout);
    clearInterval(countdownTimerInterval);
    
    handlerTimeout = setTimeout(initCountdownTimer, TIME_TO_INITIATE_COUNTDOWN_IN_MILLISECONDS);
}

async function initCountdownTimer() {
    clearInterval(countdownTimerInterval);

    sessionState = await getSessionSate(); 
    countdownTimerInterval = setInterval(tickCountdown, TICK_TIMOUT_IN_MILLISECONDS);
}

async function getSessionSate() {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: "/session/state",
            data: {},
            success: function (data) {
                let sessionState = {}
                
                if (data.expiresAt) {
                    sessionState.expiresAt = new Date(data.expiresAt)
    
                    // we need to add a few seconds because the session doesn't expires at the exactly specified time
                    sessionState.expiresAt.setSeconds(sessionState.expiresAt.getSeconds() + THRESHOLD_IN_SECONDS);
                }
                
                resolve(sessionState);
            },
            onFailure: function (data) {
                reject();
            }
        });
    });
}

function tickCountdown() {
    let dateNow = new Date();

    let timeLeftInMillisecond = sessionState.expiresAt.getTime() - dateNow.getTime();

    if (timeLeftInMillisecond <= 0) {
        clearInterval(countdownTimerInterval);
        window.location.reload();
        return;
    }

    if (timeLeftInMillisecond <= TIME_TO_SHOW_MODAL_IN_MILLISECONDS) {
        countdownText = getFormattedHours(timeLeftInMillisecond);

        if (swal.isVisible()) {
            let countdownElement = swal.getContent().querySelector('#countdown-session-timer');
            countdownElement.textContent = countdownText;
        } else {
            showCountdownModal();
        }
    }
}

function getFormattedHours(valueInMillisecond) {
    let minutes = Math.floor((valueInMillisecond / 1000 / 60) % 60);
    let seconds = Math.floor((valueInMillisecond / 1000) % 60);

    return `${minutes}`.padStart(2, '0') + ':' + `${seconds}`.padStart(2, '0');
}

function showCountdownModal() {
    removeEventListeners();

    swal({
        title: '<strong>Você ainda está aí?</strong>',
        html: `Se não, você será deslogado em:<br/><h1 id="countdown-session-timer" style="font-weight: bold; font-size: xxx-large">${countdownText}<h1/>`,
        type: 'warning',
        showCancelButton: false,
        confirmButtonText: 'OK',
        onClose: async () => {
            clearInterval(countdownTimerInterval);

            sessionState = await getSessionSate();
            
            if (!sessionState.expiresAt) {
                window.location.reload();
                return;
            }
            
            addEventListeners();
            initCountdownTimer();
        }
    }).catch(swal.noop) // https://github.com/sweetalert2/sweetalert2/issues/221
}

function removeEventListeners() {
    events.forEach((event) => window.removeEventListener(event, debounceOnUserInteract));
}

function addEventListeners() {
    events.forEach((event) => window.addEventListener(event, debounceOnUserInteract));
}
