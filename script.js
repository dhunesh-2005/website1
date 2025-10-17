// index.html <script> block

// Final Form Submission (AJAX/Fetch Submission Fix)
checkoutForm.addEventListener('submit', function(e) {
    // *** CRITICAL: MUST prevent the default action for AJAX submission ***
    e.preventDefault(); 
    
    // 1. Show the "Submitting..." message
    orderFormView.style.display = 'none';
    orderMessage.textContent = 'Submitting order, please wait...';
    orderMessage.style.display = 'block';

    // 2. Clear the cart (visual only)
    cart = [];
    updateCartDisplay();
    
    // 3. Prepare form data for transmission
    const formData = new FormData(checkoutForm);
    const searchParams = new URLSearchParams();
    
    // Convert FormData to URL-encoded parameters for the server
    for (const pair of formData) {
        // Keeping the entry IDs for now, as the Python server is configured 
        // to look for them in the request.form object.
        searchParams.append(pair[0], pair[1]); 
    }

    // --- MODIFICATION: CHANGE URL AND UPDATE RESPONSE HANDLING ---
    // Change GOOGLE_FORM_URL to your local Python Flask server endpoint
    const PYTHON_BACKEND_URL = "http://127.0.0.1:5000/submit-order"; 

    // 4. Send the data asynchronously (in the background)
    fetch(PYTHON_BACKEND_URL, {
        method: 'POST',
        body: searchParams // Sends as standard URL-encoded form data
    })
    .then(response => {
        // Check if the response is valid JSON before parsing
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response from the Flask server
    })
    .then(data => {
        // 5. On successful transmission (status: 200) and successful server processing (data.status: success)
        if (data.status === 'success') {
            orderMessage.textContent = '✅ Inquiry Submitted Successfully! Redirecting...';
            setTimeout(function() {
                window.location.href = 'index.html?order_submitted=true';
            }, 500); // 500ms delay to ensure user sees success message
        } else {
            // Server returned a 200 but processing failed (e.g., missing field)
            throw new Error(`Server Processing Error: ${data.message}`);
        }
    })
    .catch(error => {
        // 6. Handle network or server errors
        console.error('Final Submission Error:', error);
        orderMessage.textContent = `❌ Submission Failed! Check server or try again. Error: ${error.message}`;
        orderMessage.style.color = 'red';
    });
});
