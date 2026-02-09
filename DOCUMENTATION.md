# GISTIC Website - Project Documentation 🚀

Welcome to the **GISTIC Services** codebase! This project is designed as a modern, high-performance service platform. It's built with simplicity in mind so you can learn how a real-world frontend works without complex backends.

---

## 🏗️ Project Architecture
This is a **Serverless Frontend Architecture**. 
- **HTML5/Tailwind CSS**: For structure and premium styling (Glassmorphism, Pill Navs).
- **Vanilla JavaScript**: All logic is written in plain JS (no heavy frameworks like React) to make it easy to follow.
- **FormSubmit.co**: Handles all our emails. No server required!

---

## 📂 File Map (Where to look)
- `index.html`: The main face of the company.
- `js/main.js`: **Core UI Logic**. Look here to see how the sticky navigation and the counter animations work.
- `js/chatbot.js`: **The Brain**. This handles the interactive support bot. It uses a "Step-by-Step" logic flow.
- `js/auth.js`: **User Logic**. A simulation of how logins and roles work on the frontend.
- `js/security.js`: **Safety**. Basic tools for cleaning user input and preventing spam.

---

## 🧠 How the Features Work (Learning Guide)

### 1. The Interactive Chatbot (`js/chatbot.js`)
The chatbot works using a **Task-based state system**.
- It starts with `showInitialOptions()`.
- When you click a button, it calls `handleAction()`.
- For the **Report Problem** flow, we use a variable called `currentTask`. If it's set to `'waiting_for_report_details'`, the bot knows the NEXT message you type is the report detail, not a general question.

### 2. The Smart Map Modal
Located in `index.html` (Modal) and `js/main.js` (Logic). 
- **Search**: Uses the Google Maps "Open Search" query format to update the `<iframe>` source dynamically.
- **Locate Me**: Uses the `navigator.geolocation` browser API to find your latitude/longitude.
- **Reset**: Restores the map to GISTIC HQ in Enugu.

### 3. Automatic Emails
We don't have a database. Instead, every form uses `action="https://formsubmit.co/your@email.com"`. 
- For the Chatbot, we use a `fetch` call to FormSubmit's AJAX endpoint so the user doesn't have to leave the chat to send an email!

### 4. Nav Synchronization
The navigation bar is kept consistent across all pages. The "Active" state (the green pill) is manually added to the current page's link in the HTML (e.g., `<a href="index.html" class="pill-nav-item active">`).

---

## 🛠️ How to Run & Learn
1. **Open index.html**: Just right-click and "Open with Browser".
2. **Experiment**: Try changing a color in the `<script>` tag at the top of the HTML files (Tailwind Config).
3. **Inspect**: Press `F12` in your browser to see the console and how the elements change as you interact.

Happy Coding! 💻
