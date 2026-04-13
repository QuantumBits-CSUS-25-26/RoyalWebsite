export const validateContactForm = (values) => {
    const errors = {};
    
    if (!values.first_name) {
        errors.first_name = 'Required';

    } else if (!/^[\p{L}\s\-'.]+$/u.test(values.first_name)) {
        errors.first_name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!values.last_name) {
        errors.last_name = 'Required';

    } else if (!/^[\p{L}\s\-'.]+$/u.test(values.last_name)) {
        errors.last_name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    if (!values.phone_number) {
        errors.phone_number = 'Required';
    } else {
        // Remove all chars except plus signs and digits, and then check for misplaced or duplicate plus signs
        const cleanPhone = values.phone_number.replace(/[^\d+]/g, '');
        
        if (cleanPhone.includes('+')) {
            const plusCount = (cleanPhone.match(/\+/g) || []).length;
            if (plusCount > 1 || !cleanPhone.startsWith('+')) {
                errors.phone_number = 'Please enter a valid phone number';
                return errors; 
            }
        }

        if (cleanPhone.startsWith('+1') && cleanPhone.length === 12) {
            // +1 followed by exactly 10 digits: valid US number

        } else if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
            // 1 followed by exactly 10 digits: valid US number

        } else if (cleanPhone.startsWith('+')) {
            // International numbers
            const digitsAfterPlus = cleanPhone.slice(1);
            if (digitsAfterPlus.length < 7 || digitsAfterPlus.length > 15) {
                errors.phone_number = 'Please enter a valid phone number';
            }
            //fine otherwise

        } else if (cleanPhone.length === 7) {
            errors.phone_number = 'Please include area code';

        } else if (cleanPhone.length === 10) {
            // 10 digits: valid US number
     
        } else {
            errors.phone_number = 'Please enter a valid phone number';
        }
    }

    if (!values.email) {
        errors.email = 'Required';

    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!values.message) {
        errors.message = 'Required';

    } else if (values.message.length < 1) {
        errors.message = 'Message must be at least 1 character';

    } else if (values.message.length > 1000) {
        errors.message = 'Message cannot exceed 1000 characters';
    }
    return errors;
};