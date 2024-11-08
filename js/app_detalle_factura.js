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
  let currentId = null;

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
  // fetchDetalleFacturas();

  // Función para mostrar el modal de éxito (oculta el modal después de 3 segundos)
  function showModalExito(message) {
    mensajeExito.textContent = message;
    modalExito.classList.remove("hidden");
    setTimeout(() => modalExito.classList.add("hidden"), 1000);
  }

  // Función para cargar los Facturas
  // function fetchDetalleFacturas() {
  //   const formData = new FormData();
  //   formData.append("action", "fetch");

  //   fetch("server_detalle_factura.php", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((response) => {
  //       if (!response.ok) throw new Error("Error en la respuesta de la red");
  //       return response.json();
  //     })
  //     .then((facturas) => {
  //       console.log("Detalles de facturas cargados:", facturas);
  //       dataList.innerHTML = ""; // Limpiar la lista de facturas previas
  //       if (facturas.length === 0) {
  //         dataList.innerHTML = "<p>No hay facturas disponibles.</p>";
  //       } else {
  //         // Iterar sobre las facturas y mostrar los datos
  //         facturas.forEach((factura) => {
  //           console.log(factura.id_factura);
  //           let total = parseFloat(factura.total);
  //           const facturaCard = document.createElement("div");
  //           facturaCard.className = "p-4 border rounded-lg shadow-md bg-white";
  //           facturaCard.innerHTML = `
  //                       <p><strong>Factura Numero: ${
  //                         factura.id_factura
  //                       }</strong>
  //                       <p><strong>Atendido por:</strong> ${
  //                         factura.usuario_nombre
  //                       }</p>
  //                       <p><strong>Cliente:</strong> ${
  //                         factura.cliente_nombre
  //                       }</p>
  //                       <p><strong>Fecha y Hora:</strong> ${factura.fecha}</p>
  //                       <p><strong>Total:</strong> $${total.toFixed(2)}</p>
  //                       <div class="mt-4 flex justify-between">
  //                           <button onclick="editFactura(${
  //                             factura.id_factura
  //                           })" class="bg-blue-500 text-white px-4 py-2 rounded">Editar</button>

  //                           <button onclick="viewFactura(${factura.id_factura})" class="bg-green-500 text-white px-4 py-2 rounded">Detalles Factura</button>

  //                           <button onclick="confirmDelete(${
  //                             factura.id_factura
  //                           })" class="bg-red-500 text-white px-4 py-2 rounded">Eliminar</button>
  //                       </div>
  //                   `;
  //           dataList.appendChild(facturaCard);
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error al cargar facturas:", error);
  //       dataList.innerHTML = "<p>Ocurrió un error al cargar las facturas.</p>";
  //     });
  // }

  // Función para agregar o actualizar factura
  dataForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Formulario enviado"); // Para depuración

    const formData = new FormData(dataForm);
    const action = currentId ? "update" : "add";
    formData.append("action", action);
    if (currentId) formData.append("id_factura", currentId);

    fetch("server_factura.php", {
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

  // Función para editar factura
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

function viewFactura(idFactura) {
    console.log("Ver factura con ID:", idFactura);

    localStorage.setItem('facturaId', idFactura);

    

    window.location.href = 'detalle_factura.html';
}
