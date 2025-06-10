
// Initialize form elements and event listeners

document.addEventListener('DOMContentLoaded', function () {
    generateTxnId();
    setupEndpointSelection();
    setupRidWatcher();
    toggleCardFields(); // Initialize card fields based on default txnType
});






//  Function to set up endpoint selection
// This function adds click event listeners to each endpoint option
function setupEndpointSelection() {
    const options = document.querySelectorAll('.endpoint-option');
    options.forEach(option => {
        option.addEventListener('click', function () {
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
}



// Function to generate a Transaction ID
// This function creates a unique ID based on the current timestamp and a random number
function generateTxnId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const txnId = timestamp.toString() + random.toString().padStart(6, '0');
    document.getElementById('txnId').value = txnId;
}


// Function to toggle card fields based on transaction type
// This function sets the fields to 'NA' for DIRECT transactions and enables them for REDIRECT transactions 

function toggleCardFields() {
    const txnType = document.getElementById('txnType').value;
    const cardFields = ['instrumentId', 'cardDetails', 'cardType'];
    cardFields.forEach(field => {
        const element = document.getElementById(field);
        element.readOnly = false;

        if (txnType === 'DIRECT') {
            element.style.borderColor = '';
            element.style.backgroundColor = '';
            instrumentId.placeholder = 'NA';
            cardDetails.placeholder = 'NA';
            cardType.placeholder = 'NA';
            element.value = '';
        }
        else if (txnType === 'REDIRECT') {
            instrumentId.placeholder = 'Enter UPI|NB|DC|CC|WALLET etc.';
            cardDetails.placeholder = 'Card details';
            if (cardType) cardType.placeholder = 'Card type';

            instrumentId.value = '';
            cardDetails.value = '';
            if (cardType) cardType.value = '';

            instrumentId.style.borderColor = '#a3edb4';
            instrumentId.style.backgroundColor = '#e3f8e8';
            cardDetails.style.borderColor = '#a3edb4';
            cardDetails.style.backgroundColor = '#e3f8e8';
            cardType.style.borderColor = '#a3edb4';
            cardType.style.backgroundColor = '#e3f8e8';

            // Add event listener to watch changes in Instrument ID
            instrumentId.addEventListener('input', function () {
                const value = instrumentId.value.trim().toLowerCase();
                if (value === '') {
                    // If input is cleared
                    cardType.value = '';
                    cardDetails.value = '';
                }
                else if (value === 'upi') {
                    cardDetails.placeholder = 'I or VPA or QR';
                    cardType.value = 'UPI';
                }
                else if (value === 'nb') {
                    cardDetails.placeholder = 'Enter Bank Code';
                    cardType.value = 'NA';
                } else if (value === 'dc' || value === 'cc') {
                    cardDetails.value = 'CardName|CardNo|CVV|ExpiryDate(MMYY)';
                    cardType.placeholder = 'Card Name';
                } else if (value === 'wallet') {
                    cardDetails.placeholder = 'Bank ID';
                    cardType.value = 'NA';
                } else {
                    cardDetails.placeholder = 'Enter card details';
                    cardType.placeholder = 'Enter card type';
                }
            });
        }
        
    });
}

// Function to generate a Reseller Transaction ID
// This function creates a unique ID based on the current timestamp and a random number
function generateResellerTxnId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const resellerTxnId = 'R' + timestamp.toString() + random.toString().padStart(4, '0');
    document.getElementById('ResellerTxnId').value = resellerTxnId;
}


// Function to set up the RID watcher
// This function listens for changes in the RID field and shows/hides the ResellerTxnId field accordingly
function setupRidWatcher() {
    const ridField = document.getElementById('Rid');
    const resellerTxnIdGroup = document.getElementById('resellerTxnIdGroup');
    const resellerTxnIdField = document.getElementById('ResellerTxnId');

    ridField.addEventListener('input', function () {
        if (this.value.trim()) {
            resellerTxnIdGroup.classList.remove('hidden');
            generateResellerTxnId();
        } else {
            resellerTxnIdGroup.classList.add('hidden');
            resellerTxnIdField.value = '';
        }
    });
}

function showJsonData() {
    const fields = ['txnType', 'instrumentId', 'cardDetails', 'cardType'];
    const formData = {};

    fields.forEach(field => {
        const input = document.getElementById(field);
        const value = input.value.trim();
        formData[field] = value ? value : 'NA';
    });

    const json = JSON.stringify(formData);
    const encrypted = btoa(json); // Replace with real encryption if needed

    // Example: return or use as needed
    console.log('JSON:', json);
    console.log('Encrypted (Base64):', encrypted);

    // If you're showing output elsewhere, use your own logic here
    // showDataOnUI(json, encrypted); // <-- your custom function
}

// Run on page load 
// This function initializes the form and sets up event listeners
window.onload = function () {
    toggleCardFields();
};

// Function to handle multi-settlement modal
// This function opens a modal for entering multiple product IDs and amounts when the multi-settlement option is selected
const isMultiSettlement = document.getElementById('isMultiSettlement');
const modal = document.getElementById('multiModal');
const productList = document.getElementById('productList');

isMultiSettlement.addEventListener('change', () => {
    if (isMultiSettlement.value === '1') {
        openModal();
    }
});

function openModal() {
    modal.style.display = 'block';
    productList.innerHTML = '';
    addProduct(); // Start with one entry
}

function closeModal() {
    modal.style.display = 'none';
}


function addProduct(event) {
    if (event) event.preventDefault();
    const productList = document.getElementById('productList');

    const div = document.createElement('div');
    div.className = 'product-entry';
    div.innerHTML = `
      <div class="product-fields">
        <input type="text" placeholder="Product ID" class="productId input-field">
        <input type="number" placeholder="Amount" class="amount input-field">
        <button type="button" class="remove-btn" onclick="removeProduct(this)">Remove</button>
      </div>
    `;
    productList.appendChild(div);
}

function removeProduct(button) {
    const entry = button.closest('.product-entry');
    entry.remove();
}


function generateJSON(event) {
    if (event) event.preventDefault();
    const splitType = document.getElementById('splitType').value;
    const productInputs = document.querySelectorAll('.product-entry');
    const split = {};

    productInputs.forEach((entry, idx) => {
        const productId = entry.querySelector('.productId').value;
        const amount = entry.querySelector('.amount').value;

        if (productId && amount) {
            split[idx + 1] = {
                product_id: productId,
                amount: amount
            };
        }
    });

    const jsonData = {
        split_type: splitType,
        split: split
    };

    document.getElementById('productId').value = JSON.stringify(jsonData, null, 2);
    closeModal();
}

// Optional: Close modal if clicking outside content
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}


// Function to validate the form inputs
// This function checks if all required fields are filled correctly and shows notifications for errors
function validateForm() {
    const merchantId = document.getElementById('merchantId').value;
    const apiKey = document.getElementById('apiKey').value;
    const custMobile = document.getElementById('custMobile').value;
    const amount = document.getElementById('amount').value;
    const returnURL = document.getElementById('returnURL').value;
    const custEmail = document.getElementById("custMail");
    const emailValue = custEmail.value.trim();
    // Pop Window for notifications

    const notyf = new Notyf({
        duration: 5000,
        position: { x: 'right', y: 'top' }
    });
    if (!merchantId) {
        notyf.error('Merchant ID is required');
        return false;
    }
    if (apiKey.length !== 32) {
        notyf.error('API Key is required and must be exactly 32 characters long');
        return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0 || !/^\d+\.\d{2}$/.test(amount)) {
        notyf.error('Amount is required must be a number greater than 0 with exactly two decimal places');
        return false;
    }
    if (!returnURL) {
        notyf.error('Please provide a return URL');
        return false;
    }
    if (custMobile.length < 10 || !/^\d+$/.test(custMobile)) {
        notyf.error('Customer mobile must be at least 10 numeric digits');
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        notyf.error('Customer email must be a valid email address');
        return false;
    }
    return true;
}

// Updated function: no DOM output, just returns data and logs to console
// This function collects form data, builds a JSON object, and logs it to the console
// It also encrypts the JSON data using Base64 encoding (for demonstration purposes)
// Function to build the JSON data object from form inputs
// This function collects all form data, builds a JSON object in the specified order, and handles optional fields
function buildJsonData() {
    const formData = new FormData(document.getElementById('paymentForm'));
    const data = {};
    // Build the JSON object in the specified order
    data.merchantId = formData.get('merchantId') || '';
    data.apiKey = formData.get('apiKey') || '';
    // Add current date and time in YYYY-MM-DD HH:MM:SS format
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const formattedDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    data.dateTime = formattedDateTime;
    // Add amount, ensuring it is a number with exactly two decimal places
    data.amount = parseFloat(formData.get('amount') || 0).toFixed(2);
    // Add returnURL and callBackURL, ensuring callBackURL is only added if it has a value
    data.returnURL = formData.get('returnURL') || '';
    // Add callBackURL only if it has a value
    const callBackURL = formData.get('callBackURL');
    if (callBackURL && callBackURL.trim()) {
        data.callBackURL = callBackURL.trim();
    }
    // Add customer details
    data.custMobile = formData.get('custMobile') || '';
    data.custMail = formData.get('custMail') || '';
    data.isMultiSettlement = formData.get('isMultiSettlement') || '0';
    // Handle productId - user can enter custom value or JSON
    const productIdValue = formData.get('productId') || 'DEFAULT';
    if (productIdValue.trim() === '' || productIdValue.trim() === 'DEFAULT') {
        data.productId = 'DEFAULT';
    } else {
        try {
            // Try to parse as JSON first
            data.productId = JSON.parse(productIdValue);
        } catch (e) {
            // If not valid JSON, use as string value
            data.productId = productIdValue;
        }
    }
    data.channelId = formData.get('channelId') || '0';
    data.txnId = formData.get('txnId') || '';
    data.txnType = formData.get('txnType') || 'DIRECT';
    // Handle UDF fields
    data.udf1 = formData.get('udf1') || 'NA';
    data.udf2 = formData.get('udf2') || 'NA';
    data.udf3 = formData.get('udf3') || 'NA';
    data.udf4 = formData.get('udf4') || 'NA';
    data.udf5 = formData.get('udf5') || 'NA';
    // Handle UDF6 (can be JSON)
    let udf6Value = formData.get('udf6') || 'NA';
    if (udf6Value !== 'NA') {
        try {
            data.udf6 = JSON.parse(udf6Value);
        } catch (e) {
            data.udf6 = udf6Value;
        }
    } else {
        data.udf6 = 'NA';
    }
    // Handle optional fields for DIRECT transactions
    // instrumentId, cardDetails, cardType  
    const instrumentId = formData.get('instrumentId');
    const cardDetails = formData.get('cardDetails');
    const cardType = formData.get('cardType');
    // Ensure these fields are set to 'NA' if empty
    // If txnType is DIRECT, set instrumentId, cardDetails, and cardType to 'NA'
    data.instrumentId = instrumentId && instrumentId.trim() !== '' ? instrumentId : 'NA';
    data.cardDetails = cardDetails && cardDetails.trim() !== '' ? cardDetails : 'NA';
    data.cardType = cardType && cardType.trim() !== '' ? cardType : 'NA';
    // Handle optional Rid and ResellerTxnId - Only add if Rid has a value
    const rid = formData.get('Rid');
    if (rid && rid.trim()) {
        data.Rid = rid.trim();
        data.ResellerTxnId = formData.get('ResellerTxnId') || generateResellerTxnId();
    }
    // If Rid is empty, don't add Rid or ResellerTxnId to the JSON at all
    return data;
}

// Fixed encryption function
function encryptData(jsonData, apiKey, encryptionType = 'CBC') {
    try {
        const jsonString = JSON.stringify(jsonData);
        const key = CryptoJS.enc.Utf8.parse(apiKey);

        if (encryptionType === 'GCM') {
            // --- AES-GCM using Web Crypto API ---

            const ivString = apiKey.substring(0, 16);             // 16 chars → 16 bytes
            const keyString = apiKey;                             // 32 chars → 32 bytes
            const plaintext = jsonString;

            // Convert UTF-8 strings to Forge byte buffers:
            const ivBytes = forge.util.createBuffer(ivString, 'utf8');
            const keyBytes = forge.util.createBuffer(keyString, 'utf8');
            const ptBytes = forge.util.createBuffer(plaintext, 'utf8');

            // Create AES-GCM cipher:
            const cipher = forge.cipher.createCipher('AES-GCM', keyBytes.getBytes());
            cipher.start({
                iv: ivBytes.getBytes(),   // 16-byte IV
                tagLength: 128                  // 128-bit auth tag
            });
            cipher.update(ptBytes);
            cipher.finish();

            // cipher.output is the ciphertext; cipher.mode.tag is the 16-byte auth tag
            const ciphertextBytes = cipher.output.getBytes();    // raw binary
            const tagBytes = cipher.mode.tag.getBytes();  // raw 16-byte tag

            // We want to send (IV || ciphertext || authTag) as a single Base64 blob:
            const combinedBytes = ivBytes.getBytes() + ciphertextBytes + tagBytes;
            const combinedB64 = forge.util.encode64(combinedBytes);

            return combinedB64;

        }
        else {
            // AES 256 CBC Encryption (original method)
            const iv = CryptoJS.enc.Utf8.parse(apiKey.substring(0, 16));

            const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return encrypted.toString();
        }
    } catch (error) {
        console.error('Encryption error:', error);
        alert('Encryption failed: ' + error.message);
        return null;
    }
}

// Fixed decryption function 
function decryptData(encryptedData, apiKey, encryptionType = 'CBC') {
    try {
        const key = CryptoJS.enc.Utf8.parse(apiKey);

        if (encryptionType === 'GCM') {
            const combinedBytes = forge.util.decode64(combinedB64);

            // 2) Split: [0..15] = IV (16 bytes), [16..N-17] = ciphertext, [N-16..N-1] = auth tag
            const ivBytes = combinedBytes.slice(0, 16);
            const ciphertextBytes = combinedBytes.slice(16, combinedBytes.length - 16);
            const tagBytes = combinedBytes.slice(combinedBytes.length - 16);

            // 3) Convert to Forge buffers
            const ivBuf = forge.util.createBuffer(ivBytes, 'raw');
            const ctBuf = forge.util.createBuffer(ciphertextBytes, 'raw');
            const tagBuf = forge.util.createBuffer(tagBytes, 'raw');

            // 4) Import key
            const keyBytes = forge.util.createBuffer(apiKey, 'utf8'); // 32 bytes

            // 5) Create AES-GCM decipher
            const decipher = forge.cipher.createDecipher('AES-GCM', keyBytes.getBytes());
            decipher.start({
                iv: ivBuf.getBytes(),
                tag: tagBuf.getBytes(),   // 16-byte tag
                tagLength: 128
            });
            decipher.update(ctBuf);
            const success = decipher.finish();
            if (!success) {
                throw new Error("GCM authentication failed");
            }

            const plaintext = decipher.output.toString('utf8');
            return JSON.parse(plaintext); // original JSON object
        } else {
            // AES 256 CBC Decryption (original method)
            const iv = CryptoJS.enc.Utf8.parse(apiKey.substring(0, 16));

            const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}
// Function to show JSON data and encrypted data
// This function validates the form, builds the JSON data, encrypts it, and displays both the JSON and encrypted data
function showJsonData() {
    if (!validateForm()) return;
    try {
        const jsonData = buildJsonData();
        const encryptionType = document.getElementById('encryptionType').value;
        const encryptedData = encryptData(jsonData, jsonData.apiKey, encryptionType);

        if (!encryptedData) {
            alert('Failed to encrypt data. Please check your inputs.');
            return;
        }

        // Clear previous content before displaying new data
        const container = document.getElementById('jsonData');
        container.innerHTML = '';

        const encryptedContainer = document.getElementById('encryptedData');
        encryptedContainer.innerHTML = '';

        // JSON data preview and copy functionality
        const heading = document.createElement('h4');
        heading.textContent = '🔓 JSON Data:';

        const preElement = document.createElement('pre');
        preElement.id = 'jsonContent';
        preElement.textContent = JSON.stringify(jsonData, null, 2);

        const button = document.createElement('button');
        button.id = 'copyBtn';
        button.textContent = '📋 Copy';
        button.onclick = function () {
            const jsonText = document.getElementById('jsonContent').innerText;
            navigator.clipboard.writeText(jsonText)
                .then(() => {
                    const originalText = button.textContent;
                    button.textContent = '✅ Copied!';
                    button.disabled = true;
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                    }, 1500);
                })
                .catch(err => {
                    button.textContent = '❌ Copy failed';
                    setTimeout(() => {
                        button.textContent = '📋 Copy';
                    }, 1500);
                });
        };

        container.appendChild(heading);
        container.appendChild(preElement);
        container.appendChild(button);

        // Encrypted data preview and copy functionality
        const encHeading = document.createElement('h4');
        encHeading.textContent = `🔐 Encrypted Data:`;

        const encPre = document.createElement('pre');
        encPre.id = 'encryptedContent';
        encPre.textContent = encryptedData;

        const encButton = document.createElement('button');
        encButton.id = 'copyEncryptedBtn';
        encButton.textContent = '📋 Copy';
        encButton.backgroundColor = '#4CAF50'; // Green background
        encButton.style.color = 'white';

        encButton.onclick = function () {
            navigator.clipboard.writeText(encPre.textContent)
                .then(() => {
                    const originalText = encButton.textContent;
                    encButton.textContent = '✅ Copied!';
                    encButton.disabled = true;
                    setTimeout(() => {
                        encButton.textContent = originalText;
                        encButton.disabled = false;
                    }, 1500);
                })
                .catch(() => {
                    encButton.textContent = '❌ Copy failed';
                    setTimeout(() => {
                        encButton.textContent = '📋 Copy';
                    }, 1500);
                });
        };

        encryptedContainer.appendChild(encHeading);
        encryptedContainer.appendChild(encPre);
        encryptedContainer.appendChild(encButton);

        // Show the data display section
        document.getElementById('dataDisplay').classList.remove('hidden');
    } catch (error) {
        console.error('Error in showJsonData:', error);
        alert('An error occurred while processing the data: ' + error.message);
    }
}
// Event listener for form submission
// This function validates the form, generates transaction IDs, encrypts the data, and submits the form to the selected endpoint
document.getElementById('paymentForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
        generateTxnId();
        if (document.getElementById('Rid').value.trim()) {
            generateResellerTxnId();
        }

        const jsonData = buildJsonData();
        const encryptionType = document.getElementById('encryptionType').value;
        const encryptedData = encryptData(jsonData, jsonData.apiKey, encryptionType);

        if (!encryptedData) {
            alert('Failed to encrypt data. Please check your inputs.');
            return;
        }

        const selectedEndpoint = document.querySelector('input[name="endpoint"]:checked').value;
        // Check txn_type
        const txn_type = jsonData.txnType;
        console.log(txn_type);
        const instrument_Id = jsonData.instrumentId;
        const card_Details = jsonData.cardDetails;
        console.log(instrument_Id);


        if (txn_type === 'REDIRECT' && instrument_Id === 'UPI') {
            // ✅ Use fetch for REDIRECT type to handle JSON response
            const formData = new URLSearchParams();
            formData.append('merchantId', jsonData.merchantId);
            formData.append('reqData', encryptedData);

            const response = await fetch(selectedEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': '*/*'
                },
                body: formData.toString(),
            });

            // if (!response.ok) {
            //     throw new Error(`Server error: ${response.status}`);
            // }
            // console.log('Server response status:', response);
            const data = await response.json();
            console.log('Server JSON response:', data);
            const encryptedRespData = data.respData;
            console.log('Encrypted response data:', encryptedRespData);

            console.log('Server JSON response:', data);
            const decryptedData = decryptData(encryptedRespData, jsonData.apiKey, encryptionType);
            console.log('Decrypted response:', decryptedData);

            if (decryptedData && decryptedData.qrString && card_Details === 'I') { 
                // console.log('Decrypted qrString:', decryptedData.qrString);
                // const qrOutput = document.createElement('div');
                // qrOutput.innerText = `QR String: ${decryptedData.qrString}`;
                // qrOutput.style.padding = "10px";
                // qrOutput.style.border = "1px solid #ccc";
                // qrOutput.style.marginTop = "20px";
                // document.body.appendChild(qrOutput);
                showQRModal(decryptedData);

            } 
            else if (decryptedData && decryptedData.qrString === "Collect") {
                // Show a message or handle the response as needed
                showPaymentPopup();
                console.log('Transaction successful:', decryptedData);
            } 
            else if (decryptedData && card_Details === 'QR') {
                showQRModal(decryptedData);
            }
            else {
                alert('Failed to process. You are passing some invalid parameters. please check Log');
            }

            // ✅ You can now act based on response
            // if (data.status === 'SUCCESS') {
            // redirect user to returned URL
            // window.location.href = data.redirectUrl;
            // } else {
            //     alert(`Payment failed: ${data.message}`);
            // }

        } else if (txn_type === 'DIRECT' || (txn_type === 'REDIRECT' && instrument_Id)) {
            // ✅ Normal form POST submit
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = selectedEndpoint;
            form.target = '_self';

            const merchantIdInput = document.createElement('input');
            merchantIdInput.type = 'hidden';
            merchantIdInput.name = 'merchantId';
            merchantIdInput.value = jsonData.merchantId;
            form.appendChild(merchantIdInput);

            const reqDataInput = document.createElement('input');
            reqDataInput.type = 'hidden';
            reqDataInput.name = 'reqData';
            reqDataInput.value = encryptedData;
            form.appendChild(reqDataInput);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        } else {
            alert('Invalid transaction type');
        }

    } catch (error) {
        // console.error('Error in form submission:', error);
        alert('Please check you have selected an correct endpoint and filled all required fields correctly.');
    }
});

// Function to show QR modal
// This function generates a QR code from the provided data and displays it in a modal
function showQRModal(data) {
    new QRious({
        element: document.getElementById("qrcode"),
        value: data.qrString,
        size: 200
    });
    // Example details to show
    const details = {
        "QR String": data.qrString || 'NA',
        "Bank Ref Id": data.bank_ref_id || 'NA',
        "Customer Email Id": data.cust_email_id || 'NA',
        "Transaction Amount": data.txnAmount || 'NA',
        "Payment Mode": data.payment_mode || 'NA',
        "PG Reference Id": data.pg_ref_id || 'NA',
        "Transaction Id": data.txn_id || 'NA',
        "Response Date Time": data.resp_date_time || 'NA',
        "Transaction Date Time": data.txn_date_time || 'NA',
        "Transaction Status": data.txnStatus || 'NA',
        "Customer Mobile No": data.cust_mobile_no || 'NA',
        "Response Message": data.responseMessage || 'NA',
        "UDF1": data.udf1 || 'NA',
        "UDF2": data.udf2 || 'NA',
        "UDF3": data.udf3 || 'NA',
        "UDF4": data.udf4 || 'NA',
        "UDF5": data.udf5 || 'NA',
        "UDF6": data.udf6 || 'NA',
        "Merchant Id": data.merchant_id || 'NA',
        "Reseller Id": data.reseller_id || 'NA',
        "Reseller Transaction Id": data.reseller_txn_id || 'NA',
        "Response Code": data.resp_code || 'NA'
    };
    const tableBody = document.getElementById('txnDetailsBody');
    tableBody.innerHTML = ''; // Clear previous

    for (const key in details) {
        const row = document.createElement('tr');
        if (key === 'QR String') {
            row.innerHTML = `
                <td><span class="copy-label" onclick="copyQRString()">QR String</span></td>
                <td><span id="qrStringValue">${details[key]}</span></td>
            `;
        } else {
            row.innerHTML = `<td>${key}</td><td>${details[key]}</td>`;
        }
        tableBody.appendChild(row);
    }

    document.getElementById('qrModal').style.display = 'block';
    document.getElementById('qrBackdrop').style.display = 'block';
    document.body.style.overflow = 'hidden'; // disable body scroll

}

function copyQRString() {
    const qrText = document.getElementById('qrStringValue').innerText;
    navigator.clipboard.writeText(qrText).then(() => {
        const copyLabel = document.querySelector('.copy-label');
        const originalText = copyLabel.textContent;
        copyLabel.textContent = '✅ Copied!';
        copyLabel.disabled = true;
        setTimeout(() => {
            copyLabel.textContent = originalText;
            copyLabel.disabled = false;
        }, 1500);
    }).catch(err => {
        // console.error('Failed to copy QR string:', err);
        const copyLabel = document.querySelector('.copy-label');
        copyLabel.textContent = '❌ Copy failed';
        setTimeout(() => {
            copyLabel.textContent = 'QR String';
        }, 1500);
    });
}


function qrCloseModal() {
    document.getElementById('qrModal').style.display = 'none';
    document.getElementById('qrBackdrop').style.display = 'none';
    document.body.style.overflow = ''; // restore body scroll

}


dragElement(document.getElementById("qrModal"));

function dragElement(elmnt) {
    const header = document.getElementById("modalHeader");
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


const paymentPopup = document.getElementById('paymentPopup');
    const popupTimerSpan = document.getElementById('popupTimer');
    let countdownInterval;
    let timeoutId;

    // Function to show the popup
    function showPaymentPopup() {
        paymentPopup.style.display = 'flex'; // Make sure it's visible as flex
        // Add a class to trigger CSS transition for opacity
        setTimeout(() => {
            paymentPopup.classList.add('show');
        }, 10); // Small delay to allow display property to apply first

        let timeLeft = 5 * 60; // 5 minutes in seconds

        function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            popupTimerSpan.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                closePaymentPopup();
            } else {
                timeLeft--;
            }
        }

        // Clear any existing intervals/timeouts before starting new ones
        clearInterval(countdownInterval);
        clearTimeout(timeoutId);

        // Start the countdown immediately
        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000); // Update every second

        // Set a timeout to close the popup after 5 minutes
        timeoutId = setTimeout(() => {
            closePaymentPopup();
        }, 5 * 60 * 1000); // 5 minutes in milliseconds
    }

    // Function to close the popup
    function closePaymentPopup() {
        clearInterval(countdownInterval); // Stop the timer countdown
        clearTimeout(timeoutId); // Clear the auto-close timeout
        paymentPopup.classList.remove('show');
        // Wait for the fade-out transition to complete before hiding display
        setTimeout(() => {
            paymentPopup.style.display = 'none';
        }, 300); // Match CSS transition duration
    }

    // Example of how to trigger the popup (you'd integrate this where your payment is initiated)
    // For demonstration, you can call this in your console, or attach to a button:
    // document.addEventListener('DOMContentLoaded', () => {
    //     // To show it immediately for testing:
    //     // showPaymentPopup();
    //
    //     // Or if you have a button to trigger it:
    //     // const triggerButton = document.getElementById('triggerPaymentPopup');
    //     // if (triggerButton) {
    //     //     triggerButton.addEventListener('click', showPaymentPopup);
    //     // }
    // });