document.addEventListener("DOMContentLoaded", function () {
  const openModalButton = document.getElementById("openModal");
  const modal = document.getElementById("modal");
  const closeModalButton = document.getElementById("closeModal");
  const dataForm = document.getElementById("dataForm");
  const dataList = document.getElementById("dataList");
  const modalExito = document.getElementById("modalExito");
  const mensajeExito = document.getElementById("mensajeExito");
  const modalEliminar = document.getElementById("modalEliminar");
  const btnEliminar = document.getElementById("btnEliminar");
  const contrasenia = document.getElementById("contrasenia");
  const agregarCompraButton = document.getElementById("agregarProducto");
  const formContainer = document.getElementById('datos');
  const idFactura = localStorage.getItem('idFactura');
  const idCliente = localStorage.getItem('idCliente');
  const idUsuario = localStorage.getItem('idUsuario');
  const nombreCliente = localStorage.getItem('nombreCliente');
  const nombreUsuario = localStorage.getItem('nombreUsuario');
  let currentId = null;

  // Verificar que los datos existan en el localStorage
  if (idFactura && nombreCliente && nombreUsuario) {
    formContainer.innerHTML = `
      <div class="max-w-md sm:max-w-2xl md:max-w-4xl mx-auto bg-gray-200 p-6 rounded-lg shadow-lg">
        <h3 class="text-xl font-bold text-gray-800">Número de Factura: <span class="font-semibold text-gray-600">${idFactura}</span></h3>
        <h3 class="text-xl font-bold text-gray-800 mt-2">Nombre del Usuario: <span class="font-semibold text-gray-600">${nombreUsuario}</span></h3>
        <h3 class="text-xl font-bold text-gray-800 mt-2">Nombre del Cliente: <span class="font-semibold text-gray-600">${nombreCliente}</span></h3>
      </div>
    `;
  } else {
    console.error('No se encontraron los datos en localStorage.');
  }

  // Abrir modal al hacer clic en el botón flotante
  openModalButton.addEventListener("click", function () {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  // Cerrar modal al hacer clic en el botón "Cerrar" dentro del modal
  closeModalButton.addEventListener("click", function () {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  // Cerrar modal si se hace clic fuera del contenido del modal
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  // Cargar todos los productos al inicio
  fetchDetalleFacturas();

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
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
      })
      .then((productos) => {
        console.log("Productos cargados:", productos);
        const selectProductos = document.querySelector(".producto_select");
        const inputPrecioUnitario = document.getElementById("precio_unitario");
        
        // Agregar opción por defecto
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.text = "Seleccione un producto";
        selectProductos.appendChild(optionDefault);
        
        // Iterar sobre los productos y agregar opciones
        productos.forEach((producto) => {
          const option = document.createElement("option");
          option.value = producto.id_producto;
          option.text = producto.nombre;
          selectProductos.appendChild(option);
        });

        // Agregar evento de cambio al select
        selectProductos.addEventListener("change", (e) => {
          const idProductoSeleccionado = e.target.options[e.target.selectedIndex].value;
          const productoSeleccionado = productos.find((producto) => producto.id_producto === parseInt(idProductoSeleccionado));
          
          if (productoSeleccionado) {
            inputPrecioUnitario.value = productoSeleccionado.precio;
          } else {
            inputPrecioUnitario.value = "0.00";
          }
          // Calcular subtotal
          calcularSubtotal();
        });

        // Agregar evento de cambio al input de cantidad
        document.querySelector(".cantidad").addEventListener("input", () => {
          calcularSubtotal();
        });

        // Función para calcular subtotal
        function calcularSubtotal() {
          const cantidad = parseInt(document.querySelector(".cantidad").value);
          const precioUnitario = parseFloat(inputPrecioUnitario.value);
          const subtotal = cantidad * precioUnitario;
          document.querySelector(".subtotal").value = subtotal.toFixed(2);
        }
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
      });

  }
  

  function fetchDetalleFacturas() {
    const formData = new FormData();
    formData.append("action", "fetch");

    fetch("server_detalle_factura.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
      })
      .then((detalle_facturas) => {
        console.log("detalle facturas cargadas:", detalle_facturas);
        dataList.innerHTML = ""; // Limpiar la lista de facturas previas
        if (detalle_facturas.length === 0) {
          dataList.innerHTML = "<p>No hay detalles de facturas disponibles.</p>";
        } else {
          // Iterar sobre las facturas y mostrar los datos
          detalle_facturas.forEach((detalle_factura) => {
            console.log(detalle_factura.id_factura);
            let subtotal = parseFloat(detalle_factura.subtotal);
            const facturaCard = document.createElement("div");
            facturaCard.className = "p-4 border rounded-lg shadow-md bg-white";
            facturaCard.innerHTML = `
                        <p><strong>Nombre Producto: ${
                          detalle_factura.id_producto
                        }</strong>
                        <p><strong>Cantidad:</strong> ${
                          detalle_factura.cantidad
                        }</p>
                        <p><strong>Precio:</strong> ${
                          detalle_factura.precio_unitario
                        }</p>
                        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        <div class="mt-4 flex justify-between">
                            <button onclick="editFactura(${
                              detalle_factura.id_detalle
                            })" class="bg-blue-500 text-white px-4 py-2 rounded" title="editar factura">
                            <img src="img/edit.svg" alt="edit">
                            </button>

                            <button onclick="viewFactura(${detalle_factura.id_detalle})" class="bg-green-500 text-white px-4 py-2 rounded" title="detalles de factura">
                            <img src="img/details.svg" alt="details">
                            </button>

                            <button onclick="confirmDelete(${
                              detalle_factura.id_detalle
                            })" class="bg-red-500 text-white px-4 py-2 rounded" title="eliminar factura">
                            <img src="img/delete.svg" alt="delete">
                            </button>

                        </div>
                    `;
            dataList.appendChild(facturaCard);
          });
        }
      })
      .catch((error) => {
        console.error("Error al cargar facturas:", error);
        dataList.innerHTML = "<p>Ocurrió un error al cargar las facturas.</p>";
      });
  }

  // Función para agregar o actualizar detalle producto
  dataForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Formulario enviado"); // Para depuración

    const formData = new FormData(dataForm);
    const action = idFactura ? "update" : "add";
    formData.append("action", action);
    formData.append("id_factura",idFactura);
    console.log(idFactura);
    if (idFactura) formData.append("id_factura", idFactura);

    fetch("server_detalle_factura.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          modal.classList.add("hidden");
          showModalExito(data.message);
          dataForm.reset();
          currentId = null;
          fetchFacturas();
        } else {
          console.log("Error: " + data.message);
        }
      })
      .catch((error) => console.error("Error en el guardado:", error));
  });

  // Función para editar producto
  window.editFactura = function (id_factura) {
    console.log(id_factura);
    fetch("server_factura.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=fetch&id_factura=${id_factura}`,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta de la red");
        }
        return response.json();
      })
      .then((factura) => {
        console.log(factura);

        // Esperamos a que se carguen los selectores antes de intentar establecer los valores
        cargarSelectores().then(() => {
            const idUsuario = factura.id;
            const idCliente = factura.id_cliente;
            const selectUsuario = document.getElementById("id_usuario");
            const optionUsuario = Array.from(selectUsuario.options).find(
                (option) => option.value === idUsuario.toString()
            );
        
            console.log(optionUsuario);
            if (optionUsuario) {
                optionUsuario.selected = true;
                optionUsuario.textContent = factura.usuario_nombre;
                console.log(optionUsuario.textContent);
            }
        
            const selectCliente = document.getElementById("id_cliente");
            const optionCliente = Array.from(selectCliente.options).find(
                (option) => option.value === idCliente.toString()
            );
        
            if (optionCliente) {
                optionCliente.selected = true;
                optionCliente.textContent = factura.cliente_nombre;
                console.log(optionCliente.textContent);
            }
            
            if (document.getElementById("fecha").type === "date") {
                document.getElementById("fecha").value = factura.fecha;
            } else if (document.getElementById("fecha").type === "datetime-local") {
                const fechaFormateada = new Date(factura.fecha).toISOString().slice(0, 16);
                document.getElementById("fecha").value = fechaFormateada; 
            }
        
            currentId = id_factura;
            console.log(currentId);

            
            modal.classList.remove("hidden");
            modal.classList.add("flex");
        });
        
      })

      .catch((error) => {
        console.error("Error al cargar factura:", error);
        showModalExito(
          "Ocurrió un error al intentar cargar los datos de la factura."
        );
      });
  };

  // Función para confirmar eliminación de factura
  window.confirmDelete = function (id_factura) {
    currentId = id_factura;
    modalEliminar.classList.remove("hidden");
  };

  // Eliminar factura
  btnEliminar.addEventListener("click", function () {
    fetch("server_factura.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=delete&id_factura=${currentId}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showModalExito(data.message);
          fetchFacturas();
          currentId = null;
        }
        modalEliminar.classList.add("hidden");
      })
      .catch((error) => console.error("Error al eliminar factura:", error));
  });

  // Cerrar modal de eliminación
  document.getElementById("btnCancelar").addEventListener("click", function () {
    modalEliminar.classList.add("hidden");
  });
});
