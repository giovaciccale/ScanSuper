document.addEventListener("DOMContentLoaded", function () {
  let latitud = null;
  let longitud = null;
  const sound = new Audio("/sound/barcode.wav");
  let carrito = [];

  // Inicializar QuaggaJS
  function iniciarEscaner() {
    const videoElement = document.querySelector("#barcodevideo");

    // Configurar manualmente el flujo de video para verificar que funcione
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();
        console.log("El flujo de video está activo.");

        // Una vez comprobado, inicializamos QuaggaJS
        Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: videoElement, // Conectar al <video>
              constraints: {
                facingMode: "environment", // Usar cámara trasera
              },
            },
            decoder: {
              readers: ["ean_reader"], // Formatos soportados
            },
            locate: true, // Intentar localizar el código automáticamente
          },
          (err) => {
            if (err) {
              console.error("Error al inicializar QuaggaJS:", err);
              detenerEscaner();
              return;
            }
            console.log("QuaggaJS inicializado correctamente.");
            Quagga.start();
          }
        );

        // Detectar códigos
        Quagga.onDetected(async (data) => {
          const codigo = data.codeResult.code;
          console.log("Código detectado:", codigo);
          document.getElementById(
            "result"
          ).textContent = `Código detectado: ${codigo}`;
          sound.play();
          await procesarCodigo(codigo); // Procesar el código detectado
          detenerEscaner(); // Detener el escáner después de la detección
        });
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
        alert(
          "No se pudo acceder a la cámara. Verifica los permisos del navegador."
        );
      });
  }

  // Detener el escáner
  function detenerEscaner() {
    Quagga.stop();
    console.log("QuaggaJS detenido.");
  }

  // Manejar códigos manuales
  document.getElementById("submit-code").addEventListener("click", async () => {
    const codigoManual = document.getElementById("manual-code").value.trim();
    if (!codigoManual) {
      alert("Por favor, ingresa un código válido.");
      return;
    }
    await procesarCodigo(codigoManual);
  });

  // Procesar código (tanto escaneados como manuales)
  async function procesarCodigo(codigo) {
    document.getElementById("result").textContent = `Procesando: ${codigo}`;
    const supermercadoSeleccionado = JSON.parse(
      localStorage.getItem("supermercadoSeleccionado")
    );
    if (!supermercadoSeleccionado || !supermercadoSeleccionado.id) {
      alert("Selecciona un supermercado antes de escanear o ingresar un código.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/precios/${codigo}`);

      if (!response.ok) {
        if (response.status === 404) {
          document.getElementById(
            "product-info"
          ).innerHTML = `<p class="text-danger">Producto no encontrado.</p>`;
        } else {
          throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      mostrarInformacionProducto(data);
    } catch (error) {
      console.error("Error al procesar el código:", error);
      document.getElementById("product-info").innerHTML =
        "<p class='text-danger'>Error al buscar el producto.</p>";
    }
  }

  // Mostrar información del producto
  function mostrarInformacionProducto(data) {
    const infoContainer = document.getElementById("product-info");

    if (!data.precios || data.precios.length === 0) {
      // Caso: Producto sin precios
      infoContainer.innerHTML = `
        <h2>${data.producto.nombre}</h2>
        <p><strong>Marca:</strong> ${data.producto.marca}</p>
        <p><strong>Estado:</strong> Producto sin precio asignado</p>
        <img src="${data.producto.imagen}" alt="Imagen del producto" style="max-width: 200px;" />
        <button id="update-price">Agregar Precio</button>
      `;
    } else {
      // Caso: Producto con precios
      const preciosOrdenados = data.precios.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      const ultimoPrecio = preciosOrdenados[0];
      infoContainer.innerHTML = `
        <h2>${data.producto.nombre}</h2>
        <p><strong>Marca:</strong> ${data.producto.marca}</p>
        <p><strong>Último Precio:</strong> $${ultimoPrecio.precio}</p>
        <p><strong>Supermercado:</strong> ${ultimoPrecio.supermercado.nombre}</p>
        <img src="${data.producto.imagen}" alt="Imagen del producto" style="max-width: 200px;" />
        <button id="update-price">Agregar Precio</button>
      `;
    }

    document
      .getElementById("update-price")
      .addEventListener("click", () => agregarPrecio(data.producto.codigo));
  }

  // Agregar un nuevo precio
  async function agregarPrecio(codigo) {
    const nuevoPrecio = prompt("Introduce el nuevo precio:");
    if (!nuevoPrecio || isNaN(nuevoPrecio)) {
      alert("Por favor, introduce un precio válido.");
      return;
    }

    const supermercadoSeleccionado = JSON.parse(
      localStorage.getItem("supermercadoSeleccionado")
    );
    if (!supermercadoSeleccionado || !supermercadoSeleccionado.id) {
      alert("Selecciona un supermercado antes de agregar un precio.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/precios/registrar-precio`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo,
            precio: parseFloat(nuevoPrecio),
            supermercadoId: supermercadoSeleccionado.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al agregar el precio.");
      }

      alert("Precio agregado correctamente.");
    } catch (error) {
      console.error("Error al agregar el precio:", error);
      alert("No se pudo agregar el precio.");
    }
  }

  document.getElementById("get-location")
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
          `http://localhost:3000/api/precios/supermercados?lat=${latitud}&lng=${longitud}`
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

  // Inicializar el escáner
  iniciarEscaner();
});
  
});
