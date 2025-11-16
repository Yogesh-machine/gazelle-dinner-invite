// State management
const state = {
    currentPage: 1,
    selectedUser: null, // { name: 'Lauri', id: 'lauri' }
    keyAttemptCount: 0,
    rsvpChoice: null, // 1 or 2
    rsvpDate: null,
    isSubmitting: false,
};

// Configuration
const MAIL_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = "7c39015d-ed3e-45db-b887-6c6361bea232"; // Your Web3Forms Key
const TARGET_EMAIL = "yog.sh.k.y@gmail.com";

const users = [
    { name: "Lauri", id: "lauri", key: "Hey honeyyy!!", error: "Skipped a few y's?" },
    { name: "Julia", id: "julia", key: "Fußball godddd", error: "Missing a few d's maybe?" },
    { name: "Leon", id: "leon", key: "Mr. Rogers, making America great again.", error: "ONE THING LEONNNNN!!!! YOU WERE SUPPOSE TO DO ONE THING RIGHT!", error_generic: "Arghhh, I give up Leon" },
    { name: "Friedrich", id: "friedrich", key: "Sure let's eat hottt.", error: "multiple ttt" },
    { name: "Paula", id: "paula", key: "Let's cook together?", error: "one more time Paula, Let's cook together?" },
    { name: "Thies", id: "thies", key: "Pretty boy dancing.", error: "Please try again after a pull up" },
];

const userImages = {
    lauri: 'images/lauri.png',
    julia: 'images/julia.png',
    leon: 'images/leon.png',
    friedrich: 'images/friedrich.png',
    paula: 'images/paula.png',
    thies: 'images/thies.png',
    group: 'images/group.png'
};


// Utility to fade content in/out
function setContent(html, callback) {
    const content = document.getElementById('page-content');
    content.style.opacity = '0';

    setTimeout(() => {
        content.innerHTML = html;
        content.style.opacity = '1';
        if (callback) callback();
    }, 300); // Duration matches CSS transition
}

// --- IMAGE FRAMING LOGIC ---
function updateBackgroundImage(key) {
    const frame = document.getElementById('background-frame');
    frame.innerHTML = ''; // Clear existing images

    // Create and position the new image element for the selected user (Top Left)
    const imgTopLeft = document.createElement('img');
    imgTopLeft.className = 'cartoon-image active';
    imgTopLeft.id = 'img-top-left';

    // Create and position the new image element for a complementary user (Bottom Right)
    const imgBottomRight = document.createElement('img');
    imgBottomRight.className = 'cartoon-image active';
    imgBottomRight.id = 'img-bottom-right';

    // --- Special Case: Group/Success Image ---
    if (key === 'group') {
        const imgSuccess = document.createElement('img');
        imgSuccess.className = 'cartoon-image active';
        imgSuccess.id = 'img-success';
        imgSuccess.src = userImages.group;
        frame.appendChild(imgSuccess);
        return;
    }
    
    // --- Individual User Pages (Page 1, 2, 3) ---
    
    // Top Left: The currently selected user
    imgTopLeft.src = userImages[key] || userImages.group; 
    frame.appendChild(imgTopLeft);

    // Bottom Right: Use the group image as a subtle background complement
    imgBottomRight.src = userImages.group; 
    imgBottomRight.style.opacity = '0.3'; // Make the group image subtle
    imgBottomRight.style.width = '300px'; 
    frame.appendChild(imgBottomRight);
}

// --- PAGE RENDERING FUNCTIONS ---

function renderPage1() {
    state.currentPage = 1;
    const userOptions = users.map(user => `
        <label class="option-box ${state.selectedUser && state.selectedUser.id === user.id ? 'bg-green-100 border-primary' : ''}">
            <input type="radio" name="flatmate" value="${user.id}" onchange="selectUser('${user.id}', '${user.name}')" ${state.selectedUser && state.selectedUser.id === user.id ? 'checked' : ''}>
            <div class="option-content">
                <span class="text-lg font-semibold text-gray-800">${user.name}</span>
                <span class="checkmark"></span>
            </div>
        </label>
    `).join('');

    const html = `
        <h1 class="text-4xl font-black text-center text-primary mb-4">Liebe Gazelle</h1>
        <h2 class="text-2xl font-bold text-center text-gray-700 mb-8">Who are you?</h2>
        <form id="user-select-form">
            ${userOptions}
            <button type="button" onclick="goNext()" id="next-btn-bottom" class="w-full py-3 mt-4 text-white font-bold rounded-xl bg-button-primary transition duration-200 shadow-lg" ${!state.selectedUser ? 'disabled' : ''}>
                Next
            </button>
        </form>
    `;
    setContent(html, () => {
        document.getElementById('back-btn').classList.add('hidden');
        document.getElementById('next-btn-top').classList.add('hidden');
        updateBackgroundImage('group'); // Show group on landing
    });
}

function selectUser(id, name) {
    state.selectedUser = { id, name };
    document.getElementById('next-btn-bottom').disabled = false;
    // Update selected appearance immediately
    document.querySelectorAll('.option-box').forEach(box => {
        box.classList.remove('bg-green-100', 'border-primary');
    });
    document.querySelector(`input[value="${id}"]`).closest('.option-box').classList.add('bg-green-100', 'border-primary');
}

function renderPage2() {
    if (!state.selectedUser) return renderPage1();

    state.currentPage = 2;
    state.keyAttemptCount = 0; // Reset attempts for new page load
    const userId = state.selectedUser.id;
    const html = `
        <h1 class="text-4xl font-black text-center text-primary mb-4">${state.selectedUser.name}?</h1>
        <h2 class="text-2xl font-bold text-center text-gray-700 mb-8">realllyyyyyyyyy??????????????</h2>
        
        <input type="text" id="secret-key-input" placeholder="Enter secret key..." class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition duration-200" autocomplete="off">
        
        <p id="key-error-message" class="text-center text-error mt-3 h-6"></p>

        <button type="button" onclick="checkSecretKey()" class="w-full py-3 mt-6 text-white font-bold rounded-xl bg-button-primary transition duration-200 shadow-lg">
            Next
        </button>
    `;
    setContent(html, () => {
        document.getElementById('back-btn').classList.remove('hidden');
        document.getElementById('next-btn-top').classList.add('hidden');
        updateBackgroundImage(userId); // Show selected user on this page
        
        // Add icon feedback (optional, for advanced look)
        const input = document.getElementById('secret-key-input');
        const errorMessage = document.getElementById('key-error-message');
        input.addEventListener('input', () => {
            errorMessage.textContent = '';
            input.classList.remove('border-error');
            input.classList.add('border-primary');
        });
    });
}

function checkSecretKey() {
    const input = document.getElementById('secret-key-input');
    const errorMessage = document.getElementById('key-error-message');
    const enteredKey = input.value.trim();
    const correctKey = users.find(u => u.id === state.selectedUser.id).key;

    if (enteredKey === correctKey) {
        goNext(); // Key is correct, move to page 3
        return;
    }

    // Key is incorrect
    state.keyAttemptCount++;
    
    const userConfig = users.find(u => u.id === state.selectedUser.id);
    
    let errorText;

    if (state.keyAttemptCount === 1) {
        // First attempt error (specific hint)
        errorText = userConfig.error;
    } else {
        // Subsequent attempts error (generic/funny message)
        if (state.selectedUser.id === 'leon') {
            errorText = userConfig.error_generic; // "Arghhh, I give up Leon"
        } else {
            errorText = "leon, is it you, peaking into other people's business?";
        }
    }

    errorMessage.textContent = errorText;
    input.classList.add('border-error');
    input.classList.remove('border-primary');
    input.value = ''; // Clear input
}

function renderPage3() {
    if (!state.selectedUser) return renderPage1();
    
    state.currentPage = 3;
    
    const html = `
        <div class="text-center">
            <h2 class="text-3xl sm:text-4xl font-black text-center text-primary mb-8 leading-tight">
                ARE YOU FREE THIS SATURDAY FOR A DINNER AT MY NEW PLACEEEEEE??????
            </h2>
        </div>

        <form id="rsvp-form">
            <!-- Option 1: YEAHHHHH! LET'SSSS PARTYYYYYYY -->
            <label class="option-box flex-col items-start ${state.rsvpChoice === 1 ? 'bg-green-100 border-primary' : ''}">
                <input type="radio" name="rsvp-choice" value="1" onchange="handleRsvpChange(1)" ${state.rsvpChoice === 1 ? 'checked' : ''}>
                <div class="option-content">
                    <span class="text-2xl font-extrabold text-gray-800">YEAHHHHH! LET'SSSS PARTYYYYYYY</span>
                    <span class="checkmark"></span>
                </div>
            </label>

            <!-- Option 2: Unfortunately not... (with date input) -->
            <label class="option-box flex-col items-start ${state.rsvpChoice === 2 ? 'bg-green-100 border-primary' : ''}">
                <input type="radio" name="rsvp-choice" value="2" onchange="handleRsvpChange(2)" ${state.rsvpChoice === 2 ? 'checked' : ''}>
                <div class="option-content mb-2">
                    <span class="text-lg font-semibold text-gray-800">unfortunately not this saturday, but next one for sureeeeee</span>
                    <span class="checkmark"></span>
                </div>
                
                <div id="date-input-container" class="date-input-container ${state.rsvpChoice === 2 ? 'active' : ''} w-full">
                    <label class="text-sm font-medium text-gray-500 block mb-1">Pick an alternative date:</label>
                    <input type="date" id="alt-date-input" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" value="${state.rsvpDate || ''}" onchange="state.rsvpDate = this.value">
                </div>
            </label>

            <button type="button" onclick="handleSubmitRsvp()" id="submit-rsvp-btn" class="w-full py-3 mt-6 text-white font-bold rounded-xl bg-button-primary transition duration-200 shadow-lg" ${!state.rsvpChoice ? 'disabled' : ''}>
                see you soon
            </button>
        </form>
    `;
    setContent(html, () => {
        document.getElementById('back-btn').classList.remove('hidden');
        document.getElementById('next-btn-top').classList.add('hidden');
        updateBackgroundImage(state.selectedUser.id);
        
        // Ensure date container is initialized correctly on render
        if (state.rsvpChoice === 2) {
            document.getElementById('date-input-container').classList.add('active');
        }
    });
}

function handleRsvpChange(choice) {
    state.rsvpChoice = choice;
    document.getElementById('submit-rsvp-btn').disabled = false;
    
    const dateContainer = document.getElementById('date-input-container');
    if (choice === 2) {
        dateContainer.classList.add('active');
    } else {
        dateContainer.classList.remove('active');
        state.rsvpDate = null; // Clear date if they switch back to 'Yes'
        const dateInput = document.getElementById('alt-date-input');
        if (dateInput) dateInput.value = '';
    }
    
    // Re-apply checked styles
    document.querySelectorAll('.option-box').forEach(box => box.classList.remove('bg-green-100', 'border-primary'));
    document.querySelector(`input[value="${choice}"]`).closest('.option-box').classList.add('bg-green-100', 'border-primary');
}

// --- SUBMISSION LOGIC ---

async function handleSubmitRsvp() {
    if (state.isSubmitting) return;

    const submitBtn = document.getElementById('submit-rsvp-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loader"></div>';
    state.isSubmitting = true;

    // Ensure we have a date if option 2 is chosen
    if (state.rsvpChoice === 2 && !state.rsvpDate) {
        // Use custom message box instead of alert()
        console.error("Please select an alternative date.");
        // Revert button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'see you soon';
        state.isSubmitting = false;
        return;
    }

    // 1. Determine RSVP text status
    const rsvpMessage = state.rsvpChoice === 1 ?
        'YEAHHHHH! LET\'S PARTYYYYYYY' :
        `Unfortunately not this Saturday, but ${state.rsvpDate || '[No Date Selected]'} will work.`;

    // 2. Prepare Form Data for Email Service (Web3Forms)
    const formData = new FormData();
    formData.append('access_key', ACCESS_KEY); // Mandatory Web3Forms Key
    formData.append('subject', `RSVP - The Gazelle: ${state.selectedUser.name}`);
    formData.append('to', TARGET_EMAIL); // Target host email
    
    // Custom data fields
    formData.append('Name', state.selectedUser.name);
    formData.append('RSVP_Status_Message', rsvpMessage);
    formData.append('RSVP_Code', state.rsvpChoice); // Store the 1 or 2 as requested

    
    // 3. Email Submission
    try {
        const response = await fetch(MAIL_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log("Web3Forms submission successful.");
        } else {
            console.warn("Web3Forms submission failed. Check console for details.");
        }

    } catch (error) {
        console.error("Network or submission error:", error);
    } finally {
        // Regardless of fetch success, launch fireworks and show success message to the guest
        state.isSubmitting = false;
        startFireworks(); 
        
        // Hide the card for a moment to set up the group image
        document.getElementById('app-container').classList.add('hidden'); 
        
        // Final success view
        const successHtml = `
            <div class="text-center pt-10">
                <p class="text-4xl sm:text-5xl text-primary font-black animate-pulse">IT'S A PARTY!</p>
                <p class="text-xl mt-4 text-gray-700">See you soon, ${state.selectedUser.name}!</p>
            </div>
        `;
        setContent(successHtml, () => {
            document.getElementById('back-btn').classList.add('hidden');
            document.getElementById('next-btn-top').classList.add('hidden');
            updateBackgroundImage('group'); // Show group image in the middle
        });
        document.getElementById('app-container').classList.remove('hidden'); // Show card again (with new content)
    }
}

// --- NAVIGATION LOGIC ---

function goNext() {
    if (state.currentPage === 1 && !state.selectedUser) {
        console.warn("Please select who you are first!");
        return;
    }
    if (state.currentPage < 3) {
        state.currentPage++;
        renderPage(state.currentPage);
    }
}

function goBack() {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderPage(state.currentPage);
    }
}

function renderPage(page) {
    switch(page) {
        case 1: renderPage1(); break;
        case 2: renderPage2(); break;
        case 3: renderPage3(); break;
    }
}

// --- FIREWORKS LOGIC (Canvas) ---
// (A fully implemented fireworks system that is purely visual and uses physics simulation)

const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let fireworks = [];
const TONE_COLORS = [
    '#ff9933', // Cheerful Orange
    '#5cb85c', // Cheerful Green
    '#ff66b3', // Pink
    '#66b3ff'  // Light Blue
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function startFireworks() {
    document.getElementById('fireworks-canvas').classList.add('active');
    let timer = 0;
    const duration = 5000; // Run for 5 seconds
    
    function loop(timestamp) {
        if (timer === 0) timer = timestamp;
        const elapsed = timestamp - timer;
        
        // Create a new firework occasionally
        if (Math.random() < 0.05) {
            createFirework();
        }
        
        update();
        draw();
        
        if (elapsed < duration) {
            requestAnimationFrame(loop);
        } else {
            document.getElementById('fireworks-canvas').classList.remove('active');
        }
    }
    requestAnimationFrame(loop);
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    const color = TONE_COLORS[Math.floor(Math.random() * TONE_COLORS.length)];
    
    fireworks.push({
        x: x,
        y: y,
        targetY: Math.random() * (canvas.height * 0.5) + (canvas.height * 0.1),
        speed: 10 + Math.random() * 5,
        color: color,
        exploded: false,
        trail: [],
        size: 3
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            gravity: 0.2,
            friction: 0.95,
            color: color,
            alpha: 1,
            decay: Math.random() * 0.01 + 0.01,
            size: Math.random() * 3 + 1
        });
    }
}

function update() {
    // Update fireworks
    fireworks = fireworks.filter(f => {
        if (!f.exploded) {
            f.y -= f.speed;
            f.trail.push({x: f.x, y: f.y});
            if (f.trail.length > 5) f.trail.shift();

            if (f.y <= f.targetY) {
                f.exploded = true;
                createParticles(f.x, f.y, f.color);
            }
            return true;
        }
        return false;
    });

    // Update particles
    particles = particles.filter(p => {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        return p.alpha > p.decay;
    });
}

function draw() {
    // Semi-transparent background for trails
    ctx.fillStyle = 'rgba(247, 249, 252, 0.2)'; // Use body background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fireworks
    fireworks.forEach(f => {
        // Draw main firework
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw trail
        f.trail.forEach((t, i) => {
            ctx.fillStyle = `rgba(${parseInt(f.color.slice(1, 3), 16)}, ${parseInt(f.color.slice(3, 5), 16)}, ${parseInt(f.color.slice(5, 7), 16)}, ${i / 5 * 0.5})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, f.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = `rgba(${parseInt(p.color.slice(1, 3), 16)}, ${parseInt(p.color.slice(3, 5), 16)}, ${parseInt(p.color.slice(5, 7), 16)}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// --- INITIALIZATION ---

// Start the application on page 1
window.onload = function() {
    renderPage1();
}