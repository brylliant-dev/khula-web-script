document.addEventListener('DOMContentLoaded', () => {
    const runFn = (tasks) => {
        // Get the dropdown container
        const dropdownList = document.querySelectorAll('.faqs_dropdown.w-dropdown')

        const statusList = {
            'awaiting client': [],
            'on going': [],
            'in progress': [],
            incoming: [],
            'completed 2024': [],
            qa: [],
        }

        // This will be what we'll use for the priority level flag colors
        const colorByPrioLvl = {
            HIGH: '#f6d259',
            NORMAL: '#8599ff',
            URGENT: '#e88285',
            LOW: '#656d7a'
        }

        // Get the objects as status name as the key and the tasks under it would be the value
        const statusesByTasks = Object.keys(statusList).reduce((acc, curr) => {
            const getTasks = tasks.filter((task) => task.status.status === curr)
            const getSummary = getTasks.map((t) => {
                return {
                    name: t.name,
                    status: t.status.status,
                    color: t.status.color,
                    assignees: t.assignees,
                    dateCreated: t.date_created,
                    dueDate: t.due_date,
                    priority: t.priority,
                }
            })

            acc[curr] = getSummary
            return acc
        }, {})

        const dropdownParent = document.querySelector('.dashboardv3-content_main-accordion-layout')

        // Set the counts for the 2 cards
        const setTotalCardCount = () => {
            const openTicketCount = document.querySelector('#open-ticket-count')
            const awaitingClientFeedbackCount = document.querySelector('#awaiting-client-feedback-count')
            const openCount = ['on going', 'incoming', 'in progress', 'qa'].reduce((acc, curr) => acc + statusesByTasks[curr].length, 0)

            openTicketCount.textContent = openCount
            awaitingClientFeedbackCount.textContent = statusesByTasks['awaiting client'].length
        }

        // Iterate the data thru every respective dropdowns of each tasks
        Array.from(dropdownList).forEach((ddl) => {
            const titleElem = ddl.querySelector('.faqs_dropdown_heading-layout')
            const key = titleElem.textContent.trim().toLowerCase()
            const statusByKey = statusesByTasks[key]

            const ticketCountElem = ddl.querySelector('.pending-tickets')
            const tbody = ddl.querySelector('tbody')
            const tr = tbody.querySelector('tr')

            // If status by key is not existing, let's just remove the row inside
            if (!statusByKey) {
                tr.remove()
                return
            }

            // Update ticket count
            ticketCountElem.textContent = `${statusByKey.length} Tickets`

            if (statusByKey.length === 0) {
                ddl.querySelector('.w-dropdown-toggle').style.cursor = 'auto'
                const ddlClone = ddl.cloneNode(true)

                dropdownParent.insertBefore(ddlClone, ddl)
                ddl.remove()
                return
            }

            for (let i = 0; i < statusByKey.length; i++) {
                const taskStatus = statusByKey[i]

                // Clone the element
                const cloneTr = tr.cloneNode(true)
                const td = cloneTr.querySelectorAll('td')

                const tdData = {
                    ticket: td[0],
                    dateCreated: td[1],
                    dueDate: td[2],
                    assignee: td[3].querySelector('.dashboard-table_cell-label'),
                    priority: td[4].querySelector('.dashboard-table_cell-label'),
                    flag: td[4].querySelector('.dashboard-table_cell-icon > svg > path')
                }

                // Parse the date unix into day month format. Ex: Jan 03
                const getDateDigit = (date) => {
                    if (!date) return 'None'

                    const parsedUnixDate = parseInt(date)

                    if (isNaN(parsedUnixDate)) return 'None'

                    const newDate = new Date(parsedUnixDate).toString().split(' ')
                    return `${newDate[1]} ${newDate[2]}`
                }

                const assignees = taskStatus.assignees
                    .map(ts => ts.username.split(' ').at(0))
                    .join(', ')

                const priorityLvl = (taskStatus.priority?.priority || 'low').toUpperCase()

                tdData.ticket.textContent = taskStatus.name
                tdData.dateCreated.textContent = getDateDigit(taskStatus.dateCreated)
                tdData.dueDate.textContent = getDateDigit(taskStatus.dueDate)
                tdData.assignee.textContent = assignees !== '' ? assignees : 'None'
                tdData.priority.textContent = priorityLvl
                tdData.flag.setAttribute('fill', colorByPrioLvl[priorityLvl]) // Change the SVG's fill color

                // Append this row to the body
                tbody.appendChild(cloneTr)
            }
            tr.remove()
        })

        setTotalCardCount()
    }


    const mainFn = async () => {
        const companyName = document.getElementById("txt-company").innerText//document.querySelector('[wfu-bind="$user.data.company-name"]').textContent

        const customFields = [{ field_id: '4ad343df-25d9-4ff1-b35d-084099a986e0', operator: '=', value: companyName }]

        const url = `https://x8ki-letl-twmt.n7.xano.io/api:c2SUee37/get_user_tasks?custom_fields=${JSON.stringify(customFields)}`

        await fetch(url).then(async (result) => await result.json().then(r => runFn(r)))
    }


    // We'll use this function to wait for certain query selectors before we run a callback
    const startObservingElements = ({ selectors, callback }) => {
        const observer = new MutationObserver((_mutations, obs) => {
            let foundSelectors = []

            selectors.forEach((selector) => {
                // Use jQuery to select the element
                const element = $(selector)
                if (element.length > 0 && !foundSelectors.includes(selector)) {
                    // Element exists and is not already in the found list, mark as found
                    foundSelectors.push(selector)

                    // Check if all selectors have been found
                    if (foundSelectors.length === selectors.length) {
                        // All elements are found, run the callback
                        callback()

                        // Disconnect the observer as its job is done
                        obs.disconnect()
                    }
                }
            })
        })

        observer.observe($('body')[0], {
            childList: true,
            subtree: true,
        })
    }


    startObservingElements({
        selectors: ['.faqs_dropdown.w-dropdown', '[wfu-bind="$user.data.company-name"]', '.dashboardv3-content_main-accordion-layout'],
        callback: mainFn,
    })
})
