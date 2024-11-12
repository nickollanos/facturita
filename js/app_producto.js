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

    // Cargar todos los productos al inicio
    fetchProductos();

    // Función para mostrar el modal de éxito (oculta el modal después de 3 segundos)
    function showModalExito(message) {
        mensajeExito.textContent = message;
        modalExito.classList.remove("hidden");
        setTimeout(() => modalExito.classList.add("hidden"), 1000);
    }

    // Función para cargar los productos
function fetchProductos() {
    const formData = new FormData();
    formData.append("action", "fetch");

    fetch("server_producto.php", {
        method: "POST",
        body: formData,
    })
    .then(response => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
    })
    .then(productos => {
        console.log("productos cargados: ", productos);
        dataList.innerHTML = "";
        if (productos.length === 0) dataList.innerHTML = "<p>No hay productos disponibles.</p>";

        productos.forEach(producto => {
            console.log(producto.id_producto);
            const productoCard = document.createElement("div");
            productoCard.className = "p-4 border rounded-lg shadow-md bg-white";
            productoCard.innerHTML = `
                <h3 class="text-lg font-semibold">${producto.nombre}</h3>
                <p>Descripcion: ${producto.descripcion}</p>
                <p>Precio: ${producto.precio}</p>
                <p>Stock: ${producto.stock}</p>
                <div class="mt-4 flex justify-between">
                    <button onclick="editproducto(${producto.id_producto})" class="bg-blue-500 text-white px-4 py-2 rounded"title="editar producto">
                            <img src="img/edit.svg" alt="edit">
                    </button>
                    <button onclick="confirmDelete(${producto.id_producto})" class="bg-red-500 text-white px-4 py-2 rounded"title="eliminar producto">
                            <img src="img/delete.svg" alt="delete">
                    </button>
                </div>
            `;
            dataList.appendChild(productoCard);
        });
    })
    .catch(error => {
        console.error("Error al cargar productos:", error);
        dataList.innerHTML = "<p>Ocurrió un error al cargar los productos.</p>";
    });
}


    // Función para agregar o actualizar producto
    dataForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Formulario enviado"); // Para depuración

        const formData = new FormData(dataForm);
        const action = currentId ? "update" : "add";
        formData.append("action", action);
        if (currentId) formData.append("id_producto", currentId);

        fetch("server_producto.php", {
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
                fetchProductos();
            } else {
                console.log("Error: " + data.message);
            }
        })
        .catch(error => console.error("Error en el guardado:", error));
    });

    // Función para editar producto
    window.editproducto = function (id_producto) {
        console.log(id_producto);
        fetch("server_producto.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=fetch&id_producto=${id_producto}`,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta de la red");
            }
            return response.json();            
        })
        .then(producto => {
            console.log(producto);
            if (producto && producto.nombre && producto.descripcion && producto.precio && producto.stock) {
                
                document.getElementById("nombre").value = producto.nombre;
                document.getElementById("descripcion").value = producto.descripcion;
                document.getElementById("precio").value = producto.precio;
                document.getElementById("stock").value = producto.stock;
                console.log(producto.stock);
                currentId = id_producto;
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
            console.error("Error al cargar producto:", error);
            showModalExito("Ocurrió un error al intentar cargar los datos del producto.");
        });
    };

    // Función para confirmar eliminación de producto
    window.confirmDelete = function (id_producto) {
        currentId = id_producto;
        modalEliminar.classList.remove("hidden");
    };

    // Eliminar producto
    btnEliminar.addEventListener("click", function () {
        fetch("server_producto.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=delete&id_producto=${currentId}`,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showModalExito(data.message);
                fetchProductos();
                currentId = null;
            }
            modalEliminar.classList.add("hidden");
        })
        .catch(error => console.error("Error al eliminar producto:", error));
    });

    // Cerrar modal de eliminación
    document.getElementById("btnCancelar").addEventListener("click", function () {
        modalEliminar.classList.add("hidden");
    });
});
