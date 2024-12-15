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
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) return "Invalid email format.";
            return null;
        },
        checkPassword(password) {
            if (!/[A-Z]/.test(password)) return "Password must have at least one uppercase letter.";
            if (!/\d/.test(password)) return "Password must have at least one number.";
            if (!/[#?!@$%^&*-]/.test(password)) return "Password must have at least one special character.";
            if (password.length < 8) return "Password must be at least 8 characters long.";
            return null;
        },
        passwordsMatch(password, confirmPassword) {
            if (password !== confirmPassword) return "Passwords do not match.";
            return null;
        },
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
                errors.push(validationMethods.stringChecker("Password", password));
                errors.push(validationMethods.checkPassword(password));
            }

            if (form.id === "signup-form") {
                const firstName = form.firstName.value;
                const lastName = form.lastName.value;
                const email = form.email.value;
                const password = form.password.value;
                const confirmPassword = form.confirmPassword.value;

                errors.push(validationMethods.stringChecker("First Name", firstName, true, 2, 25));
                errors.push(validationMethods.stringChecker("Last Name", lastName, true, 2, 25));
                errors.push(validationMethods.validateEmail(email));
                errors.push(validationMethods.checkPassword(password));
                errors.push(validationMethods.passwordsMatch(password, confirmPassword));
            }

            const filteredErrors = errors.filter((error) => error !== null);
            if (filteredErrors.length > 0) {
                event.preventDefault();
                filteredErrors.forEach((error) => {
                    const errorItem = document.createElement("li");
                    errorItem.textContent = error;
                    errorContainer.appendChild(errorItem);
                });
                errorContainer.hidden = false;
            }
        });
    });
});
