
const form        = document.getElementById("regform");
const successMsg  = document.getElementById("successMsg");
const memberList  = document.getElementById("memberList");
const emptyNote   = document.getElementById("emptyNote");
const countEl     = document.getElementById("count");
const themeBtn    = document.getElementById("theme");


const fields = {
  name:     document.getElementById("name"),
  email:    document.getElementById("email"),
  password: document.getElementById("password"),
  confirm:  document.getElementById("confirm-password"),
  gender:   document.getElementById("gender"),
  dob:      document.getElementById("dob"),
  country:  document.getElementById("country"),
  phone:    document.getElementById("phone"),
  bio:      document.getElementById("bio"),
};


const errors = {
  name:     document.getElementById("nameError"),
  email:    document.getElementById("emailError"),
  password: document.getElementById("passwordError"),
  confirm:  document.getElementById("confirmError"),
  gender:   document.getElementById("genderError"),
  dob:      document.getElementById("dobError"),
  country:  document.getElementById("countryError"),
  phone:    document.getElementById("phoneError"),
  bio:      document.getElementById("bioError"),
};


console.log("form:", form);
console.log("fields:", fields);
console.log("errors:", errors);
console.log("successMsg:", successMsg);
console.log("memberList:", memberList);
console.log("count:", countEl);
console.log("theme button:", themeBtn);

[["form", form], ["successMsg", successMsg], ["memberList", memberList],
 ["emptyNote", emptyNote], ["count", countEl], ["themeBtn", themeBtn]]
  .concat(Object.entries(fields), Object.entries(errors))
  .forEach(([label, el]) => {
    if (!el) console.warn("MISSING ELEMENT:", label);
  });


const validators = {
  name() {
    const v = fields.name.value.trim();
    if (!v) return "Full name is required.";
    if (v.length < 3) return "Name must be at least 3 characters.";
    if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(v)) return "Name can only contain letters and spaces.";
    return "";
  },

  email() {
    const v = fields.email.value.trim();
    if (!v) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return "";
  },

  password() {
    const v = fields.password.value;
    if (!v) return "Password is required.";
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Use at least one letter and one number.";
    return "";
  },

  confirm() {
    const v = fields.confirm.value;
    if (!v) return "Please confirm your password.";
    if (v !== fields.password.value) return "Passwords do not match.";
    return "";
  },

  gender() {
    return fields.gender.value ? "" : "Please select a gender.";
  },

  dob() {
    const v = fields.dob.value;
    if (!v) return "Date of birth is required.";
    const dob = new Date(v);
    const today = new Date();
    if (dob > today) return "Date of birth cannot be in the future.";
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 16) return "You must be at least 16 years old.";
    return "";
  },

  country() {
    const v = fields.country.value.trim();
    if (!v) return "Country is required.";
    if (!/^[A-Za-z][A-Za-z\s'.-]+$/.test(v)) return "Enter a valid country name.";
    return "";
  },

  phone() {
    const v = fields.phone.value.trim();
    if (!v) return "Phone number is required.";
    if (!/^\+?[0-9\s-]{9,15}$/.test(v)) return "Enter a valid phone number, e.g. +254 700 000 000.";
    return "";
  },

  bio() {
    const v = fields.bio.value.trim();
    if (!v) return "Please tell us a little about yourself.";
    if (v.length < 10) return "Bio must be at least 10 characters.";
    if (v.length > 200) return "Bio must be 200 characters or less.";
    return "";
  },
};


function showError(key, message) {
  errors[key].textContent = message;
  fields[key].classList.toggle("invalid", message !== "");
}

function clearError(key) {
  showError(key, "");
}


function validateField(key) {
  const message = validators[key]();
  showError(key, message);
  return message === "";
}


function validateAll() {
  let allValid = true;
  Object.keys(validators).forEach((key) => {
    if (!validateField(key)) allValid = false;
  });
  return allValid;
}


Object.keys(fields).forEach((key) => {
  const field = fields[key];
  const eventName = field.tagName === "SELECT" ? "change" : "input";

  field.addEventListener(eventName, () => {
    if (errors[key].textContent === "") return;
    validateField(key);
  });
});


fields.password.addEventListener("input", () => {
  if (fields.confirm.value) validateField("confirm");
});


form.addEventListener("submit", (event) => {
  event.preventDefault();               

  if (!validateAll()) {
    const firstBad = Object.keys(fields).find((k) => errors[k].textContent);
    if (firstBad) fields[firstBad].focus();
    return;
  }


  const member = {
    id:      Date.now(),
    name:    fields.name.value.trim(),
    email:   fields.email.value.trim(),
    country: fields.country.value.trim(),
  };
  addMember(member);


  updateCount();


  showSuccess(member.name);
  form.reset();
});


function addMember(member) {
  const li = document.createElement("li");
  li.className = "member";
  li.dataset.id = member.id;

  const info = document.createElement("div");
  info.className = "member-info";

  const nameEl = document.createElement("strong");
  nameEl.textContent = member.name;

  const detailEl = document.createElement("span");
  detailEl.textContent = `${member.email} \u2022 ${member.country}`;

  info.append(nameEl, document.createElement("br"), detailEl);

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";
  removeBtn.setAttribute("aria-label", `Remove ${member.name}`);

  li.append(info, removeBtn);
  memberList.appendChild(li);
}


function updateCount() {
  const total = memberList.querySelectorAll("li.member").length;
  countEl.textContent = total;
  emptyNote.classList.toggle("hidden", total > 0);
  emptyNote.style.display = total > 0 ? "none" : "";
}


let successTimer;

function showSuccess(name) {
  successMsg.textContent = `\u2713 ${name} has been registered successfully!`;
  successMsg.classList.remove("hidden");

  clearTimeout(successTimer);
  successTimer = setTimeout(() => {
    successMsg.classList.add("hidden");
  }, 4000);
}


memberList.addEventListener("click", (event) => {
  const btn = event.target.closest(".remove-btn");
  if (!btn) return;

  btn.closest("li.member").remove();
  updateCount();
});


function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
}

themeBtn.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (e) {}
});


try {
  applyTheme(localStorage.getItem("theme") === "dark");
} catch (e) {
  applyTheme(false);
}



updateCount();
