(function () {
  'use strict';

  var patientsInput = document.getElementById('turned-away');
  var frequencyInput = document.getElementById('frequency');
  var revenueInput = document.getElementById('course-revenue');
  var monthlyOutput = document.getElementById('monthly-potential');
  var annualOutput = document.getElementById('annual-potential');
  var annualPatientsOutput = document.getElementById('annual-patients');
  var formulaOutput = document.getElementById('exact-formula');
  var useEstimate = document.getElementById('use-estimate');
  var reviewForm = document.getElementById('review-form');
  var draftReview = document.getElementById('draft-review');
  var draftPreview = document.getElementById('draft-preview');
  var openEmail = document.getElementById('open-email');

  var annualFactors = { workday: 260, week: 52, month: 12 };
  var periodLabels = { workday: 'workdays', week: 'weeks', month: 'months' };
  var money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  var count = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
  var hasStarted = false;
  var hasCompleted = false;
  var hasShownIntent = false;

  function track(eventName) {
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({ event: eventName });
    }
    window.dispatchEvent(new CustomEvent(eventName));
  }

  function nonNegativeNumber(input) {
    var value = Number(input.value);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function estimate() {
    var patients = nonNegativeNumber(patientsInput);
    var courseRevenue = nonNegativeNumber(revenueInput);
    var factor = annualFactors[frequencyInput.value];
    var annualPatients = patients * factor;
    var annualGross = annualPatients * courseRevenue;
    var monthlyGross = annualGross / 12;

    return {
      patients: patients,
      courseRevenue: courseRevenue,
      factor: factor,
      period: frequencyInput.value,
      annualPatients: annualPatients,
      annualGross: annualGross,
      monthlyGross: monthlyGross
    };
  }

  function clearDraft() {
    if (draftReview.hidden) return;
    draftReview.hidden = true;
    draftPreview.textContent = '';
    openEmail.href = 'mailto:Ian@atomandbits.com';
  }

  function renderEstimate() {
    var result = estimate();

    monthlyOutput.value = money.format(result.monthlyGross);
    monthlyOutput.textContent = money.format(result.monthlyGross);
    annualOutput.value = money.format(result.annualGross);
    annualOutput.textContent = money.format(result.annualGross);
    annualPatientsOutput.value = count.format(result.annualPatients);
    annualPatientsOutput.textContent = count.format(result.annualPatients);
    formulaOutput.textContent = count.format(result.patients) + ' patients × ' + result.factor + ' ' + periodLabels[result.period] + ' × ' + money.format(result.courseRevenue) + ' = ' + money.format(result.annualGross) + ' per year; ' + money.format(result.annualGross) + ' ÷ 12 = ' + money.format(result.monthlyGross) + ' per month.';
    clearDraft();
  }

  function noteCalculatorUse() {
    if (!hasStarted) {
      hasStarted = true;
      track('calculator_started');
    }
    renderEstimate();
  }

  function completeCalculator() {
    if (!hasStarted) {
      hasStarted = true;
      track('calculator_started');
    }
    if (!hasCompleted) {
      hasCompleted = true;
      track('calculator_completed');
    }
  }

  function utmLines() {
    var params = new URLSearchParams(window.location.search);
    return ['utm_source', 'utm_medium', 'utm_campaign'].reduce(function (lines, key) {
      var value = params.get(key);
      if (value) lines.push(key + ': ' + value);
      return lines;
    }, []);
  }

  function fieldValue(id) {
    return document.getElementById(id).value.trim();
  }

  function buildEmail() {
    var result = estimate();
    var subject = 'Insurance Opportunity Review — ' + fieldValue('practice-name');
    var bodyLines = [
      'I would like to review the insurance opportunity for my practice.',
      '',
      'ESTIMATE',
      'Monthly gross potential: ' + money.format(result.monthlyGross),
      'Annual gross potential: ' + money.format(result.annualGross),
      'Annual patient count: ' + count.format(result.annualPatients),
      'Formula: ' + count.format(result.patients) + ' patients × ' + result.factor + ' ' + periodLabels[result.period] + ' × ' + money.format(result.courseRevenue) + ' = ' + money.format(result.annualGross) + ' per year; ' + money.format(result.annualGross) + ' ÷ 12 = ' + money.format(result.monthlyGross) + ' per month.',
      'Estimate note: Planning estimate, not a revenue promise. Gross potential revenue, not net income or expected collections.',
      '',
      'PRACTICE',
      'Practice name: ' + fieldValue('practice-name'),
      'Specialty: ' + fieldValue('specialty'),
      'City/state: ' + fieldValue('location'),
      'Visits per week: ' + fieldValue('visits-week'),
      'Practice system: ' + fieldValue('practice-system'),
      'Insurance status: ' + fieldValue('insurance-status'),
      'Biggest concern: ' + fieldValue('biggest-concern'),
      '',
      'CONTACT',
      'Name: ' + fieldValue('contact-name'),
      'Email: ' + fieldValue('contact-email')
    ];
    var attribution = utmLines();

    if (attribution.length) {
      bodyLines.push('', 'ATTRIBUTION');
      Array.prototype.push.apply(bodyLines, attribution);
    }

    return {
      subject: subject,
      body: bodyLines.join('\n')
    };
  }

  [patientsInput, frequencyInput, revenueInput].forEach(function (input) {
    input.addEventListener('input', noteCalculatorUse);
    input.addEventListener('change', noteCalculatorUse);
  });

  useEstimate.addEventListener('click', function () {
    completeCalculator();
  });

  reviewForm.addEventListener('input', clearDraft);
  reviewForm.addEventListener('change', clearDraft);

  reviewForm.addEventListener('submit', function (event) {
    event.preventDefault();
    completeCalculator();

    var email = buildEmail();
    draftPreview.textContent = 'To: Ian@atomandbits.com\nSubject: ' + email.subject + '\n\n' + email.body;
    openEmail.href = 'mailto:Ian@atomandbits.com?subject=' + encodeURIComponent(email.subject) + '&body=' + encodeURIComponent(email.body);
    draftReview.hidden = false;

    if (!hasShownIntent) {
      hasShownIntent = true;
      track('review_intent');
    }

    draftReview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelectorAll('[data-pilot-cta]').forEach(function (link) {
    link.addEventListener('click', function () {
      track('pilot_cta_clicked');
    });
  });

  renderEstimate();
}());
