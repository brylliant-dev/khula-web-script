document.addEventListener('DOMContentLoaded', () => {
    // Function to wait for sessionStorage to contain a specific key
    function waitForSessionStorage(key, callback, interval = 100, timeout = 5000) {
        const startTime = Date.now();
        const intervalId = setInterval(() => {
            const value = sessionStorage.getItem(key);
            if (value) {
                clearInterval(intervalId);
                callback(value);
            }
            if (Date.now() - startTime > timeout) {
                clearInterval(intervalId);
                console.error(`Timeout waiting for sessionStorage key: ${key}`);
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

    // Function to decode and update the DOM
    function updateDOM(base64Value) {
        return new Promise((resolve, reject) => {
            try {
                if (!isBase64(base64Value)) {
                    throw new Error("Value is not valid Base64");
                }
                const decodedJson = JSON.parse(atob(base64Value));
                console.log("Decoded wfuUser:", decodedJson);

                // Update the DOM with basic user information
                document.getElementById("client-name-display").innerText = decodedJson.name || "No name available";
                document.getElementById("txt-username").innerText = decodedJson.name || "No name available";
                document.getElementById("client-email-display").innerText = decodedJson.email || "No email available";

                // Extract the 'data' object from the decoded JSON
                const data = decodedJson.data || {};

                // Update the DOM with data object fields
                const companyName = data["company-name"] || "No company name available";
                const currentPlan = data["current-plan"] || "No current plan available";
                const markupURL = data["markup-link"] || "No markup link available";
                const typeOfService = data["type-of-service"] || "No service type available";
                const uid = data["uid"] || "No UID available";
                const websiteUrl = data["website-url"] || "No website URL available";

                // Update DOM elements with extracted data
                document.getElementById("txt-company").innerText = companyName;
                document.getElementById("txt-userid").innerText = uid;
                document.getElementById("txt-website").innerText = websiteUrl;

                // Format and display the current plan
                const formattedPlan = currentPlan.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                document.getElementById('txtcurrentplan').innerText = formattedPlan;

                // Update the markup link
                const markupLinkElement = document.getElementById("markupLink");
                if (markupLinkElement) {
                    markupLinkElement.href = markupURL;
                }

                // Update input fields if they exist
                const input = document.getElementById("company-input-data");
                if (input) {
                    input.value = companyName;
                }

                // Resolve the promise with the company name
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
            // Decode and update the DOM, and get the company name
            const companyName = await updateDOM(base64Value);

            if (!companyName) throw new Error('Company name not found');

            // API call
            const url = `https://x8ki-letl-twmt.n7.xano.io/api:c2SUee37/get_user_tasks?companyName=${encodeURIComponent(companyName)}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const tasks = await response.json();

            // Example dynamic updates with tasks
            console.log("Fetched tasks:", tasks);
            document.querySelectorAll('.placeholder-class').forEach((el) => {
                el.innerText = `Tasks for ${companyName}`;
            });
        } catch (error) {
            console.error('Error in mainFn:', error);
        }
    };

    // Wait for the 'wfuUser' key in sessionStorage and then proceed
    waitForSessionStorage("wfuUser", (value) => {
        mainFn(value);
    });
});
