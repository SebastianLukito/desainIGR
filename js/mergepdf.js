document.addEventListener('DOMContentLoaded', function () {
    const mergeBtn = document.getElementById('merge-btn');
    const pdfInput = document.getElementById('pdf');
    const qrDisplay = document.getElementById('qr-display');
    const downloadBtn = document.getElementById('download-btn');
    const dropSection = document.getElementById('drop-section');
    const fileList = document.getElementById('file-list');
    const loadingPopup = document.getElementById('loading-popup');
    let files = [];

    dropSection.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON') {
            return; // Prevent triggering file input if buttons are clicked
        }
        pdfInput.click();
    });

    pdfInput.addEventListener('change', function () {
        files.push(...Array.from(pdfInput.files));
        displayFiles(files);
    });

    // Event listeners for drag and drop
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
        files.push(...Array.from(e.dataTransfer.files));
        displayFiles(files);
    });

    mergeBtn.addEventListener('click', function () {
        if (files.length < 1) {
            alert('Please upload at least one PDF file.');
            return;
        }
        // Show loading popup
        loadingPopup.style.display = 'flex';
        handleFiles(files);
    });

    function displayFiles(files) {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');
            fileItem.setAttribute('data-index', index);

            const fileIcon = document.createElement('img');
            fileIcon.src = 'assets/img/pdf.png'; // Path to your PDF icon
            fileIcon.alt = 'PDF Icon';

            const fileName = document.createElement('span');
            fileName.textContent = truncateFileName(file.name, 15);

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const upButton = document.createElement('button');
            upButton.classList.add('up-button');
            upButton.innerHTML = '⬆';
            upButton.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent triggering file input
                moveFileUp(index);
            });

            const downButton = document.createElement('button');
            downButton.classList.add('down-button');
            downButton.innerHTML = '⬇';
            downButton.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent triggering file input
                moveFileDown(index);
            });

            buttonContainer.appendChild(upButton);
            buttonContainer.appendChild(downButton);

            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);
            fileItem.appendChild(buttonContainer);
            fileList.appendChild(fileItem);
        });

        // Remove "Drag & Drop PDF-nya di sini gan" text
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

    function moveFileUp(index) {
        if (index > 0) {
            const temp = files[index - 1];
            files[index - 1] = files[index];
            files[index] = temp;
            displayFiles(files);
        }
    }

    function moveFileDown(index) {
        if (index < files.length - 1) {
            const temp = files[index + 1];
            files[index + 1] = files[index];
            files[index] = temp;
            displayFiles(files);
        }
    }

    async function handleFiles(files) {
        try {
            const pdfDocs = await Promise.all(files.map(file => file.arrayBuffer().then(buffer => PDFLib.PDFDocument.load(buffer))));
            const mergedPdfBytes = await mergePdfDocs(pdfDocs);

            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Display PDF in the right panel
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.width = '100%';
            iframe.height = '500px';
            qrDisplay.innerHTML = '';
            qrDisplay.appendChild(iframe);

            // Show download button
            downloadBtn.style.display = 'block';
            downloadBtn.onclick = function () {
                const a = document.createElement('a');
                a.href = url;
                a.download = 'hasil.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
            };

            // Hide loading popup
            loadingPopup.style.display = 'none';

            console.log('PDF merged and displayed successfully.');
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error merging PDFs. Please try again.');
            loadingPopup.style.display = 'none';
        }
    }

    async function mergePdfDocs(docs) {
        const mergedPdf = await PDFLib.PDFDocument.create();

        for (const doc of docs) {
            const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        return await mergedPdf.save();
    }

    // Event listener for reset button
    document.getElementById('reset-btn').addEventListener('click', function () {
        files = [];
        fileList.innerHTML = '';
        pdfInput.value = ''; // Reset input file

        // Show "Drag & Drop PDF-nya di sini gan" text
        const dropText = dropSection.querySelector('p');
        if (dropText) {
            dropText.style.display = 'block';
        }

        // Hide download button and QR display
        qrDisplay.innerHTML = '';
        downloadBtn.style.display = 'none';
    });
});
