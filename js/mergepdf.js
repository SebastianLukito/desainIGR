document.addEventListener('DOMContentLoaded', function () {
    const mergeBtn = document.getElementById('merge-btn');
    const pdfInput = document.getElementById('pdf');
    const qrDisplay = document.getElementById('qr-display');
    const downloadBtn = document.getElementById('download-btn');
    const dropSection = document.getElementById('drop-section');
    const fileList = document.getElementById('file-list');
    const loadingPopup = document.getElementById('loading-popup');
    const megabyteSlider = document.getElementById('megabyte-slider');
    const megabyteInput = document.getElementById('megabyte-input');
    const percentageSlider = document.getElementById('percentage-slider');
    const percentageInput = document.getElementById('percentage-input');
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

        const percentage = parseInt(percentageInput.value, 10);
        const megabyte = parseInt(megabyteInput.value, 10);
        console.log('Merging PDFs with percentage:', percentage, 'and megabyte:', megabyte);

        handleFiles(files, percentage, megabyte);
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

    async function handleFiles(files, percentage, megabyte) {
        try {
            const images = [];
            for (const file of files) {
                const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
                const numPages = pdf.numPages;
                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    images.push(canvas.toDataURL('image/jpeg', getQuality(percentage, megabyte)));
                }
            }

            console.log('Images converted, total images:', images.length);

            const compressedPdfBytes = await createPdfFromImages(images);
            console.log('PDF created from images, size:', compressedPdfBytes.length / (1024 * 1024), 'MB');

            const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.width = '100%';
            iframe.height = '500px';
            qrDisplay.innerHTML = '';
            qrDisplay.appendChild(iframe);

            downloadBtn.style.display = 'block';
            downloadBtn.onclick = function () {
                const a = document.createElement('a');
                a.href = url;
                a.download = 'hasil.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
            };

            loadingPopup.style.display = 'none';

            console.log('PDF merged and displayed successfully.');
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error merging PDFs. Please try again.');
            loadingPopup.style.display = 'none';
        }
    }

    function getQuality(percentage, megabyte) {
        const qualityMap = {
            1: 0.1,
            2: 0.2,
            3: 0.3,
            4: 0.4,
            5: 0.5,
            6: 0.6,
            7: 0.7,
            8: 0.8,
            9: 0.9,
            10: 1.0
        };
        const scale = megabyte > 100 ? 10 : megabyte > 50 ? 8 : megabyte > 20 ? 6 : 4;
        return qualityMap[scale];
    }

    async function createPdfFromImages(images) {
        const pdfDoc = await PDFLib.PDFDocument.create();
        for (const imageDataUrl of images) {
            const img = await pdfDoc.embedJpg(imageDataUrl);
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, {
                x: 0,
                y: 0,
                width: img.width,
                height: img.height
            });
        }
        return await pdfDoc.save();
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

    // Tab functionality
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    tabItems.forEach(item => {
        item.addEventListener('click', function () {
            tabItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(item.dataset.tab).classList.add('active');
        });
    });

    // Synchronize slider and input for megabyte
    megabyteSlider.addEventListener('input', function () {
        megabyteInput.value = megabyteSlider.value;
        console.log('Megabyte Slider Value:', megabyteSlider.value);
    });

    megabyteInput.addEventListener('input', function () {
        megabyteSlider.value = megabyteInput.value;
        console.log('Megabyte Input Value:', megabyteInput.value);
    });

    // Synchronize slider and input for percentage
    percentageSlider.addEventListener('input', function () {
        percentageInput.value = percentageSlider.value;
        console.log('Percentage Slider Value:', percentageSlider.value);
    });

    percentageInput.addEventListener('input', function () {
        percentageSlider.value = percentageInput.value;
        console.log('Percentage Input Value:', percentageInput.value);
    });
});
