document.addEventListener('DOMContentLoaded', function () {
    const mergeBtn = document.getElementById('merge-btn');
    const pdfInput = document.getElementById('pdf');
    const qrDisplay = document.getElementById('qr-display');
    const downloadBtn = document.getElementById('download-btn');
    const dropSection = document.getElementById('drop-section');
    const fileList = document.getElementById('file-list');
    const loadingPopup = document.getElementById('loading-popup');
    let files = [];

    dropSection.addEventListener('click', function () {
        pdfInput.click();
    });

    pdfInput.addEventListener('change', function () {
        files = Array.from(pdfInput.files);
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
        files = Array.from(e.dataTransfer.files);
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
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');

            const fileIcon = document.createElement('img');
            fileIcon.src = 'assets/img/pdf.png'; // Path to your PDF icon
            fileIcon.alt = 'PDF Icon';

            const fileName = document.createElement('span');
            fileName.textContent = file.name;

            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);
            fileList.appendChild(fileItem);
        });

        // Remove "Drag & Drop PDF-nya di sini gan" text
        const dropText = dropSection.querySelector('p');
        if (dropText) {
            dropText.style.display = 'none';
        }
    }

    async function handleFiles(files) {
        try {
            const pdfDocs = await Promise.all(files.map(file => file.arrayBuffer().then(buffer => PDFLib.PDFDocument.load(buffer))));
            const mergedPdfBytes = await mergePdfPages(pdfDocs);

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

    async function mergePdfPages(docs) {
        const mergedPdf = await PDFLib.PDFDocument.create();

        for (const doc of docs) {
            try {
                const copiedPages = await doc.copyPages(doc, [0, 1]);
                if (copiedPages.length >= 2) {
                    const [firstPage, secondPage] = copiedPages;
                    console.log('Copied first and second pages of document:', doc);

                    const width = firstPage.getWidth() + secondPage.getWidth();
                    const height = Math.max(firstPage.getHeight(), secondPage.getHeight());

                    const newPage = mergedPdf.addPage([width, height]);

                    const [embeddedFirstPage, embeddedSecondPage] = await mergedPdf.embedPages([firstPage, secondPage]);

                    newPage.drawPage(embeddedFirstPage, { x: 0, y: 0 });
                    newPage.drawPage(embeddedSecondPage, { x: firstPage.getWidth(), y: 0 });
                    console.log('Merged pages side by side.');
                } else {
                    console.warn('Document does not have enough pages:', doc);
                }
            } catch (error) {
                console.error('Error copying pages from document:', doc, error);
            }
        }

        console.log('All pages merged successfully.');
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


