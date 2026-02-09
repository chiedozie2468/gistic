/**
 * GISTIC Services - Chatbot
 * A specialized chatbot for customer support and company FAQ.
 */

document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('chatbot-trigger');
    if (!trigger) return;

    let currentTask = null; // To track if we are in a multi-step flow like reporting
    let reportCategory = null;

    // Load Chat History from SessionStorage
    const getHistory = () => {
        const history = sessionStorage.getItem('gistic_chat_history');
        return history ? JSON.parse(history) : [];
    };

    const saveHistory = (message, sender) => {
        const history = getHistory();
        history.push({ message, sender, timestamp: new Date().getTime() });
        sessionStorage.setItem('gistic_chat_history', JSON.stringify(history));
    };

    const clearHistory = () => {
        sessionStorage.removeItem('gistic_chat_history');
        const messagesRow = document.getElementById('chatbot-messages');
        messagesRow.innerHTML = '';
        currentTask = null;
        reportCategory = null;
        showInitialOptions();
    };

    // Create Chatbot UI
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    chatbotContainer.className = 'fixed bottom-24 right-6 w-80 max-h-[75vh] bg-white rounded-2xl shadow-2xl hidden z-50 flex flex-col border border-gray-100 overflow-hidden font-sans';
    chatbotContainer.innerHTML = `
        <div class="bg-brand-green p-4 flex justify-between items-center text-white shadow-md">
            <div class="flex items-center gap-2">
                <div class="relative">
                    <i class="uil uil-robot text-2xl"></i>
                    <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-300 border-2 border-brand-green rounded-full"></span>
                </div>
                <div>
                    <h4 class="font-bold text-sm leading-none">GISTIC Support</h4>
                    <span class="text-[10px] opacity-80">Always Online</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button id="reset-chat" title="Start Afresh" class="hover:bg-white/20 rounded-full p-1.5 transition text-xs"><i class="uil uil-refresh"></i></button>
                <button id="close-chatbot" class="hover:bg-white/20 rounded-full p-1.5 transition"><i class="uil uil-multiply"></i></button>
            </div>
        </div>
        <div id="chatbot-messages" class="flex-1 p-4 overflow-y-auto bg-gray-50 text-sm space-y-4 min-h-[250px]">
            <!-- Messages go here -->
        </div>
        <div id="chat-options-container" class="px-4 pb-3 bg-gray-50 flex flex-wrap gap-2">
            <!-- Dynamic options -->
        </div>
        <div class="p-3 border-t bg-white flex gap-2 items-center">
            <input type="text" id="chat-input" placeholder="Ask anything..." class="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green shadow-sm">
            <button id="send-chat" class="bg-brand-green text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-dark transition shadow-md active:scale-90"><i class="uil uil-message text-xl"></i></button>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    const closeBtn = document.getElementById('close-chatbot');
    const resetBtn = document.getElementById('reset-chat');
    const messages = document.getElementById('chatbot-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const optionsContainer = document.getElementById('chat-options-container');

    // Toggle Chatbot
    trigger.addEventListener('click', () => {
        chatbotContainer.classList.toggle('hidden');
        if (!chatbotContainer.classList.contains('hidden')) {
            const history = getHistory();
            if (history.length === 0) {
                showInitialOptions();
            } else {
                renderHistory();
            }
        }
    });

    closeBtn.addEventListener('click', () => chatbotContainer.classList.add('hidden'));
    resetBtn.addEventListener('click', clearHistory);

    // Initial Menu Options
    function showInitialOptions() {
        messages.innerHTML = '';
        currentTask = null;
        reportCategory = null;
        addBotMessage("Hello! 👋 I'm your GISTIC assistant. Our official working hours are <b>Monday to Friday, 9:00 AM - 5:00 PM</b>. How can I help you today?", false);
        
        const options = [
            { text: "📞 Contact Us", action: "contact_us" },
            { text: "🚨 Report a Problem", action: "report" },
            { text: "ℹ️ Information Needed", action: "info" },
            { text: "🛠 Help with Service", action: "help" },
            { text: "🏢 About Company", action: "about" }
        ];
        renderOptions(options);
    }

    function renderOptions(options) {
        optionsContainer.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option-btn bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-brand-light hover:border-brand-green transition text-[11px] text-gray-700 font-semibold shadow-sm';
            btn.innerText = opt.text;
            btn.onclick = () => handleAction(opt.action, opt.text, opt.type);
            optionsContainer.appendChild(btn);
        });
    }

    function renderHistory() {
        messages.innerHTML = '';
        const history = getHistory();
        history.forEach(item => {
            appendMessage(item.message, item.sender, false);
        });
        messages.scrollTop = messages.scrollHeight;
    }

    function handleAction(action, label, extraType) {
        addUserMessage(label);
        optionsContainer.innerHTML = '';
        
        setTimeout(() => {
            let response = "";
            let subOptions = [];

            switch(action) {
                case 'contact_us':
                    response = "How would you like to reach us? Our team is available Mon-Fri, 9am - 5pm.";
                    subOptions = [
                        { text: "📞 Voice Call", action: "contact_call" },
                        { text: "💬 WhatsApp Chat", action: "contact_whatsapp" },
                        { text: "📅 Book Google Meet", action: "contact_meet" },
                        { text: "🔙 Back to Main Menu", action: "main_menu" }
                    ];
                    break;
                case 'contact_call':
                    response = "You can reach us directly at <a href='tel:+234XXXXXXXXXX' class='font-bold underline'>+234 XXX XXX XXXX</a>. We're picking up calls Monday to Friday, 9 AM - 5 PM.";
                    subOptions = [{ text: "🔙 Back to Main Menu", action: "main_menu" }];
                    break;
                case 'contact_whatsapp':
                    response = "Chat with us instantly on WhatsApp for quick support. <br><br><a href='https://wa.me/234XXXXXXXXXX' target='_blank' class='bg-green-500 text-white px-4 py-2 rounded-full inline-block font-bold mt-2 shadow-sm'><i class='uil uil-whatsapp'></i> Chat Now</a>";
                    subOptions = [{ text: "🔙 Back to Main Menu", action: "main_menu" }];
                    break;
                case 'contact_meet':
                    response = "Need a video consultation? Book a Google Meet session with our team. <br><br><a href='https://calendly.com/' target='_blank' class='bg-blue-600 text-white px-4 py-2 rounded-full inline-block font-bold mt-2 shadow-sm'><i class='uil uil-video'></i> Schedule Meet</a>";
                    subOptions = [{ text: "🔙 Back to Main Menu", action: "main_menu" }];
                    break;
                case 'report':
                    response = "We take reports seriously. What kind of issue are you facing?";
                    subOptions = [
                        { text: "🏷️ Bad Service", action: "report_type", type: "Bad Service" },
                        { text: "💰 Billing Error", action: "report_type", type: "Billing Error" },
                        { text: "🐛 App/Website Bug", action: "report_type", type: "App/Website Bug" },
                        { text: "🔙 Back to Main Menu", action: "main_menu" }
                    ];
                    break;
                case 'report_type':
                    const type = extraType || label;
                    reportCategory = type;
                    currentTask = 'waiting_for_report_details';
                    response = `Understood. You selected <b>${type}</b>. Please provide more details about what happened or what you saw.`;
                    break;
                case 'info':
                    response = "I can provide info on many topics. What are you looking for?";
                    subOptions = [
                        { text: "📋 Registration", action: "info_reg" },
                        { text: "📍 Areas Covered", action: "info_areas" },
                        { text: "🤝 Our Partners", action: "info_partners" },
                        { text: "🔙 Back to Main Menu", action: "main_menu" }
                    ];
                    break;
                case 'help':
                    response = "I'm here to help. Which service do you need help with?";
                    subOptions = [
                        { text: "⚡ Electrical", action: "help_elec" },
                        { text: "🚰 Plumbing", action: "help_plumb" },
                        { text: "🧹 Cleaning", action: "help_clean" },
                        { text: "🔙 Back to Main Menu", action: "main_menu" }
                    ];
                    break;
                case 'help_elec':
                    response = "What seems to be the electrical issue you're facing?";
                    subOptions = [
                        { text: "🔌 Power Outage/Total Blackout", action: "help_success", type: "Power Outage" },
                        { text: "⚡ Sparking or Burnt Smell", action: "help_success", type: "Sparking" },
                        { text: "💡 Light Installation", action: "help_success", type: "Installation" },
                        { text: "🤔 Something Else...", action: "help_other", type: "Electrical" },
                        { text: "🔙 Back", action: "help" }
                    ];
                    break;
                case 'help_clean':
                    response = "What type of cleaning service do you require?";
                    subOptions = [
                        { text: "🏠 Deep Home Cleaning", action: "help_success", type: "Deep Clean" },
                        { text: "🏢 Post-Construction Cleaning", action: "help_success", type: "Post-Con" },
                        { text: "🧹 Regular Housekeeping", action: "help_success", type: "Housekeeping" },
                        { text: "🤔 Something Else...", action: "help_other", type: "Cleaning" },
                        { text: "🔙 Back", action: "help" }
                    ];
                    break;
                case 'help_other':
                    reportCategory = extraType || "General Help";
                    currentTask = 'waiting_for_help_details';
                    response = `I understand. Please type a brief description of the <b>${reportCategory}</b> issue you're experiencing so our experts can prepare correctly.`;
                    break;
                case 'help_success':
                    const service = extraType || label;
                    response = `Perfect. We've noted your interest in <b>${service}</b> help. A specialist will be assigned to your request within 2 hours.`;
                    subOptions = [{ text: "🔙 Back to Main Menu", action: "main_menu" }];
                    break;
                case 'about':
                    response = "GISTIC Services is Enugu's #1 platform for home maintenance. We operate <b>Mon-Fri, 9am - 5pm</b>.";
                    subOptions = [
                        { text: "🎯 Our Vision", action: "about_vision" },
                        { text: "📞 Contact Team", action: "about_contact" },
                        { text: "🔙 Back to Main Menu", action: "main_menu" }
                    ];
                    break;
                case 'main_menu':
                    showInitialOptions();
                    return;
                default:
                    response = `Ref: ${label}. A representative has been notified. You can also reach us directly at +234 XXX XXX XXXX.`;
            }

            if (response) addBotMessage(response);
            if (subOptions.length > 0) renderOptions(subOptions);
        }, 800);
    }

    function addUserMessage(text) {
        appendMessage(text, 'user');
        saveHistory(text, 'user');
    }

    function addBotMessage(text, save = true) {
        appendMessage(text, 'bot');
        if (save) saveHistory(text, 'bot');
    }

    function appendMessage(text, sender, animate = true) {
        const div = document.createElement('div');
        div.className = `max-w-[85%] p-3 rounded-2xl text-sm relative ${
            sender === 'bot' 
            ? 'bg-brand-light text-gray-800 self-start rounded-tl-none border border-brand-green/10' 
            : 'bg-brand-green text-white self-end rounded-tr-none ml-auto shadow-md shadow-brand-green/10'
        } ${animate ? 'animate-fade-in' : ''}`;
        
        div.innerHTML = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    // Handle Input
    sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            addUserMessage(text);
            input.value = '';
            setTimeout(() => {
                if (currentTask === 'waiting_for_report_details') {
                    handleReportDetails(text);
                } else if (currentTask === 'waiting_for_help_details') {
                    handleHelpDetails(text);
                } else {
                    respondToUser(text);
                }
            }, 1000);
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    function handleReportDetails(details) {
        addBotMessage(`Thank you for the detailed report regarding <b>${reportCategory}</b>. <br><br><b>Details:</b> ${details}<br><br>We have logged this internally. A member of our team will review this and get back to you during our working hours (Mon-Fri, 9am-5pm).`);
        
        // Send to Email via FormSubmit
        fetch('https://formsubmit.co/ajax/info@gisticservices.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `New Chatbot Problem Report: ${reportCategory}`,
                Category: reportCategory,
                Details: details,
                _captcha: "false"
            })
        });

        currentTask = null;
        reportCategory = null;
        setTimeout(() => {
            renderOptions([{ text: "🔙 Back to Main Menu", action: "main_menu" }]);
        }, 1200);
    }

    function handleHelpDetails(details) {
        addBotMessage(`Thank you for explaining your <b>${reportCategory}</b> needs: <br><br><i>"${details}"</i><br><br>I have sent this to our specialized team. A representative will reach out to you within the hour (during working hours) to provide a quote.`);
        
        // Send to Email via FormSubmit
        fetch('https://formsubmit.co/ajax/info@gisticservices.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `New Specialized Help Request: ${reportCategory}`,
                Service: reportCategory,
                Description: details,
                _captcha: "false"
            })
        });

        currentTask = null;
        reportCategory = null;
        setTimeout(() => {
            renderOptions([{ text: "🔙 Back to Main Menu", action: "main_menu" }]);
        }, 1200);
    }

    function respondToUser(text) {
        const lower = text.toLowerCase();
        let response = "";

        if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
            response = "Our pricing is transparent and varies by task. Most small repairs start as low as ₦5,000. Would you like a detailed estimate?";
        } else if (lower.includes('location') || lower.includes('office') || lower.includes('where')) {
            response = "We are located at Enugu Metropolis, Nigeria. Our services cover the entire city and its surroundings.";
        } else if (lower.includes('hours') || lower.includes('time') || lower.includes('when')) {
            response = "We work from <b>Monday to Friday, 9:00 AM to 5:00 PM</b>. We are closed on weekends.";
        } else if (lower.includes('call') || lower.includes('contact') || lower.includes('whatsapp') || lower.includes('meet')) {
            response = "You can contact us via voice call (+234 XXX XXX XXXX), WhatsApp, or book a Google Meet session. Which do you prefer?";
            renderOptions([
                { text: "📞 Call", action: "contact_call" },
                { text: "💬 WhatsApp", action: "contact_whatsapp" },
                { text: "📅 Google Meet", action: "contact_meet" }
            ]);
        } else if (lower.includes('who') || lower.includes('what strategy') || lower.includes('company')) {
            response = "GISTIC stands for reliability. We provide vetted professionals for home maintenance. We operate Mon-Fri, 9am-5pm.";
        } else if (lower.includes('invest') || lower.includes('partner')) {
            response = "We are open to partnerships and investors! Check our <a href='investors.html' class='font-bold underline'>Investor Page</a>.";
        } else if (lower.includes('hello') || lower.includes('hi')) {
            response = "Hello! Looking for something specific today?";
        } else {
            response = "I'm not sure about that. Try asking about our 'services', 'working hours', or selecting 'Contact Us' from the menu.";
        }

        addBotMessage(response);
    }
});
