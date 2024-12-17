document.addEventListener("DOMContentLoaded", function () {
    const validationMethods = {
        stringChecker(name, value, noNumbers = false, min = 0, max = Infinity) {
            if (!value) return `${name} is required.`;

            value = value.trim();
            if (value.length === 0) return `${name} cannot be empty.`;
            if (noNumbers && /\d/.test(value)) return `${name} should not contain numbers.`;
            if (value.length < min) return `${name} must be at least ${min} characters.`;
            if (value.length > max) return `${name} cannot exceed ${max} characters.`;

            return null;
        },
        validateEmail(email) {
            if (!email) return "Email is required.";
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) return "Invalid email format.";
            return null;
        },
        checkPassword(password) {
            if (!password) return "Password is required.";
            if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
            if (!/\d/.test(password)) return "Password must contain at least one number.";
            if (!/[#?!@$%^&*-]/.test(password)) return "Password must contain at least one special character.";
            if (password.length < 8) return "Password must be at least 8 characters long.";
            return null;
        },
        passwordsMatch(password, confirmPassword) {
            if (password !== confirmPassword) return "Passwords do not match.";
            return null;
        },
        validatePhoneCode(phoneCode) {
            const phoneCodeRegex = /^\+[1-9][0-9]{0,2}$/;
            if (!phoneCode || !phoneCodeRegex.test(phoneCode)) {
                return "Invalid phone code. It must start with '+' followed by 1 to 3 digits.";
            }
            return null;
        },
        validatePhoneNumber(phoneNumber) {
            if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
                return "Invalid phone number. It must be a 10-digit number.";
            }
            return null;
        },
        validateDateOfBirth(dateOfBirth) {
            if (!dateOfBirth) return "Date of birth is required.";
            const date = new Date(dateOfBirth);
            if (isNaN(date.getTime())) return "Invalid date format for date of birth.";

            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            if (age < 25 || (age === 25 && today < new Date(today.getFullYear(), date.getMonth(), date.getDate()))) {
                return "User must be at least 25 years old to register.";
            }
            return null;
        },
        validValues(name, value, validOption1, validOption2) {
            if (value !== validOption1 && value !== validOption2) {
                return `${name} must be either ${validOption1} or ${validOption2}.`;
            }
            return null;
        }
    };

    const forms = {
        signInForm: document.getElementById("signin-form"),
        signUpForm: document.getElementById("signup-form"),
    };

    Object.values(forms).forEach((form) => {
        if (!form) return;

        form.addEventListener("submit", (event) => {
            const errors = [];
            const errorContainer = document.getElementById("error-div");
            errorContainer.innerHTML = "";
            errorContainer.hidden = true;

            if (form.id === "signin-form") {
                const email = form.email.value;
                const password = form.password.value;

                errors.push(validationMethods.validateEmail(email));
                errors.push(validationMethods.checkPassword(password));
            }

            if (form.id === "signup-form") {
                const firstName = form.firstName.value;
                const lastName = form.lastName.value;
                const email = form.email.value;
                const password = form.password.value;
                const confirmPassword = form.confirmPassword.value;
                const phoneCode = form.phoneCode.value;
                const phoneNumber = form.phoneNumber.value;
                const dateOfBirth = form.dateOfBirth.value;
                const userType = form.userType.value.toLowerCase();

                errors.push(validationMethods.stringChecker("First Name", firstName, true, 2, 25));
                errors.push(validationMethods.stringChecker("Last Name", lastName, true, 2, 25));
                errors.push(validationMethods.validateEmail(email));
                errors.push(validationMethods.checkPassword(password));
                errors.push(validationMethods.passwordsMatch(password, confirmPassword));
                errors.push(validationMethods.validatePhoneCode(phoneCode));
                errors.push(validationMethods.validatePhoneNumber(phoneNumber));
                errors.push(validationMethods.validateDateOfBirth(dateOfBirth));
                errors.push(validationMethods.validValues("User Type", userType, "investor", "founder"));
            }

            const filteredErrors = errors.filter((error) => error !== null);
            if (filteredErrors.length > 0) {
                event.preventDefault();
                const errorList = document.createElement("ul");
                filteredErrors.forEach((error) => {
                    const errorItem = document.createElement("li");
                    errorItem.textContent = error;
                    errorList.appendChild(errorItem);
                });
                errorContainer.appendChild(errorList);
                errorContainer.hidden = false;
            }
        });
    });
});
