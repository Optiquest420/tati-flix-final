const startButton = document.getElementById("startMission");

const intro = document.getElementById("intro");

const loading = document.getElementById("loading");

const game = document.getElementById("game");

const progress = document.querySelector(".progress-fill");

const loadingText = document.getElementById("loadingText");

if (startButton) {

    startButton.addEventListener("click", startLoading);

}

function startLoading() {

    intro.style.display = "none";

    loading.style.display = "block";

    let percent = 0;

    const mensagens = [

        "A verificar ficheiros...",

        "A recuperar memórias...",

        "A sincronizar sistema...",

        "Missão carregada."

    ];

    let index = 0;

    const intervalo = setInterval(() => {

        percent += 5;

        progress.style.width = percent + "%";

        if (percent === 25) {

            loadingText.innerText = mensagens[index++];

        }

        if (percent === 50) {

            loadingText.innerText = mensagens[index++];

        }

        if (percent === 75) {

            loadingText.innerText = mensagens[index++];

        }

        if (percent >= 100) {

            loadingText.innerText = mensagens[index];

            clearInterval(intervalo);

            setTimeout(() => {

                loading.style.display = "none";

                game.style.display = "block";

            }, 1000);

        }

    }, 100);

}