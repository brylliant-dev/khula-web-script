document.addEventListener('DOMContentLoaded', () => {
    // Function to wait for sessionStorage to contain a specific key
    function waitForSessionStorage(key, callback, interval = 100, timeout = 10000) { // Extended timeout
        const startTime = Date.now();
        const intervalId = setInterval(() => {
            const value = sessionStorage.getItem(key);
            //console.log(`Checking sessionStorage for key "${key}" at ${Date.now() - startTime}ms`);
            if (value) {
                console.log(`Key "${key}" found in sessionStorage:`, value);
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

    // Function to show loading overlay
    function showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(228, 220, 203, 0.9)'; // Updated background color
        loadingOverlay.style.zIndex = '1000';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';

        // Add a loading spinner (updated loader GIF)
        const loadingImage = document.createElement('img');
        loadingImage.src = 'https://cdn.prod.website-files.com/631172823157c44677d71f1d/674c931bab709c1d7379bfbf_loader.gif'; // Updated loader GIF
        loadingImage.alt = 'Loading...';
        loadingImage.style.width = '400px'; // Updated loader size
        loadingImage.style.height = '400px'; // Updated loader size

        loadingOverlay.appendChild(loadingImage);
        document.body.appendChild(loadingOverlay);
    }

    // Function to hide loading overlay
    function hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
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
                //console.log("Decoded wfuUser:", decodedJson);

                // Update the DOM with basic user information
                document.getElementById("client-name-display").innerText = decodedJson.name || "No name available";
                document.getElementById("txt-username").innerText = decodedJson.name || "No name available";
                document.getElementById("client-email-display").innerText = decodedJson.email || "No email available";

                // Extract the 'data' object from the decoded JSON
                const data = decodedJson.data || {};

                // Extract required fields
                const companyName = data["company-name"] || "No company name available";
                const currentPlan = data["current-plan"] || "No current plan available";
                const markupURL = data["markup-link"] || "";
                const typeOfService = data["type-of-service"] || "No service type available";
                const uid = data["uid"] || "No UID available";
                const websiteUrl = data["website-url"] || "No website URL available";

                // Update DOM elements with extracted data
                document.getElementById("txt-company").innerText = companyName;
                document.getElementById("txt-userid").innerText = uid;
                document.getElementById("txt-website").innerText = websiteUrl;

                // Format and display the current plan
                const formattedPlan = currentPlan.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                document.getElementById('txtcurrentplan').innerHTML = formattedPlan;

                // Update the markup link if available
                const markupLinkElement = document.getElementById("markupLink");
                if (markupLinkElement) {
                    markupLinkElement.href = markupURL;
                }

                // Update input fields if they exist
                const input = document.getElementById("company-input-data");
                if (input) {
                    input.value = companyName;
                }

                // Resolve the promise with the uid
                resolve(companyName);
            } catch (error) {
                console.error("Failed to decode or parse wfuUser:", error);
                reject(error);
            }
        });
    }

    // Function to handle tasks and update the dropdowns
    const runFn = (tasks) => {
        const dropdownList = document.querySelectorAll('.faqs_dropdown.w-dropdown');
        const statusList = {
            'awaiting client': [],
            'on going': [],
            'in progress': [],
            incoming: [],
            qa: [],
        };

        const colorByPrioLvl = {
            HIGH: '#f6d259',
            NORMAL: '#8599ff',
            URGENT: '#e88285',
            LOW: '#656d7a',
        };

        const statusesByTasks = Object.keys(statusList).reduce((acc, curr) => {
            const filteredTasks = tasks.filter((task) => task.status.status === curr);
            acc[curr] = filteredTasks.map((t) => ({
                name: t.name,
                status: t.status.status,
                color: t.status.color,
                assignees: t.assignees,
                dateCreated: t.date_created,
                dueDate: t.due_date,
                priority: t.priority,
                popupBody: t.description
            }));
            return acc;
        }, {});

        const dropdownParent = document.querySelector('.dashboardv3-content_main-accordion-layout');
        const popupBtn = document.querySelector('[data-w-id="7cb62205-68cb-1347-2350-4b68da126cd4"]')
        const popupDesc = document.querySelector('#descriptiion-ticket-data')

        const setTotalCardCount = () => {
            const openTicketCount = document.querySelector('#open-ticket-count');
            const awaitingClientFeedbackCount = document.querySelector('#awaiting-client-feedback-count');
            const openCount = ['on going', 'incoming', 'in progress', 'qa'].reduce((acc, curr) => acc + statusesByTasks[curr].length, 0);

            openTicketCount.textContent = openCount;
            awaitingClientFeedbackCount.textContent = statusesByTasks['awaiting client'].length;
        };

        dropdownList.forEach((ddl) => {
            const titleElem = ddl.querySelector('.faqs_dropdown_heading-layout');
            const key = titleElem.textContent.trim().toLowerCase();
            const statusByKey = statusesByTasks[key];

            const ticketCountElem = ddl.querySelector('.pending-tickets');
            const tbody = ddl.querySelector('tbody');
            const tr = tbody.querySelector('tr');

            if (!statusByKey) {
                tr?.remove();
                return;
            }

            ticketCountElem.textContent = `${statusByKey.length} Tickets`;

            if (statusByKey.length === 0) {
                ddl.querySelector('.w-dropdown-toggle').style.cursor = 'auto';
                const ddlClone = ddl.cloneNode(true);
                dropdownParent.insertBefore(ddlClone, ddl);
                ddl.remove();
                return;
            }

            for (const task of statusByKey) {
                const cloneTr = tr.cloneNode(true);
                const td = cloneTr.querySelectorAll('td');

                const getDateDigit = (date) => {
                    if (!date) return 'None';
                    const parsedUnixDate = parseInt(date);
                    if (isNaN(parsedUnixDate)) return 'None';
                    const newDate = new Date(parsedUnixDate).toString().split(' ');
                    return `${newDate[1]} ${newDate[2]}`;
                };

                const tdData = {
                    ticket: td[0],
                    dateCreated: td[1],
                    dueDate: td[2],
                    assignee: td[3].querySelector('.dashboard-table_cell-label'),
                    priority: td[4].querySelector('.dashboard-table_cell-label'),
                    flag: td[4].querySelector('.dashboard-table_cell-icon > svg > path'),
                };

                tdData.ticket.textContent = task.name;
                tdData.dateCreated.textContent = getDateDigit(task.dateCreated);
                tdData.dueDate.textContent = getDateDigit(task.dueDate);
                tdData.assignee.textContent = task.assignees.map((a) => a.username.split(' ')[0]).join(', ') || 'None';
                tdData.priority.textContent = task.priority?.priority.toUpperCase() || 'LOW';
                tdData.flag.setAttribute('fill', colorByPrioLvl[task.priority?.priority.toUpperCase() || 'LOW']);
                
                cloneTr.addEventListener('click', () => {
                       popupBtn.click()
                       popupDesc.textContent = task.description
                })

                tbody.appendChild(cloneTr);
            }
            tr.remove();
        });

        setTotalCardCount();
    };

    // Main function to fetch data and update elements dynamically
    const mainFn = async (base64Value) => {
        try {
            showLoading(); // Show loading while processing
            // Decode and update the DOM, and get the user id
            const uuid = await updateDOM(base64Value);

            if (!uuid) throw new Error('Company name not found');

            // Create custom fields for API query
            const customFields = [
                { field_id: "4ad343df-25d9-4ff1-b35d-084099a986e0", operator: "=", value: uuid }
            ];

            // API call with custom_fields parameter
            const url = `https://x8ki-letl-twmt.n7.xano.io/api:c2SUee37/get_user_tasks?custom_fields=${encodeURIComponent(JSON.stringify(customFields))}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const tasks = await response.json();

            runFn(tasks);
        } catch (error) {
            console.error('Error in mainFn:', error);
        } finally {
            hideLoading(); // Hide loading after processing
        }
    };

    // Wait for the 'wfuUser' key in sessionStorage and then proceed
    waitForSessionStorage("wfuUser", (value) => {
        mainFn(value);
    });
});
