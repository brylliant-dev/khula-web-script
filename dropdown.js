document.addEventListener('DOMContentLoaded', () => {
    // Function to wait for sessionStorage to contain a specific key
    function waitForSessionStorage(key, callback) {
        const interval = setInterval(() => {
            if (sessionStorage.getItem(key)) {
                clearInterval(interval); // Stop checking when the data is found
                callback(); // Call the function to process the data
            }
        }, 100); // Check every 100ms
    }

    // Function to update the DOM with decoded sessionStorage data
    function updateDOM() {
        return new Promise((resolve, reject) => {
            const base64Value = sessionStorage.getItem('wfuUser');
            try {
                // Decode and parse the Base64 string
                const decodedJson = JSON.parse(atob(base64Value));
                console.log("Decoded wfuUser:", decodedJson);

                // Update the DOM with the user's basic information
                document.getElementById("client-name-display").innerText = decodedJson.name || "No name available";
                document.getElementById("txt-username").innerText = decodedJson.name || "No name available";
                document.getElementById("client-email-display").innerText = decodedJson.email || "No email available";

                // Access the 'data' object
                const data = decodedJson.data || {};
                const companyName = data["company-name"] || "No company name available";
                const uid = data["uid"] || "No UID available";
                const websiteUrl = data["website-url"] || "No website URL available";

                // Update DOM elements with extracted data
                document.getElementById("txt-company").innerText = companyName;
                document.getElementById("txt-userid").innerText = uid;
                document.getElementById("txt-website").innerText = websiteUrl;

                // Set company name in an input field
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

    // Function to handle tasks and update the dropdowns
    const runFn = (tasks) => {
        const dropdownList = document.querySelectorAll('.faqs_dropdown.w-dropdown');
        const statusList = {
            'awaiting client': [],
            'on going': [],
            'in progress': [],
            incoming: [],
            'completed 2024': [],
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
            }));
            return acc;
        }, {});

        const dropdownParent = document.querySelector('.dashboardv3-content_main-accordion-layout');

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

                tbody.appendChild(cloneTr);
            }
            tr.remove();
        });

        setTotalCardCount();
    };

    // Function to fetch tasks and run the dropdown updates
    const mainFn = async () => {
        try {
            // Wait for updateDOM to finish and retrieve the company name
            const companyName = await updateDOM();

            if (!companyName) throw new Error('Company name not found');

            const customFields = [{ field_id: '4ad343df-25d9-4ff1-b35d-084099a986e0', operator: '=', value: companyName }];
            const url = `https://x8ki-letl-twmt.n7.xano.io/api:c2SUee37/get_user_tasks?custom_fields=${encodeURIComponent(JSON.stringify(customFields))}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const tasks = await response.json();
            runFn(tasks);
        } catch (error) {
            console.error('Error in mainFn:', error);
        }
    };

    // Function to observe elements on the DOM
    const startObservingElements = ({ selectors, callback }) => {
        const observer = new MutationObserver((_mutations, obs) => {
            const foundSelectors = selectors.filter((selector) => document.querySelector(selector));
            if (foundSelectors.length === selectors.length) {
                obs.disconnect();
                callback();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    };

    // Start observing and execute mainFn once elements are available
    startObservingElements({
        selectors: ['.faqs_dropdown.w-dropdown', '[wfu-bind="$user.data.company-name"]', '.dashboardv3-content_main-accordion-layout'],
        callback: mainFn,
    });
});
