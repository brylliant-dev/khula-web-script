$(document).ready(function () {
    // Function to wait for sessionStorage to contain a specific key
    function waitForSessionStorage(key, callback, interval = 100, timeout = 10000) { // Extended timeout
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

    // Function to decode and update the DOM
    function updateDOM(base64Value) {
        return new Promise((resolve, reject) => {
            try {
                if (!isBase64(base64Value)) {
                    throw new Error("Value is not valid Base64");
                }
                const decodedJson = JSON.parse(atob(base64Value));

                $("#client-name-display").text(decodedJson.name || "No name available");
                $("#txt-username").text(decodedJson.name || "No name available");
                $("#client-email-display").text(decodedJson.email || "No email available");

                const data = decodedJson.data || {};
                const companyName = data["company-name"] || "No company name available";
                const currentPlan = data["current-plan"] || "No current plan available";
                const markupURL = data["markup-link"] || "";
                const typeOfService = data["type-of-service"] || "No service type available";
                const uid = data["uid"] || "No UID available";

                $("#txt-company").text(companyName);
                $("#txt-userid").text(uid);

                const formattedPlan = currentPlan.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                $('#txtcurrentplan').html(formattedPlan);
                $('#txtusercurrentplan').html(formattedPlan);

                const markupLinkElement = $("#markupLink");
                const markupLinkElementQA = $("#markupLinkUser");
                if (markupLinkElement.length && markupLinkElementQA.length) {
                    markupLinkElement.attr('href', markupURL);
                    markupLinkElementQA.attr('href', markupURL);
                }

                const input = $("#company-input-data");
                if (input.length) {
                    input.val(companyName);
                }

                resolve(companyName);
            } catch (error) {
                console.error("Failed to decode or parse wfuUser:", error);
                reject(error);
            }
        });
    }

    // Function to handle tasks and update the dropdowns
    const runFn = ({ tasks, uuid }) => {
        const dropdownList = $('.faqs_dropdown.w-dropdown');
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

        function formatTextForHTML(input) {
            const urlPattern = /https?:\/\/[^\s]+/g;
            return input.replace(urlPattern, (url) => `<a href="${url}" style="color: blue; text-decoration: underline;" target="_blank">${url}</a>`)
                .replace(/\n/g, '<br>')
                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }

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

        // Assuming 'statusesByTasks' is already defined
        function getTaskDetailsByTitle(titleText) {
            // Loop through each status in statusesByTasks
            for (const statusKey in statusesByTasks) {
                if (statusesByTasks.hasOwnProperty(statusKey)) {
                    // Get the list of tasks under the current status
                    const tasks = statusesByTasks[statusKey];

                    // Find the task with the given titleText
                    for (const task of tasks) {
                        if (task.name === titleText) {
                            // Return the description and color of the task if found
                            return {
                                description: task.popupBody,
                                color: task.color
                            };
                        }
                    }
                }
            }

            // Return null if no matching task is found
            return null;
        }

        const dropdownParent = $('.dashboardv3-content_main-accordion-layout');
        const popupBtn = $('#ticket-popup-button');
        const popupDesc = $('#description-text-data');
        const colorTicketData = $('#color-ticket-data');
        const taskTitleTicket = $('#task-title-ticket-data');
        const companyTicketData = $('#company-ticket-data');

        // Use event delegation to handle click event on dynamically added rows
        $(document).on('click', '.dashboardv3-table_row', function(event) {
            // Get the clicked row
            const row = $(this);

            // Find the element with class 'dashboard-table_cell title' inside the clicked row
            const titleElement = row.find('.dashboard-table_cell.title');

            // Get the text content of the title element
            const titleText = titleElement.text().trim();

            // Log the title text to the console

            const taskDetails = getTaskDetailsByTitle(titleText);

            popupDesc.html(formatTextForHTML(taskDetails.description || 'None'));
            colorTicketData.css('background-color', taskDetails.color);
            taskTitleTicket.text(titleText);
            companyTicketData.text($("#txt-company").text());


            // Display the pop-up with class 'pop-out-ticket' as flex and set opacity to 1
            $('.pop-out-ticket').css({
                'display': 'flex',
                'opacity': '1'
            });

            // Set the opacity of the element with class 'pop-out-wrapper-ticket' to 1
            $('.pop-out-wrapper-ticket').css({
                'opacity': '1',
                'transform': 'translateY(0em)'
            });
        });

        const setTotalCardCount = () => {
            const openTicketCount = $('#open-ticket-count');
            const awaitingClientFeedbackCount = $('#awaiting-client-feedback-count');
            const openCount = ['on going', 'incoming', 'in progress', 'qa'].reduce((acc, curr) => acc + statusesByTasks[curr].length, 0);

            openTicketCount.text(openCount);
            awaitingClientFeedbackCount.text(statusesByTasks['awaiting client'].length);
        };

        dropdownList.each(function () {
            const ddl = $(this);
            const titleElem = ddl.find('.faqs_dropdown_heading-layout');
            const key = titleElem.text().trim().toLowerCase();
            const statusByKey = statusesByTasks[key];

            const ticketCountElem = ddl.find('.pending-tickets');
            const tbody = ddl.find('tbody');
            const tr = tbody.find('tr').first();

            if (!statusByKey) {
                tr.remove();
                return;
            }

            ticketCountElem.text(`${statusByKey.length} Tickets`);

            if (statusByKey.length === 0) {
                ddl.find('.w-dropdown-toggle').css('cursor', 'auto');
                ddl.find('nav').remove();

                return;
            }

            for (const task of statusByKey) {
                const cloneTr = tr.clone();
                const td = cloneTr.find('td');

                const getDateDigit = (date) => {
                    if (!date) return 'None';
                    const parsedUnixDate = parseInt(date);
                    if (isNaN(parsedUnixDate)) return 'None';
                    const newDate = new Date(parsedUnixDate).toString().split(' ');
                    return `${newDate[1]} ${newDate[2]}`;
                };

                const tdData = {
                    ticket: td.eq(0),
                    dateCreated: td.eq(1),
                    dueDate: td.eq(2),
                    assignee: td.eq(3).find('.dashboard-table_cell-label'),
                    priority: td.eq(4).find('.dashboard-table_cell-label'),
                    flag: td.eq(4).find('.dashboard-table_cell-icon > svg > path'),
                };

                tdData.ticket.text(task.name);
                tdData.dateCreated.text(getDateDigit(task.dateCreated));
                tdData.dueDate.text(getDateDigit(task.dueDate));
                tdData.assignee.text(task.assignees.map((a) => a.username.split(' ')[0]).join(', ') || 'None');
                tdData.priority.text(task.priority?.priority.toUpperCase() || 'LOW');
                tdData.flag.attr('fill', colorByPrioLvl[task.priority?.priority.toUpperCase() || 'LOW']);

                tbody.append(cloneTr);
            }
            tr.remove();
        });

        setTotalCardCount();
    };

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
           await response.json()
                 .then((res) => {
                      hideLoading();
                      runFn({ tasks: res, uuid });
                 })

            
        } catch (error) {
            console.error('Error in mainFn:', error);
            hideLoading();
        } 
    };

    waitForSessionStorage("wfuUser", (value) => {
        mainFn(value);
    });
});
