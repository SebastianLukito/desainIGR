document.addEventListener('DOMContentLoaded', function () {
    const mergeBtn = document.getElementById('merge-btn');
    const pdfInput = document.getElementById('pdf');
    const qrDisplay = document.getElementById('qr-display');
    const downloadBtn = document.getElementById('download-btn');
    const dropSection = document.getElementById('drop-section');
    const fileList = document.getElementById('file-list');
    const loadingPopup = document.getElementById('loading-popup');
    let files = [];

    // Click event to trigger file input
    dropSection.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON') {
            return; // Prevent triggering file input if buttons are clicked
        }
        pdfInput.click();
    });

    // File input change event
    pdfInput.addEventListener('change', function () {
        files.push(...Array.from(pdfInput.files));
        displayFiles(files);
    });

    // Drag and drop events
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

    // Display file list
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

            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);
            fileList.appendChild(fileItem);
        });

        // Remove "Drag & Drop PDF di sini" text
        const dropText = dropSection.querySelector('p');
        if (dropText) {
            dropText.style.display = 'none';
        }
    }

    // Truncate long file names for display
    function truncateFileName(fileName, maxLength) {
        if (fileName.length > maxLength) {
            return fileName.substring(0, maxLength - 1) + '...';
        }
        return fileName;
    }

    // Merge files by similar names
    mergeBtn.addEventListener('click', async function () {
        if (files.length === 0) {
            alert('Harap unggah file PDF terlebih dahulu!');
            return;
        }
        loadingPopup.style.display = 'flex';

        try {
            const groupedFiles = groupFilesByName(files);
            const mergedFiles = await mergeGroupedFiles(groupedFiles);
            displayMergedFiles(mergedFiles);
            loadingPopup.style.display = 'none';
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Terjadi kesalahan saat penggabungan PDF.');
            loadingPopup.style.display = 'none';
        }
    });

    function groupFilesByName(files) {
        const groups = {};
        files.forEach(file => {
            const baseName = file.name.replace(/\s+\d+\.\w+$/, ''); // Remove trailing numbers and extension
            if (!groups[baseName]) {
                groups[baseName] = [];
            }
            groups[baseName].push(file);
        });
        return groups;
    }

    async function mergeGroupedFiles(groups) {
        const results = [];
        for (const groupName in groups) {
            const pdfDoc = await PDFLib.PDFDocument.create();
            for (const file of groups[groupName]) {
                const pdfBytes = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(pdfBytes);
                const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => pdfDoc.addPage(page));
            }
            const mergedBytes = await pdfDoc.save();
            results.push({ name: `${groupName}.pdf`, bytes: mergedBytes });
        }
        return results;
    }

    function displayMergedFiles(files) {
        qrDisplay.innerHTML = '';
        files.forEach(({ name, bytes }) => {
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.textContent = name;
            link.download = name;
            link.classList.add('merged-file-link');
            qrDisplay.appendChild(link);
            qrDisplay.appendChild(document.createElement('br'));
        });
        downloadBtn.style.display = 'block';
    }

    // Reset files
    document.getElementById('reset-btn').addEventListener('click', function () {
        files = [];
        fileList.innerHTML = '';
        pdfInput.value = ''; // Reset input file

        // Show "Drag & Drop PDF di sini" text
        const dropText = dropSection.querySelector('p');
        if (dropText) {
            dropText.style.display = 'block';
        }

        // Hide download button and QR display
        qrDisplay.innerHTML = '';
        downloadBtn.style.display = 'none';
    });
});
