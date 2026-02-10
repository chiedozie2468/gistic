/**
 * GISTIC Services - Live Chat AI Assistant
 * Professional customer support chatbot with natural language understanding
 */

document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('chatbot-trigger');
    if (!trigger) return;

    // --- STATE MANAGEMENT ---
    let state = {
        currentFlow: null, // 'service_request', 'report_issue', 'company_info', null
        currentStep: 0,
        serviceType: null, // 'plumbing', 'electrical', 'carpentry', 'housekeeping'
        answers: {},
        messages: [], // Array of message objects: { type: 'agent'|'user', content: string, timestamp: Date }
        history: [] // For back button support
    };

    // --- CONVERSATION FLOWS ---
    const flows = {
        report_issue: {
            steps: [
                {
                    id: 'issue_type',
                    type: 'radio',
                    prompt: 'Please select the type of issue you want to report.',
                    options: [
                        { label: 'Poor service quality', value: 'poor_quality' },
                        { label: 'Unprofessional behavior', value: 'unprofessional' },
                        { label: 'Incomplete or abandoned work', value: 'incomplete' },
                        { label: 'Overbilling or payment issue', value: 'billing' },
                        { label: 'App or website problem', value: 'technical' },
                        { label: 'Other', value: 'other' }
                    ],
                    required: true
                },
                {
                    id: 'related_service',
                    type: 'radio',
                    prompt: 'Which service was this issue related to?',
                    options: [
                        { label: 'Plumbing', value: 'plumbing' },
                        { label: 'Electrical', value: 'electrical' },
                        { label: 'Carpentry', value: 'carpentry' },
                        { label: 'Housekeeping', value: 'housekeeping' },
                        { label: 'Other', value: 'other' }
                    ],
                    required: true
                },
                {
                    id: 'description',
                    type: 'textarea',
                    prompt: 'Please describe what happened in detail.',
                    placeholder: 'What was done incorrectly? When did it happen? Any supporting details?',
                    minLength: 20,
                    required: true
                },
                {
                    id: 'contact_permission',
                    type: 'radio',
                    prompt: 'May we contact you regarding this report?',
                    options: [
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' }
                    ],
                    required: true
                }
            ]
        },
        painting: {
            steps: [
                {
                    id: 'type',
                    type: 'radio',
                    prompt: 'What type of painting service do you need?',
                    options: [
                        { label: 'Interior painting', value: 'interior' },
                        { label: 'Exterior painting', value: 'exterior' },
                        { label: 'Both interior and exterior', value: 'both' },
                        { label: 'Touch-up/Repair', value: 'touchup' }
                    ],
                    required: true
                },
                {
                    id: 'areas',
                    type: 'checkbox',
                    prompt: 'Which areas need painting?',
                    options: [
                        { label: 'Living room', value: 'living_room' },
                        { label: 'Bedroom(s)', value: 'bedroom' },
                        { label: 'Kitchen', value: 'kitchen' },
                        { label: 'Bathroom', value: 'bathroom' },
                        { label: 'Exterior walls', value: 'exterior_walls' },
                        { label: 'Ceiling', value: 'ceiling' },
                        { label: 'Doors/Windows', value: 'doors_windows' },
                        { label: 'Entire building', value: 'entire_building' }
                    ],
                    required: true
                },
                {
                    id: 'property',
                    type: 'radio',
                    prompt: 'What type of property is this?',
                    options: [
                        { label: 'Residential', value: 'residential' },
                        { label: 'Commercial', value: 'commercial' }
                    ],
                    required: true
                },
                {
                    id: 'urgency',
                    type: 'radio',
                    prompt: 'How urgent is this request?',
                    options: [
                        { label: 'Same day', value: 'same_day' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Flexible', value: 'flexible' }
                    ],
                    required: true
                },
                {
                    id: 'location',
                    type: 'location',
                    prompt: 'Where is the service needed?',
                    required: true
                },
                {
                    id: 'description',
                    type: 'textarea',
                    prompt: 'Please describe the painting project in detail.',
                    placeholder: 'What needs to be painted? Any color preferences? Current condition of surfaces?',
                    minLength: 20,
                    required: true
                }
            ]
        },
        electrical: {
            steps: [
                {
                    id: 'type',
                    type: 'radio',
                    prompt: 'What type of electrical service do you need?',
                    options: [
                        { label: 'Maintenance', value: 'maintenance' },
                        { label: 'Repair', value: 'repair' },
                        { label: 'Installation', value: 'installation' },
                        { label: 'Emergency', value: 'emergency' }
                    ],
                    required: true
                },
                {
                    id: 'areas',
                    type: 'checkbox',
                    prompt: 'Which areas are affected?',
                    options: [
                        { label: 'Living Room', value: 'living' },
                        { label: 'Kitchen/Appliances', value: 'kitchen' },
                        { label: 'Meter Box / DB Board', value: 'db_box' },
                        { label: 'Outdoor / Security lights', value: 'outdoor' },
                        { label: 'Entire Building', value: 'entire' }
                    ],
                    required: true
                },
                {
                    id: 'property',
                    type: 'radio',
                    prompt: 'What type of property is this?',
                    options: [
                        { label: 'Residential', value: 'residential' },
                        { label: 'Commercial', value: 'commercial' }
                    ],
                    required: true
                },
                {
                    id: 'urgency',
                    type: 'radio',
                    prompt: 'How urgent is this request?',
                    options: [
                        { label: 'Same day', value: 'same_day' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Flexible', value: 'flexible' }
                    ],
                    required: true
                },
                {
                    id: 'location',
                    type: 'location',
                    prompt: 'Where is the service needed?',
                    required: true
                },
                {
                    id: 'description',
                    type: 'textarea',
                    prompt: 'Please describe the electrical issue in detail.',
                    placeholder: 'What happened? Are there exposed wires? Any burnt smell?',
                    minLength: 20,
                    required: true
                }
            ]
        },
        carpentry: {
            steps: [
                {
                    id: 'type',
                    type: 'radio',
                    prompt: 'What type of carpentry work is needed?',
                    options: [
                        { label: 'Furniture Repair', value: 'furniture' },
                        { label: 'Roofing & Framework', value: 'roofing' },
                        { label: 'Cabinetry & Wardrobes', value: 'cabinets' },
                        { label: 'Doors/Windows', value: 'doors' },
                        { label: 'Full Construction', value: 'construction' }
                    ],
                    required: true
                },
                {
                    id: 'areas',
                    type: 'checkbox',
                    prompt: 'Select the relevant areas:',
                    options: [
                        { label: 'Indoor Furniture', value: 'indoor' },
                        { label: 'Outdoor/Decking', value: 'outdoor' },
                        { label: 'Roof/Ceiling', value: 'roof' },
                        { label: 'Kitchen/Storage', value: 'kitchen' }
                    ],
                    required: true
                },
                {
                    id: 'property',
                    type: 'radio',
                    prompt: 'What type of property is this?',
                    options: [
                        { label: 'Residential', value: 'residential' },
                        { label: 'Commercial', value: 'commercial' }
                    ],
                    required: true
                },
                {
                    id: 'urgency',
                    type: 'radio',
                    prompt: 'How urgent is this request?',
                    options: [
                        { label: 'Same day', value: 'same_day' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Flexible', value: 'flexible' }
                    ],
                    required: true
                },
                {
                    id: 'location',
                    type: 'location',
                    prompt: 'Where is the service needed?',
                    required: true
                },
                {
                    id: 'description',
                    type: 'textarea',
                    prompt: 'Please describe the carpentry requirements.',
                    placeholder: 'Dimensions? Type of wood? Any existing damage?',
                    minLength: 20,
                    required: true
                }
            ]
        },
        housekeeping: {
            steps: [
                {
                    id: 'type',
                    type: 'radio',
                    prompt: 'What housekeeping service do you require?',
                    options: [
                        { label: 'Deep Cleaning (One-time)', value: 'deep_clean' },
                        { label: 'Regular Maintenance Cleaning', value: 'regular' },
                        { label: 'Nanny / Child Care Services', value: 'nanny' },
                        { label: 'Laundry & Ironing', value: 'laundry' },
                        { label: 'Post-Construction Cleaning', value: 'post_const' }
                    ],
                    required: true
                },
                {
                    id: 'areas',
                    type: 'checkbox',
                    prompt: 'Select areas to focus on:',
                    options: [
                        { label: 'Bedrooms & Living Area', value: 'living' },
                        { label: 'Kitchen & Dining', value: 'kitchen' },
                        { label: 'Bathrooms & Toilets', value: 'bathrooms' },
                        { label: 'Windows & External', value: 'windows' },
                        { label: 'All Areas', value: 'all' }
                    ],
                    required: true
                },
                {
                    id: 'property',
                    type: 'radio',
                    prompt: 'What type of property is this?',
                    options: [
                        { label: 'Residential', value: 'residential' },
                        { label: 'Commercial', value: 'commercial' }
                    ],
                    required: true
                },
                {
                    id: 'urgency',
                    type: 'radio',
                    prompt: 'How soon do you need the service?',
                    options: [
                        { label: 'Same day', value: 'same_day' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Flexible', value: 'flexible' }
                    ],
                    required: true
                },
                {
                    id: 'location',
                    type: 'location',
                    prompt: 'Where is the service needed?',
                    required: true
                },
                {
                    id: 'description',
                    type: 'textarea',
                    prompt: 'Any specific instructions or requirements?',
                    placeholder: 'Are there pets? Any delicate items? Specific allergies?',
                    minLength: 20,
                    required: true
                }
            ]
        }
    };

    // --- NATURAL LANGUAGE PATTERNS ---
    const patterns = {
        hours: /what time|when (do you|are you) open|working hours|business hours|hours of operation/i,
        weekend: /weekend|saturday|sunday/i,
        pricing: /how much|cost|price|pricing|fee|charge/i,
        services: /what (do you|services)|services (do you|you offer)/i,
        plumbing: /plumb(er|ing)|leak|pipe|drain|water|toilet|sink/i,
        electrical: /electric(al|ian)|power|light|wiring|socket|outlet/i,
        carpentry: /carpen(ter|try)|wood|furniture|door|window|cabinet/i,
        housekeeping: /clean(ing|er)|housekeeper|maid|nanny/i,
        complaint: /complain|complaint|issue|problem|report|bad|poor|terrible/i,
        emergency: /emergency|urgent|asap|immediately|now/i
    };

    // --- UI CREATION ---
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    chatbotContainer.className = 'fixed bottom-24 right-6 w-[380px] max-h-[600px] bg-white rounded-2xl shadow-2xl hidden z-50 flex flex-col border border-gray-100 overflow-hidden transition-all duration-300';
    chatbotContainer.innerHTML = `
        <div class="bg-brand-dark p-4 flex justify-between items-center text-white">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                    <i class="uil uil-comment-dots text-xl"></i>
                </div>
                <div>
                    <h4 class="font-bold text-sm">GISTIC Support</h4>
                    <span class="text-xs opacity-70">Online</span>
                </div>
            </div>
            <button id="close-chatbot" class="hover:bg-white/10 rounded-lg p-2 transition">
                <i class="uil uil-times text-xl"></i>
            </button>
        </div>
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3"></div>
        <div id="chat-input-area" class="p-4 bg-white border-t">
            <div class="flex gap-2">
                <input type="text" id="chat-input" placeholder="Type your message..." class="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-brand-green text-sm">
                <button id="chat-send" class="bg-brand-green text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-dark transition">
                    <i class="uil uil-message"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    const closeBtn = document.getElementById('close-chatbot');
    const messagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    // --- EVENT LISTENERS ---
    trigger.addEventListener('click', () => {
        chatbotContainer.classList.toggle('hidden');
        if (!chatbotContainer.classList.contains('hidden') && state.messages.length === 0) {
            showGreeting();
        }
        scrollToBottom();
    });

    closeBtn.addEventListener('click', () => chatbotContainer.classList.add('hidden'));

    sendBtn.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    // --- CORE FUNCTIONS ---
    function showGreeting() {
        addAgentMessage('Welcome to GISTIC Services Support.');
        setTimeout(() => {
            addAgentMessage('Our working hours are Monday to Friday, 9:00 AM to 5:00 PM.');
        }, 500);
        setTimeout(() => {
            addAgentMessage('How may I assist you today?', {
                type: 'quick_actions',
                actions: [
                    { label: 'Request a Service', value: 'request_service', icon: 'uil-wrench' },
                    { label: 'Report an Issue', value: 'report_issue', icon: 'uil-exclamation-triangle' },
                    { label: 'Company Information', value: 'company_info', icon: 'uil-info-circle' },
                    { label: 'Contact Support', value: 'contact_support', icon: 'uil-phone' }
                ]
            });
        }, 1000);
    }

    function handleUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addUserMessage(text);
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            processUserInput(text);
        }, 800);
    }

    function processUserInput(text) {
        const lowerText = text.toLowerCase();

        // Check for hours query
        if (patterns.hours.test(lowerText)) {
            addAgentMessage('We operate Monday to Friday from 9:00 AM to 5:00 PM.');
            setTimeout(() => {
                addAgentMessage('Would you like to request a service or report an issue?', {
                    type: 'quick_actions',
                    actions: [
                        { label: 'Request a Service', value: 'request_service', icon: 'uil-wrench' },
                        { label: 'Report an Issue', value: 'report_issue', icon: 'uil-exclamation-triangle' }
                    ]
                });
            }, 500);
            return;
        }

        // Check for weekend query
        if (patterns.weekend.test(lowerText)) {
            addAgentMessage('We are currently closed on weekends. Our working hours are Monday to Friday, 9:00 AM to 5:00 PM.');
            return;
        }

        // Check for pricing query
        if (patterns.pricing.test(lowerText)) {
            addAgentMessage('Our pricing varies based on the service type and complexity. Please request a service, and our team will provide you with a detailed quote.');
            return;
        }

        // Check for services query
        if (patterns.services.test(lowerText)) {
            addAgentMessage('We offer professional home maintenance services including:');
            setTimeout(() => {
                addAgentMessage('Plumbing, Electrical, Carpentry, and Housekeeping services.');
            }, 500);
            setTimeout(() => {
                addAgentMessage('Which service would you like to know more about?');
            }, 1000);
            return;
        }

        // Check for complaint/issue
        if (patterns.complaint.test(lowerText)) {
            addAgentMessage('I am sorry to hear that. Let me help you report this issue.');
            setTimeout(() => startIssueReport(), 800);
            return;
        }

        // Check for service requests
        if (patterns.plumbing.test(lowerText)) {
            addAgentMessage('I can help with that plumbing request.');
            setTimeout(() => startServiceRequest('plumbing'), 800);
            return;
        }

        if (patterns.electrical.test(lowerText)) {
            addAgentMessage('I can help with that electrical request.');
            setTimeout(() => startServiceRequest('electrical'), 800);
            return;
        }

        if (patterns.carpentry.test(lowerText)) {
            addAgentMessage('I can help with that carpentry request.');
            setTimeout(() => startServiceRequest('carpentry'), 800);
            return;
        }

        if (patterns.housekeeping.test(lowerText)) {
            addAgentMessage('I can help with that housekeeping request.');
            setTimeout(() => startServiceRequest('housekeeping'), 800);
            return;
        }

        // Default response
        addAgentMessage('Thank you for your message. How can I assist you today?', {
            type: 'quick_actions',
            actions: [
                { label: 'Request a Service', value: 'request_service', icon: 'uil-wrench' },
                { label: 'Report an Issue', value: 'report_issue', icon: 'uil-exclamation-triangle' },
                { label: 'Company Information', value: 'company_info', icon: 'uil-info-circle' }
            ]
        });
    }

    function handleQuickAction(action) {
        if (action === 'request_service') {
            addAgentMessage('Please select the service you need.', {
                type: 'radio',
                stepId: 'service_selection',
                options: [
                    { label: 'Plumbing', value: 'plumbing', icon: 'uil-tear' },
                    { label: 'Electrical', value: 'electrical', icon: 'uil-bolt' },
                    { label: 'Carpentry', value: 'carpentry', icon: 'uil-hammer' },
                    { label: 'Housekeeping', value: 'housekeeping', icon: 'uil-home' }
                ]
            });
        } else if (action === 'report_issue') {
            startIssueReport();
        } else if (action === 'company_info') {
            showCompanyInfo();
        } else if (action === 'contact_support') {
            addAgentMessage('You can reach us at:');
            setTimeout(() => {
                addAgentMessage('Phone: +234 XXX XXX XXXX\nEmail: info@gisticservices.com\nLocation: Enugu Metropolis, Nigeria');
            }, 500);
        }
    }

    function showCompanyInfo() {
        addAgentMessage('GISTIC Services is a premier home maintenance company based in Enugu Metropolis, Nigeria.');
        setTimeout(() => {
            addAgentMessage('We provide professional, reliable, and vetted experts for all your repair and maintenance needs.');
        }, 800);
        setTimeout(() => {
            addAgentMessage('Our services include Plumbing, Electrical work, Carpentry, and Housekeeping.');
        }, 1600);
        setTimeout(() => {
            addAgentMessage('Would you like to request a service?', {
                type: 'quick_actions',
                actions: [
                    { label: 'Yes, Request Service', value: 'request_service', icon: 'uil-wrench' },
                    { label: 'No, Thank You', value: 'no_thanks', icon: 'uil-times-circle' }
                ]
            });
        }, 2400);
    }

    function startIssueReport() {
        state.currentFlow = 'report_issue';
        state.currentStep = 0;
        state.answers = {};
        renderCurrentStep();
    }

    function startServiceRequest(serviceType) {
        state.currentFlow = serviceType;
        state.serviceType = serviceType;
        state.currentStep = 0;
        state.answers = {};
        renderCurrentStep();
    }

    function renderCurrentStep() {
        const flow = flows[state.currentFlow];
        if (!flow) return;

        const step = flow.steps[state.currentStep];
        if (!step) {
            // All steps complete, show review
            showReview();
            return;
        }

        // Add agent message with interactive control
        addAgentMessage(step.prompt, {
            type: step.type,
            stepId: step.id,
            options: step.options,
            placeholder: step.placeholder,
            minLength: step.minLength,
            required: step.required
        });
    }

    function handleStepResponse(stepId, value) {
        state.answers[stepId] = value;

        // Show user's selection as a message
        let displayValue = value;
        const flow = flows[state.currentFlow];
        const step = flow.steps[state.currentStep];

        if (step.type === 'radio' && step.options) {
            const option = step.options.find(opt => opt.value === value);
            if (option) displayValue = option.label;
        } else if (step.type === 'checkbox' && Array.isArray(value)) {
            displayValue = value.map(v => {
                const option = step.options.find(opt => opt.value === v);
                return option ? option.label : v;
            }).join(', ');
        } else if (step.type === 'location') {
            displayValue = `${value.address}${value.landmark ? ' (Near ' + value.landmark + ')' : ''}`;
        }

        addUserMessage(displayValue);

        // Show confirmation
        setTimeout(() => {
            const confirmations = ['Understood.', 'Thank you.', 'Noted.', 'Got it.'];
            const randomConfirmation = confirmations[Math.floor(Math.random() * confirmations.length)];
            addAgentMessage(randomConfirmation);

            // Move to next step
            setTimeout(() => {
                state.currentStep++;
                renderCurrentStep();
            }, 600);
        }, 400);
    }

    function showReview() {
        addAgentMessage('Please review your request:');

        setTimeout(() => {
            const flow = flows[state.currentFlow];
            let summary = '';

            flow.steps.forEach(step => {
                const val = state.answers[step.id];
                let displayVal = val;

                if (step.type === 'location') {
                    displayVal = `${val.address}${val.landmark ? ' (Near ' + val.landmark + ')' : ''}`;
                } else if (Array.isArray(val)) {
                    displayVal = val.map(v => {
                        const opt = step.options.find(o => o.value === v);
                        return opt ? opt.label : v;
                    }).join(', ');
                } else if (step.options) {
                    const opt = step.options.find(o => o.value === val);
                    if (opt) displayVal = opt.label;
                }

                summary += `${step.prompt}\n${displayVal}\n\n`;
            });

            addAgentMessage(summary.trim());

            setTimeout(() => {
                addAgentMessage('Would you like to submit this request?', {
                    type: 'quick_actions',
                    actions: [
                        { label: 'Submit Request', value: 'submit', icon: 'uil-check' },
                        { label: 'Cancel', value: 'cancel', icon: 'uil-times' }
                    ]
                });
            }, 800);
        }, 500);
    }

    function submitRequest() {
        addAgentMessage('Submitting your request...');

        const submissionData = {
            flowType: state.currentFlow,
            serviceType: state.serviceType,
            timestamp: new Date().toISOString(),
            details: state.answers
        };

        console.log('Submitting:', submissionData);

        // Simulate submission
        setTimeout(() => {
            addAgentMessage('Your request has been submitted successfully.');
            setTimeout(() => {
                addAgentMessage('A specialized team member will contact you within working hours to provide a quote.');
            }, 800);
            setTimeout(() => {
                addAgentMessage('Is there anything else I can help you with?', {
                    type: 'quick_actions',
                    actions: [
                        { label: 'New Request', value: 'request_service', icon: 'uil-wrench' },
                        { label: 'No, Thank You', value: 'no_thanks', icon: 'uil-check' }
                    ]
                });
                resetState();
            }, 1600);
        }, 1500);
    }

    function resetState() {
        state.currentFlow = null;
        state.currentStep = 0;
        state.serviceType = null;
        state.answers = {};
    }

    // --- MESSAGE RENDERING ---
    function addAgentMessage(text, interactive = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-2 items-start animate-slide-up';

        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white text-xs flex-shrink-0';
        avatar.innerHTML = '<i class="uil uil-robot"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-[280px]';

        const textDiv = document.createElement('div');
        textDiv.className = 'text-sm text-gray-700 whitespace-pre-line';
        textDiv.textContent = text;
        bubble.appendChild(textDiv);

        if (interactive) {
            const interactiveDiv = document.createElement('div');
            interactiveDiv.className = 'mt-3';

            if (interactive.type === 'quick_actions') {
                interactiveDiv.className = 'mt-3 flex flex-wrap gap-2';
                interactive.actions.forEach(action => {
                    const btn = document.createElement('button');
                    btn.className = 'px-4 py-2 bg-brand-light text-brand-dark rounded-full text-xs font-semibold hover:bg-brand-green hover:text-white transition flex items-center gap-2';
                    btn.innerHTML = `<i class="uil ${action.icon}"></i> ${action.label}`;
                    btn.onclick = () => {
                        if (action.value === 'submit') {
                            submitRequest();
                        } else if (action.value === 'cancel' || action.value === 'no_thanks') {
                            addUserMessage(action.label);
                            setTimeout(() => {
                                addAgentMessage('Understood. Feel free to reach out if you need assistance.');
                                resetState();
                            }, 500);
                        } else {
                            addUserMessage(action.label);
                            setTimeout(() => handleQuickAction(action.value), 500);
                        }
                    };
                    interactiveDiv.appendChild(btn);
                });
            } else if (interactive.type === 'radio') {
                interactiveDiv.className = 'mt-3 space-y-2';
                interactive.options.forEach(option => {
                    const label = document.createElement('label');
                    label.className = 'flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-light transition';
                    label.innerHTML = `
                        <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <i class="uil ${option.icon || 'uil-circle'}"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">${option.label}</span>
                    `;
                    label.onclick = () => {
                        if (interactive.stepId === 'service_selection') {
                            addUserMessage(option.label);
                            setTimeout(() => {
                                addAgentMessage('Excellent choice.');
                                setTimeout(() => startServiceRequest(option.value), 600);
                            }, 400);
                        } else {
                            handleStepResponse(interactive.stepId, option.value);
                        }
                    };
                    interactiveDiv.appendChild(label);
                });
            } else if (interactive.type === 'checkbox') {
                interactiveDiv.className = 'mt-3 space-y-2';
                const selectedValues = [];

                interactive.options.forEach(option => {
                    const label = document.createElement('label');
                    label.className = 'flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-light transition';
                    label.innerHTML = `
                        <div class="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center">
                            <i class="uil uil-check text-xs text-white hidden"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">${option.label}</span>
                    `;
                    label.onclick = () => {
                        const checkbox = label.querySelector('div');
                        const icon = label.querySelector('i');
                        const index = selectedValues.indexOf(option.value);

                        if (index > -1) {
                            selectedValues.splice(index, 1);
                            checkbox.classList.remove('bg-brand-green', 'border-brand-green');
                            checkbox.classList.add('border-gray-300');
                            icon.classList.add('hidden');
                        } else {
                            selectedValues.push(option.value);
                            checkbox.classList.add('bg-brand-green', 'border-brand-green');
                            checkbox.classList.remove('border-gray-300');
                            icon.classList.remove('hidden');
                        }
                    };
                    interactiveDiv.appendChild(label);
                });

                const continueBtn = document.createElement('button');
                continueBtn.className = 'mt-3 w-full bg-brand-green text-white py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition';
                continueBtn.textContent = 'Continue';
                continueBtn.onclick = () => {
                    if (selectedValues.length === 0 && interactive.required) {
                        alert('Please select at least one option.');
                        return;
                    }
                    handleStepResponse(interactive.stepId, selectedValues);
                };
                interactiveDiv.appendChild(continueBtn);
            } else if (interactive.type === 'location') {
                interactiveDiv.className = 'mt-3 space-y-2';
                interactiveDiv.innerHTML = `
                    <input type="text" id="loc-address" placeholder="Full Address" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green">
                    <input type="text" id="loc-landmark" placeholder="Nearest Landmark (Optional)" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green">
                    <button id="loc-submit" class="w-full bg-brand-green text-white py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition">Continue</button>
                `;
                setTimeout(() => {
                    document.getElementById('loc-submit').onclick = () => {
                        const address = document.getElementById('loc-address').value.trim();
                        const landmark = document.getElementById('loc-landmark').value.trim();
                        if (!address || address.length < 5) {
                            alert('Please enter a valid address.');
                            return;
                        }
                        handleStepResponse(interactive.stepId, { address, landmark });
                    };
                }, 0);
            } else if (interactive.type === 'textarea') {
                interactiveDiv.className = 'mt-3';
                interactiveDiv.innerHTML = `
                    <textarea id="textarea-input" rows="4" placeholder="${interactive.placeholder || ''}" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green resize-none"></textarea>
                    <div class="text-xs text-gray-400 mt-1" id="char-count">0 / ${interactive.minLength || 20}</div>
                    <button id="textarea-submit" class="mt-2 w-full bg-brand-green text-white py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition">Continue</button>
                `;
                setTimeout(() => {
                    const textarea = document.getElementById('textarea-input');
                    const charCount = document.getElementById('char-count');
                    textarea.oninput = () => {
                        charCount.textContent = `${textarea.value.length} / ${interactive.minLength || 20}`;
                    };
                    document.getElementById('textarea-submit').onclick = () => {
                        const value = textarea.value.trim();
                        if (interactive.required && value.length < (interactive.minLength || 20)) {
                            alert(`Please provide more detail (minimum ${interactive.minLength || 20} characters).`);
                            return;
                        }
                        handleStepResponse(interactive.stepId, value);
                    };
                }, 0);
            }

            bubble.appendChild(interactiveDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-2 items-start justify-end animate-slide-up';

        const bubble = document.createElement('div');
        bubble.className = 'bg-brand-green text-white rounded-2xl rounded-tr-sm p-3 shadow-sm max-w-[280px]';
        bubble.innerHTML = `<div class="text-sm whitespace-pre-line">${text}</div>`;

        messageDiv.appendChild(bubble);
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'flex gap-2 items-start animate-slide-up';
        indicator.innerHTML = `
            <div class="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white text-xs">
                <i class="uil uil-robot"></i>
            </div>
            <div class="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
});
