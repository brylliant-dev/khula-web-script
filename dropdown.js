const runFn = (tasks) => {
    const dropdownList = document.querySelectorAll(".faqs_dropdown.w-dropdown")
  
    const statusList = {
      "awaiting client": [],
      "on going": [],
      "in progress": [],
      incoming: [],
      "completed 2024": [],
    }
  
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
    const openTicketCount = document.querySelector('#open-ticket-count')
    const awaitingClientFeedbackCount = document.querySelector('#awaiting-client-feedback-count')

    openTicketCount.textContet = statusesByTasks['in progress'].length + statusesByTasks['on going'].length
    awaitingClientFeedbackCount.textContet = statusesByTasks['awaiting client'].length
  
    Array.from(dropdownList).forEach((ddl) => {
      const titleElem = ddl.querySelector(".faqs_dropdown_heading-layout")
      const key = titleElem.textContent.trim().toLowerCase()
      const statusByKey = statusesByTasks[key]
  
      const ticketCountElem = ddl.querySelector(".pending-tickets")
      const tbody = ddl.querySelector("tbody")
      const tr = tbody.querySelector("tr")
  
      if (!statusByKey) {
        tr.remove()
        return
      }
  
      ticketCountElem.textContent = `${statusByKey.length} Tickets`

      if(statusByKey.length === 0){
        const ddlClone = dd.cloneNode(true)

        dropdownParent.insertBefore(ddlClone, ddl)
        ddl.remove()
        return
      }
  
      for (let i = 0; i < statusByKey.length; i++) {
        const taskStatus = statusByKey[i]
  
        const cloneTr = tr.cloneNode(true)
        const td = cloneTr.querySelectorAll("td")
  
        const tdData = {
          ticket: td[0],
          dateCreated: td[1],
          dueDate: td[2],
          assignee: td[3].querySelector(".dashboard-table_cell-label"),
          priority: td[4].querySelector(".dashboard-table_cell-label"),
        }
        const getDateDigit = (date) => {
          if (!date) return "None"

          const parsedUnixDate = parseInt(date)

          if (isNaN(parsedUnixDate) ) return "None"
          
          const newDate = new Date(parsedUnixDate).toString().split(" ")
          return `${newDate[1]} ${newDate[2]}`
        }

        const assignees = taskStatus.assignees
        .map(ts => ts.username.split(' ').at(0))
        .join(', ')

        tdData.ticket.textContent = taskStatus.name
        tdData.dateCreated.textContent = getDateDigit(taskStatus.dateCreated)
        tdData.dueDate.textContent = getDateDigit(taskStatus.dueDate)
        tdData.assignee.textContent = assignees !== '' ? assignees : 'None'
        tdData.priority.textContent = (taskStatus.priority?.priority || "none").toUpperCase()
  
        tbody.appendChild(cloneTr)
      }
      tr.remove()
    })
  }
  

const mainFn = async() => {
    const companyName = document.querySelector('[wfu-bind="$user.data.company-name"]').textContent

    const customFields = [{field_id: "4ad343df-25d9-4ff1-b35d-084099a986e0", operator: "=", value: companyName}]

    const url = `https://x8ki-letl-twmt.n7.xano.io/api:c2SUee37/get_user_tasks?custom_fields=${JSON.stringify(customFields)}`
  
    await fetch(url).then(async(result) => await result.json().then(r => runFn(r)))
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


setTimeout(() => {
  startObservingElements({
    selectors: ['.faqs_dropdown.w-dropdown', '[wfu-bind="$user.data.company-name"]'],
    callback: mainFn,
  })
}, 500)
