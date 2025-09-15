document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const issueDateEl = document.getElementById('issue-date');
    const customerNameEl = document.getElementById('customer-name');
    const remarksEl = document.getElementById('remarks');
    const supplierCompanyEl = document.getElementById('supplier-company');
    const supplierPersonEl = document.getElementById('supplier-person');
    const supplierPhoneEl = document.getElementById('supplier-phone');
    const sealImageDisplayEl = document.getElementById('seal-image-display');
    const estimateItemsEl = document.getElementById('estimate-items');
    const totalAmountEl = document.getElementById('total-amount');
    const addItemBtn = document.getElementById('add-item-btn');
    const saveImageBtn = document.getElementById('save-image-btn');
    const estimateSheetEl = document.getElementById('estimate-sheet');

    // Modals & Menu
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const mainMenuModal = document.getElementById('main-menu-modal');
    const supplierSettingsBtn = document.getElementById('supplier-settings-btn');
    const productSettingsBtn = document.getElementById('product-settings-btn');
    const supplierModal = document.getElementById('supplier-modal');
    const productModal = document.getElementById('product-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');

    // Supplier Modal Elements
    const modalSupplierCompany = document.getElementById('modal-supplier-company');
    const modalSupplierPerson = document.getElementById('modal-supplier-person');
    const modalSupplierPhone = document.getElementById('modal-supplier-phone');
    const sealUploadInput = document.getElementById('seal-upload-input');
    const sealPreview = document.getElementById('seal-preview');
    const saveSupplierBtn = document.getElementById('save-supplier-btn');

    // Product Modal Elements
    const addProductBtn = document.getElementById('add-product-btn');
    const newProductName = document.getElementById('new-product-name');
    const newProductPrice = document.getElementById('new-product-price');
    const productList = document.getElementById('product-list');

    // --- State ---
    let state = {
        items: [{ id: Date.now(), name: '', qty: '', price: '' }],
        customerName: '',
        remarks: '',
        issueDate: new Date().toISOString().split('T')[0],
        supplierInfo: { company: '', contactPerson: '', phone: '' },
        sealImage: null,
        savedProducts: []
    };

    // --- Helper Functions ---
    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '') return '';
        return Number(num).toLocaleString('ko-KR');
    };

    const parseNumber = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            return Number(val.replace(/,/g, '')) || 0;
        }
        return 0;
    };

    // --- State & LocalStorage Management ---
    const saveState = () => {
        localStorage.setItem('estimateState', JSON.stringify({
            customerName: state.customerName,
            remarks: state.remarks,
            issueDate: state.issueDate,
            items: state.items
        }));
        localStorage.setItem('supplierInfo', JSON.stringify(state.supplierInfo));
        if (state.sealImage) localStorage.setItem('sealImage', state.sealImage);
        localStorage.setItem('savedProducts', JSON.stringify(state.savedProducts));
    };

    const loadState = () => {
        const saved = localStorage.getItem('estimateState');
        const savedSupplier = localStorage.getItem('supplierInfo');
        const savedSeal = localStorage.getItem('sealImage');
        const savedProducts = localStorage.getItem('savedProducts');

        if (saved) {
            const loadedState = JSON.parse(saved);
            state = { ...state, ...loadedState };
            if (state.items.length === 0) {
                 state.items = [{ id: Date.now(), name: '', qty: '', price: '' }];
            }
        }
        if (savedSupplier) state.supplierInfo = JSON.parse(savedSupplier);
        if (savedSeal) state.sealImage = savedSeal;
        if (savedProducts) state.savedProducts = JSON.parse(savedProducts);
    };

    // --- Render Functions ---
    const renderAll = () => {
        renderTable();
        renderSupplierInfo();
        renderProductList();
        customerNameEl.value = state.customerName;
        remarksEl.value = state.remarks;
        issueDateEl.value = state.issueDate;
    };

    const renderSupplierInfo = () => {
        supplierCompanyEl.textContent = state.supplierInfo.company;
        supplierPersonEl.textContent = state.supplierInfo.contactPerson;
        supplierPhoneEl.textContent = state.supplierInfo.phone;
        if (state.sealImage) {
            sealImageDisplayEl.src = state.sealImage;
            sealImageDisplayEl.style.display = 'inline-block';
        } else {
            sealImageDisplayEl.style.display = 'none';
        }
    };

    const renderTable = () => {
        // 1. 현재 포커스된 요소와 커서 위치를 기억합니다.
        const activeElement = document.activeElement;
        const activeIndex = activeElement.dataset ? activeElement.dataset.index : null;
        const activeField = activeElement.dataset ? activeElement.dataset.field : null;
        const selectionStart = activeElement.selectionStart;
        const selectionEnd = activeElement.selectionEnd;

        estimateItemsEl.innerHTML = '';
        let total = 0;

        state.items.forEach((item, index) => {
            const row = document.createElement('tr');
            const amount = parseNumber(item.qty) * parseNumber(item.price);
            total += amount;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="item-name-input-wrapper">
                        <input type="text" class="item-name-input" data-index="${index}" data-field="name" value="${item.name}">
                        <button class="select-product-btn print-hide" data-index="${index}"><i class="fas fa-search"></i></button>
                    </div>
                </td>
                <td><input type="text" class="item-input" data-index="${index}" data-field="qty" value="${item.qty}" placeholder="0"></td>
                <td><input type="text" class="item-input" data-index="${index}" data-field="price" value="${formatNumber(item.price)}" placeholder="0"></td>
                <td>${formatNumber(amount)}</td>
                <td class="print-hide"><button class="delete-item-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button></td>
            `;
            estimateItemsEl.appendChild(row);
        });
        totalAmountEl.textContent = formatNumber(total);
        saveState();

        // 2. 기억해둔 위치로 포커스를 되돌립니다.
        if (activeIndex && activeField) {
            const newActiveElement = estimateItemsEl.querySelector(`[data-index="${activeIndex}"][data-field="${activeField}"]`);
            if (newActiveElement) {
                newActiveElement.focus();
                try {
                    newActiveElement.setSelectionRange(selectionStart, selectionEnd);
                } catch (e) {
                    // 일부 입력 타입에서는 setSelectionRange가 실패할 수 있으므로 오류를 무시합니다.
                }
            }
        }
    };

    const renderProductList = () => {
        productList.innerHTML = '';
        state.savedProducts.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${product.name} (${formatNumber(product.price)}원)</span>
                <button class="delete-product-btn" data-name="${product.name}"><i class="fas fa-times"></i></button>
            `;
            li.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
                    handleSelectProduct(product);
                }
            });
            productList.appendChild(li);
        });
    };

    let activeRowIndex = null; // 품목 선택 시 현재 행의 인덱스를 추적

    // --- Event Handlers ---
    const handleItemChange = (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        const field = e.target.dataset.field;
        const value = e.target.value;

        // 품명/규격 입력 시: 화면을 다시 그리지 않고 상태만 업데이트
        if (field === 'name') {
            state.items[index].name = value;
            saveState(); // 값 저장은 하되, 화면은 그대로 둠
            return; // 여기서 함수 종료
        }

        // 수량 또는 단가 입력 시: 상태 업데이트 후 화면을 다시 그려서 계산
        if (field === 'price') {
            state.items[index].price = parseNumber(value);
        } else { // field === 'qty'
            state.items[index].qty = value;
        }
        renderTable();
    };

    const handleAddItemRow = () => {
        state.items.push({ id: Date.now(), name: '', qty: '', price: '' });
        renderTable();
    };

    const handleDeleteItemRow = (index) => {
        if (state.items.length > 1) {
            state.items.splice(index, 1);
        } else {
            state.items = [{ id: Date.now(), name: '', qty: '', price: '' }];
        }
        renderTable();
    };
    
    const handleSelectProduct = (product) => {
        // activeRowIndex가 null이 아니면, 특정 행을 수정하는 중
        if (activeRowIndex !== null) {
            const index = parseInt(activeRowIndex, 10);
            state.items[index].name = product.name;
            state.items[index].price = product.price;
            // 수량이 비어있으면 1로 설정
            if (!state.items[index].qty || state.items[index].qty === '0') {
                state.items[index].qty = '1';
            }
        } else {
            // 기존 로직: 비어있는 행을 찾거나 새로 추가
            const emptyRowIndex = state.items.findIndex(item => item.name === '' && item.qty === '' && item.price === '');
            if (emptyRowIndex !== -1) {
                state.items[emptyRowIndex] = { ...state.items[emptyRowIndex], name: product.name, qty: '1', price: product.price };
            } else {
                state.items.push({ id: Date.now(), name: product.name, qty: '1', price: product.price });
            }
        }
        renderTable();
        closeModal(productModal);
        activeRowIndex = null; // 작업 완료 후 초기화
    };

    // --- Modal Handling ---
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';

    mainMenuBtn.addEventListener('click', () => openModal(mainMenuModal));
    supplierSettingsBtn.addEventListener('click', () => {
        closeModal(mainMenuModal);
        openModal(supplierModal);
        modalSupplierCompany.value = state.supplierInfo.company;
        modalSupplierPerson.value = state.supplierInfo.contactPerson;
        modalSupplierPhone.value = state.supplierInfo.phone;
        sealPreview.src = state.sealImage;
        sealPreview.style.display = state.sealImage ? 'block' : 'none';
    });
    productSettingsBtn.addEventListener('click', () => {
        activeRowIndex = null; // 관리 모드에서는 특정 행 선택이 아님
        closeModal(mainMenuModal);
        openModal(productModal);
    });
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = document.getElementById(btn.dataset.target);
            closeModal(modal);
        });
    });

    // --- Supplier Logic ---
    saveSupplierBtn.addEventListener('click', () => {
        state.supplierInfo = {
            company: modalSupplierCompany.value,
            contactPerson: modalSupplierPerson.value,
            phone: modalSupplierPhone.value,
        };

        const file = sealUploadInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const threshold = 240; // 흰색으로 간주할 밝기 임계값
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        // 픽셀이 흰색에 가까우면 투명하게 만듭니다.
                        if (r > threshold && g > threshold && b > threshold) {
                            data[i + 3] = 0; // Alpha 채널을 0으로 설정
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);
                    
                    state.sealImage = canvas.toDataURL('image/png');
                    renderSupplierInfo();
                    saveState();
                    closeModal(supplierModal);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        } else {
            // 새 파일이 선택되지 않은 경우, 텍스트 정보만 저장합니다.
            renderSupplierInfo();
            saveState();
            closeModal(supplierModal);
        }
    });

    sealUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                sealPreview.src = reader.result;
                sealPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Product Logic ---
    addProductBtn.addEventListener('click', () => {
        const name = newProductName.value.trim();
        const price = parseNumber(newProductPrice.value);
        if (name && price > 0) {
            if (!state.savedProducts.some(p => p.name === name)) {
                state.savedProducts.push({ name, price });
                newProductName.value = '';
                newProductPrice.value = '';
                renderProductList();
                saveState();
            } else {
                alert('이미 동일한 이름의 품명이 존재합니다.');
            }
        }
    });

    productList.addEventListener('click', (e) => {
        if (e.target.closest('.delete-product-btn')) {
            const name = e.target.closest('.delete-product-btn').dataset.name;
            state.savedProducts = state.savedProducts.filter(p => p.name !== name);
            renderProductList();
            saveState();
        }
    });

    // --- Image Saving ---
    saveImageBtn.addEventListener('click', async () => {
        const sheet = document.getElementById('estimate-sheet');
        const printHideElements = sheet.querySelectorAll('.print-hide');
        
        // Hide elements smartly
        printHideElements.forEach(el => {
            if (el.tagName === 'TD' || el.tagName === 'TH') {
                Array.from(el.children).forEach(child => child.style.visibility = 'hidden');
            } else {
                el.style.visibility = 'hidden';
            }
        });

        try {
            const canvas = await html2canvas(sheet, {
                scale: 2,
                useCORS: true,
                onclone: (clonedDoc) => {
                    // Replace inputs with static text in the clone
                    const inputs = clonedDoc.querySelectorAll('input, textarea');
                    inputs.forEach(input => {
                        const span = clonedDoc.createElement('span');
                        span.textContent = input.value;
                        span.style.cssText = window.getComputedStyle(input).cssText;
                        span.style.border = 'none';
                        if (input.tagName === 'TEXTAREA') {
                            span.style.whiteSpace = 'pre-wrap';
                        }
                        input.parentNode.replaceChild(span, input);
                    });
                }
            });
            const link = document.createElement('a');
            link.download = `${state.customerName || '견적서'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } finally {
            // Restore visibility smartly
            printHideElements.forEach(el => {
                if (el.tagName === 'TD' || el.tagName === 'TH') {
                    Array.from(el.children).forEach(child => child.style.visibility = 'visible');
                } else {
                    el.style.visibility = 'visible';
                }
            });
        }
    });

    // --- General Event Listeners ---
    addItemBtn.addEventListener('click', handleAddItemRow);
    estimateItemsEl.addEventListener('change', handleItemChange);
    estimateItemsEl.addEventListener('click', (e) => {
        if (e.target.closest('.delete-item-btn')) {
            handleDeleteItemRow(parseInt(e.target.closest('.delete-item-btn').dataset.index, 10));
        }
        // 새로운 기능: 품명/규격 옆의 버튼 클릭 시 품목 선택창 열기
        if (e.target.closest('.select-product-btn')) {
            const index = e.target.closest('.select-product-btn').dataset.index;
            activeRowIndex = index;
            openModal(productModal);
        }
    });
    customerNameEl.addEventListener('input', (e) => {
        state.customerName = e.target.value;
        saveState();
    });
    remarksEl.addEventListener('input', (e) => {
        state.remarks = e.target.value;
        saveState();
    });
    issueDateEl.addEventListener('change', (e) => {
        state.issueDate = e.target.value;
        saveState();
    });

    // --- Initial Load ---
    loadState();
    renderAll();
});