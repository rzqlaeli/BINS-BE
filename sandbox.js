function isValidEmail(email) {
    // Regular expression for basic email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Example usage:
var email1 = "test@example.com";
var email2 = "test@mail.com";

console.log(isValidEmail(email1));  // Output: true
console.log(isValidEmail(email2));  // Output: false
