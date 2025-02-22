async function actualizarPrecio(codigo, supermercadoId) {
  const nuevoPrecio = prompt("Introduce el nuevo precio:");
  if (!nuevoPrecio || isNaN(nuevoPrecio)) {
    alert("Debes ingresar un precio válido.");
    return;
  }

  try {
    // Registrar el nuevo precio
    const response = await fetch(
      "https://scansuper.up.railway.app/api/precios/registrar-precio",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          precio: parseFloat(nuevoPrecio),
          supermercadoId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la actualización: ${response.status}`);
    }

    alert("Precio agregado correctamente.");

    // Solicitar la información actualizada del producto
    await cargarInformacionProductoActualizada(codigo);
    console.log(codigo)

  } catch (error) {
    console.error("Error al agregar el precio:", error);
    alert("No se pudo agregar el precio.");
  }
}

async function mostrarInformacionProducto(data) {
  const infoContainer = document.getElementById("product-info");

  if (!data.precios || data.precios.length === 0) {
    // Caso: Producto sin precios
    infoContainer.innerHTML = `
        <h2>${data.producto.nombre}</h2>
        <p><strong>Marca:</strong> ${data.producto.marca}</p>
        <p><strong>Nombre:</strong> ${data.producto.nombre}</p>
        <p><strong>Estado:</strong> Producto sin precio asignado</p>
        <br>
        <img src="${data.producto.imagen}" alt="Imagen del producto" style="max-width: 200px;" />
        <br>
        <button id="add-to-cart">Agregar al Carrito</button>
        <button id="update-price">Agregar Precio</button>
      `;
  } else {
    // Caso: Producto con precios
    const preciosOrdenados = data.precios.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    const ultimoPrecio = preciosOrdenados[0];
    const precioAnterior = preciosOrdenados[1];

    infoContainer.innerHTML = `
        <h2>${data.producto.nombre}</h2>
        <h3><p><strong>Marca:</strong> ${data.producto.marca}</p></h3>
        <br>
        <p><strong>Último Precio:</strong> $${ultimoPrecio.precio}</p>
        <p><strong>Último Supermercado:</strong> ${
          ultimoPrecio.supermercado.nombre
        }</p>
        <p><strong>Última Dirección:</strong> ${
          ultimoPrecio.supermercado.direccion
        }</p>
        <br>
        <p><strong>Precio Anterior:</strong> $${
          precioAnterior ? precioAnterior.precio : "N/A"
        }</p>
        <p><strong>Supermercado Anterior:</strong> ${
          precioAnterior ? precioAnterior.supermercado.nombre : "N/A"
        }</p>
        <p><strong>Dirección Anterior:</strong> ${
          precioAnterior ? precioAnterior.supermercado.direccion : "N/A"
        }</p>
        <br>
        <img src="${
          data.producto.imagen
        }" alt="Imagen del producto" style="max-width: 200px;" />
        <br>
        <button id="add-to-cart">Agregar al Carrito</button>
        <button id="update-price">Agregar Precio</button>
      `;
  }

  const updatePriceButton = document.getElementById("update-price");

  if (updatePriceButton) {
    updatePriceButton.addEventListener("click", () => {
      const supermercadoSeleccionado = JSON.parse(
        localStorage.getItem("supermercadoSeleccionado")
      );

      if (!supermercadoSeleccionado || !supermercadoSeleccionado.id) {
        alert(
          "Por favor, selecciona un supermercado antes de agregar un precio."
        );
        return;
      }

      actualizarPrecio(data.producto.codigo, supermercadoSeleccionado.id);
    });
  }
}
function mostrarSupermercadosCercanos(data) {
  const supermarketsContainer = document.getElementById("supermarkets");
  supermarketsContainer.innerHTML = `
          <h3>Selecciona un supermercado:</h3>
          <ul>
            ${data
              .map(
                (supermercado) => `
              <li>
                <button class="supermarket-btn" data-id="${supermercado._id}" data-nombre="${supermercado.nombre}">
                  ${supermercado.nombre} - ${supermercado.direccion}
                </button>
              </li>
            `
              )
              .join("")}
          </ul>
        `;

  document.querySelectorAll(".supermarket-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedSupermarket = {
        id: button.getAttribute("data-id"),
        nombre: button.getAttribute("data-nombre"),
      };
      localStorage.setItem(
        "supermercadoSeleccionado",
        JSON.stringify(selectedSupermarket)
      );
      document.getElementById(
        "current-supermarket"
      ).textContent = `Supermercado seleccionado: ${selectedSupermarket.nombre}`;
      supermarketsContainer.innerHTML = "";
    });
  });
}
function actualizarCarrito() {
  const carritoContainer = document.getElementById("carrito");
  carritoContainer.innerHTML = `
      <h3>Carrito:</h3>
      <ul>
        ${carrito
          .map(
            (item) => `
            <li>${item.nombre} - $${item.precio}</li>
          `
          )
          .join("")}
      </ul>
    `;
}
async function cargarInformacionProductoActualizada(codigo) {
  try {
    // Hacer la solicitud para obtener la información actualizada del producto
    const response = await fetch(`https://scansuper.up.railway.app/api/precios/${codigo}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener información del producto: ${response.status}`);
    }

    const data = await response.json();

    // Actualizar la interfaz con la información más reciente
    console.log("Datos actualizados del producto:", data);
    await mostrarInformacionProducto(data); // Reutilizamos tu función mostrarInformacionProducto

  } catch (error) {
    console.error("Error al cargar la información actualizada del producto:", error);
    alert("No se pudo actualizar la información del producto.");
  }
}
