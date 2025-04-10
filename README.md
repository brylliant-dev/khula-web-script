# Khula Dashboard

A client-facing dashboard application that provides real-time visibility into development tasks and tickets. This dashboard integrates with ClickUp through Xano API, allowing Khula's clients to track their development requests and monitor task progress.

![alt text](image.png)

## Features

- **Interactive Dashboard**
  - Real-time ticket tracking
  - Status-based ticket organization
  - Dynamic ticket count display
  - Priority-based color coding

- **Task Management**
  - Multiple status categories:
    - Incoming
    - In Progress
    - On Going
    - QA
    - Awaiting Client
  - Detailed ticket information display
  - File attachment support
  - Priority level indicators

- **UI Components**
  - Custom Swiper implementation for card sliders
  - Responsive design for all screen sizes
  - Interactive animations using GSAP
  - Dynamic text reveal effects
  - Modal windows for detailed views

## System Architecture

### Xano-ClickUp Integration

The dashboard utilizes Xano as a middleware to securely interact with ClickUp's API, providing clients with real-time task updates:

```javascript
// Data flow: ClickUp -> Xano -> Client Dashboard
waitForSessionStorage("wfuUser", (value) => {
    // Processes authenticated user session
    // Initiates Xano API calls for task data
});
```

#### API Integration Flow

1. **Authentication Layer**
   - Client authentication via Xano
   - Secure token management
   - Session handling for client access

2. **ClickUp Data Synchronization**
   - Task status updates
   - Assignment tracking
   - Priority management
   - Time tracking integration

3. **Client-Specific Data Filtering**
   ```javascript
   const statusList = {
       'awaiting client': [], // Client feedback required
       'on going': [],       // Active development
       'in progress': [],    // In developer queue
       incoming: [],         // New requests
       qa: [],              // Quality assurance phase
   };
   ```

#### Security Considerations

- Xano middleware ensures secure API key management
- Client data isolation
- Rate limiting implementation
- Request validation and sanitization

### Client Dashboard Features

1. **Ticket Creation**
   - Integration with ClickUp forms
   - File attachment handling
   - Priority setting
   - Developer assignment visibility

2. **Status Tracking**
   - Real-time status updates
   - Developer assignment information
   - Time tracking display
   - Priority level indicators

3. **Client Communication**
   - Comment thread integration
   - File sharing capabilities
   - Status change notifications
   - Developer feedback display

## Technologies Used

- **Frontend Framework**
  - Webflow
  - jQuery
  - GSAP (GreenSock Animation Platform)

- **Libraries**
  - Swiper.js for carousel functionality
  - SplitType for text animations
  - ScrollTrigger for scroll-based animations

- **Additional Tools**
  - Custom dropdown implementation
  - Session storage for state management
  - Responsive breakpoint handling

## Technical Documentation

### Dropdown.js and HTML Interaction

The dashboard implements a dynamic ticket management system through the interaction between `dropdown.js` and the HTML structure. Here's a detailed breakdown of the core functionalities:

#### 1. Session Storage and User Authentication
```javascript
waitForSessionStorage("wfuUser", (value) => {
    // Processes Base64 encoded user data
    updateDOM(value);
});
```
- Implements a polling mechanism to check for user data in session storage
- Expects Base64 encoded JSON containing user profile and permissions
- Handles timeout after 10 seconds if data isn't found

#### 2. Dynamic DOM Updates
The script updates multiple UI elements based on user data:
```javascript
function updateDOM(base64Value) {
    const decodedJson = JSON.parse(atob(base64Value));
    $("#client-name-display").text(decodedJson.name);
    $("#client-email-display").text(decodedJson.email);
    // Additional field updates...
}
```

#### 3. Ticket Management System
Organizes tickets into five main categories:
```javascript
const statusList = {
    'awaiting client': [],
    'on going': [],
    'in progress': [],
    incoming: [],
    qa: [],
};
```

Each category corresponds to a dropdown section in the HTML:
```html
<div class="faqs_dropdown w-dropdown">
    <!-- Dropdown content -->
</div>
```

#### 4. Priority Visualization
Implements a color-coding system for ticket priorities:
```javascript
const colorByPrioLvl = {
    HIGH: '#f6d259',    // Yellow
    NORMAL: '#8599ff',  // Blue
    URGENT: '#e88285',  // Red
    LOW: '#656d7a',     // Grey
};
```

#### 5. Interactive Features

##### Modal System
```javascript
$(document).on('click', '.dashboardv3-table_row', function(event) {
    const titleText = row.find('.dashboard-table_cell.title').text().trim();
    const taskDetails = getTaskDetailsByTitle(titleText);
    // Updates modal content and displays it
});
```

##### Loading States
```javascript
function showLoading() {
    const loadingOverlay = $('<div>', {
        id: 'loading-overlay',
        css: {
            // Styling properties
        }
    });
    // Append loading animation
}
```

#### 6. Data Formatting
- URL Detection: Converts URLs in text to clickable links
- Text Formatting: Handles line breaks and special characters
- Date Formatting: Standardizes date displays across tickets

#### 7. Event Handling
- Click Events: For ticket rows and modal interactions
- Dropdown Toggles: For category expansions
- Dynamic Content Updates: For real-time ticket status changes

### HTML Structure Requirements

The HTML must include specific elements for proper functionality:

1. **Ticket Container**
```html
<div class="dashboardv3-table_row">
    <div class="dashboard-table_cell title">
        <!-- Ticket title -->
    </div>
    <!-- Additional cells -->
</div>
```

2. **Modal Template**
```html
<div class="modal_wrapper">
    <div wized="ticket-modal" class="task-modal_wrapper">
        <!-- Modal content structure -->
    </div>
</div>
```

3. **Counter Elements**
```html
<div id="open-ticket-count"></div>
<div id="awaiting-client-feedback-count"></div>
```

### Performance Considerations

1. **Session Storage**
- Implements timeout mechanism (10 seconds)
- Handles Base64 validation
- Includes error handling for malformed data

2. **DOM Manipulation**
- Uses event delegation for dynamic content
- Implements efficient jQuery selectors
- Minimizes reflows and repaints

3. **Memory Management**
- Cleans up event listeners
- Manages modal state properly
- Handles dynamic content cleanup

### API Integration Requirements

The dashboard requires specific environment configuration for API integration:

1. **Xano Configuration**
```javascript
// Environment variables required
XANO_API_ENDPOINT=your_endpoint
XANO_API_KEY=your_api_key
CLICKUP_WORKSPACE_ID=your_workspace_id
```

2. **ClickUp Workspace Setup**
- Specific space configuration
- Custom fields setup
- Status workflow configuration
- Client view permissions

3. **Webhook Configuration**
- Status change triggers
- Assignment update events
- Comment notifications
- Priority change alerts

## Setup and Installation

1. Clone the repository
2. Ensure all dependencies are installed:
   - jQuery
   - GSAP
   - Swiper.js
   - SplitType

3. Include the necessary script files in your HTML:
```html
<script src="dropdown.js"></script>
<script src="custom-swiper.js"></script>
```

## Usage

### Swiper Implementation
The project includes two main Swiper implementations:

1. **Product Swiper**
```javascript
new Swiper('.product-swiper', {
  loop: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  // ... additional configuration
});
```

2. **Award Testament Swiper** (Mobile-only)
```javascript
new Swiper(".award-testament.swiper", {
  direction: "horizontal",
  loop: true,
  // ... additional configuration
});
```

### Animation System
The project uses GSAP for animations with ScrollTrigger:

```javascript
gsap.registerPlugin(ScrollTrigger);
// Text reveal animations
new SplitType(".text-reveal", {
  types: "lines, words"
});
```

## Responsive Design

The application is fully responsive with breakpoints at:
- Desktop: > 991px
- Tablet: 768px - 991px
- Mobile: < 768px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## API Usage

### Fetching Task Data
```javascript
// Example of task data retrieval through Xano
async function fetchClientTasks(clientId) {
    const response = await fetch(`${XANO_API_ENDPOINT}/client_tasks/${clientId}`);
    const tasks = await response.json();
    return tasks;
}
```

### Status Updates
```javascript
// Example of status update handling
function updateTaskStatus(taskId, newStatus) {
    // Xano handles the ClickUp API call
    return fetch(`${XANO_API_ENDPOINT}/update_status`, {
        method: 'POST',
        body: JSON.stringify({ taskId, status: newStatus })
    });
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or API-related queries, contact support@khula.studio

---

Made with ❤️ by Khula Studio 
