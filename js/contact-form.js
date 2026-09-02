const CONTACT_STORAGE_KEY = 'northStarBakeryContactInfo';

const validationRules = {
  name: {
    validate: (value) => /^[A-Za-z\s]+$/.test(value.trim()) && value.trim().length > 0,
    message: 'Please enter your name using letters only.'
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    message: 'Please enter a valid email address.'
  },
  'pickup-date': {
    validate: (value) => value.trim().length > 0,
    message: 'Please select a pickup date.'
  },
  'request-type': {
    validate: (value) => value.trim().length > 0,
    message: 'Please select a request type.'
  },
  'item-details': {
    validate: (value) => value.trim().length >= 10,
    message: 'Please describe your order in at least 10 characters.'
  }
};

const summaryFields = [
  { fieldId: 'name', summaryId: 'summary-name', emptyText: 'Not provided yet' },
  { fieldId: 'email', summaryId: 'summary-email', emptyText: 'Not provided yet' },
  { fieldId: 'pickup-date', summaryId: 'summary-pickup-date', emptyText: 'Not provided yet' },
  { fieldId: 'item-details', summaryId: 'summary-item-details', emptyText: 'Not provided yet' },
  { fieldId: 'allergy-notes', summaryId: 'summary-allergy-notes', emptyText: 'None noted' }
];

let formSubmitAttempted = false;

document.addEventListener('DOMContentLoaded', initContactPage);

function initContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) {
    return;
  }

  loadStoredContactInfo();
  attachValidationListeners();
  attachSummaryListeners();
  form.addEventListener('submit', handleFormSubmit);
  updateSummary();
}

function getFieldElement(fieldId) {
  return document.getElementById(fieldId);
}

function getErrorElement(fieldId) {
  return document.getElementById(fieldId + '-error');
}

function loadStoredContactInfo() {
  const storedValue = localStorage.getItem(CONTACT_STORAGE_KEY);
  if (!storedValue) {
    return;
  }

  try {
    const contactInfo = JSON.parse(storedValue);
    restoreContactInfo(contactInfo);
  } catch (error) {
    localStorage.removeItem(CONTACT_STORAGE_KEY);
  }
}

function restoreContactInfo(contactInfo) {
  const nameField = getFieldElement('name');
  const emailField = getFieldElement('email');

  if (contactInfo.name) {
    nameField.value = contactInfo.name;
  }
  if (contactInfo.email) {
    emailField.value = contactInfo.email;
  }
}

function saveContactInfo() {
  const contactInfo = {
    name: getFieldElement('name').value.trim(),
    email: getFieldElement('email').value.trim()
  };
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contactInfo));
}

function validateField(fieldId) {
  const rule = validationRules[fieldId];
  if (!rule) {
    return true;
  }

  const field = getFieldElement(fieldId);
  const isValid = rule.validate(field.value);

  if (isValid) {
    clearFieldError(fieldId);
  } else {
    showFieldError(fieldId, rule.message);
  }

  return isValid;
}

function showFieldError(fieldId, message) {
  const field = getFieldElement(fieldId);
  const errorElement = getErrorElement(fieldId);
  field.classList.add('invalid');
  errorElement.textContent = message;
}

function clearFieldError(fieldId) {
  const field = getFieldElement(fieldId);
  const errorElement = getErrorElement(fieldId);
  field.classList.remove('invalid');
  errorElement.textContent = '';
}

function validateForm() {
  let formIsValid = true;

  Object.keys(validationRules).forEach((fieldId) => {
    const fieldIsValid = validateField(fieldId);
    if (!fieldIsValid) {
      formIsValid = false;
    }
  });

  return formIsValid;
}

function attachValidationListeners() {
  Object.keys(validationRules).forEach((fieldId) => {
    const field = getFieldElement(fieldId);
    const eventName = field.tagName === 'SELECT' ? 'change' : 'input';

    field.addEventListener(eventName, () => {
      if (formSubmitAttempted) {
        validateField(fieldId);
      }
    });
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
  formSubmitAttempted = true;

  const formIsValid = validateForm();

  if (formIsValid) {
    saveContactInfo();
    showFormConfirmation(buildConfirmationMessage());
  } else {
    showFormConfirmation('');
  }
}

function buildConfirmationMessage() {
  const name = getFieldElement('name').value.trim();
  const email = getFieldElement('email').value.trim();
  return 'Thanks, ' + name + '! Your request has been received. We will follow up at ' + email + '.';
}

function showFormConfirmation(message) {
  const confirmationElement = document.getElementById('form-confirmation');
  confirmationElement.textContent = message;
}

function attachSummaryListeners() {
  summaryFields.forEach(({ fieldId }) => {
    const field = getFieldElement(fieldId);
    field.addEventListener('input', updateSummary);
  });

  const requestTypeField = getFieldElement('request-type');
  requestTypeField.addEventListener('change', updateSummary);
}

function updateSummary() {
  summaryFields.forEach(({ fieldId, summaryId, emptyText }) => {
    const field = getFieldElement(fieldId);
    const summaryElement = document.getElementById(summaryId);
    const value = field.value.trim();
    summaryElement.textContent = value ? value : emptyText;
  });

  updateRequestTypeSummary();
}

function updateRequestTypeSummary() {
  const requestTypeField = getFieldElement('request-type');
  const summaryElement = document.getElementById('summary-request-type');
  const selectedOption = requestTypeField.options[requestTypeField.selectedIndex];
  summaryElement.textContent = selectedOption && selectedOption.value ? selectedOption.textContent : 'Not selected yet';
}
