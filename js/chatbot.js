/**
 * GISTIC Services - Professional Service Intake System
 * A guided multi-step booking workflow for enterprise-grade home services.
 */

document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('chatbot-trigger');
    if (!trigger) return;

    // --- STATE MANAGEMENT ---
    let state = {
        currentStep: 0,
        flow: 'main', // 'main', 'plumbing', 'electrical', 'carpentry', 'housekeeping'
        answers: {},
        history: [] // To support the back button [ {flow, step, answers} ]
    };

    // --- FLOW DEFINITIONS ---
    const flows = {
        main: {
            steps: [
                {
                    id: 'service_selection',
                    type: 'radio',
                    prompt: 'Which service do you need?',
                    options: [
                        { label: 'Plumbing', value: 'plumbing', icon: 'uil-tear' },
                        { label: 'Electrical', value: 'electrical', icon: 'uil-bolt' },
                        { label: 'Carpentry', value: 'carpentry', icon: 'uil-hammer' },
                        { label: 'Housekeeping', value: 'housekeeping', icon: 'uil-home' }
                    ],
                    required: true
                }
            ]
        },
        plumbing: {
            steps: [
                {
                    id: 'type',
                    type: 'radio',
                    prompt: 'What type of plumbing service do you need?',
                    options: [
                        { label: 'Maintenance', value: 'maintenance' },
                        { label: 'Repair (leaks, blocked drains, burst pipes)', value: 'repair' },
                        { label: 'Full installation', value: 'installation' },
                        { label: 'Emergency plumbing', value: 'emergency' }
                    ],
                    required: true
                },
                {
                    id: 'areas',
                    type: 'checkbox',
                    prompt: 'Which areas are affected?',
                    options: [
                        { label: 'Bathroom', value: 'bathroom' },
                        { label: 'Kitchen', value: 'kitchen' },
                        { label: 'Toilet', value: 'toilet' },
                        { label: 'Outdoor plumbing', value: 'outdoor' },
                        { label: 'Water tank', value: 'water_tank' },
                        { label: 'General piping', value: 'general' }
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
                        { label: 'Emergency (same day)', value: 'emergency' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Flexible scheduling', value: 'flexible' }
                    ],
                    required: true
                },
                {
                    id: 'location',
                    type: 'location', // Custom type for address + landmark
                    prompt: 'Where is the service needed?',
                    required: true
                },
                {
                    id: 'description',
                    type: 'textarea',
                    prompt: 'Please describe the plumbing issue in detail.',
                    placeholder: 'What is the issue? When did it start? Any previous repair attempts?',
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
                        { label: 'General Maintenance', value: 'maintenance' },
                        { label: 'Repair (sparking, blackout, faults)', value: 'repair' },
                        { label: 'Installation (fittings, wiring)', value: 'installation' },
                        { label: 'Emergency Response', value: 'emergency' }
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
                        { label: 'Emergency (same day)', value: 'emergency' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Flexible scheduling', value: 'flexible' }
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
                        { label: 'Emergency (same day)', value: 'emergency' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Flexible scheduling', value: 'flexible' }
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
                        { label: 'Immediately / Today', value: 'today' },
                        { label: 'Within 48 hours', value: '48h' },
                        { label: 'Scheduled / Weekly', value: 'scheduled' }
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

    // --- UI GENERATION ---
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    chatbotContainer.className = 'fixed bottom-24 right-6 w-[350px] max-h-[85vh] bg-white rounded-2xl shadow-2xl hidden z-50 flex flex-col border border-gray-100 overflow-hidden font-sans transition-all duration-300';
    chatbotContainer.innerHTML = `
        <div class="bg-brand-dark p-5 flex justify-between items-center text-white shadow-lg">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-inner">
                    <i class="uil uil-clipboard-notes text-xl"></i>
                </div>
                <div>
                    <h4 class="font-bold text-base leading-none">Service Intake</h4>
                    <span class="text-[10px] opacity-70 uppercase tracking-widest font-semibold">GISTIC Professional</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button id="reset-intake" title="Cancel & Reset" class="hover:bg-white/10 rounded-lg p-2 transition text-white/80 hover:text-white"><i class="uil uil-refresh"></i></button>
                <button id="close-chatbot" class="hover:bg-white/10 rounded-lg p-2 transition text-white/80 hover:text-white"><i class="uil uil-multiply"></i></button>
            </div>
        </div>
        <div id="intake-progress" class="h-1 bg-gray-100 w-full">
            <div id="intake-progress-bar" class="h-full bg-brand-green transition-all duration-500" style="width: 0%"></div>
        </div>
        <div id="intake-content" class="flex-1 p-6 overflow-y-auto bg-gray-50/50">
            <!-- Dynamic Form Content -->
        </div>
        <div id="intake-footer" class="p-4 bg-white border-t flex gap-3 justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button id="intake-back" class="hidden flex items-center gap-2 text-gray-500 hover:text-brand-dark font-semibold text-sm px-4 py-2 transition disabled:opacity-30">
                <i class="uil uil-arrow-left"></i> Back
            </button>
            <button id="intake-next" class="flex-1 bg-brand-green text-white font-bold rounded-xl py-3 px-6 hover:bg-brand-dark transition shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2 active:scale-95">
                Continue <i class="uil uil-arrow-right"></i>
            </button>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    const closeBtn = document.getElementById('close-chatbot');
    const resetBtn = document.getElementById('reset-intake');
    const content = document.getElementById('intake-content');
    const backBtn = document.getElementById('intake-back');
    const nextBtn = document.getElementById('intake-next');
    const progressBar = document.getElementById('intake-progress-bar');

    trigger.addEventListener('click', () => {
        chatbotContainer.classList.toggle('hidden');
        if (!chatbotContainer.classList.contains('hidden')) {
            render();
        }
    });

    closeBtn.addEventListener('click', () => chatbotContainer.classList.add('hidden'));
    resetBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to cancel this request? All progress will be lost.")) {
            reset();
        }
    });

    backBtn.addEventListener('click', goBack);
    nextBtn.addEventListener('click', goNext);

    function reset() {
        state = { currentStep: 0, flow: 'main', answers: {}, history: [] };
        render();
    }

    function goBack() {
        if (state.history.length > 0) {
            const prevState = state.history.pop();
            state.flow = prevState.flow;
            state.currentStep = prevState.step;
            state.answers = prevState.answers;
            render();
        }
    }

    function goNext() {
        const currentFlow = flows[state.flow];
        const step = currentFlow.steps[state.currentStep];
        
        // Handle Review Screen specifically
        if (state.currentStep === currentFlow.steps.length) {
            submitForm();
            return;
        }

        // Validate
        if (!validateStep(step)) return;

        // Save History
        state.history.push({
            flow: state.flow,
            step: state.currentStep,
            answers: JSON.parse(JSON.stringify(state.answers))
        });

        // Transition logic
        if (state.flow === 'main' && step.id === 'service_selection') {
            state.flow = state.answers['service_selection'];
            state.currentStep = 0;
        } else {
            state.currentStep++;
        }
        
        render();
    }

    function validateStep(step) {
        const val = state.answers[step.id];
        content.querySelectorAll('.error-msg').forEach(e => e.remove());

        if (step.required) {
            if (!val || (Array.isArray(val) && val.length === 0)) {
                showError("This selection is required.");
                return false;
            }
            if (step.type === 'location') {
                if (!val.address || val.address.trim().length < 5) {
                    showError("Please enter a valid address.");
                    return false;
                }
            }
            if (step.type === 'textarea' && step.minLength) {
                if (val.trim().length < step.minLength) {
                    showError(`Please provide more detail (min ${step.minLength} characters).`);
                    return false;
                }
            }
        }
        return true;
    }

    function showError(msg) {
        const div = document.createElement('div');
        div.className = 'error-msg text-red-500 text-xs mt-2 font-medium animate-shake';
        div.innerText = msg;
        content.appendChild(div);
    }

    function render() {
        const currentFlow = flows[state.flow];
        
        // Update Progress
        const totalSteps = (state.flow === 'main' ? 1 : flows[state.flow].steps.length + 1); // +1 for review
        const progress = ((state.history.length) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;

        // Clear content
        content.innerHTML = '';
        
        // Show/Hide Back Button
        if (state.history.length > 0) {
            backBtn.classList.remove('hidden');
        } else {
            backBtn.classList.add('hidden');
        }

        // Review Screen logic
        if (state.currentStep === currentFlow.steps.length && state.flow !== 'main') {
            renderReview();
            return;
        }

        const step = currentFlow.steps[state.currentStep];
        
        // Render Prompt
        const promptHeader = document.createElement('h3');
        promptHeader.className = 'text-xl font-bold text-gray-800 mb-6 leading-tight';
        promptHeader.innerText = step.prompt;
        content.appendChild(promptHeader);

        // Render Inputs
        const inputContainer = document.createElement('div');
        inputContainer.className = 'space-y-3';
        
        if (step.type === 'radio') {
            step.options.forEach(opt => {
                const label = document.createElement('label');
                label.className = `flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:bg-white ${state.answers[step.id] === opt.value ? 'border-brand-green bg-brand-light/20 shadow-sm' : 'border-gray-100 bg-white/50 hover:border-gray-200'}`;
                label.innerHTML = `
                    <input type="radio" name="${step.id}" value="${opt.value}" class="hidden" ${state.answers[step.id] === opt.value ? 'checked' : ''}>
                    <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl text-gray-400 group-hover:bg-white transition ${state.answers[step.id] === opt.value ? 'text-brand-green bg-white' : ''}">
                        <i class="uil ${opt.icon || 'uil-circle'}"></i>
                    </div>
                    <span class="font-bold text-gray-700">${opt.label}</span>
                `;
                label.onclick = () => {
                    state.answers[step.id] = opt.value;
                    render();
                };
                inputContainer.appendChild(label);
            });
        } 
        else if (step.type === 'checkbox') {
            const currentVals = state.answers[step.id] || [];
            step.options.forEach(opt => {
                const label = document.createElement('label');
                const isChecked = currentVals.includes(opt.value);
                label.className = `flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:bg-white ${isChecked ? 'border-brand-green bg-brand-light/20 shadow-sm' : 'border-gray-100 bg-white/50 hover:border-gray-200'}`;
                label.innerHTML = `
                    <input type="checkbox" name="${step.id}" value="${opt.value}" class="hidden" ${isChecked ? 'checked' : ''}>
                    <div class="w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${isChecked ? 'bg-brand-green border-brand-green text-white' : 'border-gray-200 bg-white'}">
                        ${isChecked ? '<i class="uil uil-check text-xs"></i>' : ''}
                    </div>
                    <span class="font-bold text-gray-700">${opt.label}</span>
                `;
                label.onclick = (e) => {
                    e.preventDefault();
                    if (!state.answers[step.id]) state.answers[step.id] = [];
                    const index = state.answers[step.id].indexOf(opt.value);
                    if (index > -1) state.answers[step.id].splice(index, 1);
                    else state.answers[step.id].push(opt.value);
                    render();
                };
                inputContainer.appendChild(label);
            });
        }
        else if (step.type === 'location') {
            const locationData = state.answers[step.id] || { address: '', landmark: '' };
            inputContainer.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Full Address (Required)</label>
                        <input type="text" id="loc-addr" value="${locationData.address}" placeholder="Street, Area, City" class="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-brand-green focus:outline-none bg-white transition shadow-sm font-medium">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nearest Landmark (Optional)</label>
                        <input type="text" id="loc-land" value="${locationData.landmark}" placeholder="e.g. Opposite the central park" class="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-brand-green focus:outline-none bg-white transition shadow-sm font-medium">
                    </div>
                </div>
            `;
            setTimeout(() => {
                const addr = document.getElementById('loc-addr');
                const land = document.getElementById('loc-land');
                addr.oninput = () => { state.answers[step.id] = { address: addr.value, landmark: land.value }; };
                land.oninput = () => { state.answers[step.id] = { address: addr.value, landmark: land.value }; };
            }, 0);
        }
        else if (step.type === 'textarea') {
            inputContainer.innerHTML = `
                <textarea id="val-textarea" rows="5" placeholder="${step.placeholder}" class="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-brand-green focus:outline-none bg-white transition shadow-sm font-medium leading-relaxed">${state.answers[step.id] || ''}</textarea>
                <div class="text-[10px] text-gray-400 mt-2 font-medium flex justify-between">
                    <span>Professional detail helps us prepare equipment.</span>
                    <span id="char-count">${(state.answers[step.id] || '').length} / 20</span>
                </div>
            `;
            setTimeout(() => {
                const ta = document.getElementById('val-textarea');
                const cc = document.getElementById('char-count');
                ta.oninput = () => { 
                    state.answers[step.id] = ta.value; 
                    cc.innerText = `${ta.value.length} / 20`;
                    cc.className = ta.value.length >= 20 ? 'text-brand-green' : 'text-gray-400';
                };
            }, 0);
        }

        content.appendChild(inputContainer);

        // Update Button Text
        nextBtn.innerHTML = (state.currentStep === currentFlow.steps.length - 1 && state.flow !== 'main') 
            ? 'Review Request <i class="uil uil-eye"></i>' 
            : 'Continue <i class="uil uil-arrow-right"></i>';
    }

    function renderReview() {
        const currentFlow = flows[state.flow];
        const header = document.createElement('div');
        header.className = 'mb-6';
        header.innerHTML = `
            <h3 class="text-xl font-bold text-gray-800 leading-tight">Review Request</h3>
            <p class="text-sm text-gray-500 mt-1">Please confirm the details below.</p>
        `;
        content.appendChild(header);

        const summaryBox = document.createElement('div');
        summaryBox.className = 'space-y-4';

        currentFlow.steps.forEach((step, index) => {
            const val = state.answers[step.id];
            let displayVal = val;
            
            if (step.type === 'location') displayVal = `${val.address} ${val.landmark ? `(Near ${val.landmark})` : ''}`;
            if (Array.isArray(val)) {
                displayVal = val.map(v => {
                    const opt = step.options.find(o => o.value === v);
                    return opt ? opt.label : v;
                }).join(', ');
            } else if (step.options) {
                const opt = step.options.find(o => o.value === val);
                if (opt) displayVal = opt.label;
            }

            const item = document.createElement('div');
            item.className = 'bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-brand-green/30 transition';
            item.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${step.prompt}</span>
                    <button class="text-brand-green opacity-0 group-hover:opacity-100 transition p-1 hover:bg-brand-light rounded-md" onclick="window.editStep(${index})">
                        <i class="uil uil-edit"></i>
                    </button>
                </div>
                <div class="text-sm font-bold text-gray-700 leading-snug">${displayVal}</div>
            `;
            summaryBox.appendChild(item);
        });

        content.appendChild(summaryBox);
        nextBtn.innerHTML = 'Submit Request <i class="uil uil-check"></i>';
        
        // Expose edit function
        window.editStep = (index) => {
            state.currentStep = index;
            render();
        };
    }

    function submitForm() {
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<i class="uil uil-spinner animate-spin"></i> Sending...';
        
        const submissionData = {
            serviceType: state.flow,
            timestamp: new Date().toISOString(),
            details: state.answers
        };

        console.log("Submitting Request:", submissionData);

        fetch('https://formsubmit.co/ajax/info@gisticservices.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `New GISTIC Service Request: ${state.flow.toUpperCase()}`,
                ...submissionData,
                _captcha: "false"
            })
        })
        .then(response => {
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center text-center h-full py-10">
                    <div class="w-20 h-20 bg-green-100 text-brand-green rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce-hover">
                        <i class="uil uil-check-circle"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h3>
                    <p class="text-gray-500 text-sm leading-relaxed mb-8">
                        Thank you for choosing GISTIC. A specialized <b>${state.flow}</b> project manager will contact you within working hours to provide a quote.
                    </p>
                    <button id="finish-intake" class="w-full border-2 border-brand-green text-brand-green font-bold py-3 rounded-xl hover:bg-brand-green hover:text-white transition">Return to Home</button>
                </div>
            `;
            document.getElementById('finish-intake').onclick = reset;
            nextBtn.classList.add('hidden');
            backBtn.classList.add('hidden');
            progressBar.style.width = '100%';
        })
        .catch(err => {
            console.error(err);
            nextBtn.disabled = false;
            nextBtn.innerHTML = 'Submit Request <i class="uil uil-check"></i>';
            alert("Submission failed. Please check your internet connection and try again.");
        });
    }
});
