$(document).ready(function () {
    // Function to wait for sessionStorage to contain a specific key
    function waitForSessionStorage(key, callback, interval = 100, timeout = 10000) {
        const startTime = Date.now();
        const intervalId = setInterval(() => {
            const value = sessionStorage.getItem(key);
            if (value) {
                console.log(`Key "${key}" found in sessionStorage:`, value);
                clearInterval(intervalId);
                callback(value);
            }
            if (Date.now() - startTime > timeout) {
                clearInterval(intervalId);
                console.error(`Timeout waiting for sessionStorage key: ${key}`);
                showError("Failed to load user information. Please try again later.");
                hideLoading();
            }
        }, interval);
    }

    // Function to validate if a string is Base64
    function isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    // Function to show loading overlay
    function showLoading() {
        const loadingOverlay = $('<div>', {
            id: 'loading-overlay',
            css: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(228, 220, 203, 0.9)',
                zIndex: '1000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }
        });

        const loadingImage = $('<img>', {
            src: 'https://cdn.prod.website-files.com/631172823157c44677d71f1d/674c931bab709c1d7379bfbf_loader.gif',
            alt: 'Loading...',
            css: {
                width: '400px',
                height: '400px'
            }
        });

        loadingOverlay.append(loadingImage).appendTo('body');
    }

    // Function to hide loading overlay
    function hideLoading() {
        $('#loading-overlay').remove();
    }

    // Function to show error message
    function showError(message) {
        const errorOverlay = $('<div>', {
            id: 'error-overlay',
            text: message,
            css: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                zIndex: '1001',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px',
                color: 'red',
                fontWeight: 'bold',
                textAlign: 'center'
            }
        });

        $('body').append(errorOverlay);

        setTimeout(() => {
            $('#error-overlay').fadeOut(() => $(this).remove());
        }, 5000);
    }

    // Function to update the dropdowns and handle tasks
    function runFn({ tasks, uuid }) {
        console.log('Tasks fetched:', tasks);
        // Handle the tasks and update the dropdowns here
        // Example:
        tasks.forEach(task => {
            console.log(`Task Name: ${task.name}`);
            // Update your DOM elements with task details
        });
    }

    // Function to decode and update the DOM
    function updateDOM(base64Value) {
        return new Promise((resolve, reject) => {
            try {
                if (!isBase64(base64Value)) {
                    throw new Error("Value is not valid Base64");
                }
                const decodedJson = JSON.parse(atob(base64Value));
                console.log(decodedJson);

                $("#client-name-display").text(decodedJson.name || "No name available");
                $("#txt-username").text(decodedJson.name || "No name available");
                $("#client-email-display").text(decodedJson.email || "No email available");

                const data = decodedJson.data || {};
                const companyName = data["company-name"] || "No company name available";
                const currentPlan = data["current-plan"] || "No current plan available";

                $("#txt-company").text(companyName);
                $("#txt-userid").text(data.uid || "No UID available");

                resolve(companyName);
            } catch (error) {
                console.error("Failed to decode or parse wfuUser:", error);
                reject(error);
            }
        });
    }

    // Main function to fetch data and update elements dynamically
    const mainFn = async (base64Value) => {
        try {
            showLoading();
            const uuid = await updateDOM(base64Value);

            if (!uuid) throw new Error('Company name not found');

            const customFields = [
                { field_id: "4ad343df-25d9-4ff1-b35d-084099a986e0", operator: "=", value: uuid }
            ];

            const url = `https://x8ki-letl-twmt.n7.xano.io/api:c2SUee37/get_user_tasks?custom_fields=${encodeURIComponent(JSON.stringify(customFields))}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const tasks = await response.json();

            runFn({ tasks, uuid });
        } catch (error) {
            console.error('Error in mainFn:', error);
            showError("Failed to load user information. Please try again later.");
        } finally {
            hideLoading();
        }
    };

    // Start loading immediately
    showLoading();

    waitForSessionStorage("wfuUser", (value) => {
        mainFn(value);
    });
});
