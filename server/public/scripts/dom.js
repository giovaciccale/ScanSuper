

document.addEventListener("DOMContentLoaded", function () {
  let latitud = null;
  let longitud = null;

  const sound = new Audio("/sound/barcode.wav");

  barcode.config.start = 0.1;
  barcode.config.end = 0.9;
  barcode.config.video = "#barcodevideo";
  barcode.config.canvas = "#barcodecanvas";
  barcode.config.canvasg = "#barcodecanvasg";

  barcode.init();
  console.log("Handler activado");

  // Manejar código escaneado
  barcode.setHandler(async function (codigo) {
    await procesarCodigo(codigo);
  });

  // Manejar código manual
  document.getElementById("submit-code").addEventListener("click", async () => {
    const codigoManual = document.getElementById("manual-code").value.trim();

    if (!codigoManual) {
      alert("Por favor, ingresa un código válido.");
      return;
    }

    await procesarCodigo(codigoManual);
  });


// Función para procesar códigos (tanto escaneados como manuales)
async function procesarCodigo(codigo) {
  console.log("Código detectado o ingresado:", codigo);
  document.getElementById("result").textContent = `Código detectado: ${codigo}`;
  sound.play();

  const supermercadoSeleccionado = JSON.parse(
    localStorage.getItem("supermercadoSeleccionado")
  );
  if (!supermercadoSeleccionado || !supermercadoSeleccionado.id) {
    alert(
      "Por favor, selecciona un supermercado antes de escanear o ingresar un código."
    );
    return;
  }

  try {
    const response = await fetch(`https://scansuper.up.railway.app/api/precios/${codigo}`);

    if (response.status === 404) {
      const data = await response.json();
      document.getElementById("result-manual").textContent =
        data.mensaje || "Producto no encontrado.";
      return;
    }

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const data = await response.json();
    await mostrarInformacionProducto(data);
  } catch (error) {
    console.error("Error al buscar el producto:", error);
    document.getElementById("result-manual").textContent =
      "Producto no encontrado o error en la solicitud.";
  }
}



  document
    .getElementById("get-location")
    .addEventListener("click", async () => {
      if (!navigator.geolocation) {
        alert("Geolocalización no soportada en este navegador.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          latitud = position.coords.latitude;
          longitud = position.coords.longitude;
          console.log(latitud);
          console.log(longitud);

          try {
            const response = await fetch(
              `http://https://scansuper.up.railway.app/api/precios/supermercados?lat=${latitud}&lng=${longitud}`
            );
            if (!response.ok) {
              throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const data = await response.json();

            if (data.length === 0) {
              alert("No se encontraron supermercados cercanos.");
            } else {
              mostrarSupermercadosCercanos(data);
            }
          } catch (error) {
            console.error("Error al obtener supermercados cercanos:", error);
            alert("No se pudo cargar la lista de supermercados.");
          }
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
          alert(
            "No se pudo obtener la ubicación. Por favor, revisa los permisos."
          );
        }
      );
    });

  let carrito = [];
  function agregarAlCarrito(producto, precio) {
    carrito.push({
      nombre: producto.nombre,
      precio: precio.precio,
    });
    actualizarCarrito();
  }
});
