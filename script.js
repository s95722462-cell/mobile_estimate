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
        estimateItemsEl.innerHTML = '';
        let total = 0;

        state.items.forEach((item, index) => {
            const row = document.createElement('tr');
            const amount = parseNumber(item.qty) * parseNumber(item.price);
            total += amount;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="item-name-input" data-index="${index}" data-field="name" value="${item.name}"></td>
                <td><input type="number" class="item-input" data-index="${index}" data-field="qty" value="${item.qty}" placeholder="0"></td>
                <td><input type="text" class="item-input" data-index="${index}" data-field="price" value="${formatNumber(item.price)}" placeholder="0"></td>
                <td>${formatNumber(amount)}</td>
                <td class="print-hide"><button class="delete-item-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button></td>
            `;
            estimateItemsEl.appendChild(row);
        });
        totalAmountEl.textContent = formatNumber(total);
        saveState();
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

    // --- Event Handlers ---
    const handleItemChange = (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        const field = e.target.dataset.field;
        let value = e.target.value;

        if (field === 'price') {
            state.items[index][field] = parseNumber(value);
            e.target.value = formatNumber(value); // Re-format the input field
        } else {
            state.items[index][field] = value;
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
        const emptyRowIndex = state.items.findIndex(item => item.name === '' && item.qty === '' && item.price === '');
        if (emptyRowIndex !== -1) {
            state.items[emptyRowIndex] = { ...state.items[emptyRowIndex], name: product.name, qty: '1', price: product.price };
        } else {
            state.items.push({ id: Date.now(), name: product.name, qty: '1', price: product.price });
        }
        renderTable();
        closeModal(productModal);
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
                state.sealImage = reader.result;
                renderSupplierInfo();
                saveState();
            };
            reader.readAsDataURL(file);
        } else {
            renderSupplierInfo();
            saveState();
        }
        closeModal(supplierModal);
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
        printHideElements.forEach(el => el.style.visibility = 'hidden');

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
            printHideElements.forEach(el => el.style.visibility = 'visible');
        }
    });

    // --- General Event Listeners ---
    addItemBtn.addEventListener('click', handleAddItemRow);
    estimateItemsEl.addEventListener('input', handleItemChange);
    estimateItemsEl.addEventListener('click', (e) => {
        if (e.target.closest('.delete-item-btn')) {
            handleDeleteItemRow(parseInt(e.target.closest('.delete-item-btn').dataset.index, 10));
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