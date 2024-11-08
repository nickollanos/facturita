document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const permisosForm = document.getElementById('permisosForm');    
    const modalExito = document.getElementById("modalExito");
    const mensajeExito = document.getElementById("mensajeExito");  

    // Cerrar modal si se hace clic fuera del contenido del modal
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });

    // Función para mostrar el modal de éxito (oculta el modal después de 3 segundos)
    function showModalExito(message) {
        mensajeExito.textContent = message;
        modalExito.classList.remove("hidden");
        setTimeout(() => modalExito.classList.add("hidden"), 1000);
    }

    // Verificar si los datos existen
    permisosForm.addEventListener('submit', function (event) {
        event.preventDefault();  // Prevenir el comportamiento por defecto del formulario (recarga)

        const userId = localStorage.getItem('userId');
        const permiso = document.getElementById('permisos').value;

        // Verificar si el userId y el permiso existen
        if (!userId || !permiso) {
            alert("Faltan datos necesarios.");
            return;
        }

        const formData = new FormData();
        formData.append('action', 'assign_permissions');
        formData.append('userId', userId);
        formData.append('permiso', permiso);

        // Realizar la petición POST con fetch
        fetch('server_permisos_usuario.php', {
            method: 'POST',
            body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                showModalExito('Permisos asignados correctamente');
                setTimeout(() => {
                    window.location.href = 'usuario.html';  // Redirigir a la lista de usuarios
                }, 1000); // Redirigir después de que se cierre el modal de éxito
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error al enviar datos:', error);
            alert('Error al asignar permisos.');
        });
    });
});
