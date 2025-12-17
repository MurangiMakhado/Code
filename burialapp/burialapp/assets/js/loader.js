// Simple HTML include loader for vanilla JS projects
function loadHTML(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading HTML:', error));
}

// Auto-load head includes
document.addEventListener('DOMContentLoaded', function() {
    // Load any elements marked with data-include attribute
    document.querySelectorAll('[data-include]').forEach(element => {
        const file = element.getAttribute('data-include');
        loadHTML(element.id, file);
    });
});
