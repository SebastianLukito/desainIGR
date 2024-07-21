const closeAllPopups = () => {
  document.querySelectorAll('.popupContainer').forEach(popup => {
      popup.classList.remove('popupActive');
  });
};

const closeAllChildSubButtons = () => {
  document.querySelectorAll('.child-sub-buttons').forEach(child => {
      child.classList.remove('show');
  });
};

document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function (event) {
      // Close all popups and child sub buttons if a main button is clicked
      if (!this.classList.contains('toggleChild')) {
          closeAllChildSubButtons();
          closeAllPopups();
      }

      // Preventing click on 'btn' sub-buttons to close parent popup
      if (this.classList.contains('toggleChild')) {
          event.stopPropagation();
      }
  });
});

document.querySelectorAll('.close-btn').forEach(button => {
  button.addEventListener('click', function () {
      this.closest('.popupContainer').classList.remove('popupActive');
  });
});

const PDFBtn = document.getElementById("PDF");
const closePopupBtn = document.getElementById("closePopup");
const popup = document.getElementById("popupMenu");

PDFBtn.addEventListener("click", function () {
  closeAllPopups();
  popup.classList.add("popupActive");
});

closePopupBtn.addEventListener("click", function () {
  popup.classList.remove("popupActive");
});

// Event listener untuk button "Kumpulan Link"
const button1 = document.getElementById("Button1");
const closePopup1 = document.getElementById("closePopup1");
const popup1 = document.getElementById("popupMenu1");

button1.addEventListener("click", function () {
  closeAllPopups();
  popup1.classList.add("popupActive");
});

closePopup1.addEventListener("click", function () {
  popup1.classList.remove("popupActive");
});

// Event listener untuk button "Generate QR"
const generateQRBtn = document.getElementById("generateQR");
const closePopupQRBtn = document.getElementById("closePopupQR");
const popupQR = document.getElementById("popupMenuQR");

generateQRBtn.addEventListener("click", function () {
  closeAllPopups();
  popupQR.classList.add("popupActive");
});

closePopupQRBtn.addEventListener("click", function () {
  popupQR.classList.remove("popupActive");
});

// Event listener untuk button "Informasi"
const infoBtn = document.getElementById("info");
const closePopupInfoBtn = document.getElementById("closePopupInfo");
const popupInfo = document.getElementById("popupMenuInfo");

infoBtn.addEventListener("click", function () {
  closeAllPopups();
  popupInfo.classList.add("popupActive");
});

closePopupInfoBtn.addEventListener("click", function () {
  popupInfo.classList.remove("popupActive");
});

// Toggle child sub buttons
document.querySelectorAll('.toggleChild').forEach(button => {
  button.addEventListener('click', function (event) {
      const childSubButtons = this.nextElementSibling;
      if (childSubButtons.classList.contains('show')) {
          childSubButtons.classList.remove('show');
      } else {
          closeAllChildSubButtons();
          childSubButtons.classList.add('show');
      }
      event.stopPropagation(); // Prevent triggering parent's click event
  });
});

// Copy to clipboard function
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.querySelector('p').innerText;
  navigator.clipboard.writeText(text).then(() => {
      alert("Sudah di-copy, bosku!");
  }).catch(err => {
      console.error('Failed to copy text: ', err);
  });
}
