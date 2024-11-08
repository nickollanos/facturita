
// document.addEventListener('DOMContentLoaded', function () {
//     const dropdownButton = document.getElementById('dropdownButton');
//     const dropdownContent = document.getElementById('dropdownContent');

//     dropdownButton.addEventListener('click', function () {
//         dropdownContent.classList.toggle('hidden');
//     });

//     // Cierra el dropdown si se hace clic fuera de él
//     window.addEventListener('click', function (event) {
//         if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
//             dropdownContent.classList.add('hidden');
//         }
//     });
// });

document.addEventListener('DOMContentLoaded', function () {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownContent = document.getElementById('dropdownContent');
    const backButton = document.getElementById('backButton');

    // Alterna el sidebar al hacer clic en el botón de menú
    dropdownButton.addEventListener('click', function (event) {
        event.stopPropagation();
        dropdownContent.classList.toggle('-translate-x-full');
    });

    // Cierra el sidebar al hacer clic en el botón "Atrás"
    backButton.addEventListener('click', function () {
        dropdownContent.classList.add('-translate-x-full'); // Oculta el sidebar
    });

    // Cierra el sidebar si se hace clic fuera de él
    window.addEventListener('click', function (event) {
        if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
            dropdownContent.classList.add('-translate-x-full');
        }
    });
});

