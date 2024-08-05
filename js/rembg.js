document.addEventListener('DOMContentLoaded', function () {
const fileInput = document.getElementById("file");
const fileList = document.getElementById("file-list");
const dropSection = document.getElementById("drop-section");
const resultDiv = document.getElementById("result");
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById("download-btn");
const loadingPopup = document.getElementById("loading-popup");

let selectedFile = null; // Variable to store the selected file

// Handle file selection
fileInput.addEventListener('change', function () {
    handleNewFile(Array.from(fileInput.files));
});

// Handle drag and drop
dropSection.addEventListener('click', function () {
    fileInput.click();
});

dropSection.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropSection.classList.add('dragover');
});

dropSection.addEventListener('dragleave', function (e) {
    e.preventDefault();
    dropSection.classList.remove('dragover');
});

dropSection.addEventListener('drop', function (e) {
    e.preventDefault();
    dropSection.classList.remove('dragover');
    handleNewFile(Array.from(e.dataTransfer.files));
});

// Handle reset
resetBtn.addEventListener('click', function () {
    resetFileInput();
});

// Handle paste
document.addEventListener('paste', function (e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
            const file = items[i].getAsFile();
            handleNewFile([file]);
            break;
        }
    }
});

// Handle remove background button
document.querySelector('.button-section button').addEventListener('click', function () {
    if (selectedFile) {
        showLoading();
        removeBackground(selectedFile);
    } else {
        alert('Please upload an image.');
    }
});

// Handle download button
downloadBtn.addEventListener('click', function () {
    if (downloadBtn.href) {
        const link = document.createElement('a');
        link.href = downloadBtn.href;
        link.download = 'background_removed.png';
        link.click();
    }
});

function handleNewFile(files) {
    if (files.length > 0) {
        resetFileInput();
        displayFiles(files);
        selectedFile = files[0]; // Store the selected file
    }
}

function displayFiles(files) {
    fileList.innerHTML = '';
    resultDiv.innerHTML = '';
    downloadBtn.style.display = 'none'; // Hide the download button initially

    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.setAttribute('data-index', index);

        const fileIcon = document.createElement('img');
        fileIcon.src = 'assets/img/img.png';
        fileIcon.alt = 'Image Icon';

        const fileName = document.createElement('span');
        fileName.textContent = truncateFileName(file.name, 15);

        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileName);
        fileList.appendChild(fileItem);
    });

    const dropText = dropSection.querySelector('p');
    if (dropText) {
        dropText.style.display = 'none';
    }
}

function truncateFileName(fileName, maxLength) {
    if (fileName.length > maxLength) {
        return fileName.substring(0, maxLength - 3) + '...';
    }
    return fileName;
}

function resetFileInput() {
    fileInput.value = '';
    fileList.innerHTML = '';
    resultDiv.innerHTML = '';
    selectedFile = null; // Reset the selected file
    downloadBtn.style.display = 'none'; // Hide the download button when reset
    const dropText = dropSection.querySelector('p');
    if (dropText) {
        dropText.style.display = 'block';
    }
}

function showLoading() {
    loadingPopup.style.display = 'flex';
}

function hideLoading() {
    loadingPopup.style.display = 'none';
}

function removeBackground(file) {
    const formData = new FormData();
    formData.append("image_file", file);

    fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
            // "X-Api-Key": "7QJzZY63de6zz4k4cw9cAjD3"
            "X-Api-Key": "oWGUXckdJf6X4Pxm1ZZ8zkua"
        },
        body: formData
    })
    .then(response => response.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.src = url;
        resultDiv.appendChild(image);

        // Show and configure the download button
        downloadBtn.style.display = 'block';
        downloadBtn.href = url;

        hideLoading(); // Hide loading popup when done
    })
    .catch(error => {
        console.error(error);
        hideLoading(); // Hide loading popup in case of error
    });
}
});
