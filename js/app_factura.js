document.addEventListener("DOMContentLoaded", function () {
  const openModalButton = document.getElementById("openModal");
  const modal = document.getElementById("modal");
  const closeModalButton = document.getElementById("closeModal");
  const dataForm = document.getElementById("dataForm");
  const dataList = document.getElementById("dataList");
  const factuPrint = document.getElementById("factuPrint");
  const modalExito = document.getElementById("modalExito");
  const mensajeExito = document.getElementById("mensajeExito");
  const modalEliminar = document.getElementById("modalEliminar");
  const btnEliminar = document.getElementById("btnEliminar");
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
  fetchFacturas();

  // Cargar todos los usuarios al inicio
  fetchUsers();

  // Cargar todos los clientes al inicio
  fetchClientes();

  // Función para mostrar el modal de éxito (oculta el modal después de 3 segundos)
  function showModalExito(message) {
    mensajeExito.textContent = message;
    modalExito.classList.remove("hidden");
    setTimeout(() => modalExito.classList.add("hidden"), 1000);
  }

  // Función para cargar los Facturas
  function fetchFacturas() {
    const formData = new FormData();
    formData.append("action", "fetch");

    fetch("server_factura.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
      })
      .then((facturas) => {
        console.log("Facturas cargadas:", facturas);
        dataList.innerHTML = ""; // Limpiar la lista de facturas previas
        if (facturas.length === 0) {
          dataList.innerHTML = "<p>No hay facturas disponibles.</p>";
        } else {
          // Iterar sobre las facturas y mostrar los datos
          facturas.forEach((factura) => {
            console.log(factura.id_factura);
            let total = parseFloat(factura.total);
            const facturaCard = document.createElement("div");
            facturaCard.className = "p-4 border rounded-lg shadow-md bg-white";
            facturaCard.innerHTML = `
                        <p><strong>Factura Numero: ${
                          factura.id_factura
                        }</strong>
                        <p><strong>Atendido por:</strong> ${
                          factura.usuario_nombre
                        }</p>
                        <p><strong>Cliente:</strong> ${
                          factura.cliente_nombre
                        }</p>
                        <p><strong>Fecha y Hora:</strong> ${factura.fecha}</p>
                        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
                        <div class="mt-4 flex justify-between">
                            <button onclick="editFactura(${
                              factura.id_factura
                            })" class="bg-blue-500 text-white px-4 py-2 rounded" title="editar factura">
                            <img src="img/edit.svg" alt="edit">
                            </button>

                            <button onclick="viewFactura(${
                              factura.id_factura
                            })" class="bg-green-500 text-white px-4 py-2 rounded" title="detalles de factura">
                            <img src="img/details.svg" alt="details">
                            </button>

                            <button onclick="confirmDelete(${
                              factura.id_factura
                            })" class="bg-red-500 text-white px-4 py-2 rounded" title="eliminar factura">
                            <img src="img/delete.svg" alt="delete">
                            </button>

                            <button onclick="addProduc('${
                              factura.id_factura
                            }', '${factura.cliente_nombre}', '${
              factura.usuario_nombre
            }', '${factura.id_cliente}', '${factura.id_usuario}')"
                              class="bg-green-500 text-white px-4 py-2 rounded" title="añadir producto">
                              <img src="img/addproduc.svg" alt="addproduc">
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

  // Función para cargar los usuarios
  function fetchUsers() {
    const formData = new FormData();
    formData.append("action", "fetch");

    fetch("server_usuario.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
      })
      .then((users) => {
        console.log("usuarios cargados: ", users);

        const selectUsuario = document.getElementById("id_usuario");

        // Limpiar las opciones previas del select
        selectUsuario.innerHTML =
          "<option value=''>Seleccione un usuario</option>"; // Opción por defecto

        if (users.length === 0) {
          console.log("No hay usuarios disponibles");
        } else {
          // Agregar cada usuario al select
          users.forEach((user) => {
            const option = document.createElement("option");
            option.value = user.id; // ID del usuario en el value
            option.textContent = user.nombre; // Nombre del usuario como texto de la opción
            selectUsuario.appendChild(option); // Agregar la opción al select
          });
        }
      })
      .catch((error) => {
        console.error("Error al cargar usuarios:", error);
      });
  }

  // Función para cargar los clientes
  function fetchClientes() {
    const formData = new FormData();
    formData.append("action", "fetch");

    fetch("server_cliente.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
      })
      .then((clientes) => {
        console.log("clientes cargados: ", clientes);

        // Referencia al select de clientes
        const selectCliente = document.getElementById("id_cliente");

        // Limpiar las opciones previas del select
        selectCliente.innerHTML =
          "<option value=''>Seleccione un cliente</option>"; // Opción por defecto

        if (clientes.length === 0) {
          console.log("No hay clientes disponibles");
        } else {
          // Agregar cada cliente al select
          clientes.forEach((cliente) => {
            const option = document.createElement("option");
            option.value = cliente.id_cliente; // ID del cliente en el value
            option.textContent = cliente.nombre; // Nombre del cliente como texto de la opción
            selectCliente.appendChild(option); // Agregar la opción al select
          });
        }
      })
      .catch((error) => {
        console.error("Error al cargar clientes:", error);
      });
  }

  function cargarSelectores() {
    return Promise.all([fetchClientes(), fetchUsers(), fetchFacturas()]);
  }

  // Función para cargar los usuarios
  // function viewFactura(idFactura) {
  //   const formData = new FormData();
  //   formData.append("action", "fetch");
  //   formData.append("id_factura", idFactura);

  //   fetch("server_impresion_factura.php", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((response) => {
  //       if (!response.ok) throw new Error("Error en la respuesta de la red");
  //       return response.json();
  //     })
  //     .then((facturas) => {
  //       console.log("datos cargados:", facturas);
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
  //                           })" class="bg-blue-500 text-white px-4 py-2 rounded" title="editar factura">
  //                           <img src="img/edit.svg" alt="edit">
  //                           </button>

  //                           <button onclick="viewFactura(${factura.id_factura})" class="bg-green-500 text-white px-4 py-2 rounded" title="detalles de factura">
  //                           <img src="img/details.svg" alt="details">
  //                           </button>

  //                           <button onclick="confirmDelete(${
  //                             factura.id_factura
  //                           })" class="bg-red-500 text-white px-4 py-2 rounded" title="eliminar factura">
  //                           <img src="img/delete.svg" alt="delete">
  //                           </button>

  //                           <button onclick="addProduc('${factura.id_factura}', '${factura.cliente_nombre}', '${factura.usuario_nombre}', '${factura.id_cliente}', '${factura.id_usuario}')"
  //                             class="bg-green-500 text-white px-4 py-2 rounded" title="añadir producto">
  //                             <img src="img/addproduc.svg" alt="addproduc">
  //                           </button>

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

  // Función para sacar factura
  window.viewFactura = function (idFactura) {
    const formData = new FormData();
    formData.append("action", "view");
    formData.append("id_factura", idFactura);
    console.log(idFactura);
  
    fetch("server_factura.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        return response.json();
      })
      .then((data) => {
        console.log(data);
        const factura = data.factura;
        console.log(factura);
        const detalles = data.detalles;
  
        // Encabezado
        document.getElementById("facturaEncabezado").innerHTML = `
          <h2 class="text-xl font-bold mb-2">Factura Número: ${factura.id_factura}</h2>
          <p><strong>Cliente:</strong> ${factura.cliente_nombre}</p>
          <p><strong>Atendido por:</strong> ${factura.usuario_nombre}</p>
          <p><strong>Fecha:</strong> ${factura.fecha}</p>
        `;
  
        // Detalles
        let detallesHTML = "<ul>";
        detalles.forEach((detalle) => {
          detallesHTML += `
            <li class="border-b border-gray-300 py-2">
              <p><strong>Producto:</strong> ${detalle.producto}</p>
              <p><strong>Cantidad:</strong> ${detalle.cantidad}</p>
              <p><strong>Subtotal:</strong> $${parseFloat(detalle.subtotal).toFixed(2)}</p>
            </li>
          `;
        });
        detallesHTML += "</ul>";
        document.getElementById("facturaDetalles").innerHTML = detallesHTML;
  
        // Total
        document.getElementById("facturaTotal").textContent = `Total: $${parseFloat(factura.total).toFixed(2)}`;
  
        // Mostrar el modal
        document.getElementById("facturaModal").classList.remove("hidden");
      })
      .catch((error) => {
        console.error("Error al cargar factura:", error);
      });
  }

  window.closeModal = function () {
    document.getElementById("facturaModal").classList.add("hidden");
  }
  
  window.printFactura = function () {
    const modalContent = document.getElementById("impresion").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Factura</title>
          <style>
            /* Tamaño de la página como carta */
            @page {
              size: letter;
              margin: 1in; /* Márgenes de la página */
            }
            /* Centrando el contenido */
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: Arial, sans-serif;
            }
            .print-content {
              width: 100%;
              max-width: 600px; /* Ancho máximo del contenido */
              text-align: left; /* Alinear texto a la izquierda */
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${modalContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  

  // Función para agregar o actualizar factura
  dataForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Formulario enviado : ", dataForm); // Para depuración

    const formData = new FormData(dataForm);
    const action = currentId ? "update" : "add";
    formData.append("action", action);
    console.log(currentId);
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
          console.log(idUsuario);
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
          } else if (
            document.getElementById("fecha").type === "datetime-local"
          ) {
            const fechaFormateada = new Date(factura.fecha)
              .toISOString()
              .slice(0, 16);
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

// function viewFactura(idFactura) {
//     console.log("Ver factura con ID:", idFactura);

//     localStorage.setItem('facturaId', idFactura);

//     window.location.href = 'detalle_factura.html';
// }

function addProduc(
  idFactura,
  nombreCliente,
  nombreUsuario,
  idCliente,
  idUsuario
) {
  localStorage.setItem("idFactura", idFactura);
  localStorage.setItem("nombreCliente", nombreCliente);
  localStorage.setItem("nombreUsuario", nombreUsuario);
  localStorage.setItem("idCliente", idCliente);
  localStorage.setItem("idUsuario", idUsuario);
  window.location.href = "add_producto.html";
}
