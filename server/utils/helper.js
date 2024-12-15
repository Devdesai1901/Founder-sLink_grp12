const exportedMethods ={
    stringVerifyer(nameofString, strID, yesORno, minimum, maximum) {
        if(!strID) {
            throw new Error(`${nameofString} is undefined.`);
        }
        if(typeof strID !== "string"){
            throw new Error(`${nameofString} is not a string.`);
        }
        strID = strID.trim();
        if(strID.length === 0){
            throw new Error(`${nameofString} is empty.`);
        }
        if(yesORno) {
            if(strID.match(/\d/) !== null) {
                throw new Error(`${nameofString} contains numbers.`);
            }
        }
        if(minimum) {
            if(strID.length <= minimum){
                throw new Error(`${nameofString} is less than ${minimum} characters long.`);
            }
        }
        if(maximum) {
            if(strID.length >= maximum){
                throw new Error(`${nameofString} is greater than ${maximum} characters long.`);
            }
        }
        return strID;
    },
    passwordVerifyer(password) {
        //will be called after checkString
        if(!password) {
            throw new Error(`Password is not provided.`);
        }

        if(password.match(/[A-Z]/) === null) {
            throw new Error(`Password needs at least one uppercase character.`);
        }
        if(password.match(/\d/) === null) {
            throw new Error(`Password needs at least one number.`);
        }
        if(password.match(/[#?!@$ %^&*-]/) === null) {
            throw new Error(`Password needs at least one special character.`);
        }
    },
    emailVerifyer(email) {
        if (!email || typeof email !== "string") {
            throw new Error(`Email is not provided or not a string.`);
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new Error(`Invalid email format.`);
        }
        const domain = email.split("@")[1];
        if (!domain || !domain.includes(".")) {
            throw new Error(`Invalid email domain.`);
        }
        return email;
    },
    validValues(nameofString, strID, compare1, compare2) {
        //checks if given string is one of the two values
        if(strID !== compare1 && strID !== compare2) {
            throw new Error(`Did not supply a valid value for ${nameofString}`);
        }

        return strID;
    },
    phoneCodeVerifyer(phoneCode) {
        const phoneCodeRegex = /^\+[1-9][0-9]{0,2}$/;
        if (!phoneCode || typeof phoneCode !== "string" || !phoneCodeRegex.test(phoneCode)) {
            throw new Error(`Invalid phone code: ${phoneCode}. Please provide a valid international phone code starting with '+'.`);
        }
        return phoneCode;
    },

    phoneNumberVerifyer(phoneNumber) {
        if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.length !== 10 || !/^[0-9]{10}$/.test(phoneNumber)) {
            throw new Error(`Invalid phone number. It should be a 10-digit number.`);
        }
        return phoneNumber;
    },

    dateOfBirthVerifyer(dateOfBirth) {
        if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
            throw new Error(`Invalid date of birth provided.`);
        }
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        if (age < 25) {
            throw new Error(`User must be at least 25 years old to register.`);
        }
        return dateOfBirth;
    }
};

export default exportedMethods;