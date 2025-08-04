document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const pngDropZone = document.getElementById('png-drop-zone');
    const zipDropZone = document.getElementById('zip-drop-zone');
    const pngInput = document.getElementById('png-input');
    const zipInput = document.getElementById('zip-input');
    const pngFileName = document.getElementById('png-file-name');
    const zipFileName = document.getElementById('zip-file-name');
    const generateBtn = document.getElementById('generate-btn');
    const statusArea = document.getElementById('status-area');
    const statusText = document.getElementById('status-text');
    let pngFileInfo = null;
    let zipFileInfo = null;

    // 添加水滴动画效果
    const createRipple = (element, e) => {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) * 2 + 'px';
        ripple.style.left = x - (parseInt(ripple.style.width) / 2) + 'px';
        ripple.style.top = y - (parseInt(ripple.style.height) / 2) + 'px';
        ripple.classList.add('ripple');
        
        const existing = element.querySelector('.ripple');
        if (existing) existing.remove();
        
        element.appendChild(ripple);
    };

    const setupDropZone = (dropZone, input, fileHandler) => {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
                // 添加拖拽时的缩放效果
                dropZone.style.transform = 'scale(1.03)';
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
                // 恢复缩放
                dropZone.style.transform = 'scale(1)';
            }, false);
        });
        
        dropZone.addEventListener('drop', (e) => {
            createRipple(dropZone, e);
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                input.files = files;
                handleFile(files[0], fileHandler);
            }
        }, false);
        
        dropZone.addEventListener('click', (e) => {
            if (!dropZone.classList.contains('file-selected')) {
                createRipple(dropZone, e);
            }
        });
        
        input.addEventListener('change', () => {
             if (input.files.length > 0) {
                handleFile(input.files[0], fileHandler);
            }
        });
    };

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    async function handleFile(file, fileHandler) {
        const { isValid, message } = fileHandler.validator(file);
        if (isValid) {
            try {
                // 添加文件处理动画
                const dropZone = fileHandler === pngHandler ? pngDropZone : zipDropZone;
                dropZone.classList.add('processing');
                
                const fileInfo = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file
                };
                fileHandler.setFile(fileInfo);
                fileHandler.updateUI(file.name, true);
                
                // 移除处理动画
                setTimeout(() => {
                    dropZone.classList.remove('processing');
                }, 600);
            } catch (error) {
                console.error('Error processing file:', error);
                fileHandler.setFile(null);
                fileHandler.updateUI('处理文件时出错', false);
                alert('处理文件时出错，请重新选择文件');
            }
        } else {
            fileHandler.setFile(null);
            fileHandler.updateUI(message, false);
            alert(message);
        }
        updateGenerateButtonState();
    }
    
    const pngHandler = {
        setFile: (fileInfo) => pngFileInfo = fileInfo,
        validator: (file) => {
            if (!file) return { isValid: false, message: 'No file selected.' };
            if (file.type !== 'image/png') return { isValid: false, message: '错误: 封面必须是 PNG 图片!' };
            return { isValid: true };
        },
        updateUI: (text, success) => {
            pngFileName.textContent = text;
            pngFileName.classList.toggle('text-red-500', !success);
            pngFileName.classList.toggle('text-slate-500', success);
            pngDropZone.classList.toggle('file-selected', success);
            
            // 添加成功动画
            if (success) {
                pngDropZone.classList.add('success-animation');
                setTimeout(() => {
                    pngDropZone.classList.remove('success-animation');
                }, 800);
            }
        }
    };
    
    const zipHandler = {
        setFile: (fileInfo) => zipFileInfo = fileInfo,
        validator: (file) => {
            if (!file) return { isValid: false, message: 'No file selected.' };
            const zipMimeTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'];
            const isZip = zipMimeTypes.includes(file.type) || new RegExp('\\.zip$', 'i').test(file.name);
            if (!isZip) return { isValid: false, message: '错误: 压缩包必须是 ZIP 文件!' };
            return { isValid: true };
        },
        updateUI: (text, success) => {
            zipFileName.textContent = text;
            zipFileName.classList.toggle('text-red-500', !success);
            zipFileName.classList.toggle('text-slate-500', success);
            zipDropZone.classList.toggle('file-selected', success);
            
            // 添加成功动画
            if (success) {
                zipDropZone.classList.add('success-animation');
                setTimeout(() => {
                    zipDropZone.classList.remove('success-animation');
                }, 800);
            }
        }
    };
    
    setupDropZone(pngDropZone, pngInput, pngHandler);
    setupDropZone(zipDropZone, zipInput, zipHandler);
    
    function updateGenerateButtonState() {
        generateBtn.disabled = !(pngFileInfo && zipFileInfo);
        
        // 按钮状态变化动画
        if (!generateBtn.disabled) {
            generateBtn.classList.add('ready');
        } else {
            generateBtn.classList.remove('ready');
        }
    }
    
    function updateStatus(message, type = 'info') {
        statusArea.innerHTML = '';
        const textElement = document.createElement('p');
        textElement.id = 'status-text';
        
        if (type === 'error') {
            textElement.className = 'text-red-600 font-medium';
        } else if (type === 'processing') {
            textElement.className = 'text-blue-600 font-medium flex items-center justify-center';
        } else {
             textElement.className = 'text-slate-500';
        }
        
        textElement.innerHTML = message;
        statusArea.appendChild(textElement);
    }
    
    function updateProgress(percent) {
        // 确保进度容器存在
        let progressContainer = document.getElementById('progress-container');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.className = 'progress-container';
            
            const progressBar = document.createElement('div');
            progressBar.id = 'progress-bar';
            progressBar.className = 'progress-bar';
            
            progressContainer.appendChild(progressBar);
            statusArea.appendChild(progressContainer);
        }
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }
    
    async function blobToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });
    }
    
    async function modifyZipOffsets(zipFile, pngSize) {
        const EOCD_SIGNATURE = 0x06054b50;
        const ZIP64_EOCD_LOCATOR_SIGNATURE = 0x07064b50;
        const ZIP64_EOCD_SIGNATURE = 0x06064b50;
        const CD_HEADER_SIGNATURE = 0x02014b50;
        const EOCD_MIN_SIZE = 22;
        const MAX_COMMENT_LENGTH = 65535;
        const EOCD_SEARCH_RANGE = EOCD_MIN_SIZE + MAX_COMMENT_LENGTH;
        const MAX_UINT32 = 0xFFFFFFFF;
        const fileSize = zipFile.size;
        const searchSize = Math.min(EOCD_SEARCH_RANGE, fileSize);
        const searchStart = Math.max(0, fileSize - searchSize);
        
        const endChunk = zipFile.slice(searchStart);
        const endBuffer = await blobToArrayBuffer(endChunk);
        const endView = new DataView(endBuffer);
        let eocdOffset = -1;
        for (let i = endBuffer.byteLength - EOCD_MIN_SIZE; i >= 0; i--) {
            if (endView.getUint32(i, true) === EOCD_SIGNATURE) {
                eocdOffset = searchStart + i;
                break;
            }
        }
        if (eocdOffset === -1) {
            throw new Error('无法找到ZIP文件的中央目录结束记录 (EOCD)。文件可能已损坏。');
        }
        const eocdSize = fileSize - eocdOffset;
        const eocdBlob = zipFile.slice(eocdOffset);
        const eocdBuffer = await blobToArrayBuffer(eocdBlob);
        const eocdView = new DataView(eocdBuffer);
        let isZip64 = false;
        let zip64EocdRecordOffset = -1;
        let zip64CdStartOffset = BigInt(0);
        let zip64EocdLocatorOffset = -1;
        const locatorSearchStart = Math.max(0, eocdOffset - 256);
        if (locatorSearchStart < eocdOffset) {
            const locatorSearchBlob = zipFile.slice(locatorSearchStart, eocdOffset);
            const locatorBuffer = await blobToArrayBuffer(locatorSearchBlob);
            const locatorView = new DataView(locatorBuffer);
            for (let i = locatorBuffer.byteLength - 20; i >= 0; i--) {
                if (locatorView.getUint32(i, true) === ZIP64_EOCD_LOCATOR_SIGNATURE) {
                    zip64EocdLocatorOffset = locatorSearchStart + i;
                    break;
                }
            }
        }
        if (zip64EocdLocatorOffset !== -1) {
            isZip64 = true;
            const zip64LocatorBlob = zipFile.slice(zip64EocdLocatorOffset, zip64EocdLocatorOffset + 20);
            const zip64LocatorBuffer = await blobToArrayBuffer(zip64LocatorBlob);
            const zip64LocatorView = new DataView(zip64LocatorBuffer);
            const oldZip64EocdOffset = zip64LocatorView.getBigUint64(8, true);
            zip64EocdRecordOffset = Number(oldZip64EocdOffset);
            const zip64EocdBlob = zipFile.slice(zip64EocdRecordOffset, zip64EocdRecordOffset + 56);
            const zip64EocdBuffer = await blobToArrayBuffer(zip64EocdBlob);
            const zip64EocdView = new DataView(zip64EocdBuffer);
            if (zip64EocdView.getUint32(0, true) !== ZIP64_EOCD_SIGNATURE) {
                throw new Error('ZIP64 EOCD 定位符指向一个无效的记录位置。文件可能已损坏。');
            }
            const newZip64EocdOffset = oldZip64EocdOffset + BigInt(pngSize);
            zip64LocatorView.setBigUint64(8, newZip64EocdOffset, true);
            zip64CdStartOffset = zip64EocdView.getBigUint64(48, true);
            const newZip64CdStartOffset = zip64CdStartOffset + BigInt(pngSize);
            zip64EocdView.setBigUint64(48, newZip64CdStartOffset, true);
            const updatedZip64LocatorBlob = new Blob([zip64LocatorBuffer]);
            const updatedZip64EocdBlob = new Blob([zip64EocdBuffer]);
            
            zipFile = new Blob([
                zipFile.slice(0, zip64EocdLocatorOffset),
                updatedZip64LocatorBlob,
                zipFile.slice(zip64EocdLocatorOffset + 20, zip64EocdRecordOffset),
                updatedZip64EocdBlob,
                zipFile.slice(zip64EocdRecordOffset + 56)
            ]);
        }
        const cdEntryCount32 = eocdView.getUint16(10, true);
        const cdStartOffset32 = eocdView.getUint32(16, true);
        
        let cdEntryCount, cdStartOffset;
        if (isZip64) {
            const zip64EocdBlob = zipFile.slice(zip64EocdRecordOffset, zip64EocdRecordOffset + 56);
            const zip64EocdBuffer = await blobToArrayBuffer(zip64EocdBlob);
            const zip64EocdView = new DataView(zip64EocdBuffer);
            cdEntryCount = Number(zip64EocdView.getBigUint64(32, true));
            cdStartOffset = Number(zip64CdStartOffset);
        } else {
            cdEntryCount = cdEntryCount32;
            cdStartOffset = cdStartOffset32;
        }
        const cdSize = eocdOffset - cdStartOffset;
        const centralDirBlob = zipFile.slice(cdStartOffset, eocdOffset);
        const centralDirBuffer = await blobToArrayBuffer(centralDirBlob);
        const cdView = new DataView(centralDirBuffer);
        
        function updateZip64ExtraFieldOffset(view, extraFieldStart, extraFieldLength, pngSize, cdfhStart) {
            let offset = extraFieldStart;
            const end = extraFieldStart + extraFieldLength;
            while (offset < end - 4) {
                const headerId = view.getUint16(offset, true);
                const dataSize = view.getUint16(offset + 2, true);
                const dataStart = offset + 4;
                if (dataStart + dataSize > end) return false;
                if (headerId === 0x0001) {
                    let dataPtr = dataStart;
                    const cdfhUncompressedSize = view.getUint32(cdfhStart + 24, true);
                    const cdfhCompressedSize = view.getUint32(cdfhStart + 20, true);
                    const cdfhRelativeOffset = view.getUint32(cdfhStart + 42, true);
                    if (cdfhUncompressedSize === MAX_UINT32) {
                        if (dataPtr + 8 > dataStart + dataSize) return false;
                        dataPtr += 8;
                    }
                    if (cdfhCompressedSize === MAX_UINT32) {
                        if (dataPtr + 8 > dataStart + dataSize) return false;
                        dataPtr += 8;
                    }
                    if (cdfhRelativeOffset === MAX_UINT32) {
                        if (dataPtr + 8 > dataStart + dataSize) return false;
                        const oldOffset64 = view.getBigUint64(dataPtr, true);
                        const newOffset64 = oldOffset64 + BigInt(pngSize);
                        view.setBigUint64(dataPtr, newOffset64, true);
                        return true;
                    }
                }
                offset += 4 + dataSize;
            }
            return false;
        }
        
        let currentCdOffset = 0;
        for (let i = 0; i < cdEntryCount; i++) {
            if (currentCdOffset + 46 > cdView.byteLength || cdView.getUint32(currentCdOffset, true) !== CD_HEADER_SIGNATURE) {
                throw new Error(`中央目录记录 ${i} 签名无效或文件已损坏。`);
            }
            const localHeaderOffsetField = currentCdOffset + 42;
            const oldOffset32 = cdView.getUint32(localHeaderOffsetField, true);
            if (oldOffset32 === MAX_UINT32) {
                const fileNameLength = cdView.getUint16(currentCdOffset + 28, true);
                const extraFieldLength = cdView.getUint16(currentCdOffset + 30, true);
                const extraFieldOffset = currentCdOffset + 46 + fileNameLength;
                if (!updateZip64ExtraFieldOffset(cdView, extraFieldOffset, extraFieldLength, pngSize, currentCdOffset)) {
                    throw new Error(`条目 ${i}: 无法在扩展字段中更新64位文件偏移量。`);
                }
            } else {
                const newOffset = oldOffset32 + pngSize;
                if (newOffset > MAX_UINT32) {
                    throw new Error(`不支持的操作：文件合并后偏移量将超过4GB，原始ZIP文件非ZIP64格式。为防止文件损坏，操作已中止。`);
                }
                cdView.setUint32(localHeaderOffsetField, newOffset, true);
            }
            const fileNameLength = cdView.getUint16(currentCdOffset + 28, true);
            const extraFieldLength = cdView.getUint16(currentCdOffset + 30, true);
            const fileCommentLength = cdView.getUint16(currentCdOffset + 32, true);
            const entrySize = 46 + fileNameLength + extraFieldLength + fileCommentLength;
            currentCdOffset += entrySize;
        }
        const newCdStartOffset32 = cdStartOffset + pngSize;
        if (newCdStartOffset32 < MAX_UINT32) {
            eocdView.setUint32(16, newCdStartOffset32, true);
        } else {
            eocdView.setUint32(16, MAX_UINT32, true);
            if (!isZip64) {
                throw new Error("文件合并后中央目录偏移量超过4GB，但原始文件不是ZIP64格式。此操作不受支持。");
            }
        }
        const modifiedCentralDirBlob = new Blob([centralDirBuffer]);
        const modifiedEocdBlob = new Blob([eocdBuffer]);
        const finalBlob = new Blob([
            zipFile.slice(0, cdStartOffset),
            modifiedCentralDirBlob,
            modifiedEocdBlob
        ]);
        return finalBlob;
    }
    
    async function generateFile() {
        if (!pngFileInfo || !zipFileInfo) {
            updateStatus('请确保已正确上传 PNG 和 ZIP 文件。', 'error');
            return;
        }
        generateBtn.disabled = true;
        
        // 添加按钮加载动画
        generateBtn.innerHTML = '<i class="animate-spin w-5 h-5 mr-2" data-lucide="loader-2"></i>处理中...';
        lucide.createIcons({ nodes: generateBtn.querySelectorAll('[data-lucide]') });
        
        const spinIconUpdater = (message) => {
            updateStatus(`<i class="animate-spin mr-2" data-lucide="loader-2"></i> ${message}`, 'processing');
            lucide.createIcons({ nodes: statusArea.querySelectorAll('[data-lucide]') });
        };
        spinIconUpdater('正在初始化...');
        
        try {
            spinIconUpdater('正在分析ZIP文件结构...');
            const pngSize = pngFileInfo.size;
            await new Promise(resolve => setTimeout(resolve, 800));
            
            spinIconUpdater('正在修改ZIP文件偏移量 (内存优化处理)...');
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 模拟进度
            updateProgress(30);
            await new Promise(resolve => setTimeout(resolve, 500));
            updateProgress(60);
            
            const modifiedZipBlob = await modifyZipOffsets(zipFileInfo.file, pngSize);
            
            updateProgress(80);
            spinIconUpdater('正在生成最终文件...');
            await new Promise(resolve => setTimeout(resolve, 600));
            
            const finalBlob = new Blob([pngFileInfo.file, modifiedZipBlob], { type: 'image/png' });
            const url = URL.createObjectURL(finalBlob);
            const originalPngName = pngFileInfo.name.substring(0, pngFileInfo.name.lastIndexOf('.')) || 'image';
            const finalFileName = `disguised_${originalPngName}.png`;
            
            // 成功动画效果
            statusArea.innerHTML = `
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 p-2 animate-fade-in success-message">
                    <div class="flex flex-col items-center">
                        <p class="text-teal-600 font-bold flex items-center text-lg">
                            <i data-lucide="check-circle-2" class="w-6 h-6 mr-2 text-teal-500"></i>合成成功!
                        </p>
                        <p class="text-sm text-slate-500 mt-1">文件大小: ${(finalBlob.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <a href="${url}" download="${finalFileName}" class="download-button inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 focus:outline-none transition-all duration-300">
                        <i data-lucide="download" class="w-5 h-5 mr-2"></i>
                        下载文件
                    </a>
                </div>`;
            lucide.createIcons();
            
        } catch (error) {
            console.error('File processing error:', error);
            updateStatus(`<i class="w-5 h-5 mr-2" data-lucide="alert-circle"></i> 处理文件时发生严重错误: ${error.message}`, 'error');
            lucide.createIcons();
        } finally {
            // 恢复按钮状态
            generateBtn.innerHTML = '<i data-lucide="wand-sparkles" class="w-5 h-5 mr-2"></i>开始合成';
            lucide.createIcons({ nodes: generateBtn.querySelectorAll('[data-lucide]') });
            generateBtn.disabled = false;
        }
    }
    
    generateBtn.addEventListener('click', generateFile);
    updateGenerateButtonState();
    
    // 添加背景粒子效果
    function createBackgroundParticles() {
        const bgContainer = document.querySelector('.absolute.inset-0.overflow-hidden.-z-10');
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.classList.add('bg-particle');
            particle.style.width = `${Math.random() * 20 + 5}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animation = `float ${Math.random() * 8 + 4}s infinite ease-in-out`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            bgContainer.appendChild(particle);
        }
    }
    
    createBackgroundParticles();
});