const API_URL = "https://open.er-api.com/v6/latest/EUR";
const CACHE_KEY = "convmed_rates_v4";

const currencies = {
EUR: {
name: "Euro",
flag: "🇪🇺",
symbol: "€"
},

IDR: {
name: "Roupie indonésienne",
flag: "🇮🇩",
symbol: "Rp"
},

MYR: {
name: "Ringgit malaisien",
flag: "🇲🇾",
symbol: "RM"
}
};

let rates = {
EUR: 1,
IDR: null,
MYR: null
};

let from = "EUR";
let to = "IDR";

const amount = document.getElementById("amount");
const result = document.getElementById("result");
const rate = document.getElementById("rate");
const updated = document.getElementById("updated");
const error = document.getElementById("error");

const refresh = document.getElementById("refresh");
const swap = document.getElementById("swap");

const fromSelect = document.getElementById("fromSelect");
const toSelect = document.getElementById("toSelect");


function number(value) {

const n = Number(
String(value)
.replace(/\s/g, "")
.replace(",", ".")
);

return Number.isFinite(n) && n >= 0 ? n : 0;
}


function format(value, currency) {

return new Intl.NumberFormat(
currency === "EUR" ? "fr-FR" : "id-ID",
{
minimumFractionDigits:
currency === "EUR" ? 2 : 0,

maximumFractionDigits:
currency === "EUR" ? 2 : 0
}
).format(value);
}


function updateCard(side, currency) {

const data = currencies[currency];

document.getElementById(
side + "Code"
).textContent = currency;

document.getElementById(
side + "Flag"
).textContent = data.flag;

document.getElementById(
side + "Name"
).textContent = data.name;

document.getElementById(
side + "Symbol"
).textContent = data.symbol;
}


function render() {

if (
rates[from] === null ||
rates[to] === null
) {

result.textContent = "—";

return;
}

const value = number(amount.value);

const converted =
(value / rates[from]) *
rates[to];

result.textContent =
format(converted, to);


const currentRate =
rates[to] / rates[from];

rate.textContent =
`1 ${from} = ${format(currentRate, to)} ${to}`;
}


function updateUI() {

updateCard("from", from);
updateCard("to", to);

fromSelect.value = from;
toSelect.value = to;

render();
}


function populateCurrencies() {

Object.entries(currencies).forEach(
([code, data]) => {

fromSelect.add(
new Option(
`${data.flag} ${data.name} (${code})`,
code
)
);

toSelect.add(
new Option(
`${data.flag} ${data.name} (${code})`,
code
)
);

}
);

updateUI();
}


async function loadRates(force = false) {

error.textContent = "";

refresh.classList.add("spin");


/*
* UTILISER LE DERNIER TAUX
*/

if (!force) {

try {

const cache =
JSON.parse(
localStorage.getItem(CACHE_KEY)
);

if (
cache &&
cache.rates &&
cache.rates.IDR &&
cache.rates.MYR &&
Date.now() - cache.time <
6 * 60 * 60 * 1000
) {

rates = cache.rates;

updated.textContent =
"Taux enregistrés récemment";

render();

refresh.classList.remove("spin");

return;
}

} catch (e) {}
}


/*
* RÉCUPÉRATION DU TAUX EN DIRECT
*/

try {

const response =
await fetch(
API_URL,
{
cache: "no-store"
}
);

const data =
await response.json();


if (
!response.ok ||
data.result !== "success" ||
!data.rates.IDR ||
!data.rates.MYR
) {

throw new Error(
"Taux indisponibles"
);
}


rates = {

EUR: 1,

IDR:
data.rates.IDR,

MYR:
data.rates.MYR
};


localStorage.setItem(

CACHE_KEY,

JSON.stringify({

rates: rates,

time: Date.now()

})

);


updated.textContent =
"Mis à jour : " +
new Date().toLocaleTimeString(
"fr-FR",
{
hour: "2-digit",
minute: "2-digit"
}
);


render();


} catch (e) {


/*
* SI INTERNET NE FONCTIONNE PAS
* ON UTILISE LE DERNIER TAUX
*/

try {

const cache =
JSON.parse(
localStorage.getItem(
CACHE_KEY
)
);


if (
cache &&
cache.rates &&
cache.rates.IDR &&
cache.rates.MYR
) {

rates =
cache.rates;


updated.textContent =
"Taux précédent (hors connexion)";


error.textContent =
"Connexion indisponible : taux précédent utilisé.";


render();


} else {

throw new Error();

}


} catch (e2) {

updated.textContent =
"Taux indisponibles";

error.textContent =
"Impossible de récupérer les taux. Vérifie ta connexion.";

}

}


refresh.classList.remove("spin");
}


/*
* SAISIE DU MONTANT
*/

amount.addEventListener(
"input",
render
);


/*
* CHANGEMENT DE DEVISE DE DÉPART
*/

fromSelect.addEventListener(
"change",
() => {

from =
fromSelect.value;


/*
* Évite EUR → EUR,
* IDR → IDR, etc.
*/

if (from === to) {

to =
from === "EUR"
? "IDR"
: "EUR";

}


updateUI();

}
);


/*
* CHANGEMENT DE DEVISE D'ARRIVÉE
*/

toSelect.addEventListener(
"change",
() => {

to =
toSelect.value;


if (from === to) {

from =
to === "EUR"
? "IDR"
: "EUR";

}


updateUI();

}
);


/*
* BOUTON INVERSER
*/

swap.addEventListener(
"click",
() => {

const oldFrom = from;

from = to;

to = oldFrom;

updateUI();

}
);


/*
* ACTUALISER LE TAUX
*/

refresh.addEventListener(
"click",
() => {

loadRates(true);

}
);


/*
* BOUTONS RAPIDES
*/

document
.querySelectorAll(".quick button")
.forEach(
button => {

button.addEventListener(
"click",
() => {

amount.value =
button.dataset.value;

render();

}
);

}
);


/*
* LANCEMENT
*/

populateCurrencies();

loadRates();
