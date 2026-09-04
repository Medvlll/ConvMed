function update() {
  const eur = parseFloat(document.getElementById("eur").value) || 0;
  const rateIDR = parseFloat(document.getElementById("rate_idr").value) || 0;
  const rateMYR = parseFloat(document.getElementById("rate_myr").value) || 0;

  document.getElementById("result_idr").textContent =
    (eur * rateIDR).toLocaleString() + " IDR";
  document.getElementById("result_myr").textContent =
    (eur * rateMYR).toFixed(2) + " MYR";
}

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", update);
});

update();
