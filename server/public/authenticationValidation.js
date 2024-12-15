document.addEventListener("DOMContentLoaded", function () {
    const validationMethods ={
        stringChecker(nameOFstring, strID, yesORno = false, minimum = 0, maximum = Infinity) {
            if (!strID){
                errors.push(`${nameOFstring} is undefined.`);
            }
            if (typeof strID !== "string") {
                errors.push(`${nameOFstring} is not a string.`);
            }
            strID =strID.trim();
            if (strID.length === 0){
                errors.push(`${nameOFstring} is empty.`);
            }
            if (yesORno && /\d/.test(strID)){
                errors.push(`${nameOFstring} should not contain numbers.`);
            }
            if (minimum && strID.length < minimum){
                errors.push(`${nameOFstring} must be at least ${minimum} characters long.`);
            }
            if (maximum && strID.length > maximum){
                errors.push(`${nameOFstring} cannot exceed ${maximum} characters.`);
            }
            return strID;
        },
        checkPassword(password, nameOFstring = 'Password'){
            if (!password) {
                errors.push(`${nameOFstring} is not provided.`);
            }
            if (!/[A-Z]/.test(password)){
                errors.push(`${nameOFstring} must contain at least one uppercase letter.`);
            }
            if (!/\d/.test(password)) {
                errors.push(`${nameOFstring} must contain at least one number.`);
            }
            if (!/[#?!@$%^&*-]/.test(password)) {
                errors.push(`${nameOFstring} must contain at least one special character.`);
            }
        },
        validValues(nameOFstring, strID, compare1, compare2) {
            if (strID !== compare1 && strID !== compare2) {
                errors.push(`${nameOFstring} must be either ${compare1} or ${compare2}.`);
            }
            return strID;
        },
        passwordsMatchChecker(password, confirmPassword) {
            if (password !== confirmPassword) {
                errors.push('Passwords do not match.');
            }
        },
        validateEmail(email) {
            if (!email) {
                errors.push(`Email is not provided.`);
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                errors.push(`Invalid email format.`);
            }
            const domain = email.split("@")[1];
            if (!domain || !domain.includes(".")) {
                errors.push(`Invalid email domain.`);
            }
        },


    validatePhoneCode(phoneCode) {
        const phoneCodeRegex = /^\+[1-9][0-9]{0,2}$/;
        if (!phoneCode || typeof phoneCode !== "string" || !phoneCodeRegex.test(phoneCode)) {
            errors.push(`Invalid phone code. It must start with '+' followed by 1 to 3 digits.`);
        }
    },

    validatePhoneNumber(phoneNumber) {
        if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.length !== 10 || !/^[0-9]{10}$/.test(phoneNumber)) {
            errors.push(`Invalid phone number. It must be a 10-digit number.`);
        }
    },

    validateDateOfBirth(dateOfBirth) {
        if (!dateOfBirth) {
            errors.push(`Date of birth is not provided.`);
        }
        const dateOfBirthDate = new Date(dateOfBirth);
        if (isNaN(dateOfBirthDate.getTime())) {
            errors.push(`Invalid date format for date of birth.`);
        }
        const today = new Date();
        const age = today.getFullYear() - dateOfBirthDate.getFullYear();
        const monthDiff = today.getMonth() - dateOfBirthDate.getMonth();
        const dayDiff = today.getDate() - dateOfBirthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
        if (age < 25) {
            errors.push(`User must be at least 25 years old to register.`);
        }
    }
    };
    const signInFormEl = document.getElementById("signin-form");
    const signUpFormEl = document.getElementById("signup-form");
    let errorContainer = document.getElementById("error-div");
    let errors = [];
    if (signInFormEl) {
        signInFormEl.addEventListener("submit", (event) =>{
            errors = [];
            errorContainer.hidden = true;
            let emailOFstringInput = document.getElementById("email");
            let passwordInput = document.getElementById("password");
            emailOFstringInput.value = validationMethods.validateEmail(emailOFstringInput.value);
            passwordInput.value = validationMethods.stringChecker("password", passwordInput.value, false, 8);
            validationMethods.checkPassword(passwordInput.value);
            if (errors.length > 0){
                event.preventDefault();
                errorContainer.hidden = false;
                let errorList = document.createElement('ul');
                errors.forEach(error => {
                    let errorItem = document.createElement('li');
                    errorItem.textContent = error;
                    errorList.appendChild(errorItem);
                });
                errorContainer.innerHTML = '';
                errorContainer.appendChild(errorList);
            }
        });
    }
    if (signUpFormEl) {
        signUpFormEl.addEventListener("submit", (event) =>{
            errors = [];
            errorContainer.hidden = true;
            let firstnameOFstringInput = document.getElementById("firstName");
            let lastnameOFstringInput = document.getElementById("lastName  ");
            let emailOFstringInput = document.getElementById("email");
            console.log(emailOFstringInput)     
            let passwordInput = document.getElementById("password");
            let confirmPasswordInput = document.getElementById("confirmPassword");
            let phoneCodeInput = document.getElementById("phoneCode");
            let phoneNumberInput = document.getElementById("phoneNumber");
            let dateOfBirthInput = document.getElementById("dateOfBirth");
            let userType = document.getElementById("userType");
            firstnameOFstringInput.value = validationMethods.stringChecker("First nameOFstring", firstnameOFstringInput.value, true, 2, 25);
            lastnameOFstringInput.value = validationMethods.stringChecker("Last nameOFstring", lastnameOFstringInput.value, true, 2, 25);
            emailOFstringInput.value = validationMethods.validateEmail(emailOFstringInput.value);
            passwordInput.value = validationMethods.stringChecker("Password", passwordInput.value, false, 8);
            validationMethods.checkPassword(passwordInput.value);
            confirmPasswordInput.value = validationMethods.stringChecker("Confirm Password", confirmPasswordInput.value, false, 8);
            validationMethods.passwordsMatchChecker(passwordInput.value, confirmPasswordInput.value);
            phoneCodeInput.value = validationMethods.validatePhoneCode(phoneCodeInput.value);
            phoneNumberInput.value = validationMethods.validatePhoneNumber(phoneNumberInput.value);
            dateOfBirthInput.value = validationMethods.validateDateOfBirth(dateOfBirthInput.value);
            userType.value = validationMethods.validValues("userType", userType.value.toLowerCase(), "investor", "founder");
            if (errors.length > 0){
                event.preventDefault();
                let errorList = document.createElement('ul');
                errors.forEach(error => {
                    let errorItem = document.createElement('li');
                    errorItem.textContent = error;
                    errorList.appendChild(errorItem);});
                errorContainer.innerHTML = '';
                errorContainer.hidden = false;
                errorContainer.appendChild(errorList);
            }
        });
    }
});
