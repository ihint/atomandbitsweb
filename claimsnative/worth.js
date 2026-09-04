(function () {
  'use strict';
  var patients = document.getElementById('worth-patients');
  var frequency = document.getElementById('worth-frequency');
  var revenue = document.getElementById('worth-revenue');
  var annual = document.getElementById('worth-annual');
  var monthly = document.getElementById('worth-monthly');
  var formula = document.getElementById('worth-formula');
  if (!patients || !frequency || !revenue || !annual || !monthly || !formula) return;

  var factors = { workday: 260, week: 52, month: 12 };
  var labels = { workday: 'workdays', week: 'weeks', month: 'months' };
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var count = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

  function value(input) {
    var n = Number(input.value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function render() {
    var p = value(patients);
    var r = value(revenue);
    var f = factors[frequency.value];
    var yearly = p * f * r;
    annual.textContent = money.format(yearly);
    monthly.textContent = money.format(yearly / 12) + ' a month';
    formula.textContent = count.format(p) + ' patients × ' + f + ' ' + labels[frequency.value] + ' × ' + money.format(r) + ' = ' + money.format(yearly) + ' a year';
  }

  [patients, frequency, revenue].forEach(function (input) {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  });
  render();
}());
