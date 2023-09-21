// 16 CARTAS
const CARTAS = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
let idIntervaloTemporizador; // Para guardar el ID del intervalo que se usa en el temporizador
let cartaSeleccionada1, cartaSeleccionada2;
bloquearInputCartas();
let contadorParejasExitosas = 0;

document.querySelector("#iniciar-juego").onclick = function (e) {
    reiniciarJuego();
    generarCartas();
    mostrarCartas();

    iniciarTemporizador();
    e.target.textContent = "Jugar de nuevo";
};

function mostrarCartas() {
    desbloquearInputCartas();
    document.querySelector("#cartas").classList.remove("d-none");
}

function ocultarCartas() {
    bloquearInputCartas();
    document.querySelector("#cartas").classList.add("d-none");
}

function bloquearInputCartas() {
    document.querySelectorAll(".carta").forEach(function ($carta) {
        $carta.onclick = function () {
            return;
        };
    });
}

function desbloquearInputCartas() {
    document.querySelectorAll(".carta").forEach(function ($carta) {
        $carta.onclick = function () {
            bloquearInputCartas();
            const carta = dameCarta($carta);
            let matchExitoso = false;
            voltearCarta(carta);

            if (!cartaSeleccionada1) { // Si el usuario no seleccionó la primera carta, guardo la primera
                if (!carta["estaDescubierta"]) {
                    return false;
                }

                cartaSeleccionada1 = carta;
                return false;
            } else { // Sino, guardo la segunda.
                cartaSeleccionada2 = carta;
                matchExitoso = compararCartas(cartaSeleccionada1, cartaSeleccionada2);
            }

            if (matchExitoso) {
                parejaExitosa(cartaSeleccionada1, cartaSeleccionada2);
            } else {
                parejaNoExitosa(cartaSeleccionada1, cartaSeleccionada2);
            }

            limpiarCartasSeleccionadas();
        };
    });
}

function reiniciarJuego() {
    cartaSeleccionada1 = undefined;
    cartaSeleccionada2 = undefined;
    document.querySelectorAll("img").forEach(function (img) {
        img.remove();
    }
    );
    document.querySelectorAll(".carta").forEach(function (carta) {
        carta.classList.remove("bg-danger");
        carta.classList.remove("bg-success");
        carta.classList.add("bg-primary");
    });
    resetearCartasGeneradas();
    ocultarCartas();

    document.querySelector("#intentos").textContent = "";

    const juegoCompletado = document.querySelector("#juego-completado");
    if (juegoCompletado) {
        juegoCompletado.remove();
    }
}

function generarCartas() {
    const numerosImagenes = mezclarNumerosDisponibles();
    const $cartas = document.querySelectorAll(".carta");

    CARTAS.forEach(function (carta, i) {
        carta["elementoHTML"] = $cartas[i];
        carta["numeroImagen"] = numerosImagenes[i];
        carta["estaDescubierta"] = false;
    });
}

function resetearCartasGeneradas() {
    CARTAS.forEach(function (carta) {
        carta["elementoHTML"] = undefined;
        carta["numeroImagen"] = undefined;
        carta["estaDescubierta"] = undefined;
    });
}

// Fisher-Yates shuffle
function mezclar(array) {
    let currentIndex = array.length;
    let randomIndex;

    // Mientras queden elementos que mezclar
    while (currentIndex > 0) {

        // Elegí un elemento que quede
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // E intercambialo con el elemento actual
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function mezclarNumerosDisponibles() {
    const PARES_DE_NUMEROS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8];
    let nrosImagenesDisponibles = mezclar(PARES_DE_NUMEROS);

    return nrosImagenesDisponibles;
}

function dameNumeroImagen(indice) {
    return nrosImagenesDisponibles[indice];
}

function voltearCarta(carta) {
    const $imagen = document.createElement("img");
    $imagen.src = `img/imagen-${carta["numeroImagen"]}.jpg`;
    $imagen.className = "imagen";
    $imagen.alt = `Pareja ${carta["numeroImagen"]}`;


    if (!carta["estaDescubierta"]) {
        mostrarImagen(carta, $imagen);
        carta["estaDescubierta"] = true;
    } else {
        ocultarImagen(carta, $imagen);
        carta["estaDescubierta"] = false;

        cartaSeleccionada1 = undefined;
    }
    desbloquearInputCartas();
}

function mostrarImagen(carta, $img) {
    const $carta = carta["elementoHTML"];

    $img.classList.add("aparecer");
    $carta.appendChild($img);
}

function ocultarImagen(carta, $img) {
    const $carta = carta["elementoHTML"];

    $carta.lastElementChild.remove();
    $img.classList.add("desaparecer");
    $carta.appendChild($img);

    setTimeout(function () { // 500 dura la animacion de desaparecer
        $carta.lastElementChild.remove();
    }, 500);
}

function actualizarTextoBoton(texto) {
    const $boton = document.querySelector("#iniciar-juego");
    $boton.textContent = texto;
}

function iniciarTemporizador() {
    if (idIntervaloTemporizador) {
        // Detengo en caso de que haya un intervalo previo.
        clearInterval(idIntervaloTemporizador);
    }
    const $temporizador = document.querySelector("#temporizador");
    $temporizador.textContent = "00:00:00";

    // La id está declarada globalmente para no resetearla cada vez que ingreso a la función.
    idIntervaloTemporizador = setInterval(sumarTiempo, 1000, $temporizador);
}

// Funcionalidad del temporizador:
function sumarTiempo(temporizador) {
    const tiempoActual = temporizador.textContent;
    const formatoTiempo = /(\d{1,3}):(\d{1,2}):(\d{1,2})/;
    let horas = Number(formatoTiempo.exec(tiempoActual)[1]);
    let minutos = Number(formatoTiempo.exec(tiempoActual)[2]);
    let segundos = Number(formatoTiempo.exec(tiempoActual)[3]);

    if (segundos < 59) {
        segundos++;
    }

    if (segundos === 59) {
        segundos = 0;
        minutos++; 1;
    }

    if (minutos === 59) {
        minutos = 0;
        horas++;
    }

    const tiempo = darFormatoTiempo(horas, minutos, segundos);
    temporizador.textContent = tiempo;
}

function darFormatoTiempo(horas, minutos, segundos) {
    let horasFormateadas = String(horas).padStart(2, "0");
    let minutosFormateados = String(minutos).padStart(2, "0");
    let segundosFormateados = String(segundos).padStart(2, "0");

    return `${horasFormateadas}:${minutosFormateados}:${segundosFormateados}`;
}

function dameCarta(elementoCarta) {
    for (let i = 0; i < CARTAS.length; i++) {
        if (CARTAS[i]["elementoHTML"] === elementoCarta) {
            return CARTAS[i];
        }
    }
}

function compararCartas(carta1, carta2) {
    if (carta1["numeroImagen"] === carta2["numeroImagen"]) {
        return true;
    }

    return false;
}

function limpiarCartasSeleccionadas() {
    cartaSeleccionada1 = undefined;
    cartaSeleccionada2 = undefined;
}

function sumarIntento() {
    const $intentos = document.querySelector("#intentos");
    let cantidadIntentos = Number($intentos.textContent);
    $intentos.textContent = cantidadIntentos + 1;
}

function parejaExitosa(carta1, carta2) {
    mostrarExito(carta1, carta2);
    contadorParejasExitosas++;

    if (contadorParejasExitosas === 8) {
        juegoCompletado();
    }
}

function parejaNoExitosa(carta1, carta2) {
    bloquearInputCartas();
    mostrarError(carta1, carta2);

    setTimeout(function () {
        ocultarError(carta1, carta2);
        voltearCarta(carta1);
        voltearCarta(carta2);
        sumarIntento();
        desbloquearInputCartas();
    }, 1200); // 500 de la animacion y 700 para que el usuario lo pueda percibir

    ;
}

function mostrarError(carta1, carta2) {
    carta1["elementoHTML"].classList.replace("bg-primary", "bg-danger");
    carta2["elementoHTML"].classList.replace("bg-primary", "bg-danger");
}

function ocultarError(carta1, carta2) {
    carta1["elementoHTML"].classList.replace("bg-danger", "bg-primary");
    carta2["elementoHTML"].classList.replace("bg-danger", "bg-primary");
}

function mostrarExito(carta1, carta2) {
    carta1["elementoHTML"].classList.replace("bg-primary", "bg-success");
    carta2["elementoHTML"].classList.replace("bg-primary", "bg-success");
    carta1["elementoHTML"].onclick = function () { return; };
    carta2["elementoHTML"].onclick = function () { return; };
}

function juegoCompletado() {
    const juegoCompletado = document.querySelector("#juego-completado");
    if (juegoCompletado) {
        juegoCompletado.remove(f);
    }

    const $main = document.querySelector("main");
    const $div = document.createElement("div");

    $div.className = "alert alert-success w-100 text-center";
    $div.id = "juego-completado";
    $div.textContent = "¡Ganaste! Hacé click en jugar de nuevo para comenzar un nuevo juego.";
    $div.role = "alert";
    $div.style.position = "absolute";
    $div.style.top = "0";
    $div.style.left = "0";


    // $div.style.width = "100%";
    // $div.style.height = "100%";
    // $div.style.opacity = ".5";
    // $div.className = "bg-success-subtle";

    $main.appendChild($div);
}
