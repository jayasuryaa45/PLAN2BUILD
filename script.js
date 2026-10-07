// ==========================================================
// Plan2Build - Main JavaScript Functions & Validation
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    updateNavigation();
    setupAuthProtection();
    setupSignupValidation();
    setupLoginValidation();
    setupContactValidation();
    setupPlanner();
    setupMaterialEstimator();
    setupCostEstimator();
    setupRemodelingEstimator();
    loadDashboardData();
});

// --- Dynamic Navigation based on Login Status ---
function updateNavigation() {
    const loggedUser = localStorage.getItem("plan2build_user");
    const navLinksContainer = document.getElementById("nav-links");
    if (!navLinksContainer) return;

    if (loggedUser) {
        const userObj = JSON.parse(loggedUser);
        navLinksContainer.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="planner.html">House Planner</a></li>
            <li><a href="materials.html">Materials</a></li>
            <li><a href="cost.html">Cost Estimator</a></li>
            <li><a href="remodeling.html">Remodeling</a></li>
            <li><a href="guide.html">Guide</a></li>
            <li><a href="dashboard.html">Dashboard</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="#" onclick="logoutUser(); return false;" class="btn-nav">Logout (${userObj.name})</a></li>
        `;
    } else {
        navLinksContainer.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="login.html">Login</a></li>
            <li><a href="signup.html" class="btn-nav">Sign Up</a></li>
        `;
    }
}

// --- Check if user is logged in before allowing feature access ---
function setupAuthProtection() {
    const startPlanningBtn = document.getElementById("startPlanningBtn");
    const calcCostBtnHero = document.getElementById("calcCostBtnHero");

    const isLogged = localStorage.getItem("plan2build_user");

    if (startPlanningBtn) {
        startPlanningBtn.addEventListener("click", (e) => {
            if (!isLogged) {
                e.preventDefault();
                localStorage.setItem("plan2build_redirect", "planner.html");
                window.location.href = "login.html";
            }
        });
    }

    if (calcCostBtnHero) {
        calcCostBtnHero.addEventListener("click", (e) => {
            if (!isLogged) {
                e.preventDefault();
                localStorage.setItem("plan2build_redirect", "cost.html");
                window.location.href = "login.html";
            }
        });
    }

    // Protect restricted pages if a user tries to access them directly via URL while logged out
    const protectedPages = ["planner.html", "materials.html", "cost.html", "remodeling.html", "dashboard.html"];
    const currentPage = window.location.pathname.split("/").pop();
    
    if (protectedPages.includes(currentPage) && !isLogged) {
        localStorage.setItem("plan2build_redirect", currentPage);
        window.location.href = "login.html";
    }
}

// --- UPDATED LOGOUT: Redirects directly to Home Page (index.html) ---
function logoutUser() {
    localStorage.removeItem("plan2build_logged_in");
    localStorage.removeItem("plan2build_user");
    localStorage.removeItem("plan2build_redirect");
    window.location.replace("index.html");
}

// --- Contact Form Submission Handler ---
function setupContactValidation() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        if (name && email && subject && message) {
            const successMsg = document.getElementById("contactSuccessMsg");
            if (successMsg) successMsg.textContent = "Thank you! Your message has been sent successfully. We will get back to you soon.";
            contactForm.reset();
        }
    });
}

// --- 1. Signup Form Validation ---
function setupSignupValidation() {
    const signupForm = document.getElementById("signupForm");
    if (!signupForm) return;

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("signupEmail");
    const mobileInput = document.getElementById("mobile");
    const passwordInput = document.getElementById("signupPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const togglePassBtn = document.getElementById("togglePass");

    if (togglePassBtn) {
        togglePassBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                confirmPasswordInput.type = "text";
                togglePassBtn.textContent = "Hide";
            } else {
                passwordInput.type = "password";
                confirmPasswordInput.type = "password";
                togglePassBtn.textContent = "Show";
            }
        });
    }

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;

        if (!fullNameInput.value.trim()) {
            showError(fullNameInput, "Please enter your full name.");
            isValid = false;
        } else {
            showSuccess(fullNameInput);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, "Please enter a valid email address.");
            isValid = false;
        } else {
            showSuccess(emailInput);
        }

        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobileInput.value.trim())) {
            showError(mobileInput, "Mobile number must contain exactly 10 digits.");
            isValid = false;
        } else {
            showSuccess(mobileInput);
        }

        const passVal = passwordInput.value;
        if (passVal.length < 6 || !passVal.includes("@")) {
            showError(passwordInput, "Password must contain at least 6 characters and one @ symbol.");
            isValid = false;
        } else {
            showSuccess(passwordInput);
        }

        if (confirmPasswordInput.value !== passVal || !confirmPasswordInput.value) {
            showError(confirmPasswordInput, "Passwords do not match.");
            isValid = false;
        } else {
            showSuccess(confirmPasswordInput);
        }

        if (isValid) {
            const userData = {
                name: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                mobile: mobileInput.value.trim(),
                password: passVal
            };
            localStorage.setItem("plan2build_registered_user", JSON.stringify(userData));
            
            // Save login status and redirect straight to house planning
            localStorage.setItem("plan2build_logged_in", "true");
            localStorage.setItem("plan2build_user", JSON.stringify(userData));
            
            window.location.replace("planner.html");
        }
    });
}

// --- 2. Login Form Validation ---
function setupLoginValidation() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, "Please enter a valid email address.");
            isValid = false;
        } else {
            showSuccess(emailInput);
        }

        if (passwordInput.value.length < 6 || !passwordInput.value.includes("@")) {
            showError(passwordInput, "Password must have at least 6 characters and contain '@'.");
            isValid = false;
        } else {
            showSuccess(passwordInput);
        }

        if (isValid) {
            const registered = JSON.parse(localStorage.getItem("plan2build_registered_user"));
            let userObj = null;

            if (registered && registered.email === emailInput.value.trim() && registered.password === passwordInput.value) {
                userObj = registered;
            } else {
                userObj = { name: "Demo User", email: emailInput.value.trim() };
            }

            localStorage.setItem("plan2build_logged_in", "true");
            localStorage.setItem("plan2build_user", JSON.stringify(userObj));
            
            // Redirect straight to planner.html on successful login
            localStorage.removeItem("plan2build_redirect");
            window.location.replace("planner.html");
        }
    });
}

function showError(inputElement, message) {
    const formGroup = inputElement.parentElement;
    let errorDiv = formGroup.querySelector(".error-msg");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "error-msg";
        formGroup.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    inputElement.style.borderColor = "var(--error)";
}

function showSuccess(inputElement) {
    const formGroup = inputElement.parentElement;
    const errorDiv = formGroup.querySelector(".error-msg");
    if (errorDiv) errorDiv.style.display = "none";
    inputElement.style.borderColor = "var(--success)";
}
// --- 3. House Planner & Floor Plan Logic ---
function setupPlanner() {
    const plotLength = document.getElementById("plotLength");
    const plotWidth = document.getElementById("plotWidth");
    const plotAreaDisplay = document.getElementById("plotAreaDisplay");
    const bedCountSelect = document.getElementById("bedCount");
    const bedroomContainer = document.getElementById("bedroomCustomizationsContainer");
    const generatePlanBtn = document.getElementById("generatePlanBtn");
    const blueprintContainer = document.getElementById("blueprintContainer");

    if (!plotLength || !generatePlanBtn) return;

    function computePlotArea() {
        const l = parseFloat(plotLength.value) || 0;
        const w = parseFloat(plotWidth.value) || 0;
        const area = l * w;
        if (plotAreaDisplay) plotAreaDisplay.textContent = area;
        return area;
    }

    // Render bedroom customization fields dynamically based on selected BHK count
    function renderBedroomCustomizations() {
        if (!bedroomContainer) return;
        const count = parseInt(bedCountSelect.value) || 2;
        let html = "";

        for (let i = 1; i <= count; i++) {
            let title = (i === 1) ? "Master Bedroom" : `Bedroom ${i}`;
            html += `
                <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #cbd5e1;">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b;">${title}</h4>
                    <div class="form-group" style="margin-bottom: 8px;">
                        <label>Attached Washroom / Bath:</label>
                        <select id="b${i}Bath"><option value="yes">Yes</option><option value="no">No</option></select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Balcony:</label>
                        <select id="b${i}Balcony"><option value="yes">Yes</option><option value="no" selected>No</option></select>
                    </div>
                </div>
            `;
        }
        bedroomContainer.innerHTML = html;
    }

    renderBedroomCustomizations();
    if (bedCountSelect) {
        bedCountSelect.addEventListener("change", () => {
            renderBedroomCustomizations();
            if (blueprintContainer) blueprintContainer.style.display = "none";
        });
    }

    plotLength.addEventListener("input", () => {
        computePlotArea();
        if (blueprintContainer) blueprintContainer.style.display = "none";
    });
    plotWidth.addEventListener("input", () => {
        computePlotArea();
        if (blueprintContainer) blueprintContainer.style.display = "none";
    });

    generatePlanBtn.addEventListener("click", () => {
        const area = computePlotArea();
        if (area <= 0) return;

        const bedCount = parseInt(bedCountSelect.value) || 2;
        const kitchenType = document.getElementById("kitchenType").value;
        const commonBath = document.getElementById("commonBath").value;
        const parking = document.getElementById("parking").value;

        let floorPlanVisual = "";

        // --- EXACT BLUEPRINT SCHEMATIC GRIDS MATCHING YOUR REFERENCE ---
        if (bedCount === 2) {
            floorPlanVisual = `
                <div style="background: #0f172a; color: #38bdf8; padding: 1.5rem; border-radius: 8px; font-family: monospace; position: relative; margin-bottom: 1.5rem; border: 2px solid #334155;">
                    <div style="position: absolute; top: 10px; right: 15px; font-size: 0.75rem; color: #94a3b8;">PLOT: ${plotLength.value}ft x ${plotWidth.value}ft (${area} sq.ft)</div>
                    <div style="font-weight: bold; margin-bottom: 1rem; color: #f8fafc; font-size: 1.1rem; border-bottom: 1px dashed #334155; padding-bottom: 5px; text-align: center;">ARCHITECTURAL BLUEPRINT SCHEMATIC (2 BHK)</div>
                    
                    <!-- Top Row: W.I.C / M.Bath & Bed 2 -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div style="border: 1px solid #38bdf8; padding: 10px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>MASTER SUITE BATH & W.I.C.</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Attached Bath: ${document.getElementById('b1Bath').value}</span>
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 10px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>BEDROOM 2 (10'8" x 11'1")</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Attached Bath: ${document.getElementById('b2Bath').value}</span>
                        </div>
                    </div>

                    <!-- Middle Row: Master Bedroom, Hallway & Common Bath -->
                    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr 1fr; gap: 10px; margin-bottom: 10px; align-items: center;">
                        <div style="border: 1px solid #38bdf8; padding: 12px; background: rgba(56, 189, 248, 0.08); border-radius: 4px; text-align: center;">
                            <strong>MASTER BEDROOM</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">(12'3" x 11'3") | Balcony: ${document.getElementById('b1Balcony').value}</span>
                        </div>
                        <div style="border: 1px dashed #64748b; padding: 10px; text-align: center; font-size: 0.75rem; color: #94a3b8; border-radius: 4px;">
                            39" HALLWAY & W/D
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 12px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>COMMON BATH</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">(7'9" x 4'11") | Status: ${commonBath}</span>
                        </div>
                    </div>

                    <!-- Lower Row: Kitchen & Living Room -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div style="border: 1px solid #34d399; color: #34d399; padding: 12px; background: rgba(52, 211, 153, 0.05); border-radius: 4px; text-align: center;">
                            <strong>KITCHEN (13'6" x 14'0")</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Type: ${kitchenType}</span>
                        </div>
                        <div style="border: 1px solid #34d399; color: #34d399; padding: 12px; background: rgba(52, 211, 153, 0.05); border-radius: 4px; text-align: center;">
                            <strong>LIVING ROOM (13'6" x 14'0")</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Parking: ${parking}</span>
                        </div>
                    </div>

                    <!-- Bottom Deck -->
                    <div style="border: 1px solid #fbbf24; color: #fbbf24; padding: 10px; background: rgba(251, 191, 36, 0.05); border-radius: 4px; text-align: center; font-size: 0.85rem;">
                        <strong>OPEN DECK / PORCH (22'0" x 8'0")</strong>
                    </div>
                </div>
            `;
        } else if (bedCount === 3) {
            floorPlanVisual = `
                <div style="background: #0f172a; color: #38bdf8; padding: 1.5rem; border-radius: 8px; font-family: monospace; position: relative; margin-bottom: 1.5rem; border: 2px solid #334155;">
                    <div style="position: absolute; top: 10px; right: 15px; font-size: 0.75rem; color: #94a3b8;">PLOT: ${plotLength.value}ft x ${plotWidth.value}ft (${area} sq.ft)</div>
                    <div style="font-weight: bold; margin-bottom: 1rem; color: #f8fafc; font-size: 1.1rem; border-bottom: 1px dashed #334155; padding-bottom: 5px; text-align: center;">ARCHITECTURAL BLUEPRINT SCHEMATIC (3 BHK)</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>MASTER SUITE W.I.C</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">Bath: ${document.getElementById('b1Bath').value}</span>
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>BEDROOM 2</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">Bath: ${document.getElementById('b2Bath').value}</span>
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>BEDROOM 3</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">Bath: ${document.getElementById('b3Bath') ? document.getElementById('b3Bath').value : 'no'}</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div style="border: 1px solid #38bdf8; padding: 10px; background: rgba(56, 189, 248, 0.08); border-radius: 4px; text-align: center;">
                            <strong>MASTER BEDROOM</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Balcony: ${document.getElementById('b1Balcony').value}</span>
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 10px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>CENTRAL CORRIDOR BATH</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Common Bath: ${commonBath}</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div style="border: 1px solid #34d399; color: #34d399; padding: 10px; background: rgba(52, 211, 153, 0.05); border-radius: 4px; text-align: center;">
                            <strong>KITCHEN & DINING</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Type: ${kitchenType}</span>
                        </div>
                        <div style="border: 1px solid #34d399; color: #34d399; padding: 10px; background: rgba(52, 211, 153, 0.05); border-radius: 4px; text-align: center;">
                            <strong>EXPANDED LIVING ROOM</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Parking: ${parking}</span>
                        </div>
                    </div>

                    <div style="border: 1px solid #fbbf24; color: #fbbf24; padding: 8px; background: rgba(251, 191, 36, 0.05); border-radius: 4px; text-align: center; font-size: 0.85rem;">
                        <strong>OPEN DECK & PORCH</strong>
                    </div>
                </div>
            `;
        } else {
            // 4 BHK Grand Luxury Layout
            floorPlanVisual = `
                <div style="background: #0f172a; color: #38bdf8; padding: 1.5rem; border-radius: 8px; font-family: monospace; position: relative; margin-bottom: 1.5rem; border: 2px solid #334155;">
                    <div style="position: absolute; top: 10px; right: 15px; font-size: 0.75rem; color: #94a3b8;">PLOT: ${plotLength.value}ft x ${plotWidth.value}ft (${area} sq.ft)</div>
                    <div style="font-weight: bold; margin-bottom: 1rem; color: #f8fafc; font-size: 1.1rem; border-bottom: 1px dashed #334155; padding-bottom: 5px; text-align: center;">ARCHITECTURAL BLUEPRINT SCHEMATIC (4 BHK LUXURY)</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>MASTER SUITE 1 W.I.C</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">Bath: ${document.getElementById('b1Bath').value}</span>
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>BEDROOM 2 & 3 SUITE</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">B2 Bath: ${document.getElementById('b2Bath').value} | B3 Bath: ${document.getElementById('b3Bath') ? document.getElementById('b3Bath').value : 'no'}</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.08); border-radius: 4px; text-align: center;">
                            <strong>MASTER BEDROOM</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">Balcony: ${document.getElementById('b1Balcony').value}</span>
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>BEDROOM 4</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">Bath: ${document.getElementById('b4Bath') ? document.getElementById('b4Bath').value : 'no'}</span>
                        </div>
                        <div style="border: 1px solid #38bdf8; padding: 8px; background: rgba(56, 189, 248, 0.05); border-radius: 4px; text-align: center;">
                            <strong>COMMON BATH</strong><br><span style="font-size: 0.7rem; color: #cbd5e1;">Status: ${commonBath}</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div style="border: 1px solid #34d399; color: #34d399; padding: 10px; background: rgba(52, 211, 153, 0.05); border-radius: 4px; text-align: center;">
                            <strong>GRAND KITCHEN</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Type: ${kitchenType}</span>
                        </div>
                        <div style="border: 1px solid #34d399; color: #34d399; padding: 10px; background: rgba(52, 211, 153, 0.05); border-radius: 4px; text-align: center;">
                            <strong>GRAND LIVING HALL</strong><br><span style="font-size: 0.75rem; color: #cbd5e1;">Parking: ${parking}</span>
                        </div>
                    </div>

                    <div style="border: 1px solid #fbbf24; color: #fbbf24; padding: 8px; background: rgba(251, 191, 36, 0.05); border-radius: 4px; text-align: center; font-size: 0.85rem;">
                        <strong>GRAND OPEN DECK & PORCH</strong>
                    </div>
                </div>
            `;
        }

        let htmlContent = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem;">
                <h3 style="color: #0f1115; margin: 0;">📐 Generated Floor Plan Preview (${bedCount} BHK)</h3>
                <span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">Status: Ready</span>
            </div>

            ${floorPlanVisual}

            <!-- Right-aligned compact next button inside blueprint box -->
            <div style="text-align: right;">
                <a href="materials.html" class="btn-primary" style="display: inline-flex !important; width: auto !important; align-items: center; gap: 8px; text-decoration: none; padding: 0.75rem 1.5rem;">
                    Next: Calculate Required Materials ➔
                </a>
            </div>
        `;
        
        blueprintContainer.innerHTML = htmlContent;
        blueprintContainer.style.display = "block";
    });
}
// --- 4. Material Estimator Logic ---
function setupMaterialEstimator() {
    const calcBtn = document.getElementById("calcMaterialsBtn");
    const resultsBox = document.getElementById("materialResults");
    const areaInput = document.getElementById("builtUpArea");

    if (!calcBtn || !resultsBox) return;

    // Hide results & next button if user changes input
    areaInput.addEventListener("input", () => {
        resultsBox.style.display = "none";
    });

    calcBtn.addEventListener("click", () => {
        const area = parseFloat(areaInput.value);
        if (!area || area <= 0) return;

        const cement = Math.round(area * 0.4);
        const sand = Math.round(area * 1.5);
        const bricks = Math.round(area * 12);
        const steel = Math.round(area * 4);
        const aggregate = Math.round(area * 0.9);
        const tiles = Math.round(area * 1.1);
        const paint = Math.round(area * 0.15);

        document.getElementById("resCement").textContent = cement + " Bags";
        document.getElementById("resSand").textContent = sand + " cu.ft";
        document.getElementById("resBricks").textContent = bricks.toLocaleString();
        document.getElementById("resSteel").textContent = steel.toLocaleString() + " kg";
        document.getElementById("resAggregate").textContent = aggregate + " cu.ft";
        document.getElementById("resTiles").textContent = tiles + " sq.ft";
        document.getElementById("resPaint").textContent = paint + " Litres";

        // Make results grid visible and inject Next button container if not already there
        resultsBox.style.display = "grid";
        
        let nextContainer = document.getElementById("matNextContainer");
        if (!nextContainer) {
            nextContainer = document.createElement("div");
            nextContainer.id = "matNextContainer";
            nextContainer.style.cssText = "grid-column: 1 / -1; text-align: right; margin-top: 1rem;";
            nextContainer.innerHTML = `<a href="cost.html" class="btn-primary" style="text-decoration:none;">Next: Calculate Construction Cost ➔</a>`;
            resultsBox.appendChild(nextContainer);
        }
    });
}

// --- 5. Cost Estimator Logic ---
function setupCostEstimator() {
    const calcCostBtn = document.getElementById("calcCostBtn");
    const costResultsBox = document.getElementById("costResultsBox");
    const costArea = document.getElementById("costArea");

    if (!calcCostBtn || !costResultsBox) return;

    costArea.addEventListener("input", () => {
        costResultsBox.style.display = "none";
    });

    calcCostBtn.addEventListener("click", () => {
        const area = parseFloat(costArea.value);
        const matRate = parseFloat(document.getElementById("matRate").value);
        const labRate = parseFloat(document.getElementById("labRate").value);
        const otherExp = parseFloat(document.getElementById("otherExp").value) || 0;

        if (!area || area <= 0 || !matRate || !labRate) return;

        const matCost = area * matRate;
        const labCost = area * labRate;
        const totalCost = matCost + labCost + otherExp;

        document.getElementById("displayMatCost").textContent = "₹ " + matCost.toLocaleString();
        document.getElementById("displayLabCost").textContent = "₹ " + labCost.toLocaleString();
        document.getElementById("displayOtherExp").textContent = "₹ " + otherExp.toLocaleString();
        document.getElementById("displayTotalCost").textContent = "₹ " + totalCost.toLocaleString();

        costResultsBox.style.display = "block";

        let costNext = document.getElementById("costNextContainer");
        if (!costNext) {
            costNext = document.createElement("div");
            costNext.id = "costNextContainer";
            costNext.style.cssText = "text-align: right; margin-top: 1.5rem;";
            costNext.innerHTML = `<a href="remodeling.html" class="btn-primary" style="text-decoration:none;">Next: Explore Remodeling Options ➔</a>`;
            costResultsBox.appendChild(costNext);
        }
    });
}
// --- 6. Remodeling Estimator Logic ---
function setupRemodelingEstimator() {
    const calcRemodelBtn = document.getElementById("calcRemodelBtn");
    if (!calcRemodelBtn) return;

    calcRemodelBtn.addEventListener("click", () => {
        const area = parseFloat(document.getElementById("remodelArea").value) || 500;
        const checkboxes = document.querySelectorAll("input[name='remodelOption']:checked");

        if (checkboxes.length === 0) return;

        let totalRemodelCost = 0;
        let selectedListHtml = "";

        checkboxes.forEach(cb => {
            const costPerSqFt = parseFloat(cb.getAttribute("data-rate"));
            const itemCost = area * costPerSqFt;
            totalRemodelCost += itemCost;
            selectedListHtml += `<li>${cb.value} (${area} sq.ft) - ₹ ${itemCost.toLocaleString()}</li>`;
        });

        document.getElementById("remodelList").innerHTML = selectedListHtml;
        document.getElementById("displayRemodelTotal").textContent = "₹ " + totalRemodelCost.toLocaleString();
        document.getElementById("remodelResultBox").style.display = "block";

        localStorage.setItem("plan2build_remodel", JSON.stringify({ cost: totalRemodelCost }));
    });
}

// --- 7. Dashboard Data Loader ---
function loadDashboardData() {
    const dashContainer = document.getElementById("dashboardContent");
    if (!dashContainer) return;

    const user = JSON.parse(localStorage.getItem("plan2build_user")) || { name: "Guest User" };
    const plan = JSON.parse(localStorage.getItem("plan2build_plan")) || { plotSize: "Not Set", plotArea: "Not Set", builtUpArea: "Not Set", bedrooms: "Not Set", bathrooms: "Not Set", kitchen: "Not Set", parking: "Not Set" };
    const materials = JSON.parse(localStorage.getItem("plan2build_materials")) || { cement: 0, sand: 0, bricks: 0, steel: 0, tiles: 0, paint: 0 };
    const costs = JSON.parse(localStorage.getItem("plan2build_costs")) || { matCost: 0, labCost: 0, otherExp: 0, totalCost: 0 };
    const remodel = JSON.parse(localStorage.getItem("plan2build_remodel")) || { cost: 0 };

    dashContainer.innerHTML = `
        <h2>Welcome, ${user.name}</h2>
        <div class="cards-grid">
            <div class="data-card"><h4>Plot Size</h4><div class="value">${plan.plotSize}</div></div>
            <div class="data-card"><h4>Plot Area</h4><div class="value">${plan.plotArea}</div></div>
            <div class="data-card"><h4>Built-up Area</h4><div class="value">${plan.builtUpArea}</div></div>
            <div class="data-card"><h4>Bedrooms / Kitchen</h4><div class="value">${plan.bedrooms} / ${plan.kitchen}</div></div>
        </div>

        <h3 style="margin-top:2rem;">Estimated Materials</h3>
        <div class="cards-grid">
            <div class="data-card"><h4>Cement</h4><div class="value">${materials.cement} Bags</div></div>
            <div class="data-card"><h4>Sand</h4><div class="value">${materials.sand} cu.ft</div></div>
            <div class="data-card"><h4>Bricks</h4><div class="value">${materials.bricks}</div></div>
            <div class="data-card"><h4>Steel</h4><div class="value">${materials.steel} kg</div></div>
        </div>

        <h3 style="margin-top:2rem;">Estimated Costs</h3>
        <div class="cards-grid">
            <div class="data-card"><h4>Material Cost</h4><div class="value">₹ ${costs.matCost.toLocaleString()}</div></div>
            <div class="data-card"><h4>Labour Cost</h4><div class="value">₹ ${costs.labCost.toLocaleString()}</div></div>
            <div class="data-card"><h4>Total Estimated Cost</h4><div class="value" style="color:var(--accent);">₹ ${costs.totalCost.toLocaleString()}</div></div>
        </div>

        <h3 style="margin-top:2rem;">Remodeling Plan</h3>
        <p>Estimated Remodeling Cost: <strong>₹ ${remodel.cost.toLocaleString()}</strong></p>
    `;
}