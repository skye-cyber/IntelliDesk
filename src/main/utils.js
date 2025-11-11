function getformatDateTime(reverse = false) {
    // Step 1: Create a Date object
    const now = new Date();

    // Step 2: Extract the components
    const year = now.getFullYear().toString().slice(-2); // Get the last two digits of the year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Step 3: Combine the components
    const formattedDateTime = reverse === true
        ? `${hours}:${minutes} ${day}-${month}-20${year}`
        : `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

    return formattedDateTime;
}

module.exports = { getformatDateTime }
