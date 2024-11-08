document.addEventListener('DOMContentLoaded', function () {
    const openModalButton = document.getElementById('openModal');
    const modal = document.getElementById('modal');
    const closeModalButton = document.getElementById('closeModal');
    const dataForm = document.getElementById("dataForm");
    const dataList = document.getElementById("dataList");
    const modalExito = document.getElementById("modalExito");
    const mensajeExito = document.getElementById("mensajeExito");
    const modalEliminar = document.getElementById("modalEliminar");
    const btnEliminar = document.getElementById("btnEliminar");
    const contrasenia = document.getElementById("contrasenia");
    let currentId = null;

    // Abrir modal al hacer clic en el botón flotante
    openModalButton.addEventListener('click', function () {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    // Cerrar modal al hacer clic en el botón "Cerrar" dentro del modal
    closeModalButton.addEventListener('click', function () {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // Cerrar modal si se hace clic fuera del contenido del modal
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });

    // Cargar todos los clientes al inicio
    fetchClientes();

    // Función para mostrar el modal de éxito (oculta el modal después de 3 segundos)
    function showModalExito(message) {
        mensajeExito.textContent = message;
        modalExito.classList.remove("hidden");
        setTimeout(() => modalExito.classList.add("hidden"), 1000);
    }

    // Función para cargar los clientes
function fetchClientes() {
    const formData = new FormData();
    formData.append("action", "fetch");

    fetch("server_cliente.php", {
        method: "POST",
        body: formData,
    })
    .then(response => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
    })
    .then(clientes => {
        console.log("clientes cargados: ", clientes);
        dataList.innerHTML = "";
        if (clientes.length === 0) dataList.innerHTML = "<p>No hay clientes disponibles.</p>";

        clientes.forEach(cliente => {
            console.log(cliente.id_cliente);
            const clienteCard = document.createElement("div");
            clienteCard.className = "p-4 border rounded-lg shadow-md bg-white";
            clienteCard.innerHTML = `
                <h3 class="text-lg font-semibold">${cliente.nombre}</h3>
                <p>Email: ${cliente.email}</p>
                <p>Teléfono: ${cliente.telefono}</p>
                <p>Direccion: ${cliente.direccion}</p>
                <div class="mt-4 flex justify-between">
                    <button onclick="editCliente(${cliente.id_cliente})" class="bg-blue-500 text-white px-4 py-2 rounded">Editar</button>
                    <button onclick="confirmDelete(${cliente.id_cliente})" class="bg-red-500 text-white px-4 py-2 rounded">Eliminar</button>
                </div>
            `;
            dataList.appendChild(clienteCard);
        });
    })
    .catch(error => {
        console.error("Error al cargar clientes:", error);
        dataList.innerHTML = "<p>Ocurrió un error al cargar los clientes.</p>";
    });
}


    // Función para agregar o actualizar cliente
    dataForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Formulario enviado"); // Para depuración

        const formData = new FormData(dataForm);
        const action = currentId ? "update" : "add";
        formData.append("action", action);
        if (currentId) formData.append("id_cliente", currentId);

        fetch("server_cliente.php", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {                
                modal.classList.add('hidden');
                showModalExito(data.message);
                dataForm.reset();
                currentId = null;
                fetchClientes();
            } else {
                console.log("Error: " + data.message);
            }
        })
        .catch(error => console.error("Error en el guardado:", error));
    });

    // Función para editar cliente
    window.editCliente = function (id_cliente) {
        console.log(id_cliente);
        fetch("server_cliente.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=fetch&id_cliente=${id_cliente}`,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta de la red");
            }
            return response.json();            
        })
        .then(cliente => {
            console.log(cliente);
            if (cliente && cliente.nombre && cliente.email && cliente.telefono && cliente.direccion) {
                document.getElementById("nombre").value = cliente.nombre;
                document.getElementById("email").value = cliente.email;
                document.getElementById("telefono").value = cliente.telefono;
                document.getElementById("direccion").value = cliente.direccion;
                currentId = id_cliente;
                console.log(currentId);

                // Mostrar el sidebar para editar
                console.log('hi');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            } else {
                showModalExito("Error al cargar los datos del usuario. Intenta nuevamente.");
            }
        })
        .catch(error => {
            console.error("Error al cargar cliente:", error);
            showModalExito("Ocurrió un error al intentar cargar los datos del cliente.");
        });
    };

    // Función para confirmar eliminación de cliente
    window.confirmDelete = function (id_cliente) {
        currentId = id_cliente;
        modalEliminar.classList.remove("hidden");
    };

    // Eliminar cliente
    btnEliminar.addEventListener("click", function () {
        fetch("server_cliente.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=delete&id_cliente=${currentId}`,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showModalExito(data.message);
                fetchClientes();
                currentId = null;
            }
            modalEliminar.classList.add("hidden");
        })
        .catch(error => console.error("Error al eliminar cliente:", error));
    });

    // Cerrar modal de eliminación
    document.getElementById("btnCancelar").addEventListener("click", function () {
        modalEliminar.classList.add("hidden");
    });
});
